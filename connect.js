var mongodb = require('mongodb');
var assert=require('assert');
var client = mongodb.MongoClient;
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;

var url = 'mongodb://localhost:27017/users';

var express = require('express');
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000);
console.log("Server running at localhost:3000")

app.use(express.static(__dirname + "/pages"));

const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


client.connect(url,function(err,db){
    if(err){
        //console.log("Unable to connect. Error:", err);
		app.get('/',function(req,res){
			res.send("<h1> Unable to connect </h1>"); //here is the table. Past here I have no clue
		});
    }
    else{
        //console.log('Conected to ', url);
		app.get('/',function(req,res){
			res.send(
				"<html>"+
					"<head>"+
						"<title> Tweet Search App </title>"+
						"<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'"+
						 "integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>"+
				   		"<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>"+
					"</head>"+
					"<body>"+
						"<div class='col-xs-12 text-center'>" +
							"<form method='post' action='/search'>"+
								"<h1> Tweet Search </h1><br>"+
								"<input type='text' name='query' placeholder='Search'>"+
								"<br><br><br><button type='Submit' value='Search'>Search</button></form>"+
						"</div>"+
					"</body>"+
				"</html>");
		});
		app.post('/search',function(req,res){
			counter=0
			findTweets(db, req.body.query).then(function(tweets){				
				var response = "<html>"+
						"<head>"+
							"<title> Tweet Search App </title>"+
							"<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'"+
							 "integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>"+
							"<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>"+
						"</head>"+
						"<body>"+
							"<div class='col-xs-12 text-center'>" +
							"<h1> Tweet Results </h1>"+
							"<div class='col-xs-2'></div><div class='col-xs-8'><input type='text' name='query' placeholder='search'>"+
							"<br><br><form method='post' action='/search'><button type='Submit' value='Search'>Search</button></form>"+
							"<table class='table table-striped'><thead><tr><th>#</th><th> Username </th><th> Date </th><th> View Details </th></tr>";
							
				for(t in tweets){
					counter = counter + 1
					var tweet = tweets[t]
					response += "<tr>"+
										"<td>"+counter+"</td>"+
										"<td>"+tweet['User Name']+"</td>"+
										"<td>"+tweet.Date+"</td>"+
										"<td><a href='/view?id=" + tweet._id + "'><button type='submit' class='btn btn-info'>View Details</button></a></td></tr>";				
				}
				response += "</table>"+
							"</div><div class='col-xs-2'></div>"+
						"</body>"+
					"</html>";
				
				
				res.send(response);	
			});
		});
		app.get('/view',function(req,res){
			findTweetByID(db, req.query.id).then(function(tweets){
				var tweet = tweets[0];
				
				var response = "<html>"+
						"<head>"+
							"<title> Tweet Search App </title>"+
							"<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'"+
							 "integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>"+
							"<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>"+
						"</head>"+
						"<body>"+
							"<div class='col-xs-12 text-center'>" +
							"<h1> View Tweet </h1>"+
							"<div class='col-lg-8 col-md-12 col-xs-12'>"+
							"<table class='table table-striped'><thead><tr><th>Field</th><th> Data </th></tr>";
					
					for(prop in tweet){
						response += "<tr><td>"+prop+"</td><td>"+tweet[prop]+"</td></tr>";
					}
					
				response += "</table></div><div class='col-lg-4 col-md-12 col-xs-12'></div>"+
							"<form method='post' action='/update'>"+
								"<h1> Update Tweet Comment </h1>"+
								"<input type='text' name='comment' placeholder='Comment'>"+
								"<input type='hidden' name='id' value ='" +tweet._id +"'>"+
								"<br><br><button type='Submit' value='Save'>Save</button></form>"+
						"</body>"+
					"</html>";
								
				res.send(response);	
			});
		});
		app.post('/update',function(req,res){
			updateComment(db, req.body.comment, req.body.id).then(function(tweets){				
				findTweetByID(db, req.body.id).then(function(tweets){
					var tweet = tweets[0];
					
					var response = "<html>"+
							"<head>"+
								"<title> Tweet Search App </title>"+
								"<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css'"+
								 "integrity='sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u' crossorigin='anonymous'>"+
								"<script src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js'></script>"+
							"</head>"+
							"<body>"+
								"<div class='col-xs-12 text-center'>" +
								"<h1> View Tweet </h1>"+
								"<div class='col-lg-8 col-md-12 col-xs-12'>"+
								"<table class='table table-striped'><thead><tr><th>Field</th><th> Data </th></tr>";
						
						for(prop in tweet){
							response += "<tr><td>"+prop+"</td><td>"+tweet[prop]+"</td></tr>";
						}
						
					response += "</table></div><div class='col-lg-4 col-md-12 col-xs-12'></div>"+
								"<form method='post' action='/update'>"+
									"<h1> Update Tweet Comment </h1>"+
									"<input type='text' name='comment' placeholder='Comment'>"+
									"<input type='hidden' name='id' value ='" +tweet._id +"'>"+
									"<br><br><button type='Submit' value='Save'>Save</button></form>"+
							"</body>"+
						"</html>";
									
					res.send(response);
				});
			});
		});
	}
	
});

var findTweets = function(db, param){
	var collection = db.collection('tweets_aapl');
	console.log("searching for "+ param);
	
	return collection.find({"text": {$regex: param}},{"User Name":1, "Date":1}).limit(10).toArray();
	
};

var findTweetByID = function(db, id){
	var collection = db.collection('tweets_aapl');
	console.log("Fetching tweet "+ id);
	return collection.find({"_id": ObjectID(id)}).toArray();	
	
};


var updateComment= function(db, comment, id){
	var collection = db.collection('tweets_aapl');
	console.log("updating tweet "+ id);
	return collection.updateOne({ _id :  ObjectID(id) }, { $set: { comment : comment } });  
}
