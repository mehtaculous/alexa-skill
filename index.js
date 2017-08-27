'use strict';

var AlexaSkill = require('./AlexaSkill');

var APP_ID = 'amzn1.ask.skill.9b2ac00a-9c3e-458e-887a-ec28e96cdf56';

var trackEvent = require('./search/track_event');

var yahooSearch = require('./search/yahoo_search');

var scheduleSearch = require('./search/schedule_search');

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
            var speechText = "<speak>Please provide the name of a current NFL player who has played in at least one game, a valid metric correlating to that player's position, and the year of an NFL season ranging from two thousand and one through two thousand and seventeen. Providing a regular season week number, ranging from one through seventeen, is merely optional. You can say something like <break time=\"0.618s\"/> How many passing touchdowns did Tom Brady have in two thousand and seven?</speak>";

            var repromptText = "<speak>Here is the entire list of available metrics: Carries, Catch Rate, Completions, Completion Percentage, Fantasy Points, Fantasy Points Per Game, Fumbles, Game Log, Games Played, Half PPR Points, Half PPR Points Per Game, Interceptions, Passing Attempts, Passing Attempts Per Game, Passing Touchdowns, Passing Yards, Passing Yards Per Game, PPR Points, PPR Points Per Game, Receiving Touchdowns, Receiving Yards, Receiving Yards Per Game, Receptions, Receptions Per Game, Return Touchdowns, Rushing Attempts, Rushing Attempts Per Game, Rushing Touchdowns, Rushing Yards, Rushing Yards Per Game, Season Stats, Targets, Targets Per Game, Total Touchdowns, Two Point Conversions, Yards From Scrimmage, Yards From Scrimmage Per Game, Yards Per Attempt, Yards Per Carry, Yards Per Reception, Yards Per Target. <break time=\"0.618s\"/> Now, what can I help you with today?</speak>";

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
        repromptText = "You can say something like, Aaron Rodgers";
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
        repromptText = "You can say something like, fantasy points";
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
        repromptText = "You can say something like, two thousand and sixteen.";
    response.ask(speechOutput, repromptText);
}

exports.handler = function (event, context) {
    var skill = new FantasyMetrix();
    skill.execute(event, context);
};