//[Sentiment Analysis System]
var DataReader = require('../ProcessingData/DataReader.js');
var TextsProcessor = require('../ProcessingData/TextsProcessor.js');
var Separator = require('../SentimentAnalysis/DataSeparation.js');
var FeaturesSelection = require('../SentimentAnalysis/FeaturesSelection.js');
var NaiveBayes = require('../SentimentAnalysis/NaiveBayesClassifier.js');
var NeuralNetwork = require('../SentimentAnalysis/NeuralNetwork.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function SentimentAnalysis() {
        
        //[Private data]
        var dataFromFiles,
            processor,
        //select data from the [beginning], from the [middle] or from the [end] of the array, and percentage for training and test
            trainingDataPercentage = 70,
            from = "middle",
            separator,
            selection,
            bayes,
            topWordsForEachClass = 5,
            bestFeaturesWords,
            perceptron;

        //[Private Methods]

        //[Public Methods]
        this.Start = function() {
            //[Read Data]
            dataFromFiles = new DataReader();
            dataFromFiles.ReadInitialData();
            
            //[Process Data]
            processor = new TextsProcessor();
            var allDataOnProcessedTexts = processor.Preprocessor(dataFromFiles);
            
            //[Separate Training and Validation Data]
            separator = new Separator();
            separator.Start(allDataOnProcessedTexts, from, trainingDataPercentage);
            
            //[Features Selection]
            selection = new FeaturesSelection();
            var vocabulary = processor.GetVocabulary();
            bestFeaturesWords = selection.ByMutualInformationWords(vocabulary, topWordsForEachClass);
            
            //My choice for the Best Features...
            bestFeaturesWords["subjectivity"] = ["retweet", "url", "hashtag"];
            bestFeaturesWords["polarity"] = ["positive_emoticon", "positive_word"];

            var dataWordsBits = separator.GetTextWordsDataArrays(bestFeaturesWords);

            //[Classifier: Naive Bayes]
            bayes = new NaiveBayes();
            bayes.Start(dataWordsBits, processor);

            //[Classifier: Simple Neural Network (Perceptron)]
            perceptron = new NeuralNetwork();
            perceptron.Start(dataWordsBits, processor);
        }

        this.GetDataInfo = function() {
            return dataFromFiles.getDataInfo();
        }
        
        this.GetProcessingResults = function() {
            return processor.GetProcessDataResults();
        }
        
        this.GetProcessingTagsResults = function() {
            return processor.GetProcessTagsDataResults();
        }

        this.GetTopFeatures = function () {
            return bestFeaturesWords;
        }
    }
    
    //[Export the SentimentAnalysis System Object]
    module.exports = SentimentAnalysis;
}());
