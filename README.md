# YOYOESTUDIO — Portafolio Creativo & Gestor de Trabajos

Plataforma web minimalista, profesional y de alto impacto para **YOYOESTUDIO**, diseñada para exhibir proyectos de:
- **Diseño gráfico**
- **Redes sociales**
- **Páginas web**
- **Videos publicitarios**
- **Videos de evento**
- **Fotografía**

---

## 🌟 Características Principales

### 1. Vista Pública para Clientes
- **Diseño Ultra Limpio & Contemporáneo**: Estética de agencia visual de alto nivel con paleta inspirada en la marca YOYO (turquesa, rojo coral, morado creativo, amarillo cálido y rosa vibrante).
- **Filtros por Categoría en Tiempo Real**: Navegación fluida entre las 6 especialidades con contadores dinámicos.
- **Buscador Instantáneo**: Filtra por cliente, palabra clave, técnica o año.
- **Lightbox / Case Study Modal interactivo**:
  - Visualizador de imágenes en alta resolución con carrusel si el proyecto tiene varios archivos.
  - Reproductor de video integrado para producciones audiovisuales (MP4 local o enlaces externos de YouTube / Vimeo / Reels).
  - Enlace directo a sitios web en vivo.
  - Botón de cotización directo a WhatsApp con mensaje automático personalizado según el proyecto.
- **Modo Claro / Oscuro**: Selector de tema con persistencia automática.

### 2. Panel de Administración / Gestor de Contenido (Backend)
- **Carga Drag & Drop (Arrastrar y Soltar)**: Arrastra imágenes o videos directamente desde tu computadora o usa el selector de archivos.
- **Soporte Multimedia Múltiple**: Sube múltiples imágenes o clips de video para un solo proyecto (ej: fotos de una campaña, renders o manuales de identidad).
- **Gestión Completa (CRUD)**:
  - Crear, editar o eliminar proyectos.
  - Asignar qué archivo es la portada con 1 clic.
  - Destacar proyectos en portada (prioridad visual).
  - Alternar entre estado **Publicado** y **Borrador**.
- **Acceso con PIN de Seguridad**:
  - Protegido para que solo tú puedas subir y editar trabajos.
  - **PIN predeterminado**: `1234` (puedes cambiarlo desde la pestaña de Ajustes).
- **Ajustes del Estudio**:
  - Configura tu número de WhatsApp para cotizaciones, correo de contacto y lema del estudio.

---

## 🚀 Cómo Iniciar la Aplicación

Desde la terminal en tu computadora:

```bash
cd /Users/xavieruraga/.gemini/antigravity/scratch/yoyo-estudio-portfolio
node server.js
```

Luego abre en tu navegador favorito:
👉 **[http://localhost:3001](http://localhost:3001)**

*(El servidor detecta automáticamente si el puerto 3001 está ocupado y pasa al siguiente disponible).*

---

## 📁 Estructura del Proyecto

```text
yoyo-estudio-portfolio/
├── server.js               # Servidor HTTP Node.js nativo con streaming de video y API REST
├── database.js             # Base de datos SQLite sincronizada (cero configuración externa)
├── package.json            # Configuración y scripts
├── uploads/                # Directorio donde se guardan tus imágenes y videos subidos
├── portfolio.db            # Archivo local de base de datos SQLite (se crea automáticamente)
└── public/
    ├── index.html          # Interfaz web responsiva (Vista Cliente + Panel Admin)
    ├── styles.css          # Sistema de diseño, temas claro/oscuro y animaciones
    ├── app.js              # Lógica cliente, drag & drop, lightbox y filtros
    └── logos/
        ├── yoyo-icon.png       # Ícono circular del yo-yo
        └── yoyo-logo-full.png  # Logotipo tipográfico multicolor oficial
```

---

## 🔑 Credenciales Iniciales
- **PIN de Administrador**: `1234`
- Para ingresar al gestor: Haz clic en el botón superior **"Subir Trabajos"** o en el enlace **"Portal Administrador"** en el pie de página.
