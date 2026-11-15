    (function () {
      "use strict";

      const form = document.getElementById("regForm");
      const steps = Array.from(form.querySelectorAll(".step"));
      const progressSteps = Array.from(document.querySelectorAll(".progress-step"));
      const backBtn = document.getElementById("backBtn");
      const nextBtn = document.getElementById("nextBtn");
      const submitBtn = document.getElementById("submitBtn");
      const stepError = document.getElementById("stepError");
      const reviewBox = document.getElementById("reviewBox");
      const successCard = document.getElementById("successCard");
      const TOTAL = steps.length;
      let current = 1;

      /* ---------- Helpers ---------- */
      const $ = (sel, root = form) => root.querySelector(sel);

      function showError(msg) {
        stepError.textContent = msg;
        stepError.classList.add("warn");
      }

      function clearError() {
        stepError.textContent = "";
        stepError.classList.remove("warn");
        form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
      }

      /* ---------- Conditional fields ---------- */
      function toggleRow(row, show) {
        if (!row) return;
        row.hidden = !show;
        row.querySelectorAll("input").forEach(i => {
          i.disabled = !show;
          if (!show) i.value = "";
        });
      }

      // Gender → Other
      const genderSelect = $('select[name="gender"]');
      genderSelect.addEventListener("change", () => {
        toggleRow($("#genderOtherRow"), genderSelect.value === "Other");
      });

      // Profession → Other / College student
      const professionSelect = $('select[name="profession"]');
      professionSelect.addEventListener("change", () => {
        const v = professionSelect.value;
        toggleRow($("#professionOtherRow"), v === "Other");
        toggleRow($("#collegeRow"), v === "College student");
      });

      // Art form → Other
      const artFormGrid = $("#artFormGrid");
      const artFormOther = $('input[name="artFormOther"]');
      artFormGrid.addEventListener("change", () => {
        const otherChecked = artFormGrid.querySelector('input[value="Other"]').checked;
        artFormOther.hidden = !otherChecked;
        if (!otherChecked) artFormOther.value = "";
      });

      // Experience → Other / Yes (description)
      const expOther = $('input[name="hasExperience"][value="Other"]').closest("fieldset");
      const experienceOther = $('input[name="experienceOther"]');
      const experienceDesc = $("#experienceDescRow");
      expOther.addEventListener("change", () => {
        const val = $('input[name="hasExperience"]:checked', expOther)?.value;
        experienceOther.hidden = val !== "Other";
        experienceDesc.hidden = val !== "Yes";
        if (val !== "Other") experienceOther.value = "";
        if (val !== "Yes") experienceDesc.value = "";
      });

      // Availability → Other
      const availabilityGrid = $("#availabilityGrid");
      const availabilityOther = $('input[name="availabilityOther"]');
      availabilityGrid.addEventListener("change", () => {
        const otherChecked = $("#availabilityOtherBox").checked;
        availabilityOther.hidden = !otherChecked;
        if (!otherChecked) availabilityOther.value = "";
      });

      /* ---------- Password visibility toggle ---------- */
      document.querySelectorAll(".toggle-visibility").forEach(btn => {
        btn.addEventListener("click", () => {
          const input = document.getElementById(btn.dataset.target);
          const showing = input.type === "text";
          input.type = showing ? "password" : "text";
          btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
        });
      });

      /* ---------- Validation per step ---------- */
      const PHONE_RE = /^\d{10}$/;
      const USER_RE = /^[A-Za-z0-9_.]{3,20}$/;
      const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      function markInvalid(el, msg) {
        el.classList.add("invalid");
        if (!showError.first) showError.first = el;
        return msg;
      }

      function validateStep(n) {
        clearError();
        showError.first = null;
        const errors = [];
        const section = steps[n - 1];

        if (n === 1) {
          const fullName = $('input[name="fullName"]');
          if (!fullName.value.trim()) errors.push(markInvalid(fullName, "Please enter your full name."));

          const username = $('input[name="username"]');
          if (!USER_RE.test(username.value.trim())) errors.push(markInvalid(username, "Username must be 3–20 characters: letters, numbers, underscore or dot."));

          const email = $('input[name="email"]');
          if (!EMAIL_RE.test(email.value.trim())) errors.push(markInvalid(email, "Please enter a valid email address."));

          const pw = $("#passwordInput");
          const cpw = $("#confirmPasswordInput");
          if (pw.value.length < 8) errors.push(markInvalid(pw, "Password must be at least 8 characters."));
          if (cpw.value !== pw.value) errors.push(markInvalid(cpw, "Passwords do not match."));
        }

        if (n === 2) {
          const d = $('input[name="dobDay"]'), m = $('input[name="dobMonth"]'), y = $('input[name="dobYear"]');
          const day = parseInt(d.value, 10), month = parseInt(m.value, 10), year = parseInt(y.value, 10);
          const validDate = day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= new Date().getFullYear();
          if (!validDate) {
            [d, m, y].forEach(el => { if (!el.value.trim()) el.classList.add("invalid"); });
            errors.push("Please enter a valid date of birth (DD / MM / YYYY).");
          }

          const gender = $('select[name="gender"]');
          if (!gender.value) errors.push(markInvalid(gender, "Please select your gender."));
          if (gender.value === "Other" && !$('input[name="genderOther"]').value.trim()) {
            errors.push(markInvalid($('input[name="genderOther"]'), "Please specify your gender."));
          }

          const contact = $('input[name="contactNumber"]');
          if (!PHONE_RE.test(contact.value.trim())) errors.push(markInvalid(contact, "Contact number must be exactly 10 digits."));

          const wa = $('input[name="whatsappNumber"]');
          if (!PHONE_RE.test(wa.value.trim())) errors.push(markInvalid(wa, "WhatsApp number must be exactly 10 digits."));

          const blood = $('select[name="bloodGroup"]');
          if (!blood.value) errors.push(markInvalid(blood, "Please select your blood group."));

          const prof = $('select[name="profession"]');
          if (!prof.value) errors.push(markInvalid(prof, "Please select your profession."));
          if (prof.value === "Other" && !$('input[name="professionOther"]').value.trim()) {
            errors.push(markInvalid($('input[name="professionOther"]'), "Please specify your profession."));
          }
          if (prof.value === "College student" && !$('input[name="collegeName"]').value.trim()) {
            errors.push(markInvalid($('input[name="collegeName"]'), "Please enter your college or institution name."));
          }
        }

        if (n === 3) {
          const why = $('textarea[name="whyJoin"]');
          if (!why.value.trim()) errors.push(markInvalid(why, "Please tell us why you want to join."));

          const arts = form.querySelectorAll('input[name="artForm"]:checked');
          if (arts.length === 0) errors.push("Please select at least one art form.");
          const artOtherChecked = $('#artFormGrid input[value="Other"]').checked;
          if (artOtherChecked && !artFormOther.value.trim()) {
            errors.push(markInvalid(artFormOther, "Please specify the other art form."));
          }

          const exp = form.querySelector('input[name="hasExperience"]:checked');
          if (!exp) errors.push("Please tell us whether you have prior experience.");
          if (exp && exp.value === "Other" && !experienceOther.value.trim()) {
            errors.push(markInvalid(experienceOther, "Please specify your experience."));
          }
          if (exp && exp.value === "Yes" && !experienceDesc.value.trim()) {
            errors.push(markInvalid(experienceDesc, "Please describe how much experience you have."));
          }
        }

        if (n === 4) {
          const avail = form.querySelectorAll('input[name="availability"]:checked');
          if (avail.length === 0) errors.push("Please select your availability.");
          if ($("#availabilityOtherBox").checked && !availabilityOther.value.trim()) {
            errors.push(markInvalid(availabilityOther, "Please specify your other availability."));
          }
          const decl = $('input[name="declaration"]');
          if (!decl.checked) errors.push("Please confirm the declaration to continue.");
        }

        if (errors.length) {
          showError(errors[0]);
          if (showError.first) showError.first.focus();
          return false;
        }
        return true;
      }

      /* ---------- Step navigation ---------- */
      function showStep(n) {
        current = n;
        steps.forEach(s => s.classList.toggle("active", Number(s.dataset.step) === n));
        progressSteps.forEach(p => {
          const idx = Number(p.dataset.step);
          p.classList.toggle("active", idx === n);
          p.classList.toggle("done", idx < n);
        });

        backBtn.hidden = n === 1;
        nextBtn.hidden = n === TOTAL;
        submitBtn.hidden = n !== TOTAL;

        if (n === TOTAL) buildReview();
        else reviewBox.hidden = true;

        clearError();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      nextBtn.addEventListener("click", () => {
        if (validateStep(current)) showStep(current + 1);
      });

      backBtn.addEventListener("click", () => {
        clearError();
        showStep(current - 1);
      });

      /* ---------- Review summary on last step ---------- */
      function buildReview() {
        const fd = new FormData(form);
        const get = name => (fd.get(name) || "").toString().trim();
        const getAll = name => fd.getAll(name).filter(Boolean);

        const gender = get("gender") === "Other" ? get("genderOther") : get("gender");
        const profession = get("profession") === "Other"
          ? get("professionOther")
          : get("profession") === "College student"
            ? `College student (${get("collegeName")})`
            : get("profession");

        let artForms = getAll("artForm");
        artForms = artForms.map(a => a === "Other" ? `Other: ${get("artFormOther")}` : a);

        const exp = get("hasExperience");
        const expText = exp === "Yes" ? `Yes — ${get("experienceDesc")}`
          : exp === "Other" ? `Other — ${get("experienceOther")}`
          : exp;

        let avail = getAll("availability");
        avail = avail.map(a => a === "Other" ? `Other: ${get("availabilityOther")}` : a);

        const rows = [
          ["Full name", get("fullName")],
          ["Username", get("username")],
          ["Email", get("email")],
          ["Date of birth", `${get("dobDay")} / ${get("dobMonth")} / ${get("dobYear")}`],
          ["Gender", gender],
          ["Contact", get("contactNumber")],
          ["WhatsApp", get("whatsappNumber")],
          ["Blood group", get("bloodGroup")],
          ["Profession", profession],
          ["Art form(s)", artForms.join(", ")],
          ["Prior experience", expText],
          ["Other skills", get("otherSkills") || "—"],
          ["Availability", avail.join(", ")]
        ];

        reviewBox.innerHTML = "";
        const h3 = document.createElement("h3");
        h3.textContent = "Review your details";
        const dl = document.createElement("dl");
        dl.className = "review-list";
        rows.forEach(([k, v]) => {
          const dt = document.createElement("dt");
          dt.textContent = k;
          const dd = document.createElement("dd");
          dd.textContent = v || "—";
          dl.append(dt, dd);
        });
        reviewBox.append(h3, dl);
        reviewBox.hidden = false;
      }

      /* ---------- Submit ---------- */
      form.addEventListener("submit", e => {
        e.preventDefault();
        if (!validateStep(current)) return;

        const payload = Object.fromEntries(new FormData(form).entries());
        payload.artForm = new FormData(form).getAll("artForm");
        payload.availability = new FormData(form).getAll("availability");
        payload.submittedAt = new Date().toISOString();

        console.log("Registration payload:", payload);

        form.hidden = true;
        document.getElementById("progress").hidden = true;
        document.querySelector(".reg-intro").hidden = true;
        successCard.hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      });

      // Initial state
      showStep(1);
    })();
