'use strict';

var Keys = require('../data_keys');

var Teams = require('../teams');

var Schedules = {
    "twenty_two": require('../schedules/2002'),
    "twenty_three": require('../schedules/2003'),
    "twenty_four": require('../schedules/2004'),
    "twenty_five": require('../schedules/2005'),
    "twenty_six": require('../schedules/2006'),
    "twenty_seven": require('../schedules/2007'),
    "twenty_eight": require('../schedules/2008'),
    "twenty_nine": require('../schedules/2009'),
    "twenty_ten": require('../schedules/2010'),
    "twenty_eleven": require('../schedules/2011'),
    "twenty_twelve": require('../schedules/2012'),
    "twenty_thirteen": require('../schedules/2013'),
    "twenty_fourteen": require('../schedules/2014'),
    "twenty_fifteen": require('../schedules/2015'),
    "twenty_sixteen": require('../schedules/2016'),
    "twenty_seventeen": require('../schedules/2017')
};

var trackEvent = require('./track_event');

var getScheduleRequest = require('./get_schedule');

module.exports = function scheduleSearch(intent, session, response) {
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
    console.log("Finish Schedule Search");

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
};