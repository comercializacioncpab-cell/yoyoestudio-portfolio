const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const dbPath = path.join(__dirname, 'portfolio.db');
const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    client TEXT,
    year TEXT,
    description TEXT,
    external_url TEXT,
    video_url TEXT,
    featured INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    order_num INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS project_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    is_cover INTEGER DEFAULT 0,
    order_num INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Insert default settings if not exists
const checkSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
if (!checkSetting.get('admin_pin')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_pin', '1234');
}
if (!checkSetting.get('studio_title')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('studio_title', 'YOYOESTUDIO');
}
if (!checkSetting.get('studio_tagline')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('studio_tagline', 'Diseño, Estrategia & Producción Visual');
}
if (!checkSetting.get('whatsapp_number')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('whatsapp_number', '+593999999999');
}
if (!checkSetting.get('contact_email')) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('contact_email', 'contacto@yoyoestudio.com');
}

// Seed initial demo projects if empty
const countStmt = db.prepare('SELECT COUNT(*) as count FROM projects');
const countResult = countStmt.get();

if (countResult.count === 0) {
  const insertProject = db.prepare(`
    INSERT INTO projects (title, category, client, year, description, external_url, video_url, featured, status, order_num)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)
  `);

  const insertMedia = db.prepare(`
    INSERT INTO project_media (project_id, file_path, file_name, file_type, is_cover, order_num)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seeds = [
    {
      title: 'Identidad Visual & Packaging Lumina',
      category: 'Diseño gráfico',
      client: 'Lumina Botanics',
      year: '2026',
      description: 'Desarrollo integral de sistema de marca, paleta cromática contemporánea, tipografía institucional y línea de empaques sostenibles para productos botánicos premium.',
      external_url: 'https://behance.net',
      video_url: '',
      featured: 1,
      media: [
        { path: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', name: 'lumina-branding.jpg', type: 'image', is_cover: 1 },
        { path: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80', name: 'lumina-packaging.jpg', type: 'image', is_cover: 0 }
      ]
    },
    {
      title: 'Estrategia Visual & Campaña Social Reels',
      category: 'Redes sociales',
      client: 'Café & Co. Artisans',
      year: '2026',
      description: 'Creación de grilla visual editorial, 24 piezas de carruseles de alto impacto y serie de micro-videos para TikTok e Instagram logrando un 180% de incremento en engagement.',
      external_url: 'https://instagram.com',
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      featured: 1,
      media: [
        { path: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80', name: 'cafe-social.jpg', type: 'image', is_cover: 1 }
      ]
    },
    {
      title: 'Plataforma Web Minimalista & E-Commerce',
      category: 'Páginas web',
      client: 'Vanguard Interior Studio',
      year: '2026',
      description: 'Diseño UX/UI y desarrollo de sitio web editorial responsive con animaciones sutiles, catálogo de piezas de mobiliario y pasarela de reservas digitales.',
      external_url: 'https://apple.com',
      video_url: '',
      featured: 1,
      media: [
        { path: 'https://api.microlink.io?url=https%3A%2F%2Fapple.com&screenshot=true&embed=screenshot.url', name: 'vanguard-web-capture.jpg', type: 'image', is_cover: 1 }
      ]
    },
    {
      title: 'Spot Publicitario Comercial: "El Ritmo Urbano"',
      category: 'Videos publicitarios',
      client: 'Kicks Co. Streetwear',
      year: '2026',
      description: 'Producción audiovisual cinematográfica de 45 segundos filmada en 4K con edición rítmica, corrección de color avanzada y diseño sonoro envolvente.',
      external_url: '',
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      featured: 1,
      media: [
        { path: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80', name: 'video-spot.jpg', type: 'image', is_cover: 1 }
      ]
    },
    {
      title: 'Aftermovie & Cobertura Festival Aurora',
      category: 'Videos de evento',
      client: 'Aurora Music Experience',
      year: '2025',
      description: 'Cobertura multicámara y dron durante 3 días de festival musical. Entrega de reel recap en 24 horas y aftermovie documental de 3 minutos.',
      external_url: '',
      video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      featured: 0,
      media: [
        { path: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', name: 'festival-aurora.jpg', type: 'image', is_cover: 1 }
      ]
    },
    {
      title: 'Sesión Editorial de Moda & Retrato Urbano',
      category: 'Fotografía',
      client: 'Revista Modus',
      year: '2025',
      description: 'Sesión fotográfica en locación exterior con iluminación natural y flashes de alta velocidad. Retoque digital de alta gama para portada y desplegado central.',
      external_url: '',
      video_url: '',
      featured: 1,
      media: [
        { path: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80', name: 'editorial-fashion.jpg', type: 'image', is_cover: 1 },
        { path: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80', name: 'fashion-shoot-2.jpg', type: 'image', is_cover: 0 }
      ]
    }
  ];

  seeds.forEach((item, index) => {
    const res = insertProject.run(
      item.title,
      item.category,
      item.client,
      item.year,
      item.description,
      item.external_url,
      item.video_url,
      item.featured,
      index
    );
    const projId = Number(res.lastInsertRowid);
    item.media.forEach((m, mIdx) => {
      insertMedia.run(projId, m.path, m.name, m.type, m.is_cover, mIdx);
    });
  });
}

// Queries
function getAllProjects({ category = 'Todos', includeDrafts = false, search = '' } = {}) {
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params = [];

  if (!includeDrafts) {
    sql += " AND status = 'published'";
  }

  if (category && category !== 'Todos') {
    sql += ' AND category = ?';
    params.push(category);
  }

  if (search && search.trim() !== '') {
    sql += ' AND (title LIKE ? OR client LIKE ? OR description LIKE ?)';
    const term = `%${search.trim()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY featured DESC, order_num ASC, created_at DESC';

  const rows = db.prepare(sql).all(...params);

  // Attach media to each project
  const mediaStmt = db.prepare('SELECT * FROM project_media WHERE project_id = ? ORDER BY is_cover DESC, order_num ASC');
  return rows.map(p => ({
    ...p,
    featured: Boolean(p.featured),
    media: mediaStmt.all(p.id).map(m => ({
      ...m,
      is_cover: Boolean(m.is_cover)
    }))
  }));
}

function getProjectById(id) {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!project) return null;

  const media = db.prepare('SELECT * FROM project_media WHERE project_id = ? ORDER BY is_cover DESC, order_num ASC').all(id);
  return {
    ...project,
    featured: Boolean(project.featured),
    media: media.map(m => ({
      ...m,
      is_cover: Boolean(m.is_cover)
    }))
  };
}

function createProject(data, mediaFiles = []) {
  const isWebCategory = (data.category || '').trim() === 'Páginas web';
  const cleanVideoUrl = isWebCategory ? '' : (data.video_url || '');

  const insertProject = db.prepare(`
    INSERT INTO projects (title, category, client, year, description, external_url, video_url, featured, status, order_num)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const res = insertProject.run(
    data.title || 'Sin Título',
    data.category || 'Diseño gráfico',
    data.client || '',
    data.year || new Date().getFullYear().toString(),
    data.description || '',
    data.external_url || '',
    cleanVideoUrl,
    data.featured ? 1 : 0,
    data.status || 'published',
    0
  );

  const projectId = Number(res.lastInsertRowid);

  if (mediaFiles && mediaFiles.length > 0) {
    const insertMedia = db.prepare(`
      INSERT INTO project_media (project_id, file_path, file_name, file_type, is_cover, order_num)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    mediaFiles.forEach((file, idx) => {
      insertMedia.run(
        projectId,
        file.path,
        file.name,
        file.type,
        idx === 0 ? 1 : 0,
        idx
      );
    });
  }

  return getProjectById(projectId);
}

function updateProject(id, data, newMediaFiles = [], removeMediaIds = []) {
  const isWebCategory = (data.category || '').trim() === 'Páginas web';
  const cleanVideoUrl = isWebCategory ? '' : (data.video_url || '');

  const updateStmt = db.prepare(`
    UPDATE projects
    SET title = ?, category = ?, client = ?, year = ?, description = ?, external_url = ?, video_url = ?, featured = ?, status = ?
    WHERE id = ?
  `);

  updateStmt.run(
    data.title,
    data.category,
    data.client || '',
    data.year || '',
    data.description || '',
    data.external_url || '',
    cleanVideoUrl,
    data.featured ? 1 : 0,
    data.status || 'published',
    id
  );

  // Remove unwanted media
  if (removeMediaIds && removeMediaIds.length > 0) {
    const delMedia = db.prepare('DELETE FROM project_media WHERE id = ? AND project_id = ?');
    for (const mId of removeMediaIds) {
      delMedia.run(mId, id);
    }
  }

  // Insert newly uploaded media
  if (newMediaFiles && newMediaFiles.length > 0) {
    const insertMedia = db.prepare(`
      INSERT INTO project_media (project_id, file_path, file_name, file_type, is_cover, order_num)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Check if there is already a cover
    const currentCover = db.prepare('SELECT id FROM project_media WHERE project_id = ? AND is_cover = 1').get(id);

    newMediaFiles.forEach((file, idx) => {
      const isCover = !currentCover && idx === 0 ? 1 : 0;
      insertMedia.run(
        id,
        file.path,
        file.name,
        file.type,
        isCover,
        idx + 10
      );
    });
  }

  // Ensure at least one cover exists if media present
  const firstMedia = db.prepare('SELECT id FROM project_media WHERE project_id = ? ORDER BY order_num ASC LIMIT 1').get(id);
  const hasCover = db.prepare('SELECT id FROM project_media WHERE project_id = ? AND is_cover = 1').get(id);
  if (firstMedia && !hasCover) {
    db.prepare('UPDATE project_media SET is_cover = 1 WHERE id = ?').run(firstMedia.id);
  }

  return getProjectById(id);
}

function deleteProject(id) {
  // Retrieve media files to delete from disk if local
  const media = db.prepare('SELECT file_path FROM project_media WHERE project_id = ?').all(id);
  for (const m of media) {
    if (m.file_path.startsWith('/uploads/')) {
      const absPath = path.join(__dirname, m.file_path);
      if (fs.existsSync(absPath)) {
        try { fs.unlinkSync(absPath); } catch (e) { console.error('Error unlinking file:', e); }
      }
    }
  }

  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  return { success: true };
}

function setCoverMedia(projectId, mediaId) {
  db.prepare('UPDATE project_media SET is_cover = 0 WHERE project_id = ?').run(projectId);
  db.prepare('UPDATE project_media SET is_cover = 1 WHERE id = ? AND project_id = ?').run(mediaId, projectId);
  return getProjectById(projectId);
}

function getSettings() {
  const rows = db.prepare('SELECT key, value FROM settings').all();
  const obj = {};
  for (const r of rows) obj[r.key] = r.value;
  return obj;
}

function updateSettings(settingsObj) {
  const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
  for (const [key, val] of Object.entries(settingsObj)) {
    stmt.run(key, String(val));
  }
  return getSettings();
}

function getCategoriesStats() {
  const stats = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM projects 
    WHERE status = 'published' 
    GROUP BY category
  `).all();
  return stats;
}

module.exports = {
  db,
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  setCoverMedia,
  getSettings,
  updateSettings,
  getCategoriesStats
};
