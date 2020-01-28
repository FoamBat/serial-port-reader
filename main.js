const SerialPort = require('serialport');
const events = require('events');

const eventEmitter = new events.EventEmitter();
const ByteLength = require('@serialport/parser-byte-length');
const commands = require('./commands');
const fs = require('fs');

var data = [
  187,
  187,
  0,
  0,
  0,
  0,
  0,
  128,
  11,
  49,
  48,
  48,
  48,
  49,
  56,
  53,
  49,
  49,
  48,
  49,
  4,
  35,
  187,
  187,
  0,
  0,
  0,
  0,
  0,
  128,
  11,
  49,
  48,
  48,
  48,
  49,
  56,
  53,
  49,
  49,
  48,
  49,
  4,
  35,
  187,
  187,
  0,
  0,
  0,
  0,
  0,
  128,
  11
];
const dataLabels = [
  'Heat Sink Temperature (C)',
  0.1,
  'Panel 1 Voltage (V)',
  0.1,
  'Panel 1 DC Current (A)',
  0.1,
  'Working Hours High Word',
  1,
  'Working Hours Low Word',
  0.1,
  'Operating Mode',
  1,
  'Tmp F-Value (C)',
  0.1,
  'PV1 F-Value (V)',
  0.1,
  'GFCI F-Value (mA) ',
  0.001,
  'Fault Code High',
  1,
  'Fault Code Low',
  1,
  'Line Current (A)',
  0.1,
  'Line Voltage (V)',
  0.1,
  'AC Frequency (Hz)',
  0.01,
  'AC Power (W)',
  1,
  'Zac (Ohms)',
  0.001,
  'Accumulated Energy High Word',
  1,
  'Accumulated Energy Low Word',
  0.1,
  'GFCI F-Value Volts (V)',
  0.1,
  'GFCI F-Value Hz (Hz)',
  0.01,
  'GZ F-Value Ohm (Ohms)',
  0.001
];

var serialNumberListener;

const port = new SerialPort(
  'COM1',
  {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  },
  (error) => {
    if (error) console.log(`connection with serialport COM1 failed: ${error}`);
  }
);
var promise;
const serialNumberParser = port.pipe(new ByteLength({ length: 11 }));
const logInParser = port.pipe(new ByteLength({ length: 23 }));
const dataParser = port.pipe(new ByteLength({ length: 53 }));

//Create an event handler:
var myEventHandler = function() {
  console.log('I hear a scream!');
};

//Assign the event handler to an event:
eventEmitter.on('scream', myEventHandler);

// sends data to the connected device via serial port
function writeAndDrain(data) {
  port.flush();
  port.write(data, function(error) {
    if (error) {
      console.log(error);
    } else {
      // waits until all output data has been transmitted to the serial port.
      port.drain(null);
    }
  });
}
function parseData() {
  let arr = [...data];
  let object = {};
  object['Date Time'] = new Date();
  for (let i = 0; i < 21; i++) {
    let temp = (arr[9 + i * 2] << 8) + arr[10 + i * 2];
    object[dataLabels[i * 2]] = temp * dataLabels[i * 2 + 1];
    console.log(`${dataLabels[i * 2]} - ${data * dataLabels[i * 2 + 1]}`);
  }
  return object;
}
function appendDataToFile(data) {
  fs.appendFile(
    './data/data.json',
    JSON.stringify(data, null, 2) + ',\n',
    (err) => {
      if (err) throw err;
      console.log('Data written to file');
    }
  );
}
function dataReceived(data) {
  console.log(data.length);
  if (data.length === 11) {
    console.log(`'Serial Number received' - ${data}`);
    eventEmitter.emit('log_in');
  }
  if (data.length === 53) {
    eventEmitter.emit('data');
  }
}

logInParser.on('data', dataReceived);

// The open event is always emitted
port.on('open', () => {
  console.log('Port open = ', port.isOpen);

  // data event received, check when was the last time data was received from inverter
  eventEmitter.on('data', function() {
    console.log('data read event fired!');
  });
  // log in to inverter received, start asking data from inverter
  eventEmitter.on('log_in', function() {
    console.log('data read event fired!');
    dataListener = setInterval(() => {
      writeAndDrain(commands.SerialPort);
    }, 3000);
  });
});
