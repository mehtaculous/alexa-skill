var request = require('request');

var GA_TRACKING_ID = 'UA-81123913-1';

module.exports = function trackEvent(category, action, label, value, callbback) {
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
};