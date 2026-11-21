
/* =========================================================
   TEAM UNITY — WORKS PORTFOLIO
   Year Selection + Selected Work Details + Image Slider
========================================================= */

class WorksPortfolio {

  constructor() {
    this.currentYear = "202x";

    this.eventCounts = {
      2026: 2,
      2025: 0,
      2024: 0,
      2023: 10,
      2022: 0
    };

    this.selectedWork = null;
    this.currentImages = [];
    this.currentImageIndex = 0;

    this.init();
  }

  init() {
    this.createDetailView();
    this.createImageSlider();
    this.setupEventListeners();
    this.loadYear(this.currentYear);
  }

  // =======================================================
  // CREATE DETAIL CONTAINER
  // =======================================================

  createDetailView() {

    this.detailView = document.createElement("section");
    this.detailView.id = "selectedWork";
    this.detailView.className = "selected-work";
    this.detailView.hidden = true;

    document.getElementById("worksGrid")
      .insertAdjacentElement("afterend", this.detailView);

  }

  // =======================================================
  // CREATE IMAGE SLIDER
  // =======================================================

  createImageSlider() {

    this.slider = document.createElement("div");

    this.slider.className = "works-image-slider";
    this.slider.setAttribute("aria-hidden", "true");

    this.slider.innerHTML = `
      <div class="works-slider-container">

        <button class="works-slider-close"
          type="button" aria-label="Close image">
          &times;
        </button>

        <button class="works-slider-prev"
          type="button" aria-label="Previous image">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <img class="works-slider-image" src="" alt="">

        <button class="works-slider-next"
          type="button" aria-label="Next image">
          <i class="fa-solid fa-chevron-right"></i>
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

    this.slider.addEventListener("click", (e) => {
      if (e.target === this.slider) this.closeSlider();
    });

  }

  // =======================================================
  // EVENT LISTENERS
  // =======================================================

  setupEventListeners() {

    document.querySelectorAll(".year-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchYear(Number(btn.dataset.year));
      });
    });

    document.querySelectorAll(".year-link").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchYear(Number(btn.dataset.year));
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // Event delegation for Explore buttons
    document.getElementById("worksGrid")
      .addEventListener("click", (e) => {

        const button = e.target.closest(".work-card-link");

        if (!button) return;

        e.preventDefault();

        this.openSelectedWork(button.dataset.search);

      });

    // Back button
    this.detailView.addEventListener("click", (e) => {

      if (e.target.closest("#backToWorks")) {
        this.backToWorks();
      }

      const photo = e.target.closest(".selected-work-photo");

      if (photo) {
        this.openSlider(Number(photo.dataset.index));
      }

    });

    // Keyboard controls
    document.addEventListener("keydown", (e) => {

      if (!this.slider.classList.contains("active")) return;

      if (e.key === "Escape") this.closeSlider();
      if (e.key === "ArrowLeft") this.changeImage(-1);
      if (e.key === "ArrowRight") this.changeImage(1);

    });

    this.setupMobileMenu();

  }

  // =======================================================
  // YEAR SELECTION
  // =======================================================

  switchYear(year) {

    document.querySelectorAll(".year-btn").forEach(btn => {

      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");

    });

    const activeBtn = document.querySelector(
      `.year-btn[data-year="${year}"]`
    );

    if (activeBtn) {
      activeBtn.classList.add("active");
      activeBtn.setAttribute("aria-selected", "true");
    }

    this.currentYear = year;

    this.backToWorks();
    this.updateRecord(year);
    this.loadYear(year);

  }

  updateRecord(year) {

    const record = document.getElementById("record");
    const eventCount = document.getElementById("eventCount");

    if (record) record.textContent = `RECORDS · ${year}`;

    if (eventCount) {
      eventCount.textContent = this.eventCounts[year] ?? 0;
    }

  }

  // =======================================================
  // LOAD YEAR DATA
  // =======================================================

  loadYear(year) {

    const dataKey = `worksData${year}`;
    const works = window[dataKey];

    if (works) {
      this.renderWorks(works);
    } else {
      this.showEmpty();
    }

  }

  // =======================================================
  // RENDER WORK CARDS
  // =======================================================

  renderWorks(works) {

    const grid = document.getElementById("worksGrid");
    const emptyState = document.getElementById("emptyState");

    if (!works || works.length === 0) {
      this.showEmpty();
      return;
    }

    grid.innerHTML = "";
    emptyState.style.display = "none";

    works.forEach(work => {

      const card = this.createWorkCard(work);
      grid.appendChild(card);

    });

    grid.style.animation = "none";

    setTimeout(() => {
      grid.style.animation = "fadeIn 0.6s ease-out";
    }, 10);

  }

  // =======================================================
  // CREATE WORK CARD
  // =======================================================

  createWorkCard(work) {

    const card = document.createElement("article");
    card.className = "work-card";

    const tagsHTML = (work.tags || []).map(tag => `
      <span class="work-tag">${this.escapeHTML(tag)}</span>
    `).join("");

    card.innerHTML = `

      <div class="work-card-content">

        <h3>${this.escapeHTML(work.title)}</h3>

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

  // =======================================================
  // OPEN SELECTED WORK
  // =======================================================

  

openSelectedWork(mappingTag) {

    const event = projectDatas.find(
        item => String(item.mappingtag) === String(mappingTag)
    );

    const worksData = window[`worksData${this.currentYear}`] || [];

    const work = worksData.find(
        item => String(item.search) === String(mappingTag)
    );

    if (!event) {
        console.error("Event not found:", mappingTag);
        return;
    }

    // Create iframe popup only once
    let modal = document.getElementById("eventIframeModal");

    if (!modal) {

        modal = document.createElement("div");
        modal.id = "eventIframeModal";
        modal.className = "event-iframe-modal";

        modal.innerHTML = `
            <div class="event-iframe-backdrop"></div>

            <div class="event-iframe-container">

                <button
                    class="event-iframe-close"
                    type="button"
                    aria-label="Close event details"
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

        document.body.appendChild(modal);

        // Close button
        modal.querySelector(".event-iframe-close")
            .addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.backToWorks();
            });

        // Close when clicking outside popup
        modal.querySelector(".event-iframe-backdrop")
            .addEventListener("click", () => {
                this.backToWorks();
            });
    }

    // Load selected event
    const params = new URLSearchParams({
        mappingtag: mappingTag,
        title: work?.title || "Team Unity Event"
    });

    const iframe = modal.querySelector("#eventDetailsFrame");

    iframe.src = `event-details.html?${params.toString()}`;

    // Display popup
    modal.classList.add("active");

    document.body.classList.add("event-modal-open");
    document.body.style.overflow = "hidden";

}


// Close the iframe popup

backToWorks() {

    // Close iframe popup
    const modal = document.getElementById("eventIframeModal");

    if (modal) {

        modal.classList.remove("active");

        const iframe = modal.querySelector("iframe");

        if (iframe) {
            iframe.src = "about:blank";
        }
    }

    // Close image slider if open
    this.closeSlider();

    // Restore page scrolling
    document.body.classList.remove("event-modal-open");
    document.body.style.overflow = "";

    // Reset selected work
    this.selectedWork = null;

}


  // =======================================================
  // RENDER SELECTED WORK DETAILS
  // =======================================================

  renderSelectedWork(work, event) {

    const images = [
      event.image,
      ...(event.imageSlider || [])
    ].filter(Boolean);

    const tagsHTML = (work.tags || []).map(tag => `
      <span class="work-tag">${this.escapeHTML(tag)}</span>
    `).join("");

    const galleryHTML = images.map((image, index) => `
      <button
        type="button"
        class="selected-work-photo"
        data-index="${index}"
        aria-label="View event photograph ${index + 1}"
      >
        <img
          src="${this.escapeHTML(image)}"
          alt="${this.escapeHTML(work.title)} - Photo ${index + 1}"
          loading="lazy"
        >
        <span class="selected-photo-overlay">
          <i class="fa-solid fa-expand"></i>
        </span>
      </button>
    `).join("");

    this.detailView.innerHTML = `

      <button
        type="button"
        class="selected-work-back"
        id="backToWorks"
      >
        <i class="fa-solid fa-arrow-left"></i>
        Back to Our Works
      </button>

      <div class="selected-work-header">

        <div class="year-label">TEAM UNITY · OUR WORKS</div>

        <h2>${this.escapeHTML(work.title)}</h2>

        <div class="work-card-meta">
          ${tagsHTML}
        </div>

      </div>

      <div class="selected-work-information">

        <div class="selected-work-main-image">
          <img
            src="${this.escapeHTML(event.image)}"
            alt="${this.escapeHTML(work.title)}"
          >
        </div>

        <div class="selected-work-description">

          <div class="selected-info-item">
            <span>DATE</span>
            <p>${this.escapeHTML(
              (event.date || "").replace(/^Date:\s*/, "")
            )}</p>
          </div>

          <div class="selected-info-item">
            <span>VENUE</span>
            <p>${this.escapeHTML(event.venue || "Not specified")}</p>
          </div>

          <div class="selected-info-item">
            <span>ABOUT THE EVENT</span>
            <p>${this.escapeHTML(event.description || "")}</p>
          </div>

        </div>

      </div>

      <div class="selected-work-gallery">

        <div class="selected-gallery-heading">
          <div>
            <span class="year-label">EVENT MOMENTS</span>
            <h3>Photo Gallery</h3>
          </div>

          <span>${images.length} PHOTOS</span>
        </div>

        <div class="selected-gallery-grid">
          ${galleryHTML}
        </div>

      </div>

    `;

    this.currentImages = images;

  }

  // =======================================================
  // BACK TO WORKS
  // =======================================================

  backToWorks() {

    if (this.detailView) {
      this.detailView.hidden = true;
    }

    const grid = document.getElementById("worksGrid");

    if (grid) grid.hidden = false;

    this.closeSlider();

    this.selectedWork = null;

  }

  // =======================================================
  // IMAGE SLIDER
  // =======================================================

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

    document.body.style.overflow = "";

    this.sliderImage.src = "";

  }

  // =======================================================
  // EMPTY STATE
  // =======================================================

  showEmpty() {

    document.getElementById("worksGrid").innerHTML = "";

    document.getElementById("emptyState").style.display = "flex";

  }

  // =======================================================
  // MOBILE MENU
  // =======================================================

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

  // =======================================================
  // HTML ESCAPING
  // =======================================================

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



document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        const modal = document.getElementById("eventIframeModal");
        const slider = document.querySelector(".works-image-slider");

        // Close image slider first if it is open
        if (slider?.classList.contains("active")) {
            window.worksPortfolio?.closeSlider();
            return;
        }

        // Otherwise close event popup
        if (modal?.classList.contains("active")) {
            window.worksPortfolio?.backToWorks();
        }

    }

});

