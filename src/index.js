import request from 'superagent';
import _ from 'lodash';
import { config } from './lib';
import sphero from 'sphero';

const statuses = {
  success: 'green',
  testing: 'blue',
  error: 'red',
  waiting: '4444dd',
  stopped: '999999'
};
const orb = sphero(config.SPHERO_PORT);
let connected = false;
let status = 'stopped';
let lastBuild = {};
try {
  orb.connect(() => {
    console.log('connected!');
    orb.setPermOptionFlags(0x000011);
    connected = true;
    spin(orb);
    orb.color(statuses[status]);
    let max = 0;
    let updating = false;

    // enable streaming of velocity data
    orb.setDataStreaming({
      mask1: 0x00000000,
      mask2: 0x01800000,
      n: 40,
      m: 1,
      pcnt: 0
    });

    orb.on('dataStreaming', data => {
      if (updating) { return; }

      const x = Math.abs(data.xVelocity.value);
      const y = Math.abs(data.yVelocity.value);

      const localmax = Math.max(x, y);

      if (localmax > max) { max = localmax; }
    });

    function update() {
      updating = true;
      console.log('Shake value: ', max);
      if (max > 500) {
        request.post(`https://codeship.com/api/v1/builds/${lastBuild.id}/restart.json?api_key=${config.CODESHIP_KEY}`).end();
        console.log(`Restarting build ${lastBuild.id}`);
      }

      max = 0;
      updating = false;
    }

    setInterval(update, 5000);
  });
} catch (e) {
  console.log(e);
}
setInterval(() => {
  if (!connected) return;
  request.get(`https://codeship.com/api/v1/projects.json?api_key=${config.CODESHIP_KEY}`).end((err, res) => {
    console.log(err);
    if (err) return;
    try {
      lastBuild = _(res.body.projects)
        .map('builds')
        .flatten()
        .filter({ ['github_username']: config.GITHUB_USERNAME })
        .sortBy('started_at')
        .last();
      if (!lastBuild) throw 'No build!';
      console.log(`Codeship status received: ${lastBuild.status}`);
      if (lastBuild.status !== status) spin(orb);
      status = lastBuild.status;
      orb.color(statuses[status]);
    } catch (e) {
      console.log(e);
    }
  });
}, 10000);

function spin(sph) {
  sph.setRawMotors({
    lmode: 0x01,
    lpower: 90,
    rmode: 0x02,
    rpower: 90
  }, () => {
    setTimeout(() => {
      sph.setStabilization(1);
    }, 2000);
  });
}
