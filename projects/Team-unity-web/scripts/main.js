document.addEventListener("DOMContentLoaded", () => {

    console.log("TEAM UNITY: Main JS loaded.");

    // ==========================================
    // MOBILE MENU
    // ==========================================

    const menuBtn =
        document.getElementById("menuBtn");

    const mobileNav =
        document.getElementById("mobileNav");


    if (menuBtn && mobileNav) {

        menuBtn.addEventListener("click", () => {

            mobileNav.classList.toggle("active");

            const isOpen =
                mobileNav.classList.contains("active");

            menuBtn.setAttribute(
                "aria-expanded",
                isOpen ? "true" : "false"
            );

        });


        const mobileLinks =
            mobileNav.querySelectorAll("a");

        mobileLinks.forEach((link) => {

            link.addEventListener("click", () => {

                mobileNav.classList.remove("active");

                menuBtn.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });
    }


    // ==========================================
    // HERO SLIDER
    // ==========================================

    const heroSlides =
        document.getElementById("heroSlides");

    const prevSlide =
        document.getElementById("prevSlide");

    const nextSlide =
        document.getElementById("nextSlide");

    const dotsContainer =
        document.getElementById("dots");


    if (heroSlides) {

        /*
         * IMPORTANT:
         * Your HTML uses "hero-slide",
         * NOT "slide".
         */
        const slides =
            heroSlides.querySelectorAll(
                ".hero-slide"
            );


        let currentSlide = 0;

        let slideInterval = null;


        console.log(
            "TEAM UNITY: Hero slides found:",
            slides.length
        );


        // ======================================
        // SHOW SLIDE
        // ======================================

        function showSlide(index) {

            if (!slides.length) {

                console.error(
                    "TEAM UNITY: No hero slides found."
                );

                return;
            }


            // Loop to first slide

            if (index >= slides.length) {

                currentSlide = 0;

            }

            // Loop to last slide

            else if (index < 0) {

                currentSlide =
                    slides.length - 1;

            }

            // Normal slide

            else {

                currentSlide = index;
            }


            // ----------------------------------
            // UPDATE SLIDES
            // ----------------------------------

            slides.forEach(
                (slide, i) => {

                    slide.classList.remove(
                        "active"
                    );


                    if (
                        i === currentSlide
                    ) {

                        slide.classList.add(
                            "active"
                        );
                    }

                }
            );


            // ----------------------------------
            // UPDATE DOTS
            // ----------------------------------

            if (dotsContainer) {

                const dots =
                    dotsContainer.querySelectorAll(
                        ".dot"
                    );


                dots.forEach(
                    (dot, i) => {

                        dot.classList.remove(
                            "active"
                        );


                        if (
                            i === currentSlide
                        ) {

                            dot.classList.add(
                                "active"
                            );
                        }

                    }
                );
            }


            console.log(
                "TEAM UNITY: Showing slide:",
                currentSlide + 1
            );
        }


        // ======================================
        // NEXT SLIDE
        // ======================================

        function nextHeroSlide() {

            showSlide(
                currentSlide + 1
            );
        }


        // ======================================
        // PREVIOUS SLIDE
        // ======================================

        function previousHeroSlide() {

            showSlide(
                currentSlide - 1
            );
        }


        // ======================================
        // START AUTOMATIC SLIDER
        // ======================================

        function startSlider() {

            // Stop if there is only one slide

            if (slides.length <= 1) {

                return;
            }


            // Clear existing timer

            clearInterval(
                slideInterval
            );


            /*
             * Change slide every 5 seconds.
             */

            slideInterval =
                setInterval(
                    () => {

                        nextHeroSlide();

                    },
                    5000
                );


            console.log(
                "TEAM UNITY: Automatic slider started."
            );
        }


        // ======================================
        // RESTART TIMER
        // ======================================

        function restartSlider() {

            clearInterval(
                slideInterval
            );


            startSlider();
        }


        // ======================================
        // NEXT BUTTON
        // ======================================

        if (nextSlide) {

            nextSlide.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    console.log(
                        "TEAM UNITY: Next button clicked."
                    );


                    nextHeroSlide();


                    restartSlider();

                }
            );

        } else {

            console.error(
                "TEAM UNITY: Next slide button not found."
            );
        }


        // ======================================
        // PREVIOUS BUTTON
        // ======================================

        if (prevSlide) {

            prevSlide.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    console.log(
                        "TEAM UNITY: Previous button clicked."
                    );


                    previousHeroSlide();


                    restartSlider();

                }
            );

        } else {

            console.error(
                "TEAM UNITY: Previous slide button not found."
            );
        }


        // ======================================
        // DOT BUTTONS
        // ======================================

        if (dotsContainer) {

            const existingDots =
                dotsContainer.querySelectorAll(
                    ".dot"
                );


            /*
             * Use the dots already present
             * in your index.html.
             *
             * We do NOT delete them.
             */

            existingDots.forEach(
                (dot, index) => {

                    dot.addEventListener(
                        "click",
                        (event) => {

                            event.preventDefault();


                            console.log(
                                "TEAM UNITY: Dot clicked:",
                                index + 1
                            );


                            showSlide(index);


                            restartSlider();

                        }
                    );

                }
            );


            console.log(
                "TEAM UNITY: Dots found:",
                existingDots.length
            );
        }


        // ======================================
        // INITIAL SLIDE
        // ======================================

        showSlide(0);


        // ======================================
        // START TIMER
        // ======================================

        startSlider();

    } else {

        console.error(
            "TEAM UNITY: #heroSlides not found."
        );
    }


    // ==========================================
// YEAR TABS
// ==========================================

const yearTabs =
    document.querySelectorAll(".year-tab");

if (yearTabs.length) {

    yearTabs.forEach((tab) => {

        tab.addEventListener("click", () => {

            const year =
                tab.dataset.year;

            yearTabs.forEach((item) => {
                item.classList.remove("active");
            });

            tab.classList.add("active");

            console.log(
                "TEAM UNITY: Selected year:",
                year
            );

        });

    });

}
    // ==========================================
    // LOGIN / PROFILE POPUP
    // ==========================================

    initLoginPopup();


    // ==========================================
    // TRAINER REGISTRATION POPUP
    // ==========================================

    initTrainerPopup();

});


// ==========================================
// LOGIN POPUP
// ==========================================

function initLoginPopup() {

// Any element with data-login will open
// the same reusable login iframe.

const loginButtons =
    document.querySelectorAll("[data-login]");


const loginOverlay =
    document.getElementById(
        "loginOverlay"
    );


const closeLogin =
    document.getElementById(
        "closeLogin"
    );


const loginFrame =
    document.getElementById(
        "loginFrame"
    );


if (
    !loginButtons.length ||
    !loginOverlay ||
    !closeLogin ||
    !loginFrame
) {

    console.error(
        "TEAM UNITY: Login popup elements not found."
    );

    return;
}


    // ==========================================
    // CHECK LOGIN STATUS
    // ==========================================

    function isLoggedIn() {

        return (

            localStorage.getItem(
                "teamUnityLoggedIn"
            ) === "true"

            &&

            localStorage.getItem(
                "currentUser"
            ) !== null

        );
    }


    // ==========================================
    // OPEN POPUP
    // ==========================================

    function openPopup() {

        console.log(
            "TEAM UNITY: Opening profile popup."
        );


        loginOverlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";


        if (isLoggedIn()) {

            console.log(
                "TEAM UNITY: User already logged in."
            );


            loginFrame.src =
                "dashboard.html";

        } else {

            console.log(
                "TEAM UNITY: User is not logged in."
            );


            loginFrame.src =
                "login.html";
        }
    }


    // ==========================================
    // CLOSE POPUP
    // ==========================================

    function closePopup() {

        console.log(
            "TEAM UNITY: Closing profile popup."
        );


        loginOverlay.classList.remove(
            "active"
        );


        document.body.style.overflow = "";

        /*
         * DO NOT reset loginFrame.src.
         *
         * Closing the popup must not log
         * the user out.
         */
    }


// ==========================================
// ALL LOGIN BUTTONS
// ==========================================

loginButtons.forEach((button) => {

    button.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            openPopup();

        }
    );

});

    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    closeLogin.addEventListener(
        "click",
        closePopup
    );


    // ==========================================
    // CLICK OUTSIDE POPUP
    // ==========================================

    loginOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                loginOverlay
            ) {

                closePopup();

            }

        }
    );


    // ==========================================
    // ESC KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                loginOverlay.classList.contains(
                    "active"
                )
            ) {

                closePopup();

            }

        }
    );


    // ==========================================
    // MESSAGES FROM LOGIN / DASHBOARD
    // ==========================================

    window.addEventListener(
        "message",
        (event) => {

            console.log(
                "TEAM UNITY: Message received:",
                event.data
            );


            // --------------------------------------
            // SECURITY CHECK
            // --------------------------------------

            if (
                event.origin !==
                window.location.origin
            ) {

                console.warn(
                    "TEAM UNITY: Message from unknown origin."
                );

                return;
            }


            // --------------------------------------
            // LOGOUT
            // --------------------------------------

            if (
                event.data &&
                event.data.type ===
                    "TEAM_UNITY_LOGOUT"
            ) {

                console.log(
                    "TEAM UNITY: Logout received."
                );


                loginFrame.src =
                    "login.html";


                return;
            }


            // --------------------------------------
            // LOGIN SUCCESS
            // --------------------------------------

            if (
                !event.data ||
                event.data.type !==
                    "TEAM_UNITY_AUTH_SUCCESS"
            ) {

                return;
            }


            console.log(
                "TEAM UNITY: Authentication successful."
            );


            const destination =
                event.data.destination ||
                "dashboard.html";


            // Keep popup open

            loginOverlay.classList.add(
                "active"
            );


            document.body.style.overflow =
                "hidden";


            // Load dashboard in same popup

            loginFrame.src =
                destination;


            console.log(
                "TEAM UNITY: Loading:",
                destination
            );

        }
    );
}


// ==========================================
// TRAINER REGISTRATION POPUP
// ==========================================

function initTrainerPopup() {

// Any element with data-trainer will open
// the reusable trainer registration iframe.

const trainerButtons =
    document.querySelectorAll("[data-trainer]");


const trainerOverlay =
    document.getElementById(
        "trainerOverlay"
    );


const closeTrainer =
    document.getElementById(
        "closeTrainer"
    );


const trainerFrame =
    document.getElementById(
        "trainerFrame"
    );


if (
    !trainerButtons.length ||
    !trainerOverlay ||
    !closeTrainer ||
    !trainerFrame
) {

    console.error(
        "TEAM UNITY: Trainer popup elements not found."
    );

    return;
}


    // ==========================================
    // OPEN POPUP
    // ==========================================

    function openTrainerPopup() {

        console.log(
            "TEAM UNITY: Opening trainer registration popup."
        );


        trainerOverlay.classList.add(
            "active"
        );


        document.body.style.overflow =
            "hidden";


        /*
         * Always start the trainer form fresh
         * each time it's opened.
         */

        trainerFrame.src =
            "trainer-registeration.html";
    }


    // ==========================================
    // CLOSE POPUP
    // ==========================================

    function closeTrainerPopup() {

        console.log(
            "TEAM UNITY: Closing trainer registration popup."
        );


        trainerOverlay.classList.remove(
            "active"
        );


        document.body.style.overflow = "";


        /*
         * Clear the iframe src on close so the
         * form fully resets next time it opens.
         */

        trainerFrame.src = "";
    }


// ==========================================
// ALL TRAINER BUTTONS
// ==========================================

trainerButtons.forEach((button) => {
    button.addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            event.stopPropagation();

            console.log(
                "TEAM UNITY: Trainer button clicked."
            );

            openTrainerPopup();
        }
    );
});


    // ==========================================
    // CLOSE BUTTON
    // ==========================================

    closeTrainer.addEventListener(
        "click",
        closeTrainerPopup
    );


    // ==========================================
    // CLICK OUTSIDE POPUP
    // ==========================================

    trainerOverlay.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                trainerOverlay
            ) {

                closeTrainerPopup();

            }

        }
    );


    // ==========================================
    // ESC KEY
    // ==========================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Escape" &&
                trainerOverlay.classList.contains(
                    "active"
                )
            ) {

                closeTrainerPopup();

            }

        }
    );


    // ==========================================
    // MESSAGES FROM TRAINER FORM
    // ==========================================

    window.addEventListener(
        "message",
        (event) => {

            // --------------------------------------
            // SECURITY CHECK
            // --------------------------------------

            if (
                event.origin !==
                window.location.origin
            ) {

                console.warn(
                    "TEAM UNITY: Trainer message from unknown origin."
                );

                return;
            }


            // --------------------------------------
            // TRAINER FORM SUBMITTED
            // --------------------------------------

            if (
                !event.data ||
                event.data.type !==
                    "TEAM_UNITY_TRAINER_SUBMITTED"
            ) {

                return;
            }


            console.log(
                "TEAM UNITY: Trainer registration submitted."
            );


            closeTrainerPopup();

        }
    );
        
    // ==========================================
    // TRAINER REGISTRATION SUCCESS
    // ==========================================

    window.addEventListener("message", (event) => {
        if (event.origin !== window.location.origin) {
            return;
        }

        if (
            !event.data ||
            event.data.type !== "TEAM_UNITY_TRAINER_AUTH_SUCCESS"
        ) {
            return;
        }

        console.log(
            "TEAM UNITY: Trainer registration successful. Opening dashboard."
        );

        closeTrainerPopup();

        window.location.href =
            event.data.destination || "dashboard.html";
    });
}
