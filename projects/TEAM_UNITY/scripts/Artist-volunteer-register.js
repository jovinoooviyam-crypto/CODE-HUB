
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("regForm");
    const typeSelect = document.getElementById("registrationType");
    const artistFields = document.getElementById("artistFields");
    const volunteerFields = document.getElementById("volunteerFields");

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const stepCounter = document.getElementById("stepCounter");
    const stepError = document.getElementById("stepError");
    const typeInfo = document.getElementById("typeInfo");
    const successCard = document.getElementById("successCard");

    if (
        !form || !typeSelect || !artistFields || !volunteerFields ||
        !backBtn || !nextBtn || !submitBtn
    ) {
        console.error("Team Unity registration form elements are missing.");
        return;
    }

    let currentStep = 0;
    let sections = [];

    const messages = {
        Artist: [
            "Choose your registration type.",
            "Create your account.",
            "Enter your personal details.",
            "Tell us about your art forms and experience.",
            "Select your availability and accept the declaration."
        ],
        Volunteer: [
            "Choose your registration type.",
            "Enter your personal information.",
            "Tell us about your education and expertise.",
            "Share your volunteering experience and languages.",
            "Tell us your availability and motivation.",
            "Review the declaration and consent."
        ]
    };

    function getActiveFields() {
        if (typeSelect.value === "Artist") return artistFields;
        if (typeSelect.value === "Volunteer") return volunteerFields;
        return null;
    }


    /* ==========================================
       BRANCH / STEP MANAGEMENT
    ========================================== */

    function updateBranch() {
        const type = typeSelect.value;

        artistFields.hidden = type !== "Artist";
        volunteerFields.hidden = type !== "Volunteer";

        [artistFields, volunteerFields].forEach(branch => {
            const inactive = branch.hidden;

            branch.querySelectorAll("input, select, textarea").forEach(input => {
                // Do not enable a field if its conditional wrapper is hidden.
                input.disabled = inactive || Boolean(input.closest("[hidden]"));
            });
        });

        if (type === "Artist") {
            typeInfo.textContent =
                "Artist registration: Create an account and share your cultural art forms, experience and availability.";
        } else if (type === "Volunteer") {
            typeInfo.textContent =
                "Volunteer registration: Share your personal details, skills, experience and interests.";
        } else {
            typeInfo.textContent = "Select Artist or Volunteer to continue.";
        }

        const activeBranch = getActiveFields();

        sections = [
            form.querySelector('[data-section="type"]'),
            ...(activeBranch
                ? Array.from(activeBranch.querySelectorAll(".form-section"))
                : [])
        ].filter(Boolean);

        currentStep = 0;
        showStep();
    }


    function showStep() {
        sections.forEach((section, index) => {
            section.classList.toggle("active", index === currentStep);
        });

        backBtn.hidden = currentStep === 0;
        nextBtn.hidden = currentStep === sections.length - 1;
        submitBtn.hidden = currentStep !== sections.length - 1;

        stepCounter.textContent =
            `Step ${currentStep + 1} of ${sections.length}`;

        stepError.textContent = "";

        if (currentStep === 0) {
            typeInfo.textContent = typeSelect.value
                ? messages[typeSelect.value][0]
                : "Select Artist or Volunteer to continue.";
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }


    /* ==========================================
       FORM VALIDATION
    ========================================== */

    function validateCurrentStep() {
        const section = sections[currentStep];

        if (!section) return false;

        stepError.textContent = "";

        if (currentStep === 0 && !typeSelect.value) {
            stepError.textContent = "Please select Artist or Volunteer.";
            typeSelect.focus();
            return false;
        }

        const fields = Array.from(
            section.querySelectorAll(
                "input:not(:disabled), select:not(:disabled), textarea:not(:disabled)"
            )
        ).filter(input => !input.closest("[hidden]"));

        for (const input of fields) {
            if (!input.checkValidity()) {
                input.reportValidity();
                return false;
            }
        }

        // Artist password confirmation.
        if (section.dataset.section === "artist-account") {
            const password = form.elements["artist_password"].value;
            const confirm = form.elements["artist_confirmPassword"].value;

            if (password !== confirm) {
                stepError.textContent = "Passwords do not match.";
                form.elements["artist_confirmPassword"].focus();
                return false;
            }
        }

        // Checkbox groups that require at least one selection.
        const requiredGroups = {
            "artist-art": ["artist_artForm"],
            "artist-availability": ["artist_availability"],
            "volunteer-background": ["volunteer_skills"],
            "volunteer-experience": ["volunteer_languages"]
        };

        const groups = requiredGroups[section.dataset.section] || [];

        for (const group of groups) {
            const checked = section.querySelectorAll(
                `input[name="${group}"]:checked`
            );

            if (!checked.length) {
                stepError.textContent = "Please select at least one option.";
                section.querySelector(`input[name="${group}"]`)?.focus();
                return false;
            }
        }

        // Validate Artist date of birth.
        if (section.dataset.section === "artist-personal") {
            const day = Number(form.elements["artist_dobDay"].value);
            const month = Number(form.elements["artist_dobMonth"].value);
            const year = Number(form.elements["artist_dobYear"].value);

            const date = new Date(year, month - 1, day);

            if (
                !day || !month || !year ||
                date.getFullYear() !== year ||
                date.getMonth() !== month - 1 ||
                date.getDate() !== day ||
                date > new Date()
            ) {
                stepError.textContent = "Please enter a valid date of birth.";
                form.elements["artist_dobDay"].focus();
                return false;
            }
        }

        return true;
    }


    /* ==========================================
       STEP NAVIGATION
    ========================================== */

    nextBtn.addEventListener("click", () => {
        if (!validateCurrentStep()) return;

        if (currentStep < sections.length - 1) {
            currentStep++;
            showStep();
        }
    });

    backBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            showStep();
        }
    });

    typeSelect.addEventListener("change", updateBranch);


    /* ==========================================
       PASSWORD VISIBILITY
    ========================================== */

    document.querySelectorAll(".toggle-password").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);

            if (!input) return;

            input.type = input.type === "password" ? "text" : "password";

            button.textContent =
                input.type === "password" ? "👁" : "🙈";
        });
    });


    /* ==========================================
       CONDITIONAL FIELD HELPER
    ========================================== */

    function conditional(trigger, wrapper, inputName, condition = "checked") {
        const control = document.getElementById(trigger);
        const container = document.getElementById(wrapper);
        const field = form.elements[inputName];

        if (!control || !container || !field) return;

        function update() {
            const visible = condition === "checked"
                ? control.checked
                : control.value === condition;

            container.hidden = !visible;
            field.disabled = !visible;
            field.required = visible;

            if (!visible) field.value = "";
        }

        control.addEventListener("change", update);
        update();
    }


    /* ==========================================
       ARTIST CONDITIONAL FIELDS
    ========================================== */

    conditional(
        "artistGender",
        "artistGenderOtherWrap",
        "artist_genderOther",
        "Other"
    );

    conditional(
        "artistArtOther",
        "artistArtOtherText",
        "artist_artFormOther"
    );

    conditional(
        "artistAvailabilityOther",
        "artistAvailabilityOtherText",
        "artist_availabilityOther"
    );

    conditional(
        "artistProfession",
        "artistProfessionOtherWrap",
        "artist_professionOther",
        "Other"
    );


    // Artist college name.
    function updateCollege() {
        const profession = form.elements["artist_profession"];
        const wrapper = document.getElementById("artistCollegeWrap");
        const input = form.elements["artist_collegeName"];

        if (!profession || !wrapper || !input) return;

        const visible = profession.value === "College student";

        wrapper.hidden = !visible;
        input.disabled = !visible;
        input.required = visible;

        if (!visible) input.value = "";
    }

    if (form.elements["artist_profession"]) {
        form.elements["artist_profession"].addEventListener(
            "change",
            updateCollege
        );
    }

    updateCollege();


    // Artist experience.
    const artistExperience = form.querySelectorAll(
        'input[name="artist_hasExperience"]'
    );

    function updateArtistExperience() {
        const value = form.querySelector(
            'input[name="artist_hasExperience"]:checked'
        )?.value;

        const otherWrap = document.getElementById("artistExperienceWrap");
        const descWrap = document.getElementById("artistExperienceDescWrap");

        const otherInput = form.elements["artist_experienceOther"];
        const descInput = form.elements["artist_experienceDesc"];

        if (!otherWrap || !descWrap || !otherInput || !descInput) return;

        otherWrap.hidden = value !== "Other";
        descWrap.hidden = value !== "Yes";

        otherInput.disabled = value !== "Other";
        descInput.disabled = value !== "Yes";

        otherInput.required = value === "Other";
        descInput.required = value === "Yes";

        if (value !== "Other") otherInput.value = "";
        if (value !== "Yes") descInput.value = "";
    }

    artistExperience.forEach(input => {
        input.addEventListener("change", updateArtistExperience);
    });

    updateArtistExperience();


    /* ==========================================
       VOLUNTEER CONDITIONAL FIELDS
    ========================================== */

    conditional(
        "volunteerGenderOther",
        "volunteerGenderOtherText",
        "volunteer_genderOther"
    );

    conditional(
        "volunteerStatus",
        "volunteerStatusOtherWrap",
        "volunteer_statusOther",
        "Other"
    );

    conditional(
        "volunteerSkillOther",
        "volunteerSkillOtherText",
        "volunteer_skillOther"
    );

    conditional(
        "volunteerLanguageOther",
        "volunteerLanguageOtherText",
        "volunteer_languageOther"
    );


    // Volunteer previous experience.
    const volunteerExperience = form.querySelectorAll(
        'input[name="volunteer_previousExperience"]'
    );

    function updateVolunteerExperience() {
        const value = form.querySelector(
            'input[name="volunteer_previousExperience"]:checked'
        )?.value;

        const wrapper = document.getElementById("volunteerExperienceWrap");
        const input = form.elements["volunteer_experienceDetails"];

        if (!wrapper || !input) return;

        wrapper.hidden = value !== "Yes";
        input.disabled = value !== "Yes";

        if (value !== "Yes") input.value = "";
    }

    volunteerExperience.forEach(input => {
        input.addEventListener("change", updateVolunteerExperience);
    });

    updateVolunteerExperience();


    /* ==========================================
       COLLECT FORM DATA
    ========================================== */

    function collectFormDetails(type) {
        const formData = new FormData(form);
        const details = {};

        for (const [originalKey, value] of formData.entries()) {
            if (originalKey === "registrationType") continue;

            const cleanKey = originalKey.replace(/^(artist|volunteer)_/, "");

            if (details[cleanKey] !== undefined) {
                if (!Array.isArray(details[cleanKey])) {
                    details[cleanKey] = [details[cleanKey]];
                }

                details[cleanKey].push(value);
            } else {
                details[cleanKey] = value;
            }
        }

        if (type === "Artist") {
            details.artForm = formData.getAll("artist_artForm");
            details.availability = formData.getAll("artist_availability");

            details.declaration = formData.has("artist_declaration");

            // Preserve the actual date parts as separate values.
            details.dobDay = formData.get("artist_dobDay") || "";
            details.dobMonth = formData.get("artist_dobMonth") || "";
            details.dobYear = formData.get("artist_dobYear") || "";
        }

        if (type === "Volunteer") {
            details.skills = formData.getAll("volunteer_skills");
            details.languages = formData.getAll("volunteer_languages");

            details.contactConsent =
                formData.has("volunteer_contactConsent");

            details.guidelinesAgreement =
                formData.has("volunteer_guidelinesAgreement");

            details.privacyAcknowledgement =
                formData.has("volunteer_privacyAcknowledgement");
        }

        return details;
    }


    /* ==========================================
       SUBMIT ARTIST / VOLUNTEER REGISTRATION
    ========================================== */

    form.addEventListener("submit", async event => {
        event.preventDefault();

        if (!validateCurrentStep()) return;

        const type = typeSelect.value;

        if (!["Artist", "Volunteer"].includes(type)) {
            stepError.textContent = "Please select Artist or Volunteer.";
            return;
        }

        const details = collectFormDetails(type);

        const originalButtonText = submitBtn.textContent;

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        stepError.textContent = "";

        try {
            const response = await fetch("/api/unified-registration", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    registrationType: type,
                    details
                })
            });

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error("The server returned an invalid response.");
            }

            if (!response.ok) {
                throw new Error(
                    result.message || "Registration could not be completed."
                );
            }

            // Only display success after the server confirms saving.
            form.hidden = true;

            if (successCard) {
                successCard.hidden = false;

                const successTitle = successCard.querySelector("h2");
                const successMessage = successCard.querySelector("p");

                if (successTitle) {
                    successTitle.textContent = "Registration Submitted!";
                }

                if (successMessage) {
                    successMessage.textContent = result.message;
                }
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } catch (error) {
            console.error("REGISTRATION SUBMISSION ERROR:", error);
            stepError.textContent = error.message;

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalButtonText;
        }
    });


    /* ==========================================
       INITIAL STATE
    ========================================== */

    updateBranch();
});
