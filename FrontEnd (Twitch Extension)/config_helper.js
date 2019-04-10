let token;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
    twitch.rig.log(context);
});

twitch.onAuthorized((auth) => {
    token = auth.token;
    $('#configButton').removeAttr('disabled');
});

$(function() {
    $("#configButton").click(function(){
        var win = window.open("https://www.kbbextensions.com/translateExtension?value=thisValueHereIsToHideTheParametersFromTheViewersThatBroadcastersMayExcidentalyShowTheirViewers111111111111111111111111111111111111111111&TwitchAuthToken="+token, '_blank');
        win.focus();
    });
});
