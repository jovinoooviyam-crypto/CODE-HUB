
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("trainerForm");

    if (!form) {
        console.error("Trainer form was not found.");
        return;
    }

    const pages = Array.from(form.querySelectorAll(".form-page"));
    const progressSteps = Array.from(
        document.querySelectorAll(".progress-step")
    );

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    const declaration = document.getElementById("declaration");
    const whatsappSame = document.getElementById("whatsappSame");
    const emailInput = form.querySelector('[name="email"]');

    let currentPage = 0;
    let submitting = false;
    let accountExists = false;
    let emailCheckValue = "";

    const status = document.createElement("p");
    status.id = "trainerStatus";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.style.margin = "12px 0";
    form.prepend(status);

    function showStatus(message, type = "info") {
        status.textContent = message;
        status.style.color =
            type === "error" ? "#c62828" :
            type === "success" ? "#218838" : "#3354A5";
    }

    function showPage(index) {
        pages.forEach((page, i) => {
            page.classList.toggle("active", i === index);
        });

        progressSteps.forEach((step, i) => {
            step.classList.toggle("active", i <= index);
        });

        backBtn.style.display = index === 0 ? "none" : "block";
        nextBtn.style.display =
            index === pages.length - 1 ? "none" : "block";
        submitBtn.style.display =
            index === pages.length - 1 ? "block" : "none";

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function validateCurrentPage() {
        const page = pages[currentPage];

        if (!page) return false;

        for (const input of page.querySelectorAll(
            "input, select, textarea"
        )) {
            if (
                input.disabled ||
                input.type === "hidden" ||
                input.classList.contains("hidden") ||
                input.closest(".hidden")
            ) {
                continue;
            }

            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }

        if (currentPage === 1) {
            const genderOther = document.getElementById("genderOthers");
            const genderText = document.getElementById("genderOtherText");

            if (
                genderOther?.checked &&
                !genderText?.value.trim()
            ) {
                showStatus("Please specify your gender.", "error");
                genderText?.focus();
                return false;
            }
        }

        if (currentPage === 2) {
            const artForms = form.querySelectorAll(
                'input[name="artForm"]:checked'
            );

            if (!artForms.length) {
                showStatus("Please select at least one art form.", "error");
                return false;
            }

            const artOther = document.getElementById("artOther");
            const artText = document.getElementById("artOtherText");

            if (artOther?.checked && !artText?.value.trim()) {
                showStatus("Please specify your other art form.", "error");
                artText?.focus();
                return false;
            }
        }

        if (currentPage === 3) {
            const availabilityOther =
                document.getElementById("availabilityOther");
            const availabilityText =
                document.getElementById("availabilityOtherText");

            if (
                availabilityOther?.checked &&
                !availabilityText?.value.trim()
            ) {
                showStatus(
                    "Please specify your other workshop availability.",
                    "error"
                );
                availabilityText?.focus();
                return false;
            }
        }

        return true;
    }

    nextBtn.addEventListener("click", () => {
        if (!validateCurrentPage()) return;

        if (currentPage < pages.length - 1) {
            currentPage++;
            showPage(currentPage);
            showStatus("");
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentPage > 0) {
            currentPage--;
            showPage(currentPage);
            showStatus("");
        }
    });

    // Conditional gender field
    form.querySelectorAll('input[name="gender"]').forEach(input => {
        input.addEventListener("change", () => {
            const text = document.getElementById("genderOtherText");
            if (!text) return;

            const show = input.checked && input.value === "Others";
            text.classList.toggle("hidden", !show);

            if (!show) text.value = "";
        });
    });

    // Conditional art form field
    const artOther = document.getElementById("artOther");
    const artOtherText = document.getElementById("artOtherText");

    artOther?.addEventListener("change", () => {
        artOtherText?.classList.toggle("hidden", !artOther.checked);
        if (!artOther.checked && artOtherText) {
            artOtherText.value = "";
        }
    });

    // Conditional availability field
    form.querySelectorAll(
        'input[name="workshopAvailability"]'
    ).forEach(input => {
        input.addEventListener("change", () => {
            const other = document.getElementById("availabilityOther");
            const text = document.getElementById("availabilityOtherText");

            const show = Boolean(other?.checked);
            text?.classList.toggle("hidden", !show);

            if (!show && text) text.value = "";
        });
    });

    // Fill WhatsApp number from the mobile number when requested.
    function updateWhatsapp() {
        const contact = form.querySelector('[name="contactNumber"]');
        const whatsapp = form.querySelector('[name="whatsappNumber"]');

        if (whatsappSame?.checked && contact && whatsapp) {
            whatsapp.value = contact.value;
        }
    }

    whatsappSame?.addEventListener("change", updateWhatsapp);

    form.querySelector('[name="contactNumber"]')
        ?.addEventListener("input", updateWhatsapp);

    // Check the database when the email field loses focus.
    async function checkAccount(email) {
        const normalized = email.trim().toLowerCase();

        if (!normalized) return false;

        if (normalized === emailCheckValue) {
            return accountExists;
        }

        emailCheckValue = normalized;
        accountExists = false;

        try {
            const response = await fetch("/api/account-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: normalized })
            });

            const result = await response.json();

            if (!response.ok) {
                showStatus(
                    result.message || "Unable to check this email.",
                    "error"
                );
                return false;
            }

            // Ignore a stale response if the user has changed the email.
            if (
                emailInput.value.trim().toLowerCase() !== normalized
            ) {
                return false;
            }

            accountExists = result.exists === true;

            if (accountExists) {
                showStatus(
                    "This email already has a Team Unity account. Opening login...",
                    "error"
                );

                window.parent.postMessage(
                    {
                        type: "TEAM_UNITY_ACCOUNT_EXISTS",
                        email: normalized
                    },
                    window.location.origin
                );
            } else {
                showStatus(
                    "No existing account found. You can continue registration.",
                    "success"
                );
            }

            return accountExists;
        } catch (error) {
            console.error("TRAINER ACCOUNT CHECK ERROR:", error);
            showStatus(
                "Unable to check the account. Please try again.",
                "error"
            );
            return false;
        }
    }

    emailInput?.addEventListener("blur", () => {
        const email = emailInput.value.trim();

        if (email && emailInput.checkValidity()) {
            checkAccount(email);
        }
    });

    // Collect values while preserving multiple checkbox selections.
    function collectFormData() {
        const result = {};

        new FormData(form).forEach((value, key) => {
            if (key === "artForm" || key === "workshopAvailability") {
                if (!Array.isArray(result[key])) result[key] = [];
                result[key].push(value);
            } else {
                result[key] = value;
            }
        });

        result.availability = result.workshopAvailability || [];
        delete result.workshopAvailability;

        result.whatsappSame = Boolean(whatsappSame?.checked);

        if (result.whatsappSame) {
            result.whatsappNumber = result.contactNumber || "";
        }

        result.declarationAgreed = Boolean(declaration?.checked);

        return result;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (submitting) return;

        // Validate every page before submitting.
        for (let index = 0; index < pages.length; index++) {
            currentPage = index;
            showPage(index);

            if (!validateCurrentPage()) return;
        }

        if (!declaration?.checked) {
            showStatus(
                "Please accept the declaration before submitting.",
                "error"
            );
            declaration?.focus();
            return;
        }

        const email = emailInput?.value.trim().toLowerCase();

        if (!email) {
            showStatus("Please enter your email address.", "error");
            emailInput?.focus();
            return;
        }

        submitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            // Always recheck on submission, even if blur already checked.
            const response = await fetch("/api/account-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const accountResult = await response.json();

            if (!response.ok) {
                throw new Error(
                    accountResult.message || "Unable to check your account."
                );
            }

            if (accountResult.exists) {
                showStatus(
                    "This email is already registered. Please log in.",
                    "error"
                );

                window.parent.postMessage(
                    { type: "TEAM_UNITY_ACCOUNT_EXISTS", email },
                    window.location.origin
                );

                return;
            }

            const data = collectFormData();

// Map Trainer form fields to the names expected by the server.
data.username = data.professionalName;
data.contactNumber = data.mobileNumber;

// If WhatsApp uses the same number, reuse the mobile number.
if (data.whatsappSame === true) {
    data.whatsappNumber = data.mobileNumber;
}

            const registrationResponse = await fetch(
                "/api/trainer-register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data)
                }
            );

            const result = await registrationResponse.json();

            if (!registrationResponse.ok) {
                if (registrationResponse.status === 409) {
                    showStatus(
                        result.message || "This account already exists. Please log in.",
                        "error"
                    );

                    window.parent.postMessage(
                        { type: "TEAM_UNITY_ACCOUNT_EXISTS", email },
                        window.location.origin
                    );

                    return;
                }

                throw new Error(
                    result.message || "Trainer registration failed."
                );
            }

            /*
             * Registration succeeded. Store the returned account and
             * use the same dashboard handoff as the existing login flow.
             */
            const user = result.user;

            localStorage.setItem("teamUnityLoggedIn", "true");
            localStorage.setItem("currentUser", JSON.stringify(user));

            showStatus(
                "Trainer registration successful! Opening your dashboard...",
                "success"
            );

            window.parent.postMessage(
                {
                    type: "TEAM_UNITY_TRAINER_AUTH_SUCCESS",
                    destination: "dashboard.html"
                },
                window.location.origin
            );

            // Also work when the form is opened as a standalone page.
            if (window.parent === window) {
                window.location.href = "dashboard.html";
            }
        } catch (error) {
            console.error("TRAINER REGISTRATION ERROR:", error);
            showStatus(error.message || "Unable to submit registration.", "error");
        } finally {
            submitting = false;
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit";
        }
    });

    showPage(0);
});
