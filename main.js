const SerialPort = require('serialport');
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
const Readline = require('@serialport/parser-readline');
const ByteLength = require('@serialport/parser-byte-length');
const commands = require('./commands');

const dataLabels = [
  'Heat Sink Temperature',
  'Panel 1 Voltage',
  'Panel 1 DC Current',
  'Working Hours',
  'Working Hours',
  'Operating Mode',
  'Tmp F',
  'PV1 F',
  'GFCI F',
  'Fault Code High',
  'Fault Code Low',
  'Line Current',
  'Line Voltage',
  'AC Frequency',
  'AC Power',
  'Zac',
  'Accumulated Energy',
  'Accumulated Energy',
  'GFCI F',
  'GFCI F',
  'GZ F'
];
var serialNumberListener;

function hexToDecimal(data) {
  let ss = '';
  data.split(' ').forEach((hexDigit) => {
    ss += parseInt(hexDigit, 16);
  });
  return ss;
}
class Inverter {
  constructor(serialNumber) {
    this.serialNumber = serialNumber;
  }
}

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
const parser = port.pipe(new ByteLength({ length: 53 }));
// sends data to the connected device via serial port
function writeAndDrain(data) {
  console.log(data);
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
function dataReceived(data) {
  console.log(JSON.stringify(data));
  let arr = [...data];
  console.log(arr);
  for (let i = 0; i < 21; i++) {
    let data = (arr[9 + i * 2] << 8) + arr[10 + i * 2];
    console.log(`${dataLabels[i]} - ${data} \n`);
  }
  clearInterval(serialNumberListener);
  /*setInterval(() => {
    writeAndDrain(commands.logIn);
  }, 1000);*/
}
parser.on('data', dataReceived);

// The open event is always emitted
port.on('open', () => {
  console.log('Port open');
  serialNumberListener = setInterval(() => {
    writeAndDrain(commands.getData);
  }, 1000);
});
