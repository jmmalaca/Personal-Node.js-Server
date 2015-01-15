//[Data reader]
var fs = require('fs');

(function() {
    
    "use strict";
    //[Define your library strictly]
    
    function DataReader() {
        
        var tweetsFilePath = "./SentimentData/tweets.txt";

        //[Private Methods]


        //[Public Methods]
        this.Read = function () {
            console.log("  -Data Reader reading...");
            
            //[synchronous file reader, waits until finish reading]
            var tweets = fs.readFileSync(tweetsFilePath);
            
            //[asynchronous file reader, puts a task to do it]
            //fs.readFile(tweetsFilePath, function(err, data) {
            //    if (err) throw err;
            //    tweets = data.toString().split("\n");
            //    //console.log(tweets);
            //});

            return tweets.toString().split("\n");
        };

        this.PrintData = function (tweets) {
            console.log("   -Data available:");

            var countPositive = 0;
            var countNeutral = 0;
            var countNegative = 0;

            tweets.forEach(function (tweet) {
                var tweetsData = tweet.split(",\"");
                
                var classe = tweetsData[0];
                //var text = tweetsData[1];
                //console.log(classe + " => " + text);

                if (classe === "positive") {
                    countPositive = countPositive + 1;
                } else if (classe === "neutral") {
                    countNeutral = countNeutral + 1;
                }else if (classe === "negative") {
                    countNegative = countNegative + 1;
                }
            });

            console.log("    -There is Positive[" + countPositive + "], Neutral[" + countNeutral + "], Negative[" + countNegative + "] tweets.");
        };
    }

    //[Export the Data Reader Object Object]
    module.exports = DataReader;
}());
