var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createPool({
    host     : "us-cdbr-east-02.cleardb.com",
    user     : "b8889425be5c87",
    password : 'XXXXXXXXXXXXXXXXXXXX',
    database : 'heroku_b5296ce3cc0609c'
});

connection.getConnection(function(err) {
    if (err) throw err;
    else {
      console.log("Connected to MYSQL database!");
    }
});

module.exports = connection;


// b8889425be5c87
// 480bb1d8
// us-cdbr-east-02.cleardb.com
