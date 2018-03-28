'use strict';

const mysql = require('mysql');
const express = require('express');
const http = require('http');
const router = express();

const fs = require('fs');

const connection = mysql.createConnection({
   host: 'localhost',
   user: 'lado',
   password: '1234'
});

connection.connect();

connection.query('SELECT * FROM bankdb.account;', function(err, results, fields) {
    if(err) throw err;

    fs.writeFile('account.json', JSON.stringify(results), function (err) {
      if (err) throw err;
      console.log('Saved!');
    });
    connection.end();
});


const pool = mysql.createPool({
  host: 'localhost',
  user: 'lado',
  password: '1234',
  database: 'bankdb',
  charset: 'utf8'
});

var reo ='<html><head><title>Output From MYSQL</title></head><body><h1>Output From MYSQL</h1>{${table}}</body></html>';
function setResHtml(sql, cb){
  pool.getConnection((err, con)=>{
    if(err) throw err;

    con.query(sql, (err, res, cols)=>{
      if(err) throw err;

      var table =''; //to store html table

      //create html table with data from res.
      for(var i=0; i<res.length; i++){
        table +='<tr><td>'+ (i+1) +'</td><td>'+ res[i].name +'</td><td>'+ res[i].address +'</td></tr>';
      }
      table ='<table border="1"><tr><th>ID</th><th>Name</th><th>Amount</th></tr>'+ table +'</table>';

      con.release(); //Done with mysql connection

      return cb(table);
    });
  });
}

const sqll ='SELECT * FROM bankdb.account';

const server = http.createServer((req, res)=>{
  setResHtml(sqll, resql=>{
    reo = reo.replace('{${table}}', resql);
    res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
    res.write(reo, 'utf-8');
    res.end();
  });
});
router.get('/user/:id', function(req, res) { // When visiting 'search'
	var id = req.params.id; // For example if you visit localhost/user/24 the id will be 24
	connection.query('SELECT * FROM bankdb.account WHERE id=' + mysql.escape( id ), function(err, results, fields) {
		console.log('Read!');
    	if(err) throw err;
    	fs.writeFile('account.json', JSON.stringify(results), function (err) {
      	if (err) throw err;
      	console.log('Saved!');
    	});
    	connection.end();
	});
});

exports.getUserById = function(id) {
	for (var i = 0; i < users.length; i++) {
			if (users[i].id == id) return users[i];
	}
};

const s = server.listen(8080, ()=>{
  console.log('Server running at //localhost:8080/');
});