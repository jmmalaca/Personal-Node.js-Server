//[Sentiment Analysis System]
var NaiveBayes = require('../SentimentAnalysis/NaiveBayesClassifier.js');

(function() {
    
    "use strict";
    //[Define your library strictly]

    function SentimentAnalysis() {

        //[Private Methods]

        //[Public Methods]
        this.Start = function(data) {
            console.log(" -Start Sentiment Classification system...");

            //Naive Bayes Classifier...
            var nb = new NaiveBayes();
            nb.Start(data);
        }
    }

    //[Export the Sentiment Analysis System Object]
    module.exports = SentimentAnalysis;
}());
