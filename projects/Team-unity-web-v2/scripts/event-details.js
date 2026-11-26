
document.addEventListener("DOMContentLoaded", () => {

    const titleElement = document.getElementById("eventTitle");
    const descriptionElement = document.getElementById("eventDescription");

    titleElement.textContent = "Checking event data...";

    const params = new URLSearchParams(window.location.search);
    const mappingTag = params.get("mappingtag");
    const title = params.get("title") || "Team Unity Event";

    console.log("Event Details script started");
    console.log("URL:", window.location.href);
    console.log("Mapping tag:", mappingTag);
    console.log("Project data:", window.projectDatas);

    if (!Array.isArray(window.projectDatas)) {
        titleElement.textContent = "Project data not loaded";
        descriptionElement.textContent =
            "The project-data file did not create window.projectDatas. Check the script path and browser console.";
        return;
    }

    const event = window.projectDatas.find(item =>
        String(item.mappingtag || "").trim().toLowerCase() ===
        String(mappingTag || "").trim().toLowerCase()
    );

    if (!event) {
        titleElement.textContent = "Event not found";
        descriptionElement.textContent =
            "No event matches mappingtag: " + mappingTag;

        console.error(
            "Available mappingtags:",
            window.projectDatas.map(item => item.mappingtag)
        );
        return;
    }

    document.title = `${title} | Team Unity`;
    titleElement.textContent = title;

    document.getElementById("eventDate").textContent =
        event.date || "Date not available";

    document.getElementById("eventVenue").textContent =
        event.venue || "Venue not available";

    descriptionElement.textContent =
        event.description || "Event description unavailable.";

    const images = [
        event.image,
        ...(Array.isArray(event.imageSlider) ? event.imageSlider : [])
    ].filter(Boolean).map(item =>
        typeof item === "string"
            ? item
            : item.url || item.src || item.image || ""
    ).filter(Boolean);

    const gallery = document.getElementById("eventGallery");

    if (!images.length) {
        gallery.textContent = "No event photographs available.";
        return;
    }

    let currentImage = 0;

    images.forEach((src, index) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = `Event photograph ${index + 1}`;
        img.loading = "lazy";

        img.addEventListener("click", () => openLightbox(index));
        gallery.appendChild(img);
    });

    const lightbox = document.getElementById("eventLightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const counter = document.getElementById("lightboxCounter");

    function openLightbox(index) {
        currentImage = index;
        updateLightbox();
        lightbox.classList.add("active");
    }

    function updateLightbox() {
        lightboxImage.src = images[currentImage];
        counter.textContent = `${currentImage + 1} / ${images.length}`;
    }

    function changeImage(direction) {
        currentImage = (currentImage + direction + images.length) % images.length;
        updateLightbox();
    }

    document.getElementById("lightboxPrev")
        .addEventListener("click", () => changeImage(-1));

    document.getElementById("lightboxNext")
        .addEventListener("click", () => changeImage(1));

    document.getElementById("lightboxClose")
        .addEventListener("click", () => lightbox.classList.remove("active"));

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });

    document.addEventListener("keydown", event => {
        if (!lightbox.classList.contains("active")) return;
        if (event.key === "ArrowRight") changeImage(1);
        if (event.key === "ArrowLeft") changeImage(-1);
        if (event.key === "Escape") lightbox.classList.remove("active");
    });

});
