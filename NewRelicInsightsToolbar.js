// ==UserScript==
// @name         New Relic Insights Toolbar
// @namespace    http://newrelic.com/
// @version      1.1.0
// @description  Adds a toolbar to the new relic insights component
// @author       Jay Kappel
// @include      https://insights.newrelic.com/*
// @grant        Feel free to do whatever you want with this
// ==/UserScript==

(function() {
    const $ = jQuery;
    const standardDateFormat = 'YYYY-MM-DD HH:mm:ss';
    const nrqlTokens = [
        'SELECT', 'FROM', 'WHERE', 'FACET', 'LIMIT', 'COMPARE WITH', 'SINCE', 'UNTIL', 'TIMESERIES', 'WITH TIMEZONE', 'AUTO',
    ];

    let queryObject;

    $(`
        <style>
            .query_editor_box { min-height: 65px; }
            .insights_toolbar { position:absolute; bottom: -32px; right: 3px; user-select: none; }
            .insights_toolbar .group { border-radius: 4px; background-color: black; padding: 2px; display: inline-block; margin-left: 3px; }
            .insights_toolbar .group .title { font-size: 8px; margin-bottom: 3px; text-align: center; color: white; }
            .insights_toolbar .btn-primary { display: inline-block; margin: 2px; padding: 4px 10px; cursor: pointer; border-radius: 1px; height: 27px; min-width: 27px; }
            .insights_toolbar .disabled { opacity: 0.7; cursor: default; }
            .insights_toolbar .data_icon { background: url(https://1tskcg39n5iu1jl9xp2ze2ma-wpengine.netdna-ssl.com/wp-content/themes/spanning/images/icons/white/SPAN_WH_Icon_Whitepaper.png);
                                        background-color: #5F86CC; background-repeat: no-repeat; background-size: 19px 19px; background-position: 4px 4px; }
            .insights_toolbar .graph_icon { background: url(https://www.clearpeach.com/wp-content/uploads/bar-graph-icon-300x300.png);
                                            background-color: #5F86CC; background-repeat: no-repeat; background-size: 19px 19px; background-position: 4px 4px; }
        </style>
    `).appendTo('head');

    const propOr = (defaultValue, prop, obj) => {
        return (obj || {}).hasOwnProperty(prop) ? obj[prop] : defaultValue;
    };

    const getSearchParam = param => {
        const params = new URLSearchParams(window.location.search);
        return params.get(param) || '';
    };

    const executeQuery = props => {
        const params = new URLSearchParams(window.location.search);
        params.set('query', queryObject.toString());

        for(var key in props) {
            if (props.hasOwnProperty(key) && typeof props[key] !== 'function') {
                props[key] ? params.set(key, props[key]) : params.delete(key);
            }
        }

        window.location.search = params.toString();
    }

    const getQueryText = () => {
        let text = [];
        $('.ace_line span').each(function() {
            text.push(this.innerText);
        });
        return text.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')').replace(' (*)', '(*)');
    };

    const buildQueryObject = () => {
        if (queryObject) return queryObject;
        queryObject = {};

        let query = getQueryText();
        if (!query) return queryObject;

        do {
            const token = findNextToken(query);
            query = query.slice(token.name.length).trim();

            const nextToken = findNextToken(query);
            queryObject[token.name] = query.slice(0, nextToken.index).trim();
            query = query.slice(nextToken.index).trim();
        } while (query.length > 0);

        queryObject.toString = () => {
            let queryParts = [];
            for(var key in queryObject) {
                if (queryObject.hasOwnProperty(key) && typeof queryObject[key] !== 'function') {
                    queryParts.push(key);
                    queryParts.push(queryObject[key]);
                }
            }
            return queryParts.join(' ');
        };

        return queryObject;
    };

    const findNextToken = query => {
        const token = {
            index: 1000,
            name: '',
        };

        nrqlTokens.forEach(name => {
            const idx = query.toUpperCase().indexOf(name);
            if (idx >= 0 && idx < token.index) {
                token.index = idx;
                token.name = name;
            }
        });
        return token.name ? token : { index: query.length };
    };

    const clearQueryValue = section => {
        buildQueryObject();
        delete queryObject[section.toUpperCase()];
    };

    const getQueryValue = section => {
        buildQueryObject();
        return propOr('', section.toUpperCase(), queryObject);
    };

    const setQueryValue = (section, value) => {
        section = section.toUpperCase();
        if (!value) return clearQueryValue(section);

        if (nrqlTokens.includes(section)) {
            buildQueryObject();
            queryObject[section] = value;
        };
    };

    const calcSecondsToUnits = seconds => {
        let unit = Math.abs(seconds);
        let modifier = seconds < 0 ? -1 : 1;

        if (unit < 60) return [unit * modifier, 'seconds'];

        unit /= 60;
        if (unit < 24) return [unit * modifier, 'minutes'];

        unit /= 60;
        if (unit < 24) return [unit * modifier, 'hours'];

        unit /= 24;
        if (unit < 7) return [unit * modifier, 'days'];

        unit /= 7;
        if (unit <= 52) return [unit * modifier, 'weeks'];

        unit /= 52;
        return [unit * modifier, 'years'];
    };

    const processTimeString = timeString => {
        if (!timeString) return null;
        const parts = timeString.toLowerCase().split(' ');
        const time = {};

        switch (parts.length) {
            case 3: // Format example: 1 day ago
                time.ago = timeString;
                if (parts[1].indexOf('s') != parts[1].length -1) parts[1] += 's';
                time.date = moment().subtract(parts[0], parts[1]).format(standardDateFormat)
                break;

            default: // Format example: 2020-01-01 15:30:00
                time.date = timeString;
                const seconds = moment(timeString).diff(moment(), 'seconds');
                const unit = calcSecondsToUnits(seconds);
                time.ago = `${unit[0]} ${unit[1]} ago`;
                break;
        }
        return time;
    };

    const getTimespan = () => {
        const timeSpan = {
            since: getQueryValue('SINCE').replace(/'/g, "").toLowerCase(),
            until: getQueryValue('UNTIL').replace(/'/g, "").toLowerCase(),
            current: () => {
                setQueryValue('TIMESERIES', '4 minutes');
                setQueryValue('SINCE', '1 day ago');
                clearQueryValue('UNTIL');
                executeQuery();
            },
        };
        if (!timeSpan.since) return null;

        timeSpan.sinceObj = processTimeString(timeSpan.since);
        timeSpan.untilObj = processTimeString(timeSpan.until);
        const sinceParts = timeSpan.since.split(' ');
        const momentSince = moment(timeSpan.sinceObj.date);

        if (!timeSpan.until) {
            timeSpan.next = null;
            timeSpan.difference = momentSince.diff(moment(), 'seconds');

            switch (sinceParts.length) {
                case 3:
                    timeSpan.prev = function() {
                        setQueryValue('UNTIL', timeSpan.since);
                        sinceParts[0] *= 2;
                        if (sinceParts[1].lastIndexOf('s') != sinceParts[1].length -1) sinceParts[1] += 's';
                        setQueryValue('SINCE', sinceParts.join(' '));
                        executeQuery();
                    };
                    break;
                default:
                    timeSpan.prev = () => {
                        setQueryValue('UNTIL', `'${timeSpan.since}'`);
                        const momentSince = moment(timeSpan.sinceObj.date);
                        const diff = momentSince.diff(moment(), 'seconds');
                        setQueryValue('SINCE', `'${momentSince.add(diff, 'seconds').format(standardDateFormat)}'`);
                    };
                    break;
            }
        } else {
            const untilParts = timeSpan.until.split(' ');
            const momentUntil = moment(timeSpan.untilObj.date);
            timeSpan.difference = momentSince.diff(momentUntil, 'seconds');
            const diffUnits = calcSecondsToUnits(timeSpan.difference);

            if (sinceParts.length === 3 && sinceParts[1].replace(/s/g,"") === untilParts[1].replace(/s/g,"")) {
                timeSpan.prev = function() {
                    setQueryValue('UNTIL', timeSpan.since);
                    sinceParts[0] = parseInt(sinceParts[0], 10) - diffUnits[0];
                    setQueryValue('SINCE', sinceParts.join(' '));
                    executeQuery();
                };
                timeSpan.next = function() {
                    setQueryValue('SINCE', timeSpan.until);
                    sinceParts[0] = parseInt(sinceParts[0], 10) + (diffUnits[0] * 2);
                    setQueryValue('UNTIL', sinceParts.join(' '));
                    executeQuery();
                };
            } else {
                timeSpan.prev = () => {
                    setQueryValue('SINCE', `'${momentSince.add(diffUnits[0], diffUnits[1]).format(standardDateFormat)}'`);
                    setQueryValue('UNTIL', `'${momentUntil.add(diffUnits[0], diffUnits[1]).format(standardDateFormat)}'`);
                    executeQuery();
                };
                timeSpan.next = () => {
                    setQueryValue('SINCE', `'${momentSince.subtract(diffUnits[0], diffUnits[1]).format(standardDateFormat)}'`);
                    setQueryValue('UNTIL', `'${momentUntil.subtract(diffUnits[0], diffUnits[1]).format(standardDateFormat)}'`);
                    executeQuery();
                };
            }
        }

        return timeSpan;
    };

    const actionSetMaxTimeSeries = () => {
        const timespan = getTimespan();
        if (!timespan) return;

        const max = Math.ceil(Math.abs(timespan.difference) / 60 / 366);
        setQueryValue('TIMESERIES', `${max} minutes`);
        executeQuery();
    };

    const actionPrepForGraph = showGraph => {
        let params = { priorFacet: null, priorTimeSeries: null };

        if (showGraph) {
            setQueryValue('SELECT', 'count(*)');

            const priorFacet = getSearchParam('priorFacet');
            const priorTimeSeries = getSearchParam('priorTimeSeries');
            if (priorFacet) setQueryValue('FACET', priorFacet);
            if (priorTimeSeries) setQueryValue('TIMESERIES', priorTimeSeries);
        } else {
            params = {
                priorFacet: getQueryValue('FACET'),
                priorTimeSeries: getQueryValue('TIMESERIES')
            };

            setQueryValue('SELECT', '*');
            clearQueryValue('TIMESERIES');
            clearQueryValue('FACET');
        }

        executeQuery(params);
    };

    const makeGroup = text => {
        return $(`<div id="itg-${text}" class="group"><div class="title">${text}</div></div>`);
    };

    const makeButton = (text, onClick, enabled = true) => {
        const button = $(`<span class="btn-primary">${text}</span>`);
        button.click(enabled && onClick ? onClick : () => null);
        if (!enabled) button.addClass('disabled');
        return button;
    };

    const renderTimeGroup = () => {
        const timeSpan = getTimespan();
        const group = makeGroup('Time');
        const hasTimeParts = timeSpan !== null;
        const nullFunc = () => console.log(timeSpan);

        group.append(makeButton('&lt;', propOr(nullFunc, 'prev', timeSpan), hasTimeParts));
        group.append(makeButton('&gt;', propOr(nullFunc, 'next', timeSpan), hasTimeParts));
        group.append(makeButton('Now', propOr(nullFunc, 'current', timeSpan)));
        group.append(makeButton('Ts', actionSetMaxTimeSeries, hasTimeParts));
        return group;
    };

    const renderDataGroup = () => {
        const group = makeGroup('Data');
        const hasCount = getQueryValue('SELECT') === 'count(*)';
        const priorFacet = getSearchParam('priorFacet');
        const priorTimeSeries = getSearchParam('priorTimeSeries');

        if (hasCount) {
            group.append(makeButton('&nbsp;', () => actionPrepForGraph(false), hasCount).addClass('data_icon'));
        } else {
            group.append(makeButton('&nbsp;', () => actionPrepForGraph(true), !hasCount && (priorFacet || priorTimeSeries)).addClass('graph_icon'));
        }
        return group;
    };

    const renderToolbar = () => {
        let toolbar = $('.insights_toolbar');

        if (toolbar.length === 0) {
            toolbar = $('<div class="insights_toolbar" />');
            $('.query_editor_box').prepend(toolbar);
        }

        toolbar.empty();
        toolbar.append(renderTimeGroup());
        toolbar.append(renderDataGroup());
    };

    const initInsightsToolbar = () => {
        const runQueryButton = $('.query_editor_controls .btn-primary');
        if (runQueryButton.length && !runQueryButton.hasClass('InsightsToolbar')) {
            runQueryButton.addClass('InsightsToolbar');
            runQueryButton.click(renderToolbar);
        }

        const content = $('.ace_content');
        if (content.length && !content.hasClass('InsightsToolbar')) {
            content.bind('DOMSubtreeModified', () => {
                queryObject = null;
                buildQueryObject();
                renderToolbar();
            }).addClass('InsightsToolbar');
        }

        window.setTimeout(initInsightsToolbar, 1000);
    };

    $.getScript('https://momentjs.com/downloads/moment.min.js', initInsightsToolbar);
  })();
