//[Neural Network (Perceptron) System]
var fs = require('fs');
var Math = require('mathjs');

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
        var weightsRandomMin = -0.5,
            weightsRandomMax = 0.5,
            activationFunction = 1,
            stepFunctionThreshold = 0, //if activationFunction = 1 => choose a threshold
            learningRate = 1;
        
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
                    console.log("\n  -ERROR: reading weights Polarity File.");
                }
            } catch (e) {
                console.log("\n  -ERROR: reading weights Subjectivity File.");
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
        
        function calcActualOutput(textData, polarity) {
            var actualOutput = 0;
            var weights;
            if (polarity === "subjective" || polarity === "objective") {
                weights = weightsSubjectivity;
            } else {
                weights = weightsPolarity;
            }
            for (var i = 0; i < textData.length; i++) {
                actualOutput = actualOutput + (weights[i] * textData[i]);
            }
            return actualOutput;
        }

        function calcActivationFunctionValue(actualOutput) {
            var activationLevel = 0;
            switch (activationFunction) {
                case 1:
                    //Step Function: The activationLevel is a certain value if the entranceSignal is above a certain threshold, and other value if is below.
                    if (actualOutput > stepFunctionThreshold) {
                        activationLevel = 1;
                    }
                    break;
                default:
                    //Linear Function: activationLevel = f(entranceSignal) = entranceSignal
                    activationLevel = actualOutput;
            }
            return activationLevel;
        }
        
        function updateWeights(activationLevel, polarity, textData) {
            var weights;
            var expectedOutput = 0;
            if (polarity === "subjective" || polarity === "objective") {
                //Subjectivity problem
                weights = weightsSubjectivity;
                if (polarity === "subjective") {
                    expectedOutput = 1;
                }
            } else {
                //polarity problem
                weights = weightsPolarity;
                if (polarity === "positive") {
                    expectedOutput = 1;
                }
            }
            for (var i = 0; i < weights.length; i++) {
                if (activationLevel != expectedOutput) { //wrong prediction
                    weights[i] = weights[i] + -1 * learningRate * activationLevel * textData[i];
                } else {
                    weights[i] = weights[i] + learningRate * activationLevel * textData[i];
                }
            }
        }

        function trainKey(key) {
            trainData[key].forEach( function(textData) {
                var actualOutput = calcActualOutput(textData, key),
                    activationLevel = calcActivationFunctionValue(actualOutput);
                updateWeights(activationLevel, key, textData);
            });
        }
        
        function trainSystem() {
            //Subjectivity Problem
            var keys = ["subjective", "objective"];
            setupWeights("subjectivity");
            keys.forEach(trainKey);
            
            //Polarity Problem
            keys = ["positive", "negative"];
            setupWeights("polarity");
            keys.forEach(trainKey);
            
            var accuracy = testSystem(true);
            console.log("  -Global Accuracy: " + accuracy);
            console.log("  -Perceptron system trained.");
        }
        
        function testSystem(printResults) {
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

                    var entranceSignal = calcActualOutput(textData, "subjective");
                    var activationLevel = calcActivationFunctionValue(entranceSignal);

                    if (activationLevel === 1) {
                        if (key === "subjective") {
                            truePositiveSubjectivity++;
                        } else {
                            falsePositiveSubjectivity++;
                        }
                        
                        entranceSignal = calcActualOutput(textData, "positive");
                        activationLevel = calcActivationFunctionValue(entranceSignal);
                        if (activationLevel === 1) {
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
            //Sensitivity = True Positive Rate  = Hit Rate = Recall
            var sensitivitySubjectivity = truePositiveSubjectivity / (truePositiveSubjectivity + falseNegativeSubjectivity);
            var sensitivityPolarity = truePositivePolarity / (truePositivePolarity + falseNegativePolarity);
            //Specificity = True Negative Rate
            var specificitySubjectivity = trueNegativeSubjectivity / (trueNegativeSubjectivity + falsePositiveSubjectivity);
            var specificityPolarity = trueNegativePolarity / (trueNegativePolarity + falsePositivePolarity);
            //accuracy...the fraction of classifications that are correct =  accuracy_F1 = 2TP / (2TP + FP + FN)
            var accuracySubjectivity = (2 * truePositiveSubjectivity) / ((2 * truePositiveSubjectivity) + falsePositiveSubjectivity + falseNegativeSubjectivity);
            var accuracyPolarity = (2 * truePositivePolarity) / ((2 * truePositivePolarity) + falsePositivePolarity + falseNegativePolarity);
            if (printResults) {
                console.log("  -Sensibility VS Specificity:");
                console.log("   -Subjectivity:\n    -Sensitivity: " + sensitivitySubjectivity + ", Specificity: " + specificitySubjectivity + "\n    -F1_Accuracy: " + accuracySubjectivity);
                console.log("   -Polarity:\n    -Sensitivity: " + sensitivityPolarity + ", Specificity: " + specificityPolarity + "\n    -F1_Accuracy: " + accuracyPolarity);
            }
            return (accuracySubjectivity + accuracyPolarity) / 2;
        }
        
        //[Public Methods]
        this.Start = function (data, Processor) {
            dataProcessor = Processor;

            console.log("\n  -Neural Network (Perceptron) System Starting...");
            //Check if there is a system already trained...
            var systemAlreadyTrained = readNeuralNetworkSystemData();
            
            if (systemAlreadyTrained != true) {
                console.log("  -System not trained... Train it...");
                
                trainData = data["train"];
                testData = data["test"];

                //All data ready... train it... save it... and test it...
                trainSystem();
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
