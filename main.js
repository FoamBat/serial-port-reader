const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');

const sendDataToSnInstance = require('./DataServices/sn-rest-api');
const parseData = require('./DataServices/parser');
const commands = require('./SerialPortCommunication/commands');
const SerialCommunicator = require('./SerialPortCommunication/serialCom');
const {
  DATA_INTERVAL,
  LOGIN_INTERVAL,
  RETURN_BYTES_OF_DATA,
  RETURN_BYTES_OF_SERIAL,
  RETURN_BYTES_OF_LOGIN
} = require('./config');

function constructSerialPort(port, baudRate) {
  return new SerialPort(
    port,
    {
      baudRate: baudRate,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    },
    (error) => {
      if (error)
        console.log(`connection with serialport ${port} failed: ${error}`);
    }
  );
}
function decimalToAscii(data) {
  let result = '';
  data.map((charCode) => {
    result += String.fromCharCode(charCode);
  });
  return result;
}

function constructByteLengthParser(byteLen) {
  return new ByteLength({ length: byteLen });
}
function initNewCommunication(port) {
  //delete Communicator;
  port.close();
}
function onOpen() {
  let port = this;
  console.log(`${new Date().toLocaleString()} ${port.path} Port opened.`);
  const parser = constructByteLengthParser(RETURN_BYTES_OF_SERIAL);
  let Communicator = new SerialCommunicator(port, parser);

  // start communicating with inverter using command (1st param) and interval frequency (2nd param)
  Communicator.setListener(commands.getSerialNumber, LOGIN_INTERVAL);
  Communicator.on('data', function(data) {
    const inverterNumber = Communicator.inverterNumber;
    // send received data to Servicenow
    sendDataToSnInstance(parseData(data, inverterNumber));

    if (Communicator.lastDataReceivedBeforeGivenMinutes >= 30) {
      console.log(
        `${new Date().toLocaleString()} last data read was found ago 30 or more minutes!`
      );
      Communicator.clearListener();
      initNewCommunication(port);
    }
  });
  Communicator.on('log_in', function(data) {
    const parser = constructByteLengthParser(RETURN_BYTES_OF_DATA);

    Communicator.setListener(commands.getData, DATA_INTERVAL);
    Communicator.setParser(parser);
  });
  Communicator.on('serial_number', function(data) {
    const inverterNumber = decimalToAscii(data).substring(9, 21);
    const parser = constructByteLengthParser(RETURN_BYTES_OF_LOGIN);

    Communicator.setInverterNumber(inverterNumber);
    Communicator.setListener(commands.logIn, LOGIN_INTERVAL);
    Communicator.setParser(parser);
  });
}
function connect(port) {
  port.on('open', onOpen.bind(port));
  port.on('close', (err) => {
    console.log(
      `${new Date().toLocaleString()} Port closed. Reconnect to SerialPort.`
    );
    connect(port);
  });
}

var namespace = {};
namespace.com2 = constructSerialPort('COM2', 9600);
namespace.com6 = constructSerialPort('COM6', 9600);
connect(namespace.com2);
connect(namespace.com6);
