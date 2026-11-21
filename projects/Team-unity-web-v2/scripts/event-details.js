
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);

    const mappingTag = params.get("mappingtag");
    const title = params.get("title") || "Team Unity Event";

    const event = projectDatas.find(
        item => String(item.mappingtag) === String(mappingTag)
    );

    if (!event) {
        document.getElementById("eventTitle").textContent =
            "Event not found";

        document.getElementById("eventDescription").textContent =
            "We couldn't find the selected event.";

        return;
    }

    // Event information
    document.title = `${title} | Team Unity`;

    document.getElementById("eventTitle").textContent = title;
    document.getElementById("eventDate").textContent =
        event.date || "Date not available";

    document.getElementById("eventVenue").textContent =
        event.venue || "Venue not available";

    document.getElementById("eventDescription").textContent =
        event.description || "Event description unavailable.";

    // Prepare gallery
    const images = [
        event.image,
        ...(Array.isArray(event.imageSlider) ? event.imageSlider : [])
    ].filter(Boolean).map(item => {
        if (typeof item === "string") return item;
        return item.url || item.src || item.image || "";
    }).filter(Boolean);

    const gallery = document.getElementById("eventGallery");

    if (images.length === 0) {
        gallery.textContent = "No event photographs available.";
        return;
    }

    let currentImage = 0;

    images.forEach((src, index) => {
        const img = document.createElement("img");

        img.src = src;
        img.alt = `Event photograph ${index + 1}`;
        img.loading = "lazy";

        img.addEventListener("click", () => {
            openLightbox(index);
        });

        gallery.appendChild(img);
    });

    // Image slider
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

        counter.textContent =
            `${currentImage + 1} / ${images.length}`;
    }

    function changeImage(direction) {
        currentImage =
            (currentImage + direction + images.length) % images.length;

        updateLightbox();
    }

    document.getElementById("lightboxPrev")
        .addEventListener("click", () => changeImage(-1));

    document.getElementById("lightboxNext")
        .addEventListener("click", () => changeImage(1));

    document.getElementById("lightboxClose")
        .addEventListener("click", () => {
            lightbox.classList.remove("active");
        });

    lightbox.addEventListener("click", event => {
        if (event.target === lightbox) {
            lightbox.classList.remove("active");
        }
    });

    document.addEventListener("keydown", event => {
        if (!lightbox.classList.contains("active")) return;

        if (event.key === "ArrowRight") changeImage(1);
        if (event.key === "ArrowLeft") changeImage(-1);

        if (event.key === "Escape") {
            lightbox.classList.remove("active");
        }
    });

});
