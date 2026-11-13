
document.addEventListener("DOMContentLoaded", () => {
    /*
     * If the user is already logged in, the Trainer button
     * should take them to their existing dashboard.
     */
    document.addEventListener("click", event => {
        const trainerButton = event.target.closest("[data-trainer]");

        if (!trainerButton) return;

        const loggedIn =
            localStorage.getItem("teamUnityLoggedIn") === "true";

        const storedUser = localStorage.getItem("currentUser");

        if (loggedIn && storedUser) {
            try {
                JSON.parse(storedUser);

                event.preventDefault();
                event.stopImmediatePropagation();

                const loginButton = document.querySelector("[data-login]");

                if (loginButton) {
                    loginButton.click();
                }
            } catch (error) {
                console.error("Invalid stored user:", error);
                localStorage.removeItem("teamUnityLoggedIn");
                localStorage.removeItem("currentUser");
            }
        }

    }, true);

    /*
     * The trainer form runs inside trainerFrame.
     * If its email already exists, close the trainer popup
     * and open the existing login popup.
     */
    window.addEventListener("message", event => {
        if (event.origin !== window.location.origin) return;

        if (
            event.data?.type === "TEAM_UNITY_ACCOUNT_EXISTS"
        ) {
            const closeTrainer = document.getElementById("closeTrainer");

            if (closeTrainer) {
                closeTrainer.click();
            }

            const loginButton = document.querySelector("[data-login]");

            if (loginButton) {
                loginButton.click();
            }
        }
    });
});
