document.addEventListener("DOMContentLoaded", () => {

    console.log(
        "TEAM UNITY: Login page loaded."
    );


    // ==========================================
    // NORMAL LOGIN
    // ==========================================

    const loginForm =
        document.getElementById("loginForm");


    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "email"
                    )?.value.trim();


                const password =
                    document.getElementById(
                        "password"
                    )?.value;


                const message =
                    document.getElementById(
                        "message"
                    );


                if (!email || !password) {

                    if (message) {
                        message.textContent =
                            "Please enter your email and password.";
                        message.style.color =
                            "red";
                    }

                    return;
                }


                try {

                    const response =
                        await fetch(
                            "/api/login",
                            {
                                method:
                                    "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify({
                                        email:
                                            email,

                                        password:
                                            password
                                    })
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        if (message) {

                            message.textContent =
                                data.message ||
                                "Login failed.";

                            message.style.color =
                                "red";
                        }

                        return;
                    }


                    if (!data.user) {

                        throw new Error(
                            "User information was not returned."
                        );
                    }


                    localStorage.setItem(
                        "teamUnityLoggedIn",
                        "true"
                    );


                    localStorage.setItem(
                        "currentUser",
                        JSON.stringify(
                            data.user
                        )
                    );


                    console.log(
                        "TEAM UNITY: Normal login successful:"
                    );

                    console.log(
                        data.user
                    );


                    if (message) {

                        message.textContent =
                            "Login successful!";

                        message.style.color =
                            "green";
                    }


                    setTimeout(
                        () => {

                            sendLoginSuccess();

                        },
                        300
                    );

                } catch (error) {

                    console.error(
                        "TEAM UNITY: LOGIN ERROR:",
                        error
                    );


                    if (message) {

                        message.textContent =
                            "Unable to connect to the server.";

                        message.style.color =
                            "red";
                    }
                }
            }
        );
    }


    // ==========================================
    // GOOGLE LOGIN
    // ==========================================

    window.handleGoogleLogin =
        handleGoogleLogin;

});


// ==========================================
// GOOGLE LOGIN FUNCTION
// ==========================================

async function handleGoogleLogin(response) {

    console.log(
        "TEAM UNITY: Google login response received."
    );


    if (
        !response ||
        !response.credential
    ) {

        console.error(
            "TEAM UNITY: Google credential missing."
        );

        return;
    }


    try {

        const parts =
            response.credential.split(".");


        if (
            parts.length !== 3
        ) {

            throw new Error(
                "Invalid Google credential."
            );
        }


        // --------------------------------------
        // READ GOOGLE EMAIL
        // --------------------------------------

        // Base64url strips padding "=" characters, and
        // atob() can throw or mis-decode without it, so
        // pad the string back out before decoding.

        let base64Payload =
            parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

        while (base64Payload.length % 4 !== 0) {

            base64Payload += "=";
        }

        const payload =
            JSON.parse(
                atob(
                    base64Payload
                )
            );


        const googleEmail =
            payload.email ||
            "";


        const googleName =
            payload.name ||
            "Google User";


        const googlePicture =
            payload.picture ||
            "";


        if (!googleEmail) {

            throw new Error(
                "Google did not provide an email address."
            );
        }


        console.log(
            "TEAM UNITY: Google email:",
            googleEmail
        );


        // --------------------------------------
        // CHECK SAME EMAIL IN DATABASE
        // --------------------------------------

        const responseFromServer =
            await fetch(
                "/api/google-login",
                {

                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            email:
                                googleEmail,

                            name:
                                googleName,

                            profilePicture:
                                googlePicture

                        })
                }
            );


        const data =
            await responseFromServer.json();


        console.log(
            "TEAM UNITY: Google database response:",
            data
        );


        // --------------------------------------
        // GOOGLE EMAIL NOT REGISTERED
        // --------------------------------------

        if (
            !responseFromServer.ok
        ) {

            const message =
                document.getElementById(
                    "message"
                );


            if (message) {

                message.textContent =
                    data.message ||
                    "This Google email is not registered with TEAM UNITY.";

                message.style.color =
                    "red";
            }


            return;
        }


        if (!data.user) {

            throw new Error(
                "Server did not return user information."
            );
        }


        // --------------------------------------
        // SAVE THE SAME DATABASE USER
        // --------------------------------------

        localStorage.setItem(
            "teamUnityLoggedIn",
            "true"
        );


        localStorage.setItem(
    "currentUser",
    JSON.stringify({
        ...data.user,
        profilePicture: googlePicture
    })
);


        console.log(
            "TEAM UNITY: Google account linked to existing database account."
        );


        console.log(
            data.user
        );


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "Google login successful!";

            message.style.color =
                "green";
        }


        setTimeout(
            () => {

                sendLoginSuccess();

            },
            300
        );

    } catch (error) {

        console.error(
            "TEAM UNITY: GOOGLE LOGIN ERROR:",
            error
        );


        const message =
            document.getElementById(
                "message"
            );


        if (message) {

            message.textContent =
                "Google sign-in failed.";

            message.style.color =
                "red";
        }
    }
}


// ==========================================
// SEND LOGIN SUCCESS TO PARENT POPUP
// ==========================================

function sendLoginSuccess() {

    console.log(
        "TEAM UNITY: Sending login success to parent."
    );


    if (
        window.parent &&
        window.parent !== window
    ) {

        window.parent.postMessage(
            {
                type:
                    "TEAM_UNITY_AUTH_SUCCESS",

                destination:
                    "dashboard.html"
            },

            window.location.origin
        );


        console.log(
            "TEAM UNITY: Dashboard message sent."
        );

        return;
    }


    window.location.href =
        "dashboard.html";
}