//Sentiment Analysis System

//Constructor
function SentimentAnalysis() {

    //Start...
    this.filePath = "";

};

//Methods
SentimentAnalysis.prototype.SetupData = function () {
    console.log(" -SA reading initial data...");

    var reader = require('./SentimentData/DataReader.js');

}

SentimentAnalysis.prototype.Train = function() {
    console.log(" -SA training step...");
}

//Export the SA System Object
module.exports = SentimentAnalysis;