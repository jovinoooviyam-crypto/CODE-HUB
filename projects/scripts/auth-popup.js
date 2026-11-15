
function closeAuthPopupAndRedirect(destination, delay = 0) {
    const target = destination || "index.html";

    function finish() {
        // If login.html is inside the floating iframe
        if (window.parent && window.parent !== window) {
            const loginFrame = window.parent.document.getElementById("loginFrame");

            if (loginFrame) {
                // Keep the floating window open.
                // Only replace the iframe content.
                loginFrame.src = target;
                return;
            }

            console.error("loginFrame not found in parent window.");
            return;
        }

        // Fallback when login.html is opened directly
        window.location.href = target;
    }

    if (delay > 0) {
        setTimeout(finish, delay);
    } else {
        finish();
    }
}

