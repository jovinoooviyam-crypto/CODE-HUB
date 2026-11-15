/* ==========================================
   TEAM UNITY TRAINER ACCOUNT CHECK
========================================== */

const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..")));

// Your API routes must come after this point


app.post("/api/account-status", (req, res) => {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    db.get(
        `SELECT id, name, email, role
         FROM users
         WHERE LOWER(email) = ?`,
        [email],
        (error, user) => {
            if (error) {
                console.error("ACCOUNT CHECK ERROR:", error);

                return res.status(500).json({
                    message: "Unable to check the account."
                });
            }

            return res.json({
                exists: Boolean(user),
                role: user ? user.role : null
            });
        }
    );
});

// ==========================================
// TEAM UNITY ARTIST REGISTRATION
// ==========================================

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
            SELECT 1 AS found
            FROM users
            WHERE LOWER(email) = ?

            UNION ALL

            SELECT 1 AS found
            FROM registrations
            WHERE LOWER(email) = ?

            UNION ALL

            SELECT 1 AS found
            FROM registrations
            WHERE LOWER(username) = ?

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

                const registrationSQL = `
                    INSERT INTO registrations (
                        full_name,
                        username,
                        email,
                        password,
                        dob_day,
                        dob_month,
                        dob_year,
                        gender,
                        contact_number,
                        whatsapp_number,
                        blood_group,
                        profession,
                        college,
                        why_join,
                        art_form,
                        has_experience,
                        experience_description,
                        other_skills,
                        availability,
                        declaration_agreed
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const registrationValues = [
                    fullName,
                    username,
                    email,
                    hashedPassword,
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

                db.run(
                    registrationSQL,
                    registrationValues,
                    function (registrationError) {
                        if (registrationError) {
                            console.error(
                                "ARTIST REGISTRATION INSERT ERROR:",
                                registrationError
                            );

                            if (registrationError.code === "SQLITE_CONSTRAINT") {
                                return res.status(409).json({
                                    message: "This email or username is already registered."
                                });
                            }

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
                                    console.error(
                                        "ARTIST USER CREATION ERROR:",
                                        userError
                                    );

                                    return db.run(
                                        "DELETE FROM registrations WHERE id = ?",
                                        [registrationId],
                                        () => {
                                            if (userError.code === "SQLITE_CONSTRAINT") {
                                                return res.status(409).json({
                                                    message: "This email is already registered. Please log in instead."
                                                });
                                            }

                                            return res.status(500).json({
                                                message: "Registration was not completed. Please try again."
                                            });
                                        }
                                    );
                                }

                                return res.status(201).json({
                                    message: "Artist registration successful!",
                                    user: {
                                        id: this.lastID,
                                        name: fullName,
                                        email: email,
                                        role: "artist"
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("ARTIST REGISTRATION ERROR:", error);

        return res.status(500).json({
            message: "Unable to complete Artist registration."
        });
    }
});


/* ==========================================
   TEAM UNITY TRAINER REGISTRATION
========================================== */

app.post("/api/trainer-register", async (req, res) => {

    console.log("TRAINER REGISTRATION BODY:", req.body);

    const {
        fullName,
        username,
        email,
        password,
        dobDay,
        dobMonth,
        dobYear,
        gender,
        contactNumber,
        whatsappNumber,
        bloodGroup,
        profession,
        collegeName,
        whyJoin,
        artForm,
        hasExperience,
        experienceDescription,
        otherSkills,
        availability,
        declarationAgreed
    } = req.body;

    const cleanName = String(fullName || "").trim();
    const cleanUsername = String(username || "").trim();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (
        !cleanName ||
        !cleanUsername ||
        !normalizedEmail ||
        !password
    ) {
        return res.status(400).json({
            message: "Name, username, email and password are required."
        });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        return res.status(400).json({
            message: "Please enter a valid email address."
        });
    }

    if (String(password).length < 8) {
        return res.status(400).json({
            message: "Your password must contain at least 8 characters."
        });
    }

    if (
        declarationAgreed !== true &&
        declarationAgreed !== 1 &&
        declarationAgreed !== "true"
    ) {
        return res.status(400).json({
            message: "Please accept the declaration."
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        /*
         * Check both tables before creating the account.
         * Existing accounts must use the normal login flow.
         */
        const accountSQL = `
            SELECT email FROM users WHERE LOWER(email) = ?
            UNION
            SELECT email FROM registrations WHERE LOWER(email) = ?
            LIMIT 1
        `;

        db.get(
            accountSQL,
            [normalizedEmail, normalizedEmail],
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
                        message:
                            "This email is already registered. Please log in to your existing Team Unity account."
                    });
                }

                const registrationSQL = `
                    INSERT INTO registrations (
                        full_name,
                        username,
                        email,
                        password,
                        dob_day,
                        dob_month,
                        dob_year,
                        gender,
                        contact_number,
                        whatsapp_number,
                        blood_group,
                        profession,
                        college,
                        why_join,
                        art_form,
                        has_experience,
                        experience_description,
                        other_skills,
                        availability,
                        declaration_agreed
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

                const registrationValues = [
                    cleanName,
                    cleanUsername,
                    normalizedEmail,
                    hashedPassword,
                    dobDay || null,
                    dobMonth || null,
                    dobYear || null,
                    gender || "",
                    contactNumber || "",
                    whatsappNumber || "",
                    bloodGroup || "",
                    profession || "",
                    collegeName || "",
                    whyJoin || "",
                    Array.isArray(artForm)
                        ? JSON.stringify(artForm)
                        : (artForm || ""),
                    hasExperience || "",
                    experienceDescription || "",
                    otherSkills || "",
                    Array.isArray(availability)
                        ? JSON.stringify(availability)
                        : (availability || ""),
                    1
                ];

                db.run(
                    registrationSQL,
                    registrationValues,
                    function (registrationError) {
                        if (registrationError) {
                            console.error(
                                "TRAINER REGISTRATION ERROR:",
                                registrationError
                            );

                            if (
                                registrationError.message.includes("UNIQUE")
                            ) {
                                return res.status(409).json({
                                    message:
                                        "This email or username is already registered. Please log in or use a different username."
                                });
                            }

                            return res.status(500).json({
                                message:
                                    "Unable to save trainer registration."
                            });
                        }

                        const registrationId = this.lastID;

                        /*
                         * Create the corresponding login account.
                         * This role is specific to trainer registrations.
                         */
                        const userSQL = `
                            INSERT INTO users (
                                name,
                                email,
                                password,
                                role
                            )
                            VALUES (?, ?, ?, ?)
                        `;

                        db.run(
                            userSQL,
                            [
                                cleanName,
                                normalizedEmail,
                                hashedPassword,
                                "Trainer"
                            ],
                            function (userError) {
                                if (userError) {
                                    console.error(
                                        "TRAINER USER CREATION ERROR:",
                                        userError
                                    );

                                    /*
                                     * Roll back the registration row if
                                     * the user account could not be created.
                                     */
                                    db.run(
                                        "DELETE FROM registrations WHERE id = ?",
                                        [registrationId],
                                        () => {}
                                    );

                                    return res.status(500).json({
                                        message:
                                            "The trainer account could not be created. Please try again."
                                    });
                                }

                                return res.status(201).json({
                                    message:
                                        "Trainer registration successful! You can now log in.",
                                    user: {
                                        id: this.lastID,
                                        name: cleanName,
                                        email: normalizedEmail,
                                        role: "Trainer"
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    } catch (error) {
        console.error("TRAINER REGISTRATION ERROR:", error);

        return res.status(500).json({
            message: "An unexpected error occurred during registration."
        });
    }
});


app.post("/api/volunteer-register", (req, res) => {
    const data = req.body;

    // Basic required-field validation
    const requiredFields = [
        "fullName",
        "dateOfBirth",
        "gender",
        "phone",
        "email",
        "city",
        "currentStatus",
        "previousExperience",
        "availability",
        "preferredTime",
        "motivation"
    ];

    const missingField = requiredFields.find(field => {
        return (
            data[field] === undefined ||
            data[field] === null ||
            String(data[field]).trim() === ""
        );
    });

    if (missingField) {
        return res.status(400).json({
            message: `Please provide ${missingField}.`
        });
    }

    if (
        !Array.isArray(data.skills) ||
        data.skills.length === 0 ||
        !Array.isArray(data.languages) ||
        data.languages.length === 0
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

    // Check the existing account tables as well as volunteer applications.
    db.get(
        `SELECT email FROM users WHERE email = ?
         UNION
         SELECT email FROM registrations WHERE email = ?
         UNION
         SELECT email FROM volunteer_registrations WHERE email = ?
         LIMIT 1`,
        [email, email, email],
        (checkError, existingUser) => {
            if (checkError) {
                console.error("Volunteer duplicate check failed:", checkError);

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
                    full_name,
                    date_of_birth,
                    gender,
                    phone,
                    email,
                    city,
                    address,
                    current_status,
                    institution,
                    course,
                    profession,
                    skills,
                    previous_experience,
                    experience_details,
                    languages,
                    availability,
                    preferred_time,
                    motivation,
                    contribution,
                    additional_info,
                    contact_consent,
                    guidelines_agreement,
                    privacy_acknowledgement
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
                1,
                1,
                1
            ];

            db.run(sql, values, function (insertError) {
                if (insertError) {
                    console.error(
                        "Volunteer registration insert failed:",
                        insertError
                    );

                    if (insertError.code === "SQLITE_CONSTRAINT") {
                        return res.status(409).json({
                            message: "This email is already registered."
                        });
                    }

                    return res.status(500).json({
                        message: "Unable to save the volunteer registration."
                    });
                }

                return res.status(201).json({
                    message: "Volunteer registration submitted successfully!",
                    registrationId: this.lastID
                });
            });
        }
    );
});



 // ==========================================
 // TEAM UNITY LOGIN
 // ==========================================


app.post("/api/login", (req, res) => {
    const email = String(req.body.email || "")
        .trim()
        .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
        return res.status(400).json({
            message: "Please enter your email and password."
        });
    }

    db.get(
        `SELECT id, name, email, password, role, profile_picture
         FROM users
         WHERE LOWER(email) = ?`,
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

                // Get DOB and profession from registration.
                db.get(
                    `SELECT dob_day, dob_month, dob_year, profession
                     FROM registrations
                     WHERE LOWER(email) = ?`,
                    [email],
                    (registrationError, registration) => {
                        if (registrationError) {
                            console.error(
                                "LOGIN REGISTRATION LOOKUP ERROR:",
                                registrationError
                            );

                            return res.status(500).json({
                                message:
                                    "Unable to load your profile details."
                            });
                        }

                        let dob = null;
                        let profession = "";

                        if (registration) {
                            const day = String(
                                registration.dob_day || ""
                            ).trim();

                            const month = String(
                                registration.dob_month || ""
                            ).trim();

                            const year = String(
                                registration.dob_year || ""
                            ).trim();

                            if (day && month && year) {
                                dob = `${day}/${month}/${year}`;
                            }

                            profession = String(
                                registration.profession || ""
                            ).trim();
                        }

                        // Trainer accounts always display Trainer.
                        const isTrainer =
                            String(user.role || "").toLowerCase() ===
                            "trainer";

                        if (isTrainer) {
                            profession = "Trainer";
                        }

                        // Use the correct default profile picture.
                        const defaultPicture = isTrainer
                            ? "src/trainer_dashboard_pfl.png"
                            : "src/artist_dashboard_pfl.png";

                        const profilePicture =
                            user.profile_picture &&
                            String(user.profile_picture).trim()
                                ? user.profile_picture
                                : defaultPicture;

                        // Send the complete user profile to the frontend.
                        return res.json({
                            message: "Login successful!",
                            user: {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role,
                                profile_picture: profilePicture,
                                dob: dob,
                                profession: profession
                            }
                        });
                    }
                );
            } catch (error) {
                console.error("LOGIN ERROR:", error);

                return res.status(500).json({
                    message: "Unable to process login."
                });
            }
        }
    );
});


// ==========================================
// TEAM UNITY GOOGLE DRIVE IMAGE ENDPOINT
// ==========================================

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
            {
                responseType: "stream"
            }
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

app.listen(PORT, () => {
    console.log(
        `=======================================================
Team Unity server running at http://localhost:${PORT}
=======================================================`
    );
});


