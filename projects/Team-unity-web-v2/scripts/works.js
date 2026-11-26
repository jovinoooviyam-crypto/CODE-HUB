
/* =========================================================
   TEAM UNITY - WORKS PORTFOLIO
   Year Selection + Event Details Iframe Popup
========================================================= */

class WorksPortfolio {

    constructor() {
        this.selectedWork = null;
        this.currentImages = [];
        this.currentImageIndex = 0;

        this.init();
    }

    // =====================================================
    // INITIALIZATION
    // =====================================================

    init() {

        this.createDetailView();
        this.createImageSlider();
        this.createEventModal();

        this.setupEventListeners();
        this.loadAllWorks();
        
    }

    // =====================================================
    // OLD DETAIL CONTAINER
    // =====================================================

    createDetailView() {

        const grid = document.getElementById("worksGrid");

        if (!grid) return;

        this.detailView = document.createElement("section");

        this.detailView.id = "selectedWork";
        this.detailView.className = "selected-work";
        this.detailView.hidden = true;

        grid.insertAdjacentElement("afterend", this.detailView);

    }

    // =====================================================
    // CREATE IMAGE SLIDER
    // =====================================================

    createImageSlider() {

        this.slider = document.createElement("div");

        this.slider.className = "works-image-slider";
        this.slider.setAttribute("aria-hidden", "true");

        this.slider.innerHTML = `
            <div class="works-slider-container">

                <button class="works-slider-close"
                    type="button"
                    aria-label="Close image">
                    &times;
                </button>

                <button class="works-slider-prev"
                    type="button"
                    aria-label="Previous image">
                    ❮
                </button>

                <img class="works-slider-image" src="" alt="">

                <button class="works-slider-next"
                    type="button"
                    aria-label="Next image">
                    ❯
                </button>

                <div class="works-slider-counter">1 / 1</div>

            </div>
        `;

        document.body.appendChild(this.slider);

        this.sliderImage = this.slider.querySelector(
            ".works-slider-image"
        );

        this.slider.querySelector(".works-slider-close")
            .addEventListener("click", () => this.closeSlider());

        this.slider.querySelector(".works-slider-prev")
            .addEventListener("click", () => this.changeImage(-1));

        this.slider.querySelector(".works-slider-next")
            .addEventListener("click", () => this.changeImage(1));

        this.slider.addEventListener("click", (event) => {

            if (event.target === this.slider) {
                this.closeSlider();
            }

        });

    }

    // =====================================================
    // CREATE IFRAME POPUP
    // =====================================================

    createEventModal() {

        this.modal = document.createElement("div");

        this.modal.id = "eventIframeModal";
        this.modal.className = "event-iframe-modal";

        this.modal.innerHTML = `

            <div class="event-iframe-backdrop"></div>

            <div class="event-iframe-container">

                <button
                    class="event-iframe-close"
                    type="button"
                    aria-label="Close event details"
                    title="Close"
                >
                    &times;
                </button>

                <iframe
                    id="eventDetailsFrame"
                    title="Team Unity Event Details"
                    src="about:blank"
                ></iframe>

            </div>

        `;

        document.body.appendChild(this.modal);

        this.iframe = this.modal.querySelector(
            "#eventDetailsFrame"
        );

        // CLOSE BUTTON
        const closeButton = this.modal.querySelector(
            ".event-iframe-close"
        );

        closeButton.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();

            console.log("Event popup close button clicked");

            this.backToWorks();

        });

        // BACKDROP CLICK
        this.modal.querySelector(".event-iframe-backdrop")
            .addEventListener("click", () => {

                this.backToWorks();

            });

    }

    // =====================================================
    // EVENT LISTENERS
    // =====================================================

    setupEventListeners() {

        // Year buttons
        document.querySelectorAll(".year-btn").forEach(btn => {

            btn.addEventListener("click", () => {
            });

        });

        // Year navigation links
        document.querySelectorAll(".year-link").forEach(btn => {

            btn.addEventListener("click", () => {


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            });

        });

        // Explore More buttons
        const grid = document.getElementById("worksGrid");

        if (grid) {

            grid.addEventListener("click", (event) => {

                const button = event.target.closest(".work-card-link");

                if (!button) return;

                event.preventDefault();

                this.openSelectedWork(button.dataset.search);

            });

        }

        // Keyboard controls
        document.addEventListener("keydown", (event) => {

            // Close image slider first
            if (
                this.slider &&
                this.slider.classList.contains("active")
            ) {

                if (event.key === "Escape") {
                    this.closeSlider();
                }

                if (event.key === "ArrowLeft") {
                    this.changeImage(-1);
                }

                if (event.key === "ArrowRight") {
                    this.changeImage(1);
                }

                return;

            }

            // Close iframe popup
            if (
                this.modal &&
                this.modal.classList.contains("active") &&
                event.key === "Escape"
            ) {

                this.backToWorks();

            }

        });

        this.setupMobileMenu();

    }

    // =====================================================
    // LOAD YEAR DATA
    // =====================================================

    loadAllWorks() {

    const works = window.allWorksData || [];

    console.log("Total works loaded:", works.length);

    this.renderWorks(works);

}
    // =====================================================
    // RENDER WORK CARDS
    // =====================================================

    renderWorks(works) {

        const grid = document.getElementById("worksGrid");
        const emptyState = document.getElementById("emptyState");

        if (!grid) return;

        if (!works || works.length === 0) {

            this.showEmpty();
            return;

        }

        grid.innerHTML = "";

        if (emptyState) {
            emptyState.style.display = "none";
        }

        works.forEach(work => {

            const card = this.createWorkCard(work);

            grid.appendChild(card);

        });

        grid.style.animation = "none";

        setTimeout(() => {

            grid.style.animation = "fadeIn 0.6s ease-out";

        }, 10);

    }

    // =====================================================
    // CREATE WORK CARD
    // =====================================================

    createWorkCard(work) {

        const card = document.createElement("article");

        card.className = "work-card";

        const tagsHTML = (work.tags || []).map(tag => `

            <span class="work-tag">
                ${this.escapeHTML(tag)}
            </span>

        `).join("");

        card.innerHTML = `

            <div class="work-card-content">

                <h3>
                    ${this.escapeHTML(work.title)}
                </h3>

                <div class="work-card-meta">
                    ${tagsHTML}
                </div>

                <p>
                    <strong>Date:</strong>
                    ${this.escapeHTML(
                        (work.date || "").replace(/^Date:\s*/, "")
                    )}
                </p>

                <p>
                    <strong>Description:</strong>
                    ${this.escapeHTML(
                        (work.description || "").replace(/^Description:\s*/, "")
                    )}
                </p>

                ${work.search ? `

                    <button
                        type="button"
                        class="work-card-link"
                        data-search="${this.escapeHTML(work.search)}"
                    >
                        Explore More <span>→</span>
                    </button>

                ` : ""}

            </div>

        `;

        return card;

    }

    // =====================================================
    // OPEN SELECTED EVENT
    // =====================================================


/* =============================================
   OPEN SELECTED EVENT
============================================= */

openSelectedWork(mappingTag) {

    console.log("Explore More clicked:", mappingTag);

    // Find matching project/event using mappingtag
    const event = (window.projectDatas || []).find(item =>
        String(item.mappingtag).trim() === String(mappingTag).trim()
    );

    // Find matching Works record using search
    const work = (window.allWorksData || []).find(item =>
        String(item.search).trim() === String(mappingTag).trim()
    );

    // Stop if no matching event exists
    if (!event) {

        console.error(
            "Event not found for mapping ID:",
            mappingTag
        );

        return;
    }

    // Prepare iframe URL
    const params = new URLSearchParams({
        mappingtag: mappingTag,
        title: work?.title || "Team Unity Event"
    });

    // Load event details
    this.iframe.src =
        `event-details.html?${params.toString()}`;

    // Open popup
    this.modal.classList.add("active");

    document.body.classList.add("event-modal-open");

    document.body.style.overflow = "hidden";

    this.selectedWork = event;

    console.log("Matching event found:", event);
}


    // =====================================================
    // CLOSE EVENT POPUP
    // =====================================================

    backToWorks() {

        // Close iframe popup
        if (this.modal) {

            this.modal.classList.remove("active");

            // Stop iframe loading
            if (this.iframe) {

                this.iframe.src = "about:blank";

            }

        }

        // Close image slider
        this.closeSlider();

        // Restore page scrolling
        document.body.classList.remove("event-modal-open");

        document.body.style.overflow = "";

        // Reset selection
        this.selectedWork = null;

    }

    // =====================================================
    // OLD DETAIL RENDERER (NOT USED BY IFRAME)
    // =====================================================

    renderSelectedWork(work, event) {

        const images = [
            event.image,
            ...(event.imageSlider || [])
        ].filter(Boolean);

        const galleryHTML = images.map((image, index) => `

            <button
                type="button"
                class="selected-work-photo"
                data-index="${index}"
            >
                <img
                    src="${this.escapeHTML(image)}"
                    alt="Event photograph ${index + 1}"
                >
            </button>

        `).join("");

        this.detailView.innerHTML = `

            <button
                type="button"
                class="selected-work-back"
                id="backToWorks"
            >
                Back to Our Works
            </button>

            <h2>${this.escapeHTML(work.title)}</h2>

            <p>${this.escapeHTML(event.date || "")}</p>

            <p>${this.escapeHTML(event.venue || "")}</p>

            <p>${this.escapeHTML(event.description || "")}</p>

            <div class="selected-gallery-grid">
                ${galleryHTML}
            </div>

        `;

        this.currentImages = images;

    }

    // =====================================================
    // IMAGE SLIDER
    // =====================================================

    openSlider(index) {

        if (!this.currentImages.length) return;

        this.currentImageIndex = index;

        this.updateSlider();

        this.slider.classList.add("active");

        this.slider.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

    }

    updateSlider() {

        this.sliderImage.src =
            this.currentImages[this.currentImageIndex];

        this.sliderImage.alt =
            `Event photo ${this.currentImageIndex + 1}`;

        this.slider.querySelector(".works-slider-counter")
            .textContent =
            `${this.currentImageIndex + 1} / ${this.currentImages.length}`;

        this.slider.querySelector(".works-slider-prev").disabled =
            this.currentImageIndex === 0;

        this.slider.querySelector(".works-slider-next").disabled =
            this.currentImageIndex === this.currentImages.length - 1;

    }

    changeImage(direction) {

        const nextIndex = this.currentImageIndex + direction;

        if (
            nextIndex < 0 ||
            nextIndex >= this.currentImages.length
        ) return;

        this.currentImageIndex = nextIndex;

        this.updateSlider();

    }

    closeSlider() {

        if (!this.slider) return;

        this.slider.classList.remove("active");

        this.slider.setAttribute("aria-hidden", "true");

        this.sliderImage.src = "";

        // Keep scrolling locked if iframe popup remains open
        if (
            this.modal &&
            this.modal.classList.contains("active")
        ) {

            document.body.style.overflow = "hidden";

        } else {

            document.body.style.overflow = "";

        }

    }

    // =====================================================
    // EMPTY STATE
    // =====================================================

    showEmpty() {

        const grid = document.getElementById("worksGrid");

        const emptyState = document.getElementById("emptyState");

        if (grid) {
            grid.innerHTML = "";
        }

        if (emptyState) {
            emptyState.style.display = "flex";
        }

    }

    // =====================================================
    // MOBILE MENU
    // =====================================================

    setupMobileMenu() {

        const menuBtn = document.getElementById("menuBtn");

        const mobileNav = document.getElementById("mobileNav");

        if (!menuBtn || !mobileNav) return;

        menuBtn.addEventListener("click", () => {

            mobileNav.classList.toggle("active");

            menuBtn.setAttribute(
                "aria-expanded",
                mobileNav.classList.contains("active")
            );

        });

    }

    // =====================================================
    // HTML ESCAPING
    // =====================================================

    escapeHTML(value) {

        return String(value ?? "").replace(/[&<>"']/g, char => ({

            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"

        })[char]);

    }

}


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener("DOMContentLoaded", () => {

    window.worksPortfolio = new WorksPortfolio();

});

document.addEventListener("DOMContentLoaded", () => {

    const menuBtn = document.querySelector(".menu-btn");
    const mobileNav = document.querySelector(".mobile-nav");

    if (!menuBtn || !mobileNav) return;

    menuBtn.addEventListener("click", () => {
        mobileNav.classList.toggle("active");
    });

    // Close dropdown after clicking a navigation link
    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mobileNav.classList.remove("active");
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (event) => {
        if (
            !menuBtn.contains(event.target) &&
            !mobileNav.contains(event.target)
        ) {
            mobileNav.classList.remove("active");
        }
    });

});