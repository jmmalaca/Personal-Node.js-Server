//[Neural Network (Perceptron) System]
var fs = require('fs');
var Math = require('mathjs');
var Separator = require('../SentimentAnalysis/DataSeparation.js');

(function() {

    "use strict";
    //[Define your library strictly]

    function NeuralNetwork() {

        //[Private data]
        var dataProcessor,//needed to process the new texts the system receive...
            trainData = {},
            testData = {},
            weightsSubjectivity = [],
            weightsPolarity = [],
            weightsSubjectivityJsonPath = "./SentimentAnalysis/WeightsSubjectivity.json",
            weightsPolarityJsonPath = "./SentimentAnalysis/WeightsPolarity.json";
        
        //[Activation Function data]
        var weightsRandomMin = -1,
            weightsRandomMax = 1,
            stepFunctionThreshold = 0,
            activationFunction = 1,
            learningRate = 0.1;
        
        //[Private Methods]
        function saveData() {
            var jsonString = JSON.stringify(weightsSubjectivity);
            fs.writeFileSync(weightsSubjectivityJsonPath, jsonString);
            jsonString = JSON.stringify(weightsPolarity);
            fs.writeFileSync(weightsPolarityJsonPath, jsonString);
            console.log("  -Weights (Subjectivity/Polarity) values saved on file.");
        }

        function readNeuralNetworkSystemData() {
            var systemAlreadyTrained = false,
                data;
            try {
                data = fs.readFileSync(weightsSubjectivityJsonPath);
                weightsSubjectivity = JSON.parse(data);

                try {
                    data = fs.readFileSync(weightsPolarityJsonPath);
                    weightsPolarity = JSON.parse(data);
                    
                    systemAlreadyTrained = true;
                    console.log("  -Neural Network (Perceptron) Data Loaded.");

                } catch (e) {
                    console.log("\n -ERROR: reading weights Polarity File.");
                }
            } catch (e) {
                console.log("\n -ERROR: reading weights Subjectivity File.");
            }
            return systemAlreadyTrained;
        }
        
        function pushtoWeightsArray(numberOfWeights, weightsArray) {
            for (var i = 0; i < numberOfWeights; i++) {
                var randValue = Math.random() * (weightsRandomMax - weightsRandomMin) + weightsRandomMin;
                weightsArray.push(randValue);
            }
        }

        function setupWeights(problem) {
            var exampleOfClasseTrainData;
            var exampleOfTrainData;
            var numberOfWeights;
            var weights = [];
            if (problem === "subjectivity") {
                exampleOfClasseTrainData = trainData["subjective"];
                weights =  weightsSubjectivity;
            } else {
                exampleOfClasseTrainData = trainData["positive"];
                weights = weightsPolarity;
            }
            exampleOfTrainData = exampleOfClasseTrainData[0];
            numberOfWeights = exampleOfTrainData.length;
            pushtoWeightsArray(numberOfWeights, weights);
        }
        
        function calcEntranceSignal(textData, polarity) {
            var entranceSignal = 0;
            var weights;
            if (polarity === "subjective" || polarity === "objective") {
                weights = weightsSubjectivity;
            } else {
                weights = weightsPolarity;
            }
            for (var i = 0; i < textData.length; i++) {
                entranceSignal = entranceSignal + (weights[i] * textData[i]);
            }
            return entranceSignal;
        }

        function calcActivationFunctionValue(entranceSignal) {
            var activationLevel = 0;
            switch (activationFunction) {
                case 1:
                    //Step Function: The activationLevel is a certain value if the entranceSignal is above a certain threshold, and other value if is below.
                    if (entranceSignal > stepFunctionThreshold) {
                        activationLevel = 1;
                    } else {
                        activationLevel = 0;
                    }
                    break;
                default:
                    //Linear Function: activationLevel = f(entranceSignal) = entranceSignal
                    activationLevel = entranceSignal;
            }
            return activationLevel;
        }
        
        function updateWeights(activationLevel, polarity, textData) {
            var weights;
            var expectedValue = 0;
            if (polarity === "subjective" || polarity === "objective") {
                //Subjectivity problem
                weights = weightsSubjectivity;
                if (polarity === "subjective") {
                    expectedValue = 1;
                }
            } else {
                //polarity problem
                weights = weightsPolarity;
                if (polarity === "positive") {
                    expectedValue = 1;
                }
            }
            for (var i = 0; i < weights.length; i++) {
                if (activationLevel != expectedValue) { //wrong prediction
                    weights[i] = weights[i] + -1 * learningRate * activationLevel * textData[i];
                } else {
                    weights[i] = weights[i] + learningRate * expectedValue * textData[i];
                }
            }
        }

        function trainKey(key) {
            trainData[key].forEach( function(textData) {
                var entranceSignal = calcEntranceSignal(textData, key),
                    activationLevel = calcActivationFunctionValue(entranceSignal);
                updateWeights(activationLevel, key, textData);
            });
        }

        function trainSystem(allDataOnProcessedTexts) {
            var separator = new Separator();
            //select data from the [beginning], from the [middle] or from the [end] of the array and percentage for training and test
            var trainingDataPercentage = 70;
            var fromList = ["middle"];

            fromList.forEach(function(from) {
                var data = separator.Start(allDataOnProcessedTexts, from, trainingDataPercentage);
                //[Separate data from training and validation]
                trainData = data["train"];
                testData = data["test"];

                //Subjectivity Problem
                var keys = ["subjective", "objective"];
                setupWeights("subjectivity");
                keys.forEach(trainKey);
                //Polarity Problem
                keys = ["positive", "negative"];
                setupWeights("polarity");
                keys.forEach(trainKey);
                
                testSystem();
            });
        }
        
        function testSystem() {
            var rightSubjectiveClassifications = 0,
                wrongSubjectiveClassifications = 0,
                rightPositiveClassifications = 0,
                wrongPositiveClassifications = 0,
                rightNeutralClassifications = 0,
                wrongNeutralClassifications = 0,
                rightNegativeClassifications = 0,
                wrongNegativeClassifications = 0;
            
            var truePositiveSubjectivity = 0, //result class Subjective and tweet with class Subjective
                trueNegativeSubjectivity = 0, //result class Subjective but tweet com a class Objective
                falsePositiveSubjectivity = 0, //result class Objective and tweet com a class Objective
                falseNegativeSubjectivity = 0; //result class Objective but tweet com a class Subjective
            
            var truePositivePolarity = 0, //result class Positive and tweet with class Positive
                trueNegativePolarity = 0, //result class Positive but tweet with class Negative
                falsePositivePolarity = 0, //result class Negative and tweet with class Negative
                falseNegativePolarity = 0; //result class Negative but tweet with class Positive

            Object.keys(testData).forEach(function(key) {
                testData[key].forEach(function (textData) {

                    var entranceSignal = calcEntranceSignal(textData, "subjective");
                    var activationLevel = calcActivationFunctionValue(entranceSignal);

                    if (activationLevel === 1) {
                        if (key === "subjective") {
                            rightSubjectiveClassifications++;
                            truePositiveSubjectivity++;
                        } else {
                            wrongSubjectiveClassifications++;
                            falsePositiveSubjectivity++;
                        }
                        
                        entranceSignal = calcEntranceSignal(textData, "positive");
                        activationLevel = calcActivationFunctionValue(entranceSignal);
                        if (activationLevel === 1) {
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
            console.log("   -Positive: " + ((rightPositiveClassifications * 100) / positiveCount) + "% Correct");
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
        
        //[Public Methods]
        this.Start = function (allDataOnProcessedTexts, setupData) {
            dataProcessor = setupData;

            //Check if there is a system already trained...
            var systemAlreadyTrained = readNeuralNetworkSystemData();
            
            if (systemAlreadyTrained != true) {
                console.log("\n  -System not trained... Train it...");
                
                //All data ready... train it... save it... and test it...
                trainSystem(allDataOnProcessedTexts);
                //saveData();
                
            } else {
                console.log("  -System trained...");
                
            }
            
            console.log("\n  -Neural Network (Perceptron) System Ready.");
        }
    }

    //[Export the Neural Network System Object]
    module.exports = NeuralNetwork;
}());
