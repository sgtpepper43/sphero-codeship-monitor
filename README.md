# Sphero Codeship Monitor

## Setup
Create .env file with your `CODESHIP_KEY` and `SPHERO_PORT`. The `SPHERO_PORT` can be found like so (on OSX), once you've paired it via bluetooth:  
```bash
ls -a /dev | grep tty.Sphero
```
Make sure to add `/dev/` to the output of that command.
More detailed instructions can be found [on the sphero.js docs](https://github.com/orbotix/sphero.js#connecting-to-spherosprk)

Then just `npm run build` and `npm start`.
