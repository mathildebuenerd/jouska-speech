"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sentimentAnalysis_1 = require("./sentimentAnalysis");
var textAnalysis = new sentimentAnalysis_1.TextAnalysis();
var WritingInterface = (function () {
    function WritingInterface() {
        var _this = this;
        this.startAssistance = function () {
            console.log("startAssistance a d\u00E9marr\u00E9!!");
            _this.analyzeText();
        };
        this.changeSidebar = function (barSelector, score) {
            console.log("bar selector", barSelector);
            var sidebar = document.querySelector("#" + barSelector + " .fill");
            sidebar.style.backgroundImage = "url(img/interface-components/jauges/jauge_" + score + ".png";
        };
        this.getColor = function (object, value) {
            if (value > 8) {
                value = 8;
            }
            else if (value < -8) {
                value = -8;
            }
            return Object.keys(object).find(function (key) { return object[key] === value; });
        };
        this.getSentence = function () {
            var textArea = document.querySelector('#blockSentences');
            var text = textArea.textContent;
            var allWords = new RegExp(/.+/, 'gim');
            var sentence = text.match(allWords);
            return sentence[0];
        };
        this.showFeedback = function (analysis, type) {
            var score = 0;
            var otherAnalysis = ["psychopathy", "C", "O"];
            if (type === "polarity" || type === "selfishness") {
                if (analysis['score'] !== undefined) {
                    score += analysis['score'];
                }
                else {
                    for (var object in analysis) {
                        score += analysis[object]['score'];
                    }
                }
            }
            else if (otherAnalysis.indexOf(type) !== -1) {
                score = analysis;
            }
            var scoreBar = _this.getSidebarNumber(score);
            _this.changeSidebar(type, scoreBar);
        };
        this.analyzeText = function () {
            console.log("l'\u00E9venement change");
            var language = 'fr';
            var sentence = _this.getSentence();
            if (sentence !== undefined) {
                var polarity = textAnalysis.sentimentAnalysis(sentence, language);
                _this.showFeedback(polarity, "polarity");
                var selfish = textAnalysis.selfishnessAnalysis(sentence, language);
                _this.showFeedback(selfish, "selfishness");
                var ignoreLastWord = new RegExp(/.+[ !?,.:"]/, 'gim');
                var allWordsExceptLast = sentence.match(ignoreLastWord);
                var wordsToAnalyze = String(allWordsExceptLast);
                _this.tempSentences[1] = wordsToAnalyze;
                if (_this.tempSentences[1] !== _this.tempSentences[0]) {
                    _this.tempSentences[0] = wordsToAnalyze;
                    textAnalysis.translateToEnglish(wordsToAnalyze)
                        .then(function (englishSentence) {
                        var darktriad = textAnalysis.darktriadAnalysis(englishSentence);
                        var bigfive = textAnalysis.personalityAnalysis(englishSentence);
                        var interpretationDarkriad = _this.interpretAnalysis("darktriad", darktriad);
                        var interpretationBigfive = _this.interpretAnalysis("bigfive", bigfive);
                        var traitDarktriad = "psychopathy";
                        _this.showFeedback(interpretationDarkriad[traitDarktriad].score, String(traitDarktriad));
                        var traitBigfive = ["C", "O"];
                        for (var i = 0; i < traitBigfive.length; i++) {
                            var subkey = traitBigfive[i];
                            _this.showFeedback(interpretationBigfive[subkey].score, String(traitBigfive[i]));
                        }
                    })
                        .catch(function (err) { return console.log(err); });
                }
                else {
                }
            }
        };
        this.interpretAnalysis = function (type, analysis) {
            var analyses = {};
            var analysesDark = {
                "triad": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "narcissism": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "machiavellianism": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "psychopathy": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
            };
            var analysesBigfive = {
                "O": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "C": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "E": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "A": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
                "N": {
                    "score": 0,
                    "negativeWords": [],
                    "positiveWords": []
                },
            };
            if (type === "darktriad") {
                analyses = analysesDark;
                for (var trait in analysis) {
                    if (analysis[trait] !== []) {
                        for (var word in analysis[trait]) {
                            var _word = analysis[trait][word][0];
                            var wordScore = analysis[trait][word][3];
                            if (wordScore > 0) {
                                analyses[trait].score--;
                                analyses[trait].negativeWords.push(_word);
                            }
                            else {
                                analyses[trait].score++;
                                analyses[trait].positiveWords.push(_word);
                            }
                        }
                    }
                }
            }
            else if (type === "bigfive") {
                analyses = analysesBigfive;
                for (var trait in analysis) {
                    if (analysis[trait].matches !== []) {
                        for (var i = 0; i < analysis[trait].matches.length; i++) {
                            var _word = analysis[trait].matches[i][0];
                            var wordScore = analysis[trait].matches[i][3];
                            if (wordScore > 0) {
                                analyses[trait].score--;
                                analyses[trait].negativeWords.push(_word);
                            }
                            else {
                                analyses[trait].score++;
                                analyses[trait].positiveWords.push(_word);
                            }
                        }
                    }
                }
            }
            return analyses;
        };
        this.animateNegativeWords = function (words) {
            var textArea = document.querySelector('#smsContent');
            for (var word in words) {
                var slicedWord = _this.sliceWord(words[word], "negative");
                var toReplace = new RegExp("" + words[word], 'gi');
                textArea.innerHTML = (textArea.textContent).replace(toReplace, slicedWord);
            }
            var wordsToAnimate = document.querySelectorAll(".negative");
            if (wordsToAnimate !== undefined) {
                for (var singleWord in wordsToAnimate) {
                    var lettersToAnimate = wordsToAnimate[singleWord].querySelectorAll("span");
                    for (var letter in lettersToAnimate) {
                        var aLetter = lettersToAnimate[letter];
                        var randomValue = Math.floor(Math.random() * 3);
                        aLetter.style.animationName = "marionettes" + randomValue;
                    }
                }
            }
        };
        this.setEndOfContenteditable = function (contentEditableElement) {
            var range, selection;
            range = document.createRange();
            range.selectNodeContents(contentEditableElement);
            range.collapse(false);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        };
        this.sendMessage = function () {
            var recipientElement = document.querySelector('#contactNumber');
            var recipient = recipientElement.value;
            var messageElement = document.querySelector('#smsContent');
            var message = messageElement.textContent;
            var confirmationMessage = document.querySelector('#confirmationMessage');
            SMS.sendSMS(recipient, message, function () {
                console.log("sms envoy\u00E9! destinaire: " + recipient + "; message: " + message);
                recipientElement.value = "";
                messageElement.textContent = "";
                confirmationMessage.textContent = "Message correctement envoyé :)";
                setTimeout(function () {
                    confirmationMessage.textContent = "";
                }, 3000);
                var sendButton = document.querySelector('#sendMessage');
                sendButton.addEventListener('click', _this.sendMessage);
            }, function (err) {
                confirmationMessage.textContent = "Il y a eu une erreur, le message n'est pas parti...\n            Erreur: " + err;
                throw err;
            });
        };
        console.log("j'ai construit!");
        this.colors = {
            "a5f31b": 8,
            "a4ed2b": 7,
            "a2e739": 6,
            "a1dc52": 5,
            "a1d16b": 4,
            "a1c087": 3,
            "a1b595": 2,
            "a1a69f": 1,
            "a39ba1": 0,
            "ae849b": -1,
            "b57794": -2,
            "c26185": -3,
            "cf4c74": -4,
            "db3863": -5,
            "e82551": -6,
            "f21542": -7,
            "fb0736": -8
        };
        this.tempSentences = ["", ""];
    }
    WritingInterface.prototype.getSidebarNumber = function (score) {
        var value = score + 8;
        if (score > 8) {
            value = 8;
        }
        else if (score < -8) {
            value = -8;
        }
        return value;
    };
    WritingInterface.prototype.sliceWord = function (word, elmtClass) {
        var tag = "<span class=\"" + elmtClass + "\">";
        for (var letter = 0; letter < word.length; letter++) {
            tag += "<span>" + word[letter] + "</span>";
        }
        tag += "</span>";
        return tag;
    };
    return WritingInterface;
}());
exports.WritingInterface = WritingInterface;
//# sourceMappingURL=writingInterface.js.map