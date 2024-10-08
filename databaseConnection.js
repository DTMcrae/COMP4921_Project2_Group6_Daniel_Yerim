require("dotenv").config();

//AWS
const mysql = require("mysql2/promise");
var dbConfig = {
    host: process.env.AWS_HOSTNAME,
    user: process.env.AWS_USERNAME,
    password: process.env.AWS_PASSWORD,
    database: process.env.AWS_DATABASE,
    port: 3306,
    multipleStatements: false,
    namedPlaceholders: true,
};
var database = mysql.createPool(dbConfig);

module.exports = database;
