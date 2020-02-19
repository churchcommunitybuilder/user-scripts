// ==UserScript==
// @name         AWS CloudWatch Helper
// @namespace    http://churchCommunityBuilder.com/
// @version      1.0.0
// @description  Finds json data in cloudwatch logs and formats it
// @author       Jay Kappel
// @include      https://*.amazon.com/cloudwatch/*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://www.cssscript.com/demo/minimal-json-data-formatter-jsonviewer/json-viewer.js
// ==/UserScript==

(function() {
  const $ = jQuery;

  const getJsonObject = text => {
    const start = text.indexOf('{');
    if (start) {
      let open = 0;
      for (let c = start; c < text.length; c++) {
        const char = text.charAt(c);
        if (char === '{') open++;
        if (char === '}') open--;

        if (open === 0) {
          let jsonText = text.substring(start, c+1)
            .trim().replace(/\\\\/g, '\\');

          const result = {
            header: text.substring(0, start).trim().replace('] app.', ']<br>         app.'),
            data: JSON.parse(jsonText),
            extra: text.substring(c+1).trim(),
          };

          if (result.extra.charAt(0) === '{') {
              result.extra = JSON.parse(result.extra);
          }
          return result;
        }
      };
    }
    return null;
  };

   const processLogs = () => {
      $('.cwdb-log-viewer-table-row-group .content:not(.json-helper)').each((cnt, item) => {
          $(item).addClass('json-helper');
          const jsonObject = getJsonObject(item.innerText);

          if (jsonObject) {
              const viewer = new JSONViewer();
              viewer.showJSON(jsonObject);
              $(item).html(viewer.getContainer());
          }
      });
  };

  const init = () => {
    const stylesheet = $('#jsonCss');
    if (!stylesheet.length) {
      console.log('init: css');
      $("head link[rel='stylesheet']").last()
        .after("<link id='jsonCss' rel='stylesheet' href='https://www.cssscript.com/demo/minimal-json-data-formatter-jsonviewer/json-viewer.css' type='text/css' media='screen'>");
    }

    const toggle = $('.cwdb-log-viewer-table-column-expand-toggle:not(.json-helper)')
    toggle.addClass('json-helper').click(() => {
      window.setTimeout(processLogs, 50);
    })
  };

  window.setInterval(init, 1000);
})();
