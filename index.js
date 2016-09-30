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

var FantasyMetrix = function () {
    AlexaSkill.call(this, APP_ID);
};

FantasyMetrix.prototype = Object.create(AlexaSkill.prototype);
FantasyMetrix.prototype.constructor = FantasyMetrix;

FantasyMetrix.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    var speechOutput = {
        speech: "Hello and welcome to FantasyMetrix. How can I be of assistance for you today?",
        type: AlexaSkill.speechOutputType.PLAIN_TEXT
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
            games_played,
            passing_attempts,
            completions,
            passing_yards,
            passing_touchdowns,
            interceptions,
            rushing_attempts,
            rushing_yards,
            rushing_touchdowns,
            targets,
            receptions,
            receiving_yards,
            receiving_touchdowns,
            return_touchdowns,
            two_point_conversions,
            fumbles,
            fantasy_points,
            fantasy_points_per_game,
            ppr_fantasy_points,
            ppr_fantasy_points_per_game,
            passing_yards_per_game,
            receiving_yards_per_game,
            receptions_per_game,
            rushing_yards_per_game,
            yards_per_attempt,
            yards_per_carry,
            yards_from_scrimmage,
            yards_per_reception,
            yards_per_target;
            
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
                        getMetricRequest(intent, session, response);
                    } else {
                        console.log("Calling player weekly stats...");
                        for (var key in data["stats"]["stats"]) {
                            if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                                metric_value = data["stats"]["stats"][key]["value"];
                            }
                        }

                        bye_week = data["bye_weeks"]["week"];
                        passing_attempts = parseFloat(data["stats"]["stats"]["1"]["value"]);
                        completions = parseFloat(data["stats"]["stats"]["2"]["value"]);
                        passing_yards = parseFloat(data["stats"]["stats"]["4"]["value"]);
                        passing_touchdowns = parseFloat(data["stats"]["stats"]["5"]["value"]);
                        interceptions = parseFloat(data["stats"]["stats"]["6"]["value"]);
                        rushing_attempts = parseFloat(data["stats"]["stats"]["8"]["value"]);
                        rushing_yards = parseFloat(data["stats"]["stats"]["9"]["value"]);
                        rushing_touchdowns = parseFloat(data["stats"]["stats"]["10"]["value"]);
                        receptions = parseFloat(data["stats"]["stats"]["11"]["value"]);
                        receiving_yards = parseFloat(data["stats"]["stats"]["12"]["value"]);
                        receiving_touchdowns = parseFloat(data["stats"]["stats"]["13"]["value"]);
                        return_touchdowns = parseFloat(data["stats"]["stats"]["15"]["value"]);
                        two_point_conversions = parseFloat(data["stats"]["stats"]["16"]["value"]);
                        fumbles = parseFloat(data["stats"]["stats"]["17"]["value"]);
                        // targets = parseFloat(data["stats"]["stats"]["78"]["value"]);
                        
                        console.log("Bye Week: " + bye_week);
                        console.log("Passing Attempts: " + passing_attempts);
                        console.log("Completions: " + completions);
                        console.log("Passing Yards: " + passing_yards);
                        console.log("Passing Touchdowns: " + passing_touchdowns);
                        console.log("Interceptions: " + interceptions);
                        console.log("Rushing Attempts: " + rushing_attempts);
                        console.log("Rushing Yards: " + rushing_yards);
                        console.log("Rushing Touchdowns: " + rushing_touchdowns);
                        console.log("Receptions: " + receptions);
                        console.log("Receiving Yards: " + receiving_yards);
                        console.log("Receiving Touchdowns: " + receiving_touchdowns);
                        console.log("Return Touchdowns: " + return_touchdowns);
                        console.log("Two-Point Conversions: " + two_point_conversions);
                        console.log("Fumbles: " + fumbles);
                        console.log("Target: " + targets);

                        fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                        ppr_fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);
                        
                        yards_from_scrimmage = (rushing_yards + receiving_yards);
                        yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                        yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                        yards_per_reception = (receiving_yards / receptions).toFixed(1);
                        // yards_per_target = (receiving_yards / targets).toFixed(1);
                        
                        console.log("Fantasy Points: " + fantasy_points);
                        console.log("PPR Fantasy Points: " + ppr_fantasy_points);
                        console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                        console.log("Yards Per Attempts: " + yards_per_attempt);
                        console.log("Yards Per Carry: " + yards_per_carry);
                        console.log("Yards Per Reception: " + yards_per_reception);
                        console.log("Yards Per Target: " + yards_per_target);

                        if (metricName === "fantasy points") {
                            metric_value = fantasy_points;
                        } else if (metricName === "ppr fantasy points") {
                            metric_value = ppr_fantasy_points;
                        } else if (metricName === "yards from scrimmage") {
                            metric_value = yards_from_scrimmage;
                        } else if (metricName === "yards per attempt") {
                            metric_value = yards_per_attempt;
                        } else if (metricName === "yards per carry") {
                            metric_value = yards_per_carry;
                        } else if (metricName === "yards per reception") {
                            metric_value = yards_per_reception;
                        }

                        if (metric_value === "0.0") {
                            metric_value = "0";
                        } else if (metric_value === "NaN") {
                            metric_value = "0";
                        }

                        session.attributes.bye_week = bye_week;
                        session.attributes.week_value = week_value;
                        session.attributes.metric_value = metric_value;
                        session.attributes.fantasy_points = fantasy_points;
                        session.attributes.ppr_fantasy_points = ppr_fantasy_points;
                        console.log("Player Key: " + player_key);
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
                }
            );
        } else {
            yf.player.stats(
                player_key,
                function cb(err, data) {
                    if (err) {
                        console.log(err);
                        getMetricRequest(intent, session, response);
                    } else {
                        console.log("Calling player season stats...");
                        for (var key in data["stats"]["stats"]) {
                            if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                                metric_value = data["stats"]["stats"][key]["value"];
                            }
                        }

                        games_played = data["stats"]["stats"]["0"]["value"];
                        passing_attempts = parseFloat(data["stats"]["stats"]["1"]["value"]);
                        completions = parseFloat(data["stats"]["stats"]["2"]["value"]);
                        passing_yards = parseFloat(data["stats"]["stats"]["4"]["value"]);
                        passing_touchdowns = parseFloat(data["stats"]["stats"]["5"]["value"]);
                        interceptions = parseFloat(data["stats"]["stats"]["6"]["value"]);
                        rushing_attempts = parseFloat(data["stats"]["stats"]["8"]["value"]);
                        rushing_yards = parseFloat(data["stats"]["stats"]["9"]["value"]);
                        rushing_touchdowns = parseFloat(data["stats"]["stats"]["10"]["value"]);
                        receptions = parseFloat(data["stats"]["stats"]["11"]["value"]);
                        receiving_yards = parseFloat(data["stats"]["stats"]["12"]["value"]);
                        receiving_touchdowns = parseFloat(data["stats"]["stats"]["13"]["value"]);
                        return_touchdowns = parseFloat(data["stats"]["stats"]["15"]["value"]);
                        two_point_conversions = parseFloat(data["stats"]["stats"]["16"]["value"]);
                        fumbles = parseFloat(data["stats"]["stats"]["17"]["value"]);
                        // targets = parseFloat(data["stats"]["stats"]["78"]["value"]);
                        
                        console.log("Games Played: " + games_played);
                        console.log("Passing Attempts: " + passing_attempts);
                        console.log("Completions: " + completions);
                        console.log("Passing Yards: " + passing_yards);
                        console.log("Passing Touchdowns: " + passing_touchdowns);
                        console.log("Interceptions: " + interceptions);
                        console.log("Rushing Attempts: " + rushing_attempts);
                        console.log("Rushing Yards: " + rushing_yards);
                        console.log("Rushing Touchdowns: " + rushing_touchdowns);
                        console.log("Receptions: " + receptions);
                        console.log("Receiving Yards: " + receiving_yards);
                        console.log("Receiving Touchdowns: " + receiving_touchdowns);
                        console.log("Return Touchdowns: " + return_touchdowns);
                        console.log("Two-Point Conversions: " + two_point_conversions);
                        console.log("Fumbles: " + fumbles);
                        console.log("Target: " + targets);

                        fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                        ppr_fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                        fantasy_points_per_game = (fantasy_points / games_played).toFixed(1);
                        ppr_fantasy_points_per_game = (ppr_fantasy_points / games_played).toFixed(1);
                        passing_yards_per_game = (passing_yards / games_played).toFixed(1);
                        receiving_yards_per_game = (receiving_yards / games_played).toFixed(1);
                        receptions_per_game = (receptions / games_played).toFixed(1);
                        rushing_yards_per_game = (rushing_yards / games_played).toFixed(1);
                        yards_from_scrimmage = (rushing_yards + receiving_yards);
                        yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                        yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                        yards_per_reception = (receiving_yards / receptions).toFixed(1);
                        // yards_per_target = (receiving_yards / targets).toFixed(1);
                        
                        console.log("Fantasy Points: " + fantasy_points);
                        console.log("PPR Fantasy Points: " + ppr_fantasy_points);
                        console.log("Fantasy Points Per Game: " + fantasy_points_per_game);
                        console.log("PPR Fantasy Points Per Game: " + ppr_fantasy_points_per_game);
                        console.log("Passing Yards Per Game: " + passing_yards_per_game);
                        console.log("Receiving Yards Per Game: " + receiving_yards_per_game);
                        console.log("Receptions Per Game: " + receptions_per_game);
                        console.log("Rushing Yards Per Game: " + rushing_yards_per_game);
                        console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                        console.log("Yards Per Attempts: " + yards_per_attempt);
                        console.log("Yards Per Carry: " + yards_per_carry);
                        console.log("Yards Per Reception: " + yards_per_reception);
                        console.log("Yards Per Target: " + yards_per_target);

                        if (metricName === "fantasy points") {
                            metric_value = fantasy_points;
                        } else if (metricName === "ppr fantasy points") {
                            metric_value = ppr_fantasy_points;
                        } else if (metricName === "fantasy points per game") {
                            metric_value = fantasy_points_per_game;
                        } else if (metricName === "ppr fantasy points per game") {
                            metric_value = ppr_fantasy_points_per_game;
                        } else if (metricName === "passing yards per game") {
                            metric_value = passing_yards_per_game;
                        } else if (metricName === "receiving yards per game") {
                            metric_value = receiving_yards_per_game;
                        } else if (metricName === "receptions per game") {
                            metric_value = receptions_per_game;
                        } else if (metricName === "rushing yards per game") {
                            metric_value = rushing_yards_per_game;
                        } else if (metricName === "yards from scrimmage") {
                            metric_value = yards_from_scrimmage;
                        } else if (metricName === "yards per attempt") {
                            metric_value = yards_per_attempt;
                        } else if (metricName === "yards per carry") {
                            metric_value = yards_per_carry;
                        } else if (metricName === "yards per reception") {
                            metric_value = yards_per_reception;
                        }

                        if (metric_value === "0.0") {
                            metric_value = "0";
                        } else if (metric_value === "NaN") {
                            metric_value = "0";
                        }

                        session.attributes.games_played = games_played;
                        session.attributes.metric_value = metric_value;
                        session.attributes.fantasy_points = fantasy_points;
                        session.attributes.ppr_fantasy_points = ppr_fantasy_points;
                        console.log("Player Key: " + player_key);
                        console.log("Metric Value: " + metric_value);
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
                yahooSearch(intent, session, response);
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
            var speechText = "<speak>Please provide the name of a current player who has played at least one season in the NFL, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and one through two thousand and sixteen. Providing a regular season week number, ranging from one through seventeen, is merely optional. <break time=\"0.618s\"/> Now, what can I help you with today?</speak>"
            var repromptText = "<speak>You can say things like <break time=\"0.618s\"/> How many targets did Julio Jones have during week three of two thousand and fifteen? <break time=\"0.618s\"/> Now, how can I help you?</speak>";
            var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.SSML
            };
            var repromptOutput = {
                speech: repromptText,
                type: AlexaSkill.speechOutputType.SSML
            };
            response.ask(speechOutput, repromptOutput);
        });
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
        trackEvent(
            'Intent',
            'AMAZON.CancelIntent',
            'na',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            var speechOutput = "Thank you for using FantasyMetrix. Goodbye";
            response.tell(speechOutput);
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
    var speechOutput = "Please provide the name of a current player who has played at least one game in the NFL.",
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
        repromptText = "You can say something like, passing yards.";
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

    var speechOutput = "Please provide the year of an NFL season, ranging from two thousand and one through two thousand and sixteen, in which " + player + " has played at least one game.",
        repromptText = "You can say something like, two thousand and fifteen.";
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
        if ((metric === "targets" || metric === "yards per target") && season < parseInt("2014") && season > parseInt("2000")) {
            console.log("I'm sorry, but the targets metric is only available for players beginning from the 2014 season.");
            var speech = "I'm sorry, but the targets metric is only available for players beginning from the 2014 season.";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "targets metric is not available for players before the 2014 season";
            response.tellWithCard(speechOutput, cardTitle);   
        } else if (metric === "games played" && metric_value === games_played) {
            console.log("During the " + season + " season, " + player + " played " + games_played + " games");
            speechOutput = {
                speech: "During the " + season + " season, " + player + " played " + games_played + " games",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && metric && week && metric_value) {
            console.log("During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric);
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && metric && metric_value) {
            console.log("During the " + season + " season, " + player + " had " + metric_value + " " + metric);
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during the " + season + " season";
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && (metric === "fantasy points per game" || metric === "ppr fantasy points per game" || metric === "passing yards per game" || metric === "rushing yards per game" || metric === "receiving yards per game" || metric === "receptions per game") && week) {
            console.log("I'm sorry, but " + metric + " is not a valid metric when providing a week number.")
            var speech = "I'm sorry, but " + metric + " is not a valid metric when providing a week number.";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid metric";
            cardContent = metric + " is not a valid metric when providing a week number";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && Keys[metric] && week) {
            console.log("I'm sorry, but " + player + " did not play in " + week + " of the " + season + " season.");
            var speech = "I'm sorry, but " + player + " did not play in " + week + " of the " + season + " season.";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "did not play";
            cardContent = player + " did not play in " + week + " of the " + season + " season.";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[season] && Keys[metric]) {
            console.log("I'm sorry, but " + player + " did not play in a single game during the " + season + " season.");
            var speech = "I'm sorry, but " + player + " did not play in a single game during the " + season + " season.";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "did not play";
            cardContent = player + " did not play in a single game during the " + season + " season";
            response.tellWithCard(speechOutput, cardTitle, cardContent);        
        } else {
            console.log("I'm sorry, but the information you have provided is invalid");
            var speech = "I'm sorry, but the information you have provided is invalid. For instructions on what you can ask, please say help me.";
            speechOutput = {
                speech: speech,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "please check to see what alexa heard";
            cardContent = "the information you have provided is invalid";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    } else {
        console.log("I'm sorry, but " + player + " was on a Bye for " + week + " of the " + season + " season.");
        var speech = "I'm sorry, but " + player + " was on a Bye for " + week + " of the " + season + " season. Please try using a different week.";
        speechOutput = {
            speech: speech,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        cardTitle = "bye week";
        cardContent = player + " was on a Bye for " + week + " of the " + season + " season";
        response.tellWithCard(speechOutput, cardTitle, cardContent);
    }
}

function yahooSearch(intent, session, response) {
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
        games_played,
        passing_attempts,
        completions,
        passing_yards,
        passing_touchdowns,
        interceptions,
        rushing_attempts,
        rushing_yards,
        rushing_touchdowns,
        targets,
        receptions,
        receiving_yards,
        receiving_touchdowns,
        return_touchdowns,
        two_point_conversions,
        fumbles,
        fantasy_points,
        fantasy_points_per_game,
        ppr_fantasy_points,
        ppr_fantasy_points_per_game,
        passing_yards_per_game,
        receiving_yards_per_game,
        receptions_per_game,
        rushing_yards_per_game,
        yards_per_attempt,
        yards_per_carry,
        yards_from_scrimmage,
        yards_per_reception,
        yards_per_target;

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
                    getMetricRequest(intent, session, response);
                } else {
                    console.log("Calling player weekly stats...");
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }

                    bye_week = data["bye_weeks"]["week"];
                    passing_attempts = parseFloat(data["stats"]["stats"]["1"]["value"]);
                    completions = parseFloat(data["stats"]["stats"]["2"]["value"]);
                    passing_yards = parseFloat(data["stats"]["stats"]["4"]["value"]);
                    passing_touchdowns = parseFloat(data["stats"]["stats"]["5"]["value"]);
                    interceptions = parseFloat(data["stats"]["stats"]["6"]["value"]);
                    rushing_attempts = parseFloat(data["stats"]["stats"]["8"]["value"]);
                    rushing_yards = parseFloat(data["stats"]["stats"]["9"]["value"]);
                    rushing_touchdowns = parseFloat(data["stats"]["stats"]["10"]["value"]);
                    receptions = parseFloat(data["stats"]["stats"]["11"]["value"]);
                    receiving_yards = parseFloat(data["stats"]["stats"]["12"]["value"]);
                    receiving_touchdowns = parseFloat(data["stats"]["stats"]["13"]["value"]);
                    return_touchdowns = parseFloat(data["stats"]["stats"]["15"]["value"]);
                    two_point_conversions = parseFloat(data["stats"]["stats"]["16"]["value"]);
                    fumbles = parseFloat(data["stats"]["stats"]["17"]["value"]);
                    // targets = parseFloat(data["stats"]["stats"]["78"]["value"]);
                    
                    console.log("Bye Week: " + bye_week);
                    console.log("Passing Attempts: " + passing_attempts);
                    console.log("Completions: " + completions);
                    console.log("Passing Yards: " + passing_yards);
                    console.log("Passing Touchdowns: " + passing_touchdowns);
                    console.log("Interceptions: " + interceptions);
                    console.log("Rushing Attempts: " + rushing_attempts);
                    console.log("Rushing Yards: " + rushing_yards);
                    console.log("Rushing Touchdowns: " + rushing_touchdowns);
                    console.log("Receptions: " + receptions);
                    console.log("Receiving Yards: " + receiving_yards);
                    console.log("Receiving Touchdowns: " + receiving_touchdowns);
                    console.log("Return Touchdowns: " + return_touchdowns);
                    console.log("Two-Point Conversions: " + two_point_conversions);
                    console.log("Fumbles: " + fumbles);
                    console.log("Targets: " + targets);

                    fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    ppr_fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);
                    
                    yards_from_scrimmage = (rushing_yards + receiving_yards);
                    yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                    yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                    yards_per_reception = (receiving_yards / receptions).toFixed(1);
                    // yards_per_target = (receiving_yards / targets).toFixed(1);
                    
                    console.log("Fantasy Points: " + fantasy_points);
                    console.log("PPR Fantasy Points: " + ppr_fantasy_points);
                    console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                    console.log("Yards Per Attempt: " + yards_per_attempt);
                    console.log("Yards Per Carry: " + yards_per_carry);
                    console.log("Yards Per Reception: " + yards_per_reception);
                    console.log("Yards Per Target: " + yards_per_target);

                    if (metricName === "fantasy points") {
                        metric_value = fantasy_points;
                    } else if (metricName === "ppr fantasy points") {
                        metric_value = ppr_fantasy_points;
                    } else if (metricName === "yards from scrimmage") {
                        metric_value = yards_from_scrimmage;
                    } else if (metricName === "yards per attempt") {
                        metric_value = yards_per_attempt;
                    } else if (metricName === "yards per carry") {
                        metric_value = yards_per_carry;
                    } else if (metricName === "yards per reception") {
                        metric_value = yards_per_reception;
                    }

                    if (metric_value === "0.0") {
                        metric_value = "0";
                    } else if (metric_value === "NaN") {
                        metric_value = "0";
                    }

                    session.attributes.bye_week = bye_week;
                    session.attributes.week_value = week_value;
                    session.attributes.metric_value = metric_value;
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.ppr_fantasy_points = ppr_fantasy_points;
                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finished calling player weekly stats");
                    trackEvent(
                        'Intent',
                        'YahooSearch',
                        'Weekly Metric',
                        '100',
                        function(err) {
                            if (err) {
                                console.log(err);
                            }
                        getMetricRequest(intent, session, response);
                    });
                }
            }
        );
    } else {
        yf.player.stats(
            player_key,
            function cb(err, data) {
                if (err) {
                    console.log(err);
                    getMetricRequest(intent, session, response);
                } else {
                    console.log("Calling player season stats...");
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }

                    games_played = data["stats"]["stats"]["0"]["value"];
                    passing_attempts = parseFloat(data["stats"]["stats"]["1"]["value"]);
                    completions = parseFloat(data["stats"]["stats"]["2"]["value"]);
                    passing_yards = parseFloat(data["stats"]["stats"]["4"]["value"]);
                    passing_touchdowns = parseFloat(data["stats"]["stats"]["5"]["value"]);
                    interceptions = parseFloat(data["stats"]["stats"]["6"]["value"]);
                    rushing_attempts = parseFloat(data["stats"]["stats"]["8"]["value"]);
                    rushing_yards = parseFloat(data["stats"]["stats"]["9"]["value"]);
                    rushing_touchdowns = parseFloat(data["stats"]["stats"]["10"]["value"]);
                    receptions = parseFloat(data["stats"]["stats"]["11"]["value"]);
                    receiving_yards = parseFloat(data["stats"]["stats"]["12"]["value"]);
                    receiving_touchdowns = parseFloat(data["stats"]["stats"]["13"]["value"]);
                    return_touchdowns = parseFloat(data["stats"]["stats"]["15"]["value"]);
                    two_point_conversions = parseFloat(data["stats"]["stats"]["16"]["value"]);
                    fumbles = parseFloat(data["stats"]["stats"]["17"]["value"]);
                    // targets = parseFloat(data["stats"]["stats"]["78"]["value"]);
                    
                    console.log("Games Played: " + games_played);
                    console.log("Passing Attempts: " + passing_attempts);
                    console.log("Completions: " + completions);
                    console.log("Passing Yards: " + passing_yards);
                    console.log("Passing Touchdowns: " + passing_touchdowns);
                    console.log("Interceptions: " + interceptions);
                    console.log("Rushing Attempts: " + rushing_attempts);
                    console.log("Rushing Yards: " + rushing_yards);
                    console.log("Rushing Touchdowns: " + rushing_touchdowns);
                    console.log("Receptions: " + receptions);
                    console.log("Receiving Yards: " + receiving_yards);
                    console.log("Receiving Touchdowns: " + receiving_touchdowns);
                    console.log("Return Touchdowns: " + return_touchdowns);
                    console.log("Two-Point Conversions: " + two_point_conversions);
                    console.log("Fumbles: " + fumbles);
                    console.log("Targets: " + targets);

                    fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    ppr_fantasy_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    fantasy_points_per_game = (fantasy_points / games_played).toFixed(1);
                    ppr_fantasy_points_per_game = (ppr_fantasy_points / games_played).toFixed(1);
                    passing_yards_per_game = (passing_yards / games_played).toFixed(1);
                    receiving_yards_per_game = (receiving_yards / games_played).toFixed(1);
                    receptions_per_game = (receptions / games_played).toFixed(1);
                    rushing_yards_per_game = (rushing_yards / games_played).toFixed(1);
                    yards_from_scrimmage = (rushing_yards + receiving_yards);
                    yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                    yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                    yards_per_reception = (receiving_yards / receptions).toFixed(1);
                    // yards_per_target = (receiving_yards / targets).toFixed(1);
                    
                    console.log("Fantasy Points: " + fantasy_points);
                    console.log("PPR Fantasy Points: " + ppr_fantasy_points);
                    console.log("Fantasy Points Per Game: " + fantasy_points_per_game);
                    console.log("PPR Fantasy Points Per Game: " + ppr_fantasy_points_per_game);
                    console.log("Passing Yards Per Game: " + passing_yards_per_game);
                    console.log("Receiving Yards Per Game: " + receiving_yards_per_game);
                    console.log("Receptions Per Game: " + receptions_per_game);
                    console.log("Rushing Yards Per Game: " + rushing_yards_per_game);
                    console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                    console.log("Yards Per Attempts: " + yards_per_attempt);
                    console.log("Yards Per Carry: " + yards_per_carry);
                    console.log("Yards Per Reception: " + yards_per_reception);
                    console.log("Yards Per Target: " + yards_per_target);

                    if (metricName === "fantasy points") {
                        metric_value = fantasy_points;
                    } else if (metricName === "ppr fantasy points") {
                        metric_value = ppr_fantasy_points;
                    } else if (metricName === "fantasy points per game") {
                        metric_value = fantasy_points_per_game;
                    } else if (metricName === "ppr fantasy points per game") {
                        metric_value = ppr_fantasy_points_per_game;
                    } else if (metricName === "passing yards per game") {
                        metric_value = passing_yards_per_game;
                    } else if (metricName === "receiving yards per game") {
                        metric_value = receiving_yards_per_game;
                    } else if (metricName === "receptions per game") {
                        metric_value = receptions_per_game;
                    } else if (metricName === "rushing yards per game") {
                        metric_value = rushing_yards_per_game;
                    } else if (metricName === "yards from scrimmage") {
                        metric_value = yards_from_scrimmage;
                    } else if (metricName === "yards per attempt") {
                        metric_value = yards_per_attempt;
                    } else if (metricName === "yards per carry") {
                        metric_value = yards_per_carry;
                    } else if (metricName === "yards per reception") {
                        metric_value = yards_per_reception;
                    }

                    if (metric_value === "0.0") {
                        metric_value = "0";
                    } else if (metric_value === "NaN") {
                        metric_value = "0";
                    }

                    session.attributes.games_played = games_played;
                    session.attributes.metric_value = metric_value;
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.ppr_fantasy_points = ppr_fantasy_points;
                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finished calling player season stats");
                    trackEvent(
                        'Intent',
                        'YahooSearch',
                        'Season Metric',
                        '100',
                        function(err) {
                            if (err) {
                                console.log(err);
                            }
                        getMetricRequest(intent, session, response);
                    });
                }
            }
        );
    }
}

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};