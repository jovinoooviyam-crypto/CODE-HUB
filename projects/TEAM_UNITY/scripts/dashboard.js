/* =========================================================
   TEAM UNITY - DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const userName =
            document.getElementById(
                "userName"
            );

        const userRole =
            document.getElementById(
                "userRole"
            );

        const userEmail =
            document.getElementById(
                "userEmail"
            );

        const userDob =
            document.getElementById(
                "userDob"
            );

        const userProfession =
            document.getElementById(
                "userProfession"
            );

        const profilePicture =
            document.getElementById(
                "profilePicture"
            );

        const logoutBtn =
            document.getElementById(
                "logoutBtn"
            );


        // ======================================
        // CHECK LOGIN
        // ======================================

        const loggedIn =
            localStorage.getItem(
                "teamUnityLoggedIn"
            );


        const storedUser =
            localStorage.getItem(
                "currentUser"
            );


        if (
            loggedIn !== "true" ||
            !storedUser
        ) {

            userName.textContent =
                "Not logged in";

            userRole.textContent =
                "";

            userEmail.textContent =
                "";

            userDob.textContent =
                "";

            userProfession.textContent =
                "";

            return;
        }


        // ======================================
        // READ USER DATA
        // ======================================

        let user;


        try {

            user =
                JSON.parse(
                    storedUser
                );

        } catch (error) {

            console.error(
                "TEAM UNITY: Invalid user data:",
                error
            );

            userName.textContent =
                "Unable to load profile.";

            return;
        }


        console.log(
            "TEAM UNITY: Dashboard user:",
            user
        );


        // ======================================
        // DISPLAY USER
        // ======================================

        userName.textContent =
            user.name ||
            "";


        userRole.textContent =
            user.role ||
            "";


        userEmail.textContent =
            user.email ||
            "";


        userDob.textContent =
            user.dob ||
            "Not provided";


        userProfession.textContent =
            user.profession ||
            "Not provided";



        // ======================================
        // PROFILE PICTURE
        // ======================================

        const isTrainer =
            String(user.role || "").toLowerCase() === "trainer";

        const defaultPicture = isTrainer
            ? "src/trainer_dashboard_pfl.png"
            : "src/artist_dashboard_pfl.png";

        // Support both property names.
        const savedPicture =
            user.profile_picture || user.profilePicture || "";

        // Use the saved picture when available.
        // Otherwise, use the default for this account type.
        profilePicture.referrerPolicy = "no-referrer";
        profilePicture.onerror = function () {
            console.error(
                "TEAM UNITY: Profile picture failed to load:",
                profilePicture.src
            );

            // If the saved picture fails, try the default.
            if (profilePicture.dataset.usingDefault !== "true") {
                profilePicture.dataset.usingDefault = "true";
                profilePicture.src = defaultPicture;
            } else {
                profilePicture.onerror = null;
            }
        };

        if (savedPicture) {
            profilePicture.dataset.usingDefault = "false";
            profilePicture.src = savedPicture;
        } else {
            profilePicture.dataset.usingDefault = "true";
            profilePicture.src = defaultPicture;
        }

            

        // ======================================
        // LOGOUT
        // ======================================

        logoutBtn.addEventListener(
            "click",
            () => {

                localStorage.removeItem(
                    "teamUnityLoggedIn"
                );

                localStorage.removeItem(
                    "currentUser"
                );


                // Because dashboard is inside
                // the iframe, this changes only
                // the iframe back to login.

                window.location.href =
                    "login.html";

            }
        );

    }
);