
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "Teamunitydata.db");

console.log("REGISTRATION DATABASE:", databasePath);

const registrationDB = new sqlite3.Database(
    databasePath,
    (error) => {
        if (error) {
            console.error("Registration database error:", error.message);
        } else {
            console.log("Connected to Teamunitydata.db");
        }
    }
);

registrationDB.run(`
    CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        registration_type TEXT NOT NULL
            CHECK(registration_type IN ('Artist', 'Volunteer')),
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        username TEXT,
        form_data TEXT NOT NULL,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`, (error) => {
    if (error) {
        console.error("Registration table error:", error.message);
    } else {
        console.log("Unified registrations table is ready.");
    }
});

module.exports = registrationDB;
