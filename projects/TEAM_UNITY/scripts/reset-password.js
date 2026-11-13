const resetForm =
    document.getElementById(
        "resetPasswordForm"
    );


const message =
    document.getElementById(
        "resetMessage"
    );


const params =
    new URLSearchParams(
        window.location.search
    );


const token =
    params.get("token");


if (!token) {

    message.textContent =
        "Invalid password reset link.";

    message.style.color =
        "red";

    resetForm.style.display =
        "none";

}


resetForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const password =
            document
                .getElementById("newPassword")
                .value;


        const confirmPassword =
            document
                .getElementById("confirmPassword")
                .value;


        if (password.length < 8) {

            message.textContent =
                "Password must contain at least 8 characters.";

            message.style.color =
                "red";

            return;

        }


        if (password !== confirmPassword) {

            message.textContent =
                "Passwords do not match.";

            message.style.color =
                "red";

            return;

        }


        try {

            const response =
                await fetch(
                    "/api/reset-password",
                    {

                        method:
                            "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                token:
                                    token,

                                password:
                                    password

                            })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                message.textContent =
                    data.message;

                message.style.color =
                    "red";

                return;

            }


            message.textContent =
                data.message;

            message.style.color =
                "green";


            resetForm.reset();


            setTimeout(
                function() {

                    window.location.href =
                        "login.html";

                },
                1500
            );


        } catch (error) {

            console.error(error);


            message.textContent =
                "Unable to connect to the server.";

            message.style.color =
                "red";

        }

    }
);