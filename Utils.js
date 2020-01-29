const baseScriptUrl = 'https://github.com/churchcommunitybuilder/user-scripts/blob/master/';

const loadScript = (id, scriptUrl) => {
  var resource = document.createElement('script');
  resource.async = "true";
  resource.src = scriptUrl;
  resource.id = id;

  var container = document.getElementsByTagName('head')[0];
  container.appendChild(resource);
}
const loadUserScript = scriptName => loadScript('userScript', baseScriptUrl + scriptName);

const initUserScript = scriptName => {
  if (!window.jQuery) {
    loadScript('jQuery', 'https://code.jquery.com/jquery-3.4.1.min.js');
    window.setTimeout(() => loadUserScript(scriptName), 1000);
  } else {
    loadUserScript(scriptName);
  }
}
