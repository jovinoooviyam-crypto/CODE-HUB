
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "Teamunitydata.db");

console.log("REGISTRATION DATABASE:", databasePath);

const registrationDB = new sqlite3.Database(
    databasePath,
    (error) => {
        if (error) {
            console.error("DATABASE CONNECTION ERROR:", error.message);
        } else {
            console.log("Connected to Teamunitydata.db");
        }
    }
);

// Database initialization
registrationDB.ready = new Promise((resolve, reject) => {

    registrationDB.run(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            registration_type TEXT NOT NULL
                CHECK(registration_type IN ('Artist', 'Volunteer')),
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            username TEXT,
            password_hash TEXT,
            form_data TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (error) => {

        if (error) {
            console.error("TABLE CREATION ERROR:", error.message);
            return reject(error);
        }

        // Check whether an existing table needs the new column.
        registrationDB.all(
            "PRAGMA table_info(registrations)",
            [],
            (error, columns) => {

                if (error) {
                    return reject(error);
                }

                const hasPasswordHash = columns.some(
                    column => column.name === "password_hash"
                );

                if (hasPasswordHash) {
                    console.log("Database table is up to date.");
                    return resolve();
                }

                registrationDB.run(
                    "ALTER TABLE registrations ADD COLUMN password_hash TEXT",
                    (error) => {

                        if (error) {
                            console.error("DATABASE MIGRATION ERROR:", error.message);
                            return reject(error);
                        }

                        console.log("Added password_hash column.");
                        resolve();
                    }
                );
            }
        );
    });
});

module.exports = registrationDB;
