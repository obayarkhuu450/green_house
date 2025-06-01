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
let fanState = { fan1: false, fan2: false };
let alarm3Active = false;

// Receive live sensor data
app.post('/api/sensor', (req, res) => {
  let { temperature, humidity, temp_out, door1, door2, fan1, fan2, alarm1, alarm2, alarm3 } = req.body;

  temperature = isNaN(temperature) || temperature === undefined ? 0 : Number(temperature);
  humidity = isNaN(humidity) || humidity === undefined ? 0 : Number(humidity);
  temp_out = isNaN(temp_out) || temp_out === undefined ? 0 : Number(temp_out);
  door1 = door1 === undefined ? false : Boolean(door1);
  door2 = door2 === undefined ? false : Boolean(door2);
  fan1 = fan1 === undefined ? false : Boolean(fan1);
  fan2 = fan2 === undefined ? false : Boolean(fan2);
  alarm1 = alarm1 === undefined ? false : Boolean(alarm1);
  alarm2 = alarm2 === undefined ? false : Boolean(alarm2);
  alarm3 = alarm3 === undefined ? false : Boolean(alarm3);

  console.log(`Received live data: TempIn: ${temperature}, Hum: ${humidity}, TempOut: ${temp_out}, Door1: ${door1}, Door2: ${door2}, Fan1: ${fan1}, Fan2: ${fan2}, Alarm1: ${alarm1}, Alarm2: ${alarm2}, Alarm3: ${alarm3}`);

  sensorData.push({ temperature, humidity, temp_out, door1, door2, fan1, fan2, alarm1, alarm2, alarm3, timestamp: new Date().toISOString() });
  if (sensorData.length > 24 * 60 * 30) sensorData.shift();

  alarm3Active = alarm3;

  res.status(200).json({
    message: 'Live data received',
    receivedData: { temperature, humidity, temp_out, door1, door2, fan1: fanState.fan1, fan2: fanState.fan2, alarm1, alarm2, alarm3 }
  });
});

// Receive averaged sensor data
app.post('/api/sensorAveraged', (req, res) => {
  let { temperature, humidity, temp_out, door1, door2, fan1, fan2, alarm1, alarm2, alarm3 } = req.body;

  temperature = isNaN(temperature) || temperature === undefined ? 0 : Number(temperature);
  humidity = isNaN(humidity) || humidity === undefined ? 0 : Number(humidity);
  temp_out = isNaN(temp_out) || temp_out === undefined ? 0 : Number(temp_out);
  door1 = door1 === undefined ? false : Boolean(door1);
  door2 = door2 === undefined ? false : Boolean(door2);
  fan1 = fan1 === undefined ? false : Boolean(fan1);
  fan2 = fan2 === undefined ? false : Boolean(fan2);
  alarm1 = alarm1 === undefined ? false : Boolean(alarm1);
  alarm2 = alarm2 === undefined ? false : Boolean(alarm2);
  alarm3 = alarm3 === undefined ? false : Boolean(alarm3);

  console.log(`Received averaged data: TempIn: ${temperature}, Hum: ${humidity}, TempOut: ${temp_out}, Door1: ${door1}, Door2: ${door2}, Fan1: ${fan1}, Fan2: ${fan2}, Alarm1: ${alarm1}, Alarm2: ${alarm2}, Alarm3: ${alarm3}`);

  averagedData.push({ temperature, humidity, temp_out, door1, door2, fan1, fan2, alarm1, alarm2, alarm3, timestamp: new Date().toISOString() });
  if (averagedData.length > 24 * 60) averagedData.shift();

  res.status(200).json({
    message: 'Averaged data received',
    receivedData: { temperature, humidity, temp_out, door1, door2, fan1: fanState.fan1, fan2: fanState.fan2, alarm1, alarm2, alarm3 }
  });
});

// Toggle fans or get fan states
app.get('/api/toggleFan', (req, res) => {
  const fan = req.query.fan;
  if (fan === 'status') {
    console.log('Sending fan states:', fanState);
    return res.json({ fan1: fanState.fan1, fan2: fanState.fan2 });
  }
  if (fan === '1') {
    fanState.fan1 = !fanState.fan1;
  } else if (fan === '2') {
    fanState.fan2 = !fanState.fan2;
  } else {
    return res.status(400).json({ message: 'Invalid fan parameter' });
  }
  console.log(`Fan ${fan} toggled to ${fanState['fan' + fan] ? 'ON' : 'OFF'}`);
  res.json({ message: `Fan ${fan} state: ${fanState['fan' + fan] ? 'ON' : 'OFF'}`, fan1: fanState.fan1, fan2: fanState.fan2 });
});

// Get live sensor data
app.get('/api/sensorData', (req, res) => {
  console.log('Sending live sensor data:', sensorData.length, 'entries');
  res.json(sensorData);
});

// Get averaged sensor data
app.get('/api/sensorDataAveraged', (req, res) => {
  console.log('Sending averaged sensor data:', averagedData.length, 'entries', averagedData.slice(-1));
  res.json(averagedData);
});

// Get alarm states
app.get('/api/alarms', (req, res) => {
  res.json({ alarm3: alarm3Active });
});

app.listen(port, () => {
  console.log(`Server running at http://10.3.131.242:${port}`);
});