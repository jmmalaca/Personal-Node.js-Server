//[Emoticons System]

(function () {
    
    "use strict";
    //[Define your library strictly]
    
    function Emoticons() {
        //[Private Data]
        //[Positive Emoticons]
        var patternHappy = /:\)+|\(+:|:>+|<+:|:-\)|\(-:|:\]|=\]|B-\)/g;
        var patternLaughing = /:-D|:D|:d|8-D|x-D| xD | xd |X-D| XD |=-D|=D|=-3|=3|B\^D/g;
        var patternTearsHappy = /:\'-\)|:\'\)/g;
        var patternSurprise = />:O|:-O|:O|°o°|°O°|:O|o_O|o_0|o\.O|8-0/g;
        var patternKiss = /:\*|:\^\*/g;
        var patternWink = /;-\)|;\)|\*\-\)|\*\)|;\-\]|;\]|;D|;\^\)|:\-,\)/g;
        var patternPlayful = />:P|:-P|:P|X-P|x-p| xp | XP |:-p|:p|=p|:-Þ|:Þ|:-b|:b/g;
        var patternAngel = /(o|O):-\)|0:-3|0:3|0:-\)|0:\)|0;\^\)/g;
        var patternCheer = /\\o\//g;
        var patternParty = /#-\)/g;
        var patternDrunk = /%-\)|%\)/g;
        var patternCool = /;-\\/g;
        var patternHighF = /o\/\\o|\^5|>_>\^|\^<_</g;
        
        var positivePatterns = [
            patternHappy,
            patternLaughing,
            patternTearsHappy,
            patternSurprise,
            patternKiss,
            patternWink,
            patternPlayful,
            patternAngel,
            patternCheer,
            patternParty,
            patternParty,
            patternDrunk,
            patternCool,
            patternHighF
        ];
        
        //[Negative Emoticons]
        var patternSad = /(:|=)\(+|\)+(:|=)|:<+|>+:|>:\[|:-\(|:<|:<|:-\[|:\[|\]:|\]-:|:\{|D:<|D:|D;|D=| DX |v\.v/g;
        var patternAngry = /:-\\|:@|>:\(/g;
        var patternCrying = /:\'-\(|:\'\(|QQ/g;
        var patternSkeptical = />:\\|>:\/|:-\/|:-\.|:\/|:\\|=\/|=\\|:L|=L|:S|>\.</g;
        var patternNoExpression = /:-\||:\|/g;
        var patternEmbaraced = /:\$/g;
        var patternEvil = />:\)|>;\)|>:-\)/g;
        var patternSick = /:-###\.\.|:###\.\./g;
        var patternBored = /-O|-o/g;

        var negativePatterns = [
            patternSad,
            patternAngry,
            patternCrying,
            patternSkeptical,
            patternNoExpression,
            patternEmbaraced,
            patternEvil,
            patternSick,
            patternBored
        ];

        //[Private Methods]
        function replaceEmoticons(text, textPolarity, patterns, keyword, processedTextData) {
            patterns.forEach(function(pattern) {
                var count = text.match(pattern);
                text = text.replace(pattern, keyword);

                if (count != null && textPolarity != null) {
                    if (textPolarity.indexOf("positive") > -1) {
                        if (keyword.indexOf("positive") > -1) {
                            count.forEach(function (value) {
                                processedTextData.AddPositiveEmoticon(value);
                            });
                        } else {
                            count.forEach(function (value) {
                                processedTextData.AddNegativeEmoticon(value);
                            });
                        }
                    } else if (textPolarity.indexOf("neutral") > -1) {
                        if (keyword.indexOf("positive") > -1) {
                            count.forEach(function (value) {
                                processedTextData.AddPositiveEmoticon(value);
                            });
                        } else {
                            count.forEach(function (value) {
                                processedTextData.AddNegativeEmoticon(value);
                            });
                        }
                    } else {
                        if (keyword.indexOf("positive") > -1) {
                            count.forEach(function (value) {
                                processedTextData.AddPositiveEmoticon(value);
                            });
                        } else {
                            count.forEach(function (value) {
                                processedTextData.AddNegativeEmoticon(value);
                            });
                        }
                    }
                }
            });
            return text;
        }

        //[Public Methods]
        this.getEmoticonsCount = function(type) {
            var count = 0;
            var data = {};
            if (type === "positive") {
                data = positivePatterns;
            } else {
                data = negativePatterns;
            }
            data.forEach(function (pattern) {
                var str = pattern.toString();
                var list = str.split("|");
                count = count + list.length;
            });
            return count;
        }

        this.Replace = function (text, textPolarity, processedTextData) {

            text = replaceEmoticons(text, textPolarity, positivePatterns, "positive_emoticon", processedTextData);
            text = replaceEmoticons(text, textPolarity, negativePatterns, "negative_emoticon", processedTextData);

            return text;
        }
    }
    
    //[Export the Emoticons System Object]
    module.exports = Emoticons;
}());
