const SerialPort = require('serialport');
SerialPort.list().then((results) => {
  console.log(results);
});
/*(async function() {
  const result = await sp.list();
  console.log(result);
})();*/

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

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  port.read();
});

port.on('read', function(data) {
  console.log('Data from inverter: ', data);
});

// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
});
