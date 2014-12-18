//Data reader...

//Constructor
function DataReader(){

    this.filePath = "";

    this.Read();
}

//Methods
DataReader.prototype.Read = function() {
    console.log(" -Data Reader reading...");

};

//Export the class
module.exports = DataReader;