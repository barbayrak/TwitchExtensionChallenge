
//Languge to show user
var targetLanguageCode = "en";

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
    },
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
    {
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
    },
    {
        "name" : "Swedish",
        "language_code" : "sv"
    },
    {
        "name" : "Turkish",
        "language_code" : "tr"
    },
]

// because who wants to type this every time?
var twitch = window.Twitch.ext;


function updateSubtitle(subtitles) {
    let translatableLanguages = subtitles.filter(lan => lan.language_code !== targetLanguageCode);

    $('#subtitles').prepend("<li class=\"list-group-item\">"+translatableLanguages[0].subtitle.toString()+"</li>");
}

function changeLanguage(lang) {
    targetLanguageCode = lang;
}

$(function() {

    $(".dropdown-item").click(function(){
        // action goes here!!
        changeLanguage($(this).attr('lan'));
    });

    $(".dropdown-item").each(function() {
        var lan = $( this ).attr('lan');
        switch(lan) {
            case "off":
                $(this).text("-- Turn Off");
                break;
            case "en":
                $(this).text("English");
                break;
            case "ar":
                $(this).text("العَرَبِيَّة");
                break;
            case "zh":
                $(this).text("汉字简化方案");
                break;
            case "cs":
                $(this).text("Čeština");
                break;
            case "da":
                $(this).text("Dansk");
                break;
            case "nl":
                $(this).text("Nederlands");
                break;
            case "fi":
                $(this).text("Suomi");
                break;
            case "fr":
                $(this).text("Français");
                break;
            case "de":
                $(this).text("Deutsch");
                break;
            case "he":
                $(this).text("עִבְרִית");
                break;
            case "id":
                $(this).text("Indonesia");
                break;
            case "it":
                $(this).text("Italiano");
                break;
            case "ja":
                $(this).text("日本語");
                break;
            case "ko":
                $(this).text("한국어");
                break;
            case "pl":
                $(this).text("Polski");
                break;
            case "pt":
                $(this).text("Português");
                break;
            case "ru":
                $(this).text("Русский язык");
                break;
            case "es":
                $(this).text("Español");
                break;
            case "sv":
                $(this).text("Svenska");
                break;
            case "tr":
                $(this).text("Türkçe");
                break;
            default:
            // code block
        }
    });

    // listen for incoming broadcast message from our EBS
    twitch.listen('broadcast', function (target, contentType, subtitles) {

        var subtitlesJson = JSON.parse(subtitles);
        if(targetLanguageCode !== "off"){
            updateSubtitle(subtitlesJson);
        }

    });
});
