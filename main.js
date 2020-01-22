const SerialPort = require('serialport');
SerialPort.list().then((results) => {
  console.log(results);
});
/*(async function() {
  const result = await sp.list();
  console.log(result);
})();*/

const port = new SerialPort('COM1');

port.write('main screen turn on', function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('message written');
});

// Open errors will be emitted as an error event
port.on('error', function(err) {
  console.log('Error: ', err.message);
});

// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
});
