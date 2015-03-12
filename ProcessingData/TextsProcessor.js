//[Setup Data]
var fs = require('fs');
var async = require('async');
var Emoticons = require('../ProcessingData/Emoticons.js');
var ProcessMonitor = require('../ProcessingMonitor/ProcessMonitor.js');
var TextData = require('../ProcessingData/TextData.js');
var NLP = require('../ProcessingData/NLP.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function TextsProcessor() {
        
        //[Private Data]
        var processedDataFilePath = "./ProcessingData/ProcessedTextsInfo.json";

        var emoticonsSetup = new Emoticons();
        var nlp = new NLP();

        var allDataReceivedFromFiles = {};
        var allDataOnProcessedTexts = {};
        var posTagsResults = {};
        
        var vocabularyDataFilePath = "./ProcessingData/VocabularyInfo.json";
        var vocabulary = {};

        //[Private Methods]
        function addToList(word, data) {
            if (Object.keys(data).indexOf(word) < 0) {
                data[word] = 1;
            } else {
                data[word]++;
            }
        }

        function addWordsToVocabulary(text, textPolarity){
            if (textPolarity === "positive" || textPolarity === "negative") {
                if (Object.keys(vocabulary).indexOf("subjective") < 0) {
                    vocabulary["subjective"] = {};
                }
            }
            if (Object.keys(vocabulary).indexOf(textPolarity) < 0) {
                vocabulary[textPolarity] = {};
            }

            text.split(" ").forEach(function (word) {
                if (word != "stopword" && word.length > 2) {
                    if (textPolarity == "positive" || textPolarity == "negative") {
                        addToList(word, vocabulary["subjective"]);
                    }
                    addToList(word, vocabulary[textPolarity]);
                }
            });
        }

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
            pattern = /[^\s]+([a-z])\1{2,}[^\s]+/g;
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
                    count.forEach(function(value) {
                        processedTextData.AddBadword(value);
                    });
                    text = text.replace(" " + word.toLowerCase() + " ", " badword ");
                }
            });
            var pattern = new RegExp(/[^\s]+(\*)+[^\s]*/g);
            count = text.match(pattern);
            if (count != null) {
                count.forEach(function (value) {
                    processedTextData.AddBadword(value);
                });
                text = text.replace(pattern, " badword ");
            }

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
            
            nlp.ProcessText(processedTextData);
            
            addWordsToVocabulary(processedTextData.processedText, textPolarity);

            return processedTextData.processedText;
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
                    case 0:
                        console.log("  -Acronyms:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 1:
                        console.log("  -Stopwords:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 2:
                        console.log("  -Retweets:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 3:
                        console.log("  -Usernames:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 4:
                        console.log("  -Negations:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 5:
                        console.log("  -Positive_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 6:
                        console.log("  -Neutral_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 7:
                        console.log("  -Negative_Words:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 8:
                        console.log("  -Pontuations:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 9:
                        console.log("  -Hashtags:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 10:
                        console.log("  -Repetitions:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 11:
                        console.log("  -Numbers:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 12:
                        console.log("  -Html_Chars:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 13:
                        console.log("  -Urls:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 14:
                        console.log("  -Badwords:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 15:
                        console.log("  -Uppercases:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 16:
                        console.log("  -Positive_Emoticons:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 17:
                        console.log("  -Negative_Emoticons:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 18:
                        console.log("  -Adjectives:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 19:
                        console.log("  -Nouns:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 20:
                        console.log("  -Verbs:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
                        break;
                    case 21:
                        console.log("  -Adverbs:  [" + positiveResults[i] + "] [" + neutralResults[i] + "] [" + negativeResults[i] + "] ");
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
            for (var i = 0; i < (positiveResults.length - 4); i++) {
                var data = {};
                switch (i) {
                    case 0:
                        data["name"] = "Acronyms";
                        break;
                    case 1:
                        data["name"] = "Stopwords";
                        break;
                    case 2:
                        data["name"] = "Retweets";
                        break;
                    case 3:
                        data["name"] = "Usernames";
                        break;
                    case 4:
                        data["name"] = "Negations";
                        break;
                    case 5:
                        data["name"] = "Positive_Words";
                        break;
                    case 6:
                        data["name"] = "Neutral_Words";
                        break;
                    case 7:
                        data["name"] = "Negative_Words";
                        break;
                    case 8:
                        data["name"] = "Pontuations";
                        break;
                    case 9:
                        data["name"] = "Hashtags";
                        break;
                    case 10:
                        data["name"] = "Repetitions";
                        break;
                    case 11:
                        data["name"] = "Numbers";
                        break;
                    case 12:
                        data["name"] = "Html_Chars";
                        break;
                    case 13:
                        data["name"] = "Urls";
                        break;
                    case 14:
                        data["name"] = "Badwords";
                        break;
                    case 15:
                        data["name"] = "Uppercases";
                        break;
                    case 16:
                        data["name"] = "Positive_Emoticons";
                        break;
                    case 17:
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
                
                try {
                    data = fs.readFileSync(vocabularyDataFilePath);
                    vocabulary = JSON.parse(data);

                    dataAlreadyProcessed = true;
                    console.log("  -System Processed Data Loaded.");
                } catch (e) {
                    console.log("\n -ERROR: reading vocabulary data.");
                }
            } catch (e) {
                console.log("\n -ERROR: reading processed data.");
                //console.log(e);
            }
            return dataAlreadyProcessed;
        }
        
        function saveSystemProcessedData() {
            var jsonString = JSON.stringify(allDataOnProcessedTexts);
            fs.writeFileSync(processedDataFilePath, jsonString);
            jsonString = JSON.stringify(vocabulary);
            fs.writeFileSync(vocabularyDataFilePath, jsonString);
        }
        
        function posTagsCounts(data, results) {
            if (Object.keys(data).length > 0) {
                Object.keys(data).forEach(function(posTag) {
                    if (Object.keys(results).indexOf(posTag) > -1) {
                        results[posTag]++;
                    } else {
                        results[posTag] = 1;
                    }
                });
            }
        }
        
        function getPosTagsClassesData() {
            //Get the data...
            Object.keys(allDataOnProcessedTexts).forEach(function (key) {
                var textsData = allDataOnProcessedTexts[key];
                if (Object.keys(posTagsResults).indexOf(key) < 0) {
                    posTagsResults[key] = {};
                }
                textsData.forEach(function (textData) {
                    posTagsCounts(textData.adverbs, posTagsResults[key]);
                    posTagsCounts(textData.adjectives, posTagsResults[key]);
                    posTagsCounts(textData.nouns, posTagsResults[key]);
                    posTagsCounts(textData.verbs, posTagsResults[key]);
                });
            });
        }

        function printPosTaggingResults() {
            //print it...
            getPosTagsClassesData();
            console.log(" -Pos-Tags detected: ");
            Object.keys(posTagsResults).forEach(function(key) {
                console.log("  -" + key + ":");
                var data = posTagsResults[key];
                Object.keys(data).forEach(function(posTag) {
                    console.log("   -" + posTag + " + " + data[posTag]);
                });
            });
        }
        
        function checkUndefinedValue(value) {
            if (value === undefined) {
                return 0;
            }
            return value;
        }

        //[Public Methods]
        this.Preprocessor = function (dataReceived) {

            allDataReceivedFromFiles = dataReceived;
            
            //Check if there is a system already trained...
            var dataAlreadyProcessed = readSystemProcessedData();

            if (dataAlreadyProcessed != true) {
                console.log("\n -Process: ");
                var measures = new ProcessMonitor();
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
            //printPosTaggingResults();
            
            return allDataOnProcessedTexts;
        };
        
        this.IndependentStringProcessor = function (string) {
            return processText(string, "NoPolarity");
        }

        this.GetProcessDataResults = function () {
            return addTextFeaturesData();
        }
        
        this.GetProcessTagsDataResults = function() {
            /*Data to send example:
             * var info = [
                {"name":"Tag1","positive":0,"neutral":0,"negative":0},
                {"name":"Tag2","positive":0,"neutral":0,"negative":0},
                {"name":"Tag3","positive":0,"neutral":0,"negative":0},
                {"name":"Tag4","positive":0,"neutral":0,"negative":0},
                ......
             */
            getPosTagsClassesData();

            var info = [];
            var posTagsOut = [];
            Object.keys(posTagsResults).forEach(function (key) {
                var data = posTagsResults[key];
                Object.keys(data).forEach(function (posTag) {
                    if (posTagsOut.indexOf(posTag) < 0) {
                        var posData = posTagsResults["positive"];
                        var neuData = posTagsResults["neutral"];
                        var negData = posTagsResults["negative"];
                        
                        var posValue = checkUndefinedValue(posData[posTag]);
                        var neuValue = checkUndefinedValue(neuData[posTag]);
                        var negValue = checkUndefinedValue(negData[posTag]);

                        var total = posValue + neuValue + negValue;
                        posValue = (posValue * 100) / total;
                        neuValue = (neuValue * 100) / total;
                        negValue = (negValue * 100) / total;

                        info.push({ "name": posTag, "positive": posValue, "neutral": neuValue, "negative": negValue });
                        posTagsOut.push(posTag);
                    }
                });
            });
            return info;
        }

        this.GetVocabulary = function () {
            return vocabulary;
        }
    }
    
    //[Export the Texts Processor Object]
    module.exports = TextsProcessor;
}());
