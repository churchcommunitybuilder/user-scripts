// ==UserScript==
// @name         New Relic Insights Toolbar
// @namespace    http://newrelic.com/
// @version      1.1.0
// @description  Adds a toolbar to the new relic insights component
// @author       Jay Kappel
// @include      https://insights.newrelic.com/*
// @grant        Feel free to do whatever you want with this
// ==/UserScript==

// TODO: add support for more since / until formats!

(function() {
    const $ = jQuery;
    let queryObject;
    let contentArea, runQueryButton;

    const nrqlTokens = [
        'SELECT', 'FROM', 'WHERE', 'FACET', 'LIMIT', 'SINCE', 'UNTIL', 'COMPARE WITH', 'WITH TIMESERIES', 'TIMESERIES', 'AUTO',
    ];

  $(`
  <style>
    .query_editor_box { min-height: 65px; }
    .insights_toolbar { position:absolute; bottom: -32px; right: 3px; user-select: none; }
    .insights_toolbar .group { border-radius: 4px; background-color: black; padding: 2px; display: inline-block; margin-left: 3px; }
    .insights_toolbar .group .title { font-size: 8px; margin-bottom: 3px; text-align: center; color: white; }
    .insights_toolbar .btn-primary { display: inline-block; margin: 2px; padding: 4px 10px; cursor: pointer; border-radius: 1px; }
    .insights_toolbar .disabled { opacity: 0.7; cursor: default; }
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

        //let query = getSearchParam('query');
        let query = getQueryText();
        if (!query) return queryObject;

        do {
            const parts = query.match(/(?:[^\s']+|'[^']*')+/g);
            const nextTokenIndex = findNextTokenIndex(parts, 1);
            const values = [];

            for (let c = 1; c < nextTokenIndex; c++) {
                values.push(parts[c]);
            }

            queryObject[parts[0].toUpperCase()] = values.join(' ');
            parts.splice(0, nextTokenIndex);
            query = parts.join(' ');

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

    const findNextTokenIndex = (parts, index) => {
        for (let c = index; c < parts.length; c++) {
            if (nrqlTokens.includes(parts[c].toUpperCase())) return c;
        }
        return parts.length;
    };

    const getQueryValue = section => {
        buildQueryObject();
        return propOr('', section.toUpperCase(), queryObject);
    };

    const clearQueryValue = section => {
        buildQueryObject();
        delete queryObject[section.toUpperCase()];
    };

    const setQueryValue = (section, value) => {
        section = section.toUpperCase();
        if (!value) return clearQueryValue(section);

        if (nrqlTokens.includes(section)) {
            buildQueryObject();
            queryObject[section] = value;
        };
    };

    const getTimespan = () => {
        let since = getQueryValue('SINCE');
        let until = getQueryValue('UNTIL');
        if (!since || !until) return null;

        const timespan = {
            since,
            until,
            momentSince: moment(since),
            momentUntil: moment(until),
        };
        timespan.difference = timespan.momentUntil.diff(timespan.momentSince, 'seconds');
        return timespan;
    };

    const actionCurrentTimespan = () => {
        const since = moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
        const until = moment().format('YYYY-MM-DD HH:mm:ss');
        setQueryValue('SINCE', `'${since}'`);
        setQueryValue('UNTIL', `'${until}'`);
        executeQuery();
    };

    const actionNextTimespan = () => {
        const timespan = getTimespan();
        if (!timespan) return;

        const since = timespan.momentSince.add(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        const until = timespan.momentUntil.add(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        setQueryValue('SINCE', `'${since}'`);
        setQueryValue('UNTIL', `'${until}'`);
        executeQuery();
    };

    const actionPreviousTimespan = () => {
        const timespan = getTimespan();
        if (!timespan) return;

        const since = timespan.momentSince.subtract(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        const until = timespan.momentUntil.subtract(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
        setQueryValue('SINCE', `'${since}'`);
        setQueryValue('UNTIL', `'${until}'`);
        executeQuery();
    };

    const actionSetMaxTimeSeries = () => {
        const timespan = getTimespan();
        if (!timespan) return;

        const max = Math.ceil(timespan.difference / 60 / 366);
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
        const timespan = getTimespan();
        const timeGroup = makeGroup('Time');
        const hasTimeParts = timespan !== null && timespan.since && timespan.until;

        timeGroup.append(makeButton('&lt;', actionPreviousTimespan, hasTimeParts));
        timeGroup.append(makeButton('&gt;', actionNextTimespan, hasTimeParts));
        timeGroup.append(makeButton('Now', actionCurrentTimespan));
        timeGroup.append(makeButton('Ts', actionSetMaxTimeSeries, hasTimeParts));
        return timeGroup;
    };

    const renderGraphGroup = () => {
        const graphGroup = makeGroup('Graph');
        const hasCount = getQueryValue('SELECT') === 'count(*)';
        const priorFacet = getSearchParam('priorFacet');
        const priorTimeSeries = getSearchParam('priorTimeSeries');

        graphGroup.append(makeButton('-', () => actionPrepForGraph(false), hasCount));
        graphGroup.append(makeButton('+', () => actionPrepForGraph(true), !hasCount && (priorFacet || priorTimeSeries)));
        return graphGroup;
    };

    const processContent = () => {
        let toolbar = $('.insights_toolbar');

        if (toolbar.length === 0) {
            toolbar = $('<div class="insights_toolbar" />');
            $('.query_editor_box').prepend(toolbar);
        }

        toolbar.empty();
        toolbar.append(renderTimeGroup);
        toolbar.append(renderGraphGroup);
    };

    const initInsightsToolbar = () => {
        runQueryButton = $('.query_editor_controls .btn-primary');
        if (runQueryButton.length && !runQueryButton.hasClass('InsightsToolbar')) {
            runQueryButton.addClass('InsightsToolbar');
            runQueryButton.click(processContent);

            $('.ace_content').bind('DOMSubtreeModified', () => {
                queryObject = null;
                processContent();
            });
            console.log('Insights Toolbar Ready');
        }

        window.setTimeout(initInsightsToolbar, 1000);
    };

    $.getScript('https://momentjs.com/downloads/moment.min.js', initInsightsToolbar)
  })();
