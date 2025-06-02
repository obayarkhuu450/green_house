const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

let sensorData = [];
let averagedData = [];
let fanState = { fan2: false };
let alarm3Active = false;
let lastWebToggle = { fan2: 0 };
let localControlEnabled = true;

app.post('/api/sensor', (req, res) => {
  let { temperature, humidity, temp_out, door1, door2, fan2, alarm1, alarm2, alarm3 } = req.body;
  temperature = isNaN(temperature) || temperature === undefined ? 0 : Number(temperature);
  humidity = isNaN(humidity) || humidity === undefined ? 0 : Number(humidity);
  temp_out = isNaN(temp_out) || temp_out === undefined ? 0 : Number(temp_out);
  door1 = door1 === undefined ? false : Boolean(door1);
  door2 = door2 === undefined ? false : Boolean(door2);
  fan2 = fan2 === undefined ? false : Boolean(fan2);
  alarm1 = alarm1 === undefined ? false : Boolean(alarm1);
  alarm2 = alarm2 === undefined ? false : Boolean(alarm2);
  alarm3 = alarm3 === undefined ? false : Boolean(alarm3);
  console.log(`Received live data: TempIn: ${temperature}, Hum: ${humidity}, TempOut: ${temp_out}, Door1: ${door1}, Door2: ${door2}, Fan2: ${fan2}, Alarm1: ${alarm1}, Alarm2: ${alarm2}, Alarm3: ${alarm3}, LocalControl: ${localControlEnabled}`);
  const now = Date.now();
  if (now - lastWebToggle.fan2 > 5000) fanState.fan2 = fan2;
  sensorData.push({ temperature, humidity, temp_out, door1, door2, fan2: fanState.fan2, alarm1, alarm2, alarm3, local_control_enabled: localControlEnabled, timestamp: new Date() });
  if (sensorData.length > 24 * 60 * 30) sensorData.shift();
  alarm3Active = alarm3;
  res.status(200).json({
    message: 'Live data received',
    receivedData: { temperature, humidity, temp_out, door1, door2, fan2: fanState.fan2, alarm1, alarm2, alarm3, local_control_enabled: localControlEnabled }
  });
});

app.post('/api/sensorAveraged', (req, res) => {
  let { temperature, humidity, temp_out, door1, door2, fan2, alarm1, alarm2, alarm3 } = req.body;
  temperature = isNaN(temperature) || temperature === undefined ? 0 : Number(temperature);
  humidity = isNaN(humidity) || humidity === undefined ? 0 : Number(humidity);
  temp_out = isNaN(temp_out) || temp_out === undefined ? 0 : Number(temp_out);
  door1 = door1 === undefined ? false : Boolean(door1);
  door2 = door2 === undefined ? false : Boolean(door2);
  fan2 = fan2 === undefined ? false : Boolean(fan2);
  alarm1 = alarm1 === undefined ? false : Boolean(alarm1);
  alarm2 = alarm2 === undefined ? false : Boolean(alarm2);
  alarm3 = alarm3 === undefined ? false : Boolean(alarm3);
  console.log(`Received averaged data: TempIn: ${temperature}, Hum: ${humidity}, TempOut: ${temp_out}, Door1: ${door1}, Door2: ${door2}, Fan2: ${fan2}, Alarm1: ${alarm1}, Alarm2: ${alarm2}, Alarm3: ${alarm3}, LocalControl: ${localControlEnabled}`);
  averagedData.push({ temperature, humidity, temp_out, door1, door2, fan2: fanState.fan2, alarm1, alarm2, alarm3, local_control_enabled: localControlEnabled, timestamp: new Date() });
  if (averagedData.length > 24 * 60) averagedData.shift();
  res.status(200).json({
    message: 'Averaged data received',
    receivedData: { temperature, humidity, temp_out, door1, door2, fan2: fanState.fan2, alarm1, alarm2, alarm3, local_control_enabled: localControlEnabled }
  });
});

app.get('/api/toggleFan', (req, res) => {
  const fan = req.query.fan;
  const now = Date.now();
  if (fan === 'status') {
    console.log('Sending fan state:', fanState);
    return res.json({ fan2: fanState.fan2 });
  }
  if (fan === '2') {
    fanState.fan2 = !fanState.fan2;
    lastWebToggle.fan2 = now;
    console.log(`Fan2 toggled to ${fanState.fan2 ? 'ON' : 'OFF'}`);
    res.json({ message: `Fan2 state: ${fanState.fan2 ? 'ON' : 'OFF'}`, fan2: fanState.fan2 });
  } else {
    res.status(400).json({ message: 'Invalid fan parameter' });
  }
});

app.get('/api/toggleLocalControl', (req, res) => {
  localControlEnabled = !localControlEnabled;
  console.log(`Local control toggled to ${localControlEnabled ? 'enabled' : 'disabled'}`);
  res.json({ message: `Local control ${localControlEnabled ? 'enabled' : 'disabled'}`, local_control_enabled: localControlEnabled });
});

app.get('/api/sensorData', (req, res) => {
  console.log('Sending live sensor data:', sensorData.length, 'entries');
  res.json(sensorData);
});

app.get('/api/sensorDataAveraged', (req, res) => {
  console.log('Sending averaged sensor data:', averagedData.length, 'entries');
  res.json(averagedData);
});

app.get('/api/alarms', (req, res) => {
  res.json({ alarm3: alarm3Active });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://locahlhost:${port}`);
});