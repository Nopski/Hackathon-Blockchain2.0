// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

const mysql = require('mysql');
const express = require('express');
const http = require('http');
const router = express();
/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import voting_artifacts from '../../build/contracts/Voting.json'
var Voting = contract(voting_artifacts);
let candidates = {"Rama": "candidate-1", "Nick": "candidate-2", "Jose": "candidate-3"}
window.voteForCandidate = function(candidate) {
  let candidateName = $("#candidate").val();
  try {
    $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
    $("#candidate").val("");

    /* Voting.deployed() returns an instance of the contract. Every call
     * in Truffle returns a promise which is why we have used then()
     * everywhere we have a transaction call
     */
    Voting.deployed().then(function(contractInstance) {
      contractInstance.voteForCandidate(candidateName, {gas: 140000, from: web3.eth.accounts[0]}).then(function() {
        let div_id = candidates[candidateName];
        return contractInstance.totalVotesFor.call(candidateName).then(function(v) {
          $("#" + div_id).html(v.toString());
          $("#msg").html("");
        });
      });
    });
  } catch (err) {
    console.log(err);
  }
}

function myfunction() {
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


	/*const pool = mysql.createPool({
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
			console.log('Hello user');
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

	server.listen(8080, ()=>{
	  console.log('Server running at //localhost:8080/');
	});*/
}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Voting.setProvider(web3.currentProvider);
  let candidateNames = Object.keys(candidates);
  for (var i = 0; i < candidateNames.length; i++) {
    let name = candidateNames[i];
    Voting.deployed().then(function(contractInstance) {
      contractInstance.totalVotesFor.call(name).then(function(v) {
        $("#" + candidates[name]).html(v.toString());
      });
    })
  }
});
