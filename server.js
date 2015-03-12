var express = require('express'); //express npm module
var request = require('request'); //request npm module
var url = require('url'); //url npm module
var SentimentAnalysis = require('./SentimentAnalysis/SentimentAnalysis.js');

//[Start the Sentiment Analysis System]
var sentiment = new SentimentAnalysis();
sentiment.Start();

//[get a express (Server) app started]
var serverApp = express();

//[Access-Control: Allow-Origin]
serverApp.use(function (req, res, next) {
    
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    
    //extra methods: PUT,POST,DELETE
    res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
    
    console.log("\n -Time: %d: \n -Method: %s, \n -URL: %s, \n -Path: %s", Date.now(), req.method, req.url, req.path);
    next();
});

//http://enable-cors.org
//The first call (app.all) should be made before all the other routes in your app (or at least the ones you want to be CORS enabled).

//[route definitio:... home]
serverApp.get('/', function (req, response, next) {
    console.log(" -Hello Call...");
    
    request(url, function (err, res, body) {
        response.render('hello.ejs');//file on views folder
    });
});

//[Route definition: /countsData]
serverApp.get('/countsdata', function (req, response, next) {
    console.log(" -Data Counts Call...");
    
    response.type('application/json');
    response.send(sentiment.GetDataInfo());
});

//[Route definition: /countsFeatures]
serverApp.get('/countsfeatures', function (req, response, next) {
    console.log(" -Features Counts Call...");
    
    response.type('application/json');
    response.send(sentiment.GetProcessingResults());
});

//[Route definition: /countsTagsfeatures]
serverApp.get('/countsTagsfeatures', function (req, response, next) {
    console.log(" -Features Counts Call...");
    
    response.type('application/json');
    response.send(sentiment.GetProcessingTagsResults());
});

//[Route definition: /bestWordsFeatures]
serverApp.get('/bestWordsFeatures', function (req, response, next) {
    console.log(" -Best [Top 10] Words Features Call...");
    
    response.type('application/json');
    response.send(sentiment.GetTopFeatures());
});

//[Route definition: /sentiment/searchString]
serverApp.get('/sentiment/:searchString', function (req, response, next) {
    
    //get the request string data...
    var searchString = req.params.searchString;
    console.log(" -Sentiment Call... About: " + searchString);
    
    //Call Tweeter...
    var connector = require('./TwitterConnector/TwitterConnector.js');
});

/*
 * app.post('/', function(req, res, next) {
 // Handle the post for this route
});
 * */

//[Start listen on port]
var server = serverApp.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    if (host == "0.0.0.0") host = "localhost";
    console.log('\nApp listening at http://%s:%s', host, port);
});
