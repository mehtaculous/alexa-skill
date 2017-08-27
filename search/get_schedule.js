'use strict';

var AlexaSkill = require('../AlexaSkill');

module.exports = function getScheduleRequest(intent, session, response) {
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
    console.log("Finish Schedule Request");

    if (seasonNumber === "2017") {
        if (opponent_abbr != "BYE") {
            if (away) {
                console.log("For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + opponent_city + ".");
                speechOutput = {
                    speech: "For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + opponent_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " @ " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                console.log("For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + team_city + ".");
                speechOutput = {
                    speech: "For " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " play the " + opponent_name + " in " + team_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " vs " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else {
            console.log("I'm sorry, but the " + teamName + " are on a BYE for " + weekNumber + " of the " + seasonNumber + " season.");
            speechOutput = {
                speech: "I'm sorry, but the " + teamName + " are on a BYE for " + weekNumber + " of the " + seasonNumber + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "BYE Week";
            cardContent = teamName + " are on a BYE for " + weekNumber + " of " + seasonNumber;
            response.tellWithCard(speechOutput, cardContent);
        }
    } else {
        if (opponent_abbr != "BYE") {
            if (away) {
                console.log("During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + opponent_city + ".");
                speechOutput = {
                    speech: "During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + opponent_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " @ " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            } else {
                console.log("During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + team_city + ".");
                speechOutput = {
                    speech: "During " + weekNumber + " of the " + seasonNumber + " season, the " + teamName + " played the " + opponent_name + " in " + team_city + ".",
                    type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                cardTitle = "schedule for the " + teamName + " in " + weekNumber + " of " + seasonNumber;
                cardContent = team_abbr + " vs " + opponent_abbr;
                response.tellWithCard(speechOutput, cardTitle, cardContent);
            }
        } else {
            console.log("I'm sorry, but the " + teamName + " were on a BYE during " + weekNumber + " of the " + seasonNumber + " season.");
            speechOutput = {
                speech: "I'm sorry, but the " + teamName + " were on a BYE during " + weekNumber + " of the " + seasonNumber + " season.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            cardTitle = "BYE Week";
            cardContent = teamName + " were on a BYE during " + weekNumber + " of " + seasonNumber;
            response.tellWithCard(speechOutput, cardContent);
        }
    }
};