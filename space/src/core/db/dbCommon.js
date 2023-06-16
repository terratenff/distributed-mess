import mysql from "mysql2";

const HOST = "localhost";
const PORT = 8004;
const USER = "sample-user";
const PASSWORD = "sample-password";
const DATABASE = "sample-db";

export function establishConnection() {
    var con = mysql.createConnection({
        host: HOST,
        port: PORT,
        user: USER,
        password: PASSWORD,
        database: DATABASE
    });

    con.connect(function(err) {
        if (err) {
            Space.useDb = false;
            console.log("ERROR: Could not connect to database.");
        }
    });

    return con;
}