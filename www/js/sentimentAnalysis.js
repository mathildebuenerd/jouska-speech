"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sentiment = require("./../../hooks/node-sentiment");
var darktriad = require("./../../hooks/darktriad");
var bigfive = require("./../../hooks/bigfive");
var predictgender = require("./../../hooks/predictgender");
var prospectimo = require("./../../hooks/prospectimo");
var selfishness = require("./../../hooks/node-sentiment-selfishness");
var gtranslate = require("./../../hooks/translate");
var TextAnalysis = (function () {
    function TextAnalysis() {
        this.translateToEnglish = function (sentence) {
            return new Promise(function (resolve, reject) {
                var text = "";
                gtranslate(sentence, { to: 'en' })
                    .then(function (translatedText) {
                    text = translatedText;
                    if (translatedText.indexOf('&#39;') !== -1) {
                        text = translatedText.replace('&#39;', "'");
                    }
                    console.log("text: " + text);
                    resolve(text);
                }).catch(function (error) { return reject(error); });
            });
        };
    }
    TextAnalysis.extractClauses = function (sentence) {
        var sentenceToSlice = sentence;
        var separators = new RegExp(/[.?!,]\s| et | and /, 'gim');
        var array;
        var subSentences = [];
        while ((array = separators.exec(sentenceToSlice)) !== null) {
            var subSentence = sentenceToSlice.slice(0, array.index);
            subSentences.push(subSentence);
            sentenceToSlice = sentenceToSlice.replace(subSentence, '');
        }
        if (subSentences.length > 1) {
            return subSentences;
        }
        else {
            return sentence;
        }
    };
    TextAnalysis.prototype.updateSentimentAnalysis = function () {
        var smsData = JSON.parse(localStorage.getItem('smsData'));
        for (var contact in smsData) {
            for (var type in smsData[contact]) {
                if (type !== 'name') {
                    for (var singleSMS in smsData[contact][type]) {
                        var originalSMS = smsData[contact][type][singleSMS].text.original;
                        smsData[contact][type][singleSMS].analysis.sentimentFr = {};
                        smsData[contact][type][singleSMS].analysis.sentimentFr = this.sentimentAnalysis(originalSMS, 'fr');
                    }
                }
            }
        }
        console.log("anlayse que je refais:");
        console.log(smsData);
    };
    TextAnalysis.prototype.sentimentAnalysis = function (textMessage, language, originalMessage) {
        if (language === void 0) { language = 'en'; }
        if (originalMessage === void 0) { originalMessage = textMessage; }
        var message = TextAnalysis.extractClauses(textMessage);
        if (Array.isArray(message)) {
            var analysis = [];
            for (var clause in message) {
                analysis.push(sentiment(message[clause], language, originalMessage));
            }
            return analysis;
        }
        else {
            return sentiment(message, language, originalMessage);
        }
    };
    TextAnalysis.prototype.darktriadAnalysis = function (textMessage, opts) {
        if (opts === void 0) { opts = { "output": "matches" }; }
        return darktriad(textMessage, opts);
    };
    TextAnalysis.prototype.personalityAnalysis = function (textMessage, opts) {
        if (opts === void 0) { opts = { "output": "matches" }; }
        return bigfive(textMessage, opts);
    };
    TextAnalysis.prototype.genderPrediction = function (textMessage, language) {
        if (language === void 0) { language = 'en'; }
        return predictgender(textMessage);
    };
    TextAnalysis.prototype.temporalOrientationPrediction = function (textMessage, language) {
        if (language === void 0) { language = 'en'; }
        return prospectimo(textMessage);
    };
    TextAnalysis.prototype.selfishnessAnalysis = function (textMessage, language) {
        if (language === void 0) { language = 'fr'; }
        return selfishness(textMessage, language);
    };
    return TextAnalysis;
}());
exports.TextAnalysis = TextAnalysis;
//# sourceMappingURL=sentimentAnalysis.js.map