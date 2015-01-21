var express = require('express'); //express npm module
var request = require('request'); //request npm module
var url = require('url'); //url npm module
var DataReader = require('./DataAnalytics/DataReader.js');
var SetupData = require('./DataAnalytics/TextsProcessor.js');
var SentimentAnalysis = require('./SentimentAnalysis/SentimentAnalysis.js');

//[Read Data]
var dataFromFiles = new DataReader();
dataFromFiles.ReadInitialData();

//[Process Texts]
var setup = new SetupData();
textsData = setup.Preprocessor(dataFromFiles);

//[Naive Bayes Classificator System]
var system = new SentimentAnalysis();
system.Start(textsData);

//[get a express (Server) app started]
var serverApp = express();

//[route definitio:... home]
serverApp.get('/', function (req, response) {
    console.log("\n -Hello request");

    request(url, function(err, res, body) {
        response.render('hello.ejs');//file on views folder
    });
});

//[Route definition: /countsData]
serverApp.get('/countsdata', function (req, response) {
    console.log("\n -Data Counts Call...");
    
    response.type('application/json');
    response.send(dataFromFiles.getDataInfo());
});

//[Route definition: /sentiment/searchString]
serverApp.get('/sentiment/:searchString', function (req, response) {
    
    //get the request string data...
    var searchString = req.params.searchString;
    console.log("\n -Sentiment Call... About: " + searchString);

    //Call Tweeter...
    var connector = require('./TwitterConnector/TwitterConnector.js');
});

//[Start listen on port]
var server = serverApp.listen(8080, function () {

    var host = server.address().address;
    var port = server.address().port;

    if (host == "0.0.0.0")
        host = "localhost";
    console.log('\nApp listening at http://%s:%s', host, port);
});
