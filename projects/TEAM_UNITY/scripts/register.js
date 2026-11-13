document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("regForm");
    const steps = Array.from(document.querySelectorAll(".step"));
    const progressSteps = Array.from(
        document.querySelectorAll(".progress-step")
    );

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const stepError = document.getElementById("stepError");
    const reviewBox = document.getElementById("reviewBox");
    const successCard = document.getElementById("successCard");
    const progress = document.getElementById("progress");

    if (
        !form ||
        !steps.length ||
        !backBtn ||
        !nextBtn ||
        !submitBtn
    ) {
        console.error("Registration form elements are missing.");
        return;
    }

    let current = 1;
    const TOTAL_STEPS = steps.length;

    goToStep(1);

    initConditionalFields();
    initPasswordToggles();
    initPasswordMatchCheck();

    backBtn.addEventListener("click", function() {
        goToStep(current - 1);
    });

    nextBtn.addEventListener("click", function() {
        if (!validateStep(current)) {
            return;
        }

        goToStep(current + 1);
    });

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        if (!validateStep(current)) {
            return;
        }

        submitRegistration();
    });

    function goToStep(stepNum) {
        if (
            stepNum < 1 ||
            stepNum > TOTAL_STEPS
        ) {
            return;
        }

        current = stepNum;
        stepError.textContent = "";

        steps.forEach(function(step) {
            step.classList.toggle(
                "active",
                Number(step.dataset.step) === current
            );
        });

        progressSteps.forEach(function(step) {
            const number = Number(step.dataset.step);

            step.classList.toggle(
                "active",
                number === current
            );

            step.classList.toggle(
                "done",
                number < current
            );
        });

        backBtn.hidden = current === 1;
        nextBtn.hidden = current === TOTAL_STEPS;
        submitBtn.hidden = current !== TOTAL_STEPS;

        if (current === TOTAL_STEPS) {
            renderReview();
        }

        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function validateStep(stepNum) {
        const stepEl = steps.find(function(step) {
            return Number(step.dataset.step) === stepNum;
        });

        if (!stepEl) {
            return false;
        }

        const requiredFields = Array.from(
            stepEl.querySelectorAll("[required]")
        ).filter(function(field) {
            return !field.hidden &&
                   field.offsetParent !== null;
        });

        for (const field of requiredFields) {
            if (
                field.type === "radio" ||
                field.type === "checkbox"
            ) {
                const group = stepEl.querySelectorAll(
                    `input[name="${field.name}"]`
                );

                const checked = Array.from(group).some(
                    function(input) {
                        return input.checked;
                    }
                );

                if (!checked) {
                    stepError.textContent =
                        "Please complete all required fields before continuing.";

                    field.focus();
                    return false;
                }

            } else if (!field.value.trim()) {
                stepError.textContent =
                    "Please complete all required fields before continuing.";

                field.focus();
                return false;
            }
        }

        if (stepNum === 1) {
            const username = form.elements.username.value.trim();
            const password = form.elements.password.value;
            const confirmPassword =
                form.elements.confirmPassword.value;

            if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) {
                stepError.textContent =
                    "Username must be 3–20 characters: letters, numbers, underscore or dot.";

                form.elements.username.focus();
                return false;
            }

            if (password.length < 8) {
                stepError.textContent =
                    "Password must be at least 8 characters.";

                form.elements.password.focus();
                return false;
            }

            if (password !== confirmPassword) {
                stepError.textContent =
                    "Passwords do not match.";

                form.elements.confirmPassword.focus();
                return false;
            }
        }

        if (stepNum === 2) {
            const day = form.elements.dobDay.value;
            const month = form.elements.dobMonth.value;
            const year = form.elements.dobYear.value;

            const dayNumber = Number(day);
            const monthNumber = Number(month);
            const yearNumber = Number(year);

            if (
                !/^\d{2}$/.test(day) ||
                dayNumber < 1 ||
                dayNumber > 31
            ) {
                stepError.textContent =
                    "Please enter a valid day.";

                form.elements.dobDay.focus();
                return false;
            }

            if (
                !/^\d{2}$/.test(month) ||
                monthNumber < 1 ||
                monthNumber > 12
            ) {
                stepError.textContent =
                    "Please enter a valid month.";

                form.elements.dobMonth.focus();
                return false;
            }

            if (
                !/^\d{4}$/.test(year) ||
                yearNumber < 1900 ||
                yearNumber > new Date().getFullYear()
            ) {
                stepError.textContent =
                    "Please enter a valid year.";

                form.elements.dobYear.focus();
                return false;
            }

            if (
                form.elements.profession.value ===
                "College student" &&
                !form.elements.collegeName.value.trim()
            ) {
                stepError.textContent =
                    "Please enter your college or institution name.";

                form.elements.collegeName.focus();
                return false;
            }

            if (
                form.elements.profession.value === "Other" &&
                !form.elements.professionOther.value.trim()
            ) {
                stepError.textContent =
                    "Please specify your profession.";

                form.elements.professionOther.focus();
                return false;
            }

            if (
                form.elements.gender.value === "Other" &&
                !form.elements.genderOther.value.trim()
            ) {
                stepError.textContent =
                    "Please specify your gender.";

                form.elements.genderOther.focus();
                return false;
            }
        }

        if (stepNum === 3) {
            const artFormChecked = Array.from(
                stepEl.querySelectorAll('input[name="artForm"]:checked')
            );

            const artFormOtherChecked = artFormChecked.some(
                function(input) {
                    return input.value === "Other";
                }
            );

            if (
                artFormOtherChecked &&
                !form.elements.artFormOther.value.trim()
            ) {
                stepError.textContent =
                    "Please specify your art form.";

                form.elements.artFormOther.focus();
                return false;
            }

            if (
                form.elements.hasExperience.value === "Other" &&
                !form.elements.experienceOther.value.trim()
            ) {
                stepError.textContent =
                    "Please specify your experience.";

                form.elements.experienceOther.focus();
                return false;
            }

            if (
                form.elements.hasExperience.value === "Yes" &&
                !form.elements.experienceDesc.value.trim()
            ) {
                stepError.textContent =
                    "Please describe your previous experience.";

                form.elements.experienceDesc.focus();
                return false;
            }
        }

        if (stepNum === TOTAL_STEPS) {
            const availability =
                document.querySelectorAll(
                    'input[name="availability"]:checked'
                );

            if (!availability.length) {
                stepError.textContent =
                    "Please select at least one availability option.";

                return false;
            }

            const otherAvailability =
                document.getElementById(
                    "availabilityOtherBox"
                );

            if (
                otherAvailability.checked &&
                !form.elements.availabilityOther.value.trim()
            ) {
                stepError.textContent =
                    "Please specify your availability.";

                form.elements.availabilityOther.focus();
                return false;
            }
        }

        stepError.textContent = "";
        return true;
    }

    function initPasswordToggles() {
        document
            .querySelectorAll(".toggle-visibility")
            .forEach(function(button) {

                button.addEventListener(
                    "click",
                    function() {
                        const target =
                            document.getElementById(
                                button.dataset.target
                            );

                        if (!target) {
                            return;
                        }

                        const showing =
                            target.type === "text";

                        target.type =
                            showing
                                ? "password"
                                : "text";

                        button.textContent =
                            showing
                                ? "👁"
                                : "🙈";

                        button.setAttribute(
                            "aria-label",
                            showing
                                ? "Show password"
                                : "Hide password"
                        );
                    }
                );
            });
    }

    function initPasswordMatchCheck() {
        const password =
            document.getElementById(
                "passwordInput"
            );

        const confirm =
            document.getElementById(
                "confirmPasswordInput"
            );

        if (!password || !confirm) {
            return;
        }

        const wrapper =
            confirm.closest("label");

        if (!wrapper) {
            return;
        }

        const hint =
            document.createElement("p");

        hint.className =
            "password-match";

        wrapper.appendChild(hint);

        function check() {
            if (!confirm.value) {
                hint.textContent = "";
                hint.className =
                    "password-match";
                return;
            }

            const matches =
                password.value === confirm.value;

            hint.textContent =
                matches
                    ? "Passwords match"
                    : "Passwords don't match yet";

            hint.className =
                `password-match ${
                    matches
                        ? "match"
                        : "mismatch"
                }`;
        }

        password.addEventListener(
            "input",
            check
        );

        confirm.addEventListener(
            "input",
            check
        );
    }

    function initConditionalFields() {
        const gender =
            document.querySelector(
                'select[name="gender"]'
            );

        const genderOtherRow =
            document.getElementById(
                "genderOtherRow"
            );

        const profession =
            document.querySelector(
                'select[name="profession"]'
            );

        const professionOtherRow =
            document.getElementById(
                "professionOtherRow"
            );

        const collegeRow =
            document.getElementById(
                "collegeRow"
            );

        const artFormCheckboxes =
            document.querySelectorAll(
                'input[name="artForm"]'
            );

        const artFormOther =
            document.querySelector(
                'input[name="artFormOther"]'
            );

        const experienceOther =
            document.querySelector(
                'input[name="experienceOther"]'
            );

        const experienceDescRow =
            document.getElementById(
                "experienceDescRow"
            );

        const availabilityOtherBox =
            document.getElementById(
                "availabilityOtherBox"
            );

        const availabilityOther =
            document.querySelector(
                'input[name="availabilityOther"]'
            );

        if (gender && genderOtherRow) {
            function updateGender() {
                genderOtherRow.hidden =
                    gender.value !== "Other";
            }

            gender.addEventListener(
                "change",
                updateGender
            );

            updateGender();
        }

        if (
            profession &&
            professionOtherRow &&
            collegeRow
        ) {
            function updateProfession() {
                professionOtherRow.hidden =
                    profession.value !== "Other";

                collegeRow.hidden =
                    profession.value !== "College student";
            }

            profession.addEventListener(
                "change",
                updateProfession
            );

            updateProfession();
        }

        // Art form is now a multi-select checkbox group, so visibility of
        // the "please specify" box has to be based on whether ANY checkbox
        // in the group is "Other" and checked — not just the one that was
        // just clicked (that check alone breaks once more than one box can
        // be checked at a time).
        if (artFormCheckboxes.length && artFormOther) {
            function updateArtFormOther() {
                const otherChecked = Array.from(
                    artFormCheckboxes
                ).some(function(checkbox) {
                    return (
                        checkbox.checked &&
                        checkbox.value === "Other"
                    );
                });

                artFormOther.hidden = !otherChecked;
            }

            artFormCheckboxes.forEach(function(checkbox) {
                checkbox.addEventListener(
                    "change",
                    updateArtFormOther
                );
            });

            updateArtFormOther();
        }

        document
            .querySelectorAll(
                'input[name="hasExperience"]'
            )
            .forEach(function(radio) {

                radio.addEventListener(
                    "change",
                    function() {

                        if (experienceOther) {
                            experienceOther.hidden =
                                !(
                                    radio.checked &&
                                    radio.value === "Other"
                                );
                        }

                        if (experienceDescRow) {
                            experienceDescRow.hidden =
                                !(
                                    radio.checked &&
                                    radio.value === "Yes"
                                );
                        }
                    }
                );
            });

        if (
            availabilityOtherBox &&
            availabilityOther
        ) {
            function updateAvailability() {
                availabilityOther.hidden =
                    !availabilityOtherBox.checked;
            }

            availabilityOtherBox.addEventListener(
                "change",
                updateAvailability
            );

            updateAvailability();
        }
    }

    function renderReview() {
        const data = collectFormData();

        const gender =
            data.gender === "Other"
                ? data.genderOther
                : data.gender;

        const profession =
            data.profession === "Other"
                ? data.professionOther
                : data.profession;

        const artFormValues =
            Array.isArray(data.artForm)
                ? data.artForm
                : (data.artForm ? [data.artForm] : []);

        const artForm = artFormValues
            .map(function(value) {
                return value === "Other"
                    ? (data.artFormOther || "Other")
                    : value;
            })
            .join(", ");

        const rows = [
            ["Name", data.fullName],
            ["Username", data.username],
            ["Email", data.email],
            [
                "Date of birth",
                `${data.dobDay}/${data.dobMonth}/${data.dobYear}`
            ],
            ["Gender", gender],
            ["Contact", data.contactNumber],
            ["WhatsApp", data.whatsappNumber],
            ["Blood group", data.bloodGroup],
            ["Profession", profession],
            ["Art form", artForm],
            [
                "Experience",
                data.hasExperience === "Other"
                    ? data.experienceOther
                    : data.hasExperience
            ],
            [
                "Availability",
                data.availability.join(", ")
            ]
        ].filter(function(item) {
            return item[1];
        });

        reviewBox.innerHTML = `
            <p style="margin:0 0 10px;font-weight:700;">
                Quick review
            </p>
            <dl>
                ${rows.map(function(item) {
                    return `
                        <dt>${escapeHtml(String(item[0]))}</dt>
                        <dd>${escapeHtml(String(item[1]))}</dd>
                    `;
                }).join("")}
            </dl>
        `;

        reviewBox.hidden = false;
    }

    function escapeHtml(value) {
        const div =
            document.createElement("div");

        div.textContent = value;

        return div.innerHTML;
    }

    // Fields that can have more than one value selected at once (checkbox
    // groups) get collected into an array instead of being overwritten by
    // the last matching entry.
    const MULTI_VALUE_FIELDS = ["availability", "artForm"];

    function collectFormData() {
        const formData =
            new FormData(form);

        const data = {};

        for (const [key, value] of formData.entries()) {
            if (MULTI_VALUE_FIELDS.includes(key)) {
                if (!data[key]) {
                    data[key] = [];
                }

                data[key].push(value);
            } else {
                data[key] = value;
            }
        }

        MULTI_VALUE_FIELDS.forEach(function(key) {
            if (!data[key]) {
                data[key] = [];
            }
        });

        return data;
    }

    async function submitRegistration() {
        const data =
            collectFormData();

        delete data.confirmPassword;

        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
        stepError.textContent = "";

        try {
            const response =
                await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(data)
                });

            let result;

            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error(
                    "Invalid server response."
                );
            }

            if (!response.ok) {
                stepError.textContent =
                    result.message ||
                    "Registration failed.";

                submitBtn.disabled = false;
                submitBtn.textContent =
                    "Submit registration";

                return;
            }

            form.hidden = true;

            if (progress) {
                progress.hidden = true;
            }

            successCard.hidden = false;

            if (
                typeof closeAuthPopupAndRedirect ===
                "function"
            ) {
                closeAuthPopupAndRedirect(
                    "dashboard.html",
                    1800
                );
            }

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            stepError.textContent =
                "Unable to connect to the server.";

            submitBtn.disabled = false;
            submitBtn.textContent =
                "Submit registration";
        }
    }
});