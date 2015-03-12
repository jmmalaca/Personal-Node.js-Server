//[Naive Bayes Classifier System]
var fs = require('fs');
var math = require('mathjs');

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
        var featuresClassesPriorProbabilities = {};
        
        var classesProbabilitiesJsonPath = "./SentimentAnalysis/ClassesProbabilities.json";
        var featuresClassesPriorProbabilitiesJsonPath = "./SentimentAnalysis/ClassesFeaturesFrequencies.json";
        
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
                //console.log("  -[" + key + "] = " + classesProbabilities[key]);
            });
            console.log("  -Classes Prior Probabilities calculated.");
        }

        function countClassesFeaturesAvailable() {
            var featuresList = {};
            Object.keys(trainData).forEach(function (key) {
                featuresList[key] = [];
                var i = 0;
                trainData[key].forEach(function(featuresData) {
                    if (i == 0) {
                        featuresList[key] = featuresData.slice(0);
                        i++;
                    } else {
                        for (var j = 0; j < featuresList[key].length; j++) {
                            featuresList[key][j] += featuresData[j];
                        }
                    }
                });
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
            
            //console.log("  -Features Prior Probabilities:");
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
                    //console.log("  -[" + key + "][" + i +"] = " + featuresClassesFrequency[i]);
                }
                featuresClassesPriorProbabilities[key] = featuresClassesFrequency;
            });
            console.log("  -Words Prior Probabilities calculated.");
        }
        
        function saveData() {
            var jsonString = JSON.stringify(classesProbabilities);
            fs.writeFileSync(classesProbabilitiesJsonPath, jsonString);

            jsonString = JSON.stringify(featuresClassesPriorProbabilities);
            fs.writeFileSync(featuresClassesPriorProbabilitiesJsonPath, jsonString);

            console.log("  -Classes/Words Prior Probabilities saved on file.");
        }

        function trainSystem() {

            calcClassesPriorProbabilities();
            calcFeaturesPriorProbabilities();
            
            console.log("  -Naive Bayes system trained.");
        }
        
        function classifyProblemResolve(dataToClassifiy, classA, classB) {

            var classAData = featuresClassesPriorProbabilities[classA];
            var classAResult = math.log(classesProbabilities[classA], 10);
            
            var classBData = featuresClassesPriorProbabilities[classB];
            var classBResult = math.log(classesProbabilities[classB], 10);
            
            for (var i = 0; i < dataToClassifiy.length; i++) {
                
                var conditionalProbA = classAData[i];
                var conditionalProbB = classBData[i];
                var countsAppear = dataToClassifiy[i];
                
                if (typeof conditionalProbA == "undefined" || typeof conditionalProbB == "undefined") {
                    console.log();
                }
                
                var powA = math.pow(conditionalProbA, countsAppear);
                var powB = math.pow(conditionalProbB, countsAppear);
                
                var logA = math.log(powA, 10);
                var logB = math.log(powB, 10);

                classAResult = classAResult + logA;
                classBResult = classBResult + logB;
            }

            //console.log(" - classA: " + classAResult + ", classB: " + classBResult);
            if (classAResult > classBResult) {
                return classA;
            }
            return classB;
        }

        function testSystem() {
            var truePositiveSubjectivity = 0, //result class Subjective and tweet with class Subjective
                trueNegativeSubjectivity = 0, //result class Subjective but tweet com a class Objective
                falsePositiveSubjectivity = 0, //result class Objective and tweet com a class Objective
                falseNegativeSubjectivity = 0; //result class Objective but tweet com a class Subjective
            var truePositivePolarity = 0, //result class Positive and tweet with class Positive
                trueNegativePolarity = 0, //result class Positive but tweet with class Negative
                falsePositivePolarity = 0, //result class Negative and tweet with class Negative
                falseNegativePolarity = 0; //result class Negative but tweet with class Positive

            Object.keys(testData).forEach(function (key) {

                var dataToClassify = testData[key];
                dataToClassify.forEach(function (textData) {
                    
                    var classification = classifyProblemResolve(textData, "subjective", "objective");
                    if (classification === "subjective") {
                        if (key === "subjective") {
                            truePositiveSubjectivity++;
                        } else {
                            falsePositiveSubjectivity++;
                        }

                        classification = classifyProblemResolve(textData, "positive", "negative");
                        if (classification === "positive") {
                            if (key === "positive") {
                                truePositivePolarity++;
                            } else {
                                falsePositivePolarity++;
                            }
                        } else {
                            if (key === "negative") {
                                trueNegativePolarity++;
                            } else {
                                falseNegativePolarity++;
                            }
                        }
                    } else {
                        if (key === "objective") {
                            trueNegativeSubjectivity++;
                        } else {
                            falseNegativeSubjectivity++;
                        }
                    }
                });
            });
            console.log("  -Sensibility VS Specificity:");
            //Sensitivity = True Positive Rate  = Hit Rate = Recall
            var sensitivitySubjectivity = truePositiveSubjectivity / (truePositiveSubjectivity + falseNegativeSubjectivity);
            var sensitivityPolarity = truePositivePolarity / (truePositivePolarity + falseNegativePolarity);
            
            //Specificity = True Negative Rate
            var specificitySubjectivity = trueNegativeSubjectivity / (trueNegativeSubjectivity + falsePositiveSubjectivity);
            var specificityPolarity = trueNegativePolarity / (trueNegativePolarity + falsePositivePolarity);
            
            //accuracy...the fraction of classifications that are correct =  accuracy_F1 = 2TP / (2TP + FP + FN)
            var accuracySubjectivity = (2 * truePositiveSubjectivity) / ((2 * truePositiveSubjectivity) + falsePositiveSubjectivity + falseNegativeSubjectivity);
            var accuracyPolarity = (2 * truePositivePolarity) / ((2 * truePositivePolarity) + falsePositivePolarity + falseNegativePolarity);

            console.log("   -Subjectivity:\n    -Sensitivity: " + sensitivitySubjectivity + ", Specificity: " + specificitySubjectivity + "\n    -F1_Accuracy: " + accuracySubjectivity);
            console.log("   -Polarity:\n    -Sensitivity: " + sensitivityPolarity + ", Specificity: " + specificityPolarity + "\n    -F1_Accuracy: " + accuracyPolarity);
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
                    dataWords = fs.readFileSync(featuresClassesPriorProbabilitiesJsonPath);
                    featuresClassesPriorProbabilities = JSON.parse(dataWords);
                    
                    systemAlreadyTrained = true;
                    console.log("  -Naive Bayes System Data Loaded.");

                } catch (e) {
                    console.log("\n  -ERROR: reading Words Classes Probabilities");
                    //console.log(e);
                }
            } catch (e) {
                console.log("\n  -ERROR: reading Classes Probabilities");
                //console.log(e);
            }
            return systemAlreadyTrained;
        }

        //[Public Methods]
        this.Start = function (data, setup) {
            dataProcessor = setup;

            console.log("\n  -Naive Bayes System Starting...");
            //Check if there is a system already trained...
            var systemAlreadyTrained = readNaiveBayesSystemData();
            
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
