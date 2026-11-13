
// ==================================
// CODE HUB | MAIN JAVASCRIPT
// ==================================


// ELEMENTS

const container = document.getElementById("projectContainer");
const counter = document.getElementById("projectCount");
const search = document.getElementById("projectSearch");
const emptyState = document.getElementById("emptyState");
const themeToggle = document.getElementById("themeToggle");


// ==================================
// PROJECT COUNTER
// ==================================

function getProjects() {

    return [...container.querySelectorAll(".projects")];

}


function updateCount() {

    const total = getProjects().length;

    counter.textContent = String(total).padStart(2, "0");

}


// ==================================
// PROJECT SEARCH
// ==================================

function filterProjects() {

    const value = search.value.toLowerCase().trim();

    let visible = 0;

    getProjects().forEach(project => {

        const name =
            project.dataset.name || project.textContent;

        const matches = name.toLowerCase().includes(value);

        project.style.display = matches ? "flex" : "none";

        if (matches) {

            visible++;

        }

    });


    emptyState.style.display =
        visible === 0 ? "block" : "none";

}


search.addEventListener("input", filterProjects);


// ==================================
// THEME CONTROLLER
// ==================================

function applyTheme(theme) {

    const selectedTheme =
        theme === "light" ? "light" : "dark";

    document.documentElement.setAttribute(
        "data-theme",
        selectedTheme
    );

    localStorage.setItem(
        "codehub-theme",
        selectedTheme
    );

    themeToggle.setAttribute(
        "aria-label",
        selectedTheme === "light"
            ? "Switch to dark mode"
            : "Switch to light mode"
    );

}


// ==================================
// THEME TOGGLE CLICK
// ==================================

themeToggle.addEventListener("click", () => {

    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    const newTheme =
        currentTheme === "light" ? "dark" : "light";

    applyTheme(newTheme);

});


// ==================================
// INITIALIZE
// ==================================

updateCount();


// ==================================
// OPTIONAL: DETECT NEW PROJECTS
// ==================================

const observer = new MutationObserver(() => {

    updateCount();

    filterProjects();

});

observer.observe(container, {

    childList: true

});
