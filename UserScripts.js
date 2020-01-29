  const UserScripts = (id, scriptName) => {
    const baseScriptUrl = 'https://github.com/churchcommunitybuilder/user-scripts/blob/master/';

    this.loadScript = (id, scriptUrl) => {
      var resource = document.createElement('script');
      resource.async = "true";
      resource.src = scriptUrl;
      resource.id = id;

      var container = document.getElementsByTagName('head')[0];
      container.appendChild(resource);
    }

    if (!window.jQuery)
      this.loadScript('jQuery', 'https://code.jquery.com/jquery-3.4.1.min.js');

    if (scriptName) {
      (function() {
        loadScript(id, baseScriptUrl + scriptName);
      })();
    }
  };
