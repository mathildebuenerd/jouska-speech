"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var writingInterface = require("./writingInterface");
var writingAssistant = new writingInterface.WritingInterface();
var translate = require("./../../hooks/translate");
var keys = require("./apiKeys");
var Keys = new keys.Keys();
var sentimentAnalysis_1 = require("./sentimentAnalysis");
var text = new sentimentAnalysis_1.TextAnalysis();
translate.key = Keys.API_KEY;
translate.from = 'fr';
var CordovaApp = (function () {
    function CordovaApp() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }
    CordovaApp.prototype.onDeviceReady = function () {
        var recognition = new webkitSpeechRecognition();
        recognition.lang = "fr-FR";
        recognition.maxAlternatives = 1;
        var recognizing = false;
        var mybutton = document.querySelector('#startSpeechRecognition');
        var blockSentences = document.querySelector("#blockSentences");
        mybutton.addEventListener('click', restartRecognition);
        recognition.onstart = function (event) {
            console.log(event.type);
            recognizing = true;
        };
        recognition.onresult = function (event) {
            console.log(event.type);
            var sentence = '';
            for (var i = 0; i < event.results.length; i++) {
                sentence += event.results[i][0].transcript + ' ';
            }
            console.log("length", blockSentences.textContent.length);
            blockSentences.textContent += sentence;
            writingAssistant.startAssistance();
            console.log(sentence);
            restartRecognition();
        };
        recognition.onend = function (event) {
            console.log(event.type);
            restartRecognition();
        };
        recognition.onspeechend = function (event) {
            console.log(event.type);
        };
        function restartRecognition() {
            console.log('je restart');
            recognition.stop();
            console.log('jai stop dans le restart');
            recognition.start();
            console.log('jai redemarré dans le restart');
        }
    };
    return CordovaApp;
}());
exports.CordovaApp = CordovaApp;
var instance = new CordovaApp();
//# sourceMappingURL=index.js.map