// ==UserScript==
// @name         Happy Birthday Fireworks
// @namespace    http://comsite.org/
// @version      0.1
// @description  To wish people at Church Community Builder a happy birthday!
// @author       Jay Kappel
// @include      https://github.com*
// @include      https://google.com*
// @include      https://www.google.com*
// @include      https://*.ccbchurch.com*
// @include      http://dev.local*
// @grant        Feel free to do whatever you want with this
// ==/UserScript==

(function() {
  const birthdays = [
      { date: '8-21', name: 'Jay Kappel' },
  ];

  const siteList = [
      { name: 'google', fireworksContainer: '#viewport', announceContainer: '#lga' },
      { name: 'github', fireworksContainer: '.application-main', announceContainer: '.pagehead' },
      { name: 'ccb', fireworksContainer: 'body.unified-interface', announceContainer: 'body.unified-interface' },
  ];

  const isToday = date => {
      var d = new Date();
      const today = `${d.getMonth() +1}-${d.getDate()}`;
      return today === date;
  };

  const getActiveSite = () => {
      return siteList.reduce((accum, site) => {
          const fireworksContainer = document.querySelector(site.fireworksContainer);
          const announceContainer = document.querySelector(site.announceContainer);
          if (fireworksContainer && !accum.name) {
              accum = { name: site.name, fireworksContainer, announceContainer };
          }
          return accum;
      }, {});
  };

  const insertFireworks = (container) => {
      if (!container) return;
      GM_addStyle('body{margin:0;padding:0;background:#fff;}.pyro>.after,.pyro>.before{position:absolute;width:5px;height:5px;border-radius:50%;box-shadow:0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff,0 0 #fff;-moz-animation:1s bang ease-out infinite backwards,1s gravity ease-in infinite backwards,5s position linear infinite backwards;-webkit-animation:1s bang ease-out infinite backwards,1s gravity ease-in infinite backwards,5s position linear infinite backwards;-o-animation:1s bang ease-out infinite backwards,1s gravity ease-in infinite backwards,5s position linear infinite backwards;-ms-animation:1s bang ease-out infinite backwards,1s gravity ease-in infinite backwards,5s position linear infinite backwards;animation:1s bang ease-out infinite backwards,1s gravity ease-in infinite backwards,5s position linear infinite backwards}.pyro>.after{-moz-animation-delay:1.25s,1.25s,1.25s;-webkit-animation-delay:1.25s,1.25s,1.25s;-o-animation-delay:1.25s,1.25s,1.25s;-ms-animation-delay:1.25s,1.25s,1.25s;animation-delay:1.25s,1.25s,1.25s;-moz-animation-duration:1.25s,1.25s,6.25s;-webkit-animation-duration:1.25s,1.25s,6.25s;-o-animation-duration:1.25s,1.25s,6.25s;-ms-animation-duration:1.25s,1.25s,6.25s;animation-duration:1.25s,1.25s,6.25s}@-webkit-keyframes bang{to{box-shadow:31px 83.3333333333px #70f,-78px -165.6666666667px #ff00bf,33px -170.6666666667px #0095ff,-122px -89.6666666667px #3700ff,43px -161.6666666667px #ff9100,-80px -25.6666666667px #fbff00,155px -229.6666666667px #0015ff,-86px -291.6666666667px #2600ff,-206px -95.6666666667px #b700ff,-48px -153.6666666667px #00ff09,-124px -102.6666666667px #000dff,-167px -141.6666666667px #bfff00,103px -342.6666666667px #00ffae,-184px -300.6666666667px #00ff95,78px 21.3333333333px #00ff62,199px -394.6666666667px #30f,-222px 39.3333333333px #eaff00,-186px -362.6666666667px #f04,107px -390.6666666667px #ffae00,32px 69.3333333333px #48ff00,42px -135.6666666667px #3cff00,-210px 4.3333333333px #bf0,-154px -132.6666666667px #ff001e,-117px -386.6666666667px #ff00a2,-60px -330.6666666667px #00ff1e,12px -372.6666666667px #00d9ff,101px -297.6666666667px #f02,157px -171.6666666667px #91ff00,-92px -301.6666666667px #0f7,203px -49.6666666667px #c0f,-120px -241.6666666667px #ff0062,119px -19.6666666667px #ff0009,-97px -114.6666666667px #ffc400,48px 56.3333333333px #ff00fb,53px -344.6666666667px #00ff09,-5px 3.3333333333px #f03,-141px -352.6666666667px #ff0095,-223px 65.3333333333px #a2ff00,194px -166.6666666667px #4f0,40px -214.6666666667px #ff00b3,-175px -103.6666666667px #ff007b,-201px -329.6666666667px red,-68px -175.6666666667px #008cff,-111px -4.6666666667px #6aff00,-64px 63.3333333333px #ff004d,-232px -264.6666666667px #fff700,-188px -98.6666666667px #ff8000,122px -341.6666666667px #5f0,-175px -374.6666666667px #1a00ff,-9px -367.6666666667px #6a00ff,-53px -337.6666666667px #6aff00}}@-moz-keyframes bang{to{box-shadow:31px 83.3333333333px #70f,-78px -165.6666666667px #ff00bf,33px -170.6666666667px #0095ff,-122px -89.6666666667px #3700ff,43px -161.6666666667px #ff9100,-80px -25.6666666667px #fbff00,155px -229.6666666667px #0015ff,-86px -291.6666666667px #2600ff,-206px -95.6666666667px #b700ff,-48px -153.6666666667px #00ff09,-124px -102.6666666667px #000dff,-167px -141.6666666667px #bfff00,103px -342.6666666667px #00ffae,-184px -300.6666666667px #00ff95,78px 21.3333333333px #00ff62,199px -394.6666666667px #30f,-222px 39.3333333333px #eaff00,-186px -362.6666666667px #f04,107px -390.6666666667px #ffae00,32px 69.3333333333px #48ff00,42px -135.6666666667px #3cff00,-210px 4.3333333333px #bf0,-154px -132.6666666667px #ff001e,-117px -386.6666666667px #ff00a2,-60px -330.6666666667px #00ff1e,12px -372.6666666667px #00d9ff,101px -297.6666666667px #f02,157px -171.6666666667px #91ff00,-92px -301.6666666667px #0f7,203px -49.6666666667px #c0f,-120px -241.6666666667px #ff0062,119px -19.6666666667px #ff0009,-97px -114.6666666667px #ffc400,48px 56.3333333333px #ff00fb,53px -344.6666666667px #00ff09,-5px 3.3333333333px #f03,-141px -352.6666666667px #ff0095,-223px 65.3333333333px #a2ff00,194px -166.6666666667px #4f0,40px -214.6666666667px #ff00b3,-175px -103.6666666667px #ff007b,-201px -329.6666666667px red,-68px -175.6666666667px #008cff,-111px -4.6666666667px #6aff00,-64px 63.3333333333px #ff004d,-232px -264.6666666667px #fff700,-188px -98.6666666667px #ff8000,122px -341.6666666667px #5f0,-175px -374.6666666667px #1a00ff,-9px -367.6666666667px #6a00ff,-53px -337.6666666667px #6aff00}}@-o-keyframes bang{to{box-shadow:31px 83.3333333333px #70f,-78px -165.6666666667px #ff00bf,33px -170.6666666667px #0095ff,-122px -89.6666666667px #3700ff,43px -161.6666666667px #ff9100,-80px -25.6666666667px #fbff00,155px -229.6666666667px #0015ff,-86px -291.6666666667px #2600ff,-206px -95.6666666667px #b700ff,-48px -153.6666666667px #00ff09,-124px -102.6666666667px #000dff,-167px -141.6666666667px #bfff00,103px -342.6666666667px #00ffae,-184px -300.6666666667px #00ff95,78px 21.3333333333px #00ff62,199px -394.6666666667px #30f,-222px 39.3333333333px #eaff00,-186px -362.6666666667px #f04,107px -390.6666666667px #ffae00,32px 69.3333333333px #48ff00,42px -135.6666666667px #3cff00,-210px 4.3333333333px #bf0,-154px -132.6666666667px #ff001e,-117px -386.6666666667px #ff00a2,-60px -330.6666666667px #00ff1e,12px -372.6666666667px #00d9ff,101px -297.6666666667px #f02,157px -171.6666666667px #91ff00,-92px -301.6666666667px #0f7,203px -49.6666666667px #c0f,-120px -241.6666666667px #ff0062,119px -19.6666666667px #ff0009,-97px -114.6666666667px #ffc400,48px 56.3333333333px #ff00fb,53px -344.6666666667px #00ff09,-5px 3.3333333333px #f03,-141px -352.6666666667px #ff0095,-223px 65.3333333333px #a2ff00,194px -166.6666666667px #4f0,40px -214.6666666667px #ff00b3,-175px -103.6666666667px #ff007b,-201px -329.6666666667px red,-68px -175.6666666667px #008cff,-111px -4.6666666667px #6aff00,-64px 63.3333333333px #ff004d,-232px -264.6666666667px #fff700,-188px -98.6666666667px #ff8000,122px -341.6666666667px #5f0,-175px -374.6666666667px #1a00ff,-9px -367.6666666667px #6a00ff,-53px -337.6666666667px #6aff00}}@-ms-keyframes bang{to{box-shadow:31px 83.3333333333px #70f,-78px -165.6666666667px #ff00bf,33px -170.6666666667px #0095ff,-122px -89.6666666667px #3700ff,43px -161.6666666667px #ff9100,-80px -25.6666666667px #fbff00,155px -229.6666666667px #0015ff,-86px -291.6666666667px #2600ff,-206px -95.6666666667px #b700ff,-48px -153.6666666667px #00ff09,-124px -102.6666666667px #000dff,-167px -141.6666666667px #bfff00,103px -342.6666666667px #00ffae,-184px -300.6666666667px #00ff95,78px 21.3333333333px #00ff62,199px -394.6666666667px #30f,-222px 39.3333333333px #eaff00,-186px -362.6666666667px #f04,107px -390.6666666667px #ffae00,32px 69.3333333333px #48ff00,42px -135.6666666667px #3cff00,-210px 4.3333333333px #bf0,-154px -132.6666666667px #ff001e,-117px -386.6666666667px #ff00a2,-60px -330.6666666667px #00ff1e,12px -372.6666666667px #00d9ff,101px -297.6666666667px #f02,157px -171.6666666667px #91ff00,-92px -301.6666666667px #0f7,203px -49.6666666667px #c0f,-120px -241.6666666667px #ff0062,119px -19.6666666667px #ff0009,-97px -114.6666666667px #ffc400,48px 56.3333333333px #ff00fb,53px -344.6666666667px #00ff09,-5px 3.3333333333px #f03,-141px -352.6666666667px #ff0095,-223px 65.3333333333px #a2ff00,194px -166.6666666667px #4f0,40px -214.6666666667px #ff00b3,-175px -103.6666666667px #ff007b,-201px -329.6666666667px red,-68px -175.6666666667px #008cff,-111px -4.6666666667px #6aff00,-64px 63.3333333333px #ff004d,-232px -264.6666666667px #fff700,-188px -98.6666666667px #ff8000,122px -341.6666666667px #5f0,-175px -374.6666666667px #1a00ff,-9px -367.6666666667px #6a00ff,-53px -337.6666666667px #6aff00}}@keyframes bang{to{box-shadow:31px 83.3333333333px #70f,-78px -165.6666666667px #ff00bf,33px -170.6666666667px #0095ff,-122px -89.6666666667px #3700ff,43px -161.6666666667px #ff9100,-80px -25.6666666667px #fbff00,155px -229.6666666667px #0015ff,-86px -291.6666666667px #2600ff,-206px -95.6666666667px #b700ff,-48px -153.6666666667px #00ff09,-124px -102.6666666667px #000dff,-167px -141.6666666667px #bfff00,103px -342.6666666667px #00ffae,-184px -300.6666666667px #00ff95,78px 21.3333333333px #00ff62,199px -394.6666666667px #30f,-222px 39.3333333333px #eaff00,-186px -362.6666666667px #f04,107px -390.6666666667px #ffae00,32px 69.3333333333px #48ff00,42px -135.6666666667px #3cff00,-210px 4.3333333333px #bf0,-154px -132.6666666667px #ff001e,-117px -386.6666666667px #ff00a2,-60px -330.6666666667px #00ff1e,12px -372.6666666667px #00d9ff,101px -297.6666666667px #f02,157px -171.6666666667px #91ff00,-92px -301.6666666667px #0f7,203px -49.6666666667px #c0f,-120px -241.6666666667px #ff0062,119px -19.6666666667px #ff0009,-97px -114.6666666667px #ffc400,48px 56.3333333333px #ff00fb,53px -344.6666666667px #00ff09,-5px 3.3333333333px #f03,-141px -352.6666666667px #ff0095,-223px 65.3333333333px #a2ff00,194px -166.6666666667px #4f0,40px -214.6666666667px #ff00b3,-175px -103.6666666667px #ff007b,-201px -329.6666666667px red,-68px -175.6666666667px #008cff,-111px -4.6666666667px #6aff00,-64px 63.3333333333px #ff004d,-232px -264.6666666667px #fff700,-188px -98.6666666667px #ff8000,122px -341.6666666667px #5f0,-175px -374.6666666667px #1a00ff,-9px -367.6666666667px #6a00ff,-53px -337.6666666667px #6aff00}}@-webkit-keyframes gravity{to{transform:translateY(200px);-moz-transform:translateY(200px);-webkit-transform:translateY(200px);-o-transform:translateY(200px);-ms-transform:translateY(200px);opacity:0}}@-moz-keyframes gravity{to{transform:translateY(200px);-moz-transform:translateY(200px);-webkit-transform:translateY(200px);-o-transform:translateY(200px);-ms-transform:translateY(200px);opacity:0}}@-o-keyframes gravity{to{transform:translateY(200px);-moz-transform:translateY(200px);-webkit-transform:translateY(200px);-o-transform:translateY(200px);-ms-transform:translateY(200px);opacity:0}}@-ms-keyframes gravity{to{transform:translateY(200px);-moz-transform:translateY(200px);-webkit-transform:translateY(200px);-o-transform:translateY(200px);-ms-transform:translateY(200px);opacity:0}}@keyframes gravity{to{transform:translateY(200px);-moz-transform:translateY(200px);-webkit-transform:translateY(200px);-o-transform:translateY(200px);-ms-transform:translateY(200px);opacity:0}}@-webkit-keyframes position{0%,19.9%{margin-top:10%;margin-left:40%}20%,39.9%{margin-top:40%;margin-left:30%}40%,59.9%{margin-top:20%;margin-left:70%}60%,79.9%{margin-top:30%;margin-left:20%}80%,99.9%{margin-top:30%;margin-left:80%}}@-moz-keyframes position{0%,19.9%{margin-top:10%;margin-left:40%}20%,39.9%{margin-top:40%;margin-left:30%}40%,59.9%{margin-top:20%;margin-left:70%}60%,79.9%{margin-top:30%;margin-left:20%}80%,99.9%{margin-top:30%;margin-left:80%}}@-o-keyframes position{0%,19.9%{margin-top:10%;margin-left:40%}20%,39.9%{margin-top:40%;margin-left:30%}40%,59.9%{margin-top:20%;margin-left:70%}60%,79.9%{margin-top:30%;margin-left:20%}80%,99.9%{margin-top:30%;margin-left:80%}}@-ms-keyframes position{0%,19.9%{margin-top:10%;margin-left:40%}20%,39.9%{margin-top:40%;margin-left:30%}40%,59.9%{margin-top:20%;margin-left:70%}60%,79.9%{margin-top:30%;margin-left:20%}80%,99.9%{margin-top:30%;margin-left:80%}}@keyframes position{0%,19.9%{margin-top:10%;margin-left:40%}20%,39.9%{margin-top:40%;margin-left:30%}40%,59.9%{margin-top:20%;margin-left:70%}60%,79.9%{margin-top:30%;margin-left:20%}80%,99.9%{margin-top:30%;margin-left:80%}}');

      var fireworks = document.createElement("div");
      var before = document.createElement("div");
      var after = document.createElement("div");
      before.className='before';
      after.className='after';

      fireworks.prepend(after);
      fireworks.prepend(before);
      fireworks.classList.add("pyro");
      container.prepend(fireworks);
  };

  const updateDom = (birthday) => {
      const site = getActiveSite();

      insertFireworks(site.fireworksContainer);
      if (!site.announceContainer) return;

      var announce = document.createElement("div");
      announce.style.backgroundColor = 'transparent';
      announce.innerHTML = `<h3 style="text-align: center;">Happy Birthday To ${birthday.name}</h3>`;

      const container = site.announceContainer;
      switch (site.name) {
          case 'google':
              container.style.margin = '65px 0 15px 0';
              container.appendChild(announce);
              break;
          case 'github':
              announce.style.margin = '0px 0 15px 0';
              container.prepend(announce);
              break;
          case 'ccb':
              announce.style.margin = '80px 0 -80px 0';
              container.prepend(announce);
              break;
          default:
              container.prepend(announce);
              break;
      }
  }

  birthdays.map(birthday => {
      if (isToday(birthday.date)) {
          updateDom(birthday);
      }
  });
})();
