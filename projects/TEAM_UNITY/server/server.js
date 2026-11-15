
/* ==========================================
   TEAM UNITY SERVER
========================================== */

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./database");
const registrationDB = require("./registrationDatabase");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));


/* ==========================================
   ACCOUNT STATUS
========================================== */

app.post("/api/account-status", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    db.get(
        `SELECT id, name, email, role
         FROM users WHERE LOWER(email) = ?`,
        [email],
        (error, user) => {
            if (error) {
                console.error("ACCOUNT CHECK ERROR:", error);
                return res.status(500).json({
                    message: "Unable to check the account."
                });
            }

            res.json({
                exists: Boolean(user),
                role: user ? user.role : null
            });
        }
    );
});


/* ==========================================
   LEGACY ARTIST REGISTRATION
   Keeps your existing Artist registration page working.
========================================== */

app.post("/api/register", async (req, res) => {
    const data = req.body || {};

    const fullName = String(data.fullName || "").trim();
    const username = String(data.username || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");

    if (!fullName || !username || !email || !password) {
        return res.status(400).json({
            message: "Name, username, email and password are required."
        });
    }

    if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) {
        return res.status(400).json({
            message: "Username must be 3–20 characters using letters, numbers, dots or underscores."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Your password must contain at least 8 characters."
        });
    }

    const declaration = data.declaration;

    if (
        declaration !== "on" &&
        declaration !== true &&
        declaration !== "true" &&
        declaration !== 1
    ) {
        return res.status(400).json({
            message: "Please accept the declaration."
        });
    }

    const artForms = Array.isArray(data.artForm)
        ? data.artForm
        : (data.artForm ? [data.artForm] : []);

    const availability = Array.isArray(data.availability)
        ? data.availability
        : (data.availability ? [data.availability] : []);

    if (!artForms.length || !availability.length) {
        return res.status(400).json({
            message: "Please select at least one art form and availability option."
        });
    }

    const savedArtForms = artForms.map(value =>
        value === "Other" && data.artFormOther
            ? `Other: ${String(data.artFormOther).trim()}`
            : value
    );

    const savedAvailability = availability.map(value =>
        value === "Other" && data.availabilityOther
            ? `Other: ${String(data.availabilityOther).trim()}`
            : value
    );

    const gender = data.gender === "Other"
        ? `Other: ${String(data.genderOther || "").trim()}`
        : String(data.gender || "");

    const profession = data.profession === "Other"
        ? `Other: ${String(data.professionOther || "").trim()}`
        : String(data.profession || "");

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const duplicateSQL = `
            SELECT 1 AS found FROM users WHERE LOWER(email) = ?
            UNION ALL
            SELECT 1 AS found FROM registrations WHERE LOWER(email) = ?
            UNION ALL
            SELECT 1 AS found FROM registrations WHERE LOWER(username) = ?
            LIMIT 1
        `;

        db.get(
            duplicateSQL,
            [email, email, username.toLowerCase()],
            (checkError, existingAccount) => {
                if (checkError) {
                    console.error("ARTIST ACCOUNT CHECK ERROR:", checkError);
                    return res.status(500).json({
                        message: "Unable to check the existing account."
                    });
                }

                if (existingAccount) {
                    return res.status(409).json({
                        exists: true,
                        message: "This email or username is already registered. Please log in or choose another username."
                    });
                }

                const sql = `
                    INSERT INTO registrations (
                        full_name, username, email, password,
                        dob_day, dob_month, dob_year, gender,
                        contact_number, whatsapp_number, blood_group,
                        profession, college, why_join, art_form,
                        has_experience, experience_description,
                        other_skills, availability, declaration_agreed
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    fullName, username, email, hashedPassword,
                    String(data.dobDay || ""),
                    String(data.dobMonth || ""),
                    String(data.dobYear || ""),
                    gender,
                    String(data.contactNumber || "").trim(),
                    String(data.whatsappNumber || "").trim(),
                    String(data.bloodGroup || ""),
                    profession,
                    String(data.collegeName || "").trim(),
                    String(data.whyJoin || "").trim(),
                    JSON.stringify(savedArtForms),
                    String(data.hasExperience || ""),
                    String(data.experienceDesc || data.experienceDescription || ""),
                    String(data.otherSkills || "").trim(),
                    JSON.stringify(savedAvailability),
                    1
                ];

                db.run(sql, values, function (registrationError) {
                    if (registrationError) {
                        console.error("ARTIST REGISTRATION INSERT ERROR:", registrationError);
                        return res.status(500).json({
                            message: "Unable to save your Artist registration."
                        });
                    }

                    const registrationId = this.lastID;

                    db.run(
                        `INSERT INTO users (name, email, password, role)
                         VALUES (?, ?, ?, ?)`,
                        [fullName, email, hashedPassword, "artist"],
                        function (userError) {
                            if (userError) {
                                console.error("ARTIST USER CREATION ERROR:", userError);

                                return db.run(
                                    "DELETE FROM registrations WHERE id = ?",
                                    [registrationId],
                                    () => res.status(409).json({
                                        message: "This email is already registered. Please log in instead."
                                    })
                                );
                            }

                            res.status(201).json({
                                message: "Artist registration successful!",
                                user: {
                                    id: this.lastID,
                                    name: fullName,
                                    email,
                                    role: "artist"
                                }
                            });
                        }
                    );
                });
            }
        );
    } catch (error) {
        console.error("ARTIST REGISTRATION ERROR:", error);
        res.status(500).json({
            message: "Unable to complete Artist registration."
        });
    }
});


/* ==========================================
   TRAINER REGISTRATION
   Existing legacy Trainer route preserved.
========================================== */

app.post("/api/trainer-register", async (req, res) => {
    const data = req.body || {};

    const cleanName = String(data.fullName || "").trim();
    const cleanUsername = String(data.username || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "");

    if (!cleanName || !cleanUsername || !email || !password) {
        return res.status(400).json({
            message: "Name, username, email and password are required."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Your password must contain at least 8 characters."
        });
    }

    if (
        data.declarationAgreed !== true &&
        data.declarationAgreed !== 1 &&
        data.declarationAgreed !== "true"
    ) {
        return res.status(400).json({
            message: "Please accept the declaration."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.get(
            `SELECT email FROM users WHERE LOWER(email) = ?
             UNION
             SELECT email FROM registrations WHERE LOWER(email) = ?
             LIMIT 1`,
            [email, email],
            (checkError, existingAccount) => {
                if (checkError) {
                    console.error("TRAINER ACCOUNT CHECK ERROR:", checkError);
                    return res.status(500).json({
                        message: "Unable to check the existing account."
                    });
                }

                if (existingAccount) {
                    return res.status(409).json({
                        exists: true,
                        message: "This email is already registered. Please log in."
                    });
                }

                const sql = `
                    INSERT INTO registrations (
                        full_name, username, email, password,
                        dob_day, dob_month, dob_year, gender,
                        contact_number, whatsapp_number, blood_group,
                        profession, college, why_join, art_form,
                        has_experience, experience_description,
                        other_skills, availability, declaration_agreed
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const values = [
                    cleanName,
                    cleanUsername,
                    email,
                    hashedPassword,
                    data.dobDay || null,
                    data.dobMonth || null,
                    data.dobYear || null,
                    data.gender || "",
                    data.contactNumber || "",
                    data.whatsappNumber || "",
                    data.bloodGroup || "",
                    data.profession || "",
                    data.collegeName || "",
                    data.whyJoin || "",
                    JSON.stringify(data.artForm || []),
                    data.hasExperience || "",
                    data.experienceDescription || "",
                    data.otherSkills || "",
                    JSON.stringify(data.availability || []),
                    1
                ];

                db.run(sql, values, function (registrationError) {
                    if (registrationError) {
                        console.error("TRAINER REGISTRATION ERROR:", registrationError);
                        return res.status(500).json({
                            message: "Unable to save trainer registration."
                        });
                    }

                    const registrationId = this.lastID;

                    db.run(
                        `INSERT INTO users (name, email, password, role)
                         VALUES (?, ?, ?, ?)`,
                        [cleanName, email, hashedPassword, "Trainer"],
                        function (userError) {
                            if (userError) {
                                console.error("TRAINER USER CREATION ERROR:", userError);

                                db.run(
                                    "DELETE FROM registrations WHERE id = ?",
                                    [registrationId]
                                );

                                return res.status(500).json({
                                    message: "The trainer account could not be created. Please try again."
                                });
                            }

                            res.status(201).json({
                                message: "Trainer registration successful! You can now log in.",
                                user: {
                                    id: this.lastID,
                                    name: cleanName,
                                    email,
                                    role: "Trainer"
                                }
                            });
                        }
                    );
                });
            }
        );
    } catch (error) {
        console.error("TRAINER REGISTRATION ERROR:", error);
        res.status(500).json({
            message: "An unexpected error occurred during registration."
        });
    }
});


/* ==========================================
   LEGACY VOLUNTEER REGISTRATION
   Keeps your previous Volunteer page working.
========================================== */

app.post("/api/volunteer-register", (req, res) => {
    const data = req.body || {};

    const requiredFields = [
        "fullName", "dateOfBirth", "gender", "phone", "email",
        "city", "currentStatus", "previousExperience",
        "availability", "preferredTime", "motivation"
    ];

    const missingField = requiredFields.find(field =>
        data[field] === undefined ||
        data[field] === null ||
        String(data[field]).trim() === ""
    );

    if (missingField) {
        return res.status(400).json({
            message: `Please provide ${missingField}.`
        });
    }

    if (
        !Array.isArray(data.skills) || !data.skills.length ||
        !Array.isArray(data.languages) || !data.languages.length
    ) {
        return res.status(400).json({
            message: "Please select at least one skill and language."
        });
    }

    if (
        data.contactConsent !== true ||
        data.guidelinesAgreement !== true ||
        data.privacyAcknowledgement !== true
    ) {
        return res.status(400).json({
            message: "All required declarations must be accepted."
        });
    }

    const email = String(data.email).trim().toLowerCase();

    db.get(
        `SELECT email FROM users WHERE LOWER(email) = ?
         UNION
         SELECT email FROM registrations WHERE LOWER(email) = ?
         UNION
         SELECT email FROM volunteer_registrations WHERE LOWER(email) = ?
         LIMIT 1`,
        [email, email, email],
        (checkError, existingUser) => {
            if (checkError) {
                console.error("VOLUNTEER DUPLICATE CHECK ERROR:", checkError);
                return res.status(500).json({
                    message: "Unable to check the email address."
                });
            }

            if (existingUser) {
                return res.status(409).json({
                    message: "This email is already registered. Please log in or contact Team Unity."
                });
            }

            const sql = `
                INSERT INTO volunteer_registrations (
                    full_name, date_of_birth, gender, phone, email,
                    city, address, current_status, institution, course,
                    profession, skills, previous_experience,
                    experience_details, languages, availability,
                    preferred_time, motivation, contribution,
                    additional_info, contact_consent,
                    guidelines_agreement, privacy_acknowledgement
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                String(data.fullName).trim(),
                data.dateOfBirth,
                data.gender,
                String(data.phone).trim(),
                email,
                String(data.city).trim(),
                data.address || "",
                data.currentStatus,
                data.institution || "",
                data.course || "",
                data.profession || "",
                JSON.stringify(data.skills),
                data.previousExperience,
                data.experienceDetails || "",
                JSON.stringify(data.languages),
                data.availability,
                data.preferredTime,
                String(data.motivation).trim(),
                data.contribution || "",
                data.additionalInfo || "",
                1, 1, 1
            ];

            db.run(sql, values, function (insertError) {
                if (insertError) {
                    console.error("VOLUNTEER REGISTRATION ERROR:", insertError);
                    return res.status(500).json({
                        message: "Unable to save the volunteer registration."
                    });
                }

                res.status(201).json({
                    message: "Volunteer registration submitted successfully!",
                    registrationId: this.lastID
                });
            });
        }
    );
});


/* ==========================================
   NEW UNIFIED ARTIST / VOLUNTEER REGISTRATION
   Saves complete form data to Teamunitydata.db.
========================================== */

app.post("/api/unified-registration", async (req, res) => {
    try {
        await registrationDB.ready;

        const type = String(req.body.registrationType || "").trim();
        const details = req.body.details;

        if (!["Artist", "Volunteer"].includes(type)) {
            return res.status(400).json({
                message: "Please select Artist or Volunteer."
            });
        }

        if (
            !details ||
            typeof details !== "object" ||
            Array.isArray(details)
        ) {
            return res.status(400).json({
                message: "Invalid registration data."
            });
        }

        const fullName = String(details.fullName || "").trim();
        const email = String(details.email || "").trim().toLowerCase();

        if (!fullName || !email) {
            return res.status(400).json({
                message: "Full name and email are required."
            });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        let username = null;
        let passwordHash = null;

        if (type === "Artist") {
            username = String(details.username || "").trim();
            const password = String(details.password || "");
            const confirmPassword = String(details.confirmPassword || "");

            if (!username || !password) {
                return res.status(400).json({
                    message: "Username and password are required."
                });
            }

            if (!/^[A-Za-z0-9_.]{3,20}$/.test(username)) {
                return res.status(400).json({
                    message: "Username must be 3–20 characters using letters, numbers, dots or underscores."
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must contain at least 8 characters."
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    message: "Passwords do not match."
                });
            }

            if (details.declaration !== true) {
                return res.status(400).json({
                    message: "Please accept the Artist declaration."
                });
            }

            if (
                !Array.isArray(details.artForm) ||
                details.artForm.length === 0 ||
                !Array.isArray(details.availability) ||
                details.availability.length === 0
            ) {
                return res.status(400).json({
                    message: "Please select your art forms and availability."
                });
            }

            if (
                !details.dobDay ||
                !details.dobMonth ||
                !details.dobYear
            ) {
                return res.status(400).json({
                    message: "Please provide your complete date of birth."
                });
            }

            try {
                passwordHash = await bcrypt.hash(password, 10);
            } catch (hashError) {
                console.error("PASSWORD HASH ERROR:", hashError);
                return res.status(500).json({
                    message: "Unable to secure your password."
                });
            }
        }

        if (type === "Volunteer") {
            const required = [
                "fullName", "dateOfBirth", "gender", "phone",
                "email", "city", "currentStatus",
                "previousExperience", "availability",
                "preferredTime", "motivation"
            ];

            const missing = required.find(key =>
                !String(details[key] || "").trim()
            );

            if (missing) {
                return res.status(400).json({
                    message: `Please provide ${missing}.`
                });
            }

            if (
                !Array.isArray(details.skills) ||
                !details.skills.length ||
                !Array.isArray(details.languages) ||
                !details.languages.length
            ) {
                return res.status(400).json({
                    message: "Please select at least one skill and language."
                });
            }

            if (
                details.contactConsent !== true ||
                details.guidelinesAgreement !== true ||
                details.privacyAcknowledgement !== true
            ) {
                return res.status(400).json({
                    message: "Please accept all required declarations."
                });
            }
        }

        // Do not store plain-text passwords in form_data.
        const savedDetails = { ...details };
        delete savedDetails.password;
        delete savedDetails.confirmPassword;

        const formDataJSON = JSON.stringify(savedDetails);

        // Check for duplicates in the new database first.
        const duplicate = await new Promise((resolve, reject) => {
            registrationDB.get(
                `SELECT id FROM registrations
                 WHERE LOWER(email) = ?
                    OR (? IS NOT NULL AND LOWER(username) = LOWER(?))
                 LIMIT 1`,
                [email, username, username],
                (error, row) => {
                    if (error) reject(error);
                    else resolve(row);
                }
            );
        });

        if (duplicate) {
            return res.status(409).json({
                message: "This email or username has already been submitted."
            });
        }

        // Check the existing account database as well.
        const oldAccount = await new Promise((resolve, reject) => {
            if (type === "Artist") {
                db.get(
                    `SELECT id FROM users WHERE LOWER(email) = ?
                     UNION
                     SELECT id FROM registrations
                     WHERE LOWER(email) = ? OR LOWER(username) = ?
                     LIMIT 1`,
                    [email, email, username.toLowerCase()],
                    (error, row) => {
                        if (error) reject(error);
                        else resolve(row);
                    }
                );
            } else {
                db.get(
                    `SELECT id FROM users WHERE LOWER(email) = ?
                     UNION
                     SELECT id FROM registrations WHERE LOWER(email) = ?
                     UNION
                     SELECT id FROM volunteer_registrations WHERE LOWER(email) = ?
                     LIMIT 1`,
                    [email, email, email],
                    (error, row) => {
                        if (error) reject(error);
                        else resolve(row);
                    }
                );
            }
        });

        if (oldAccount) {
            return res.status(409).json({
                message: type === "Artist"
                    ? "This email or username is already registered in Team Unity. Please log in or choose another."
                    : "This email is already registered in Team Unity."
            });
        }

        // Save the full submission in Teamunitydata.db.
        const registrationId = await new Promise((resolve, reject) => {
            registrationDB.run(
                `INSERT INTO registrations (
                    registration_type,
                    full_name,
                    email,
                    username,
                    password_hash,
                    form_data
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    type,
                    fullName,
                    email,
                    username,
                    passwordHash,
                    formDataJSON
                ],
                function (error) {
                    if (error) reject(error);
                    else resolve(this.lastID);
                }
            );
        });

        // Artist gets a login account in the existing teamunity.db.
        // Volunteer applications do not create login accounts.
        if (type === "Artist") {
            try {
                const userId = await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO users (name, email, password, role)
                         VALUES (?, ?, ?, ?)`,
                        [fullName, email, passwordHash, "artist"],
                        function (error) {
                            if (error) reject(error);
                            else resolve(this.lastID);
                        }
                    );
                });

                return res.status(201).json({
                    message: "Artist registration successful! You can now log in.",
                    registrationId,
                    user: {
                        id: userId,
                        name: fullName,
                        email,
                        role: "artist"
                    }
                });
            } catch (userError) {
                console.error("ARTIST LOGIN ACCOUNT ERROR:", userError);

                // Remove the new application if account creation fails.
                await new Promise(resolve => {
                    registrationDB.run(
                        "DELETE FROM registrations WHERE id = ?",
                        [registrationId],
                        resolve
                    );
                });

                return res.status(409).json({
                    message: "Unable to create your Artist login account. This email may already be registered."
                });
            }
        }

        return res.status(201).json({
            message: "Volunteer registration submitted successfully!",
            registrationId
        });

    } catch (error) {
        console.error("UNIFIED REGISTRATION ERROR:", error);

        if (error.code === "SQLITE_CONSTRAINT") {
            return res.status(409).json({
                message: "This email or username is already registered."
            });
        }

        return res.status(500).json({
            message: "Unable to save your registration. Please try again."
        });
    }
});


/* ==========================================
   TEAM UNITY LOGIN
========================================== */

app.post("/api/login", (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter your email and password."
        });
    }

    db.get(
        `SELECT id, name, email, password, role, profile_picture
         FROM users WHERE LOWER(email) = ?`,
        [email],
        async (error, user) => {
            if (error) {
                console.error("LOGIN DATABASE ERROR:", error);
                return res.status(500).json({
                    message: "Unable to process login."
                });
            }

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password."
                });
            }

            try {
                const passwordMatches = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!passwordMatches) {
                    return res.status(401).json({
                        message: "Invalid email or password."
                    });
                }

                // First try the existing registrations table.
                db.get(
                    `SELECT dob_day, dob_month, dob_year, profession
                     FROM registrations WHERE LOWER(email) = ?`,
                    [email],
                    async (registrationError, oldRegistration) => {
                        if (registrationError) {
                            console.error("LOGIN PROFILE LOOKUP ERROR:", registrationError);
                            return res.status(500).json({
                                message: "Unable to load your profile details."
                            });
                        }

                        let registration = oldRegistration;

                        // If this is a new unified Artist account,
                        // retrieve the details from Teamunitydata.db.
                        if (!registration) {
                            try {
                                await registrationDB.ready;

                                registration = await new Promise((resolve, reject) => {
                                    registrationDB.get(
                                        `SELECT form_data FROM registrations
                                         WHERE LOWER(email) = ?
                                           AND registration_type = 'Artist'`,
                                        [email],
                                        (lookupError, row) => {
                                            if (lookupError) reject(lookupError);
                                            else resolve(row);
                                        }
                                    );
                                });

                                if (registration && registration.form_data) {
                                    const details = JSON.parse(registration.form_data);

                                    registration = {
                                        dob_day: details.dobDay || "",
                                        dob_month: details.dobMonth || "",
                                        dob_year: details.dobYear || "",
                                        profession: details.profession === "Other"
                                            ? details.professionOther || "Other"
                                            : details.profession || ""
                                    };
                                } else {
                                    registration = null;
                                }
                            } catch (lookupError) {
                                console.error("NEW DATABASE PROFILE LOOKUP ERROR:", lookupError);
                                return res.status(500).json({
                                    message: "Unable to load your profile details."
                                });
                            }
                        }

                        let dob = null;
                        let profession = "";

                        if (registration) {
                            const day = String(registration.dob_day || "").trim();
                            const month = String(registration.dob_month || "").trim();
                            const year = String(registration.dob_year || "").trim();

                            if (day && month && year) {
                                dob = `${day}/${month}/${year}`;
                            }

                            profession = String(registration.profession || "").trim();
                        }

                        const isTrainer =
                            String(user.role || "").toLowerCase() === "trainer";

                        if (isTrainer) {
                            profession = "Trainer";
                        }

                        const defaultPicture = isTrainer
                            ? "src/trainer_dashboard_pfl.png"
                            : "src/artist_dashboard_pfl.png";

                        const profilePicture =
                            user.profile_picture &&
                            String(user.profile_picture).trim()
                                ? user.profile_picture
                                : defaultPicture;

                        return res.json({
                            message: "Login successful!",
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                profile_picture: profilePicture,
                                dob,
                                profession
                            }
                        });
                    }
                );
            } catch (loginError) {
                console.error("LOGIN ERROR:", loginError);
                return res.status(500).json({
                    message: "Unable to process login."
                });
            }
        }
    );
});


/* ==========================================
   GOOGLE DRIVE IMAGE ENDPOINT
========================================== */

const drive = require("./googledrive");

app.get("/api/drive-image/:id", async (req, res) => {
    try {
        const fileId = String(req.params.id || "").trim();

        if (!/^[a-zA-Z0-9_-]+$/.test(fileId)) {
            return res.status(400).send("Invalid Google Drive file ID.");
        }

        const response = await drive.files.get(
            {
                fileId,
                fields: "id,name,mimeType,webContentLink,webViewLink",
                alt: "media"
            },
            { responseType: "stream" }
        );

        res.setHeader(
            "Content-Type",
            response.headers["content-type"] || "application/octet-stream"
        );

        res.setHeader("Cache-Control", "public, max-age=3600");

        response.data.on("error", (error) => {
            console.error("GOOGLE DRIVE IMAGE STREAM ERROR:", error.message);

            if (!res.headersSent) {
                res.status(502).end("Unable to stream Google Drive image.");
            } else {
                res.destroy(error);
            }
        });

        response.data.pipe(res);

    } catch (error) {
        console.error(
            "GOOGLE DRIVE IMAGE ERROR:",
            error.response?.data || error.message
        );

        const status = error.code === 404
            ? 404
            : error.code === 403
                ? 403
                : 502;

        return res.status(status).send(
            status === 404
                ? "Google Drive image not found."
                : status === 403
                    ? "Google Drive access denied. Check service-account permissions."
                    : "Unable to retrieve Google Drive image."
        );
    }
});


/* ==========================================
   START SERVER
========================================== */

app.listen(PORT, async () => {
    console.log(`
=======================================================
Team Unity server running at http://localhost:${PORT}
=======================================================
    `);

    try {
        await registrationDB.ready;
        console.log("Unified registration database is ready.");
    } catch (error) {
        console.error("Unified registration database failed to initialize:", error);
    }
});
