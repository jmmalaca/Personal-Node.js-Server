//[Naive Bayes Classifier System]
var fs = require('fs');
var math = require('mathjs');
var Separator = require('../SentimentAnalysis/DataSeparation.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function NaiveBayesClassifier() {
        
        //[Private data]
        var dataProcessor;//needed to process the new texts the system receive...

        var trainData = {};
        var testData = {};
        var functionThreshold = -1;
        
        var classesProbabilities = {};
        var wordsClassesPriorProbabilities = {};
        
        var classesProbabilitiesJsonPath = "./SentimentAnalysis/ClassesProbabilities.json";
        var wordsClassesPriorProbabilitiesJsonPath = "./SentimentAnalysis/ClassesFeaturesFrequencies.json";
        
        //[Private Methods]
        function calcClassesPriorProbabilities() {
            //Classes Prior Probabilities
            //Count total of arrays in train data... and total of arrays for each classe in the train data...
            var countTotalArrays = 0;
            var countClassesArrays = {};
            Object.keys(trainData).forEach(function(key) {
                countClassesArrays[key] = trainData[key].length;
                countTotalArrays = countTotalArrays + countClassesArrays[key];
            });
            //Calc probabilities for each class...
            //console.log("  -Classes Prior Probabilities:");
            Object.keys(trainData).forEach(function(key) {
                classesProbabilities[key] = countClassesArrays[key] / countTotalArrays;
            //    console.log("  -[" + key + "] = " + classesProbabilities[key]);
            });
            console.log("  -Classes Prior Probabilities calculated.");
        }

        function countClassesFeaturesAvailable() {
            var featuresList = {};
            Object.keys(trainData).forEach(function (key) {
                featuresList[key] = [];
                var textsData = trainData[key];
                for (var i = 0; i < textsData.length; i++) {
                    var featuresData = textsData[i];
                    if (i == 0) {
                        featuresList[key] = featuresData;
                    } else {
                        for (var j = 0; j < featuresList[key].length; j++) {
                            featuresList[key][j] += featuresData[j];
                        }
                    }
                }
            });
            return featuresList;
        }
        
        function sumAllFeaturesData(featuresClassesData) {
            var featuresSum = [];
            var keys = ["subjective", "objective"];
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (i == 0) {
                    Array.prototype.push.apply(featuresSum, featuresClassesData[key]);
                } else {
                    for (var j = 0; j < featuresSum.length; j++) {
                        featuresSum[j] += featuresClassesData[key][j];
                    }   
                }
            }
            return featuresSum;
        }

        function calcFeaturesPriorProbabilities() {
            //Count total of features for each class of the train data...
            var featuresClassesData = countClassesFeaturesAvailable();
            //sum all features to get the total of features available...
            var featuresTotalData = sumAllFeaturesData(featuresClassesData);
            var vocabulary = featuresTotalData.length;

            Object.keys(featuresClassesData).forEach(function(key) {
                var featuresData = featuresClassesData[key];
                var featuresClassesFrequency = [];
                for (var i = 0; i < featuresData.length; i++) {
                    /*
                    * W = word
                    * C = Classe ( positive, negative, etc... )
                    * 
                    * Probability(W|C) = counts W in class C / counts of words in class C
                    * 
                    * But, what happens with unknown words... the probability will be 0.
                    * The solution: Laplace Smoothing:
                    * 
                    * Probability(W|C) = counts W in class C + 1 / counts of words in class C + |V| (+ 1 ???), where |V| represents the Vocabulary
                    */
                    var a = featuresData[i] + 1;
                    var b = featuresTotalData[i] + vocabulary;
                    featuresClassesFrequency[i] = a / b;
                }
                wordsClassesPriorProbabilities[key] = featuresClassesFrequency;
            });
            console.log("  -Words Prior Probabilities calculated.");
        }
        
        function saveData() {
            var jsonString = JSON.stringify(classesProbabilities);
            fs.writeFileSync(classesProbabilitiesJsonPath, jsonString);

            jsonString = JSON.stringify(wordsClassesPriorProbabilities);
            fs.writeFileSync(wordsClassesPriorProbabilitiesJsonPath, jsonString);

            console.log("  -Classes/Words Prior Probabilities saved on file.");
        }

        function trainSystem() {

            calcClassesPriorProbabilities();
            calcFeaturesPriorProbabilities();
            
            console.log("  -Naive Bayes system trained.");
        }
        
        function extractWordsAndValues(processedText) {
            var results = {};
            var words = processedText.split(' ');
            words.forEach(function(word) {
                if (results.hasOwnProperty(word)) {
                    results[word] = results[word] + 1;
                } else {
                    results[word] = 1;
                }
            });
            return results;
        }

        function classifyProblemResolve(dataToClassifiy, classA, classB) {

            var classAData = wordsClassesPriorProbabilities[classA];
            var classAResult = math.log(classesProbabilities[classA], 10);

            var classBData = wordsClassesPriorProbabilities[classB];
            var classBResult = math.log(classesProbabilities[classB], 10);

            for (var i = 0; i < dataToClassifiy.length; i++) {
                
                var conditionalProbA = classAData[i];
                var conditionalProbB = classBData[i];
                var countsAppear = dataToClassifiy[i];

                var powA = math.pow(conditionalProbA, countsAppear);
                var powB = math.pow(conditionalProbB, countsAppear);
                
                var logA = math.log(powA, 10);
                var logB = math.log(powB, 10);

                classAResult = classAResult + logA;
                classBResult = classBResult + logB;
            }

            if (classAResult > functionThreshold) {
                return classA;
            }
            return classB;
        }

        function testSystem() {
            console.log("  -Testing the available System...");
            
            var rightSubjectiveClassifications = 0;
            var wrongSubjectiveClassifications = 0;
            
            var rightPositiveClassifications = 0;
            var wrongPositiveClassifications = 0;
            
            var rightNeutralClassifications = 0;
            var wrongNeutralClassifications = 0;
            
            var rightNegativeClassifications = 0;
            var wrongNegativeClassifications = 0;
            
            var truePositiveSubjectivity = 0; //result class Subjective and tweet with class Subjective
            var trueNegativeSubjectivity = 0; //result class Subjective but tweet com a class Objective
            var falsePositiveSubjectivity = 0; //result class Objective and tweet com a class Objective
            var falseNegativeSubjectivity = 0; //result class Objective but tweet com a class Subjective
            
            var truePositivePolarity = 0; //result class Positive and tweet with class Positive
            var trueNegativePolarity = 0; //result class Positive but tweet with class Negative
            var falsePositivePolarity = 0; //result class Negative and tweet with class Negative
            var falseNegativePolarity = 0; //result class Negative but tweet with class Positive

            Object.keys(testData).forEach(function (key) {

                var dataToClassify = testData[key];
                dataToClassify.forEach(function (textData) {
                    
                    var classification = classifyProblemResolve(textData, "subjective", "objective");
                    if (classification === "subjective") {
                        if (key === "subjective") {
                            rightSubjectiveClassifications++;
                            truePositiveSubjectivity++;
                        } else {
                            wrongSubjectiveClassifications++;
                            falsePositiveSubjectivity++;
                        }

                        classification = classifyProblemResolve(textData, "positive", "negative");
                        if (classification === "positive") {
                            if (key === "positive") {
                                rightPositiveClassifications++;
                                truePositivePolarity++;
                            } else {
                                wrongPositiveClassifications++;
                                falsePositivePolarity++;
                            }
                        } else {
                            if (key === "negative") {
                                rightNegativeClassifications++;
                                trueNegativePolarity++;
                            } else {
                                wrongNegativeClassifications++;
                                falseNegativePolarity++;
                            }
                        }
                    } else {
                        if (key === "objective") {
                            rightNeutralClassifications++;
                            trueNegativeSubjectivity++;
                        } else {
                            wrongNeutralClassifications++;
                            falseNegativeSubjectivity++;
                        }
                    }
                });
            });

            console.log("\n  -Results:");
            console.log("   -Correct Subjective Classifications: " + rightSubjectiveClassifications + ", wrong: " + wrongSubjectiveClassifications);
            console.log("   -Correct Neutral Classifications: " + rightNeutralClassifications + ", wrong: " + wrongNeutralClassifications);
            console.log("   -Correct Positive Classifications: " + rightPositiveClassifications + ", wrong: " + wrongPositiveClassifications);
            console.log("   -Correct Negative Classifications: " + rightNegativeClassifications + ", wrong: " + wrongNegativeClassifications);

            var positiveCount = testData["positive"].length;
            var neutralCount = testData["objective"].length;
            var negativeCount = testData["negative"].length;
            var totalCount = positiveCount + neutralCount + negativeCount;

            console.log("\n  -By Percentages:");
            console.log("   -Subjective: " + ((rightSubjectiveClassifications * 100) / (positiveCount + negativeCount)) + "% Correct");
            console.log("   -Neutral: " + ((rightNeutralClassifications * 100) / neutralCount) + "% Correct");
            console.log("   -Positive: " +((rightPositiveClassifications * 100) / positiveCount) + "% Correct");
            console.log("   -Negative: " + ((rightNegativeClassifications * 100) / negativeCount) + "% Correct");

            console.log("  Total Correct Classification Percentage: " + (rightPositiveClassifications + rightNeutralClassifications + rightNegativeClassifications) * 100 / totalCount + "%.");

            console.log("\n  -Sensibility VS Specificity:");
            //True Positive Rate (another term for recall)
            var sensitivitySubjectivity = truePositiveSubjectivity / (truePositiveSubjectivity + falseNegativeSubjectivity);
            var sensitivityPolarity = truePositivePolarity / (truePositivePolarity + falseNegativePolarity);
            
            //False Positive Rate
            var specificitySubjectivity = trueNegativeSubjectivity / (trueNegativeSubjectivity + falsePositiveSubjectivity);
            var specificityPolarity = trueNegativePolarity / (trueNegativePolarity + falsePositivePolarity);
            
            var precisionSubjetivity = truePositiveSubjectivity / (truePositiveSubjectivity + falsePositiveSubjectivity);
            var precisionPolarity = truePositivePolarity / (truePositivePolarity + falsePositivePolarity);
            
            //accuracy...the fraction of classifications that are correct
            //accuracy F1 = ( 2 * precision * recall ) / (precison + recall)
            var accuracySubjectivity = (2 * precisionSubjetivity * sensitivitySubjectivity) / (precisionSubjetivity + sensitivitySubjectivity);
            var accuracyPolarity = (2 * precisionPolarity * sensitivityPolarity) / (precisionPolarity + sensitivityPolarity);
            
            console.log("   -Subjectivity: Sensitivity: " + sensitivitySubjectivity + ", Specificity: " + specificitySubjectivity + ", F1_Accuracy: " + accuracySubjectivity);
            console.log("   -Polarity: Sensitivity: " + sensitivityPolarity + ", Specificity: " + specificityPolarity + ", F1_Accuracy: " + accuracyPolarity);

        }
        
        function readNaiveBayesSystemData() {
            var systemAlreadyTrained = false;
            //Subjectivity data...
            var dataClasses;
            try {
                dataClasses = fs.readFileSync(classesProbabilitiesJsonPath);
                classesProbabilities = JSON.parse(dataClasses);
                
                var dataWords;
                try {
                    dataWords = fs.readFileSync(wordsClassesPriorProbabilitiesJsonPath);
                    wordsClassesPriorProbabilities = JSON.parse(dataWords);
                    
                    systemAlreadyTrained = true;
                    console.log("  -Naive Bayes System Data Loaded.");

                } catch (e) {
                    console.log("\n -ERROR: reading Words Classes Probabilities");
                    //console.log(e);
                }
            } catch (e) {
                console.log("\n -ERROR: reading Classes Probabilities");
                //console.log(e);
            }
            return systemAlreadyTrained;
        }

        //[Public Methods]
        this.Start = function (allDataOnProcessedTexts, setupData) {
            dataProcessor = setupData;

            //Check if there is a system already trained...
            var systemAlreadyTrained = readNaiveBayesSystemData();
            
            var separator = new Separator();
            //select data from the [beginning], from the [middle] or from the [end] of the array and percentage for training and test
            var trainingDataPercentage = 70;
            var from = "middle";
            var data = separator.Start(allDataOnProcessedTexts, from, trainingDataPercentage);

            if (systemAlreadyTrained != true) {
                console.log("  -System not trained... Train it...");

                //[Separate data from training and validation]
                trainData = data["train"];
                testData = data["test"];

                //All data ready... train it... save it... and test it...
                trainSystem();
                //saveData();
                testSystem();

            } else {
                console.log("  -System trained...");
                
                //[Separate data from training and validation]
                testData = data["test"];
                
                //All data ready... test it...
                testSystem();
            }

            console.log("\n  -Naive Bayes System Ready.");
        }
    }
    
    //[Export the Naive Bayes System Object]
    module.exports = NaiveBayesClassifier;
}());
