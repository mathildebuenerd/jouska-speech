declare const SpeechRecognition: any;

export class SpeechRec {

    constructor() {
        let recognition = new SpeechRecognition();
        recognition.lang = "fr-FR";
        recognition.continuous = true;
        // recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        let recognizing = false;
        let mybutton = document.querySelector('#startSpeechRecognition');

        mybutton.addEventListener('click', restartRecognition);

        recognition.onstart = function(event) {
            console.log(event.type);
            // blockSentences.style.backgroundColor = "blue";
            recognizing = true;
        };

        recognition.onresult = function(event) {
            console.log(event.type);
            let sentence = '';

            // we go into the results in order to have the whole sentence
            for (let i=0; i<event.results.length; i++) {
                sentence+=event.results[i][0].transcript + ' ';
            }

            document.body.textContent = sentence;
            console.log(sentence);
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

