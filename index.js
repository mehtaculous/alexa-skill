'use strict';

var AlexaSkill = require('./AlexaSkill');

var API = require('./api_keys');

var Keys = require('./data_keys');

var APP_ID = 'amzn1.echo-sdk-ams.app.c565f60c-9587-49f8-9131-abed9b952cc3';

var YahooFantasy = require('yahoo-fantasy');

var yf = new YahooFantasy(
    API.consumer_key,
    API.consumer_secret
);

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

var calculations = ["standard fantasy points", "half ppr fantasy points", "full ppr fantasy points"];

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
            metricSlot = intent.slots.Metric,
            seasonSlot = intent.slots.Season,
            weekSlot = intent.slots.Week,
            playerName,
            metricName,
            seasonNumber,
            weekNumber;

        if (playerSlot && playerSlot.value){
            playerName = playerSlot.value.toLowerCase();
            if (playerName.slice(-2) === "\'s") {
                playerName = playerName.slice(0, -2);
                session.attributes.playerName = playerName;
            } else {
                session.attributes.playerName = playerName;
            }
        }

        if (metricSlot && metricSlot.value){
            metricName = metricSlot.value.toLowerCase();
            session.attributes.metricName = metricName;
        }
            
        if (seasonSlot && seasonSlot.value){
            seasonNumber = seasonSlot.value.toLowerCase();
            session.attributes.seasonNumber = seasonNumber;
        }
           
        if (weekSlot && weekSlot.value){
            weekNumber = weekSlot.value.toLowerCase();
            session.attributes.weekNumber = weekNumber;
        }

        console.log("oneShotPlayerIntent: " + playerName);
        console.log("oneShotMetricIntent: " + metricName);
        console.log("oneShotSeasonIntent: " + seasonNumber);
        console.log("oneShotWeekIntent: " + weekNumber);

        var strLogData = ["oneShotPlayerIntent: " + playerName, "oneShotMetricIntent: " + metricName, "oneShotSeasonIntent: " + seasonNumber, "oneShotWeekIntent: " + weekNumber];              

        var week_value = 1,
            bye_week = 2;

        session.attributes.week_value = week_value;
        session.attributes.bye_week = bye_week;

        var game_id = JSON.stringify(Keys[seasonNumber]),
            player_id = JSON.stringify(Keys[playerName]),
            metric_id = JSON.stringify(Keys[metricName]),
            week_split,
            metric_value,
            games_played;

        var player_key = game_id + '.p.' + player_id;

        if (weekNumber) {
            if (weekNumber.length === 6) {
                week_split = weekNumber.split("");
                week_value = week_split[week_split.length - 1];
            } else if (weekNumber.length === 7) {
                week_split = weekNumber.split("");
                week_value = week_split[week_split.length - 2] + week_split[week_split.length - 1];
            }
        }

        if (weekNumber) {
            yf.player.stats(
                player_key,
                week_value,
                function cb(err, data) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Calling player weekly stats...");
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }
                    bye_week = data["bye_weeks"]["week"];
                    session.attributes.bye_week = bye_week;
                    session.attributes.week_value = week_value;
                    session.attributes.metric_value = metric_value;
                    console.log("Player Key: " + player_key);
                    console.log("Week: " + week_value);
                    console.log("Bye Week: " + bye_week);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finished calling player weekly stats");

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
                }
            );
        } else {
            yf.player.stats(
                player_key,
                function cb(err, data) {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Calling player season stats...");
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }
                    games_played = data["stats"]["stats"]["0"]["value"];
                    session.attributes.metric_value = metric_value;
                    session.attributes.games_played = games_played;
                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Games Played: " + games_played)
                    console.log("Finished calling player season stats");

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
                }
            );
        }
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
            if (playerName.slice(-2) === "\'s") {
                playerName = playerName.slice(0, -2);
                session.attributes.playerName = playerName;
            } else {
                session.attributes.playerName = playerName;
            }
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

        var strLogData = ["missingPlayerIntent: " + playerName, "missingMetricIntent: " + metricName, "missingSeasonIntent: " + seasonNumber, "missingWeekIntent: " + weekNumber];

        playerName = session.attributes.playerName,
        metricName = session.attributes.metricName,
        seasonNumber = session.attributes.seasonNumber,
        weekNumber = session.attributes.weekNumber;

        trackEvent(
            'Intent',
            'MissingSlotIntent',
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
                yahooSearch(intent, session);
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
            var speechText = "You can ask questions such as <break time = \"0.618s\"/> Get me Russell Wilson's passing touchdowns for week one of two thousand and fourteen? <break time = \"0.618s\"/> Now, what can I help you with?";
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
}

function handleMissingMetricRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName;
    } else {
        player = playerName.concat("\'s");
    }

    var speechOutput = "Please provide a valid metric which correlates to " + player + " position.",
        repromptText = "You can say something like, Passing Yards.";
    response.ask(speechOutput, repromptText);
}

function handleMissingSeasonRequest(intent, session, response) {
    var player;
    var playerName = session.attributes.playerName;
    if (playerName.slice(-2) === "\'s") {
        player = playerName.slice(0, -2);
    } else {
        player = playerName;
    }

    var speechOutput = "Please provide the year of a valid NFL season, ranging from two thousand and one through two thousand and sixteen, in which " + player + " has played at least one game.",
        repromptText = "You can say something like, Two Thousand and Fifteen.";
    response.ask(speechOutput, repromptText);
}

function getMetricRequest(intent, session, response) {

    var player = session.attributes.playerName,
        metric = session.attributes.metricName,
        season = session.attributes.seasonNumber,
        week = session.attributes.weekNumber,
        metric_value = session.attributes.metric_value,
        week_value = session.attributes.week_value,
        bye_week = session.attributes.bye_week,
        games_played = session.attributes.games_played,
        speechOutput,
        repromptOutput,
        cardTitle,
        cardContent;

    console.log("getPlayerRequest: " + player);
    console.log("getMetricRequest: " + metric);
    console.log("getSeasonRequest: " + season);
    console.log("getWeekRequest: " + week);
    console.log("getWeekValueRequest: " + week_value);
    console.log("getByeWeekValueRequest: " + bye_week);
    console.log("getGamesPlayedRequest: " + games_played);
    console.log("getMetricValueRequest: " + metric_value);

    if (bye_week !== week_value) {
        if (player && metric && season && (calculations.indexOf(metric) > -1)) {
            calculateMetricRequest(intent, session, response);
        } else if (metric_value === games_played && metric === "games played") {
            console.log("During the " + season + " season, " + player + " played " + games_played + " games");
            speechOutput = {
                speech: "During the " + season + " season, " + player + " played " + games_played + " games",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && Keys[metric] && week && metric_value) {
            console.log("During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric);
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && Keys[metric] && metric_value) {
            console.log("During the " + season + " season, " + player + " had " + metric_value + " " + metric);
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else {
            console.log("I'm sorry, I currently do not know what you are asking for.");
            var speech = "I'm sorry, I currently do not know what you are asking for. Please make sure that you are providing the name of a current player who has played at least one season in the National Football League, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and one through two thousand and sixteen. Providing a regular season week number, ranging from one through seventeen is merely optional.";
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
    } else {
        console.log("I'm sorry, but " + player + " was on a Bye for " + week + " of the " + season + " season.");
        var speech = "I'm sorry, but " + player + " was on a Bye for " + week + " of the " + season + " season. Please try using a different week.";
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
}

function yahooSearch(intent, session) {
    var playerName = session.attributes.playerName,
        metricName = session.attributes.metricName,
        seasonNumber = session.attributes.seasonNumber,
        weekNumber = session.attributes.weekNumber;

    var week_value = 1,
        bye_week = 2;

    session.attributes.week_value = week_value;
    session.attributes.bye_week = bye_week;

    var game_id = JSON.stringify(Keys[seasonNumber]),
        player_id = JSON.stringify(Keys[playerName]),
        metric_id = JSON.stringify(Keys[metricName]),
        week_split,
        metric_value,
        games_played;

    var player_key = game_id + '.p.' + player_id;

    if (weekNumber) {
        if (weekNumber.length === 6) {
            week_split = weekNumber.split("");
            week_value = week_split[week_split.length - 1];
        } else if (weekNumber.length === 7) {
            week_split = weekNumber.split("");
            week_value = week_split[week_split.length - 2] + week_split[week_split.length - 1];
        }
    }

    if (weekNumber) {
        yf.player.stats(
            player_key,
            week_value,
            function cb(err, data) {
                if (err) {
                    console.log(err);
                }
                console.log("Calling player weekly stats...");
                for (var key in data["stats"]["stats"]) {
                    if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                        metric_value = data["stats"]["stats"][key]["value"];
                    }
                }
                bye_week = data["bye_weeks"]["week"];
                session.attributes.bye_week = bye_week;
                session.attributes.week_value = week_value;
                session.attributes.metric_value = metric_value;
                console.log("Player Key: " + player_key);
                console.log("Week: " + week_value);
                console.log("Bye Week: " + bye_week);
                console.log("Metric Value: " + metric_value);
                console.log("Finished calling player weekly stats");
            }
        );
    } else {
        yf.player.stats(
            player_key,
            function cb(err, data) {
                if (err) {
                    console.log(err);
                }
                console.log("Calling player season stats...");
                for (var key in data["stats"]["stats"]) {
                    if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                        metric_value = data["stats"]["stats"][key]["value"];
                    }
                }
                games_played = data["stats"]["stats"]["0"]["value"];
                session.attributes.metric_value = metric_value;
                session.attributes.games_played = games_played;
                console.log("Player Key: " + player_key);
                console.log("Metric Value: " + metric_value);
                console.log("Games Played: " + games_played)
                console.log("Finished calling player season stats");
            }
        );
    }
}

function calculateMetricRequest(intent, session, response) {
    
}

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};