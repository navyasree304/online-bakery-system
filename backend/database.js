const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "bakery_user",
    password: "Bakery@123",
    database: "bakery_db"
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("MySQL Database Connected Successfully!");
    }
});

module.exports = db;