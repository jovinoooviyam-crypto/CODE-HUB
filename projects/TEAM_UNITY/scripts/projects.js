// =========================================================
// TEAM UNITY
// DYNAMIC PROJECT CARDS + PROJECT PHOTO GALLERY + IMAGE SLIDER
// =========================================================

// =========================================================
// PROJECT DATA
// =========================================================

const projects = [
    {
        id: "ART",
        title: "ART PERFORMANCE",
        category: "ART-PERFORMANCE",
        description:
            "We performs traditional folk arts at cultural events, community programs, and awareness campaigns, using art to celebrate our heritage, spread meaningful messages, and engage audiences.",
        poster:
            "/api/drive-image/1PfQpnG_PSe9n-4Epg46M_ZnJ74fx1mqS",
        photos: projectDatas
    },
    {
        id: "skill-labs",
        title: "Skill Labs",
        category: "SKILLS",
        description:
            "Hands-on learning sessions designed to develop practical creative skills.",
        poster:
            "/api/drive-image/172HOiwaFUubl4zTuB5gAhb-PKa6fdxfj",
        mappingid: "skill-labs",
        photos: projectDatas
    },
    {
        id: "art-community",
        title: "Art Community",
        category: "ART",
        description:
            "A creative space connecting artists and people through shared ideas.",
        poster:
            "/api/drive-image/13MI5SWRZuSyIH2zUWbv4ieNdYYgg5PSr",
        mappingid: "art",
        photos: projectDatas
    },
    {
        id: "awarness",
        title: "Awarness Events",
        category: "AWARNESS",
        description:
            "Interactive workshops where participants learn, create and collaborate.",
        poster:
            "/api/drive-image/1-EZ6Q_S9fDkwbhBJtqmzuWrzYl6KUgp-",
        mappingid: "awarness",
        photos: projectDatas
    },
];

// FILTER PHOTOS BY ID
projects.forEach(project => {
    project.photos = projectDatas.filter(
        photo => photo.ID === project.id
    );
});

// =========================================================
// ELEMENTS
// =========================================================

const projectsGrid =
    document.getElementById("projectsGrid");

const projectGallery =
    document.getElementById("projectGallery");

const galleryGrid =
    document.getElementById("galleryGrid");

const galleryTitle =
    document.getElementById("galleryTitle");

const closeGallery =
    document.getElementById("closeGallery");

// New slider elements
const imageSliderModal =
    document.getElementById("imageSliderModal");

const sliderImage =
    document.getElementById("sliderImage");

const sliderCounter =
    document.getElementById("sliderCounter");

const prevSliderBtn =
    document.getElementById("prevSliderBtn");

const nextSliderBtn =
    document.getElementById("nextSliderBtn");

const closeSlider =
    document.getElementById("closeSlider");

// =========================================================
// SLIDER STATE
// =========================================================

let currentSliderIndex = 0;
let currentSliderImages = [];
let currentSliderTitle = "";

// =========================================================
// CREATE PROJECT CARDS
// =========================================================

function createProjectCards() {

    if (!projectsGrid) {
        console.error(
            "Team Unity: #projectsGrid was not found."
        );
        return;
    }

    projectsGrid.innerHTML = "";

    projects.forEach(project => {

        const card =
            document.createElement("article");

        card.className =
            "project-card";

        card.innerHTML = `

            <div
                class="project-poster"
                data-project="${project.id}"
                role="button"
                tabindex="0"
                aria-label="View photos of ${project.title}"
            >

                <img
                    src="${project.poster}"
                    alt="${project.title}"
                    loading="lazy"
                >

                <div class="poster-overlay">

                    <i class="fa-solid fa-images"></i>

                    <span>
                        View Photos
                    </span>

                </div>

            </div>

            <div class="project-content">

                <span class="work-tag">
                    ${project.category}
                </span>

                <h3>
                    ${project.title}
                </h3>

                <p>
                    ${project.description}
                </p>

                <button
                    type="button"
                    class="project-view-btn"
                    data-project="${project.id}"
                >

                    View Project

                    <i class="fa-solid fa-arrow-right"></i>

                </button>

            </div>

        `;

        projectsGrid.appendChild(card);

    });

    addProjectEvents();
}

// =========================================================
// ADD CLICK EVENTS
// =========================================================

function addProjectEvents() {

    const posters =
        document.querySelectorAll(".project-poster");

    const buttons =
        document.querySelectorAll(".project-view-btn");

    const photoCards =
        document.querySelectorAll(".gallery-photo-card");

    posters.forEach(poster => {

        poster.addEventListener(
            "click",
            function () {

                const projectId =
                    this.dataset.project;

                openProjectGallery(projectId);

            }
        );

        poster.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    const projectId =
                        this.dataset.project;

                    openProjectGallery(projectId);

                }

            }
        );

    });

    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const projectId =
                    this.dataset.project;

                openProjectGallery(projectId);

            }
        );

    });

}

// =========================================================
// OPEN PROJECT GALLERY
// =========================================================

function openProjectGallery(projectId) {

    const project =
        projects.find(
            item => item.id === projectId
        );

    if (!project) {
        console.error(
            "Project not found:",
            projectId
        );
        return;
    }

    if (!projectGallery || !galleryGrid) {
        console.error(
            "Gallery elements were not found."
        );
        return;
    }

    galleryTitle.textContent =
        project.title;

    galleryGrid.innerHTML = "";

    project.photos.forEach(
        (photo, index) => {

            const photoCard =
                document.createElement("div");

            photoCard.className =
                "gallery-photo-card";

            photoCard.innerHTML = `

                <div
                    class="photo-image-wrapper"
                    role="button"
                    tabindex="0"
                    data-photo-index="${index}"
                    data-project-id="${projectId}"
                    aria-label="Click to open image slider"
                >

                    <img
                        src="${photo.image}"
                        alt="${project.title} photo ${index + 1}"
                        class="gallery-photo"
                        loading="lazy"
                    >

                    <div class="photo-overlay-slider">
                        <i class="fa-solid fa-expand"></i>
                    </div>

                </div>

                <div class="gallery-photo-info">

                    <div class="gallery-event-meta">

                        <span>
                            <i class="fa-regular fa-calendar"></i>
                            ${photo.date}
                        </span>

                        <span>
                            <i class="fa-solid fa-location-dot"></i>
                            ${photo.venue}
                        </span>

                    </div>

                    <div class="gallery-photo-description">

                        <p>
                            ${photo.description}
                        </p>

                    </div>

                </div>

            `;

            galleryGrid.appendChild(photoCard);

        }
    );

    // Attach click listeners to photo cards for slider
    attachPhotoCardListeners();

    projectGallery.classList.add(
        "active"
    );

    projectGallery.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}

// =========================================================
// ATTACH PHOTO CARD LISTENERS FOR SLIDER
// =========================================================

function attachPhotoCardListeners() {

    const photoWrappers =
        document.querySelectorAll(".photo-image-wrapper");

    photoWrappers.forEach(wrapper => {

        wrapper.addEventListener("click", function () {

            const projectId = this.dataset.projectId;
            const photoIndex = parseInt(this.dataset.photoIndex);

            const project = projects.find(p => p.id === projectId);

            if (project && project.photos[photoIndex]) {

                const photo = project.photos[photoIndex];
                
                // Use imageSlider if available, otherwise use just the single image
                const sliderImages = photo.imageSlider && photo.imageSlider.length > 0 
                    ? photo.imageSlider 
                    : [photo.image];

                openImageSlider(
                    sliderImages,
                    `${project.title} - ${photo.date}`,
                    photoIndex
                );

            }

        });

        wrapper.addEventListener("keydown", function (event) {

            if (event.key === "Enter" || event.key === " ") {

                event.preventDefault();

                const projectId = this.dataset.projectId;
                const photoIndex = parseInt(this.dataset.photoIndex);

                const project = projects.find(p => p.id === projectId);

                if (project && project.photos[photoIndex]) {

                    const photo = project.photos[photoIndex];
                    
                    // Use imageSlider if available, otherwise use just the single image
                    const sliderImages = photo.imageSlider && photo.imageSlider.length > 0 
                        ? photo.imageSlider 
                        : [photo.image];

                    openImageSlider(
                        sliderImages,
                        `${project.title} - ${photo.date}`,
                        photoIndex
                    );

                }

            }

        });

    });

}

// =========================================================
// OPEN IMAGE SLIDER
// =========================================================

function openImageSlider(images, title, photoIndex) {

    if (!imageSliderModal || !sliderImage) {

        console.error(
            "Image slider elements were not found."
        );

        return;

    }

    if (!images || images.length === 0) {

        console.error(
            "No images provided for slider."
        );

        return;

    }

    currentSliderImages = images;
    currentSliderTitle = title;
    currentSliderIndex = 0;

    updateSliderDisplay();

    imageSliderModal.classList.add("active");
    imageSliderModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";

}

// =========================================================
// UPDATE SLIDER DISPLAY
// =========================================================

function updateSliderDisplay() {

    if (currentSliderImages.length === 0) return;

    sliderImage.src = currentSliderImages[currentSliderIndex];
    sliderImage.alt = `${currentSliderTitle} - Image ${currentSliderIndex + 1}`;

    if (sliderCounter) {

        sliderCounter.textContent =
            `${currentSliderIndex + 1} / ${currentSliderImages.length}`;

    }

    // Disable prev button if at start
    if (prevSliderBtn) {

        prevSliderBtn.disabled = currentSliderIndex === 0;

    }

    // Disable next button if at end
    if (nextSliderBtn) {

        nextSliderBtn.disabled =
            currentSliderIndex === currentSliderImages.length - 1;

    }

}

// =========================================================
// SLIDER NAVIGATION
// =========================================================

function previousSlide() {

    if (currentSliderIndex > 0) {

        currentSliderIndex--;
        updateSliderDisplay();

    }

}

function nextSlide() {

    if (currentSliderIndex < currentSliderImages.length - 1) {

        currentSliderIndex++;
        updateSliderDisplay();

    }

}

// =========================================================
// CLOSE IMAGE SLIDER
// =========================================================

function closeImageSlider() {

    if (!imageSliderModal) return;

    imageSliderModal.classList.remove("active");
    imageSliderModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    currentSliderIndex = 0;
    currentSliderImages = [];
    currentSliderTitle = "";

}

// =========================================================
// CLOSE PROJECT GALLERY
// =========================================================

function closeProjectGallery() {

    if (!projectGallery) {
        return;
    }

    projectGallery.classList.remove(
        "active"
    );

    projectGallery.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}

// =========================================================
// EVENT LISTENERS - GALLERY CLOSE
// =========================================================

if (closeGallery) {

    closeGallery.addEventListener(
        "click",
        closeProjectGallery
    );

}

if (projectGallery) {

    projectGallery.addEventListener(
        "click",
        function (event) {

            if (
                event.target === projectGallery
            ) {

                closeProjectGallery();

            }

        }
    );

}

// =========================================================
// EVENT LISTENERS - SLIDER CONTROLS
// =========================================================

if (prevSliderBtn) {

    prevSliderBtn.addEventListener(
        "click",
        previousSlide
    );

}

if (nextSliderBtn) {

    nextSliderBtn.addEventListener(
        "click",
        nextSlide
    );

}

if (closeSlider) {

    closeSlider.addEventListener(
        "click",
        closeImageSlider
    );

}

if (imageSliderModal) {

    imageSliderModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target === imageSliderModal
            ) {

                closeImageSlider();

            }

        }
    );

}

// =========================================================
// KEYBOARD CONTROLS
// =========================================================

document.addEventListener(
    "keydown",
    function (event) {

        // Close gallery with Escape
        if (
            event.key === "Escape" &&
            projectGallery &&
            projectGallery.classList.contains("active")
        ) {

            closeProjectGallery();

        }

        // Close slider with Escape
        if (
            event.key === "Escape" &&
            imageSliderModal &&
            imageSliderModal.classList.contains("active")
        ) {

            closeImageSlider();

        }

        // Slider navigation with arrow keys
        if (
            imageSliderModal &&
            imageSliderModal.classList.contains("active")
        ) {

            if (event.key === "ArrowLeft") {

                event.preventDefault();
                previousSlide();

            } else if (event.key === "ArrowRight") {

                event.preventDefault();
                nextSlide();

            }

        }

    }
);

// =========================================================
// COPYRIGHT YEAR
// =========================================================

const yearElement =
    document.getElementById("year");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}

// =========================================================
// HANDLE URL PARAMETER FROM WORKS PAGE
// =========================================================

function openProjectFromURL() {

    const params = new URLSearchParams(window.location.search);
    const searchKey = params.get("projectSearch");

    if (!searchKey) return;

    console.log("Requested event:", searchKey);

    const event = projectDatas.find(
        photo => photo.mappingtag === searchKey
    );

    if (!event) {

        console.error("Event not found:", searchKey);
        return;

    }

    const project = projects.find(
        item => item.id === event.ID
    );

    if (!project) {

        console.error("Project not found for event:", searchKey);
        return;

    }

    document.querySelector("#projects")?.scrollIntoView({
        behavior: "smooth"
    });

    setTimeout(() => {

        openProjectGallery(project.id);

        const eventPhotos = projectDatas.filter(
            photo =>
                photo.ID === event.ID &&
                photo.mappingtag === searchKey
        );

        galleryGrid.innerHTML = "";

        eventPhotos.forEach((photo, index) => {

            const card = document.createElement("div");
            card.className = "gallery-photo-card";

            card.innerHTML = `

                <div
                    class="photo-image-wrapper"
                    role="button"
                    tabindex="0"
                    data-photo-index="${index}"
                    data-project-id="${project.id}"
                    aria-label="Click to open image slider"
                >

                    <img
                        src="${photo.image}"
                        alt="${project.title} event photo ${index + 1}"
                        class="gallery-photo"
                        loading="lazy"
                    >

                    <div class="photo-overlay-slider">
                        <i class="fa-solid fa-expand"></i>
                    </div>

                </div>

                <div class="gallery-photo-info">

                    <div class="gallery-event-meta">

                        <span>${photo.date}</span>
                        <span>${photo.venue}</span>

                    </div>

                    <div class="gallery-photo-description">

                        <p>${photo.description}</p>

                    </div>

                </div>

            `;

            galleryGrid.appendChild(card);

        });

        attachPhotoCardListeners();

    }, 500);

}

// =========================================================
// LOAD DRIVE FILES
// =========================================================

async function loadDriveFiles() {

    try {

        const response =
            await fetch("/api/drive-files");

        const files =
            await response.json();

        const container =
            document.getElementById("driveFiles");

        container.innerHTML = "";

        files.forEach(file => {

            const item =
                document.createElement("div");

            item.className = "drive-file";

            if (file.mimeType.startsWith("image/")) {

                item.innerHTML = `
                    <img
                        src="${file.thumbnailLink}"
                        alt="${file.name}"
                    >
                    <p>${file.name}</p>
                `;

            } else {

                item.innerHTML = `
                    <p>${file.name}</p>
                    <a
                        href="${file.webViewLink}"
                        target="_blank"
                    >
                        Open Document
                    </a>
                `;

            }

            container.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Failed to load Drive files:",
            error
        );

    }

}

// =========================================================
// INITIALIZATION
// =========================================================

createProjectCards();

if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", openProjectFromURL);

} else {

    openProjectFromURL();

}

loadDriveFiles();