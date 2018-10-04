'use strict';

var API = require('../api_keys');

var YahooFantasy = require('yahoo-fantasy');

var yf = new YahooFantasy(
    API.consumer_key,
    API.consumer_secret
);

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
    "twenty_seventeen": require('../schedules/2017'),
    "twenty_eighteen": require('../schedules/2018')
};

var trackEvent = require('./track_event');

var getMetricRequest = require('./get_metric');

module.exports = function yahooSearch(intent, session, response) {
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
        team;

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
                        did_not_play = data["stats"]["stats"][0]["value"];
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

                    console.log("Yahoo Week Search...");
                    console.log("Team: " + team);
                    console.log("Position: " + position);
                    console.log("Bye Week: " + bye_week);
                    console.log("Did Not Play: " + did_not_play);
                    console.log("Metric Value: " + metric_value);
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

                    completion_percentage = ((completions / passing_attempts) * 100).toFixed(1);
                    total_touchdowns = (passing_touchdowns + rushing_touchdowns + receiving_touchdowns + return_touchdowns);
                    yards_from_scrimmage = (rushing_yards + receiving_yards);
                    yards_per_attempt = (passing_yards / passing_attempts).toFixed(1);
                    yards_per_carry = (rushing_yards / rushing_attempts).toFixed(2);
                    yards_per_reception = (receiving_yards / receptions).toFixed(1);
                    yards_per_target = (receiving_yards / targets).toFixed(1);
                    catch_rate = ((receptions / targets) * 100).toFixed(1);

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
                    } else if (metricName === "completion percentage") {
                        metric_value = completion_percentage;
                    } else if (metricName === "total touchdowns") {
                        metric_value = total_touchdowns;
                    } else if (metricName === "yards from scrimmage") {
                        metric_value = JSON.stringify(yards_from_scrimmage);
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
                    session.attributes.interceptions = interceptions;
                    session.attributes.targets = targets;
                    session.attributes.receptions = receptions;
                    session.attributes.receiving_yards = receiving_yards;
                    session.attributes.receiving_touchdowns = receiving_touchdowns;
                    session.attributes.rushing_attempts = rushing_attempts;
                    session.attributes.rushing_yards = rushing_yards;
                    session.attributes.rushing_touchdowns = rushing_touchdowns;
                    session.attributes.yards_from_scrimmage = JSON.stringify(yards_from_scrimmage);
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.half_ppr_points = half_ppr_points;
                    session.attributes.ppr_points = ppr_points;

                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finish Yahoo Week Search");

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
                        did_not_play = data["stats"]["stats"][0]["value"];
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

                    console.log("Yahoo Season Search...");
                    console.log("Team: " + team);
                    console.log("Position: " + position);
                    console.log("Games Played: " + games_played);
                    console.log("Did Not Play: " + did_not_play);
                    console.log("Metric Value: " + metric_value);
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

                    completion_percentage = ((completions / passing_attempts) * 100).toFixed(1);
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
                    catch_rate = ((receptions / targets) * 100).toFixed(1);

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
                        metric_value = JSON.stringify(yards_from_scrimmage);
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
                    session.attributes.interceptions = interceptions;
                    session.attributes.targets = targets;
                    session.attributes.receptions = receptions;
                    session.attributes.receiving_yards = receiving_yards;
                    session.attributes.receiving_touchdowns = receiving_touchdowns;
                    session.attributes.rushing_attempts = rushing_attempts;
                    session.attributes.rushing_yards = rushing_yards;
                    session.attributes.rushing_touchdowns = rushing_touchdowns;
                    session.attributes.yards_from_scrimmage = JSON.stringify(yards_from_scrimmage);
                    session.attributes.fantasy_points = fantasy_points;
                    session.attributes.half_ppr_points = half_ppr_points;
                    session.attributes.ppr_points = ppr_points;
                    session.attributes.fantasy_points_per_game = fantasy_points_per_game;

                    console.log("Player Key: " + player_key);
                    console.log("Metric Value: " + metric_value);
                    console.log("Finish Yahoo Season Search");

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
};
