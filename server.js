var express = require('express'); //express npm module
var request = require('request'); //request npm module
var url = require('url'); //url npm module
var DataReader = require('./DataAnalytics/DataReader.js');
var SetupData = require('./DataAnalytics/TextsProcessor.js');
var NaiveBayes = require('./SentimentAnalysis/NaiveBayesClassifier.js');
var NeuralNetwork = require('./SentimentAnalysis/NeuralNetwork.js');

//[Read Data]
var dataFromFiles = new DataReader();
dataFromFiles.ReadInitialData();

//[Process Texts]
var setup = new SetupData();
var allDataOnProcessedTexts = setup.Preprocessor(dataFromFiles);

//[Naive Bayes - Classificator System]
var nb = new NaiveBayes();
nb.Start(allDataOnProcessedTexts, setup);

//[Neural Network - Classificator System]
//var nn = new NeuralNetwork();
//nn.Start(allDataOnProcessedTexts, setup);

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
    response.send(dataFromFiles.getDataInfo());
});

//[Route definition: /countsFeatures]
serverApp.get('/countsfeatures', function (req, response, next) {
    console.log(" -Features Counts Call...");
    
    response.type('application/json');
    response.send(setup.GetProcessDataResults());
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
