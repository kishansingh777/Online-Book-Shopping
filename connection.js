var mySQL = require("MySQL2");

var con = mySQL.createConnection({
host:"localhost",
user:"root",
password:"7400220853",
database:"user"
});

module.exports= con;


 