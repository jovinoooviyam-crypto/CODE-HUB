const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "teamunity.db");

console.log("TEAM UNITY DATABASE PATH:", databasePath);

const db = new sqlite3.Database(databasePath, (error) => {

    if (error) {
        console.error("Database connection failed:", error.message);
    } else {
        console.log("Connected to TEAM UNITY database.");
    }
});


// ======================================
// USERS — login accounts
// ======================================

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
	profile_picture TEXT,
        reset_token TEXT,
        reset_token_expires INTEGER
    )
`, (error) => {
    if (error) {
        console.error("Users table creation failed:", error.message);
    } else {
        console.log("Users table is ready.");
    }
});


// ======================================
// REGISTRATIONS — cultural art team applications
// ======================================

db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        full_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,

        dob_day TEXT NOT NULL,
        dob_month TEXT NOT NULL,
        dob_year TEXT NOT NULL,
        gender TEXT NOT NULL,
        contact_number TEXT NOT NULL,
        whatsapp_number TEXT NOT NULL,
        blood_group TEXT NOT NULL,
        profession TEXT NOT NULL,
        college TEXT,

        why_join TEXT NOT NULL,
        art_form TEXT NOT NULL,
        has_experience TEXT NOT NULL,
        experience_description TEXT,
        other_skills TEXT,

        availability TEXT NOT NULL,
        declaration_agreed INTEGER NOT NULL DEFAULT 0,

        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (error) => {
    if (error) {
        console.error("Registrations table creation failed:", error.message);
    } else {
        console.log("Registrations table is ready.");
    }
});

// ======================================
// VOLUNTEER REGISTRATIONS
// ======================================

db.run(`
    CREATE TABLE IF NOT EXISTS volunteer_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,

        full_name TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        address TEXT,

        current_status TEXT NOT NULL,
        institution TEXT,
        course TEXT,
        profession TEXT,
        skills TEXT NOT NULL,

        previous_experience TEXT NOT NULL,
        experience_details TEXT,
        languages TEXT NOT NULL,

        availability TEXT NOT NULL,
        preferred_time TEXT NOT NULL,
        motivation TEXT NOT NULL,
        contribution TEXT,
        additional_info TEXT,

        contact_consent INTEGER NOT NULL DEFAULT 0,
        guidelines_agreement INTEGER NOT NULL DEFAULT 0,
        privacy_acknowledgement INTEGER NOT NULL DEFAULT 0,

        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (error) => {
    if (error) {
        console.error(
            "Volunteer registrations table creation failed:",
            error.message
        );
    } else {
        console.log(
            "Volunteer registrations table is ready."
        );
    }
});


// ======================================
// SAFETY NET
// Adds the reset columns to an older users table that was created
// before they existed. The "duplicate column" error is expected
// and safely ignored on every run after the first.
// ======================================

db.run(`ALTER TABLE users ADD COLUMN reset_token TEXT`, () => {});
db.run(`ALTER TABLE users ADD COLUMN reset_token_expires INTEGER`, () => {});


module.exports = db;
