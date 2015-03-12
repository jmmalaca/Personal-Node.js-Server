//[Data reader]
var fs = require('fs');
var Emoticons = require('../ProcessingData/Emoticons.js');

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
        var tweetsFilePath = "./ProcessingData/tweets.txt";
        var acronymsFilePath = "./ProcessingData/Acronyms/acronyms.txt";
        var webStopwordsFilePath = "./ProcessingData/WebConfs/Stopwords.txt";
        var stanfordStopwordsFilePath = "./ProcessingData/Stanford/stopwords.txt";
        var texasStopwordsFilePath = "./ProcessingData/TexasU/stopwords.txt";
        var texasBadwordsFilePath = "./ProcessingData/TexasU/badwords.txt";
        var wilsonWordsFilePath = "./ProcessingData/WilsonWords/subjclueslen1-HLTEMNLP05.tff";
        var texasPositiveWordsFilePath = "./ProcessingData/TexasU/positive-words.txt";
        var texasNegativeWordsFilePath = "./ProcessingData/TexasU/negative-words.txt";
        var afinn96WordsFilePath = "./ProcessingData/Afinn/AFINN-96.txt";
        var afinn111WordsFilePath = "./ProcessingData/Afinn/AFINN-111.txt";

        //[Private Methods]
        function readAcronyms() {
            var lines = fs.readFileSync(acronymsFilePath);
            var data = lines.toString().split("\n");
            data = data.slice(1, data.length);
            data.forEach(function(line) {
                var lineData = line.split("-");
                acronyms.push(lineData);
            });
            console.log("  -Acronyms: " + acronyms.length);
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
            console.log("  -StopWords: " + stopwords.length);
        }

        function readBadWords() {
            var lines = fs.readFileSync(texasBadwordsFilePath);
            var data = lines.toString().split("\n");
            badwords = data.slice(1, data.length);
            console.log("  -Badwords: " + badwords.length);
        }

        function readPolarityWords() {
            //File 1...
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
            //File 2...
            lines = fs.readFileSync(texasPositiveWordsFilePath);
            data = lines.toString().split("\n");
            var texasWords = data.slice(35, data.length);
            texasWords.forEach(function(word) {
                if (positiveWords.indexOf(word) == -1) {
                    positiveWords.push(word);
                }
            });
            //File 3...
            lines = fs.readFileSync(texasNegativeWordsFilePath);
            data = lines.toString().split("\n");
            texasWords = data.slice(35, data.length);
            texasWords.forEach(function(word) {
                if (negativeWords.indexOf(word) == -1) {
                    negativeWords.push(word);
                }
            });
            //File 4...
            lines = fs.readFileSync(afinn96WordsFilePath);
            data = lines.toString().split("\n");
            data.forEach(function (line) {
                var wordData = line.split("\t");
                var value = parseInt(wordData[1]);
                if (value < 0) {
                    if (negativeWords.indexOf(wordData[0]) == -1) {
                        negativeWords.push(wordData[0]);
                    }
                } else {
                    if (positiveWords.indexOf(wordData[0]) == -1) {
                        positiveWords.push(wordData[0]);
                    }
                }
            });
            //File 5...
            lines = fs.readFileSync(afinn111WordsFilePath);
            data = lines.toString().split("\n");
            data.forEach(function (line) {
                var wordData = line.split("\t");
                var value = parseInt(wordData[1]);
                if (value < 0) {
                    if (negativeWords.indexOf(wordData[0]) == -1) {
                        negativeWords.push(wordData[0]);
                    }
                } else {
                    if (positiveWords.indexOf(wordData[0]) == -1) {
                        positiveWords.push(wordData[0]);
                    }
                }
            });
            console.log("  -Words: Strong-subjective[" + subjectiveWords.length + "], Weak-subjective[" + objectiveWords.length + "]");
            console.log("  -Words: Positive[" + positiveWords.length + "], Neutral[" + neutralWords.length + "], Negative[" + negativeWords.length + "]");
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

            console.log("  -Tweets: Positive[" + positiveTweets.length + "], Neutral[" + neutralTweets.length + "], Negative[" + negativeTweets.length + "]");
        }

        //[Public Methods]
        this.ReadInitialData = function() {
            console.log("\n -Read All Systems Data...");
            readAcronyms();
            readStopWords();
            readBadWords();
            readPolarityWords();
            readTweets();
        };

        this.getDataInfo = function () {
            var emoticons = new Emoticons();
            var info = {
                "Acronyms": acronyms.length,
                "Stopwords": stopwords.length,
                "Badwords": badwords.length,
                "Positive_Emoticons": emoticons.getEmoticonsCount("positive"),
                "Negative_Emoticons": emoticons.getEmoticonsCount("negative"),
                "Subjective_Words": subjectiveWords.length,
                "Objective_Words": objectiveWords.length,
                "Positive_Words": positiveWords.length,
                "Neutral_Words": neutralWords.length,
                "Negative_Words": negativeWords.length,
                "Positive_Tweets": positiveTweets.length,
                "Neutral_Tweets": neutralTweets.length,
                "Negative_Tweets": negativeTweets.length
            }
            return info;
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
