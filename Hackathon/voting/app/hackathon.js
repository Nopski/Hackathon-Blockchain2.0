'use strict';

const mysql = require('mysql');
const http = require('http');
const fs = require('fs');
/*const express = require('express');
app = express();*/

const cache = new Map();

//console//////////////////
const con = mysql.createConnection({
    host: "localhost",
    user: "lado",
    password: "1234"
});
const sql = "SELECT * FROM bankdb.account";
con.connect(function(err) {
    if (err) throw err;
    con.query(sql, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
    });
});
//end console/////////////

//WebUI
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

server.listen(8080, ()=>{
  console.log('Server running at //localhost:8080/');
});

//runtime changing
//const cacheFile = (path) => {
	//fs.readFile(path, (err, data) => {
		//if(err) {
			//cache.delete(path);
			//return;
		//}
		//cache.set(path, data);
	//}
//}
/*module.exports = (grunt) => {
	grunt.initConfig({
		execute: {
			target: {
				src: ['hackathon.js'],
			}
		},
		watch: {
			scripts: {
				files: ['hackathon.js'],
				tasks: ['execute'],
			}
		},
	});
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-execute');
}*/