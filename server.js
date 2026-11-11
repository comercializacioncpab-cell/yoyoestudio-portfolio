const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const busboy = require('busboy');
const db = require('./database.js');

const PORT = parseInt(process.env.PORT, 10) || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// MIME types dictionary
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

// Helper: send JSON
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'no-cache'
  });
  res.end(JSON.stringify(data));
}

// Helper: parse JSON body
function parseJSONBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit for JSON
        reject(new Error('Body too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper: Serve static file with Range support for video streaming
function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const totalSize = stats.size;
    const range = req.headers.range;

    if (range) {
      // Range header format: "bytes=0-1024"
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize || start > end) {
        res.writeHead(416, { 'Content-Range': `bytes */${totalSize}` });
        return res.end();
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType
      });

      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      });

      fs.createReadStream(filePath).pipe(res);
    }
  });
}

// Multipart Form Parser using Busboy
function handleMultipartUpload(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB limit
    const uploadedFiles = [];
    const fields = {};
    const fileWrites = [];

    bb.on('file', (name, file, info) => {
      const { filename, mimeType } = info;
      if (!filename) {
        file.resume();
        return;
      }

      const ext = path.extname(filename).toLowerCase();
      const safeBase = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${safeBase}${ext}`;
      const saveTo = path.join(UPLOADS_DIR, uniqueName);

      const writeStream = fs.createWriteStream(saveTo);
      const isVideo = mimeType.startsWith('video/') || ['.mp4', '.mov', '.webm', '.avi', '.m4v'].includes(ext);

      const promise = new Promise((resFile, rejFile) => {
        writeStream.on('finish', () => {
          uploadedFiles.push({
            path: `/uploads/${uniqueName}`,
            name: filename,
            type: isVideo ? 'video' : 'image',
            size: writeStream.bytesWritten
          });
          resFile();
        });
        writeStream.on('error', rejFile);
      });

      fileWrites.push(promise);
      file.pipe(writeStream);
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('close', async () => {
      try {
        await Promise.all(fileWrites);
        resolve({ fields, files: uploadedFiles });
      } catch (err) {
        reject(err);
      }
    });

    bb.on('error', reject);
    req.pipe(bb);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  try {
    // API: Authenticate PIN
    if (pathname === '/api/auth/verify' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const settings = db.getSettings();
      const validPin = process.env.ADMIN_PIN || settings.admin_pin || '1234';
      if (body.pin && body.pin.trim() === validPin) {
        return sendJSON(res, 200, { authorized: true });
      }
      return sendJSON(res, 401, { authorized: false, error: 'PIN incorrecto' });
    }

    // API: Upload Files (Drag and Drop or File Select)
    if (pathname === '/api/upload' && req.method === 'POST') {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return sendJSON(res, 400, { error: 'Content-Type debe ser multipart/form-data' });
      }
      const { fields, files } = await handleMultipartUpload(req);
      return sendJSON(res, 200, { success: true, files, fields });
    }

    // API: Projects List
    if (pathname === '/api/projects' && req.method === 'GET') {
      const category = searchParams.get('category') || 'Todos';
      const includeDrafts = searchParams.get('includeDrafts') === 'true';
      const search = searchParams.get('search') || '';
      const projects = db.getAllProjects({ category, includeDrafts, search });
      return sendJSON(res, 200, projects);
    }

    // API: Single Project
    if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
      const id = parseInt(pathname.replace('/api/projects/', ''), 10);
      if (isNaN(id)) return sendJSON(res, 400, { error: 'ID inválido' });
      const project = db.getProjectById(id);
      if (!project) return sendJSON(res, 404, { error: 'Proyecto no encontrado' });
      return sendJSON(res, 200, project);
    }

    // API: Create Project
    if (pathname === '/api/projects' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      if (!body.title) return sendJSON(res, 400, { error: 'El título es obligatorio' });
      const newProject = db.createProject(body, body.media || []);
      return sendJSON(res, 201, newProject);
    }

    // API: Update Project
    if (pathname.startsWith('/api/projects/') && req.method === 'PUT') {
      const id = parseInt(pathname.replace('/api/projects/', ''), 10);
      if (isNaN(id)) return sendJSON(res, 400, { error: 'ID inválido' });
      const body = await parseJSONBody(req);
      const updated = db.updateProject(id, body, body.newMedia || [], body.removeMediaIds || []);
      return sendJSON(res, 200, updated);
    }

    // API: Delete Project
    if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
      const id = parseInt(pathname.replace('/api/projects/', ''), 10);
      if (isNaN(id)) return sendJSON(res, 400, { error: 'ID inválido' });
      const result = db.deleteProject(id);
      return sendJSON(res, 200, result);
    }

    // API: Set Cover Media
    if (pathname.match(/^\/api\/projects\/(\d+)\/cover$/) && req.method === 'POST') {
      const match = pathname.match(/^\/api\/projects\/(\d+)\/cover$/);
      const projectId = parseInt(match[1], 10);
      const body = await parseJSONBody(req);
      const updated = db.setCoverMedia(projectId, body.mediaId);
      return sendJSON(res, 200, updated);
    }

    // API: Stats & Categories
    if (pathname === '/api/stats' && req.method === 'GET') {
      const stats = db.getCategoriesStats();
      const allProjects = db.getAllProjects({ includeDrafts: true });
      return sendJSON(res, 200, {
        totalProjects: allProjects.length,
        publishedProjects: allProjects.filter(p => p.status === 'published').length,
        draftProjects: allProjects.filter(p => p.status === 'draft').length,
        byCategory: stats
      });
    }

    // API: Settings
    if (pathname === '/api/settings' && req.method === 'GET') {
      const settings = db.getSettings();
      // Mask admin pin for security in public request unless authorized
      delete settings.admin_pin;
      return sendJSON(res, 200, settings);
    }

    if (pathname === '/api/settings' && req.method === 'POST') {
      const body = await parseJSONBody(req);
      const updated = db.updateSettings(body);
      delete updated.admin_pin;
      return sendJSON(res, 200, updated);
    }

    // Static: Uploads folder (/uploads/...)
    if (pathname.startsWith('/uploads/')) {
      const relative = pathname.replace('/uploads/', '');
      const filePath = path.join(UPLOADS_DIR, path.normalize(relative).replace(/^(\.\.[\/\\])+/, ''));
      return serveFile(req, res, filePath);
    }

    // Static: Public folder
    let reqPath = pathname === '/' ? '/index.html' : pathname;
    const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
    let targetFile = path.join(PUBLIC_DIR, safePath);

    if (fs.existsSync(targetFile) && fs.statSync(targetFile).isFile()) {
      return serveFile(req, res, targetFile);
    }

    // Fallback to index.html for SPA routing
    const indexHtml = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return serveFile(req, res, indexHtml);
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (err) {
    console.error('Server error on route:', pathname, err);
    sendJSON(res, 500, { error: 'Internal Server Error', details: err.message });
  }
});

function startListening(port) {
  server.listen(port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 YOYOESTUDIO Portfolio Server corriendo con éxito!`);
    console.log(`🌐 Acceso local: http://localhost:${port}`);
    console.log(`🔑 PIN de administración predeterminado: 1234`);
    console.log(`=======================================================`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Puerto ${port} ocupado, intentando con puerto ${port + 1}...`);
      startListening(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startListening(PORT);
