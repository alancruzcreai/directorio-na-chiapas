/* ============================================================
   NA CHIAPAS CENTRO — App
   ============================================================ */
(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // -- Data ----------------------------------------------------
  const grupos = JSON.parse($('#grupos-data').textContent);

  // -- Theme ---------------------------------------------------
  const themeToggle = $('#theme-toggle');
  const stored = localStorage.getItem('na-theme');
  const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initial);
  themeToggle.setAttribute('aria-pressed', initial === 'dark' ? 'true' : 'false');
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    localStorage.setItem('na-theme', next);
  });

  // -- Hora local Chiapas (UTC-6, sin DST) ---------------------
  const clockEl = $('#local-time');
  const heroDate = $('#hero-date');
  const dayMap = ['D','L','M','X','J','V','S'];

  function nowChiapas() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc - 6 * 3600000);
  }

  function pad(n){ return String(n).padStart(2, '0'); }

  function updateClock() {
    const t = nowChiapas();
    clockEl.textContent = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
  }

  function setHeroDate() {
    const t = nowChiapas();
    const meses = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
    heroDate.textContent = `${pad(t.getDate())} ${meses[t.getMonth()]} ${t.getFullYear()}`;
  }

  updateClock();
  setHeroDate();
  setInterval(updateClock, 30000);

  // -- Mensajes del día (rotación diaria determinística) -------
  const mensajes = [
    { texto: "Cuando llegamos sentíamos que estábamos solos. Hoy sabemos que nunca lo estuvimos.", fuente: "— Solo por hoy" },
    { texto: "Solo por hoy, mis pensamientos estarán en mi recuperación: en vivir y disfrutar la vida sin usar.", fuente: "— Lema de NA" },
    { texto: "Lo opuesto a la adicción no es la sobriedad. Lo opuesto a la adicción es la conexión.", fuente: "— Texto Básico" },
    { texto: "No tenemos que recorrer este camino solos. Y por eso este programa funciona.", fuente: "— Solo por hoy" },
    { texto: "Permítete sentir. Permítete sanar. Permítete empezar.", fuente: "— Folleto de bienvenida" },
    { texto: "La recuperación es un viaje, no un destino. Y este día es parte del viaje.", fuente: "— Texto Básico" },
    { texto: "Una sola junta puede cambiarlo todo. Empieza por una.", fuente: "— Servidores del área" }
  ];
  const dailyMsg = $('#daily-message');
  const dailySrc = $('#daily-source');
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const pick = mensajes[dayOfYear % mensajes.length];
  dailyMsg.textContent = pick.texto;
  dailySrc.textContent = pick.fuente;

  // -- Reunión activa ahora ------------------------------------
  function isActiveNow(diasAttr, horaAttr) {
    const dias = diasAttr.split(',').map(s => s.trim());
    const t = nowChiapas();
    const today = dayMap[t.getDay()];
    if (!dias.includes(today)) return false;
    const [h, m] = horaAttr.split(':').map(Number);
    const start = h * 60 + m;
    const end = start + 90; // duración promedio
    const nowMin = t.getHours() * 60 + t.getMinutes();
    return nowMin >= start - 15 && nowMin <= end; // ventana de 15 min antes
  }

  function refreshActiveStates() {
    let active = 0;
    $$('.grupo-card').forEach(card => {
      const status = card.querySelector('.card-status');
      const dias = status.dataset.dias;
      const hora = status.dataset.hora;
      if (isActiveNow(dias, hora)) {
        card.classList.add('is-active');
        active++;
      } else {
        card.classList.remove('is-active');
      }
    });
    $('#active-now').textContent = active;
  }

  refreshActiveStates();
  setInterval(refreshActiveStates, 60000);

  // -- Filtros y búsqueda --------------------------------------
  const searchInput = $('#search-input');
  const dayChips = $$('[data-filter="dia"] .chip');
  const cityChips = $$('[data-filter="ciudad"] .chip');
  const clearBtn = $('#clear-filters');
  const resultsCount = $('#results-count');
  const emptyState = $('#empty-state');
  const resetFromEmpty = $('#reset-from-empty');
  const cards = $$('.grupo-card');

  const state = {
    search: '',
    dias: new Set(),
    ciudades: new Set()
  };

  function toggleChip(chip, set) {
    const v = chip.dataset.value;
    if (set.has(v)) {
      set.delete(v);
      chip.classList.remove('is-active');
    } else {
      set.add(v);
      chip.classList.add('is-active');
    }
  }

  function matches(card) {
    if (state.search) {
      const haystack = card.dataset.buscar || '';
      if (!haystack.toLowerCase().includes(state.search)) return false;
    }
    if (state.dias.size > 0) {
      const dias = (card.dataset.dias || '').split(',');
      const hit = [...state.dias].some(d => dias.includes(d));
      if (!hit) return false;
    }
    if (state.ciudades.size > 0) {
      if (!state.ciudades.has(card.dataset.ciudad)) return false;
    }
    return true;
  }

  function applyFilters() {
    let visible = 0;
    cards.forEach(card => {
      if (matches(card)) {
        card.classList.remove('is-hidden');
        visible++;
      } else {
        card.classList.add('is-hidden');
      }
    });
    resultsCount.textContent = visible;
    emptyState.hidden = visible !== 0;
    const hasFilter = state.search || state.dias.size || state.ciudades.size;
    clearBtn.hidden = !hasFilter;
  }

  let searchTimer = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.search = e.target.value.trim().toLowerCase();
      applyFilters();
    }, 120);
  });

  dayChips.forEach(chip => {
    chip.addEventListener('click', () => {
      toggleChip(chip, state.dias);
      applyFilters();
    });
  });
  cityChips.forEach(chip => {
    chip.addEventListener('click', () => {
      toggleChip(chip, state.ciudades);
      applyFilters();
    });
  });

  function clearAll() {
    state.search = '';
    state.dias.clear();
    state.ciudades.clear();
    searchInput.value = '';
    [...dayChips, ...cityChips].forEach(c => c.classList.remove('is-active'));
    applyFilters();
  }
  clearBtn.addEventListener('click', clearAll);
  resetFromEmpty.addEventListener('click', () => {
    clearAll();
    searchInput.focus();
  });

  // -- Atajo ⌘K -------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if (e.key === 'Escape') {
      if (modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // -- Menú móvil ----------------------------------------------
  const menuToggle = $('#menu-toggle');
  const navPrimary = $('.nav-primary');
  menuToggle.addEventListener('click', () => {
    const open = navPrimary.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', open);
  });
  $$('.nav-primary a').forEach(a => {
    a.addEventListener('click', () => {
      navPrimary.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // -- Modal de detalle ----------------------------------------
  const modal = $('#modal');
  const modalContent = $('#modal-content');
  let lastFocused = null;

  function buildGalleryHTML(grupo) {
    if (grupo.imagenes === 0) {
      return `<div class="modal-hero-empty">
        <svg class="empty-svg" viewBox="0 0 80 80" fill="none" stroke="currentColor" stroke-width="0.5" aria-hidden="true">
          <circle cx="40" cy="40" r="38"/>
          <circle cx="40" cy="40" r="28"/>
          <circle cx="40" cy="40" r="18"/>
          <circle cx="40" cy="40" r="8"/>
          <line x1="40" y1="2" x2="40" y2="78" stroke-dasharray="2 4"/>
          <line x1="2" y1="40" x2="78" y2="40" stroke-dasharray="2 4"/>
        </svg>
      </div>`;
    }
    const imgs = [];
    for (let i = 1; i <= grupo.imagenes; i++) {
      imgs.push(`<img src="${grupo.dir}${i}.jpeg" alt="Espacio del grupo ${grupo.nombre} — imagen ${i}" loading="lazy">`);
    }
    return `<div class="modal-gallery">${imgs.join('')}</div>`;
  }

  function buildScheduleHTML(horarios) {
    return horarios.map(h => `
      <div class="modal-schedule-row">
        <span class="day">${h.dias}</span>
        <span class="time">${h.hora}</span>
      </div>
    `).join('');
  }

  function openModal(id) {
    const g = grupos[id];
    if (!g) return;
    lastFocused = document.activeElement;

    modalContent.innerHTML = `
      <div class="modal-hero">
        ${buildGalleryHTML(g)}
      </div>
      <div class="modal-meta-bar">
        <span><span class="meta-key">GRP</span> <span class="meta-val">${g.nombre.toUpperCase()}</span></span>
        <span><span class="meta-key">FUND</span> <span class="meta-val">${g.fundado}</span></span>
        <span><span class="meta-key">COORD</span> <span class="meta-val">${g.coords}</span></span>
      </div>
      <div class="modal-body">
        <div class="modal-main">
          <h2 class="modal-title" id="modal-title">${g.nombre}</h2>
          <p class="modal-ciudad">${g.ciudad.toUpperCase()}</p>
          <p class="modal-nota">${g.nota}</p>

          <div class="modal-actions">
            <a href="tel:+52${g.telefono.replace(/\s/g, '')}" class="btn btn-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>${g.telefono}</span>
            </a>
            <a href="https://wa.me/${g.whatsapp}" target="_blank" rel="noopener" class="btn btn-ghost">
              <span>WhatsApp</span>
            </a>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.direccion + ', ' + g.ciudad + ', Chiapas')}" target="_blank" rel="noopener" class="btn btn-ghost">
              <span>Cómo llegar</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="M7 17L17 7M9 7h8v8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

        <aside class="modal-info">
          <div class="modal-info-block">
            <span class="modal-info-key">Dirección</span>
            <span class="modal-info-val">${g.direccion}</span>
          </div>

          <div class="modal-info-block">
            <span class="modal-info-key">Horarios</span>
            <div class="modal-schedule">${buildScheduleHTML(g.horariosCompletos)}</div>
          </div>

          <div class="modal-info-block">
            <span class="modal-info-key">Formato de junta</span>
            <span class="modal-info-val">${g.formato}</span>
          </div>

          <div class="modal-info-block">
            <span class="modal-info-key">Servidor de contacto</span>
            <span class="modal-info-val">${g.servidor}</span>
          </div>

          <div class="modal-info-block">
            <span class="modal-info-key">Teléfono</span>
            <span class="modal-info-val mono">${g.telefono}</span>
          </div>
        </aside>
      </div>
    `;

    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      const closeBtn = modal.querySelector('.modal-close');
      if (closeBtn) closeBtn.focus();
    });
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  // delegación: cualquier elemento con data-open o card completo
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-open]');
    if (opener) {
      e.preventDefault();
      openModal(opener.dataset.open);
      return;
    }
    if (e.target.closest('[data-close-modal]')) {
      closeModal();
    }
  });

  // Click en la card (fuera del botón) también abre
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // si ya hicieron click directamente en el botón, dejarlo
      if (e.target.closest('[data-open]')) return;
      const id = card.dataset.grupo;
      openModal(id);
    });
  });

  // -- Atrapar focus dentro del modal --------------------------
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  });

  // -- Smooth scroll para anchors con offset por header --------
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.getAttribute('href');
      if (target === '#' || target === '#top') return;
      const el = document.querySelector(target);
      if (!el) return;
      e.preventDefault();
      const headerHeight = $('#site-header').offsetHeight;
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // -- IntersectionObserver: header shadow al hacer scroll -----
  const header = $('#site-header');
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px';
  document.body.prepend(sentinel);
  const io = new IntersectionObserver(([entry]) => {
    header.classList.toggle('is-scrolled', !entry.isIntersecting);
  });
  io.observe(sentinel);
})();
