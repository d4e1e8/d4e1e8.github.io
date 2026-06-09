const dateSpan = document.getElementById('date');
if (dateSpan) {
    const today = new Date();
    const formattedDate = `${today.getMonth() + 1}.${today.getDate()}.${today.getFullYear().toString().slice(-2)}`;
    dateSpan.textContent = formattedDate;
}

const artworks = [
    { filename: "Untitled-projection;(superpositionFluxSurfaceLevel)operateAbecedarianVegetiveStatesProductionIllimitableNonterminous.png", title: "Untitled-projection;(superpositionFluxSurfaceLevel)operateAbecedarianVegetiveStatesProductionIllimitableNonterminous" },
    { filename: "Untitled-ok156X.png", title: "Untitled-ok156X" },
    { filename: "Untitled-plethoraOfTheSamePellucidExisting01.jpg", title: "Untitled-plethoraOfTheSamePellucidExisting01" },
    { filename: "Untitled-xyl-Tribute;perceptionalEndictionariliteral.jpg", title: "Untitled-xyl-Tribute;perceptionalEndictionariliteral" },
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

// gallery generations
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

// modal w& zooming, snaps
const modal = document.getElementById("art-modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close-modal");

let currentZoom = 1;

const zoomDisplay = document.createElement('div');
zoomDisplay.style.cssText = `
position: fixed;
bottom: 2rem;
left: 2rem;
color: #888888;
font-family: monospace;
font-size: 0.9rem;
background: rgba(0,0,0,0.7);
padding: 0.5rem 1rem;
border-radius: 4px;
z-index: 1002;
pointer-events: none;
`;
zoomDisplay.textContent = '100% (1x)';
document.body.appendChild(zoomDisplay);

function setZoom(level) {
    const clamped = Math.min(4, Math.max(1, level));
    currentZoom = clamped;

    modalImg.style.transform = `scale(${clamped})`;
    modalImg.style.imageRendering = 'pixelated';
    zoomDisplay.textContent = `${clamped * 100}% (${clamped}x)`;

    zoomDisplay.style.color = '#ffffff';
    setTimeout(() => {
        zoomDisplay.style.color = '#888888';
    }, 150);
}

function openModal(imgSrc, imgAlt) {
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imgSrc;
        modalImg.alt = imgAlt;
        setZoom(1);
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
        setZoom(1);
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

    console.log(`Scroll: deltaY=${e.deltaY}, delta=${delta}, newZoom=${newZoom}`); // Debug

    setZoom(newZoom);
}

modal.addEventListener('wheel', handleWheelZoom, { passive: false });

if (modalImg) {
    modalImg.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        setZoom(1);
    });
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && modal && modal.style.display === "flex") {
        closeModal();
    }
    if ((e.key === "r" || e.key === "R") && modal && modal.style.display === "flex") {
        setZoom(1);
    }
});
