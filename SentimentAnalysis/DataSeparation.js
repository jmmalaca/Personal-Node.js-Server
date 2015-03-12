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
        function takeElements(data, classe, newClasse) {
            //Math.ceil() = round up result (i.e. 0.7 = 1)
            var countTraining = Math.ceil((trainingDataPercentage / 100) * data[classe].length);
            var countValidation = data[classe].length - countTraining;
            if (selectDataFrom === 'beginning') {
                trainData[newClasse] = data[classe].slice(0, countTraining);
                testData[newClasse] = data[classe].slice(countTraining, data[classe].length);
            } else if (selectDataFrom === 'middle') {
                var divisionInTwo = Math.ceil(countValidation / 2);
                trainData[newClasse] = data[classe].slice(divisionInTwo, (divisionInTwo + countTraining));
                testData[newClasse] = data[classe].slice(0, divisionInTwo);
                testData[newClasse].push(data[classe].slice((divisionInTwo + countTraining), data[classe].length));
            } else if (selectDataFrom === 'end') {
                trainData[newClasse] = data[classe].slice(countValidation, data[classe].length);
                testData[newClasse] = data[classe].slice(0, countValidation);
            }
        }
        
        function separateTrainingAndValidationData(data) {
            //console.log("  -Slice data from the " + selectDataFrom + ", Training percentage = " + trainingDataPercentage);
            
            takeElements(data, "positive", "positive");
            takeElements(data, "negative", "negative");
            takeElements(data, "neutral", "objective");

            var count = trainData["positive"].length / 2;
            trainData["subjective"] = trainData["positive"].slice(0, count);
            Array.prototype.push.apply(trainData["subjective"], trainData["negative"].slice(0, count));
            testData["subjective"] = testData["positive"].slice(0, count);
            Array.prototype.push.apply(testData["subjective"], testData["negative"].slice(0, count));
        }
        
        function generateTextDataWords(textData, featuresWords, polarity) {
            var textCoded = textData.processedText;
            var newDataArray = [];
            var words = featuresWords["subjectivity"];
            if (polarity === "positive" || polarity === "negative") {
                words = featuresWords["polarity"];
            }
            if (typeof textCoded !== 'undefined') {
                words.forEach(function (word) {
                    if (textCoded.indexOf(word) < 0) {
                        newDataArray.push(0);
                    } else {
                        newDataArray.push(1);
                    }
                });
            }
            return newDataArray;
        }
        
        function printDataExamples(type, dataArrays) {
            console.log("   -" + type + ": ");
            Object.keys(dataArrays).forEach(function (key) {
                var data = dataArrays[key];
                console.log("    -" + key + ", size: " + data.length + ": " + data[0]);
            });
        }

        function getTextDataWordsOnly(featuresWords) {
            //keys = polarity, subjectivity, -> list[words]
            var separatedData = {};
            var trainArrays = {};
            var testArrays = {};
            Object.keys(trainData).forEach(function(key) {
                trainArrays[key] = [];
                trainData[key].forEach(function(textData) {
                    trainArrays[key].push(generateTextDataWords(textData, featuresWords, key));
                });
                testArrays[key] = [];
                testData[key].forEach(function(textData) {
                    testArrays[key].push(generateTextDataWords(textData, featuresWords, key));
                });
            });
            console.log("  -Words(features) Text Data examples:");
            printDataExamples("Train", trainArrays);
            printDataExamples("Test", testArrays);
            separatedData["train"] = trainArrays;
            separatedData["test"] = testArrays;
            return separatedData;
        }

        //[Public Methods]
        this.Start = function (data, fromWhere, percentage) {
            selectDataFrom = fromWhere;
            trainingDataPercentage = percentage;

            separateTrainingAndValidationData(data);
            
            console.log("\n -Data Separation:");
            Object.keys(trainData).forEach(function (key) {
                console.log("  -"+key+": Train[" + trainData[key].length + "], Test[" + testData[key].length + "]");
            });
        }

        this.GetTextWordsDataArrays = function (featuresWords) {
            return getTextDataWordsOnly(featuresWords);
        }
    }
    
    //[Export the DataSeparation System Object]
    module.exports = DataSeparation;
}());
