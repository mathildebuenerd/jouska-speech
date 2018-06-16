import * as writingInterface from "./writingInterface";
const writingAssistant = new writingInterface.WritingInterface();
import set = Reflect.set;

import * as translate from "./../../hooks/translate";
import * as keys from './apiKeys';
const Keys = new keys.Keys();

import {TextAnalysis} from "./sentimentAnalysis";
const text = new TextAnalysis();


translate.key = Keys.API_KEY;
translate.from ='fr';

declare const webkitSpeechRecognition: any;


export class CordovaApp {
    constructor() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }

    onDeviceReady() {

        let recognition = new webkitSpeechRecognition();
        recognition.lang = "fr-FR";
        // recognition.continuous = true;
        // recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        let recognizing = false;
        let mybutton = document.querySelector('#startSpeechRecognition');
        let blockSentences = <HTMLTextAreaElement> document.querySelector(`#blockSentences`);

        mybutton.addEventListener('click', restartRecognition);

        recognition.onstart = function(event) {
            // console.log(event.type);
            // blockSentences.style.backgroundColor = "blue";
            recognizing = true;
        };

        recognition.onresult = function(event) {
            // console.log(event.type);
            let sentence = '';

            // we go into the results in order to have the whole sentence
            for (let i=0; i<event.results.length; i++) {
                sentence+=event.results[i][0].transcript + ' ';
            }

            console.log(`length`, blockSentences.textContent.length)

            // s'il y a déjà pas mal de texte enregistré, on efface et on redémarre
            if (blockSentences.textContent.length > 300) {
                blockSentences.textContent = "";
            }
            blockSentences.textContent += sentence;
            writingAssistant.startAssistance();

            // console.log(sentence);
            restartRecognition();

            // when we have 10 words, we send it to the server and restart the recording
            // if ((sentence.split(' ')).length > 10) {
            //     // socket.emit('newSentence', {sentence: sentence}); // on envoie un message de type 'newsentence, avec la sentence en contenu
            //     // sentences.push({sentence:sentence});
            //     restartRecognition();
            // }

        };

        // permet de redémarrer la recognition quand elle s'arrête
        recognition.onend = (event) => {
            console.log(event.type);
            // blockSentences.style.backgroundColor = "red";
            restartRecognition();
        };

        recognition.onspeechend = (event) => {
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

}

let instance = new CordovaApp();
