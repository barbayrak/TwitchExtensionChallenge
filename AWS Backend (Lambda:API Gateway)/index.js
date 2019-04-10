const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const request = require('request-promise');
var translate = new AWS.Translate({region: 'us-east-2'});
const languages = [
    {
        "name" : "Arabic",
        "language_code" : "ar"
    },
    {
        "name" : "Chinese (Simplified)",
        "language_code" : "zh"
    },
    {
        "name" : "Czech",
        "language_code" : "cs"
    },
    {
        "name" : "Danish",
        "language_code" : "da"
    },
    {
        "name" : "Dutch",
        "language_code" : "nl"
    },
    {
        "name" : "English",
        "language_code" : "en"
    }
    {
        "name" : "Finnish",
        "language_code" : "fi"
    },
    {
        "name" : "French",
        "language_code" : "fr"
    },
    {
        "name" : "German",
        "language_code" : "de"
    },
    {
        "name" : "Hebrew",
        "language_code" : "he"
    },
    {
        "name" : "Indonesian",
        "language_code" : "id"
    },
    {
        "name" : "Italian",
        "language_code" : "it"
    },
    {
        "name" : "Japanese",
        "language_code" : "ja"
    },
    {
        "name" : "Korean",
        "language_code" : "ko"
    },
 .  {
        "name" : "Polish",
        "language_code" : "pl"
    },
    {
        "name" : "Portuguese",
        "language_code" : "pt"
    },
    {
        "name" : "Russian",
        "language_code" : "ru"
    },
    {
        "name" : "Spanish",
        "language_code" : "es"
    }
    {
        "name" : "Swedish",
        "language_code" : "sv"
    },
    {
        "name" : "Turkish",
        "language_code" : "tr"
    },
]


const verifyAndDecode = auth => {
    const bearerPrefix = 'Bearer ';
    if (!auth.startsWith(bearerPrefix)) return { err: 'Invalid authorization header' };
    try {
        const token = auth.substring(bearerPrefix.length);
        const secret = process.env.secret;
        return jwt.verify(token, Buffer.from(secret, 'base64'), { algorithms: ['HS256'] });
    } catch (err) {
        return { err: 'Invalid JWT' };
    }
};


const broadcastSubtitle = (translations,channelId) => {

    //console.log("Broadcast başlanıyor")

    // Set the HTTP headers required by the Twitch API.
    const bearerPrefix = 'Bearer ';
    const headers = {
        'Client-ID': process.env.clientId,
        'Content-Type': 'application/json',
        'Authorization': bearerPrefix + makeServerToken(channelId),
    };

    // Create the POST body for the Twitch API request.
    const body = JSON.stringify({
        content_type: 'application/json',
        message: JSON.stringify(translations),
        targets: ['broadcast'],
    });

    // Send the broadcast request to the Twitch API.
    const options = {
        url: `https://api.twitch.tv/extensions/message/${channelId}`,
        method: 'POST',
        headers,
        body
    };

    //console.log("Broadcast ediliyor")

    return new Promise((resolve, reject) => {
        request(options)
            .then(response => {
                //console.log("Broadcast bitti");
                resolve('ok');
            })
            .catch(err => {
                //console.log("Broadcast başarısız");
                reject(err);
            });
    });
}


// Create and return a JWT for use by this service.
const makeServerToken = channelID => {
    const serverTokenDurationSec = 30;

    const payload = {
        exp: Math.floor(Date.now() / 1000) + serverTokenDurationSec,
        channel_id: channelID,
        user_id: process.env.ownerId,
        role: 'external',
        pubsub_perms: {
            send: ['*'],
        },
    };

    const secret = Buffer.from(process.env.secret, 'base64');
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
};

async function getTranslation(text,sourceLang,targetLang) {
    return new Promise(function(resolve, reject){
        var params = {
            Text: text,
            SourceLanguageCode: sourceLang,
            TargetLanguageCode:  targetLang
        };
        
        return translate.translateText(params, function onIncomingMessageTranslate(err, data) {
            if (err) {
                console.log("Error calling Translate. " + err.message + err.stack);
                reject(null);
            }

            if (data) {
                var transLatedTextJson = {
                    "language" : targetLang,
                    "subtitle" : data.TranslatedText
                };
                resolve(transLatedTextJson);
            }else{
                var transLatedTextJson = {
                    "language" : targetLang,
                    "subtitle" : ""
                };
                resolve(transLatedTextJson);
            }
        });
        
        /*
        var transLatedTextJson = {
            "language" : targetLang,
            "subtitle" : data.TranslatedText
        };
        return transLatedTextJson;
        */
    });
}

exports.handler = async (event, context) => {

    // Verify all requests.
    const payload = verifyAndDecode(event.headers.twauthorization);


    //Return error if verification failed.
    if (payload.err){
        const errFinish = new Error(payload.err);
        throw errFinish;
    }

    var channelID = payload.channel_id;

    var translatePromises = [];
    let translatableLanguages = languages.filter(lan => lan.language_code !== event.body.language_code);

    for (var i = translatableLanguages.length; i--; ) {
        translatePromises.push(getTranslation(event.body.text,event.body.language_code,translatableLanguages[i].language_code));
    }

    return Promise.all(translatePromises)
        .then((values) => {
            values.push(
                {
                    "language" : event.body.language_code,
                    "subtitle" : event.body.text
                }
            )
            return values
        }).then((values2) => {
            return Promise.all([broadcastSubtitle(values2,channelID)]).then((values2) => {
                return 'Finished';
            }).catch((err) => {
                console.log(err);
                throw err;
            });
        }).catch(err => {
            console.warn(err);
            const errFinish = new Error('Error On Translations');
            throw errFinish;
        });
};