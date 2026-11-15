const forgotForm = document.getElementById("forgotPasswordForm");

forgotForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document
        .getElementById("forgotEmail")
        .value
        .trim()
        .toLowerCase();

    const message = document.getElementById("forgotMessage");

    // Clear anything from a previous attempt
    message.textContent = "";

    if (email === "") {
        message.textContent = "Please enter your email.";
        message.style.color = "red";
        return;
    }

    try {
        const response = await fetch("/api/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            message.style.color = "red";
            return;
        }

        message.textContent = data.message;
        message.style.color = "green";

        // Development only — the server sends resetLink when email
        // is not configured, so you can still test the flow.
        if (data.resetLink) {
            const link = document.createElement("a");
            link.href = data.resetLink;
            link.textContent = "Open Password Reset Page";
            link.style.display = "block";
            link.style.marginTop = "10px";
            message.appendChild(link);
        }

    } catch (error) {
        console.error(error);
        message.textContent = "Unable to connect to the server.";
        message.style.color = "red";
    }
});