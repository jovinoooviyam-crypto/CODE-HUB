(function () {

  const overlay  = document.getElementById("collabOverlay");
  const frame    = document.getElementById("collabFrame");
  const closeBtn = document.getElementById("closeCollab");
  const openers  = document.querySelectorAll("[data-collaborator]");

  if (!overlay || !frame || !closeBtn || !openers.length) {
    console.error("TEAM UNITY: Collaborator popup elements not found.");
    return;
  }

  function openPopup(event) {
    event.preventDefault();

    // Load the iframe only the first time it is opened
    if (!frame.getAttribute("src")) {
      frame.src = "collaborator.html";
    }

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePopup() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openers.forEach((btn) => btn.addEventListener("click", openPopup));

  closeBtn.addEventListener("click", closePopup);

  // Click outside the popup to close
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closePopup();
  });

  // Escape key to close
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("active")) {
      closePopup();
    }
  });

})();
