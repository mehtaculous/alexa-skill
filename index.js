'use strict';

var AlexaSkill = require('./AlexaSkill');

var APP_ID = 'amzn1.echo-sdk-ams.app.c565f60c-9587-49f8-9131-abed9b952cc3';

var OAuth = require('oauth');

var express = require('express');

var request = require('request');

var app = express();

var GA_TRACKING_ID = 'UA-81123913-1';

function trackEvent(category, action, label, value, callbback) {
  var data = {
    v: '1',
    tid: GA_TRACKING_ID,
    cid: '555',
    t: 'event',
    ec: category,
    ea: action,
    el: label,
    ev: value,
  };

  request.post(
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function(err, response) {
      if (err) { return callbback(err); }
      if (response.statusCode !== 200) {
        return callbback(new Error('Tracking failed'));
      }
      callbback();
    }
  );
}

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
    },
    "julio jones": {
        "2015": { 
            "week 1": {
                "targets": 11,
                "receptions": 9,
                "receiving yards": 141,
                "yards per reception": 15.7,
                "receiving touchdowns": 2,
                "rushing attempts": 0,
                "rushing yards": 0,
                "rushing touchdowns": 0,
                "standard fantasy points": 26.1,
                "half ppr fantasy points": 30.6   
            },
            "week 2": {
                "targets": 15,
                "receptions": 13,
                "receiving yards": 135,
                "yards per reception": 10.4,
                "receiving touchdowns": 0,
                "rushing attempts": 0,
                "rushing yards": 0,
                "rushing touchdowns": 0,
                "standard fantasy points": 13.5,
                "half ppr fantasy points": 20    
            },
            "games played": 16,
            "targets": 204,
            "receptions": 136,
            "receiving yards": 1871,
            "yards per reception": 13.8,
            "receiving touchdowns": 8,
            "rushing attempts": 0,
            "rushing yards": 0,
            "rushing touchdowns": 0,
            "standard fantasy points": 239.1,
            "half ppr fantasy points": 307.1
        }
    }
}

var calculations = ["passing attempts per game", "passing yards per game", "receiving yards per game", "receptions per game", "targets per game", "rushing attempts per game", "rushing yards per game", "standard fantasy points", "standard fantasy points per game", "half ppr fantasy points", "half ppr fantasy points per game", "full ppr fantasy points", "full ppr fantasy points per game", "completion percentage", "passing yards per attempt", "receiving yards per reception", "receiving yards per target", "rushing yards per attempt"];

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

        console.log("oneShotPlayerIntent: " + playerName);
        console.log("oneShotMetricIntent: " + metricName);
        console.log("oneShotSeasonIntent: " + seasonNumber);
        console.log("oneShotWeekIntent: " + weekNumber);

        var strLogData = ["oneShotPlayerIntent: " + playerName, 
                          "oneShotMetricIntent: " + metricName, 
                          "oneShotSeasonIntent: " + seasonNumber,
                          "oneShotWeekIntent: " + weekNumber];

        var strQuery = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20fantasysports.teams.roster.stats%20where%20team_key%3D'314.l.687165.t.1'%20or%20team_key%3D'314.l.687165.t.2'%20or%20team_key%3D'314.l.687165.t.3'%20or%20team_key%3D'314.l.687165.t.4'%20or%20team_key%3D'314.l.687165.t.5'%20or%20team_key%3D'314.l.687165.t.6'%20or%20team_key%3D'314.l.687165.t.7'%20or%20team_key%3D'314.l.687165.t.8'%20or%20team_key%3D'314.l.687165.t.9'%20or%20team_key%3D'314.l.687165.t.10'%20or%20team_key%3D'314.l.687165.t.11'%20or%20team_key%3D'314.l.687165.t.12'%20and%20week%3D'1'&format=json&diagnostics=true&callback=";

        yahooSearch(strQuery, 50, function(results){
            console.log("oneShotIntent: " + JSON.stringify(results));
        });

        trackEvent(
            'Intent',
            'OneShotMetricIntent',
            strLogData,
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            if (playerName === undefined) {
                handleMissingPlayerRequest(intent, session, response);
            } else if (metricName === undefined) {
                handleMissingMetricRequest(intent, session, response);
            } else if (seasonNumber === undefined) {
                handleMissingSeasonRequest(intent, session, response);
            } else {
                getMetricRequest(intent, session, response);
            }
        });
    },

    "MissingSlotIntent": function (intent, session, response) {

        var playerSlot = intent.slots.Player,
            metricSlot = intent.slots.Metric,
            seasonSlot = intent.slots.Season,
            weekSlot = intent.slots.Week,
            playerName,
            metricName,
            seasonNumber,
            weekNumber;

        if (playerSlot && playerSlot.value) {
            playerName = playerSlot.value.toLowerCase();
            session.attributes.playerName = playerName;
        }

        if (metricSlot && metricSlot.value) {
            metricName = metricSlot.value.toLowerCase();
            session.attributes.metricName = metricName;
        }

        if (seasonSlot && seasonSlot.value) {
            seasonNumber = seasonSlot.value.toLowerCase();
            session.attributes.seasonNumber = seasonNumber;
        } 

        if (weekSlot && weekSlot.value) {
            weekNumber = weekSlot.value.toLowerCase();
            session.attributes.weekNumber = weekNumber;
        }

        console.log("missingPlayerIntent: " + playerName);
        console.log("missingMetricIntent: " + metricName);
        console.log("missingSeasonIntent: " + seasonNumber);
        console.log("missingWeekIntent: " + weekNumber);

        var strLogData = ["missingPlayerIntent: " + playerName,
                          "missingMetricIntent: " + metricName,
                          "missingSeasonIntent: " + seasonNumber,
                          "missingWeekIntent: " + weekNumber];

        trackEvent(
            'Intent',
            'MissingSlotIntent',
            strLogData,
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            if (session.attributes.playerName === undefined) {
                handleMissingPlayerRequest(intent, session, response);
            } else if (session.attributes.metricName === undefined) {
                handleMissingMetricRequest(intent, session, response);
            } else if (session.attributes.seasonNumber === undefined) {
                handleMissingSeasonRequest(intent, session, response);
            } else {
                getMetricRequest(intent, session, response);
            }   
        });
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        trackEvent(
            'Intent',
            'AMAZON.HelpIntent',
            'na',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
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
        });
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        trackEvent(
            'Intent',
            'AMAZON.StopIntent',
            'na',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            var speechOutput = "Thank you for using FantasyMetrix. Goodbye";
            response.tell(speechOutput);
        });
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

    var speechOutput = "Please provide the year of a valid NFL season, ranging from two thousand and thirteen through two thousand and sixteen, in which " + player + " has played at least one game.",
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

    console.log("getPlayerRequest: " + player);
    console.log("getMetricRequest: " + metric);
    console.log("getSeasonRequest: " + season);
    console.log("getWeekRequest: " + week);

    if (player && metric && season && (calculations.indexOf(metric) > -1)) {
        calculateMetricRequest(intent, session, response);
    } else if (Fantasy[player] && Fantasy[player][season] && Fantasy[player][season][week] && Fantasy[player][season][week][metric]) {
        console.log("During " + week + " of the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][week][metric]) + " " + metric);
        speechOutput = {
            speech: "During " + week + " of the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][week][metric]) + " " + metric,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
        cardContent = JSON.stringify(Fantasy[player][season][week][metric]) + " " + metric;
        response.tellWithCard(speechOutput, cardTitle, cardContent);
    } else if (Fantasy[player] && Fantasy[player][season] && Fantasy[player][season][metric]) {
        console.log("During the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][metric]) + " " + metric);
        speechOutput = {
            speech: "During the " + season + " season, " + player + " had " + JSON.stringify(Fantasy[player][season][metric]) + " " + metric,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        cardTitle = metric + " for " + player + " during the " + season + " season";
        cardContent = JSON.stringify(Fantasy[player][season][metric]) + " " + metric;
        response.tellWithCard(speechOutput, cardTitle, cardContent);
    } else {
        console.log("I'm sorry, I currently do not know what you are asking for.");
        var speech = "I'm sorry, I currently do not know what you are asking for. Please make sure that you are providing the name of a current player who has played at least one season in the National Football League, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and thirteen through two thousand and sixteen. Providing a regular season week number ranging from one through sixteen is merely optional.";
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

    console.log("calculatePlayerRequest: " + player);
    console.log("calculateMetricRequest: " + metric);
    console.log("calculateSeasonRequest: " + season);
    console.log("calculateWeekRequest: " + week);

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
        var speech = "I'm sorry, I currently do not know what you are asking for. Please make sure that you are providing the name of a current player who has played at least one season in the National Football League, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and thirteen through two thousand and sixteen. Providing a regular season week number ranging from week one through week sixteen is merely optional.";
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

function yahooSearch(query, count, callback_error_data_response){  
    var webSearchUrl = 'https://yboss.yahooapis.com/ysearch/web';  
    var consumerKey = 'dj0yJmk9bENVMTdzQ1RWVWFnJmQ9WVdrOVoyeEdkMjFXTjJFbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD03Mg--';
    var consumerSecret = '25058eadcccfd1f08ad5ae79e287dacf3d096ff9';

    var finalUrl = webSearchUrl + '?' + JSON.stringify({  
        q: query, 
        format: 'json',  
        count: count,
    });

    var OAuth2 = OAuth.OAuth2;
    var oa = new OAuth2(webSearchUrl, webSearchUrl, consumerKey, consumerSecret, "1.0", null, "HMAC-SHA1");  
    // oa.setClientOptions({ requestTokenHttpMethod: 'GET' });
    oa.getProtectedResource(finalUrl, "GET", '','', callback_error_data_response); 
}

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};