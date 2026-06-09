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
    { filename: "Untitled-dayAndAfter99.jpg", title: "Untitled-dayAndAfter99" },
    { filename: "Untitled-microThermalIncisionPlasteringSubcorticalDeformingAstralColumnGalvanizingConclusiveExampleSubject001.jpg", title: "Untitled-microThermalIncisionPlasteringSubcorticalDeformingAstralColumnGalvanizingConclusiveExampleSubject001" },
    { filename: "Untitled-forEveryWord001.jpg", title: "Untitled-forEveryWord001" },
    { filename: "Untitled-everyoneNeedsToBe02.jpg", title: "Untitled-everyoneNeedsToBe02" },
    { filename: "Untitled-friends_92.jpg", title: "Untitled-friends_92" },
    { filename: "Untitled-IHTL2.png", title: "Untitled-IHTL2" },
    { filename: "Untitled-Squash58.jpg", title: "Untitled-Squash58" },
    { filename: "Untitled-enterIDWTEA9902x3.jpg", title: "Untitled-enterIDWTEA9902x3" },
    { filename: "Untitled-watchAsBC6.png", title: "Untitled-watchAsBC6" },
    { filename: "Untitled-alwaysAnd092.png", title: "Untitled-alwaysAnd092" },
    { filename: "Untitled-faces;perturbedFigurePulling.jpg", title: "Untitled-faces;perturbedFigurePulling" }
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

const modal = document.getElementById("art-modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.querySelector(".close-modal");

function openModal(imgSrc, imgAlt) {
    if (modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imgSrc;
        modalImg.alt = imgAlt;
    }
}

function closeModal() {
    if (modal) {
        modal.style.display = "none";
    }
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

addImageClickHandlers();

if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
}

if (modal) {
    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && modal && modal.style.display === "flex") {
        closeModal();
    }
});

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            addImageClickHandlers();
        }
    });
});

if (gallery) {
    observer.observe(gallery, { childList: true, subtree: true });
}
