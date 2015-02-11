//[Setup Data]
var fs = require('fs');
var async = require('async');
var Emoticons = require('../DataAnalytics/Emoticons.js');
var ProcessData = require('../ProcessingData/ProcessData.js');
var TextData = require('../DataAnalytics/TextData.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function TextsProcessor() {
        
        //[Private Data]
        var processedDataFilePath = "./DataAnalytics/ProcessedTextsInfo.json";

        var emoticonsSetup = new Emoticons();

        var allDataReceivedFromFiles = {};
        var allDataOnProcessedTexts = {};

        //[Private Methods]
        function regexProcessor(text, textPolarity, processedTextData) {
            //javascript regex... rule: "/"{regex string}"/"{modifier code, ie "g": global modifier or "i": insensitive to lower/upper cases}
            //validate your regex: www.regex101.com ;)
            
            var count = [];
            
            //acentos e caracteres especiais em HTML
            var pattern = /\&.+;/g;
            count = text.match(pattern);
            text = text.replace(pattern, " htmlchar ");
            if (count != null) {
                count.forEach(function(value) {
                    processedTextData.AddHtmlChar(value);
                });
            }

            //Uppercases
            pattern = /(?!RT)[A-Z][A-Z]+/g;
            count = text.match(pattern);
            text = text.replace(pattern, " uppercase ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddUppercase(value);
                });
            }

            //RT to Retweet
            pattern = /^RT /g;
            count = text.match(pattern);
            text = text.replace(pattern, "retweet ");
            if (count != null) {
                processedTextData.SetRetweet();
            }

            //URLs to URL
            pattern = /((http|https)\:\/\/){0,1}(www\.){0,1}([a-z]|[0-9]|\_|\-)+(\~|\/|\.)[a-z]{2,}(\/([a-zA-Z]|[0-9]|_|-)+){0,}/g;
            count = text.match(pattern);
            text = text.replace(pattern, " url ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddUrl(value);
                });
            }

            //Replace emoticons (positive, negative, etc...) to emoticon (Positive, etc...) keywords
            text = emoticonsSetup.Replace(text, textPolarity, processedTextData);
            
            //Remove pontuation...
            //Mark pontuation that may express a feeling... like ! or ?...
            pattern = /[\!\?]+/g;
            count = text.match(pattern);
            text = text.replace(pattern, " pontuation ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddPontuation(value);
                });
            }

            //@blabla to Usernames
            pattern = /\@[a-zA-Z0-9_]+/g;
            count = text.match(pattern);
            text = text.replace(pattern, " username ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddUsername(value);
                });
            }
            
            //#blabla to Hashtags
            pattern = /\#[a-zA-Z0-9_][a-zA-Z0-9_]+/g;
            count = text.match(pattern);
            text = text.replace(pattern, " hashtag ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddHashtag(value);
                });
            }

            //numbers...
            pattern = /(?![a-z])[0-9]+(?![a-z])/g;
            count = text.match(pattern);
            text = text.replace(pattern, " number ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddNumber(value);
                });
            }

            //repetitions
            pattern = /([a-z])\1{2,}/g;
            count = text.match(pattern);
            text = text.replace(pattern, " repetition ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddRepetition(value);
                });
            }

            //negations
            pattern = /([a-z]+\'t|not|no|never|neither|seldom|hardly|nobody|none|nor|nothing|nowhere)/g;
            count = text.match(pattern);
            text = text.replace(pattern, " negation ");
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddNegation(value);
                });
            }

            //remove all others pontuation marks …
            text = text.replace(/(\\|\.|,|\"|\/|\#|\!|\$|\%|\^|\&|\;|\:|\{|\}|\=|\~|\(|\)|(?![a-z0-9])\_(?![a-z0-9]))/g, " ");
            
            //remove any [ "\r", "\n", "\t", "\f" ]
            text = text.replace(/\s+/g, " ");
            text = text.trim();
            
            return text;
        }
        
        function dataProcessor(text, textPolarity, processedTextData) {
            
            text = text.toLowerCase();

            var count = [];

            var acronyms = allDataReceivedFromFiles.getAcronyms();
            acronyms.forEach(function (acronym) {
                var reg = new RegExp(" " + acronym[0].toLowerCase() + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddAcronym(value);
                    });
                    text = text.replace(" " + acronym[0] + " ", " " + acronym[1] + " ");
                }
            });

            var positiveWords = allDataReceivedFromFiles.getPositiveWords();
            positiveWords.forEach(function (word) {
                var reg = new RegExp(" " + word + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddPositiveWord(value);
                    });
                    text = text.replace(reg, " positive_word ");
                }
            });

            var neutralWords = allDataReceivedFromFiles.getNeutralWords();
            neutralWords.forEach(function (word) {
                var reg = new RegExp(" " + word + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddNeutralWord(value);
                    });
                    text = text.replace(" " + word.toLowerCase() + " ", " neutral_word ");
                }
            });
            
            var badwordsWords = allDataReceivedFromFiles.getBadWords();
            badwordsWords.forEach(function (word) {
                var reg = new RegExp(" " + word + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddBadword(value);
                    });
                    text = text.replace(" " + word.toLowerCase() + " ", " badword ");
                }
            });
            
            var negativeWords = allDataReceivedFromFiles.getNegativeWords();
            negativeWords.forEach(function (word) {
                var reg = new RegExp(" " + word + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddNegativeWord(value);
                    });
                    text = text.replace(" " + word.toLowerCase() + " ", " negative_word ");
                }
            });
            
            var stopwordsWords = allDataReceivedFromFiles.getStopWords();
            stopwordsWords.forEach(function (word) {
                var reg = new RegExp(" " + word + " ");
                count = text.match(reg);
                if (count != null) {
                    count.forEach(function (value) {
                        processedTextData.AddStopword(value);
                    });
                    text = text.replace(" " + word.toLowerCase() + " ", " stopword ");
                }
            });
            
            //remove all others pontuation marks
            text = text.replace(/(\*|\-)/g, " ");
            
            //remove any [ "\r", "\n", "\t", "\f" ]
            text = text.replace(/\s+/g, " ");
            text = text.trim();
            
            return text;
        }
        
        function processText(text, textPolarity) {
            var processedTextData = new TextData();

            text.trim();
            text = text.slice(0, text.length - 2);

            processedTextData.SetOriginalText(text);
            processedTextData.SetPriorPolarity(textPolarity);

            text = regexProcessor(text, textPolarity, processedTextData);
            
            text = text.toLowerCase();
            text = dataProcessor(text, textPolarity, processedTextData);
            
            processedTextData.SetProcessedText(text);
            allDataOnProcessedTexts[textPolarity].push(processedTextData);

            return text;
        }

        function textsProcessor(texts, textPolarity) {
            
            //for debug
            //var dat = texts.slice(0, 100);
            
            //usual forEach...
            allDataOnProcessedTexts[textPolarity] = [];
            texts.forEach(function (text) {
                processText(text, textPolarity);
            });
            
            //async forEach...
            //async.forEach(texts, function(text) {
            //    processTweet(text, allDataReceivedFromFiles, textPolarity);
            //});

            ////parallel forEach... http://justinklemm.com/node-js-async-tutorial/
            ////Array to hold async tasks
            //var asyncTasks = [];
            ////Loop through some items
            //data.forEach(function (tweet) {
            //    //We don't actually execute the async action here
            //    //We add a function containing it to an array of "tasks"
            //    asyncTasks.push(function (callback) {
            //        //Call an async function, often a save() to DB
            //        processTweet(tweet);
            //        //Async call is done, alert via callback
            //        callback();
            //    });
            //});
            //measures.ShowTimeCount("Added all AsyncTasks");// +/- 0.005 seconds

            //measures.StartTime();
            //// Now we have an array of functions doing async tasks
            //// Execute all async tasks in the asyncTasks array
            //async.parallel(asyncTasks, function () {
            //    //All tasks are done now
            //    measures.ShowTimeCount("All Taks Done."); // +/- ? minutes
            //});
        }
        
        function countClassesTotalsProcessedData() {
            var featuresTotalsCounts = [];
            Object.keys(allDataOnProcessedTexts).forEach(function (key) {
                var textsObjData = allDataOnProcessedTexts[key];
                for (var i = 0; i < textsObjData.length; i++) {
                    var featuresData = textsObjData[i];
                    var data = featuresData.textDataArray;
                    if (i == 0) {
                        featuresTotalsCounts[key] = [];
                        Array.prototype.push.apply(featuresTotalsCounts[key], data);
                    } else {
                        for (var j = 0; j < data.length; j++) {
                            featuresTotalsCounts[key][j] += data[j];
                        }
                    }
                }
            });
            return featuresTotalsCounts;
        }

        function printResults() {
            var featuresTotalsCounts = countClassesTotalsProcessedData();
            console.log("\n -Process Results: [Positive] [Neutral] [Negative]");
            var positiveResults = featuresTotalsCounts["positive"];
            var neutralResults = featuresTotalsCounts["neutral"];
            var negativeResults = featuresTotalsCounts["negative"];
            for (var i = 0; i < positiveResults.length; i++) {
                switch (i) {
                    //[retweets]
                    case 0:
                        console.log("  -Retweets:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[username]
                    case 1:
                        console.log("  -Usernames:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[negations]
                    case 2:
                        console.log("  -Negations:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[positiveWords]
                    case 3:
                        console.log("  -Positive_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[neutralWords]
                    case 4:
                        console.log("  -Neutral_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[negativeWords]
                    case 5:
                        console.log("  -Negative_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[pontuations]
                    case 6:
                        console.log("  -Pontuations:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[hashtags]
                    case 7:
                        console.log("  -Hashtags:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[repetitions]
                    case 8:
                        console.log("  -Repetitions:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[htmlChars]
                    case 9:
                        console.log("  -Html_Chars:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[urls]
                    case 10:
                        console.log("  -Urls:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[uppercases]
                    case 11:
                        console.log("  -Uppercases:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[Positive Emoticons]
                    case 12:
                        console.log("  -Positive_Emoticons:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    //[Negative Emoticons]
                    case 13:
                        console.log("  -Negative_Emoticons:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                }
            }
        }
        
        function addTextFeaturesData() {
            var info = [];
            /*Data to send example:
             * var info = [
                {"name":"Acronyms","positive":0,"neutral":0,"negative":0},
                {"name":"Stopwords","positive":0,"neutral":0,"negative":0},
                {"name":"Retweets","positive":0,"neutral":0,"negative":0},
                {"name":"Usernames","positive":0,"neutral":0,"negative":0},
                ......
             */
            var featuresTotalsCounts = countClassesTotalsProcessedData();
            var positiveResults = featuresTotalsCounts["positive"];
            var neutralResults = featuresTotalsCounts["neutral"];
            var negativeResults = featuresTotalsCounts["negative"];
            for (var i = 0; i < positiveResults.length; i++) {
                var data = {};
                switch (i) {
                    //[retweets]
                    case 0:
                        data["name"] = "Retweets";
                        break;
                    //[username]
                    case 1:
                        data["name"] = "Usernames";
                        break;
                    //[negations]
                    case 2:
                        data["name"] = "Negations";
                        break;
                    //[positiveWords]
                    case 3:
                        data["name"] = "Positive_Words";
                        break;
                    //[neutralWords]
                    case 4:
                        data["name"] = "Neutral_Words";
                        break;
                    //[negativeWords]
                    case 5:
                        data["name"] = "Negative_Words";
                        break;
                    //[pontuations]
                    case 6:
                        data["name"] = "Pontuations";
                        break;
                    //[hashtags]
                    case 7:
                        data["name"] = "Hashtags";
                        break;
                    //[repetitions]
                    case 8:
                        data["name"] = "Repetitions";
                        break;
                    //[htmlChars]
                    case 9:
                        data["name"] = "Html_Chars";
                        break;
                    //[urls]
                    case 10:
                        data["name"] = "Urls";
                        break;
                    //[uppercases]
                    case 11:
                        data["name"] = "Uppercases";
                        break;
                    //[Positive Emoticons]
                    case 12:
                        data["name"] = "Positive_Emoticons";
                        break;
                    //[Negative Emoticons]
                    case 13:
                        data["name"] = "Negative_Emoticons";
                        break;
                }
                var total = positiveResults[i] + neutralResults[i] + negativeResults[i];
                data["positive"] = (positiveResults[i] * 100)/total;
                data["neutral"] = (neutralResults[i] * 100) / total;
                data["negative"] = (negativeResults[i] * 100) / total;
                info.push(data);
            }
            return info;
        }
        
        function readSystemProcessedData() {
            var dataAlreadyProcessed = false;
            var data;
            try {
                data = fs.readFileSync(processedDataFilePath);
                allDataOnProcessedTexts = JSON.parse(data);
                
                dataAlreadyProcessed = true;
                console.log("  -System Processed Data Loaded.");

            } catch (e) {
                console.log("\n -ERROR: reading processed data.");
                //console.log(e);
            }
            return dataAlreadyProcessed;
        }
        
        function saveSystemProcessedData() {
            var jsonString = JSON.stringify(allDataOnProcessedTexts);
            fs.writeFileSync(processedDataFilePath, jsonString);
        }

        //[Public Methods]
        this.Preprocessor = function (dataReceived) {

            allDataReceivedFromFiles = dataReceived;
            
            //Check if there is a system already trained...
            var dataAlreadyProcessed = readSystemProcessedData();

            if (dataAlreadyProcessed != true) {
                console.log("\n -Process: ");
                var measures = new ProcessData();
                measures.StartTime();

                var data = allDataReceivedFromFiles.getPositiveTweets();
                var countTexts = data.length;
                var type = "positive";
                console.log("  -" + type + " texts[" + data.length + "]...");
                textsProcessor(data, type);

                data = allDataReceivedFromFiles.getNeutralTweets();
                countTexts = countTexts + data.length;
                type = "neutral";
                console.log("  -" + type + " texts[" + data.length + "]...");
                textsProcessor(data, type);

                data = allDataReceivedFromFiles.getNegativeTweets();
                countTexts = countTexts + data.length;
                type = "negative";
                console.log("  -" + type + " texts[" + data.length + "]...");
                textsProcessor(data, type);

                measures.ShowTimeCount(countTexts, "All " + countTexts + " texts Done.");

                saveSystemProcessedData();
            }
            
            printResults();
            return allDataOnProcessedTexts;
        };
        
        this.IndependentStringProcessor = function (string) {
            return processText(string, "NoPolarity");
        }

        this.GetProcessDataResults = function () {
            return addTextFeaturesData();
        }
    }
    
    //[Export the Texts Processor Object]
    module.exports = TextsProcessor;
}());
