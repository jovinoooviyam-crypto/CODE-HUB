
// =========================================================
// TEAM UNITY
// DYNAMIC PROJECT CARDS + PROJECT PHOTO GALLERY + IMAGE SLIDER
// FULLY CORRECTED VERSION
// =========================================================

(() => {

    "use strict";

    // =====================================================
    // PROJECT DATA
    // =====================================================

    const projectDatas = Array.isArray(window.projectDatas)
        ? window.projectDatas
        : [];

    const projects = [

        {
            id: "performance",
            title: "Performance",
            category: "Performance",
            description:
                "Art-form volunteering involves supporting and participating in traditional and contemporary art activities, helping showcase cultural expressions, creativity, and artistic talents.",
            poster:
                "/api/drive-image/13MI5SWRZuSyIH2zUWbv4ieNdYYgg5PSr",
            mappingid: "Performance"
        },

        {
            id: "workshop",
            title: "Workshop",
            category: "Workshop",
            description:
                "Workshop volunteering involves assisting with participant registration, material arrangements, coordination, and session management to ensure the smooth and successful conduct of the workshop.",
            poster:
                "/api/drive-image/1O2z0XRl3f0R1bbdC1-K8MI59eKa8ezZM",
            mappingid: "workshop"
        },

        {
            id: "awarness",
            title: "Awareness Events",
            category: "Awareness",
            description:
                "Interactive workshops where participants learn, create and collaborate.",
            poster:
                "/api/drive-image/11TaoEXpu4BVyFV10dyU9_2TiZRM6MUPM",
            mappingid: "awarness"
        },

        {
            id: "volunteering",
            title: "Volunteering Events",
            category: "Volunteering",
            description:
                "Event volunteering involves assisting in event planning, coordination, registration, and management, ensuring smooth execution through teamwork, responsibility, and effective communication.",
            poster:
                "/api/drive-image/1WxCNtuaZ1hFjgvQ9knuQF9uFb3VwAoeR",
            mappingid: "volunteering"
        }

    ];

    // =====================================================
    // FILTER PROJECT PHOTOS
    // =====================================================

    projects.forEach(project => {

        project.photos = projectDatas.filter(photo =>
            photo.ID === project.id
        );

    });

    // =====================================================
    // DOM ELEMENTS
    // =====================================================

    let projectsGrid;
    let projectGallery;
    let galleryGrid;
    let galleryTitle;
    let closeGallery;

    let imageSliderModal;
    let sliderImage;
    let sliderCounter;
    let prevSliderBtn;
    let nextSliderBtn;
    let closeSlider;

    // =====================================================
    // STATE
    // =====================================================

    let currentGalleryPhotos = [];

    let currentSliderImages = [];
    let currentSliderIndex = 0;
    let currentSliderTitle = "";

    // =====================================================
    // HTML ESCAPING
    // =====================================================

    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            })[character]
        );

    }

    // =====================================================
    // BODY SCROLL CONTROL
    // =====================================================

    function updateBodyScroll() {

        const galleryOpen =
            projectGallery?.classList.contains("active");

        const sliderOpen =
            imageSliderModal?.classList.contains("active");

        document.body.style.overflow =
            galleryOpen || sliderOpen ? "hidden" : "";

    }

    // =====================================================
    // CREATE PROJECT CARDS
    // =====================================================

    function createProjectCards() {

        if (!projectsGrid) {

            console.error(
                "Team Unity: #projectsGrid was not found."
            );

            return;

        }

        projectsGrid.innerHTML = "";

        projects.forEach(project => {

            const card = document.createElement("article");

            card.className = "project-card";

            card.innerHTML = `

                <div
                    class="project-poster"
                    data-project="${escapeHTML(project.id)}"
                    role="button"
                    tabindex="0"
                    aria-label="View photos of ${escapeHTML(project.title)}"
                >

                    <img
                        src="${escapeHTML(project.poster)}"
                        alt="${escapeHTML(project.title)}"
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
                        ${escapeHTML(project.category)}
                    </span>

                    <h3>
                        ${escapeHTML(project.title)}
                    </h3>

                    <p>
                        ${escapeHTML(project.description)}
                    </p>

                    <button
                        type="button"
                        class="project-view-btn"
                        data-project="${escapeHTML(project.id)}"
                    >

                        View Project

                        <i class="fa-solid fa-arrow-right"></i>

                    </button>

                </div>

            `;

            projectsGrid.appendChild(card);

        });

    }

    // =====================================================
    // PROJECT CARD EVENTS
    // EVENT DELEGATION
    // =====================================================

    function attachProjectEvents() {

        if (!projectsGrid) return;

        projectsGrid.addEventListener("click", event => {

            const target = event.target.closest(
                "[data-project]"
            );

            if (!target) return;

            if (
                !target.classList.contains("project-poster") &&
                !target.classList.contains("project-view-btn")
            ) return;

            openProjectGallery(target.dataset.project);

        });

        projectsGrid.addEventListener("keydown", event => {

            const poster = event.target.closest(
                ".project-poster"
            );

            if (!poster) return;

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openProjectGallery(
                    poster.dataset.project
                );

            }

        });

    }

    // =====================================================
    // OPEN PROJECT GALLERY
    // =====================================================

    function openProjectGallery(
        projectId,
        photosToShow = null
    ) {

        const project = projects.find(
            item => item.id === projectId
        );

        if (!project) {

            console.error(
                "Project not found:",
                projectId
            );

            return;

        }

        if (
            !projectGallery ||
            !galleryGrid ||
            !galleryTitle
        ) {

            console.error(
                "Gallery elements were not found."
            );

            return;

        }

        // Use the supplied photo collection or project photos.
        // This is important for URL-filtered event galleries.

        currentGalleryPhotos = Array.isArray(photosToShow)
            ? photosToShow
            : project.photos;

        galleryTitle.textContent = project.title;

        renderGalleryPhotos(project);

        projectGallery.classList.add("active");

        projectGallery.setAttribute(
            "aria-hidden",
            "false"
        );

        updateBodyScroll();

    }

    // =====================================================
    // RENDER GALLERY PHOTOS
    // =====================================================

    function renderGalleryPhotos(project) {

        galleryGrid.innerHTML = "";

        if (currentGalleryPhotos.length === 0) {

            galleryGrid.innerHTML = `

                <div class="gallery-empty">

                    <p>
                        No photos available for this project yet.
                    </p>

                </div>

            `;

            return;

        }

        currentGalleryPhotos.forEach((photo, index) => {

            const photoCard = document.createElement("div");

            photoCard.className = "gallery-photo-card";

            photoCard.innerHTML = `

                <div
                    class="photo-image-wrapper"
                    role="button"
                    tabindex="0"
                    data-photo-index="${index}"
                    aria-label="Open image ${index + 1} in slider"
                >

                    <img
                        src="${escapeHTML(photo.image)}"
                        alt="${escapeHTML(project.title)} photo ${index + 1}"
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

                            ${escapeHTML(photo.date)}

                        </span>

                        <span>

                            <i class="fa-solid fa-location-dot"></i>

                            ${escapeHTML(photo.venue)}

                        </span>

                    </div>

                    <div class="gallery-photo-description">

                        <p>
                            ${escapeHTML(photo.description)}
                        </p>

                    </div>

                </div>

            `;

            galleryGrid.appendChild(photoCard);

        });

    }

    // =====================================================
    // GALLERY PHOTO EVENTS
    // =====================================================

    function attachPhotoCardListeners() {

        if (!galleryGrid) return;

        // Event delegation prevents duplicate listeners
        // when the gallery is rendered multiple times.

        galleryGrid.addEventListener("click", event => {

            const wrapper = event.target.closest(
                ".photo-image-wrapper"
            );

            if (!wrapper) return;

            openSelectedPhoto(
                wrapper.dataset.photoIndex
            );

        });

        galleryGrid.addEventListener("keydown", event => {

            const wrapper = event.target.closest(
                ".photo-image-wrapper"
            );

            if (!wrapper) return;

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openSelectedPhoto(
                    wrapper.dataset.photoIndex
                );

            }

        });

    }

    // =====================================================
    // OPEN SELECTED GALLERY PHOTO
    // =====================================================

    function openSelectedPhoto(photoIndex) {

        const index = Number(photoIndex);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= currentGalleryPhotos.length
        ) {

            console.error(
                "Invalid gallery photo index:",
                photoIndex
            );

            return;

        }

        const photo = currentGalleryPhotos[index];

        if (!photo) return;

        // Use the photo's slider collection when available.
        // Otherwise, display its main image.

        const sliderImages =
            Array.isArray(photo.imageSlider) &&
            photo.imageSlider.length > 0

                ? photo.imageSlider.filter(
                    image => typeof image === "string" && image.length > 0
                )

                : [];

        const images = sliderImages.length > 0
            ? sliderImages
            : [photo.image].filter(Boolean);

        openImageSlider(
            images,
            `${galleryTitle.textContent} - ${photo.date || ""}`
        );

    }

    // =====================================================
    // OPEN IMAGE SLIDER
    // =====================================================

    function openImageSlider(images, title) {

        if (!imageSliderModal || !sliderImage) {

            console.error(
                "Image slider elements were not found."
            );

            return;

        }

        if (!Array.isArray(images) || images.length === 0) {

            console.error(
                "No valid images provided for slider."
            );

            return;

        }

        currentSliderImages = images;
        currentSliderTitle = title || "Project Photos";

        currentSliderIndex = 0;

        updateSliderDisplay();

        imageSliderModal.classList.add("active");

        imageSliderModal.setAttribute(
            "aria-hidden",
            "false"
        );

        updateBodyScroll();

    }

    // =====================================================
    // UPDATE SLIDER DISPLAY
    // =====================================================

    function updateSliderDisplay() {

        if (
            !sliderImage ||
            currentSliderImages.length === 0
        ) return;

        const image =
            currentSliderImages[currentSliderIndex];

        sliderImage.src = image;

        sliderImage.alt =
            `${currentSliderTitle} - Image ${currentSliderIndex + 1}`;

        if (sliderCounter) {

            sliderCounter.textContent =
                `${currentSliderIndex + 1} / ${currentSliderImages.length}`;

        }

        if (prevSliderBtn) {

            prevSliderBtn.disabled =
                currentSliderIndex === 0;

        }

        if (nextSliderBtn) {

            nextSliderBtn.disabled =
                currentSliderIndex === currentSliderImages.length - 1;

        }

    }

    // =====================================================
    // PREVIOUS SLIDE
    // =====================================================

    function previousSlide() {

        if (currentSliderIndex > 0) {

            currentSliderIndex--;

            updateSliderDisplay();

        }

    }

    // =====================================================
    // NEXT SLIDE
    // =====================================================

    function nextSlide() {

        if (
            currentSliderIndex <
            currentSliderImages.length - 1
        ) {

            currentSliderIndex++;

            updateSliderDisplay();

        }

    }

    // =====================================================
    // CLOSE IMAGE SLIDER
    // =====================================================

    function closeImageSlider() {

        if (!imageSliderModal) return;

        imageSliderModal.classList.remove("active");

        imageSliderModal.setAttribute(
            "aria-hidden",
            "true"
        );

        currentSliderIndex = 0;

        currentSliderImages = [];

        currentSliderTitle = "";

        if (sliderImage) {

            sliderImage.removeAttribute("src");

        }

        updateBodyScroll();

    }

    // =====================================================
    // CLOSE PROJECT GALLERY
    // =====================================================

    function closeProjectGallery() {

        if (!projectGallery) return;

        // Close the slider first if it is open.

        if (
            imageSliderModal?.classList.contains("active")
        ) {

            closeImageSlider();

        }

        projectGallery.classList.remove("active");

        projectGallery.setAttribute(
            "aria-hidden",
            "true"
        );

        currentGalleryPhotos = [];

        updateBodyScroll();

    }

    // =====================================================
    // GALLERY CLOSE EVENTS
    // =====================================================

    function attachGalleryCloseEvents() {

        if (closeGallery) {

            closeGallery.addEventListener(
                "click",
                closeProjectGallery
            );

        }

        if (projectGallery) {

            projectGallery.addEventListener(
                "click",
                event => {

                    if (event.target === projectGallery) {

                        closeProjectGallery();

                    }

                }
            );

        }

    }

    // =====================================================
    // SLIDER CONTROL EVENTS
    // =====================================================

    function attachSliderEvents() {

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
                event => {

                    if (event.target === imageSliderModal) {

                        closeImageSlider();

                    }

                }
            );

        }

    }

    // =====================================================
    // KEYBOARD CONTROLS
    // =====================================================

    function attachKeyboardEvents() {

        document.addEventListener(
            "keydown",
            event => {

                const sliderOpen =
                    imageSliderModal?.classList.contains("active");

                const galleryOpen =
                    projectGallery?.classList.contains("active");

                // Escape closes the topmost open layer.

                if (event.key === "Escape") {

                    if (sliderOpen) {

                        closeImageSlider();

                    } else if (galleryOpen) {

                        closeProjectGallery();

                    }

                    return;

                }

                // Image slider navigation.

                if (sliderOpen) {

                    if (event.key === "ArrowLeft") {

                        event.preventDefault();

                        previousSlide();

                    }

                    if (event.key === "ArrowRight") {

                        event.preventDefault();

                        nextSlide();

                    }

                }

            }
        );

    }

    // =====================================================
    // COPYRIGHT YEAR
    // =====================================================

    function updateCopyrightYear() {

        const yearElement =
            document.getElementById("year");

        if (yearElement) {

            yearElement.textContent =
                new Date().getFullYear();

        }

    }

    // =====================================================
    // OPEN PROJECT FROM URL
    // WORKS PAGE INTEGRATION
    // =====================================================

    function openProjectFromURL() {

        const params =
            new URLSearchParams(window.location.search);

        const searchKey =
            params.get("projectSearch");

        if (!searchKey) return;

        console.log(
            "Team Unity: Requested event:",
            searchKey
        );

        // Find the requested event.

        const event = projectDatas.find(
            photo => photo.mappingtag === searchKey
        );

        if (!event) {

            console.error(
                "Team Unity: Event not found:",
                searchKey
            );

            return;

        }

        // Find its parent project.

        const project = projects.find(
            item => item.id === event.ID
        );

        if (!project) {

            console.error(
                "Team Unity: Project not found for event:",
                event.ID
            );

            return;

        }

        // Filter only photos belonging to the selected event.

        const eventPhotos = projectDatas.filter(
            photo =>
                photo.ID === event.ID &&
                photo.mappingtag === searchKey
        );

        if (eventPhotos.length === 0) {

            console.error(
                "Team Unity: No photos found for event:",
                searchKey
            );

            return;

        }

        // Scroll to projects section.

        const projectsSection =
            document.querySelector("#projects");

        if (projectsSection) {

            projectsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

        // Open the exact filtered event gallery.

        setTimeout(() => {

            openProjectGallery(
                project.id,
                eventPhotos
            );

        }, 500);

    }

    // =====================================================
    // LOAD GOOGLE DRIVE FILES
    // =====================================================

    async function loadDriveFiles() {

        const container =
            document.getElementById("driveFiles");

        if (!container) return;

        try {

            const response = await fetch(
                "/api/drive-files"
            );

            if (!response.ok) {

                throw new Error(
                    `Drive API error: ${response.status}`
                );

            }

            const files = await response.json();

            if (!Array.isArray(files)) {

                throw new Error(
                    "Invalid Drive API response."
                );

            }

            container.innerHTML = "";

            if (files.length === 0) {

                container.innerHTML = `
                    <p>No Drive files available.</p>
                `;

                return;

            }

            files.forEach(file => {

                const item =
                    document.createElement("div");

                item.className = "drive-file";

                if (
                    typeof file.mimeType === "string" &&
                    file.mimeType.startsWith("image/")
                ) {

                    const image =
                        document.createElement("img");

                    image.src =
                        file.thumbnailLink || file.webViewLink || "";

                    image.alt = file.name || "Drive image";

                    image.loading = "lazy";

                    const name =
                        document.createElement("p");

                    name.textContent =
                        file.name || "Unnamed image";

                    item.appendChild(image);

                    item.appendChild(name);

                } else {

                    const name =
                        document.createElement("p");

                    name.textContent =
                        file.name || "Unnamed file";

                    item.appendChild(name);

                    if (file.webViewLink) {

                        const link =
                            document.createElement("a");

                        link.href = file.webViewLink;

                        link.target = "_blank";

                        link.rel = "noopener noreferrer";

                        link.textContent = "Open Document";

                        item.appendChild(link);

                    }

                }

                container.appendChild(item);

            });

        } catch (error) {

            console.error(
                "Team Unity: Failed to load Drive files:",
                error
            );

        }

    }

    // =====================================================
    // INITIALIZE DOM ELEMENTS
    // =====================================================

    function initializeElements() {

        projectsGrid =
            document.getElementById("projectsGrid");

        projectGallery =
            document.getElementById("projectGallery");

        galleryGrid =
            document.getElementById("galleryGrid");

        galleryTitle =
            document.getElementById("galleryTitle");

        closeGallery =
            document.getElementById("closeGallery");

        imageSliderModal =
            document.getElementById("imageSliderModal");

        sliderImage =
            document.getElementById("sliderImage");

        sliderCounter =
            document.getElementById("sliderCounter");

        prevSliderBtn =
            document.getElementById("prevSliderBtn");

        nextSliderBtn =
            document.getElementById("nextSliderBtn");

        closeSlider =
            document.getElementById("closeSlider");

    }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    function initialize() {

        initializeElements();

        createProjectCards();

        attachProjectEvents();

        attachPhotoCardListeners();

        attachGalleryCloseEvents();

        attachSliderEvents();

        attachKeyboardEvents();

        updateCopyrightYear();

        loadDriveFiles();

        openProjectFromURL();

        console.log(
            "Team Unity: Projects system initialized successfully."
        );

    }

    // =====================================================
    // START APPLICATION
    // =====================================================

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );

    } else {

        initialize();

    }

})();
