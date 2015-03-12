//[Features Selection System]
var Math = require('mathjs');
var ProcessMonitor = require('../ProcessingMonitor/ProcessMonitor.js');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function FeaturesSelection() {
        
        //[Private data]
        var topWordsForEachClass = 10;

        //[Private Methods]

        function mutualInformationCalculation(totalFeatures, f1C1, f1C0, f0C1, f0C0) {
            var x = ((totalFeatures * f1C1) / ((f1C1 + f1C0) * (f1C1 + f0C1)));
            var log = Math.log(x, 2);
            var firstValue = (f1C1 / totalFeatures) * log;
            
            x = ((totalFeatures * f1C0) / ((f1C0 + f1C1) * (f1C0 + f0C0)));
            log = Math.log(x, 2);
            var secondValue = (f1C0 / totalFeatures) * log;
            
            x = ((totalFeatures * f0C1) / ((f0C1 + f0C0) * (f1C1 + f0C1)));
            log = Math.log(x, 2);
            var thirdValue = (f0C1 / totalFeatures) * log;
            
            x = ((totalFeatures * f0C0) / ((f0C0 + f0C1) * (f1C0 + f0C0)));
            log = Math.log(x, 2);
            var fourthValue = (f0C0 / totalFeatures) * log;
            
            return (firstValue + secondValue + thirdValue + fourthValue);
        }
        
        function calcNotWordOnClass(word, classData) {
            var result = 0;
            Object.keys(classData).forEach(function(key) {
                if (key != word) {
                    result = result + classData[key];
                }
            });
            return result;
        }
        
        function countTotalOfWords(data) {
            var count = 0;
            Object.keys(data).forEach(function(key) {
                count = count + data[key];
            });
            return count;
        }

        function calcWordsMutualInf(classAData, classBData) {
            var mutInf = {};
            Object.keys(classAData).forEach(function (word) {
                var f1C1 = classAData[word]; //feature = true, class = true
                var f1C0 = classBData[word]; //feature = true, class = false
                var f0C1 = calcNotWordOnClass(word, classAData); //feature = false, class = true
                var f0C0 = calcNotWordOnClass(word, classBData); //feature = false, class = false
                var totalFeatures = f1C1 + f1C0 + f0C1 + f0C0;
                //just for DEBUG: totalFeatures must be equal total, True ;)
                //var countA = countTotalOfWords(classAData),
                //    countB = countTotalOfWords(classBData),
                //    total = countA + countB;
                mutInf[word] = mutualInformationCalculation(totalFeatures, f1C1, f1C0, f0C1, f0C0);
                if (isNaN(mutInf[word])) {
                    mutInf[word] = 0;
                }
            });
            return mutInf;
        }
        
        function mutualWordsInfCalcs(totalCounts, nameClassA, nameClassB) {
            var results = {};
            results[nameClassA] = calcWordsMutualInf(totalCounts[nameClassA], totalCounts[nameClassB]);
            results[nameClassB] = calcWordsMutualInf(totalCounts[nameClassB], totalCounts[nameClassA]);
            return results;
        }
        
        function sortDictionary(dictionary) {
            var sorted = [];
            Object.keys(dictionary).forEach(function (word) {
                sorted.push([word, dictionary[word]]);
            });
            sorted.sort(function (a, b) { return b[1] - a[1]; });//descending order...
            return sorted;
        }
        
        function arrayToDic(array) {
            var dic = {};
            array.forEach(function (value) {
                dic[value[0]] = value[1];
            });
            return dic;
        }

        function selectTheWordsBiggest(miResults) {
            var best = [];
            Object.keys(miResults).forEach(function (key) {
                var data = miResults[key];
                var sortedValues = arrayToDic(sortDictionary(data).slice(0, topWordsForEachClass));
                Object.keys(sortedValues).forEach(function(word) {
                    if (best.indexOf(word) < 0) {
                        best.push(word);
                    }
                });
            });
            return best;
        }

        //[Public Methods]
        
        this.ByMutualInformationWords = function(data, top) {
            console.log("\n -Feature Selection: By Mutual Information");
            
            topWordsForEachClass = top;

            var measures = new ProcessMonitor();
            measures.StartTime();

            var miResults = {};
            miResults["polarity"] = mutualWordsInfCalcs(data, "positive", "negative");
            miResults["subjectivity"] = mutualWordsInfCalcs(data, "neutral", "subjective");
            console.log("");

            var bestFeatures = {};
            bestFeatures["polarity"] = selectTheWordsBiggest(miResults["polarity"]);
            bestFeatures["subjectivity"] = selectTheWordsBiggest(miResults["subjectivity"]);
            
            measures.ShowTimeCount("nothing to show", "Mutual Info calculated.");

            console.log("   -Features size: ");
            Object.keys(bestFeatures).forEach(function(key) {
                console.log("    -" + key + ": " + bestFeatures[key].length);
            });
            return bestFeatures;
        }
    }
    
    //[Export the FeaturesSelection System Object]
    module.exports = FeaturesSelection;
}());