'use strict';

var AlexaSkill = require('../AlexaSkill');

var Keys = require('../data_keys');

var pluralize = require('pluralize');

module.exports = function getMetricRequest(intent, session, response) {
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
        interceptions = session.attributes.interceptions,
        targets = session.attributes.targets,
        receptions = session.attributes.receptions,
        receiving_yards = session.attributes.receiving_yards,
        receiving_touchdowns = session.attributes.receiving_touchdowns,
        rushing_attempts = session.attributes.rushing_attempts,
        rushing_yards = session.attributes.rushing_yards,
        rushing_touchdowns = session.attributes.rushing_touchdowns,
        yards_from_scrimmage = session.attributes.yards_from_scrimmage,
        fantasy_points = session.attributes.fantasy_points,
        half_ppr_points = session.attributes.half_ppr_points,
        ppr_points = session.attributes.ppr_points,
        fantasy_points_per_game = session.attributes.fantasy_points_per_game,
        speechOutput,
        cardTitle,
        cardContent;

    if (parseFloat(metric_value) > 0 && parseFloat(metric_value) <= 1) {
        metric = metric.slice(0, -1);
    }

    console.log("Get Metric Request...");
    console.log("Player: " + player);
    console.log("Metric: " + metric);
    console.log("Season: " + season);
    console.log("Week: " + week);
    console.log("Week Value: " + week_value);
    console.log("Team: " + team);
    console.log("Position: " + position);
    console.log("Games Played: " + games_played);
    console.log("Did Not Play: " + did_not_play + " - Object: " + typeof(did_not_play));
    console.log("Metric Value: " + metric_value + " - Object: " + typeof(metric_value));
    console.log("Passing Attempts: " + passing_attempts);
    console.log("Completions: " + completions);
    console.log("Passing Yards: " + passing_yards);
    console.log("Passing Touchdowns: " + passing_touchdowns);
    console.log("Interceptions: " + interceptions);
    console.log("Targets: " + targets);
    console.log("Receptions: " + receptions);
    console.log("Receiving Yards: " + receiving_yards);
    console.log("Receiving Touchdowns: " + receiving_touchdowns);
    console.log("Rushing Attempts: " + rushing_attempts);
    console.log("Rushing Yards: " + rushing_yards);
    console.log("Rushing Touchdowns: " + rushing_touchdowns);
    console.log("Yards From Scrimmage: " + yards_from_scrimmage);
    console.log("Fantasy Points: " + fantasy_points);
    console.log("Half PPR Points: " + half_ppr_points);
    console.log("PPR Points: " + ppr_points);
    console.log("Fantasy Points Per Game: " + fantasy_points_per_game);
    console.log("Finish Metric Request");

    if (Keys[player] && (2000 < parseInt(season) < 2018) && Keys[week] && (did_not_play === 0)) {
        console.log("I'm sorry, but " + player + " did not play in " + week + " of the " + season + " season.");
        speechOutput = {
            speech: "I'm sorry, but " + player + " did not play in " + week + " of the " + season + " season.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        cardContent = player + " did not play in " + week + " of " + season;
        response.tellWithCard(speechOutput, cardContent);
    } else if (Keys[player] && (2000 < parseInt(season) < 2018) && (did_not_play === 0)) {
        console.log("I'm sorry, but " + player + " did not play in a single game during the " + season + " season.");
        speechOutput = {
            speech: "I'm sorry, but " + player + " did not play in a single game during the " + season + " season.",
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        cardContent = player + " did not play in a single game during the " + season + " season";
        response.tellWithCard(speechOutput, cardContent);
    } else if (metric === "game log" || metric === "season stats") {
        if ((metric === "season stats") && Keys[week]) {
            console.log("I'm sorry, but " + metric + " is not a valid request when providing a week number.");
            speechOutput = {
                speech: "I'm sorry, but " + metric + " is not a valid request when providing a week number.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = metric + " is not a valid request when providing a week number";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if ((metric === "game log") && (week === undefined)) {
            console.log("I'm sorry, but " + metric + " is not a valid request if no week number is provided.");
            speechOutput = {
                speech: "I'm sorry, but " + metric + " is not a valid request if no week number is provided.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = metric + " is not a valid request if no week number is provided";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (position === "QB") {
            if (Keys[week] && (metric === "game log")) {
                console.log("During " + week + " of the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, and " + interceptions + " interceptions, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points.");
                speechOutput = {
                    speech: "During " + week + " of the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, and " + interceptions + " interceptions, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "game log for " + player + " in " + week + " of " + season;
                cardContent = completions + " completions, " + passing_attempts + " passing attempts, " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, " + interceptions + " interceptions, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + fantasy_points + " fantasy points";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else if (metric === "season stats") {
                console.log("During the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, and " + interceptions + " interceptions, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.");
                speechOutput = {
                    speech: "During the " + season + " season, " + player + " had " + completions + " completions, on " + passing_attempts + " passing attempts, for " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, and " + interceptions + " interceptions, along with " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "season stats for " + player + " in " + season;
                cardContent = completions + " completions, " + passing_attempts + " passing attempts, " + passing_yards + " passing yards, " + passing_touchdowns + " passing touchdowns, " + interceptions + " interceptions, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else if (position === "RB") {
            if (Keys[week] && (metric === "game log")) {
                console.log("During " + week + " of the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.");
                speechOutput = {
                    speech: "During " + week + " of the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "game log for " + player + " in " + week + " of " + season;
                cardContent = rushing_attempts + " rushing attempts, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else if (metric === "season stats") {
                console.log("During the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.");
                speechOutput = {
                    speech: "During the " + season + " season, " + player + " had " + rushing_attempts + " rushing attempts, for " + rushing_yards + " rushing yards, and " + rushing_touchdowns + " rushing touchdowns, along with " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + "  total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "season stats for " + player + " in " + season;
                cardContent = rushing_attempts + " rushing attempts, " + rushing_yards + " rushing yards, " + rushing_touchdowns + " rushing touchdowns, " + receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else if (position === "WR" || position === "TE") {
            if (2000 < parseInt(season) < 2014) {
                if (Keys[week] && (metric === "game log")) {
                    console.log("During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.");
                    speechOutput = {
                        speech: "During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };
                    cardTitle = "game log for " + player + " in " + week + " of " + season;
                    cardContent = receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                } else if (metric === "season stats") {
                    console.log("During the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.");
                    speechOutput = {
                        speech: "During the " + season + " season, " + player + " had " + receptions + " receptions, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };
                    cardTitle = "season stats for " + player + " in " + season;
                    cardContent = receptions + " receptions, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                }
            } else {
                if (Keys[week] && (metric === "game log")) {
                    console.log("During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.");
                    speechOutput = {
                        speech: "During " + week + " of the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " fantasy points, and " + ppr_points + " ppr points.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };
                    cardTitle = "game log for " + player + " in " + week + " of " + season;
                    cardContent = receptions + " receptions, " + targets + " targets, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + ppr_points + " ppr points";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                } else if (metric === "season stats") {
                    console.log("During the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.");
                    speechOutput = {
                        speech: "During the " + season + " season, " + player + " had " + receptions + " receptions, on " + targets + " targets, for " + receiving_yards + " receiving yards, and " + receiving_touchdowns + " receiving touchdowns, to finish with " + fantasy_points + " total fantasy points, and " + fantasy_points_per_game + " fantasy points per game.",
                        type: AlexaSkill.speechOutputType.PLAIN_TEXT
                    };
                    cardTitle = "season stats for " + player + " in " + season;
                    cardContent = receptions + " receptions, " + targets + " targets, " + receiving_yards + " receiving yards, " + receiving_touchdowns + " receiving touchdowns, " + fantasy_points + " fantasy points, " + fantasy_points_per_game + " fantasy points per game";
                    response.tellWithCard(speechOutput, cardTitle, cardContent);
                }
            }
        } else {
            console.log("I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.");
            speechOutput = {
                speech: "I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "the information you have provided is invalid";
            cardContent = "please check the voice feedback to see what alexa heard";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    } else {
        if ((metric === "targets" || metric === "yards per target" || metric === "targets per game" || metric === "catch rate") && (2000 < parseInt(season) < 2014)) {
            console.log("I'm sorry, but target metrics are only available for players beginning from the 2014 season.");
            speechOutput = {
                speech: "I'm sorry, but target metrics are only available for players beginning from the 2014 season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = "target metrics are only available for players beginning from the 2014 season";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if ((metric === "fantasy points per game" || metric === "half ppr points per game" || metric === "ppr points per game" || metric === "passing yards per game" || metric === "rushing yards per game" || metric === "receiving yards per game" || metric === "receptions per game" || metric === "targets per game" || metric === "games played") && Keys[player] && Keys[season] && Keys[week]) {
            console.log("I'm sorry, but " + metric + " is not a valid metric when providing a week number.");
            speechOutput = {
                speech: "I'm sorry, but " + metric + " is not a valid metric when providing a week number.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "not a valid request";
            cardContent = metric + " is not a valid request when providing a week number";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (metric === "games played" && metric_value) {
            console.log("During the " + season + " season, " + player + " played in " + games_played + " games.");
            speechOutput = {
                speech: "During the " + season + " season, " + player + " played in " + games_played + " games.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if ((metric === "catch rate" || metric === "completion percentage") && Keys[week] && metric_value) {
            console.log("During " + week + " of the " + season + " season, " + player + " had a " + metric_value + "% " + metric + ".");
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had a " + metric_value + "% " + metric + ".",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of " + season;
            cardContent = metric_value + "% " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if ((metric === "catch rate" || metric === "completion percentage") && metric_value) {
            console.log("During the " + season + " season, " + player + " had a " + metric_value + "% " + metric + ".");
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had a " + metric_value + "% " + metric + ".",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + "% " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[metric] && Keys[season] && Keys[week] && metric_value) {
            console.log("During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric + ".");
            speechOutput = {
                speech: "During " + week + " of the " + season + " season, " + player + " had " + metric_value + " " + metric + ".",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " during " + week + " of " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else if (Keys[player] && Keys[metric] && Keys[season] && metric_value) {
            console.log("During the " + season + " season, " + player + " had " + metric_value + " " + metric + ".");
            speechOutput = {
                speech: "During the " + season + " season, " + player + " had " + metric_value + " " + metric + ".",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = metric + " for " + player + " in " + season;
            cardContent = metric_value + " " + metric;
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        } else {
            console.log("I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.");
            speechOutput = {
                speech: "I'm sorry, but the information you have provided is invalid. Please check the Voice Feedback in the Alexa App to make sure I heard you correctly.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "the information you have provided is invalid";
            cardContent = "please check the voice feedback in the alexa app to see what I heard";
            response.tellWithCard(speechOutput, cardTitle, cardContent);
        }
    }
};