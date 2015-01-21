//[Processing Data Measures System]

var cpu = require('windows-cpu');//https://www.npmjs.com/package/windows-cpu
var fs = require('fs');

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function ProcessData() {
        //[Private Data]
        var start = 0; //javascript Date Object
        var startHR = 0; //nodejs high-resolution real time [seconds, nanoseconds] array
        var loadsFilePath = "./ProcessingData/cpuLoadsJSON.txt";
        //var cpuLoadsData = {};

        //[Private Methods]
        function readJsonDataFromFile() {
            console.log("   -Load CPU Data to JSON file.");
            var data = fs.readFileSync(loadsFilePath);
            if (data != null){ cpuLoadsData = JSON.parse(data); }
        }
        
        function saveJsonDataToFile() {
            var jsonString = JSON.stringify(cpuLoadsData);
            fs.writeFileSync(loadsFilePath, jsonString);
        }

        function showData(numberTextsProcessed, text) {
            var end = new Date().getTime();
            var endHR = process.hrtime(startHR); //[seconds, milliseconds = nanoseconds/1000000]

            var time = end - start; //in miliseconds, seconds = 0.001 * time
            var seconds = 0.001 * time;
            if (seconds > 60) {
                console.log("   -" + text + ", execution time: " + (seconds / 60) + "m");
                console.log("   -" + text + ", execution time (hr): " + (endHR[0] / 60) + "m, " + (endHR[1] / 1000000) + "ms");
            } else {
                console.log("   -" + text + ", execution time: " + seconds + "s");
                console.log("   -" + text + ", execution time (hr): " + endHR[0] + "s" + (endHR[1] / 1000000) + "ms");
            }
            
            // Get total load for all node processes
            var cpuPercentage = cpu.nodeLoad(function (error, results) {
                if (error) {
                    return console.log(error);
                }
                console.log("   -Server CPU Load: " + results["load"] + "% needed");
                console.log("   -Server processes: ");
                results["found"].forEach(function(item) {
                    console.log("   -Process[" + item["pid"] + "]: " + item["process"] + ", " + item["load"] + "%");
                });
                return results["found"].length + "," + results["load"];
            });
            
            //var dataToAdd = [cpuPercentage, seconds];
            //if (cpuLoadsData[numberTextsProcessed] == null) {
            //    cpuLoadsData[numberTextsProcessed] = [];
            //}
            //cpuLoadsData[numberTextsProcessed].push(dataToAdd);
        }

        //[Public Methods]
        this.StartTime = function () {
            start = new Date().getTime();
            startHR = process.hrtime();
            //readJsonDataFromFile();
        }

        this.ShowTimeCount = function (numberTextsProcessed, text) {
            showData(numberTextsProcessed, text);
            //saveJsonDataToFile();
            //console.log("   -CPU Data Saved.");
        }
    }
    
    //[Export the ProcessData System Object]
    module.exports = ProcessData;
}());
