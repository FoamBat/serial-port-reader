const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
SerialPort.list().then((results) => {
  console.log(results);
});
//let ss = '';
//'0b 31 30 30 30 32 31 32 31 31 30 31'.split(' ').forEach((hexDigit) => {
//  ss += parseInt(hexDigit, 16);
//});
//console.log(ss);
// bb bb 00 00 00 00 00 80
// 0b 31 30 30 30 32 31 32 31 31 30 31 04 1a (last 2 bytes checksum)

//case 1:	/* ask for serial number */
// trame[0] = 0xbb; //187
// trame[1] = 0xbb;
// trame[2] = 0x00; //0
// trame[3] = 0x00;
// trame[4] = 0x00;
// trame[5] = 0x00;
// trame[6] = 0x00;
// trame[7] = 0x00;
// trame[8] = 0x00;
var trame = [187, 187, 0, 0, 0, 0, 0, 0, 0];
let commandToGetConfigurations = [187, 187, 1, 0, 0, 1, 1, 4];
let pvOutputCom = [187, 187, 01, 00, 00, 01, 01, 02];
function calculateChecksum(trame) {
  const n = trame.length;
  let checksum = 0;

  for (let i = 0; i < n; i++) {
    checksum += trame[i];
  }
  trame[n] = checksum >> 8;
  trame[n + 1] = checksum & 255;

  return checksum;
}
/* compute crc */
calculateChecksum(trame);

var port = new SerialPort(
  'COM1',
  {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  },
  (error) => {
    console.log(`connection with serialport COM1 failed: ${error}`);
  }
);

function sendCommand(command, port) {
  console.log(port.isOpen);
  port.write(command, function(err) {
    if (err) {
      return console.log('Error on write: ', err.message);
    }
    console.log('Command sent!');
  });
}
// Read data that is available but keep the stream in "paused mode"
port.on('readable', function() {
  console.log('Port is readable, do read');
});
port.on('data', (res) => {
  console.log('Port on data: ', res);
});
port.on('error', function(err) {
  console.log('Error: ', err.message);
});
// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
  sendCommand(trame, port);
});
setTimeout(() => {
  if (!port.isOpen) return;
  port.close((err) => {
    console.log('Port close error: ', err);
  });
}, 10000);
