const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
SerialPort.list().then((results) => {
  console.log(results);
});

const parser = new Readline();

const port = new SerialPort(
  'COM1',
  {
    //baudRate: 9600,
    //dataBits: 8,
    //stopBits: 1,
    //parity: 'none'
  },
  (error) => {
    console.log(`connection with serialport COM1 failed: ${error}`);
  }
);

port.pipe(parser);

port.write('Random text', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('comment sent to inverter');
  port.read();
});

parser.on('data', console.log);

port.on('read', function(data) {
  console.log('Data from inverter: ', data);
});

// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
});
