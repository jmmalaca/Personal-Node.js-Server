//[Sentiment Analysis System]
var DataReader = require('../SentimentData/DataReader.js');
var SetupData = require('../SentimentData/SetupData.js');
var NaiveBayes = require('../SentimentAnalysis/NaiveBayesClassifier.js');

(function() {
    
    "use strict";
    //[Define your library strictly]

    function SentimentAnalysis() {

        //[Private Methods]

        //[Public Methods]
        this.Start = function() {
            console.log(" -Start Sentiment Analysis system...");

            //Read Data...
            var reader = new DataReader();
            var data = reader.Read();
            //reader.PrintData(data);

            //Set up data...
            var setup = new SetupData();
            data = setup.Preprocessor(data);
            
            //Naive Bayes Classifier...
            var nb = new NaiveBayes();
            nb.Start(data);

        }
    }

    //[Export the Sentiment Analysis System Object]
    module.exports = SentimentAnalysis;
}());
