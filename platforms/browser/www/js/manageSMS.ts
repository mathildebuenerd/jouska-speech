import * as translate from "./../../hooks/translate";
import * as LanguageDetect from "./../../hooks/languagedetect";
import {TextAnalysis} from "./sentimentAnalysis";

declare const SMS: any;
declare const navigator: any;

export class SMSManager {

    public static convertUnixDate(unixTimeStamp: number): object {
        let date = new Date(unixTimeStamp);
        return {
            "weekday": date.getDay(),
            'day': date.getDate(),
            'month': date.getMonth(),
            'year': date.getFullYear(),
            'hour': date.getHours(),
            'minutes': date.getMinutes(),
            'seconds': date.getSeconds()
        };
    }

    public static normalizeAddress(address: string): string {
        let normalizedAddress = address.replace(' ', ''); // le numéro est peut-être mal formaté (06 xx xx xx xx au lieu de 06xxxxxxxx), donc on enlève les espaces
        let plusSign = new RegExp(/\+/);
        let doubleZero = new RegExp(/^0{2}/);
        if (plusSign.exec(address) !== null) { // si l'adresse contient un identifiant national comme +33 ou +41, on l'enlève pour avoir un numéro de la forme 06xxxxxx, ça permet d'éviter les doublons
            const identifiant = new RegExp(/\+[0-9]{2}/); // un identifiant est un + (/+) suivit de deux nombres ([0-9]{2})
            normalizedAddress = normalizedAddress.replace(identifiant, '0'); // on remplace l'identifiant par un zéro
        } else if (doubleZero.exec(address) !== null) {
            const identifiant = new RegExp(/^0{2}[0-9]{2}/); // un identifiant est un 00 suivi de deux nombres, par exemple 0033 ou 0041
            normalizedAddress = normalizedAddress.replace(identifiant, '0');
        }
        // console.group("Normalized adress");
        // console.log('address: ' + address);
        // console.log('normalized address: ' + normalizedAddress);
        // console.groupEnd();
        return normalizedAddress;
    }

    public detectLanguage(sms: string): object {
        let i = 0;
        const languageDetector = new LanguageDetect();
        let lang = languageDetector.detect(sms)[i][0];// correspond à la première langue détectée
        // const confidence = languageDetector.detect(sms)[i][1]; // correspond à la confidence de la langue
        // console.log([lang, confidence]);

        console.log(`lang ${lang}`);

        if (lang !== undefined) { // la langue peut être inconnue
            while (lang === ('latvian' || 'pidgin' || 'latin' || 'estonian' || 'turkish')) {
                console.group('Detect language');
                console.log(`while lang: ${lang}`);
                console.log(`while i: ${i}`);
                i++;
                lang = languageDetector.detect(sms)[i][0];
                console.log(`while lang after: ${lang}`);
                console.log(`while i after: ${i}`);
                console.groupEnd();
            }
            // return [lang, confidence];
            return [languageDetector.detect(sms)[i][0], languageDetector.detect(sms)[i][1]];

        } else {
            return [];
        }
    }

    public findContactsName(smsData: any): Promise<object> {

        // console.log(contacts);

        return new Promise(
            (resolve, reject) => {

                navigator.contactsPhoneNumbers.list((phoneContacts) => { // on récupère la liste des contacts du téléphone
                    for (const phonenumber in smsData) { // pour chaque numéro qui se trouve dans smsData, on cherche le nom du contact correspondant

                        // d'abord on normalise le numéro à chercher,
                        // on enlève le premier zéro du numéro, c'est-à-dire qu'on transforme 06xxxxx and 6xxxxx
                        // ça permet de retrouver le numéro s'il est inscrit dans le téléphone comme 00336xxxxx ou +336xxxxx
                        const numberToFind = phonenumber.replace(/^0/, '');

                        for (const singleContact in phoneContacts) {
                            let contactNumbers = phoneContacts[singleContact].phoneNumbers;
                            for (const numbers in contactNumbers) { // chaque contact peut avoir plusieurs numéros, il faut tous les rester pour ne pas louper
                                const espace = new RegExp(' ', 'g');
                                const singleNumber = (contactNumbers[numbers].normalizedNumber).replace(espace, ''); // on enlève les espaces car certains numéros normalisés en contiennent
                                if (singleNumber.match(numberToFind) !== null) { // si le numéro à trouver est égal à un des numéros, on récupère le nom et on break la loop
                                    smsData[phonenumber].name = {}; // on initialise
                                    smsData[phonenumber].name = phoneContacts[singleContact].displayName;
                                    break; // break permet de sortir de la boucle for
                                }
                            }
                        }
                    }
                    resolve(smsData);
                }, (error) => {
                    console.error(error);
                    reject(error);
                });









                // resolve(contactName);

            });

    }

    public getAllSMS(filters: any): Promise<object> { // on met le type any pour les filters pour permettre d'accéder à filters.box
        return new Promise(//return a promise
            (resolve,reject)=>{
                if (SMS) {
                    SMS.listSMS(filters, function (data) {
                        resolve(data);//added this, resolve promise
                    }, function (err) {
                        console.log('error list sms: ' + err);
                        reject(err);//added this reject promise
                    });
                }else{
                    resolve([]);//added this, resolving to empty array?
                }
            }
        ).then(
            data=>{
                // On remplir ici l'objet contacts avec les SMS
                let contacts = {};
                for (const key in data) {
                    let type = filters.box;
                    let address = SMSManager.normalizeAddress(data[key].address); // on normalise le numéro pour enlever les espaces, les +33, +41 et les 0033...
                    const myid = data[key]._id; // chaque SMS possède un identifiant unique
                    // let type = filters.box;
                    // on checke si le numéro de téléphone est standard pour éviter pubs et numéros spéciaux : constitué de chiffres et de + seulement et au moins 7 chiffres
                    if (address.length > 7 && address.match("[0-9]+")) {
                        console.log(`date:`);
                        console.log(data[key].date);
                        const date = SMSManager.convertUnixDate(data[key].date); // on converti le format de date de listSMS
                        // let language = SMSManager.detectLanguage(data[key].body);

                        if (address in contacts) { // si le numéro est vu dans la liste, on ajoute les sms dans ce numéro
                            contacts[address][type][myid] = {
                                "text": {
                                    "original": data[key].body
                                },
                                "date": date,
                                "type": type
                            };
                        } else { // si le numéro n'est pas dans la liste, on le crée
                            contacts[address] = {}; // on doit initialiser la nouvelle adresse
                            contacts[address][type] = {}; // idem
                            contacts[address][type][myid] = {
                                "text": {
                                    "original": data[key].body
                                },
                                "date": date,
                                "type": type
                            };
                        }
                    } // if address est correct
                    // }
                } // for key in data
                return contacts;
            }
        );
    }

    // public translateSMS(allSMS: any) {
    //     return new Promise(
    //         (resolve, reject) => {
    //             let counter = 0;
    //             for (const key in allSMS) {
    //                 if (allSMS.hasOwnProperty(key)) {
    //                     if (counter <20) {
    //                         for (let subkey in allSMS[key]) {
    //                             // const englishSentence = translate(allSMS[key][subkey].body).then( text => {
    //                             //     allSMS[key][subkey].body.en = text;
    //                             //     console.log(text);
    //                             // });
    //                             const englishSentence = translate(allSMS[key][subkey].body.fr);
    //                             allSMS[key][subkey].body.en = englishSentence;
    //                             console.log(englishSentence);
    //                             counter++;
    //                         }
    //                     }
    //                 } // hasownproperty
    //             }
    //             console.log('translate: je vais résoudre la promesse');
    //             resolve(allSMS);
    //             //         console.log('translate: je vais rejeter la promesse');
    //             // reject();
    //         });
    // }

    // trouve le nom d'un contact à partir de son numéro de téléphone
    public getContactName(phonenumber: string): string {
        const smsData = JSON.parse(localStorage.getItem("smsData"));
        return smsData[phonenumber].name;
    }



}

