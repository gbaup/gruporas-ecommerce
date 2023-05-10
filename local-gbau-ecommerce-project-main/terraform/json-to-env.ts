import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('output.json', 'utf8'));

const hostName = data.rds_hostname.value;
const hostPort = data.rds_port.value;
const hostUser = data.rds_username.value;
const password = data.rds_password.value;

const env = fs.openSync('../.env', 'a');
fs.writeSync(env, '\n\n');
fs.writeSync(env, `DB_HOST=${hostName}\n`);
fs.writeSync(env, `DB_PORT=${hostPort}\n`);
fs.writeSync(env, `DB_USERNAME=${hostUser}\n`);
fs.writeSync(env, `DB_PASSWORD=${password}\n`);
fs.closeSync(env);
