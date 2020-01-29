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
  .insights_toolbar { position:absolute; top: -48px; right: 0px; }
  .insights_toolbar .group { border-radius: 4px; background-color: black; padding: 2px; }
  .insights_toolbar .group .title { font-size: 8px; margin-bottom: 3px; text-align: center; color: white; }
  .insights_toolbar .btn-primary { display: inline-block; margin: 2px; padding: 3px 6px; cursor: pointer; border-radius: 1px }
</style>
`).appendTo('head');

  const executeQuery = () => {
      const params = new URLSearchParams(window.location.search);
      params.set('query', query);
      window.location.search = params.toString();
  }

  const getQueryValue = section => {
      const parts = query.match(/(?:[^\s']+|'[^']*')+/g) ;
      const index = parts.findIndex(part => part.toLowerCase() === section.toLowerCase());
      if (!index && index !== 0) return null;
      let value = '';

      switch (section) {
          case 'since':
          case 'until':
          case 'facet':
              value = parts[index + 1];
              break;
          case 'timeseries':
              value = parts[index + 1] + ' ' + parts[index + 2];
              break;
      };

      return value.replace(/'/g, '');;
  };

  const setQueryValue = (section, value) => {
      const parts = query.match(/(?:[^\s']+|'[^']*')+/g) ;
      const index = parts.findIndex(part => part.toLowerCase() === section.toLowerCase());
      if (!index && index !== 0) return;

      switch (section) {
          case 'since':
          case 'until':
          case 'facet':
              parts[index + 1] = `'${value}'`;
              break;
          case 'timeseries':
              parts[index + 1] = value.split(' ')[0];
              parts[index + 2] = value.split(' ')[1];
              break;
      };

      query = parts.join(' ');
  };

  const getTimespan = () => {
      let since = getQueryValue('since');
      let until = getQueryValue('until');
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
      const timespan = getTimespan();
      if (!timespan) return;

      const since = moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss');
      const until = moment().format('YYYY-MM-DD HH:mm:ss');
      setQueryValue('since', since);
      setQueryValue('until', until);
      executeQuery();
  };

  const actionNextTimespan = () => {
      const timespan = getTimespan();
      if (!timespan) return;

      const since = timespan.momentSince.add(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      const until = timespan.momentUntil.add(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      setQueryValue('since', since);
      setQueryValue('until', until);
      executeQuery();
  };

  const actionPreviousTimespan = () => {
      const timespan = getTimespan();
      if (!timespan) return;

      const since = timespan.momentSince.subtract(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      const until = timespan.momentUntil.subtract(timespan.difference, 'seconds').format('YYYY-MM-DD HH:mm:ss');
      setQueryValue('since', since);
      setQueryValue('until', until);
      executeQuery();
  };

  const makeGroup = text => {
      return $(`<div class="group"><div class="title">${text}</div></div>`);
  };

  const makeButton = (text, onClick) => {
      return $(`<span class="btn-primary">${text}</span>`).click(onClick ? onClick : () => null);
  };

  const renderTimeGroup = () => {
      const timeGroup = makeGroup('Time');
      timeGroup.append(makeButton('&lt;', actionPreviousTimespan));
      timeGroup.append(makeButton('Now', actionCurrentTimespan));
      timeGroup.append(makeButton('&gt;', actionNextTimespan));
      return timeGroup;
  };

  const renderToolbar = () => {
      let toolbar = $('.insights_toolbar');

      if (toolbar.length === 0) {
          toolbar = $('<div class="insights_toolbar" />');
          toolbar.append(renderTimeGroup);

          $('.query_editor_box').prepend(toolbar);
      }
  };

  const processUpdatedContent = () => {
      query = (new URLSearchParams(window.location.search)).get('query');
      contentArea = $('.ace_content');
      const timespan = getTimespan();
      if (!timespan) return;

      renderToolbar();
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
