const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
SerialPort.list().then((results) => {
  console.log(results);
});

let trame = [];
//case 1:	/* ask for serial number */
trame[0] = 0xbb; //187
trame[1] = 0xbb;
trame[2] = 0x00; //0
trame[3] = 0x00;
trame[4] = 0x00;
trame[5] = 0x00;
trame[6] = 0x00;
trame[7] = 0x00;
trame[8] = 0x00;

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
console.log(trame);

const parser = new Readline();

const port = new SerialPort(
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

port.pipe(parser);

port.write(trame, function(err) {
  if (err) {
    return console.log('Error on write: ', err.message);
  }
  console.log('Comment sent to inverter');
});

port.on('data', (data) => {
  console.log('data from port' + data);
});

parser.on('data', (data) => {
  console.log('data from parser' + data);
});
parser.on('data', console.log);

// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
});
