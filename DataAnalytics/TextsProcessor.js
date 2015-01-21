//[Setup Data]
var Emoticons = require('../DataAnalytics/Emoticons.js');
var async = require('async');
var ProcessData = require('../ProcessingData/ProcessData.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function TextsProcessor() {
        
        //[Private Data]
        var processedTexts = {};
        processedTexts['positive'] = [];
        processedTexts['neutral'] = [];
        processedTexts['negative'] = [];
        
        //[Private Methods]
        function regexProcessor(text) {
            //javascript regex... rule: "/"{regex string}"/"{modifier code, ie "g": global modifier or "i": insensitive to lower/upper cases}
            //validate your regex: www.regex101.com ;)

            //URLs to URL
            text = text.replace(/(((http|https)\:\/\/)|www\.|)(\w|\d|\_|\-)+(\~|\/|\.)\w{2,}(\/(\w|\d|\_|\-)+){0,}/gi, " URL ");
            
            //Uppercases
            text = text.replace(/(?![a-z]+)([A-Z][A-Z]+)(?![a-z]+)/g, " UPPERCASE ");
            
            //Replace emoticons (positive, negative, etc...) to emoticon (Positive, etc...) keywords
            var emoticonsSetup = new Emoticons();
            text = emoticonsSetup.Replace(text);
            
            //Remove pontuation...
            //Mark pontuation that may express a feeling... like ! or ?...
            text = text.replace(/[\!\?]+/g, " PONTUATION ");
            
            //@blabla to Usernames
            text = text.replace(/@[a-zA-Z0-9\\_][a-zA-Z0-9\\_]+/g, " USERNAME ");
            
            //#blabla to Hashtags
            text = text.replace(/#[a-zA-Z0-9_][a-zA-Z0-9_]+/g, " HASHTAG ");
            
            //numbers...
            text = text.replace(/\s+[0-9]+\s+/g, " NUMBER ");
            
            //RT to Retweet
            text = text.replace(/^[Rr][Tt]/g, " RETWEET ");
            
            //acentos e caracteres especiais em HTML
            text = text.replace(/&.+;/g, " HTMLCHAR ");

            //remove all others pontuation marks... …
            text = text.replace(/(\\|\.|,|\"|\/|#|!|$|%|\^|&|\*|;|:|\{|\}|=|-|~|\(|\))/g, " ");
            
            //remove some blank extra spaces...
            text = text.replace(/\s+/g, " ");
            text = text.trim();
            
            return text;
        }
        
        function dataProcessor(text, allDataAvailable) {

            var acronyms = allDataAvailable.getAcronyms();
            acronyms.forEach(function(acronym) {
                text = text.replace(" " + acronym[0] + " ", " " + acronym[1] + " ");
            });

            var positiveWords = allDataAvailable.getPositiveWords();
            positiveWords.forEach(function(word) {
                text = text.replace(" " + word + " ", " POSITIVE_WORD ");
            });
            
            var neutralWords = allDataAvailable.getNeutralWords();
            neutralWords.forEach(function (word) {
                text = text.replace(" " + word + " ", " NEUTRAL_WORD ");
            });
            
            var negativeWords = allDataAvailable.getNegativeWords();
            negativeWords.forEach(function (word) {
                text = text.replace(" " + word + " ", " NEGATIVE_WORD ");
            });

            var stopwordsWords = allDataAvailable.getStopWords();
            stopwordsWords.forEach(function (word) {
                text = text.replace(" " + word + " ", " STOPWORD ");
            });
            
            //remove some blank extra spaces...
            text = text.replace(/\s+/g, " ");
            text = text.trim();

            return text;
        }

        function processTweet(text, allDataAvailable, textPolarity) {
            
            text.trim();
            text = text.slice(0, text.length-2);
            
            text = regexProcessor(text);
            text = dataProcessor(text, allDataAvailable);
            
            processedTexts[textPolarity].push(text);
        }
        
        function textsProcessor(texts, allDataAvailable, textPolarity) {
            
            //usual forEach...
            var dat = texts.slice(0, 100);
            dat.forEach(function (text) {
                processTweet(text, allDataAvailable, textPolarity);
            });
            
            //async forEach...
            //async.forEach(texts, function(text) {
            //    processTweet(text, allDataAvailable, textPolarity);
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
            //    measures.ShowTimeCount("All Taks Done."); // +/- 6 minutes
            //});
        }

        //[Public Methods]
        this.Preprocessor = function (allDataAvailable) {
            console.log("  -Texts processing...");
            
            var measures = new ProcessData();
            measures.StartTime();
            
            var data = allDataAvailable.getPositiveTweets();
            var countTexts = data.length;
            textsProcessor(data, allDataAvailable, "positive");

            data = allDataAvailable.getNeutralTweets();
            countTexts = countTexts + data.length;
            textsProcessor(data, allDataAvailable, "neutral");
            
            data = allDataAvailable.getNegativeTweets();
            countTexts = countTexts + data.length;
            textsProcessor(data, allDataAvailable, "negative");
            
            measures.ShowTimeCount(countTexts, "All Taks Done.");// +/- 6 minutes

            return processedTexts;
        };
    }
    
    //[Export the Texts Processor Object]
    module.exports = TextsProcessor;
}());
