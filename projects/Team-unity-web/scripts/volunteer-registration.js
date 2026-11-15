
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("volunteerForm");

    if (!form) return;

    const pages = [...form.querySelectorAll(".form-page")];
    const steps = [...document.querySelectorAll(".progress-step")];

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const message = document.getElementById("formMessage");

    let currentPage = 0;
    let submitting = false;

    // Prevent selecting a future date of birth.
    const dob = document.getElementById("dateOfBirth");
    dob.max = new Date().toISOString().split("T")[0];

    function showMessage(text = "", type = "info") {
        message.textContent = text;
        message.className = text ? type : "";
    }

    function showPage(index) {
        currentPage = index;

        pages.forEach((page, i) => {
            page.classList.toggle("active", i === index);
        });

        steps.forEach((step, i) => {
            step.classList.toggle("active", i <= index);
        });

        document.getElementById("progressLine").style.width =
            `${(index / (pages.length - 1)) * 100}%`;

        backBtn.style.display = index === 0 ? "none" : "block";
        nextBtn.style.display =
            index === pages.length - 1 ? "none" : "block";
        submitBtn.style.display =
            index === pages.length - 1 ? "block" : "none";

        showMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function isVisibleField(field) {
        return !field.disabled &&
            !field.classList.contains("hidden") &&
            !field.closest(".hidden");
    }

    function validatePage() {
        const page = pages[currentPage];

        for (const field of page.querySelectorAll(
            "input, select, textarea"
        )) {
            if (!isVisibleField(field)) continue;

            if (!field.checkValidity()) {
                field.reportValidity();
                return false;
            }
        }

        // Validate the full date, not just the individual input format.
        if (currentPage === 0) {
            if (dob.value) {
                const birthDate = new Date(`${dob.value}T00:00:00`);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (
                    Number.isNaN(birthDate.getTime()) ||
                    birthDate > today
                ) {
                    showMessage(
                        "Please enter a valid date of birth.",
                        "error"
                    );
                    dob.focus();
                    return false;
                }
            }

            const phone = document.getElementById("phone");
            const digits = phone.value.replace(/\D/g, "");

            if (digits.length < 10 || digits.length > 15) {
                showMessage(
                    "Please enter a valid phone number.",
                    "error"
                );
                phone.focus();
                return false;
            }

            if (
                document.getElementById("genderOther").checked &&
                !document.getElementById("genderOtherText").value.trim()
            ) {
                showMessage("Please specify your gender.", "error");
                document.getElementById("genderOtherText").focus();
                return false;
            }
        }

        if (currentPage === 1) {
            if (!form.querySelector('input[name="skills"]:checked')) {
                showMessage(
                    "Please select at least one skill or expertise.",
                    "error"
                );
                return false;
            }

            if (
                document.getElementById("skillOther").checked &&
                !document.getElementById("skillOtherText").value.trim()
            ) {
                showMessage("Please specify your other skill.", "error");
                document.getElementById("skillOtherText").focus();
                return false;
            }

            if (
                document.getElementById("currentStatus").value === "Other" &&
                !document.getElementById("statusOther").value.trim()
            ) {
                showMessage(
                    "Please specify your current status.",
                    "error"
                );
                document.getElementById("statusOther").focus();
                return false;
            }
        }

        if (currentPage === 2) {
            if (!form.querySelector('input[name="languages"]:checked')) {
                showMessage(
                    "Please select at least one language.",
                    "error"
                );
                return false;
            }

            if (
                document.getElementById("languageOther").checked &&
                !document.getElementById("languageOtherText").value.trim()
            ) {
                showMessage(
                    "Please specify the other language.",
                    "error"
                );
                document.getElementById("languageOtherText").focus();
                return false;
            }
        }

        return true;
    }

    nextBtn.addEventListener("click", () => {
        if (!validatePage()) return;

        if (currentPage < pages.length - 1) {
            showPage(currentPage + 1);
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentPage > 0) showPage(currentPage - 1);
    });

    // Show or hide a field based on a radio or checkbox selection.
    function bindConditional(control, target, shouldShow) {
        const input = document.getElementById(control);
        const field = document.getElementById(target);

        if (!input || !field) return;

        function update() {
            const visible = shouldShow(input);

            field.classList.toggle("hidden", !visible);
            field.required = visible;

            if (!visible) field.value = "";
        }

        input.addEventListener("change", update);
        update();
    }

    // Gender: Other
    form.querySelectorAll('input[name="gender"]').forEach(radio => {
        radio.addEventListener("change", () => {
            const field = document.getElementById("genderOtherText");
            const visible = document.getElementById("genderOther").checked;

            field.classList.toggle("hidden", !visible);
            field.required = visible;

            if (!visible) field.value = "";
        });
    });

    // Current status: Other
    bindConditional(
        "currentStatus",
        "statusOther",
        input => input.value === "Other"
    );

    // Skills: Other
    bindConditional(
        "skillOther",
        "skillOtherText",
        input => input.checked
    );

    // Languages: Other
    bindConditional(
        "languageOther",
        "languageOtherText",
        input => input.checked
    );

    // Previous volunteering experience details
const experienceDetailsWrap =
    document.getElementById("experienceDetailsWrap");

function updateExperienceDetails() {
    const selected = form.querySelector(
        'input[name="previousExperience"]:checked'
    );

    const visible = selected?.value === "Yes";

    experienceDetailsWrap.classList.toggle(
        "hidden",
        !visible
    );
}

form.querySelectorAll(
    'input[name="previousExperience"]'
).forEach(radio => {
    radio.addEventListener(
        "change",
        updateExperienceDetails
    );
});

updateExperienceDetails();


    // Collect checkbox groups as arrays instead of losing selections.
    function collectFormData() {
        const data = {};

        new FormData(form).forEach((value, key) => {
            if (key === "skills" || key === "languages") {
                if (!data[key]) data[key] = [];
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        data.skills = data.skills || [];
        data.languages = data.languages || [];

        // Keep the extra field values clearly associated with "Other".
        if (data.skillOther) {
            data.skills = data.skills.filter(skill => skill !== "Other");
            data.skills.push(data.skillOther.trim());
        }

        if (data.languageOther) {
            data.languages = data.languages.filter(
                language => language !== "Other"
            );
            data.languages.push(
                ...data.languageOther.split(",")
                    .map(language => language.trim())
                    .filter(Boolean)
            );
        }

        if (data.gender === "Other" && data.genderOther) {
            data.gender = data.genderOther.trim();
        }

        if (data.currentStatus === "Other" && data.statusOther) {
            data.currentStatus = data.statusOther.trim();
        }

        // Explicit consent fields for the server.
        data.contactConsent =
            document.getElementById("contactConsent").checked;
        data.guidelinesAgreement =
            document.getElementById("guidelinesAgreement").checked;
        data.privacyAcknowledgement =
            document.getElementById("privacyAcknowledgement").checked;

        return data;
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (submitting) return;

        // Validate all steps before submission.
        for (let index = 0; index < pages.length; index++) {
            showPage(index);

            if (!validatePage()) return;
        }

        if (!form.checkValidity()) {
            const invalid = form.querySelector(":invalid");

            if (invalid) {
                const pageIndex = pages.findIndex(
                    page => page.contains(invalid)
                );

                if (pageIndex >= 0) showPage(pageIndex);

                invalid.reportValidity();
            }

            return;
        }

        const data = collectFormData();

        if (
            !data.contactConsent ||
            !data.guidelinesAgreement ||
            !data.privacyAcknowledgement
        ) {
            showMessage(
                "Please accept all declarations before submitting.",
                "error"
            );
            return;
        }

        submitting = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
            /*
             * This route must be implemented in your Express backend.
             * It should validate the data, check duplicate accounts,
             * and save the volunteer registration to your database.
             */
            const response = await fetch("/api/volunteer-register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                if (response.status === 409) {
                    showMessage(
                        result.message ||
                        "An account with these details may already exist. Please log in or contact Team Unity.",
                        "error"
                    );

                    window.parent.postMessage(
                        {
                            type: "TEAM_UNITY_ACCOUNT_EXISTS",
                            email: data.email
                        },
                        window.location.origin
                    );

                    return;
                }

                throw new Error(
                    result.message ||
                    "Volunteer registration failed. Please try again."
                );
            }

            showMessage(
                result.message ||
                "Volunteer registration submitted successfully!",
                "success"
            );

            // Notify the parent page if opened inside a popup iframe.
            window.parent.postMessage(
                {
                    type: "TEAM_UNITY_VOLUNTEER_REGISTRATION_SUCCESS",
                    destination: result.destination || null
                },
                window.location.origin
            );

            // Standalone-page fallback.
            if (window.parent === window && result.destination) {
                window.location.href = result.destination;
            }
        } catch (error) {
            console.error("VOLUNTEER REGISTRATION ERROR:", error);

            showMessage(
                error.message ||
                "Unable to submit your registration. Please try again.",
                "error"
            );
        } finally {
            submitting = false;
            submitBtn.disabled = false;
            submitBtn.innerHTML =
                'Submit Registration <i class="fa fa-check"></i>';
        }
    });

    showPage(0);
});
