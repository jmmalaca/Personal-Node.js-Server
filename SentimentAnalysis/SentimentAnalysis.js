//Sentiment Analysis System
var DataReader = require('../SentimentData/DataReader.js');

(function() {
    
    "use strict";
    // Define your library strictly...

    function SentimentAnalysis() {

        this.filePath = "";

        //Private Methods
        function SetupData() {
            console.log(" -SA reading initial data...");

        }

        function Train() {
            console.log(" -SA training step...");
        }
        
        //Public Methods
        this.Start = function() {
            console.log(" -Start SA system...");

            //Read Data...
            var reader = new DataReader();
            var data = reader.Read();
            reader.PrintData(data);

            //Train... or read System trained...

            //Setup system for classification...
        }
    }

    //Export the SA System Object
    module.exports = SentimentAnalysis;
}());
