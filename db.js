const mysql = require("mysql2");

const conn = mysql.createConnection({
    host: "localhost",
    database: "end-to-end",
    user: "root",
    password: ""
});

module.exports = conn;