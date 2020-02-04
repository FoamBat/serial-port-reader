const SerialPort = require('serialport');
const ByteLength = require('@serialport/parser-byte-length');

const sendDataToSnInstance = require('./DataServices/sn-rest-api');
const SerialCommunicator = require('./SerialPortCommunication/serialCom');
const parseData = require('./DataServices/parser');
const commands = require('./SerialPortCommunication/commands');
const { DATA_INTERVAL, LOGIN_INTERVAL } = require('./config');

function constructSerialPort() {
  return new SerialPort(
    'COM1',
    {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    },
    (error) => {
      if (error)
        console.log(`connection with serialport COM1 failed: ${error}`);
    }
  );
}
function decToAscii(data) {
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
  delete namespace.com;
  port.close();
}
function onOpen() {
  console.log(`${new Date().toLocaleString()} Port opened.`);
  const parser = constructByteLengthParser(22);
  namespace.com = new SerialCommunicator(namespace.port, parser);

  // start communicating with inverter using command (1st param) and interval frequency (2nd param)
  namespace.com.setListener(commands.getSerialNumber, LOGIN_INTERVAL);
  namespace.com.on('data', function(data) {
    // send received data to Servicenow
    sendDataToSnInstance(parseData(data));

    if (namespace.com.lastDataReceivedBeforeGivenMinutes >= 30) {
      console.log(
        `${new Date().toLocaleString()} last data read was found ago 30 or more minutes!`
      );
      namespace.com.clearListener();
      initNewCommunication(namespace.port);
    }
  });
  namespace.com.on('log_in', function(data) {
    console.log(decToAscii(data));
    namespace.com.setListener(commands.getData, DATA_INTERVAL);
    const parser = constructByteLengthParser(53);
    namespace.com.setParser(parser);
  });
  namespace.com.on('serial_number', function(data) {
    console.log(decToAscii(data));
    namespace.com.setListener(commands.logIn, LOGIN_INTERVAL);
    const parser = constructByteLengthParser(12);
    namespace.com.setParser(parser);
  });
}
function reconnect() {
  namespace.port = constructSerialPort();
  namespace.port.on('open', onOpen);
  namespace.port.on('close', (err) => {
    console.log(
      `${new Date().toLocaleString()} Port closed. Reconnect to SerialPort.`
    );
    reconnect();
  });
}

var namespace = {};
reconnect();
