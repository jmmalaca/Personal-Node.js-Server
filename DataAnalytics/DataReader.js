//[Data reader]
var fs = require('fs');

(function() {

    "use strict";
    //[Define your library strictly]

    function DataReader() {
        var acronyms = [];
        var stopwords = [];
        var badwords = [];
        var subjectiveWords = [];
        var objectiveWords = [];
        var positiveWords = [];
        var neutralWords = [];
        var negativeWords = [];
        var positiveTweets = [];
        var neutralTweets = [];
        var negativeTweets = [];

        //[Private Data]
        var tweetsFilePath = "./DataAnalytics/tweets.txt";
        var acronymsFilePath = "./DataAnalytics/Acronyms/acronyms.txt";
        var webStopwordsFilePath = "./DataAnalytics/WebConfs/Stopwords.txt";
        var stanfordStopwordsFilePath = "./DataAnalytics/Stanford/stopwords.txt";
        var texasStopwordsFilePath = "./DataAnalytics/TexasU/stopwords.txt";
        var texasBadwordsFilePath = "./DataAnalytics/TexasU/badwords.txt";
        var wilsonWordsFilePath = "./DataAnalytics/WilsonWords/subjclueslen1-HLTEMNLP05.tff";
        var texasPositiveWordsFilePath = "./DataAnalytics/TexasU/positive-words.txt";
        var texasNegativeWordsFilePath = "./DataAnalytics/TexasU/negative-words.txt";

        //[Private Methods]
        function readAcronyms() {
            var lines = fs.readFileSync(acronymsFilePath);
            var data = lines.toString().split("\n");
            data = data.slice(1, data.length);
            data.forEach(function(line) {
                var lineData = line.split("-");
                acronyms.push(lineData);
            });
            console.log(" -Acronyms: " + acronyms.length);
        }

        function readStopWords() {
            var lines = fs.readFileSync(webStopwordsFilePath);
            var data = lines.toString().split("\n");
            stopwords = data.slice(1, data.length);
            //--
            lines = fs.readFileSync(stanfordStopwordsFilePath);
            data = lines.toString().split("\n");
            data.forEach(function(line) {
                if (stopwords.indexOf(line) == -1) {
                    stopwords.push(line);
                }
            });
            //--
            lines = fs.readFileSync(texasStopwordsFilePath);
            data = lines.toString().split("\n");
            data.forEach(function(line) {
                if (stopwords.indexOf(line) == -1) {
                    stopwords.push(line);
                }
            });
            console.log(" -StopWords: " + stopwords.length);
        }

        function readBadWords() {
            var lines = fs.readFileSync(texasBadwordsFilePath);
            var data = lines.toString().split("\n");
            badwords = data.slice(1, data.length);
            console.log(" -Badwords: " + badwords.length);
        }

        function readPolarityWords() {
            var lines = fs.readFileSync(wilsonWordsFilePath);
            var data = lines.toString().split("\n");
            //a line example: type=weaksubj len=1 word1=abandoned pos1=adj stemmed1=n priorpolarity=negative
            data.forEach(function(line) {
                var lineData = line.split(" ");
                var wordData = lineData[2].split("=");
                var word = wordData[1];
                var subjectivityData = lineData[0].split("=");
                var subjectivity = subjectivityData[1];
                var polarityData = lineData[5].split("=");
                var polarity = polarityData[1];

                if (subjectivity === "strongsubj") {
                    subjectiveWords.push(word);
                } else if (subjectivity === "weaksubj") {
                    objectiveWords.push(word);
                }

                if (polarity === "positive") {
                    positiveWords.push(word);
                } else if (polarity === "negative") {
                    negativeWords.push(word);
                } else {
                    neutralWords.push(word);
                }
            });
            //
            lines = fs.readFileSync(texasPositiveWordsFilePath);
            data = lines.toString().split("\n");
            var texasWords = data.slice(35, data.length);
            texasWords.forEach(function(word) {
                if (positiveWords.indexOf(word) == -1) {
                    positiveWords.push(word);
                }
            });
            lines = fs.readFileSync(texasNegativeWordsFilePath);
            data = lines.toString().split("\n");
            texasWords = data.slice(35, data.length);
            texasWords.forEach(function(word) {
                if (negativeWords.indexOf(word) == -1) {
                    negativeWords.push(word);
                }
            });
            console.log(" -Words: Strong-subjective[" + subjectiveWords.length + "], Weak-subjective[" + objectiveWords.length + "]");
            console.log(" -Words: Positive[" + positiveWords.length + "], Neutral[" + neutralWords.length + "], Negative[" + negativeWords.length + "]");
        }

        function readTweets() {
            var data = fs.readFileSync(tweetsFilePath);
            var tweets = data.toString().split("\n");

            tweets.forEach(function(tweet) {
                var tweetsData = tweet.split(",\"");

                var classe = tweetsData[0];
                var text = tweetsData[1];
                //console.log(classe + " => " + text);

                if (classe === "positive") {
                    positiveTweets.push(text);
                } else if (classe === "neutral") {
                    neutralTweets.push(text);
                } else if (classe === "negative") {
                    negativeTweets.push(text);
                }
            });

            console.log(" -Tweets: Positive[" + positiveTweets.length + "], Neutral[" + neutralTweets.length + "], Negative[" + negativeTweets.length + "]");
        }

        //[Public Methods]
        this.ReadInitialData = function() {
            console.log("Read All Systems Data...");
            readAcronyms();
            readStopWords();
            readBadWords();
            readPolarityWords();
            readTweets();
        };

        this.getDataInfo = function() {
            var info = {
                "acronyms": acronyms.length,
                "acronymsExamples": acronyms.slice(0, 5),
                "stopwords": stopwords.length,
                "stopwordsExamples": stopwords.slice(0, 5),
                "badwords": badwords.length,
                "badwordsExamples": badwords.slice(0, 5),
                "subjectiveWords": subjectiveWords.length,
                "subjectiveWordsExamples": subjectiveWords.slice(0, 5),
                "objectiveWords": objectiveWords.length,
                "objectiveWordsExamples": objectiveWords.slice(0, 5),
                "positiveWords": positiveWords.length,
                "positiveWordsExamples": positiveWords.slice(0, 5),
                "neutralWords": neutralWords.length,
                "neutralWordsExamples": neutralWords.slice(0, 5),
                "negativeWords": negativeWords.length,
                "negativeWordsExamples": negativeWords.slice(0, 5),
                "positiveTweets": positiveTweets.length,
                "positiveTweetsExamples": positiveTweets.slice(0, 5),
                "neutralTweets": neutralTweets.length,
                "neutralTweetsExamples": neutralTweets.slice(0, 5),
                "negativeTweets": negativeTweets.length,
                "negativeTweetsExamples": negativeTweets.slice(0, 5),
            }
            return JSON.stringify(info);
        };

        this.getAcronyms = function() {
            return acronyms;
        }
        
        this.getStopWords = function () {
            return stopwords;
        }

        this.getBadWords = function () {
            return badwords;
        }
        
        this.getSubjectiveWords = function () {
            return subjectiveWords;
        }
        
        this.getObjectiveWords = function () {
            return objectiveWords;
        }
        
        this.getPositiveWords = function () {
            return positiveWords;
        }

        this.getNeutralWords = function () {
            return neutralWords;
        }
        
        this.getNegativeWords = function () {
            return negativeWords;
        }

        this.getPositiveTweets = function () {
            return positiveTweets;
        }
        
        this.getNeutralTweets = function () {
            return neutralTweets;
        }
        
        this.getNegativeTweets = function () {
            return negativeTweets;
        }
    }

    //[Export the Data Reader Object Object]
    module.exports = DataReader;
} ());
