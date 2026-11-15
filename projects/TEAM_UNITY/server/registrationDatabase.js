
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const databasePath = path.join(__dirname, "Teamunitydata.db");

console.log("REGISTRATION DATABASE:", databasePath);

const registrationDB = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error("Registration database connection error:", error.message);
    } else {
        console.log("Connected to Teamunitydata.db");
    }
});

// Create the table and safely add the password_hash column
// if an earlier version of this database already exists.
registrationDB.ready = new Promise((resolve, reject) => {
    registrationDB.run(`
        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            registration_type TEXT NOT NULL
                CHECK (registration_type IN ('Artist', 'Volunteer')),
            full_name TEXT NOT NULL,
            email TEXT NOT NULL COLLATE NOCASE UNIQUE,
            username TEXT COLLATE NOCASE UNIQUE,
            password_hash TEXT,
            form_data TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (error) => {
        if (error) {
            console.error("Registration table creation error:", error.message);
            return reject(error);
        }

        registrationDB.all(
            "PRAGMA table_info(registrations)",
            (columnError, columns) => {
                if (columnError) return reject(columnError);

                const hasPasswordHash = columns.some(
                    column => column.name === "password_hash"
                );

                if (hasPasswordHash) {
                    console.log("Unified registration table is ready.");
                    return resolve();
                }

                registrationDB.run(
                    "ALTER TABLE registrations ADD COLUMN password_hash TEXT",
                    (alterError) => {
                        if (alterError) {
                            console.error(
                                "Database migration error:",
                                alterError.message
                            );
                            return reject(alterError);
                        }

                        console.log("Registration database migration completed.");
                        resolve();
                    }
                );
            }
        );
    });
});

module.exports = registrationDB;
