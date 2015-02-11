//[Data Separation System: Training Data and Validation(Test) Data]

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function DataSeparation() {
        
        //[Private data]
        var trainingDataPercentage = 70;
        
        //select data from the [beginning], from the [middle] or from the [end] of the array
        var selectDataFrom = 'beginning';
        
        //train data...
        var trainData = {};
        
        //test data...
        var testData = {};
        
        //[Private Methods]
        function takeElements(data, classe) {
            //Math.ceil() = round up result (i.e. 0.7 = 1)
            var countTraining = Math.ceil((trainingDataPercentage / 100) * data[classe].length);
            var countValidation = data[classe].length - countTraining;
            if (selectDataFrom === 'beginning') {
                trainData[classe] = data[classe].slice(0, countTraining);
                testData[classe] = data[classe].slice(countTraining, data[classe].length);
            } else if (selectDataFrom === 'middle') {
                var divisionInTwo = Math.ceil(countValidation / 2);
                trainData[classe] = data[classe].slice(divisionInTwo, (divisionInTwo + countTraining));
                testData[classe] = data[classe].slice(0, divisionInTwo);
                testData[classe].push(data[classe].slice((divisionInTwo + countTraining), data[classe].length));
            } else if (selectDataFrom === 'end') {
                trainData[classe] = data[classe].slice(countValidation, data[classe].length);
                testData[classe] = data[classe].slice(0, countValidation);
            }
        }
        
        function separateTrainingAndValidationData(problem, data) {
            console.log("\n -Percentage data for Training = " + trainingDataPercentage);
            console.log("  -Slice data from the " + selectDataFrom);
            
            if (problem === "polarity") {
                
                takeElements(data, "positive");
                takeElements(data, "negative");

            } else if (problem === "subjectivity") {
                takeElements(data, "positive");
                takeElements(data, "neutral");
                takeElements(data, "negative");

                var subjectivityTrainData = {};
                subjectivityTrainData["subjective"] = [];
                subjectivityTrainData["objective"] = [];
                var subjectivityTestData = {};
                subjectivityTestData["subjective"] = [];
                subjectivityTestData["objective"] = [];
                //Array.prototype.push.apply(a, b); copy all elements from uma array to the other...
                Array.prototype.push.apply(subjectivityTrainData["subjective"], trainData["positive"]);
                Array.prototype.push.apply(subjectivityTrainData["objective"], trainData["neutral"]);
                Array.prototype.push.apply(subjectivityTrainData["subjective"], trainData["negative"]);
                Array.prototype.push.apply(subjectivityTestData["subjective"], testData["positive"]);
                Array.prototype.push.apply(subjectivityTestData["objective"], testData["neutral"]);
                Array.prototype.push.apply(subjectivityTestData["subjective"], testData["negative"]);

                trainData = {};
                testData = {};
                trainData = subjectivityTrainData;
                testData = subjectivityTestData;
            }
        }
        
        function getTextDataArraysOnly() {
            var separatedData = {};
            //Just retreive the Text Arrays Data
            var trainArrays = {};
            var testArrays = {};
            Object.keys(trainData).forEach(function (key) {
                trainArrays[key] = [];
                trainData[key].forEach(function (textData) {
                    if (textData.textDataArray != null) {
                        trainArrays[key].push(textData.textDataArray);
                    }
                });
                testArrays[key] = [];
                testData[key].forEach(function (textData) {
                    if (textData.textDataArray != null) {
                        testArrays[key].push(textData.textDataArray);
                    }
                }); 
            });
            separatedData["train"] = trainArrays;
            separatedData["test"] = testArrays;
            return separatedData;
        }

        //[Public Methods]
        this.Start = function (data, fromWhere, percentage) {
            selectDataFrom = fromWhere;
            trainingDataPercentage = percentage;

            var problems = ["subjectivity", "polarity"];
            problems.forEach(function(problem) {
                separateTrainingAndValidationData(problem, data);    
            });
            Object.keys(trainData).forEach(function (key) {
                console.log("  -Train Data[ " + key + " ]: " + trainData[key].length);
            });
            Object.keys(testData).forEach(function (key) {
                console.log("  -Test Data[ " + key + " ]: " + testData[key].length);
            });
            
            var separatedData = getTextDataArraysOnly();
            return separatedData;
        }
    }
    
    //[Export the DataSeparation System Object]
    module.exports = DataSeparation;
}());
