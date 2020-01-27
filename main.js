const SerialPort = require('serialport');

const commands = require('./commands');

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
port.on('data', (data) => {
  console.log(typeof data, ' ', JSON.stringify(data));
  console.log(data.getOwnProperties());
  //console.log('Port on data: ', hexToDecimal(data));
});

// The open event is always emitted
port.on('open', () => {
  console.log('Port open');
  writeAndDrain(commands.getSerialNumber);
  setInterval(() => {
    writeAndDrain(commands.getSerialNumber);
  }, 1000);
});
