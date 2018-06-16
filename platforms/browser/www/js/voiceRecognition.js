"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpeechRec = (function () {
    function SpeechRec() {
        var recognition = new SpeechRecognition();
        recognition.lang = "fr-FR";
        recognition.continuous = true;
        recognition.maxAlternatives = 1;
        var recognizing = false;
        var mybutton = document.querySelector('#startSpeechRecognition');
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
            document.body.textContent = sentence;
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
    }
    return SpeechRec;
}());
exports.SpeechRec = SpeechRec;
//# sourceMappingURL=voiceRecognition.js.map