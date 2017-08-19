'use strict';

var AlexaSkill = require('./AlexaSkill');

var APP_ID = 'amzn1.ask.skill.9b2ac00a-9c3e-458e-887a-ec28e96cdf56';

var API = require('./api_keys');

var YahooFantasy = require('yahoo-fantasy');

var Keys = require('./data_keys');

var Teams = require('./teams');

var Schedules = {
    "twenty_two": require('./schedules/2002'),
    "twenty_three": require('./schedules/2003'),
    "twenty_four": require('./schedules/2004'),
    "twenty_five": require('./schedules/2005'),
    "twenty_six": require('./schedules/2006'),
    "twenty_seven": require('./schedules/2007'),
    "twenty_eight": require('./schedules/2008'),
    "twenty_nine": require('./schedules/2009'),
    "twenty_ten": require('./schedules/2010'),
    "twenty_eleven": require('./schedules/2011'),
    "twenty_twelve": require('./schedules/2012'),
    "twenty_thirteen": require('./schedules/2013'),
    "twenty_fourteen": require('./schedules/2014'),
    "twenty_fifteen": require('./schedules/2015'),
    "twenty_sixteen": require('./schedules/2016'),
    "twenty_seventeen": require('./schedules/2017')
};

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
                yahooSearch(intent, session, response);
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

    "ScheduleIntent": function(intent, session, response) {
        var teamSlot = intent.slots.Team,
            weekSlot = intent.slots.Week,
            seasonSlot = intent.slots.Season,
            teamName,
            weekNumber,
            seasonNumber;

        if (teamSlot && teamSlot.value) {
            teamName = teamSlot.value.toLowerCase();
            session.attributes.teamName = teamName;
        }

        if (weekSlot && weekSlot.value) {
            weekNumber = weekSlot.value.toLowerCase();
            session.attributes.weekNumber = weekNumber;
        }

        if (seasonSlot && seasonSlot.value) {
            seasonNumber = seasonSlot.value.toLowerCase();
            session.attributes.seasonNumber = seasonNumber;
        }

        console.log("scheduleTeamIntent: " + teamName);
        console.log("scheduleWeekIntent: " + weekNumber);
        console.log("scheduleSeasonIntent: " + seasonNumber);

        var strLogData = ["scheduleTeamIntent: " + teamName, "scheduleWeekIntent: " + weekNumber, "scheduleSeasonIntent: " + seasonNumber];

        if (teamName === undefined || weekNumber === undefined || seasonNumber === undefined || (parseInt(seasonNumber) < 2002 || parseInt(seasonNumber) > 2017)) {
            var speechOutput = "I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.",
                cardTitle = "the information you have provided is invalid",
                cardContent = "please check the voice feedback to see what alexa heard";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }

        trackEvent(
            'Intent',
            'ScheduleIntent',
            strLogData,
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            if (teamName && weekNumber && seasonNumber) {
                scheduleSearch(intent, session, response);
            }
        });
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        trackEvent(
            'Intent',
            'AMAZON.HelpIntent',
            'NA',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            var speechText = "<speak>Please provide the name of a current NFL player who has played in at least one game, a valid metric correlating to that player's position, and a valid year pertaining to the NFL season ranging from two thousand and one through two thousand and seventeen. Providing a regular season week number, ranging from one through seventeen, is merely optional. You can say something like <break time=\"0.618s\"/> How many passing touchdowns did Tom Brady have in two thousand and seven?</speak>"

            var repromptText = "<speak>Here is the entire list of available metrics: Carries, Catch Rate, Completions, Completion Percentage, Fantasy Points, Fantasy Points Per Game, Fumbles, Games Played, Half PPR Points, Half PPR Points Per Game, Interceptions, Passing Attempts, Passing Attempts Per Game, Passing Touchdowns, Passing Yards, Passing Yards Per Game, PPR Points, PPR Points Per Game, Receiving Touchdowns, Receiving Yards, Receiving Yards Per Game, Receptions, Receptions Per Game, Return Touchdowns, Rushing Attempts, Rushing Attempts Per Game, Rushing Touchdowns, Rushing Yards, Rushing Yards Per Game, Stats, Targets, Targets Per Game, Total Touchdowns, Two Point Conversions, Yards From Scrimmage, Yards From Scrimmage Per Game, Yards Per Attempt, Yards Per Carry, Yards Per Reception, Yards Per Target. <break time=\"0.618s\"/> Now, what can I help you with today?</speak>";

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
            'NA',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            var speechOutput = "Thank you for using FantasyMetrix. Go Hawks!";
            response.tell(speechOutput);
        });
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        trackEvent(
            'Intent',
            'AMAZON.StopIntent',
            'NA',
            '100',
            function(err) {
                if (err) {
                    console.log(err);
                }
            var speechOutput = "Thank you for using FantasyMetrix. Go Hawks!";
            response.tell(speechOutput);
        });
    }
};

function handleMissingPlayerRequest(intent, session, response) {
    var speechOutput = "Please provide the name of a current NFL player who has played in at least one game.",
        repromptText = "You can say something like, Tom Brady";
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
        repromptText = "You can say something like, passing touchdowns";
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

    var speechOutput = "Please provide the year of an NFL season, ranging from two thousand and one through two thousand and seventeen, in which " + player + " has played in at least one game.",
        repromptText = "You can say something like, two thousand and seven.";
    response.ask(speechOutput, repromptText);
}

function getMetricRequest(intent, session, response) {
    var player = session.attributes.playerName,
        metric = session.attributes.metricName,
        season = session.attributes.seasonNumber,
        week = session.attributes.weekNumber,
        week_value = session.attributes.week_value,
        team = session.attributes.team,
        position = session.attributes.position,
        did_not_play = session.attributes.did_not_play,
        games_played = session.attributes.games_played,
        metric_value = session.attributes.metric_value,
        passing_attempts = session.attributes.passing_attempts,
        completions = session.attributes.completions,
        passing_yards = session.attributes.passing_yards,
        passing_touchdowns = session.attributes.passing_touchdowns,
        targets = session.attributes.targets,
        receptions = session.attributes.receptions,
        receiving_yards = session.attributes.receiving_yards,
        receiving_touchdowns = session.attributes.receiving_touchdowns,
        rushing_attempts = session.attributes.rushing_attempts,
        rushing_yards = session.attributes.rushing_yards,
        rushing_touchdowns = session.attributes.rushing_touchdowns,
        fantasy_points = session.attributes.fantasy_points,
        half_ppr_points = session.attributes.half_ppr_points,
        ppr_points = session.attributes.ppr_points,
        fantasy_points_per_game = session.attributes.fantasy_points_per_game,
        speechOutput,
        cardTitle,
        cardContent;

    console.log("Get Metric Request...");
    console.log("Player: " + player);
    console.log("Metric: " + metric);
    console.log("Season: " + season);
    console.log("Week: " + week);
    console.log("Week Value: " + week_value);
    console.log("Team: " + team);
    console.log("Position: " + position);
    console.log("Games Played: " + games_played);
    console.log("Did Not Play: " + did_not_play);
    console.log("Metric Value: " + metric_value);
    console.log("Passing Attempts: " + passing_attempts);
    console.log("Completions: " + completions);
    console.log("Passing Yards: " + passing_yards);
    console.log("Passing Touchdowns: " + passing_touchdowns);
    console.log("Targets: " + targets);
    console.log("Receptions: " + receptions);
    console.log("Receiving Yards: " + receiving_yards);
    console.log("Receiving Touchdowns: " + receiving_touchdowns);
    console.log("Rushing Attempts: " + rushing_attempts);
    console.log("Rushing Yards: " + rushing_yards);
    console.log("Rushing Touchdowns: " + rushing_touchdowns);
    console.log("Fantasy Points: " + fantasy_points);
    console.log("Half PPR Points: " + half_ppr_points);
    console.log("PPR Points: " + ppr_points);
    console.log("Fantasy Points Per Game: " + fantasy_points_per_game);

    if (metric === "stats") {
        if (position === "QB") {
            if (week) {
                speechOutput = {
                    speech: "During " + week + " of the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, and " + passing_touchdowns + " passing touchdowns, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                }
                cardTitle = "stats for " + player + " in " + week + " of " + season;
                cardContent = completions + " completions, " + passing_attempts + " passing attempts, " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + fantasy_points + " fantasy points";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                speechOutput = {
                    speech: "During the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, and " + passing_touchdowns + " passing touchdowns, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                }
                cardTitle = "stats for " + player + " in " + season;
                cardContent = completions + " completions, " + passing_attempts + " passing attempts, " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else if (position === "RB") {
            if (week) {
                speechOutput = {
                    speech: "During " + week + " of the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                }
                cardTitle = "stats for " + player + " in " + week + " of " + season;
                cardContent = rushing_attempts + " rushing attempts, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                speechOutput = {
                    speech: "During the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + "  total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                }
                cardTitle = "stats for " + player + " in " + season;
                cardContent = rushing_attempts + " rushing attempts, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else if (position === "WR" || position === "TE") {
            if (season < parseInt("2014") && season > parseInt("2000")) {
                if (week) {
                    speechOutput = {
                        speech: "During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    }
                    cardTitle = "stats for " + player + " in " + week + " of " + season;
                    cardContent = receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                } else {
                    speechOutput = {
                        speech: "During the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    }
                    cardTitle = "stats for " + player + " in " + season;
                    cardContent = receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                }
            } else {
                if (week) {
                    speechOutput = {
                        speech: "During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    }
                    cardTitle = "stats for " + player + " in " + week + " of " + season;
                    cardContent = receptions + " receptions, " + targets + " targets, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                } else {
                    speechOutput = {
                        speech: "During the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    }
                    cardTitle = "stats for " + player + " in " + season;
                    cardContent = receptions + " receptions, " + targets + " targets, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                }
            }
        } else {
            speechOutput = {
                speech: "I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "the information you have provided is invalid";
            cardContent = "please check the voice feedback to see what alexa heard";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    } else {
        if ((metric === "targets" || metric === "yards per target" || metric === "targets per game" || metric === "catch rate") && season < parseInt("2014") && season > parseInt("2000")) {
            speechOutput = {
                speech: "I'm sorry, but target metrics are only available for players beginning from the 2014 season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = "target metrics are only available for players beginning from the 2014 season";
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if ((metric === "fantasy points per game" || metric === "half ppr points per game" || metric === "ppr points per game" || metric === "passing yards per game" || metric === "rushing yards per game" || metric === "receiving yards per game" || metric === "receptions per game" || metric === "targets per game" || metric === "games played") && Keys[player] && Keys[season] && Keys[week]) {
            speechOutput = {
                speech: "I'm sorry, but " + metric + " is not a valid metric when providing a week number.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = metric + " is not a valid request when providing a week number";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
            
        }  else if (metric === "games played" && metric_value) {
            speechOutput = {
                speech: "During the " + season + " season, " + player + " played in " + games_played + " games.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if ((metric === "catch rate" || metric === "completion percentage") && Keys[week] && metric_value) {
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had a " + metric_value + "% " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of " + season;
            cardContent = metric_value + "% " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if ((metric === "catch rate" || metric === "completion percentage") && metric_value) {
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had a " + metric_value + "% " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + "% " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (Keys[player] && Keys[metric] && Keys[season] && Keys[week] && metric_value) {
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[metric] && Keys[season] && metric_value) {
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had " + metric_value + " " + metric,
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);

        } else if (Keys[player] && Keys[metric] && Keys[season] && Keys[week]) {
            speechOutput = {
                speech: "I'm sorry, but " + player + " did not play in " + week + " of the " + season + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardContent = player + " did not play in " + week + " of " + season;
            response.tellWithCard(speechOutput, cardContent);
        } else if (Keys[player] && Keys[metric] && Keys[season] ) {
            speechOutput = {
                speech: "I'm sorry, but " + player + " did not play in a single game during the " + season + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardContent = player + " did not play in a single game during the " + season + " season";
            response.tellWithCard(speechOutput, cardContent);   

        } else {
            speechOutput = {
                speech: "I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "the information you have provided is invalid";
            cardContent = "please check the voice feedback in the alexa app to see what I heard";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    }
}

function getScheduleRequest(intent, session, response) {
    var teamName = session.attributes.teamName,
        weekNumber = session.attributes.weekNumber,
        seasonNumber = session.attributes.seasonNumber,
        team_abbr = session.attributes.team_abbr,
        team_city = session.attributes.team_city,
        opponent_abbr = session.attributes.opponent_abbr,
        opponent_name = session.attributes.opponent_name,
        opponent_city = session.attributes.opponent_city,
        away = session.attributes.away,
        speechOutput,
        cardTitle,
        cardContent;

    console.log("Get Schedule Request...");
    console.log("Team: " + teamName);
    console.log("Week: " + weekNumber);
    console.log("Season: " + seasonNumber);
    console.log("Team Abbr: " + team_abbr);
    console.log("Team City: " + team_city);
    console.log("Opponent Name: " + opponent_name);
    console.log("Opponent Abbr: " + opponent_abbr);
    console.log("Opponent City: " + opponent_city);
    console.log("Away: " + away);

    if (seasonNumber === "2017") {
        if (opponent_abbr != "BYE") {
            if (away) {
                speechOutput = {
                    speech: "For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + opponent_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " @ " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                speechOutput = {
                    speech: "For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + team_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " vs " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else {
            speechOutput = {
                speech: "I'm sorry, but the " + teamName + " are on a Bye for " + weekNumber + " of the " + seasonNumber + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardContent = teamName + " are on a Bye for " + weekNumber + " of " + seasonNumber;
            response.tellWithCard(speechOutput, cardContent);
        }
    } else {
        if (opponent_abbr != "BYE") {
            if (away) {
                speechOutput = {
                    speech: "During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + opponent_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " @ " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                speechOutput = {
                    speech: "During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + team_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " vs " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else {
            speechOutput = {
                speech: "I'm sorry, but the " + teamName + " were on a Bye for " + weekNumber + " of the " + seasonNumber + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardContent = teamName + " were on a Bye for " + weekNumber + " of " + seasonNumber;
            response.tellWithCard(speechOutput, cardContent);
        }
    }
}

function scheduleSearch(intent, session, response) {
    var teamName = session.attributes.teamName,
        weekNumber = session.attributes.weekNumber,
        seasonNumber = session.attributes.seasonNumber;

    var team_abbr,
        team_city,
        opponent_abbr,
        opponent_name,
        opponent_city,
        week_value,
        season_name,
        away;

    week_value = Keys[weekNumber];
    season_name = Teams["years"][seasonNumber];
    team_abbr = Teams["team_abbr"][teamName];
    team_city = Teams["team_city"][team_abbr];
    teamName = Teams["team_name"][team_abbr];

    opponent_abbr = Schedules[season_name][team_abbr][week_value];

    if (opponent_abbr[0] === "@") {
        away = opponent_abbr[0];
        opponent_abbr = opponent_abbr.slice(1);
    }

    opponent_city = Teams["team_city"][opponent_abbr];
    opponent_name = Teams["team_name"][opponent_abbr];

    console.log("Schedule Search...");
    console.log("Week Value: " + week_value);
    console.log("Season Name: " + season_name);
    console.log("Team Abbr: " + team_abbr);
    console.log("Team City: " + team_city);
    console.log("Team Name: " + teamName);
    console.log("Opponent Abbr: " + opponent_abbr);
    console.log("Opponent City: " + opponent_city);
    console.log("Opponent Name: " + opponent_name);

    session.attributes.teamName = teamName;
    session.attributes.weekNumber = weekNumber;
    session.attributes.seasonNumber = seasonNumber;
    session.attributes.team_abbr = team_abbr;
    session.attributes.team_city = team_city;
    session.attributes.opponent_abbr = opponent_abbr;
    session.attributes.opponent_name = opponent_name;
    session.attributes.opponent_city = opponent_city;
    session.attributes.away = away;

    trackEvent(
        'Intent',
        'ScheduleSearch',
        'NA',
        '100',
        function(err) {
            if (err) {
                console.log(err);
            }
        getScheduleRequest(intent, session, response);
    });
}

function yahooSearch(intent, session, response) {
    var playerName = session.attributes.playerName,
        metricName = session.attributes.metricName,
        seasonNumber = session.attributes.seasonNumber,
        weekNumber = session.attributes.weekNumber;

    var game_id = JSON.stringify(Keys[seasonNumber]),
        player_id = JSON.stringify(Keys[playerName]),
        metric_id = JSON.stringify(Keys[metricName]),
        week_value,
        bye_week,
        metric_value,
        games_played,
        did_not_play,
        passing_attempts,
        completions,
        completion_percentage,
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
        half_ppr_points,
        half_ppr_points_per_game,
        ppr_points,
        ppr_points_per_game,
        total_touchdowns,
        passing_attempts_per_game,
        passing_yards_per_game,
        targets_per_game,
        receptions_per_game,
        receiving_yards_per_game,
        rushing_attempts_per_game,
        carries_per_game,
        rushing_yards_per_game,
        yards_per_attempt,
        yards_per_carry,
        yards_from_scrimmage,
        yards_from_scrimmage_per_game,
        yards_per_reception,
        yards_per_target,
        catch_rate,
        position,
        team,
        stats;

    var player_key = game_id + '.p.' + player_id;

    if (weekNumber) {
        week_value = Keys[weekNumber];
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
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }

                    team = data["editorial_team_abbr"];
                    position = data["display_position"];
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
                    fumbles = parseFloat(data["stats"]["stats"]["18"]["value"]);

                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === "78") {
                            targets = parseFloat(data["stats"]["stats"][key]["value"]);
                        }
                    }
                    
                    console.log("Yahoo Search weekly stats...");
                    console.log("Team: " + team);
                    console.log("Position: " + position);
                    console.log("Bye Week: " + bye_week);
                    console.log("Did Not Play: " + did_not_play);
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

                    half_ppr_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 0.5) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    ppr_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);
                    
                    completion_percentage = (completions / passing_attempts).toFixed(2) * 100;
                    total_touchdowns = (passing_touchdowns + rushing_touchdowns + receiving_touchdowns + return_touchdowns);
                    yards_from_scrimmage = (rushing_yards + receiving_yards);
                    yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                    yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                    yards_per_reception = (receiving_yards / receptions).toFixed(1);
                    yards_per_target = (receiving_yards / targets).toFixed(1);
                    catch_rate = (receptions / targets).toFixed(2) * 100;
                    
                    console.log("Fantasy Points: " + fantasy_points);
                    console.log("Half PPR Points: " + half_ppr_points)
                    console.log("PPR Points: " + ppr_points);
                    console.log("Completion Percentage: " + completion_percentage);
                    console.log("Total Touchdowns: " + total_touchdowns);
                    console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                    console.log("Yards Per Attempt: " + yards_per_attempt);
                    console.log("Yards Per Carry: " + yards_per_carry);
                    console.log("Yards Per Reception: " + yards_per_reception);
                    console.log("Yards Per Target: " + yards_per_target);
                    console.log("Catch Rate: " + catch_rate);

                    if (metricName === "fantasy points") {
                        metric_value = fantasy_points;
                    } else if (metricName === "half ppr points" || metricName === "half p.p.r. points") {
                        metric_value = half_ppr_points;
                    } else if (metricName === "ppr points" || metricName === "p.p.r. points") {
                        metric_value = ppr_points;
                    } else if (metricName === "compeltion percentage") {
                        metric_value = completion_percentage;
                    } else if (metricName === "total touchdowns") {
                        metric_value = total_touchdowns;
                    } else if (metricName === "yards from scrimmage") {
                        metric_value = yards_from_scrimmage;
                    } else if (metricName === "yards per attempt") {
                        metric_value = yards_per_attempt;
                    } else if (metricName === "yards per carry") {
                        metric_value = yards_per_carry;
                    } else if (metricName === "yards per reception") {
                        metric_value = yards_per_reception;
                    } else if (metricName === "yards per target") {
                        metric_value = yards_per_target;
                    } else if (metricName === "catch rate") {
                        metric_value = catch_rate;
                    }

                    if (metric_value === "0.0" || metric_value === "NaN") {
                        metric_value = "0";
                    }

                    if (fantasy_points == "0.0") {
                        fantasy_points = "0";
                        half_ppr_points = "0";
                        ppr_points = "0";
                    }

                    session.attributes.week_value = week_value;
                    session.attributes.metric_value = metric_value;
                    session.attributes.team = team;
                    session.attributes.position = position;
                    session.attributes.did_not_play = did_not_play;
                    session.attributes.passing_attempts = passing_attempts;
                    session.attributes.completions = completions;
                    session.attributes.passing_yards = passing_yards;
                    session.attributes.passing_touchdowns = passing_touchdowns;
                    session.attributes.targets = targets;
                    session.attributes.receptions = receptions;
                    session.attributes.receiving_yards = receiving_yards;
                    session.attributes.receiving_touchdowns = receiving_touchdowns;
                    session.attributes.rushing_attempts = rushing_attempts;
                    session.attributes.rushing_yards = rushing_yards;
                    session.attributes.rushing_touchdowns = rushing_touchdowns;
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.half_ppr_points = half_ppr_points;
                    session.attributes.ppr_points = ppr_points;

                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finished calling weekly stats");

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
                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === metric_id) {
                            metric_value = data["stats"]["stats"][key]["value"];
                        }
                    }

                    team = data["editorial_team_abbr"];
                    position = data["display_position"];
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
                    fumbles = parseFloat(data["stats"]["stats"]["18"]["value"]);

                    for (var key in data["stats"]["stats"]) {
                        if (data["stats"]["stats"][key]["stat_id"] === "78") {
                            targets = parseFloat(data["stats"]["stats"][key]["value"]);
                        }
                    }
                    
                    console.log("Yahoo Search season stats...");
                    console.log("Team: " + team);
                    console.log("Position: " + position);
                    console.log("Games Played: " + games_played);
                    console.log("Did Not Play: " + did_not_play);
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

                    half_ppr_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 0.5) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    ppr_points = ((passing_yards / 25) + (passing_touchdowns * 4) + (interceptions * -1) + (rushing_yards / 10) + (rushing_touchdowns * 6) + (receptions * 1) + (receiving_yards / 10) + (receiving_touchdowns * 6) + (return_touchdowns * 6) + (two_point_conversions * 2) + (fumbles * -2)).toFixed(1);

                    completion_percentage = (completions / passing_attempts).toFixed(2) * 100;
                    total_touchdowns = (passing_touchdowns + rushing_touchdowns + receiving_touchdowns + return_touchdowns);
                    fantasy_points_per_game = (fantasy_points / games_played).toFixed(1);
                    half_ppr_points_per_game = (half_ppr_points / games_played).toFixed(1);
                    ppr_points_per_game = (ppr_points / games_played).toFixed(1);
                    passing_attempts_per_game = (passing_attempts / games_played).toFixed(1);
                    passing_yards_per_game = (passing_yards / games_played).toFixed(1);
                    targets_per_game = (targets / games_played).toFixed(1);
                    receptions_per_game = (receptions / games_played).toFixed(1);
                    receiving_yards_per_game = (receiving_yards / games_played).toFixed(1);
                    rushing_attempts_per_game = (rushing_attempts / games_played).toFixed(1);
                    carries_per_game = (rushing_attempts / games_played).toFixed(1);
                    rushing_yards_per_game = (rushing_yards / games_played).toFixed(1);
                    yards_from_scrimmage = (rushing_yards + receiving_yards);
                    yards_from_scrimmage_per_game = (yards_from_scrimmage / games_played).toFixed(1);
                    yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                    yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                    yards_per_reception = (receiving_yards / receptions).toFixed(1);
                    yards_per_target = (receiving_yards / targets).toFixed(1);
                    catch_rate = (receptions / targets).toFixed(2) * 100;
                    
                    console.log("Fantasy Points: " + fantasy_points);
                    console.log("Half PPR Points: " + half_ppr_points);
                    console.log("PPR Points: " + ppr_points);
                    console.log("Completion Percentage: " + completion_percentage);
                    console.log("Total Touchdowns: " + total_touchdowns);
                    console.log("Fantasy Points Per Game: " + fantasy_points_per_game);
                    console.log("Half PPR Points Per Game: " + half_ppr_points_per_game);
                    console.log("PPR Points Per Game: " + ppr_points_per_game);
                    console.log("Passing Attempts Per Game: " + passing_attempts_per_game);
                    console.log("Passing Yards Per Game: " + passing_yards_per_game);
                    console.log("Targets Per Game: " + targets_per_game);
                    console.log("Receptions Per Game: " + receptions_per_game);
                    console.log("Receiving Yards Per Game: " + receiving_yards_per_game);
                    console.log("Rushing Attempts Per Game: " + rushing_attempts_per_game);
                    console.log("Carries Per Game: " + carries_per_game);
                    console.log("Rushing Yards Per Game: " + rushing_yards_per_game);
                    console.log("Yards From Scrimmage: " + yards_from_scrimmage);
                    console.log("Yards From Scrimmage Per Game: " + yards_from_scrimmage_per_game);
                    console.log("Yards Per Attempts: " + yards_per_attempt);
                    console.log("Yards Per Carry: " + yards_per_carry);
                    console.log("Yards Per Reception: " + yards_per_reception);
                    console.log("Yards Per Target: " + yards_per_target);
                    console.log("Catch Rate: " + catch_rate);

                    if (metricName === "fantasy points") {
                        metric_value = fantasy_points;
                    } else if (metricName === "half ppr points" || metricName === "half p.p.r. points") {
                        metric_value = half_ppr_points;
                    } else if (metricName === "ppr points" || metricName === "p.p.r. points") {
                        metric_value = ppr_points;
                    } else if (metricName === "completion percentage") {
                        metric_value = completion_percentage;
                    } else if (metricName === "total touchdowns") {
                        metric_value = total_touchdowns;
                    } else if (metricName === "fantasy points per game") {
                        metric_value = fantasy_points_per_game;
                    } else if (metricName === "half ppr points per game" || metricName === "half p.p.r. points per game") {
                        metric_value = half_ppr_points_per_game;
                    } else if (metricName === "ppr points per game" || metricName === "p.p.r. points per game") {
                        metric_value = ppr_points_per_game;
                    } else if (metricName === "passing attempts per game") {
                        metric_value = passing_attempts_per_game;
                    } else if (metricName === "passing yards per game") {
                        metric_value = passing_yards_per_game;
                    } else if (metricName === "targets per game") {
                        metric_value = targets_per_game;
                    } else if (metricName === "receptions per game") {
                        metric_value = receptions_per_game;
                    } else if (metricName === "receiving yards per game") {
                        metric_value = receiving_yards_per_game;
                    } else if (metricName === "rushing attempts per game") {
                        metric_value = rushing_attempts_per_game;
                    } else if (metricName === "carries per game") {
                        metric_value = carries_per_game;
                    } else if (metricName === "rushing yards per game") {
                        metric_value = rushing_yards_per_game;
                    } else if (metricName === "yards from scrimmage") {
                        metric_value = yards_from_scrimmage;
                    } else if (metricName === "yards from scrimmage per game") {
                        metric_value = yards_from_scrimmage_per_game;
                    } else if (metricName === "yards per attempt") {
                        metric_value = yards_per_attempt;
                    } else if (metricName === "yards per carry") {
                        metric_value = yards_per_carry;
                    } else if (metricName === "yards per reception") {
                        metric_value = yards_per_reception;
                    } else if (metricName === "yards per target") {
                        metric_value = yards_per_target;
                    } else if (metricName === "catch rate") {
                        metric_value = catch_rate;
                    }

                    if (metric_value === "0.0" || metric_value === "NaN") {
                        metric_value = "0";
                    }

                    if (fantasy_points === "0.0") {
                        fantasy_points = "0";
                        half_ppr_points = "0";
                        ppr_points = "0";
                        fantasy_points_per_game = "0";
                        half_ppr_points_per_game = "0";
                        ppr_points_per_game = "0";
                    }
                    
                    session.attributes.metric_value = metric_value;
                    session.attributes.team = team;
                    session.attributes.position = position;
                    session.attributes.games_played = games_played;
                    session.attributes.did_not_play = did_not_play;
                    session.attributes.passing_attempts = passing_attempts;
                    session.attributes.completions = completions;
                    session.attributes.passing_yards = passing_yards;
                    session.attributes.passing_touchdowns = passing_touchdowns;
                    session.attributes.targets = targets;
                    session.attributes.receptions = receptions;
                    session.attributes.receiving_yards = receiving_yards;
                    session.attributes.receiving_touchdowns = receiving_touchdowns;
                    session.attributes.rushing_attempts = rushing_attempts;
                    session.attributes.rushing_yards = rushing_yards;
                    session.attributes.rushing_touchdowns = rushing_touchdowns;
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.half_ppr_points = half_ppr_points;
                    session.attributes.ppr_points = ppr_points;
                    session.attributes.fantasy_points_per_game = fantasy_points_per_game;

                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finished calling season stats");

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