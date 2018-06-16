"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LanguageDetect = require("./../../hooks/languagedetect");
var SMSManager = (function () {
    function SMSManager() {
    }
    SMSManager.convertUnixDate = function (unixTimeStamp) {
        var date = new Date(unixTimeStamp);
        return {
            "weekday": date.getDay(),
            'day': date.getDate(),
            'month': date.getMonth(),
            'year': date.getFullYear(),
            'hour': date.getHours(),
            'minutes': date.getMinutes(),
            'seconds': date.getSeconds()
        };
    };
    SMSManager.normalizeAddress = function (address) {
        var normalizedAddress = address.replace(' ', '');
        var plusSign = new RegExp(/\+/);
        var doubleZero = new RegExp(/^0{2}/);
        if (plusSign.exec(address) !== null) {
            var identifiant = new RegExp(/\+[0-9]{2}/);
            normalizedAddress = normalizedAddress.replace(identifiant, '0');
        }
        else if (doubleZero.exec(address) !== null) {
            var identifiant = new RegExp(/^0{2}[0-9]{2}/);
            normalizedAddress = normalizedAddress.replace(identifiant, '0');
        }
        return normalizedAddress;
    };
    SMSManager.prototype.detectLanguage = function (sms) {
        var i = 0;
        var languageDetector = new LanguageDetect();
        var lang = languageDetector.detect(sms)[i][0];
        console.log("lang " + lang);
        if (lang !== undefined) {
            while (lang === ('latvian' || 'pidgin' || 'latin' || 'estonian' || 'turkish')) {
                console.group('Detect language');
                console.log("while lang: " + lang);
                console.log("while i: " + i);
                i++;
                lang = languageDetector.detect(sms)[i][0];
                console.log("while lang after: " + lang);
                console.log("while i after: " + i);
                console.groupEnd();
            }
            return [languageDetector.detect(sms)[i][0], languageDetector.detect(sms)[i][1]];
        }
        else {
            return [];
        }
    };
    SMSManager.prototype.findContactsName = function (smsData) {
        return new Promise(function (resolve, reject) {
            navigator.contactsPhoneNumbers.list(function (phoneContacts) {
                for (var phonenumber in smsData) {
                    var numberToFind = phonenumber.replace(/^0/, '');
                    for (var singleContact in phoneContacts) {
                        var contactNumbers = phoneContacts[singleContact].phoneNumbers;
                        for (var numbers in contactNumbers) {
                            var espace = new RegExp(' ', 'g');
                            var singleNumber = (contactNumbers[numbers].normalizedNumber).replace(espace, '');
                            if (singleNumber.match(numberToFind) !== null) {
                                smsData[phonenumber].name = {};
                                smsData[phonenumber].name = phoneContacts[singleContact].displayName;
                                break;
                            }
                        }
                    }
                }
                resolve(smsData);
            }, function (error) {
                console.error(error);
                reject(error);
            });
        });
    };
    SMSManager.prototype.getAllSMS = function (filters) {
        return new Promise(function (resolve, reject) {
            if (SMS) {
                SMS.listSMS(filters, function (data) {
                    resolve(data);
                }, function (err) {
                    console.log('error list sms: ' + err);
                    reject(err);
                });
            }
            else {
                resolve([]);
            }
        }).then(function (data) {
            var contacts = {};
            for (var key in data) {
                var type = filters.box;
                var address = SMSManager.normalizeAddress(data[key].address);
                var myid = data[key]._id;
                if (address.length > 7 && address.match("[0-9]+")) {
                    console.log("date:");
                    console.log(data[key].date);
                    var date = SMSManager.convertUnixDate(data[key].date);
                    if (address in contacts) {
                        contacts[address][type][myid] = {
                            "text": {
                                "original": data[key].body
                            },
                            "date": date,
                            "type": type
                        };
                    }
                    else {
                        contacts[address] = {};
                        contacts[address][type] = {};
                        contacts[address][type][myid] = {
                            "text": {
                                "original": data[key].body
                            },
                            "date": date,
                            "type": type
                        };
                    }
                }
            }
            return contacts;
        });
    };
    SMSManager.prototype.getContactName = function (phonenumber) {
        var smsData = JSON.parse(localStorage.getItem("smsData"));
        return smsData[phonenumber].name;
    };
    return SMSManager;
}());
exports.SMSManager = SMSManager;
//# sourceMappingURL=manageSMS.js.map