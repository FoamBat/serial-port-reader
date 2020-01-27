const SerialPort = require('serialport');
const InterByteTimeout = require('@serialport/parser-inter-byte-timeout');
const Readline = require('@serialport/parser-readline');
const ByteLength = require('@serialport/parser-byte-length');
const commands = require('./commands');

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
    console.log(`${dataLabels[i * 2]} - ${data * dataLabels[i * 2 + 1]}`);
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
    writeAndDrain(commands.getSerialNumber);
  }, 1000);
});
