// change these two to match your repo
const REPO_OWNER = 'd4e1e8';
const REPO_NAME  = 'd4e1e8.github.io';
const IMAGES_DIR = 'images';

const CACHE_KEY = 'canv-artworks-v1';
const CACHE_TTL = 60 * 60 * 1000;   // 1hr
const MAX_FILES = 1000;

// state
const state = {
    artworks: [],
    index: 0,
    zoom: 1,        // always integer 1-8 when at rest; fractional only mid-pinch
    tx: 0,
    ty: 0,
    dragging: false,
    dragStart: null,
    pinch: null,
};
let wheelAccum = 0;

// dom
const galleryEl = document.getElementById('gallery');
const statusEl  = document.getElementById('status');
const dateSpan  = document.getElementById('date');
const countSpan = document.getElementById('count');
const modal     = document.getElementById('art-modal');
const modalImg  = document.getElementById('modal-img');
const modalTitle = document.getElementById('modalTitle');
const modalDims  = document.getElementById('modalDims');
const closeBtn  = document.getElementById('closeModalBtn');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const minusBtn  = document.getElementById('minusBtn');
const plusBtn   = document.getElementById('plusBtn');
const resetBtn  = document.getElementById('zoomVal');   // the [1×] button doubles as display + reset
const counterEl = document.getElementById('counter');

// date stamp
if (dateSpan) {
    const t = new Date();
    dateSpan.textContent = `${t.getMonth()+1}.${t.getDate()}.${t.getFullYear().toString().slice(2)}`;
}

// ---------------------------------------------------------------
// fetch file list from github. one request = whole directory.
// cached so we don't burn the 60/hr unauthenticated rate limit.
// ---------------------------------------------------------------

function readCache(ignoreAge = false) {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const { time, items } = JSON.parse(raw);
        if (!Array.isArray(items)) return null;
        if (!ignoreAge && Date.now() - time > CACHE_TTL) return null;
        return { time, items };
    } catch (e) { return null; }
}

function writeCache(items) {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), items }));
    } catch (e) {}
}

async function fetchArtworks() {
    const fresh = readCache();
    if (fresh) return fresh.items;

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${IMAGES_DIR}`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`github api ${res.status}`);

    const list = await res.json();
    if (!Array.isArray(list)) throw new Error('unexpected api shape');

    const items = list
    .filter(f => f.type === 'file' && /\.(png|jpe?g|gif|webp|avif)$/i.test(f.name))
    .slice(0, MAX_FILES)
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    .map(f => ({
        filename: f.name,
        title: f.name.replace(/\.[^.]+$/, ''),
               src: f.download_url,
    }));

    writeCache(items);
    return items;
}

// ---------------------------------------------------------------
// gallery render
// ---------------------------------------------------------------

function renderGallery() {
    if (!state.artworks.length) {
        statusEl.textContent = 'no drawings found in /images.';
        statusEl.classList.add('error');
        return;
    }

    statusEl.remove();
    const frag = document.createDocumentFragment();

    state.artworks.forEach((art, idx) => {
        const card = document.createElement('article');
        card.className = 'art-card';

        const img = document.createElement('img');
        img.src = art.src;
        img.alt = art.title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('click', () => openModal(idx));

        const title = document.createElement('h2');
        title.className = 'art-title';
        title.textContent = art.title;
        title.title = art.title;

        card.appendChild(img);
        card.appendChild(title);
        frag.appendChild(card);
    });

    galleryEl.appendChild(frag);
    if (countSpan) countSpan.textContent = `${state.artworks.length} drawings`;
}

// ---------------------------------------------------------------
// modal
// ---------------------------------------------------------------

function openModal(idx) {
    if (idx < 0 || idx >= state.artworks.length) return;

    state.index = idx;
    state.zoom = 1;
    state.tx = 0;
    state.ty = 0;
    state.pinch = null;
    state.dragging = false;
    wheelAccum = 0;

    const art = state.artworks[idx];
    modalImg.src = art.src;
    modalImg.alt = art.title;
    modalTitle.textContent = art.title;
    modalDims.textContent = '...';
    applyTransform();
    updateZoomLabel();
    updateCounter();

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    if (location.hash !== `#${idx}`) {
        history.replaceState(null, '', `#${idx}`);
    }

    preloadNeighbors(idx);
}

function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    state.pinch = null;
    state.dragging = false;
    if (location.hash) {
        history.replaceState(null, '', location.pathname + location.search);
    }
}

function navigate(dir) {
    if (!modal.classList.contains('open')) return;
    const n = state.artworks.length;
    openModal((state.index + dir + n) % n);
}

function preloadNeighbors(idx) {
    const n = state.artworks.length;
    if (n < 2) return;
    [-1, 1].forEach(off => {
        const im = new Image();
        im.src = state.artworks[(idx + off + n) % n].src;
    });
}

function updateCounter() {
    counterEl.textContent = `[${state.index + 1}/${state.artworks.length}]`;
}

// ---------------------------------------------------------------
// zoom + pan
//
// pixel art rule: at rest, zoom is always an integer multiple of
// native so every source pixel maps to an exact square block of
// screen pixels. wheel & buttons snap. pinch floats during the
// gesture, snaps on release.
// ---------------------------------------------------------------

function applyTransform() {
    modalImg.style.transform =
    `translate(${state.tx}px, ${state.ty}px) scale(${state.zoom})`;
}

function updateZoomLabel() {
    resetBtn.textContent = `[${Math.round(state.zoom)}×]`;
}

// pan bounds: allow real movement at every zoom level.
// if image overflows the viewport on an axis, let user pan to see
// the edges (plus ~100px overshoot). if it fits, let them drag it
// up to a full image-width in any direction — half the image can
// go off-screen, but never all of it.
function clampPan() {
    if (!modalImg.naturalWidth || !modalImg.offsetWidth) return;
    const w = modalImg.offsetWidth * state.zoom;
    const h = modalImg.offsetHeight * state.zoom;

    const fitX = Math.max(0, (w - window.innerWidth) / 2);
    const fitY = Math.max(0, (h - window.innerHeight) / 2);
    const maxTx = fitX > 0 ? fitX + 100 : w;
    const maxTy = fitY > 0 ? fitY + 100 : h;

    state.tx = Math.max(-maxTx, Math.min(maxTx, state.tx));
    state.ty = Math.max(-maxTy, Math.min(maxTy, state.ty));
}

// internal: applies zoom without snapping (used by pinch)
function applyZoom(newZoom, anchorX, anchorY) {
    newZoom = Math.max(1, Math.min(8, newZoom));
    if (anchorX == null) {
        anchorX = window.innerWidth / 2;
        anchorY = window.innerHeight / 2;
    }
    const cx = anchorX - window.innerWidth / 2;
    const cy = anchorY - window.innerHeight / 2;
    const ix = (cx - state.tx) / state.zoom;
    const iy = (cy - state.ty) / state.zoom;

    state.zoom = newZoom;
    state.tx = cx - ix * newZoom;
    state.ty = cy - iy * newZoom;
    clampPan();
    applyTransform();
    updateZoomLabel();
}

// public: snap to nearest integer (buttons, wheel)
function setZoom(newZoom, anchorX, anchorY) {
    const snapped = Math.max(1, Math.min(8, Math.round(newZoom)));
    if (snapped === state.zoom) return;
    applyZoom(snapped, anchorX, anchorY);
}

function resetZoom() {
    state.zoom = 1;
    state.tx = 0;
    state.ty = 0;
    applyTransform();
    updateZoomLabel();
}

// ---------------------------------------------------------------
// drag
// ---------------------------------------------------------------

function startDrag(x, y) {
    state.dragging = true;
    state.dragStart = { x, y, tx: state.tx, ty: state.ty };
}

function dragTo(x, y) {
    if (!state.dragging || !state.dragStart) return;
    state.tx = state.dragStart.tx + (x - state.dragStart.x);
    state.ty = state.dragStart.ty + (y - state.dragStart.y);
    clampPan();
    applyTransform();
}

function stopDrag() {
    state.dragging = false;
    state.dragStart = null;
}

// ---------------------------------------------------------------
// events
// ---------------------------------------------------------------

closeBtn.addEventListener('click', closeModal);
prevBtn.addEventListener('click', () => navigate(-1));
nextBtn.addEventListener('click', () => navigate(1));
minusBtn.addEventListener('click', () => setZoom(state.zoom - 1));
plusBtn.addEventListener('click', () => setZoom(state.zoom + 1));
resetBtn.addEventListener('click', resetZoom);

// click the dark backdrop to close
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});

// wheel zoom — accumulate so trackpads don't fly across all 8 levels
modal.addEventListener('wheel', (e) => {
    e.preventDefault();
    wheelAccum += e.deltaY;
    if (Math.abs(wheelAccum) >= 50) {
        setZoom(state.zoom + (wheelAccum < 0 ? 1 : -1), e.clientX, e.clientY);
        wheelAccum = 0;
    }
}, { passive: false });

// mouse drag
modalImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
});
window.addEventListener('mousemove', (e) => {
    if (state.dragging) dragTo(e.clientX, e.clientY);
});
window.addEventListener('mouseup', stopDrag);

// dblclick toggles 1x / 2x
modalImg.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (state.zoom > 1) resetZoom();
    else setZoom(2, e.clientX, e.clientY);
});

// touch: one finger pan, two finger pinch
modalImg.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        e.preventDefault();
        state.dragging = false;
        const [a, b] = e.touches;
        state.pinch = {
            startDist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY),
                          startZoom: state.zoom,
                          startTx: state.tx,
                          startTy: state.ty,
        };
    } else if (e.touches.length === 1 && !state.pinch) {
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

modalImg.addEventListener('touchmove', (e) => {
    if (state.pinch && e.touches.length === 2) {
        e.preventDefault();
        const [a, b] = e.touches;
        const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        const ratio = dist / state.pinch.startDist;
        const rawZoom = Math.max(1, Math.min(8, state.pinch.startZoom * ratio));

        const cx = midX - window.innerWidth / 2;
        const cy = midY - window.innerHeight / 2;
        const ix = (cx - state.pinch.startTx) / state.pinch.startZoom;
        const iy = (cy - state.pinch.startTy) / state.pinch.startZoom;

        state.zoom = rawZoom;
        state.tx = cx - ix * rawZoom;
        state.ty = cy - iy * rawZoom;
        clampPan();
        applyTransform();
        updateZoomLabel();
    } else if (state.dragging && e.touches.length === 1) {
        e.preventDefault();
        dragTo(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

modalImg.addEventListener('touchend', (e) => {
    if (state.pinch && e.touches.length < 2) {
        applyZoom(Math.round(state.zoom), null, null);
        state.pinch = null;
    }
    if (e.touches.length === 0) stopDrag();
});

// keyboard
window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape')     { closeModal(); return; }
    if (e.key === 'ArrowLeft')  { navigate(-1); return; }
    if (e.key === 'ArrowRight') { navigate(1);  return; }
    if (e.key === '+' || e.key === '=') { setZoom(state.zoom + 1); return; }
    if (e.key === '-')          { setZoom(state.zoom - 1); return; }
    if (e.key === 'r' || e.key === 'R') { resetZoom(); return; }
});

// image load — dims + re-clamp (user might have zoomed mid-load)
modalImg.addEventListener('load', () => {
    if (modalImg.naturalWidth && modalImg.naturalHeight) {
        modalDims.textContent = `${modalImg.naturalWidth}×${modalImg.naturalHeight}`;
    } else {
        modalDims.textContent = '';
    }
    clampPan();
    applyTransform();
});

modalImg.addEventListener('error', () => {
    modalDims.textContent = '?×?';
});

// hash routing
function syncFromHash() {
    const m = location.hash.match(/^#(\d+)$/);
    if (m && state.artworks.length) {
        const idx = parseInt(m[1], 10);
        if (idx >= 0 && idx < state.artworks.length) {
            openModal(idx);
            return;
        }
    }
    if (modal.classList.contains('open')) closeModal();
}
window.addEventListener('hashchange', syncFromHash);

// ---------------------------------------------------------------
// boot
// ---------------------------------------------------------------

(async function init() {
    try {
        state.artworks = await fetchArtworks();
        renderGallery();
        syncFromHash();
    } catch (e) {
        console.error(e);
        statusEl.textContent = `couldn't load drawings (${e.message}). check the repo config at the top of app.js.`;
        statusEl.classList.add('error');
    }
})();
