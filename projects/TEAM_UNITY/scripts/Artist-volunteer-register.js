
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
    return typeSelect.value === "Artist"
      ? artistFields
      : volunteerFields;
  }

  function updateBranch() {
    const type = typeSelect.value;

    artistFields.hidden = type !== "Artist";
    volunteerFields.hidden = type !== "Volunteer";

    // Disable inactive branch so its required fields do not interfere.
    [artistFields, volunteerFields].forEach(branch => {
      const inactive = branch.hidden;
      branch.querySelectorAll("input, select, textarea").forEach(input => {
        input.disabled = inactive;
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

    sections = [
      form.querySelector('[data-section="type"]'),
      ...Array.from(getActiveFields().querySelectorAll(".form-section"))
    ];

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

  function validateCurrentStep() {
    const section = sections[currentStep];

    stepError.textContent = "";

    if (currentStep === 0 && !typeSelect.value) {
      stepError.textContent = "Please select Artist or Volunteer.";
      typeSelect.focus();
      return false;
    }

    // Validate visible required inputs in the current section.
    const fields = Array.from(
      section.querySelectorAll("input:not(:disabled), select:not(:disabled), textarea:not(:disabled)")
    ).filter(input => !input.closest("[hidden]"));

    for (const input of fields) {
      if (!input.checkValidity()) {
        input.reportValidity();
        return false;
      }
    }

    const name = typeSelect.value === "Artist" ? "artist" : "volunteer";

    // Password confirmation.
    if (section.dataset.section === "artist-account") {
      const password = form.elements["artist_password"].value;
      const confirm = form.elements["artist_confirmPassword"].value;

      if (password !== confirm) {
        stepError.textContent = "Passwords do not match.";
        form.elements["artist_confirmPassword"].focus();
        return false;
      }
    }

    // At least one selected checkbox from required groups.
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

    // Validate dates in the Artist form.
    if (section.dataset.section === "artist-personal") {
      const day = Number(form.elements["artist_dobDay"].value);
      const month = Number(form.elements["artist_dobMonth"].value);
      const year = Number(form.elements["artist_dobYear"].value);

      const date = new Date(year, month - 1, day);

      if (
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

  // PASSWORD VISIBILITY
  document.querySelectorAll(".toggle-password").forEach(button => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.target);

      input.type = input.type === "password" ? "text" : "password";

      button.textContent = input.type === "password" ? "👁" : "🙈";
    });
  });

  // CONDITIONAL FIELD HELPER
  function conditional(trigger, wrapper, input, condition = "checked") {
    const control = document.getElementById(trigger);
    const container = document.getElementById(wrapper);
    const field = form.elements[input];

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

  // ARTIST CONDITIONAL FIELDS
  conditional("artistGender", "artistGenderOtherWrap", "artist_genderOther", "Other");
  conditional("artistArtOther", "artistArtOtherText", "artist_artFormOther");
  conditional("artistAvailabilityOther", "artistAvailabilityOtherText", "artist_availabilityOther");

  conditional(
    "artistProfession",
    "artistProfessionOtherWrap",
    "artist_professionOther",
    "Other"
  );

  function updateCollege() {
    const visible = form.elements["artist_profession"].value === "College student";
    const wrapper = document.getElementById("artistCollegeWrap");
    const input = form.elements["artist_collegeName"];

    wrapper.hidden = !visible;
    input.disabled = !visible;
    input.required = visible;

    if (!visible) input.value = "";
  }

  form.elements["artist_profession"].addEventListener("change", updateCollege);
  updateCollege();

  // ARTIST EXPERIENCE
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

    otherWrap.hidden = value !== "Other";
    descWrap.hidden = value !== "Yes";

    otherInput.disabled = value !== "Other";
    descInput.disabled = value !== "Yes";

    otherInput.required = value === "Other";
    descInput.required = value === "Yes";

    if (value !== "Other") otherInput.value = "";
    if (value !== "Yes") descInput.value = "";
  }

  artistExperience.forEach(input =>
    input.addEventListener("change", updateArtistExperience)
  );

  updateArtistExperience();

  // VOLUNTEER CONDITIONAL FIELDS
  conditional("volunteerGenderOther", "volunteerGenderOtherText", "volunteer_genderOther");

  conditional(
    "volunteerStatus",
    "volunteerStatusOtherWrap",
    "volunteer_statusOther",
    "Other"
  );

  conditional("volunteerSkillOther", "volunteerSkillOtherText", "volunteer_skillOther");
  conditional("volunteerLanguageOther", "volunteerLanguageOtherText", "volunteer_languageOther");

  // VOLUNTEER PREVIOUS EXPERIENCE
  const volunteerExperience = form.querySelectorAll(
    'input[name="volunteer_previousExperience"]'
  );

  function updateVolunteerExperience() {
    const value = form.querySelector(
      'input[name="volunteer_previousExperience"]:checked'
    )?.value;

    const wrapper = document.getElementById("volunteerExperienceWrap");
    const input = form.elements["volunteer_experienceDetails"];

    wrapper.hidden = value !== "Yes";
    input.disabled = value !== "Yes";

    if (value !== "Yes") input.value = "";
  }

  volunteerExperience.forEach(input =>
    input.addEventListener("change", updateVolunteerExperience)
  );

  updateVolunteerExperience();

  // SUBMISSION
  form.addEventListener("submit", async event => {
    event.preventDefault();

    if (!validateCurrentStep()) return;

    const type = typeSelect.value;

    const activeBranch = getActiveFields();

    const data = new FormData(form);
    const result = {
      registrationType: type,
      submittedAt: new Date().toISOString(),
      details: {}
    };

    for (const [key, value] of data.entries()) {
      if (key === "registrationType") continue;

      const cleanKey = key.replace(/^(artist|volunteer)_/, "");

      if (result.details[cleanKey] !== undefined) {
        if (!Array.isArray(result.details[cleanKey])) {
          result.details[cleanKey] = [result.details[cleanKey]];
        }

        result.details[cleanKey].push(value);
      } else {
        result.details[cleanKey] = value;
      }
    }

    /*
      BACKEND INTEGRATION:
      Send `result` to your actual registration API here.

      Do not show a success message until your server confirms
      that the registration has been saved successfully.
    */

    console.log("Registration data:", result);

    stepError.textContent =
      "Form validated. Connect your registration API to save the details.";

    // Prevent accidental loss of the form data.
    console.log("Active registration branch:", activeBranch.id);
  });

  // INITIAL STATE
  updateBranch();
});
