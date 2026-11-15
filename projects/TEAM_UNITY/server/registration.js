const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./registrations.db", (error) => {
    if (error) {
        console.error("Registration database connection failed:", error.message);
    } else {
        console.log("Connected to TEAM UNITY registration database.");
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        dob_day TEXT,
        dob_month TEXT,
        dob_year TEXT,
        gender TEXT,
        gender_other TEXT,
        profession TEXT,
        profession_other TEXT,
        college TEXT,
        art_form TEXT,
        art_form_other TEXT,
        has_experience TEXT,
        experience_other TEXT,
        experience_description TEXT,
        availability TEXT,
        availability_other TEXT,
        registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (error) => {
    if (error) {
        console.error("Registration table creation failed:", error.message);
    } else {
        console.log("Registration table is ready.");
    }
});

module.exports = db;