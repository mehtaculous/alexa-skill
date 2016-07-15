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
            "games played": 16,
            "completions": 329,
            "passing attempts": 483,
            "passing yards": 4024,
            "yards per attempt": 8.3,
            "passing touchdowns": 34,
            "interceptions": 8,
            "rushing attempts": 103,
            "rushing yards": 553,
            "rushing touchdowns": 1,
            "standard fantasy points": 344.26
        }
    }
}

var calculations = ["passing attempts per game", "passing yards per game", "receiving yards per game", "receptions per game", "targets per game", "rushing attempts per game", "rushing yards per game", "standard fantasy points per game", "half ppr fantasy points per game", "full ppr fantasy points per game", "completion percentage", "passing yards per attempt", "receiving yards per reception", "receiving yards per target", "rushing yards per attempt"];

var FantasyMetrix = function () {
    AlexaSkill.call(this, APP_ID);
};

FantasyMetrix.prototype = Object.create(AlexaSkill.prototype);
FantasyMetrix.prototype.constructor = FantasyMetrix;

FantasyMetrix.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = {
        speech: "<speak><audio src='https://s3-eu-west-1.amazonaws.com/57647285525fb836561944563.samehta91/samehta91gmail.comSiliconValley.mp3'/> <break time = \"0.618s\"/> Hello and welcome to FantasyMetrix. How can I be of assistance for you today?</speak>",
        type: AlexaSkill.speechOutputType.SSML
    };
    var repromptText = "For instructions on what you can ask, please say help me.";

    response.ask(speechOutput, repromptText);
};

FantasyMetrix.prototype.intentHandlers = {
    "OneShotMetricIntent": function (intent, session, response) {

        var playerSlot = intent.slots.Player,
            playerName;
        if (playerSlot && playerSlot.value){
            playerName = playerSlot.value.toLowerCase();
            session.attributes.playerName = playerName;
        }

        var metricSlot = intent.slots.Metric,
            metricName;
        if (metricSlot && metricSlot.value){
            metricName = metricSlot.value.toLowerCase();
            session.attributes.metricName = metricName;
        }

        var seasonSlot = intent.slots.Season,
            seasonNumber;
        if (seasonSlot && seasonSlot.value){
            seasonNumber = seasonSlot.value.toLowerCase();
            session.attributes.seasonNumber = seasonNumber;
        }

        var weekSlot = intent.slots.Week,
            weekNumber;
        if (weekSlot && weekSlot.value){
            weekNumber = weekSlot.value.toLowerCase();
            session.attributes.weekNumber = weekNumber;
        }

        console.log("OneShotMetricIntent: " + playerName);
        console.log("OneShotMetricIntent: " + metricName);
        console.log("OneShotMetricIntent: " + seasonNumber);
        console.log("OneShotMetricIntent: " + weekNumber);

        if (playerName === undefined) {
            handleMissingPlayerRequest(intent, session, response);
        } else if (metricName === undefined) {
            handleMissingMetricRequest(intent, session, response);
        } else if (seasonNumber === undefined) {
            handleMissingSeasonRequest(intent, session, response);
        } else {
            getMetricRequest(intent, session, response);
        }
    },

    "MissingSlotIntent": function (intent, session, response) {
        var playerSlot = intent.slots.Player,
            metricSlot = intent.slots.Metric,
            seasonSlot = intent.slots.Season,
            playerName,
            metricName,
            seasonNumber;

        if (playerSlot && playerSlot.value) {
            playerName = playerSlot.value.toLowerCase();
            session.attributes.playerName = playerName;
        } else if (session.attributes.playerName === undefined) {
            handleMissingPlayerRequest(intent, session, response);
        }

        if (metricSlot && metricSlot.value) {
            metricName = metricSlot.value.toLowerCase();
            session.attributes.metricName = metricName;
        } else if (session.attributes.metricName === undefined) {
            handleMissingMetricRequest(intent, session, response);
        }

        if (seasonSlot && seasonSlot.value) {
            seasonNumber = seasonSlot.value.toLowerCase();
            session.attributes.seasonNumber = seasonNumber;
        } else if (session.attributes.seasonNumber === undefined) {
            handleMissingSeasonRequest(intent, session, response);
        }

        console.log("MissingPlayerIntent: " + playerSlot.value);
        console.log("MissingMetricIntent: " + metricSlot.value);
        console.log("MissingSeasonIntent: " + seasonSlot.value);

        getMetricRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        var speechText = "You can ask questions such as <break time = \"0.618s\"/> Get me Russell Wilson's passing touchdowns for week one of two thousand and fifteen? <break time = \"0.618s\"/> Now, what can I help you with?";
        var repromptText = "You can say things like <break time = \"0.618s\"/> How many receiving yards did Julio Jones have during week two of two thousand and fifteen? <break time = \"0.618s\"/> Now, how can I help you?";
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

function handleMissingPlayerRequest(intent, session, response) {
    var speechOutput = "Please provide the name of a current player who has played at least one season in the National Football League.",
        repromptText = "You can say something like, Russell Wilson";
    response.ask(speechOutput, repromptText);
};

function handleMissingMetricRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName;
    } else {
        player = playerName.concat("\'s");
    }

    var speechOutput = "Please provide a valid metric which correlates to " + player + " position.",
        repromptText = "You can say something like, Passing Yards."
    response.ask(speechOutput, repromptText);
};

function handleMissingSeasonRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName.slice(0, -2);
    } else {
        player = playerName;
    }

    var speechOutput = "Please provide the year of a valid NFL season, ranging from two thousand and ten through two thousand and fifteen, in which " + player + " has played at least one game.",
        repromptText = "You can say something like, Two Thousand and Fifteen."
    response.ask(speechOutput, repromptText);
};

function getMetricRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName.slice(0, -2);
    } else {
        player = playerName;
    }

    var metric = session.attributes.metricName,
        season = session.attributes.seasonNumber,
        week = session.attributes.weekNumber,
        speechOutput,
        repromptOutput,
        cardTitle,
        cardContent;

    console.log("getMetricRequest: " + player);
    console.log("getMetricRequest: " + metric);
    console.log("getMetricRequest: " + season);
    console.log("getMetricRequest: " + week);

    if (player && metric && season && (calculations.indexOf(metric) > -1)) {
        calculateMetricRequest(intent, session, response);
    } else if (Fantasy[player] && Fantasy[player][season] && Fantasy[player][season][week] && Fantasy[player][season][week][metric]) {
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
        var speech = "I'm sorry, I currently do not know what you are asking for. Please make sure that you are providing the name of a current player who has played at least one season in the National Football League, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and ten through two thousand and sixteen. Providing a regular season week number, ranging from week one through week seventeen, is merely optional.";
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
};

function calculateMetricRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName.slice(0, -2);
    } else {
        player = playerName;
    }

    var metric = session.attributes.metricName,
        season = session.attributes.seasonNumber,
        week = session.attributes.weekNumber,
        speechOutput,
        repromptOutput,
        cardTitle,
        cardContent;

    console.log("calculateMetricRequest: " + player);
    console.log("calculateMetricRequest: " + metric);
    console.log("calculateMetricRequest: " + season);
    console.log("calculateMetricRequest: " + week);

    var passingAttemptsPerGame,
        passingYardsPerGame,
        receivingYardsPerGame,
        receptionsPerGame,
        targetsPerGame,
        rushingAttemptsPerGame,
        rushingYardsPerGame,
        standardFantasyPointsPerGame,
        halfPprFantasyPointsPerGame,
        fullPprFantasyPointsPerGame,
        completionPercentage,
        passingYardsPerAttempt,
        receivingYardsPerReception,
        receivingYardsPerTarget,
        rushingYardsPerAttempt;

    if (player && metric && season) {
        if (metric === "passing attempts per game" && week === undefined) {
            passingAttemptsPerGame = (Fantasy[player][season]["passing attempts"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(passingAttemptsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + passingAttemptsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = passingAttemptsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "passing yards per game" && week === undefined) {
            passingYardsPerGame = (Fantasy[player][season]["passing yards"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(passingYardsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + passingYardsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = passingYardsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receiving yards per game" && week === undefined) {
            receivingYardsPerGame = (Fantasy[player][season]["receiving yards"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(receivingYardsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + receivingYardsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = receivingYardsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receptions per game" && week === undefined) {
            receptionsPerGame = (Fantasy[player][season]["receptions"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(receptionsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + receptionsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = receptionsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "targets per game" && week === undefined) {
            targetsPerGame = (Fantasy[player][season]["targets"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(targetsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + targetsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = targetsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "rushing attempts per game" && week === undefined) {
            rushingAttemptsPerGame = (Fantasy[player][season]["rushing attempts"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(rushingAttemptsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + rushingAttemptsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = rushingAttemptsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "rushing yards per game" && week === undefined) {
            rushingYardsPerGame = (Fantasy[player][season]["rushing yards"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(rushingYardsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + rushingYardsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = rushingYardsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "standard fantasy points per game" && week === undefined) {
            standardFantasyPointsPerGame = (Fantasy[player][season]["standard fantasy points"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(standardFantasyPointsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + standardFantasyPointsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = standardFantasyPointsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "half ppr fantasy points per game" && week === undefined) {
            halfPprFantasyPointsPerGame = (Fantasy[player][season]["half ppr fantasy points"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(halfPprFantasyPointsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + halfPprFantasyPointsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = halfPprFantasyPointsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "full ppr fantasy points per game" && week === undefined) {
            fullPprFantasyPointsPerGame = (Fantasy[player][season]["full ppr fantasy points"] / Fantasy[player][season]["games played"]).toFixed(1);
            console.log(fullPprFantasyPointsPerGame);
            speechOutput = "During the " + season + " season, " + player + " had " + fullPprFantasyPointsPerGame + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = fullPprFantasyPointsPerGame + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "completion percentage" && week === undefined) {
            completionPercentage = ((Fantasy[player][season]["completions"] / Fantasy[player][season]["passing attempts"]) * 100).toFixed(1);
            console.log(completionPercentage);
            speechOutput = "During the " + season + " season, " + player + " had a " + completionPercentage + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = completionPercentage + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "completion percentage") {
            completionPercentage = ((Fantasy[player][season][week]["completions"] / Fantasy[player][season][week]["passing attempts"]) * 100).toFixed(1);
            console.log(completionPercentage);
            speechOutput = "During " + week + " of the " + season + " season, " + player + " had a " + completionPercentage + " " + metric;
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = completionPercentage + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "passing yards per attempt" && week === undefined) {
            passingYardsPerAttempt = (Fantasy[player][season]["passing yards"] / Fantasy[player][season]["passing attempts"]).toFixed(2);
            console.log(passingYardsPerAttempt);
            speechOutput = "During the " + season + " season, " + player + " had " + passingYardsPerAttempt + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = passingYardsPerAttempt + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "passing yards per attempt") {
            passingYardsPerAttempt = (Fantasy[player][season][week]["passing yards"] / Fantasy[player][season][week]["passing attempts"]).toFixed(2);
            console.log(passingYardsPerAttempt);
            speechOutput = "During " + week + " of the " + season + " season, " + player + " had " + passingYardsPerAttempt + " " + metric;
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = passingYardsPerAttempt + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receiving yards per reception" && week === undefined) {
            receivingYardsPerReception = (Fantasy[player][season]["receiving yards"] / Fantasy[player][season]["receptions"]).toFixed(1);
            console.log(receivingYardsPerReception);
            speechOutput = "During the " + season + " season, " + player + " had " + receivingYardsPerReception + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = receivingYardsPerReception + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receiving yards per reception") {
            receivingYardsPerReception = (Fantasy[player][season][week]["receiving yards"] / Fantasy[player][season][week]["receptions"]).toFixed(1);
            console.log(receivingYardsPerReception);
            speechOutput = "During " + week + " of the " + season + " season, " + player + " had " + receivingYardsPerReception + " " + metric
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = receivingYardsPerReception + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receiving yards per target" && week === undefined) {
            receivingYardsPerTarget = (Fantasy[player][season]["receiving yards"] / Fantasy[player][season]["targets"]).toFixed(1);
            console.log(receivingYardsPerTarget);
            speechOutput = "During the " + season + " season, " + player + " had " + receivingYardsPerTarget + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = receivingYardsPerTarget + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "receiving yards per target") {
            receivingYardsPerTarget = (Fantasy[player][season][week]["receiving yards"] / Fantasy[player][season][week]["targets"]).toFixed(1);
            console.log(receivingYardsPerTarget);
            speechOutput = "During " + week + " of the " + season + " season, " + player + " had " + receivingYardsPerTarget + " " + metric
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = receivingYardsPerTarget + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "rushing yards per attempt" && week === undefined) {
            rushingYardsPerAttempt = (Fantasy[player][season]["rushing yards"] / Fantasy[player][season]["rushing attempts"]).toFixed(2);
            console.log(rushingYardsPerAttempt);
            speechOutput = "During the " + season + " season, " + player + " had " + rushingYardsPerAttempt + " " + metric;
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = rushingYardsPerAttempt + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (metric === "rushing yards per attempt") {
            rushingYardsPerAttempt = (Fantasy[player][season][week]["rushing yards"] / Fantasy[player][season][week]["rushing attempts"]).toFixed(2);
            console.log(rushingYardsPerAttempt);
            speechOutput = "During " + week + " of the " + season + " season, " + player + " had " + rushingYardsPerAttempt + " " + metric;
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = rushingYardsPerAttempt + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    } else {
        var speech = "I'm sorry, I currently do not know what you are asking for. Please make sure that you are providing the name of a current player who has played at least one season in the National Football League, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and ten through two thousand and sixteen. Providing a regular season week number, ranging from week one through week seventeen, is merely optional.";
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
};

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};