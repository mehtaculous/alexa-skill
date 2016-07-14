'use strict';

var AlexaSkill = require('./AlexaSkill');

var https = require('https');

var APP_ID = 'amzn1.echo-sdk-ams.app.c565f60c-9587-49f8-9131-abed9b952cc3';

var Fantasy = {
    "russell wilson": {
        "2015": { 
            "week 1": {
                "completions": 32,
                "passing attempts": 41,
                "passing yards": 251,
                "yards per attempt": 6.1,
                "passing touchdowns": 1,
                "interceptions": 1,
                "rushing attempts": 8,
                "rushing yards": 31,
                "rushing touchdowns": 0,
                "standard fantasy points": 16.14   
            },
            "week 2": {
                "completions": 19,
                "passing attempts": 30,
                "passing yards": 206,
                "yards per attempt": 6.9,
                "passing touchdowns": 2,
                "interceptions": 1,
                "rushing attempts": 10,
                "rushing yards": 78,
                "rushing touchdowns": 0,
                "standard fantasy points": 23.04   
            },
            "completions": 329,
            "passing attempts": 483,
            "passing yards": 4024,
            "yards per attempt": 8.3,
            "passing touchdowns": 34,
            "interceptions": 8,
            "rushing attempts": 103,
            "rushing yards": 553,
            "rushing touchdowns": 1,
            "standard fantasy points": 344.265
        }
    }
}

var FantasyMetrix = function () {
    AlexaSkill.call(this, APP_ID);
};

FantasyMetrix.prototype = Object.create(AlexaSkill.prototype);
FantasyMetrix.prototype.constructor = FantasyMetrix;

FantasyMetrix.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = "<speak><audio src='https://s3-eu-west-1.amazonaws.com/57647285525fb836561944563.samehta91/samehta91gmail.comSiliconValley.mp3'/> Hello and welcome to FantasyMetrix. How can I be of assistance for you today?</speak>";
    var repromptText = "For instructions on what you can ask, please say help me.";
    response.ask(speechOutput, repromptText);
};

FantasyMetrix.prototype.intentHandlers = {
    "GetMetricIntent": function (intent, session, response) {
        var sessionAttributes = {};

        var playerSlot = intent.slots.Player,
            playerName;
        if (playerSlot && playerSlot.value){
            playerName = playerSlot.value.toLowerCase();
        } else {
            getPlayerName(callback);
        }

        var metricSlot = intent.slots.Metric,
            metricName;
        if (metricSlot && metricSlot.value){
            metricName = metricSlot.value.toLowerCase();
        } else {
            getMetricName(callback);
        }

        var weekSlot = intent.slots.Week,
            weekNumber;
        if (weekSlot && weekSlot.value){
            weekNumber = weekSlot.value.toLowerCase();
        } else {
            var speechOutput; 
        }

        var seasonSlot = intent.slots.Season,
            seasonNumber;
        if (seasonSlot && seasonSlot.value){
            seasonNumber = seasonSlot.value.toLowerCase();
        } else {
            getSeasonNumber(callback);
        }

        var player;
        if (playerName.slice(-2) === "\'s") {
            player = playerName.slice(0, -2);
        } else {
            player = playerName;
        }

        var metric = metricName,
            week = weekNumber,
            season = seasonNumber;

        console.log(player);
        console.log(metric);
        console.log(week);
        console.log(season);

        var speechOutput,
            repromptOutput,
            cardTitle,
            cardContent;

        if (Fantasy[player] && Fantasy[player][season] && Fantasy[player][season][week] && Fantasy[player][season][week][metric]) {
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][week][metric]) + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = JSON.stringify(Fantasy[player][season][week][metric]) + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (Fantasy[player] && Fantasy[player][season] && Fantasy[player][season][metric]) {
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][metric]) + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = JSON.stringify(Fantasy[player][season][metric]) + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else {
            var speech = "I'm sorry, I currently do not know what you are asking for. What else can I help you with?";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            repromptOutput = {
                speech: "Is there anything else I can help you with today?",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.ask(speechOutput, repromptOutput);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as <break time = \"0.5s\"/> Get me Russell Wilson's passing touchdowns for week one of two thousand and fifteen? <break time = \"0.5s\"/> Now, what can I help you with?";
        var repromptText = "You can say things like <break time = \"0.5s\"/> How many receiving yards did Julio Jones have during week two of two thousand and fifteen? <break time = \"0.5s\"/> Now, how can I help you?";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: repromptText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        response.ask(speechOutput, repromptOutput);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        var speechOutput = "Thank you for using FantasyMetrix. Goodbye";
        response.tell(speechOutput);
    }
};

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};