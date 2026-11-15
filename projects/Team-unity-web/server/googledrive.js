const { google } = require("googleapis");
const path = require("path");

const KEY_FILE = path.join(
    __dirname,
    "google-service-account.json"
);

const auth = new google.auth.GoogleAuth({
    keyFile: KEY_FILE,
    scopes: [
        "https://www.googleapis.com/auth/drive.readonly"
    ]
});

const drive = google.drive({
    version: "v3",
    auth
});

module.exports = drive;
module.exports = drive;
