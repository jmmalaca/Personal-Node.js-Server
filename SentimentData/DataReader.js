var fs = require('fs');
//Data reader...

(function() {
    
    "use strict";
    // Define your library strictly...
    
    function DataReader() {
        
        var tweetsFilePath = './SentimentData/tweets.txt';

        //Private Methods


        //Public Methods
        this.Read = function () {
            console.log(" -Data Reader reading...");

            var tweets = [];
            fs.readFile(tweetsFilePath, function (err, data) {

                if (err) throw err;
                
                tweets = data.toString().split("\n");
            });
            return tweets;
        };

        this.PrintData = function (tweets) {
            console.log("Data available:");

            tweets.forEach(function (tweet) {
                var tweetsData = tweet.split(",\"");
                
                var classe = tweetsData[0];
                var text = tweetsData[1];
                console.log(classe + " => " + text);
            });
        };
    }

    //Export the class
    module.exports = DataReader;
}());
