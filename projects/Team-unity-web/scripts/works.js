/* =========================================================
   TEAM UNITY — WORKS PORTFOLIO
   Single unified JavaScript controller
   Handles year selection and rendering
========================================================= */

class WorksPortfolio {
  constructor() {
    this.currentYear = "202x";
    this.allYears = [2026, 2025, 2024, 2023, 2022];
    this.eventCounts = {
      2026: 0,
      2025: 0,
      2024: 0,
      2023: 10,
      2022: 0
    };
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadYear(this.currentYear);
  }

  setupEventListeners() {
    // Year selector buttons (in main section)
    document.querySelectorAll('.year-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const year = parseInt(e.target.dataset.year);
        this.switchYear(year);
      });
    });

    // Year links (in footer)
    document.querySelectorAll('.year-link').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const year = parseInt(e.target.dataset.year);
        this.switchYear(year);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Mobile menu toggle
    this.setupMobileMenu();
  }
  
  switchYear(year) {
    // Update active button
    document.querySelectorAll('.year-btn').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });

    const activeBtn = document.querySelector(`[data-year="${year}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.setAttribute('aria-selected', 'true');
    }

    // Load and render year content
    this.currentYear = year;
    this.updateRecord(year);
    this.loadYear(year);
  }

  updateRecord(year) {
    const record = document.getElementById('record');
    const eventCount = document.getElementById('eventCount');
    
    if (record) {
      record.textContent = `RECORDS · ${year}`;
    }
  
    if (eventCount) {
      eventCount.textContent = this.eventCounts[year] ?? 0;
    }
  }

  loadYear(year) {
    // Check if data is available globally
    const dataKey = `worksData${year}`;
    
    if (window[dataKey]) {
      this.renderWorks(window[dataKey]);
    } else {
      console.warn(`No data found for year ${year}`);
      this.showEmpty();
    }
  }

  renderWorks(works) {
    const grid = document.getElementById('worksGrid');
    const emptyState = document.getElementById('emptyState');

    if (!works || works.length === 0) {
      this.showEmpty();
      return;
    }

    // Clear grid
    grid.innerHTML = '';
    emptyState.style.display = 'none';

    // Render each work
    works.forEach(work => {
      const card = this.createWorkCard(work);
      grid.appendChild(card);
    });

    // Trigger animation
    grid.style.animation = 'none';
    setTimeout(() => {
      grid.style.animation = 'fadeIn 0.6s ease-out';
    }, 10);
  }
    

  createWorkCard(work) {
    const card = document.createElement("article");
    card.className = "work-card";

    // Tags
    let tagsHTML = "";

    if (work.tags && work.tags.length > 0) {
      tagsHTML = `
        <div class="work-card-meta">
          ${work.tags.map(tag =>
            `<span class="work-tag">${tag}</span>`
          ).join("")}
        </div>
      `;
    }

    // Explore More link - navigates to projects.html with search parameter
    let linkHTML = "";

if (work.search) {
  linkHTML = `
    <a
      href="projects.html?projectSearch=${encodeURIComponent(work.search)}"
      class="work-card-link"
    >
      Explore More <span>→</span>
    </a>
  `;
}

    card.innerHTML = `
      <div class="work-card-content">
        <h3>${work.title}</h3>

        ${tagsHTML}

        <p>
          <strong>Date:</strong>
          ${(work.date || "").replace(/^Date:\s*/, "")}
        </p>

        <p>
          <strong>Description:</strong>
          ${(work.description || "").replace(/^Description:\s*/, "")}
        </p>

        ${linkHTML}
      </div>
    `;

  return card;
}



  showEmpty() {
    const grid = document.getElementById('worksGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = '';
    emptyState.style.display = 'block';
  }

  setupMobileMenu() {
    // Mobile menu setup if needed
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WorksPortfolio();
});