/**
 * YOYOESTUDIO — Portafolio & Gestor de Contenido
 * Client Application Logic
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    projects: [],
    filteredProjects: [],
    activeCategory: 'Todos',
    searchQuery: '',
    currentModalIndex: -1,
    activeMediaIndex: 0,
    isAdmin: sessionStorage.getItem('yoyo_admin_auth') === 'true',
    stagedMedia: [], // [{ path, name, type, isCover }]
    editingProjectId: null,
    settings: {
      studio_title: 'YOYOESTUDIO',
      studio_tagline: 'Diseño, Estrategia & Producción Visual',
      whatsapp_number: '+593999999999',
      contact_email: 'contacto@yoyoestudio.com'
    }
  };

  // --- DOM ELEMENTS ---
  const el = {
    // Nav & Theme
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    headerWhatsappBtn: document.getElementById('headerWhatsappBtn'),
    adminPortalBtn: document.getElementById('adminPortalBtn'),
    adminBtnLabel: document.getElementById('adminBtnLabel'),
    brandHomeLink: document.getElementById('brandHomeLink'),

    // Hero & Stats
    heroStudioTagline: document.getElementById('heroStudioTagline'),
    statProjectsCount: document.getElementById('statProjectsCount'),

    // Category Tabs & Counts
    categoryTabs: document.getElementById('categoryTabs'),
    filterStatus: document.getElementById('filterStatus'),
    filterStatusText: document.getElementById('filterStatusText'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),

    // Grid & States
    projectsGrid: document.getElementById('projectsGrid'),
    loadingState: document.getElementById('loadingState'),
    emptyState: document.getElementById('emptyState'),
    emptyUploadBtn: document.getElementById('emptyUploadBtn'),

    // Lightbox Modal
    projectModal: document.getElementById('projectModal'),
    closeProjectModalBtn: document.getElementById('closeProjectModalBtn'),
    modalMediaViewer: document.getElementById('modalMediaViewer'),
    mediaCarouselNav: document.getElementById('mediaCarouselNav'),
    modalCategoryPill: document.getElementById('modalCategoryPill'),
    modalClientPill: document.getElementById('modalClientPill'),
    modalYearPill: document.getElementById('modalYearPill'),
    modalTitle: document.getElementById('modalTitle'),
    modalDescription: document.getElementById('modalDescription'),
    modalExternalLink: document.getElementById('modalExternalLink'),
    modalWhatsappProjectBtn: document.getElementById('modalWhatsappProjectBtn'),
    modalPrevProjectBtn: document.getElementById('modalPrevProjectBtn'),
    modalNextProjectBtn: document.getElementById('modalNextProjectBtn'),

    // PIN Auth Modal
    pinModal: document.getElementById('pinModal'),
    pinForm: document.getElementById('pinForm'),
    pinInput: document.getElementById('pinInput'),
    pinErrorMsg: document.getElementById('pinErrorMsg'),
    closePinModalBtn: document.getElementById('closePinModalBtn'),

    // Admin Drawer
    adminDrawer: document.getElementById('adminDrawer'),
    closeAdminDrawerBtn: document.getElementById('closeAdminDrawerBtn'),
    adminProjectsCount: document.getElementById('adminProjectsCount'),
    adminTabs: document.querySelectorAll('.admin-tab-btn'),
    adminPanes: document.querySelectorAll('.admin-tab-pane'),

    // Upload & Edit Form
    projectUploadForm: document.getElementById('projectUploadForm'),
    formModeTitle: document.getElementById('formModeTitle'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
    editProjectId: document.getElementById('editProjectId'),
    mediaDropzone: document.getElementById('mediaDropzone'),
    mediaFileInput: document.getElementById('mediaFileInput'),
    mediaPreviewsGrid: document.getElementById('mediaPreviewsGrid'),
    projectTitleInput: document.getElementById('projectTitleInput'),
    projectCategorySelect: document.getElementById('projectCategorySelect'),
    projectClientInput: document.getElementById('projectClientInput'),
    projectYearInput: document.getElementById('projectYearInput'),
    projectDescInput: document.getElementById('projectDescInput'),
    projectWebUrlInput: document.getElementById('projectWebUrlInput'),
    captureWebScreenshotBtn: document.getElementById('captureWebScreenshotBtn'),
    captureBtnText: document.getElementById('captureBtnText'),
    webUrlSection: document.getElementById('webUrlSection'),
    webUrlBadge: document.getElementById('webUrlBadge'),
    webUrlHint: document.getElementById('webUrlHint'),
    webDetectionStatus: document.getElementById('webDetectionStatus'),
    detectionText: document.getElementById('detectionText'),
    detectionSubtext: document.getElementById('detectionSubtext'),
    testWebLinkBtn: document.getElementById('testWebLinkBtn'),
    webScreenshotPreviewBox: document.getElementById('webScreenshotPreviewBox'),
    screenshotPreviewHostname: document.getElementById('screenshotPreviewHostname'),
    reloadScreenshotBtn: document.getElementById('reloadScreenshotBtn'),
    switchScreenshotServiceBtn: document.getElementById('switchScreenshotServiceBtn'),
    currentServiceLabel: document.getElementById('currentServiceLabel'),
    liveScreenshotImg: document.getElementById('liveScreenshotImg'),
    screenshotLoadingOverlay: document.getElementById('screenshotLoadingOverlay'),
    webCustomCoverInput: document.getElementById('webCustomCoverInput'),
    videoUrlGroup: document.getElementById('videoUrlGroup'),
    projectVideoUrlInput: document.getElementById('projectVideoUrlInput'),
    projectFeaturedToggle: document.getElementById('projectFeaturedToggle'),
    projectStatusToggle: document.getElementById('projectStatusToggle'),
    saveProjectBtn: document.getElementById('saveProjectBtn'),
    saveBtnLabel: document.getElementById('saveBtnLabel'),

    // Manage Tab
    adminProjectsList: document.getElementById('adminProjectsList'),
    adminNewProjectQuickBtn: document.getElementById('adminNewProjectQuickBtn'),
    manageSuccessBanner: document.getElementById('manageSuccessBanner'),
    createAnotherProjectBtn: document.getElementById('createAnotherProjectBtn'),

    // Settings Tab
    settingsForm: document.getElementById('settingsForm'),
    settingStudioTitle: document.getElementById('settingStudioTitle'),
    settingStudioTagline: document.getElementById('settingStudioTagline'),
    settingWhatsapp: document.getElementById('settingWhatsapp'),
    settingEmail: document.getElementById('settingEmail'),
    settingAdminPin: document.getElementById('settingAdminPin'),

    // Footer
    currentYear: document.getElementById('currentYear'),
    footerEmailText: document.getElementById('footerEmailText'),
    footerWhatsappLink: document.getElementById('footerWhatsappLink'),
    footerAdminLink: document.getElementById('footerAdminLink'),

    // Toasts
    toastContainer: document.getElementById('toastContainer')
  };

  // --- INITIALIZATION ---
  function init() {
    setupTheme();
    setupEventListeners();
    fetchSettings();
    fetchProjects();

    if (el.currentYear) {
      el.currentYear.textContent = new Date().getFullYear();
    }
    updateAdminBtnState();
    updateCategoryFormState();
  }

  // --- THEME ---
  function setupTheme() {
    const savedTheme = localStorage.getItem('yoyo_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    el.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('yoyo_theme', next);
    });
  }

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- API CALLS ---
  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        state.settings = await res.json();
        applySettings();
      }
    } catch (e) {
      console.warn('Could not fetch settings', e);
    }
  }

  function applySettings() {
    if (state.settings.studio_tagline && el.heroStudioTagline) {
      el.heroStudioTagline.textContent = state.settings.studio_tagline;
    }
    if (state.settings.contact_email && el.footerEmailText) {
      el.footerEmailText.textContent = state.settings.contact_email;
    }
    if (state.settings.whatsapp_number) {
      const num = state.settings.whatsapp_number.replace(/[^0-9+]/g, '');
      const waUrl = `https://wa.me/${num}?text=Hola%20YOYOESTUDIO,%20deseo%20cotizar%20un%20proyecto`;
      if (el.headerWhatsappBtn) el.headerWhatsappBtn.href = waUrl;
      if (el.footerWhatsappLink) el.footerWhatsappLink.href = waUrl;
    }

    if (el.settingStudioTitle) el.settingStudioTitle.value = state.settings.studio_title || 'YOYOESTUDIO';
    if (el.settingStudioTagline) el.settingStudioTagline.value = state.settings.studio_tagline || '';
    if (el.settingWhatsapp) el.settingWhatsapp.value = state.settings.whatsapp_number || '';
    if (el.settingEmail) el.settingEmail.value = state.settings.contact_email || '';
  }

  async function fetchProjects() {
    el.loadingState.style.display = 'block';
    el.emptyState.style.display = 'none';

    try {
      const url = state.isAdmin ? '/api/projects?includeDrafts=true' : '/api/projects';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al cargar proyectos');
      state.projects = await res.json();
      applyFilters();
      updateCategoryCounts();
      renderAdminManageList();
    } catch (err) {
      showToast('Error cargando el catálogo', 'error');
      console.error(err);
    } finally {
      el.loadingState.style.display = 'none';
    }
  }

  // --- CATEGORY FILTERING & SEARCH ---
  function updateCategoryCounts() {
    const counts = {
      'Todos': 0,
      'Diseño gráfico': 0,
      'Redes sociales': 0,
      'Páginas web': 0,
      'Videos publicitarios': 0,
      'Videos de evento': 0,
      'Fotografía': 0
    };

    const countList = state.isAdmin ? state.projects : state.projects.filter(p => p.status === 'published');
    counts['Todos'] = countList.length;

    countList.forEach(p => {
      if (counts[p.category] !== undefined) {
        counts[p.category]++;
      }
    });

    if (document.getElementById('count-all')) document.getElementById('count-all').textContent = counts['Todos'];
    if (document.getElementById('count-diseno')) document.getElementById('count-diseno').textContent = counts['Diseño gráfico'];
    if (document.getElementById('count-redes')) document.getElementById('count-redes').textContent = counts['Redes sociales'];
    if (document.getElementById('count-web')) document.getElementById('count-web').textContent = counts['Páginas web'];
    if (document.getElementById('count-vidpub')) document.getElementById('count-vidpub').textContent = counts['Videos publicitarios'];
    if (document.getElementById('count-videv')) document.getElementById('count-videv').textContent = counts['Videos de evento'];
    if (document.getElementById('count-foto')) document.getElementById('count-foto').textContent = counts['Fotografía'];

    if (el.statProjectsCount) el.statProjectsCount.textContent = counts['Todos'];
    if (el.adminProjectsCount) el.adminProjectsCount.textContent = state.projects.length;
  }

  function applyFilters() {
    const q = state.searchQuery.toLowerCase().trim();
    const cat = state.activeCategory;

    state.filteredProjects = state.projects.filter(p => {
      // If not admin, only show published
      if (!state.isAdmin && p.status !== 'published') return false;

      // Category match
      if (cat !== 'Todos' && p.category !== cat) return false;

      // Search match
      if (q) {
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const clientMatch = (p.client || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        if (!titleMatch && !clientMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });

    renderProjectsGrid();

    // Show/hide filter status bar
    if (cat !== 'Todos' || q) {
      el.filterStatus.style.display = 'flex';
      let text = `Filtrando por: <strong>${cat}</strong>`;
      if (q) text += ` · Búsqueda: "<em>${q}</em>"`;
      text += ` (${state.filteredProjects.length} resultado${state.filteredProjects.length === 1 ? '' : 's'})`;
      el.filterStatusText.innerHTML = text;
    } else {
      el.filterStatus.style.display = 'none';
    }
  }

  // --- RENDER GRID ---
  function renderProjectsGrid() {
    el.projectsGrid.innerHTML = '';

    if (state.filteredProjects.length === 0) {
      el.emptyState.style.display = 'block';
      return;
    }

    el.emptyState.style.display = 'none';

    state.filteredProjects.forEach((proj, index) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Ver proyecto ${proj.title}`);

      // Determine cover media
      let coverMedia = proj.media && proj.media.length > 0 ? (proj.media.find(m => m.is_cover) || proj.media[0]) : null;
      let coverSrc = coverMedia ? coverMedia.file_path : '/logos/yoyo-icon.png';
      let isVideo = coverMedia && coverMedia.file_type === 'video';

      // Category color map
      const colorMap = {
        'Diseño gráfico': '#2ec4b6',
        'Redes sociales': '#e63946',
        'Páginas web': '#9d4edd',
        'Videos publicitarios': '#ffb703',
        'Videos de evento': '#f72585',
        'Fotografía': '#4cc9f0'
      };
      const catColor = colorMap[proj.category] || 'var(--accent-primary)';

      const isWeb = proj.category === 'Páginas web';
      let badgeHtml = '';

      if (isWeb) {
        badgeHtml = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          <span>Sitio Web</span>
        `;
      } else if (isVideo || proj.video_url) {
        badgeHtml = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          <span>Video</span>
        `;
      } else if (proj.media && proj.media.length > 1) {
        badgeHtml = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>${proj.media.length} archivos</span>
        `;
      } else {
        badgeHtml = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Galería</span>
        `;
      }

      card.innerHTML = `
        <div class="card-media-wrapper">
          ${(isVideo && !isWeb)
            ? `<video src="${coverSrc}" class="card-image" muted loop playsinline onmouseover="this.play()" onmouseout="this.pause()"></video>`
            : `<img src="${coverSrc}" alt="${escapeHtml(proj.title)}" class="card-image" loading="lazy" ${isWeb && proj.external_url ? `onerror="if(!this.dataset.retry){this.dataset.retry=1;this.src='https://image.thum.io/get/width/1200/crop/800/' + encodeURIComponent('${escapeHtml(proj.external_url)}');}"` : ''}>`
          }
          <div class="card-badge-top">
            <span class="category-tag" style="border-left: 3px solid ${catColor};">${escapeHtml(proj.category)}</span>
            ${proj.featured ? `<span class="featured-star-tag">★ Destacado</span>` : ''}
          </div>
          <div class="card-type-icon">
            ${badgeHtml}
          </div>
        </div>

        <div class="card-content">
          <div class="card-client-meta">
            <span class="card-client">${escapeHtml(proj.client || 'YOYOESTUDIO')}</span>
            <span class="card-year">${escapeHtml(proj.year || '')}</span>
          </div>
          <h3 class="card-title">${escapeHtml(proj.title)}</h3>
          <p class="card-excerpt">${escapeHtml(proj.description || 'Explora este proyecto creativo realizado por YOYOESTUDIO.')}</p>
          <div class="card-footer">
            <span class="view-case-link">
              <span>Explorar proyecto</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </span>
            ${(proj.category === 'Páginas web' && proj.external_url) ? `
              <a href="${escapeHtml(proj.external_url)}" target="_blank" rel="noopener" class="btn-live-web" onclick="event.stopPropagation()">
                <span>Ver proyecto en vivo ↗</span>
              </a>
            ` : ''}
            ${state.isAdmin && proj.status === 'draft' ? `<span class="badge-mini" style="background:#e63946;color:#fff;">Borrador</span>` : ''}
          </div>
        </div>
      `;

      card.addEventListener('click', () => openProjectModal(index));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProjectModal(index);
        }
      });

      el.projectsGrid.appendChild(card);
    });
  }

  // --- LIGHTBOX MODAL ---
  function openProjectModal(index) {
    if (index < 0 || index >= state.filteredProjects.length) return;
    state.currentModalIndex = index;
    state.activeMediaIndex = 0;

    const proj = state.filteredProjects[index];

    el.modalTitle.textContent = proj.title;
    el.modalCategoryPill.textContent = proj.category;
    el.modalClientPill.textContent = proj.client || 'YOYOESTUDIO';
    el.modalYearPill.textContent = proj.year || '';
    el.modalDescription.textContent = proj.description || 'Proyecto desarrollado con excelencia y creatividad por el equipo de YOYOESTUDIO.';

    // External Web link — EXCLUSIVELY for 'Páginas web'
    if (proj.category === 'Páginas web' && proj.external_url && proj.external_url.trim()) {
      el.modalExternalLink.href = proj.external_url;
      el.modalExternalLink.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        <span>Ver Proyecto en Vivo ↗</span>
      `;
      el.modalExternalLink.style.display = 'inline-flex';
    } else {
      el.modalExternalLink.style.display = 'none';
    }

    // Direct WhatsApp quote with project title
    const waNumber = (state.settings.whatsapp_number || '+593999999999').replace(/[^0-9+]/g, '');
    const waText = encodeURIComponent(`Hola YOYOESTUDIO, me encantó su trabajo "${proj.title}" para ${proj.client || 'un cliente'} y me gustaría cotizar un proyecto similar.`);
    el.modalWhatsappProjectBtn.href = `https://wa.me/${waNumber}?text=${waText}`;

    // Render media viewer and carousel thumbnails
    renderModalMedia(proj);

    // Update navigation arrows state
    el.modalPrevProjectBtn.style.visibility = index > 0 ? 'visible' : 'hidden';
    el.modalNextProjectBtn.style.visibility = index < state.filteredProjects.length - 1 ? 'visible' : 'hidden';

    el.projectModal.showModal();
    document.body.style.overflow = 'hidden';
  }

  function renderModalMedia(proj) {
    el.modalMediaViewer.innerHTML = '';
    el.mediaCarouselNav.innerHTML = '';

    const mediaList = (proj.media && proj.media.length > 0) ? proj.media : [];

    // If no uploaded media but video_url provided (only for non-web projects)
    if (mediaList.length === 0 && proj.video_url && proj.category !== 'Páginas web') {
      renderVideoInViewer(proj.video_url);
      el.mediaCarouselNav.style.display = 'none';
      return;
    }

    if (mediaList.length === 0) {
      el.modalMediaViewer.innerHTML = `<img src="/logos/yoyo-logo-full.png" alt="YOYOESTUDIO" style="max-height: 200px; opacity: 0.8;">`;
      el.mediaCarouselNav.style.display = 'none';
      return;
    }

    const currentMedia = mediaList[state.activeMediaIndex] || mediaList[0];

    if (currentMedia.file_type === 'video') {
      el.modalMediaViewer.innerHTML = `
        <video src="${currentMedia.file_path}" controls autoplay playsinline style="width: 100%; max-height: 70vh; border-radius: 8px;">
          Tu navegador no soporta reproducción de video HTML5.
        </video>
      `;
    } else {
      el.modalMediaViewer.innerHTML = `
        <img src="${currentMedia.file_path}" alt="${escapeHtml(proj.title)}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px;">
      `;
    }

    // Render carousel if multiple media
    if (mediaList.length > 1) {
      el.mediaCarouselNav.style.display = 'flex';
      mediaList.forEach((m, idx) => {
        const thumb = document.createElement('img');
        thumb.className = `carousel-thumb ${idx === state.activeMediaIndex ? 'active' : ''}`;
        thumb.src = m.file_path;
        thumb.alt = `Miniatura ${idx + 1}`;
        thumb.addEventListener('click', () => {
          state.activeMediaIndex = idx;
          renderModalMedia(proj);
        });
        el.mediaCarouselNav.appendChild(thumb);
      });
    } else {
      el.mediaCarouselNav.style.display = 'none';
    }
  }

  function renderVideoInViewer(url) {
    // If YouTube or Vimeo embed
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = extractYouTubeId(url);
      el.modalMediaViewer.innerHTML = `
        <iframe width="100%" height="450" src="https://www.youtube.com/embed/${videoId}?autoplay=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border-radius: 8px;"></iframe>
      `;
    } else if (url.includes('vimeo.com')) {
      const vimeoId = url.split('/').filter(Boolean).pop();
      el.modalMediaViewer.innerHTML = `
        <iframe width="100%" height="450" src="https://player.vimeo.com/video/${vimeoId}?autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border-radius: 8px;"></iframe>
      `;
    } else {
      el.modalMediaViewer.innerHTML = `
        <video src="${url}" controls autoplay playsinline style="width: 100%; max-height: 70vh; border-radius: 8px;"></video>
      `;
    }
  }

  function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  }

  function closeProjectModal() {
    el.projectModal.close();
    el.modalMediaViewer.innerHTML = '';
    document.body.style.overflow = '';
  }

  // --- PIN AUTHENTICATION ---
  function openPinModal() {
    el.pinInput.value = '';
    el.pinErrorMsg.style.display = 'none';
    el.pinModal.showModal();
    setTimeout(() => el.pinInput.focus(), 100);
  }

  function closePinModal() {
    el.pinModal.close();
  }

  async function handlePinSubmit(e) {
    e.preventDefault();
    const pin = el.pinInput.value.trim();
    if (!pin) return;

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });
      const data = await res.json();

      if (data.authorized) {
        state.isAdmin = true;
        sessionStorage.setItem('yoyo_admin_auth', 'true');
        closePinModal();
        updateAdminBtnState();
        openAdminDrawer();
        showToast('¡Bienvenido al Gestor de YOYOESTUDIO!', 'success');
        fetchProjects(); // Reload including drafts
      } else {
        el.pinErrorMsg.style.display = 'block';
        el.pinInput.select();
      }
    } catch (err) {
      showToast('Error de conexión', 'error');
    }
  }

  function updateAdminBtnState() {
    if (state.isAdmin) {
      el.adminBtnLabel.textContent = 'Gestor Admin';
    } else {
      el.adminBtnLabel.textContent = 'Subir Trabajos';
    }
  }

  // --- ADMIN DRAWER & TABS ---
  function openAdminDrawer() {
    el.adminDrawer.classList.add('open');
    el.adminDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeAdminDrawer() {
    el.adminDrawer.classList.remove('open');
    el.adminDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetProjectForm();
  }

  function switchAdminTab(tabId) {
    el.adminTabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabId));
    el.adminPanes.forEach(p => p.classList.toggle('active', p.id === tabId));
  }

  // --- DRAG & DROP & FILE UPLOADS ---
  function setupDragAndDrop() {
    const dropzone = el.mediaDropzone;
    const fileInput = el.mediaFileInput;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        uploadFiles(files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (fileInput.files && fileInput.files.length > 0) {
        uploadFiles(fileInput.files);
        fileInput.value = ''; // Reset input
      }
    });
  }

  async function uploadFiles(fileList) {
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('files', fileList[i]);
    }

    showToast(`Subiendo ${fileList.length} archivo(s)...`, 'success');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success && data.files) {
        data.files.forEach(f => {
          state.stagedMedia.push({
            path: f.path,
            name: f.name,
            type: f.type,
            isCover: state.stagedMedia.length === 0
          });
        });
        renderStagedMediaPreviews();
        showToast('¡Archivos cargados con éxito!', 'success');
      } else {
        throw new Error(data.error || 'Error subiendo archivos');
      }
    } catch (err) {
      showToast('Error al subir archivos', 'error');
      console.error(err);
    }
  }

  function renderStagedMediaPreviews() {
    el.mediaPreviewsGrid.innerHTML = '';

    state.stagedMedia.forEach((m, idx) => {
      const item = document.createElement('div');
      item.className = 'media-preview-item';

      const isVid = m.type === 'video';
      item.innerHTML = `
        ${isVid
          ? `<video src="${m.path}" muted></video>`
          : `<img src="${m.path}" alt="${escapeHtml(m.name)}">`
        }
        <span class="media-preview-badge">${isVid ? 'VIDEO' : 'FOTO'}</span>
        <button type="button" class="media-preview-cover-btn ${m.isCover ? 'is-cover' : ''}" data-idx="${idx}">
          ${m.isCover ? '★ Portada' : 'Hacer Portada'}
        </button>
        <button type="button" class="media-preview-remove" data-idx="${idx}" title="Eliminar archivo">&times;</button>
      `;

      // Set cover
      item.querySelector('.media-preview-cover-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        state.stagedMedia.forEach((media, i) => media.isCover = (i === idx));
        renderStagedMediaPreviews();
      });

      // Remove
      item.querySelector('.media-preview-remove').addEventListener('click', (e) => {
        e.stopPropagation();
        state.stagedMedia.splice(idx, 1);
        if (m.isCover && state.stagedMedia.length > 0) {
          state.stagedMedia[0].isCover = true;
        }
        renderStagedMediaPreviews();
      });

      el.mediaPreviewsGrid.appendChild(item);
    });
  }

  // --- SCREENSHOT ENGINES & WEB UTILS ---
  const SCREENSHOT_ENGINES = [
    {
      id: 'microlink',
      name: 'Microlink HD',
      getUrl: (url) => `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`
    },
    {
      id: 'thum',
      name: 'Thum.io',
      getUrl: (url) => `https://image.thum.io/get/width/1200/crop/800/${url}`
    },
    {
      id: 'pagepeeker',
      name: 'WebSnapshot',
      getUrl: (url) => `https://free.pagepeeker.com/v2/thumbs.php?size=x&url=${encodeURIComponent(url.replace(/^https?:\/\//i, ''))}`
    }
  ];
  let currentEngineIdx = 0;

  function normalizeUrl(url) {
    if (!url) return '';
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'https://' + clean;
    }
    return clean;
  }

  function triggerWebScreenshot(manualEngineIdx = null) {
    let rawUrl = (el.projectWebUrlInput.value || '').trim();
    if (!rawUrl) {
      showToast('Por favor escribe la dirección del sitio web (ej: apple.com)', 'error');
      el.projectWebUrlInput.focus();
      return;
    }

    const cleanUrl = normalizeUrl(rawUrl);
    el.projectWebUrlInput.value = cleanUrl;
    const hostname = cleanUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');

    if (manualEngineIdx !== null) {
      currentEngineIdx = manualEngineIdx % SCREENSHOT_ENGINES.length;
    }

    const engine = SCREENSHOT_ENGINES[currentEngineIdx];
    const screenshotUrl = engine.getUrl(cleanUrl);

    // Update Status Bar
    if (el.webDetectionStatus) {
      el.webDetectionStatus.style.display = 'flex';
      el.webDetectionStatus.className = 'web-detection-status success';
      el.detectionText.textContent = `🟢 Sitio web activo: ${hostname}`;
      el.detectionSubtext.textContent = `Generando portada con motor ${engine.name}`;
      if (el.testWebLinkBtn) {
        el.testWebLinkBtn.href = cleanUrl;
        el.testWebLinkBtn.style.display = 'inline-flex';
      }
    }

    // Update Dedicated Live Preview Box
    if (el.webScreenshotPreviewBox) {
      el.webScreenshotPreviewBox.style.display = 'block';
      el.screenshotPreviewHostname.textContent = hostname;
      el.currentServiceLabel.textContent = engine.name;
      el.screenshotLoadingOverlay.style.display = 'flex';

      el.liveScreenshotImg.src = screenshotUrl;
      el.liveScreenshotImg.onload = () => {
        el.screenshotLoadingOverlay.style.display = 'none';
      };
      el.liveScreenshotImg.onerror = () => {
        // Automatically switch to next engine
        const nextIdx = (currentEngineIdx + 1) % SCREENSHOT_ENGINES.length;
        if (nextIdx !== 0) {
          currentEngineIdx = nextIdx;
          const nextEngine = SCREENSHOT_ENGINES[currentEngineIdx];
          el.currentServiceLabel.textContent = nextEngine.name;
          el.liveScreenshotImg.src = nextEngine.getUrl(cleanUrl);
        } else {
          el.screenshotLoadingOverlay.style.display = 'none';
        }
      };
    }

    // Set as the project cover immediately in stagedMedia
    const prevIdx = state.stagedMedia.findIndex(m => m.isWebCapture);
    const mediaItem = {
      path: screenshotUrl,
      name: `Captura Web: ${hostname}`,
      type: 'image',
      isCover: true,
      isWebCapture: true
    };

    if (prevIdx !== -1) {
      state.stagedMedia[prevIdx] = mediaItem;
    } else {
      state.stagedMedia.forEach(m => m.isCover = false);
      state.stagedMedia.unshift(mediaItem);
    }
    renderStagedMediaPreviews();

    if (el.captureBtnText) el.captureBtnText.textContent = 'Actualizar';
    showToast(`Capturando ${hostname} con ${engine.name}...`, 'success');

    // Async metadata fetch (title, description, and official high-res banner if available)
    fetch(`https://api.microlink.io?url=${encodeURIComponent(cleanUrl)}`)
      .then(r => r.json())
      .then(json => {
        if (json.status === 'success' && json.data) {
          if (json.data.title && !el.projectTitleInput.value.trim()) {
            el.projectTitleInput.value = json.data.title;
          }
          if (json.data.description && !el.projectDescInput.value.trim()) {
            el.projectDescInput.value = json.data.description;
          }
          // If the site provides an official og:image banner, apply it seamlessly
          if (json.data.image && json.data.image.url && !json.data.image.url.includes('s0.wp.com')) {
            mediaItem.path = json.data.image.url;
            if (el.liveScreenshotImg) el.liveScreenshotImg.src = json.data.image.url;
            renderStagedMediaPreviews();
          }
        }
      })
      .catch(() => {});
  }

  async function uploadCustomWebCover(file) {
    const formData = new FormData();
    formData.append('files', file);
    showToast('Subiendo captura desde tu PC...', 'success');

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.files && data.files.length > 0) {
        const uploaded = data.files[0];

        if (el.liveScreenshotImg) {
          el.liveScreenshotImg.src = uploaded.path;
        }
        if (el.webScreenshotPreviewBox) {
          el.webScreenshotPreviewBox.style.display = 'block';
        }
        if (el.screenshotLoadingOverlay) {
          el.screenshotLoadingOverlay.style.display = 'none';
        }

        const prevIdx = state.stagedMedia.findIndex(m => m.isWebCapture);
        const mediaItem = {
          path: uploaded.path,
          name: uploaded.name,
          type: 'image',
          isCover: true,
          isWebCapture: true
        };

        if (prevIdx !== -1) {
          state.stagedMedia[prevIdx] = mediaItem;
        } else {
          state.stagedMedia.forEach(m => m.isCover = false);
          state.stagedMedia.unshift(mediaItem);
        }

        renderStagedMediaPreviews();
        showToast('¡Captura personalizada asignada!', 'success');
      }
    } catch (err) {
      showToast('Error al subir captura', 'error');
    }
  }

  function updateCategoryFormState() {
    const isWeb = el.projectCategorySelect.value === 'Páginas web';
    if (el.webUrlSection) el.webUrlSection.classList.toggle('highlight-web', isWeb);
    if (el.webUrlBadge) el.webUrlBadge.style.display = isWeb ? 'inline-block' : 'none';
    if (el.webUrlHint) el.webUrlHint.style.display = isWeb ? 'block' : 'none';
    if (el.videoUrlGroup) el.videoUrlGroup.style.display = isWeb ? 'none' : 'block';

    if (isWeb && el.projectWebUrlInput.value.trim()) {
      if (el.webDetectionStatus) el.webDetectionStatus.style.display = 'flex';
      if (el.webScreenshotPreviewBox) el.webScreenshotPreviewBox.style.display = 'block';
    } else {
      if (!isWeb) {
        if (el.webDetectionStatus) el.webDetectionStatus.style.display = 'none';
        if (el.webScreenshotPreviewBox) el.webScreenshotPreviewBox.style.display = 'none';
      }
    }
  }

  // --- SAVE / EDIT PROJECT ---
  async function handleProjectFormSubmit(e) {
    e.preventDefault();

    const title = el.projectTitleInput.value.trim();
    if (!title) {
      showToast('Ingresa un título para el proyecto', 'error');
      return;
    }

    const category = el.projectCategorySelect.value;
    let webUrl = el.projectWebUrlInput.value.trim();

    // If it's a website project and URL was provided, normalize it
    if (category === 'Páginas web' && webUrl) {
      webUrl = normalizeUrl(webUrl);
      el.projectWebUrlInput.value = webUrl;

      // Auto-assign screenshot as cover if no media uploaded yet
      if (state.stagedMedia.length === 0) {
        state.stagedMedia.push({
          path: SCREENSHOT_ENGINES[currentEngineIdx].getUrl(webUrl),
          name: `Portada Web: ${webUrl.replace(/^https?:\/\//, '')}`,
          type: 'image',
          isCover: true,
          isWebCapture: true
        });
      }
    }

    if (state.stagedMedia.length === 0 && !el.projectVideoUrlInput.value.trim() && !(category === 'Páginas web' && webUrl)) {
      showToast('Sube al menos una imagen, video o la URL de la página web', 'error');
      return;
    }

    const payload = {
      title,
      category,
      client: el.projectClientInput.value.trim(),
      year: el.projectYearInput.value.trim(),
      description: el.projectDescInput.value.trim(),
      external_url: webUrl,
      video_url: category === 'Páginas web' ? '' : el.projectVideoUrlInput.value.trim(),
      featured: el.projectFeaturedToggle.checked,
      status: el.projectStatusToggle.checked ? 'published' : 'draft',
      media: state.stagedMedia
    };

    el.saveProjectBtn.disabled = true;
    el.saveBtnLabel.textContent = 'Guardando...';

    try {
      let res;
      if (state.editingProjectId) {
        res = await fetch(`/api/projects/${state.editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...payload,
            newMedia: state.stagedMedia.filter(m => !m.id)
          })
        });
      } else {
        res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) throw new Error('Error al guardar proyecto');

      showToast(state.editingProjectId ? 'Proyecto actualizado con éxito' : '¡Proyecto publicado exitosamente!', 'success');
      resetProjectForm();
      switchAdminTab('manageTab');
      if (el.manageSuccessBanner) el.manageSuccessBanner.style.display = 'flex';
      fetchProjects();
    } catch (err) {
      showToast('Error al guardar el proyecto', 'error');
      console.error(err);
    } finally {
      el.saveProjectBtn.disabled = false;
      el.saveBtnLabel.textContent = 'Guardar y Publicar Trabajo';
    }
  }

  function startEditProject(project) {
    state.editingProjectId = project.id;
    el.formModeTitle.textContent = `Editando: ${project.title}`;
    el.cancelEditBtn.style.display = 'inline-block';
    el.saveBtnLabel.textContent = 'Guardar Cambios';

    el.projectTitleInput.value = project.title || '';
    el.projectCategorySelect.value = project.category || 'Diseño gráfico';
    el.projectClientInput.value = project.client || '';
    el.projectYearInput.value = project.year || '';
    el.projectDescInput.value = project.description || '';
    el.projectWebUrlInput.value = project.external_url || '';
    el.projectVideoUrlInput.value = project.video_url || '';
    el.projectFeaturedToggle.checked = Boolean(project.featured);
    el.projectStatusToggle.checked = project.status === 'published';

    state.stagedMedia = (project.media || []).map(m => ({
      id: m.id,
      path: m.file_path,
      name: m.file_name,
      type: m.file_type,
      isCover: Boolean(m.is_cover)
    }));

    renderStagedMediaPreviews();
    updateCategoryFormState();
    switchAdminTab('uploadTab');
  }

  function resetProjectForm() {
    state.editingProjectId = null;
    if (el.editProjectId) el.editProjectId.value = '';
    el.formModeTitle.textContent = 'Nuevo Proyecto en Portafolio';
    el.cancelEditBtn.style.display = 'none';
    el.saveBtnLabel.textContent = 'Guardar y Publicar Trabajo';

    el.projectUploadForm.reset();
    el.projectTitleInput.value = '';
    el.projectClientInput.value = '';
    el.projectYearInput.value = new Date().getFullYear().toString();
    el.projectDescInput.value = '';
    el.projectWebUrlInput.value = '';
    el.projectVideoUrlInput.value = '';
    el.projectFeaturedToggle.checked = false;
    el.projectStatusToggle.checked = true;

    state.stagedMedia = [];
    renderStagedMediaPreviews();
    
    if (el.webDetectionStatus) el.webDetectionStatus.style.display = 'none';
    if (el.webScreenshotPreviewBox) el.webScreenshotPreviewBox.style.display = 'none';
    if (el.liveScreenshotImg) el.liveScreenshotImg.src = '';

    el.saveProjectBtn.disabled = false;
    if (el.captureWebScreenshotBtn) {
      el.captureWebScreenshotBtn.disabled = false;
      if (el.captureBtnText) el.captureBtnText.textContent = 'Detectar Web';
    }

    updateCategoryFormState();
  }

  // --- MANAGE PROJECTS LIST ---
  function renderAdminManageList() {
    el.adminProjectsList.innerHTML = '';

    if (state.projects.length === 0) {
      el.adminProjectsList.innerHTML = `<p style="color:var(--text-secondary); text-align:center; padding: 2rem;">No tienes proyectos guardados aún.</p>`;
      return;
    }

    state.projects.forEach(proj => {
      const item = document.createElement('div');
      item.className = 'admin-item-card';

      const coverMedia = proj.media && proj.media.length > 0 ? (proj.media.find(m => m.is_cover) || proj.media[0]) : null;
      const coverSrc = coverMedia ? coverMedia.file_path : '/logos/yoyo-icon.png';

      item.innerHTML = `
        <img src="${coverSrc}" alt="${escapeHtml(proj.title)}" class="admin-item-thumb">
        <div class="admin-item-info">
          <div class="admin-item-title">${escapeHtml(proj.title)}</div>
          <div class="admin-item-meta">
            <span>${escapeHtml(proj.category)}</span>
            <span>·</span>
            <span>${escapeHtml(proj.client || 'Cliente')}</span>
            <span>·</span>
            <span style="color: ${proj.status === 'published' ? 'var(--brand-teal)' : '#e63946'}">
              ${proj.status === 'published' ? '● Publicado' : '○ Borrador'}
            </span>
          </div>
        </div>
        <div class="admin-item-actions">
          <button class="btn btn-outline btn-sm edit-proj-btn" title="Editar">Editar</button>
          <button class="btn btn-outline btn-sm del-proj-btn" style="color:var(--brand-red);" title="Eliminar">&times;</button>
        </div>
      `;

      item.querySelector('.edit-proj-btn').addEventListener('click', () => startEditProject(proj));
      item.querySelector('.del-proj-btn').addEventListener('click', () => deleteProject(proj.id, proj.title));

      el.adminProjectsList.appendChild(item);
    });
  }

  async function deleteProject(id, title) {
    if (!confirm(`¿Estás seguro de que deseas eliminar "${title}" permanentemente de tu portafolio?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      showToast('Proyecto eliminado', 'success');
      fetchProjects();
    } catch (err) {
      showToast('Error al eliminar el proyecto', 'error');
    }
  }

  // --- SETTINGS FORM ---
  async function handleSettingsSubmit(e) {
    e.preventDefault();

    const payload = {
      studio_title: el.settingStudioTitle.value.trim(),
      studio_tagline: el.settingStudioTagline.value.trim(),
      whatsapp_number: el.settingWhatsapp.value.trim(),
      contact_email: el.settingEmail.value.trim()
    };

    if (el.settingAdminPin.value.trim()) {
      payload.admin_pin = el.settingAdminPin.value.trim();
    }

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar ajustes');
      state.settings = await res.json();
      applySettings();
      el.settingAdminPin.value = '';
      showToast('Ajustes del estudio guardados', 'success');
    } catch (err) {
      showToast('Error al guardar ajustes', 'error');
    }
  }

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Brand home click resets filter
    el.brandHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      setCategory('Todos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Search input
    let searchTimeout;
    el.searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const val = e.target.value;
      el.clearSearchBtn.style.display = val ? 'block' : 'none';
      searchTimeout = setTimeout(() => {
        state.searchQuery = val;
        applyFilters();
      }, 250);
    });

    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      el.clearSearchBtn.style.display = 'none';
      applyFilters();
      el.searchInput.focus();
    });

    // Reset filter button
    el.resetFiltersBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      state.searchQuery = '';
      el.clearSearchBtn.style.display = 'none';
      setCategory('Todos');
    });

    // Category Tabs click
    el.categoryTabs.addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;
      const cat = tab.dataset.category;
      setCategory(cat);
    });

    // Footer category links
    document.querySelectorAll('[data-footer-cat]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const cat = link.dataset.footerCat;
        setCategory(cat);
        const yOffset = el.categoryTabs.getBoundingClientRect().top + window.pageYOffset - 90;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
      });
    });

    // Lightbox modal close & navigation
    el.closeProjectModalBtn.addEventListener('click', closeProjectModal);
    el.projectModal.addEventListener('click', (e) => {
      if (e.target === el.projectModal) closeProjectModal();
    });

    el.modalPrevProjectBtn.addEventListener('click', () => {
      if (state.currentModalIndex > 0) openProjectModal(state.currentModalIndex - 1);
    });

    el.modalNextProjectBtn.addEventListener('click', () => {
      if (state.currentModalIndex < state.filteredProjects.length - 1) {
        openProjectModal(state.currentModalIndex + 1);
      }
    });

    // Keyboard navigation for modal
    window.addEventListener('keydown', (e) => {
      if (el.projectModal.open) {
        if (e.key === 'ArrowLeft' && state.currentModalIndex > 0) {
          openProjectModal(state.currentModalIndex - 1);
        } else if (e.key === 'ArrowRight' && state.currentModalIndex < state.filteredProjects.length - 1) {
          openProjectModal(state.currentModalIndex + 1);
        } else if (e.key === 'Escape') {
          closeProjectModal();
        }
      }
    });

    // Admin Portal button click
    el.adminPortalBtn.addEventListener('click', () => {
      if (state.isAdmin) {
        openAdminDrawer();
      } else {
        openPinModal();
      }
    });

    el.footerAdminLink.addEventListener('click', () => {
      if (state.isAdmin) {
        openAdminDrawer();
      } else {
        openPinModal();
      }
    });

    el.emptyUploadBtn.addEventListener('click', () => {
      if (state.isAdmin) {
        openAdminDrawer();
      } else {
        openPinModal();
      }
    });

    // PIN Form
    el.pinForm.addEventListener('submit', handlePinSubmit);
    el.closePinModalBtn.addEventListener('click', closePinModal);

    // Admin Drawer Close
    el.closeAdminDrawerBtn.addEventListener('click', closeAdminDrawer);

    // Admin Tabs
    el.adminTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.tab === 'uploadTab') {
          // If not in middle of explicit edit, ensure fresh clean form
          if (!state.editingProjectId) {
            resetProjectForm();
          }
        }
        if (el.manageSuccessBanner) el.manageSuccessBanner.style.display = 'none';
        switchAdminTab(btn.dataset.tab);
      });
    });

    // Quick new project button in manage tab
    el.adminNewProjectQuickBtn.addEventListener('click', () => {
      resetProjectForm();
      if (el.manageSuccessBanner) el.manageSuccessBanner.style.display = 'none';
      switchAdminTab('uploadTab');
    });

    if (el.createAnotherProjectBtn) {
      el.createAnotherProjectBtn.addEventListener('click', () => {
        resetProjectForm();
        if (el.manageSuccessBanner) el.manageSuccessBanner.style.display = 'none';
        switchAdminTab('uploadTab');
      });
    }

    el.cancelEditBtn.addEventListener('click', resetProjectForm);

    // Drag & Drop
    setupDragAndDrop();

    // Custom Web Cover file upload input
    if (el.webCustomCoverInput) {
      el.webCustomCoverInput.addEventListener('change', () => {
        if (el.webCustomCoverInput.files && el.webCustomCoverInput.files.length > 0) {
          uploadCustomWebCover(el.webCustomCoverInput.files[0]);
        }
      });
    }

    // Category change in project form
    el.projectCategorySelect.addEventListener('change', updateCategoryFormState);

    // Auto-capture screenshot button
    if (el.captureWebScreenshotBtn) {
      el.captureWebScreenshotBtn.addEventListener('click', triggerWebScreenshot);
    }

    // Auto-detection on Paste
    el.projectWebUrlInput.addEventListener('paste', () => {
      setTimeout(() => {
        if (el.projectWebUrlInput.value.trim()) {
          triggerWebScreenshot();
        }
      }, 150);
    });

    // Auto-detection on Enter key
    el.projectWebUrlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerWebScreenshot();
      }
    });

    // Auto-detection on blur
    el.projectWebUrlInput.addEventListener('blur', () => {
      if (el.projectCategorySelect.value === 'Páginas web' && el.projectWebUrlInput.value.trim()) {
        const hasWebCapture = state.stagedMedia.some(m => m.isWebCapture);
        if (!hasWebCapture) {
          triggerWebScreenshot();
        }
      }
    });

    // Debounced detection while typing
    let urlTypingTimeout;
    el.projectWebUrlInput.addEventListener('input', () => {
      clearTimeout(urlTypingTimeout);
      const val = el.projectWebUrlInput.value.trim();
      if (val.includes('.') && val.length > 6) {
        urlTypingTimeout = setTimeout(() => {
          const hasWebCapture = state.stagedMedia.some(m => m.isWebCapture);
          if (!hasWebCapture) {
            triggerWebScreenshot();
          }
        }, 1000);
      }
    });

    // Reload Screenshot Button
    if (el.reloadScreenshotBtn) {
      el.reloadScreenshotBtn.addEventListener('click', () => {
        triggerWebScreenshot();
      });
    }

    // Switch Screenshot Engine Button
    if (el.switchScreenshotServiceBtn) {
      el.switchScreenshotServiceBtn.addEventListener('click', () => {
        triggerWebScreenshot(currentEngineIdx + 1);
      });
    }

    // Upload & Edit Form submit
    el.projectUploadForm.addEventListener('submit', handleProjectFormSubmit);

    // Settings Form submit
    el.settingsForm.addEventListener('submit', handleSettingsSubmit);
  }

  function setCategory(cat) {
    state.activeCategory = cat;
    document.querySelectorAll('.filter-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.category === cat);
    });
    applyFilters();
  }

  // --- UTILS ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Kickoff
  document.addEventListener('DOMContentLoaded', init);
})();
