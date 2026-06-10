const dateSpan = document.getElementById('date');
if (dateSpan) {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}.${today.getDate()}.${today.getFullYear().toString().slice(-2)}`;
    dateSpan.textContent = formattedDate;
}

const artworks = [
    { filename: "Untitled-projection;(superpositionFluxSurfaceLevel)operateAbecedarianVegetiveStatesProductionIllimitableNonterminous.png", title: "Untitled-projection;(superpositionFluxSurfaceLevel)operateAbecedarianVegetiveStatesProductionIllimitableNonterminous" },
    { filename: "Untitled-beats,NothingMakesItAnymore001.png", title: "Untitled-beats,NothingMakesItAnymore001" },
{ filename: "Untitled-large001.png", title: "Untitled-large001" },
{ filename: "Untitled-putativeUndulatingParticipable;leapK501.png", title: "Untitled-putativeUndulatingParticipable;leapK501"},
{ filename: "Untitled-ok156X.png", title: "Untitled-ok156X" },
{ filename: "Untitled-plethoraOfTheSamePellucidExisting01.jpg", title: "Untitled-plethoraOfTheSamePellucidExisting01" },
{ filename: "Untitled-xyl-Tribute;perceptionalEndictionariliteral.jpg", title: "Untitled-xyl-Tribute;perceptionalEndictionariliteral" },
{ filename: "Untitled-dissimilationTwiningToOrThenAndAlwaysThenMaybeSomedayToPossibleMomentsThenAlsoAfterNoBefore1.jpg", title: "Untitled-dissimilationTwiningToOrThenAndAlwaysThenMaybeSomedayToPossibleMomentsThenAlsoAfterNoBefore1" },
{ filename: "Untitled-0b0000xfif1.jpg", title: "Untitled-0b0000xfif1" },
{ filename: "Untitled-0b0000xfif2.jpg", title: "Untitled-0b0000xfif2" },
{ filename: "Untitled-nothing000002.jpg", title: "Untitled-nothing000002" },
{ filename: "Untitled-wellnessDocumented;NowEffloresceIntoBlithesome024.jpg", title: "Untitled-wellnessDocumented;NowEffloresceIntoBlithesome024" },
{ filename: "Untitled-dayAndAfter00.jpg", title: "Untitled-dayAndAfter00" },
{ filename: "Untitled-dayAndAfter99.jpg", title: "Untitled-dayAndAfter99" },
{ filename: "Untitled-microThermalIncisionPlasteringSubcorticalDeformingAstralColumnGalvanizingConclusiveExampleSubject001.jpg", title: "Untitled-microThermalIncisionPlasteringSubcorticalDeformingAstralColumnGalvanizingConclusiveExampleSubject001" },
{ filename: "Untitled-forEveryWord001.jpg", title: "Untitled-forEveryWord001" },
{ filename: "Untitled-andThenLooking_cerebralExtension(synapticReconfiguration_decompartmentalizing).jpg", title: "Untitled-andThenLooking_cerebralExtension(synapticReconfiguration_decompartmentalizing)" },
{ filename: "Untitled-everyoneNeedsToBe02.jpg", title: "Untitled-everyoneNeedsToBe02" },
{ filename: "Untitled-friends_92.jpg", title: "Untitled-friends_92" },
{ filename: "Untitled-IHTL2.png", title: "Untitled-IHTL2" },
{ filename: "Untitled-Squash58.jpg", title: "Untitled-Squash58" },
{ filename: "Untitled-enterIDWTEA9902x3.jpg", title: "Untitled-enterIDWTEA9902x3" },
{ filename: "Untitled-watchAsBC6.png", title: "Untitled-watchAsBC6" },
{ filename: "Untitled-alwaysAnd092.png", title: "Untitled-alwaysAnd092" },
{ filename: "Untitled-faces;perturbedFigurePulling.jpg", title: "Untitled-faces;perturbedFigurePulling" },
{ filename: "Untitled-allThatSeaFor10000679.png", title: "Untitled-allThatSeaFor10000679" },
{ filename: "Untitled-coreMemory002.png", title: "Untitled-coreMemory002" },
{ filename: "Untitled-LacerationAndNeighbors.png", title: "Untitled-LacerationAndNeighbors" },
{ filename: "Untitled-phaseB01.png", title: "Untitled-phaseB01" },
{ filename: "Untitled-treatB.19.2075.png", title: "Untitled-treatB.19.2075" },
{ filename: "Untitled-viewFrom1.png", title: "Untitled-viewFrom1" },
{ filename: "Untitled-works0..7.png", title: "Untitled-works0..7" }
];

const gallery = document.getElementById('gallery');

if (gallery) {
    artworks.forEach(art => {
        const article = document.createElement('article');
        article.className = 'art-card';

        const img = document.createElement('img');
        img.src = `images/${art.filename}`;
        img.alt = art.title;
        img.loading = 'lazy';

        const title = document.createElement('h2');
        title.className = 'art-title';
        title.textContent = art.title;

        article.appendChild(img);
        article.appendChild(title);
        gallery.appendChild(article);
    });
}

function addImageClickHandlers() {
    document.querySelectorAll(".art-card img").forEach(img => {
        img.removeEventListener('click', img.clickHandler);
        img.clickHandler = function() {
            openModal(this.src, this.alt);
        };
        img.addEventListener('click', img.clickHandler);
    });
}

const modal = document.getElementById("art-modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close-modal");

let currentZoom = 1;

let isDragging = false;
let startX, startY;
let translateX = 0;
let translateY = 0;

const zoomControls = document.createElement('div');
zoomControls.style.cssText = `
position: fixed;
bottom: 2rem;
left: 50%;
transform: translateX(-50%);
display: flex;
gap: 1rem;
background: rgba(0,0,0,0.8);
padding: 0.5rem 1rem;
border-radius: 8px;
z-index: 1002;
backdrop-filter: blur(4px);
border: 1px solid #333;
`;

const zoomMinus = document.createElement('button');
zoomMinus.textContent = '−';
zoomMinus.style.cssText = `
background: #1a1a1a;
border: 1px solid #444;
color: #ffffff;
font-size: 1.5rem;
font-family: monospace;
cursor: pointer;
padding: 0.25rem 0.75rem;
border-radius: 4px;
`;

const zoomValue = document.createElement('span');
zoomValue.textContent = '100% (1x)';
zoomValue.style.cssText = `
color: #888888;
font-family: monospace;
font-size: 0.9rem;
min-width: 100px;
text-align: center;
`;

const zoomPlus = document.createElement('button');
zoomPlus.textContent = '+';
zoomPlus.style.cssText = `
background: #1a1a1a;
border: 1px solid #444;
color: #ffffff;
font-size: 1.5rem;
font-family: monospace;
cursor: pointer;
padding: 0.25rem 0.75rem;
border-radius: 4px;
`;

zoomControls.appendChild(zoomMinus);
zoomControls.appendChild(zoomValue);
zoomControls.appendChild(zoomPlus);
document.body.appendChild(zoomControls);

zoomMinus.addEventListener('click', function() {
    if (modal.style.display === 'flex') {
        setZoom(currentZoom - 1);
    }
});

zoomPlus.addEventListener('click', function() {
    if (modal.style.display === 'flex') {
        setZoom(currentZoom + 1);
    }
});

zoomMinus.addEventListener('mouseenter', () => zoomMinus.style.background = '#333');
zoomMinus.addEventListener('mouseleave', () => zoomMinus.style.background = '#1a1a1a');
zoomPlus.addEventListener('mouseenter', () => zoomPlus.style.background = '#333');
zoomPlus.addEventListener('mouseleave', () => zoomPlus.style.background = '#1a1a1a');

function disableScroll() {
    document.body.style.overflow = 'hidden';
}

function enableScroll() {
    document.body.style.overflow = '';
}

function updateTransform() {
    modalImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
}

function setZoom(level) {
    let clamped = Math.round(level);
    if (clamped < 1) clamped = 1;
    if (clamped > 4) clamped = 4;

    currentZoom = clamped;

    translateX = 0;
    translateY = 0;

    updateTransform();
    modalImg.style.imageRendering = 'pixelated';
    zoomValue.textContent = `${clamped * 100}% (${clamped}x)`;

    zoomValue.style.color = '#ffffff';
    setTimeout(() => {
        zoomValue.style.color = '#888888';
    }, 150);
}

function startDrag(e) {
    e.preventDefault();
    isDragging = true;

    if (e.type === 'mousedown') {
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
    } else if (e.type === 'touchstart') {
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
    }

    modalImg.style.cursor = 'grabbing';
    modalImg.style.transition = 'none';
}

function onDrag(e) {
    if (!isDragging) return;

    e.preventDefault();

    let clientX, clientY;
    if (e.type === 'mousemove') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }

    translateX = clientX - startX;
    translateY = clientY - startY;

    updateTransform();
}

function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    modalImg.style.cursor = 'grab';
    modalImg.style.transition = 'transform 0.1s ease-out';
}

function openModal(imgSrc, imgAlt) {
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imgSrc;
        modalImg.alt = imgAlt;
        setZoom(1);
        disableScroll();

        modalImg.style.cursor = 'grab';
        translateX = 0;
        translateY = 0;

        zoomControls.style.display = 'flex';
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
        setZoom(1);
        enableScroll();
        translateX = 0;
        translateY = 0;
    }
}

function handleWheelZoom(e) {
    if (!modal || modal.style.display !== "flex") return;

    e.preventDefault();
    e.stopPropagation();

    const delta = e.deltaY > 0 ? -1 : 1;
    let newZoom = currentZoom + delta;

    if (newZoom < 1) newZoom = 1;
    if (newZoom > 4) newZoom = 4;

    setZoom(newZoom);
}

modal.addEventListener('touchstart', (e) => {
    if (e.target === modal) return;
    e.preventDefault();
}, { passive: false });

modal.addEventListener('wheel', handleWheelZoom, { passive: false });

modalImg.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', stopDrag);

modalImg.addEventListener('touchstart', startDrag, { passive: false });
window.addEventListener('touchmove', onDrag, { passive: false });
window.addEventListener('touchend', stopDrag);

if (modalImg) {
    modalImg.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        setZoom(1);
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
}

if (modal) {
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && modal && modal.style.display === "flex") {
        closeModal();
    }
    if ((e.key === "r" || e.key === "R") && modal && modal.style.display === "flex") {
        setZoom(1);
    }
    if ((e.key === "+" || e.key === "=") && modal && modal.style.display === "flex") {
        setZoom(currentZoom + 1);
    }
    if (e.key === "-" && modal && modal.style.display === "flex") {
        setZoom(currentZoom - 1);
    }
});

zoomControls.style.display = 'none';

addImageClickHandlers();
