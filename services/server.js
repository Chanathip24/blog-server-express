const mysql = require('mysql2')

const sql = mysql.createConnection({
    host : "localhost",
    user: "root",
    password : "jab",
    database : "Blog"
})

sql.connect((err)=>{
    if(err) console.log(err, "Can't connect to db");
    console.log("Database is connected")
})

module.exports = sql;