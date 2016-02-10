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
try {
  orb.connect(() => {
    console.log('connected!');
    orb.setPermOptionFlags(0x000011);
    connected = true;
    spin(orb);
    orb.color(statuses[status]);
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
      const newStatus = _.get(_(res.body.projects)
        .map('builds')
        .flatten()
        .filter({ ['github_username']: config.GITHUB_USERNAME })
        .sortBy('started_at')
        .last(), 'status');
      if (!newStatus) throw 'No status';
      console.log(`Codeship status received: ${newStatus}`);
      if (newStatus !== status) spin(orb);
      status = newStatus;
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
