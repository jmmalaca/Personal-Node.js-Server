var express = require('express'); //express npm module
var request = require('request'); //request npm module
var url = require('url'); //url npm module
var SentimentAnalysis = require('./SentimentAnalysis/SentimentAnalysis.js');

//get a express app started...
var serverApp = express();

//route definitio:... home
serverApp.get('/', function (req, response) {
    console.log("\n -Hello request");

    request(url, function(err, res, body) {
        response.render('hello.ejs');//file on views folder
    });
});

//Route definition: /tweets/searchString
serverApp.get('/sentiment/:searchString', function (req, response) {
    console.log("\n -Tweets Call...");
    
    //get the request string data...
    var searchString = req.params.searchString;
    console.log(" -Search String: " + searchString);

    //Call Tweeter...
    var connector = require('./TwitterConnector/TwitterConnector.js');
});

//Start listen on port...
var server = serverApp.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    if (host == "0.0.0.0")
        host = "localhost";
    console.log('\nApp listening at http://%s:%s', host, port);
});

//Sentiment Analysis System Up and ready...
var system = new SentimentAnalysis();
system.Start();
