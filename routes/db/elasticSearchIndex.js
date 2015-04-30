/**
 * New node file
 */
var application_root = __dirname
, express = require('express')
, elasticsearch = require('elasticsearch')
, http = require('http');

var app = express();

var elasticClient = new elasticsearch.Client({
	  host: 'localhost:9200',
	  log: 'trace'
	});

function indexThisrow(callback, row)
{
	var rowId = row[0].audioId;
	console.log(row);
	elasticClient.create({
		index: 'music4u',
		  type: 'musictype',
		  id: rowId,
		  body: {
			audioName: row[0].audioName,
			owner: row[0].owner,
			author: row[0].author,
			language: row[0].language,
			genre: row[0].genre,
			producer: row[0].producer,
			director: row[0].director,
			description: row[0].description
		  }
	}, function (err, results){
		if(err)
			throw err;
		else
			{
			callback("Success!");
			}
	});
}

exports.indexThisrow = indexThisrow;
