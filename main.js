const SerialPort = require('serialport');
//const Readline = require('@serialport/parser-readline');
var Readline = SerialPort.parsers.Readline; // make instance of Readline parser
SerialPort.list().then((result) => {
  console.log(result);
});
//let ss = '';
//'0b 31 30 30 30 32 31 32 31 31 30 31'.split(' ').forEach((hexDigit) => {
//  ss += parseInt(hexDigit, 16);
//});

// bb bb 00 00 00 00 00 80 (type of response. (80) Contains Inverter serial number in the Data field)
// 0b (length of data = 11 in dec)
// 31 30 30 30 32 31 32 31 31 30 31 (Serial Number [49, 48, 48, 48, 50, 49, 50, 49, 49, 48, 49])
// 04 1a (last 2 bytes checksum)

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
// format of LogIn command [9 bytes + 11 bytes of serial number + 2 bytes of checksum]

var inverterSerialNumber = [49, 48, 48, 48, 50, 49, 50, 49, 49, 48, 49]; // 11 Bytes
var logIn = [187, 187, 0, 0, 0, 0, 0, 1, 12]; // 9 Bytes
var logInCommand = logIn.concat(inverterSerialNumber);
logInCommand[20] = 1;
//calculateChecksum(logInCommand);
console.log(`${logInCommand}  length = ${logInCommand.length}`);
var askdata = [11, 187, 187, 1, 0, 0, 1, 1, 2, 0, 1, 123];

var askForRegisters = [187, 187, 1, 0, 0, 1, 1, 2, 0];
//calculateChecksum(askForRegisters);
var trame = [187, 187, 0, 0, 0, 0, 0, 0, 0];
var commandToGetConfigurations = [187, 187, 1, 0, 0, 1, 1, 4, 0];
var pvOutputCom = [187, 187, 1, 0, 0, 1, 1, 2, 0];
var commands = [trame];
for (const command of commands) {
  calculateChecksum(command);
}
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

var port = new SerialPort(
  'COM1',
  {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none'
  },
  (error) => {
    //console.log(`connection with serialport COM1 failed: ${error}`);
  }
);

// sends data to the connected device via serial port
function writeAndDrain(data) {
  //console.log('Port is open = ', port.isOpen, ' isReadable = ', port.readable);
  console.log(data);
  // flush data received but not read
  port.flush();

  // write/send data to serial port
  port.write(data, function(error) {
    if (error) {
      console.log(error);
    } else {
      // console.log(`drain and repeat write`);
      // waits until all output data has been transmitted to the serial port.
      port.drain(null);
    }
  });
}
port.on('data', (data) => {
  console.log('Port on data: ', data);
});

// The open event is always emitted
port.on('open', function(res) {
  console.log('Port open');
  //writeAndDrain(commands[0]);
  setInterval(() => {
    writeAndDrain(commands[0]);
  }, 1000);
});

/*setTimeout(() => {
  if (!port.isOpen) return;
  port.close(() => {
    console.log('Port closed!');
  });
}, 120000);*/
