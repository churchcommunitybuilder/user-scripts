// ==UserScript==
// @name         New Relic Insights Toolbar
// @namespace    http://newrelic.com/
// @version      0.1
// @description  Adds a toolbar to the new relic insights component
// @author       Jay Kappel
// @include      https://insights.newrelic.com/*
// @grant        Feel free to do whatever you want with this
// ==/UserScript==

(function() {
    const $ = jQuery;
    let contentArea, query, runQueryButton;

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

    const getSearchParam = param => {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    };

    const executeQuery = props => {
        const params = new URLSearchParams(window.location.search);
        params.set('query', query);

        for(var key in props) {
            if(props.hasOwnProperty(key) && typeof props[key] !== 'function') {
                props[key] ? params.set(key, props[key]) : params.delete(key);
            }
        }

        window.location.search = params.toString();
    }

    const getQueryValue = section => {
        section = section.toUpperCase();
        const parts = query.match(/(?:[^\s']+|'[^']*')+/g) ;
        let index = parts.findIndex(part => part.toUpperCase() === section);
        if (index < 1 && index !== 0) return null;
        let value = '';

        switch (section) {
            case 'SINCE':
            case 'UNTIL':
            case 'FACET':
                value = parts[++index];
                while (value.lastIndexOf(',') === value.length -1) {
                    value += ' ' + parts[++index];
                }
                break;
            case 'TIMESERIES':
                value = parts[++index] + ' ' + parts[++index];
                break;
        };

        return value.replace(/'/g, '');;
    };

    const setQueryValue = (section, value) => {
        section = section.toUpperCase();
        const parts = query.match(/(?:[^\s']+|'[^']*')+/g) ;
        const index = parts.findIndex(part => part.toUpperCase() === section);

        if (index < 0) {
            parts.push(section);
            parts.push(value);
        } else {
            switch (section) {
                case 'SINCE':
                case 'UNTIL':
                case 'FACET':
                    parts[index + 1] = value;
                    break;
                case 'TIMESERIES':
                    parts[index + 1] = value.split(' ')[0];
                    parts[index + 2] = value.split(' ')[1];
                    break;
            }
        }

        query = parts.join(' ');
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
            query = query.replace(/ \* /,' count(*) ');

            const priorFacet = getSearchParam('priorFacet');
            const priorTimeSeries = getSearchParam('priorTimeSeries');
            if (priorFacet) query += ' FACET ' + priorFacet;
            if (priorTimeSeries) query += ' TIMESERIES ' + priorTimeSeries;
        } else {
            params = {
                priorFacet: getQueryValue('FACET'),
                priorTimeSeries: getQueryValue('TIMESERIES')
            };

            query = query.replace(/ count\(\*\) /,' * ');
            query = query.replace(new RegExp(` FACET ${params.priorFacet}`, "ig"), '');
            query = query.replace(new RegExp(` TIMESERIES ${params.priorTimeSeries}`, "ig"), '');
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
        const hasCount = query.indexOf('count(*)') > 0;
        const priorFacet = getSearchParam('priorFacet');
        const priorTimeSeries = getSearchParam('priorTimeSeries');

        graphGroup.append(makeButton('-', () => actionPrepForGraph(false), hasCount));
        graphGroup.append(makeButton('+', () => actionPrepForGraph(true), !hasCount && (priorFacet || priorTimeSeries)));
        return graphGroup;
    };

    const processUpdatedContent = () => {
        query = (new URLSearchParams(window.location.search)).get('query');
        let toolbar = $('.insights_toolbar');

        if (toolbar.length === 0) {
            toolbar = $('<div class="insights_toolbar" />');
            $('.query_editor_box').prepend(toolbar);
        }

        toolbar.empty();
        toolbar.append(renderTimeGroup);
        toolbar.append(renderGraphGroup);
    };

    const initTimeWalker = () => {
        runQueryButton = $('.query_editor_controls .btn-primary');
        if (runQueryButton.length) {
            runQueryButton.click(processUpdatedContent);
            processUpdatedContent();
        }
    };

    $.getScript('https://momentjs.com/downloads/moment.min.js', initTimeWalker)
  })();
