//[Processed Text Data]
(function () {

    "use strict";
    //[Define your library strictly]

    function TextData() {
        
        //[properties]
        this.originalText = "";
        this.processedText = "";
        this.acronyms = {};
        this.stopwords = {};
        this.retweet = false;
        this.usernames = {};
        this.negations = {};
        this.positiveWords = {};
        this.neutralWords = {};
        this.negativeWords = {};
        this.pontuations = {};
        this.hashtags = {};
        this.repetitions = {};
        this.numbers = {};
        this.htmlChars = {};
        this.urls = {};
        this.badwords = {};
        this.uppercases = {};
        this.PriorPolarity = "";
        this.positiveEmoticons = {};
        this.negativeEmoticons = {};
        
        this.textDataArray = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        
        //[Sets and Gets]

        //[originalText]
        this.SetOriginalText = function(text) {
            this.originalText = text;
        }
        
        this.GetOriginalText = function () {
            return this.originalText;
        }
        //[processedText]
        this.SetProcessedText = function (text) {
            this.processedText = text;
        }
    
        this.GetProcessedText = function () {
            return this.processedText;
        }
        //[acronyms]
        this.AddAcronym = function(acronym) {
            if (Object.keys(this.acronyms).indexOf(acronym) > -1) {
                this.acronyms[acronym]++;
            } else {
                this.acronyms[acronym] = 1;
            }
            //this.textDataArray[0]++;
        }

        this.GetAcronyms = function () {
            return this.acronyms;
        }
        //[stopwords]
        this.AddStopword = function (stopword) {
            if (Object.keys(this.stopwords).indexOf(stopword) > -1) {
                this.stopwords[stopword]++;
            } else {
                this.stopwords[stopword] = 1;
            }
            //this.textDataArray[1]++;
        }

        this.GetStopwords = function () {
            return this.stopwords;
        }
        //[retweets]
        this.SetRetweet = function () {
            this.retweet = true;
            this.textDataArray[0]++;
        }
        
        this.GetRetweet = function () {
            return this.retweet;
        }
        //[usernames]
        this.AddUsername = function (username) {
            if (Object.keys(this.usernames).indexOf(username) > -1) {
                this.usernames[username]++;
            } else {
                this.usernames[username] = 1;
            }
            this.textDataArray[1]++;
        }

        this.GetUsernames = function () {
            return this.usernames;
        }
        //[negations]
        this.AddNegation = function (negation) {
            if (Object.keys(this.negations).indexOf(negation) > -1) {
                this.negations[negation]++;
            } else {
                this.negations[negation] = 1;
            }
            this.textDataArray[2]++;
        }
        
        this.GetNegations = function () {
            return this.negations;
        }
        //[positiveWords]
        this.AddPositiveWord = function (positiveWord) {
            if (Object.keys(this.positiveWords).indexOf(positiveWord) > -1) {
                this.positiveWords[positiveWord]++;
            } else {
                this.positiveWords[positiveWord] = 1;
            }
            this.textDataArray[3]++;
        }

        this.GetPositiveWords = function () {
            return this.positiveWords;
        }
        //[neutralWords]
        this.AddNeutralWord = function (neutralWord) {
            if (Object.keys(this.neutralWords).indexOf(neutralWord) > -1) {
                this.neutralWords[neutralWord]++;
            } else {
                this.neutralWords[neutralWord] = 1;
            }
            this.textDataArray[4]++;
        }

        this.GetNeutralWords = function () {
            return this.neutralWords;
        }
        //[negativeWords]
        this.AddNegativeWord = function (negativeWord) {
            if (Object.keys(this.negativeWords).indexOf(negativeWord) > -1) {
                this.negativeWords[negativeWord]++;
            } else {
                this.negativeWords[negativeWord] = 1;
            }
            this.textDataArray[5]++;
        }

        this.GetNegativeWords = function () {
            return this.negativeWords;
        }
        //[pontuations]
        this.AddPontuation = function (pontuation) {
            if (Object.keys(this.pontuations).indexOf(pontuation) > -1) {
                this.pontuations[pontuation]++;
            } else {
                this.pontuations[pontuation] = 1;
            }
            this.textDataArray[6]++;
        }

        this.GetPontuations = function () {
            return this.pontuations;
        }
        //[hashtags]
        this.AddHashtag = function (hashtag) {
            if (Object.keys(this.hashtags).indexOf(hashtag) > -1) {
                this.hashtags[hashtag]++;
            } else {
                this.hashtags[hashtag] = 1;
            }
            this.textDataArray[7]++;
        }

        this.GetHashtags = function () {
            return this.hashtags;
        }
        //[repetitions]
        this.AddRepetition = function (repetition) {
            if (Object.keys(this.repetitions).indexOf(repetition) > -1) {
                this.repetitions[repetition]++;
            } else {
                this.repetitions[repetition] = 1;
            }
            this.textDataArray[8]++;
        }

        this.GetRepetitions = function () {
            return this.repetitions;
        }
        //[numbers]
        this.AddNumber = function (number) {
            if (Object.keys(this.numbers).indexOf(number) > -1) {
                this.numbers[number]++;
            } else {
                this.numbers[number] = 1;
            }
            //this.textDataArray[9]++;
        }

        this.GetNumbers = function () {
            return this.numbers;
        }
        //[htmlChars]
        this.AddHtmlChar = function (htmlChar) {
            if (Object.keys(this.htmlChars).indexOf(htmlChar) > -1) {
                this.htmlChars[htmlChar]++;
            } else {
                this.htmlChars[htmlChar] = 1;
            }
            this.textDataArray[9]++;
        }

        this.GetHtmlChars = function () {
            return this.htmlChars;
        }
        //[urls]
        this.AddUrl = function (url) {
            if (Object.keys(this.urls).indexOf(url) > -1) {
                this.urls[url]++;
            } else {
                this.urls[url] = 1;
            }
            this.textDataArray[10]++;
        }

        this.GetUrls = function () {
            return this.urls;
        }
        //[badwords]
        this.AddBadword = function (badword) {
            if (Object.keys(this.badwords).indexOf(badword) > -1) {
                this.badwords[badword]++;
            } else {
                this.badwords[badword] = 1;
            }
            //this.textDataArray[12]++;
        }

        this.GetBadwords = function () {
            return this.badwords;
        }
        //[uppercases]
        this.AddUppercase = function (uppercase) {
            if (Object.keys(this.uppercases).indexOf(uppercase) > -1) {
                this.uppercases[uppercase]++;
            } else {
                this.uppercases[uppercase] = 1;
            }
            this.textDataArray[11]++;
        }

        this.GetUppercases = function () {
            return this.uppercases;
        }
        //[Polarity]
        this.SetPriorPolarity = function (polarity) {
            this.PriorPolarity = polarity;
        }
    
        this.GetPriorPolarity = function () {
            return this.PriorPolarity;
        }

        //[Positive Emoticons]
        this.AddPositiveEmoticon = function (positiveEmoticon) {
            if (Object.keys(this.positiveEmoticons).indexOf(positiveEmoticon) > -1) {
                this.positiveEmoticons[positiveEmoticon]++;
            } else {
                this.positiveEmoticons[positiveEmoticon] = 1;
            }
            this.textDataArray[12]++;
        }

        this.GetPositiveEmoticons = function () {
            return this.positiveEmoticons;
        }
        //[Negative Emoticons]
        this.AddNegativeEmoticon = function (negativeEmoticon) {
            if (Object.keys(this.negativeEmoticons).indexOf(negativeEmoticon) > -1) {
                this.negativeEmoticons[negativeEmoticon]++;
            } else {
                this.negativeEmoticons[negativeEmoticon] = 1;
            }
            this.textDataArray[13]++;
        }

        this.GetNegativeEmoticons = function () {
            return this.negativeEmoticons;
        }
        //[Get Text Data Array]
        this.GetTextDataArray = function() {
            return this.textDataArray;
        }
        //[Get All Data Info]
        this.GetAllDataInfo = function () {
            var info = {
                "originalText": this.originalText,
                "processedText": this.processedText,
                "textDataArray": this.textDataArray,
                "acronyms": this.acronyms,
                "stopwords": this.stopwords,
                "retweet": this.retweet,
                "usernames": this.usernames,
                "negations": this.negations,
                "positiveWords": this.positiveWords,
                "neutralWords": this.neutralWords,
                "negativeWords": this.negativeWords,
                "pontuations": this.pontuations,
                "hashtags": this.hashtags,
                "repetitions": this.repetitions,
                "numbers": this.numbers,
                "htmlChars": this.htmlChars,
                "urls": this.urls,
                "badwords": this.badwords,
                "uppercases": this.uppercases,
                "PriorPolarity": this.PriorPolarity,
                "positiveEmoticons": this.positiveEmoticons,
                "negativeEmoticons": this.negativeEmoticons
            };
            return info;
        }
    }

    //[Export the Texts Data Object]
    module.exports = TextData;
}());
