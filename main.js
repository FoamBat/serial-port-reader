const SerialPort = require('serialport');

const commands = require('./commands');

//let ss = '';
//'0b 31 30 30 30 32 31 32 31 31 30 31'.split(' ').forEach((hexDigit) => {
//  ss += parseInt(hexDigit, 16);
//});

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
port.on('data', (data) => {
  console.log('Port on data: ', data);
});

// The open event is always emitted
port.on('open', () => {
  console.log('Port open');
  console.log(commands.getData);
  setInterval(() => {
    writeAndDrain(commands.getData);
  }, 1000);
});
