var mongodb = require('mongodb');
var assert=require('assert');
var client = mongodb.MongoClient;
var bodyParser = require('body-parser');

var url = 'mongodb://localhost:27017/users';

var express = require('express');
var app = express();

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
			res.send("<h1> Search Tweets </h1><form method='post' action='/search'><input type='text' name='query' placeholder='search'><br><input type='Submit' name='field' value='Get Tweets'></form>"); //here is the table. Past here I have no clue
		});
		app.post('/search',function(req,res){
			app.use(bodyParser.urlencoded({ extended: true }));
			app.use(bodyParser.json());
			//res.send("<table class='table striped'><thead><tr><th> Username </th><th> Content </th><th> Date </th></tr></table>");
			//get from form
			console.log(req.query);
			param = req.query;
			res.send("You searched for " + param);
		});
	}
	//rl.question('Enter Search Param:', (answer) => {
		//findTweets(db, answer, searchFinished);
	//});
	
});

var findTweets = function(db, param, callback){
	var searchString = "/"+param+"/";
	var collection = db.collection('tweets_aapl');
	console.log(searchString);
	
	collection.find({"Tweet content": {$regex: param}},{"User Name":1, "Date":1}).toArray(function(err, docs) {
		assert.equal(err, null);
		console.log("Found " +docs.length + " records");
		callback(docs, db);
	});
	
};

var findTweetByID = function(db, id, callback){
	var collection = db.collection('tweets_aapl');
	
	collection.find({"_id": id},{_id:0}).toArray(function(err, docs) {
		assert.equal(err, null);
		callback(docs[0], id, db);
	});	
	
};


var updateComment= function(db, comment, id, callback){
	var collection = db.collection('tweets_aapl');
		collection.updateOne({ _id : id }, { $set: { comment : comment } }, function(err, result) {
		assert.equal(err, null);
		assert.equal(1, result.result.n);
		console.log("Updated the document");
		callback(db,id,displayTweet);
  });  
}

var searchFinished = function(docs, db){
		//print results
		for(var d in docs){
			var tweet = docs[d]
			console.log(d +" | "+tweet.Date +" | "+ tweet['User Name']);
		}
		
		//search again or view tweet
		rl.question('Type tweet num to view tweet or "S" to search again: ', (answer) => {
			
			if(answer == 'S' || answer == 's'){
				rl.question('Enter Search Param:', (answer) => {
					findTweets(db, answer, searchFinished);
				});
				
			}else{
				console.log(docs[answer]._id);
				findTweetByID(db, docs[answer]._id, displayTweet);
			}
						
		});
}


var displayTweet = function(tweet, id, db){
	console.dir(tweet);
	
	rl.question('Type "C" to add comment or anything else to search again: ', (answer) => {
			
		if(answer == 'C' || answer == 'c'){
			rl.question('Enter Comment:', (answer) => {
				updateComment(db, answer, id, findTweetByID);
			});
			
		}else{
			rl.question('Enter Search Param:', (answer) => {
				findTweets(db, answer, searchFinished);
			});
			
		}
				
	});
}