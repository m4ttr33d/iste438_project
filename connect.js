var mongodb = require('mongodb');

var client = mongodb.MongoClient;

var url = 'mongodb://localhost:27017/tweets';

client.connect(url,function(err,db){
    if(err){
        console.log("Unable to connect. Error:", err);
    }
    else{
        console.log('Conected to ', url);
    }
    //do stuff here with the database
    db.close();
});
