const SerialPort = require('serialport');
const events = require('events');

const EventEmitter = events.EventEmitter;
const ByteLength = require('@serialport/parser-byte-length');
const commands = require('./commands');
const fs = require('fs');

const dataLabels = [
  'Heat Sink Temperature (C)',
  0.1,
  'Panel 1 Voltage (V)',
  0.1,
  'Panel 1 DC Current (A)',
  0.1,
  'Working Hours High Word',
  1,
  'Working Hours Low Word',
  0.1,
  'Operating Mode',
  1,
  'Tmp F-Value (C)',
  0.1,
  'PV1 F-Value (V)',
  0.1,
  'GFCI F-Value (mA) ',
  0.001,
  'Fault Code High',
  1,
  'Fault Code Low',
  1,
  'Line Current (A)',
  0.1,
  'Line Voltage (V)',
  0.1,
  'AC Frequency (Hz)',
  0.01,
  'AC Power (W)',
  1,
  'Zac (Ohms)',
  0.001,
  'Accumulated Energy High Word',
  1,
  'Accumulated Energy Low Word',
  0.1,
  'GFCI F-Value Volts (V)',
  0.1,
  'GFCI F-Value Hz (Hz)',
  0.01,
  'GZ F-Value Ohm (Ohms)',
  0.001
];

function constructSerialPort() {
  return new SerialPort(
    'COM1',
    {
      autoOpen: false,
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

function appendDataToFile(data) {
  fs.appendFile(
    './data/data.json',
    JSON.stringify(data, null, 2) + ',\n',
    (err) => {
      if (err) throw err;
      console.log('Data written to file');
    }
  );
}

function parseData(arr) {
  let object = {};
  object['Date Time'] = new Date();
  for (let i = 0; i < 21; i++) {
    let temp = (arr[9 + i * 2] << 8) + arr[10 + i * 2];
    object[dataLabels[i * 2]] = temp * dataLabels[i * 2 + 1];
    //console.log(`${dataLabels[i * 2]} - ${temp * dataLabels[i * 2 + 1]}`);
  }
  appendDataToFile(object);
  return object;
}
var namespace = {};
namespace.port = constructSerialPort();
namespace.port.open();
function initNewCommunication(port) {
  delete namespace.com;
  port.close();
}
function onOpen() {
  const parser = new ByteLength({ length: 12 });
  namespace.com = new serialCommunicator(namespace.port, parser);
  namespace.com.startCommunication();
}
function reconnect() {
  console.log(`reconnect initiated`);
  namespace.port = constructSerialPort();
  namespace.port.open();
}
namespace.port.on('close', (err) => {
  console.log(`Port closed.`);
  reconnect(); // Serial Port Initialization Function. It's your method to declare serial port.
});

namespace.port.on('open', onOpen);

class serialCommunicator extends EventEmitter {
  constructor(port, parser) {
    super();
    this.lastDataReadTimestamp;
    this.currentDataReadTimestamp;
    this.listener;
    this.port = port;

    this.setParser(parser);

    this.on('log_in', function() {
      console.log(`${new Date().toLocaleString()} log_in event fired`);
      this.setListener(1000 * 3, commands.getData);
      const parser = new ByteLength({ length: 53 });
      this.setParser(parser);
    });

    this.on('data', function() {
      console.log(`${new Date().toLocaleString()} data read event fired`);
      // if (this.lastDataReceivedBeforeGivenMinutes(30)) {
      if (true) {
        console.log(
          `${new Date().toLocaleString()} last data read was found ago 30 or more minutes!`
        );
        this.clearListener();
        //this.parser.removeAllListeners('data');
        initNewCommunication(this.port);
      }
    });
  }
  writeAndDrain(data) {
    var port = this.port;
    console.log(`Data sent to inverter: ${data}`);
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
  lastDataReceivedBeforeGivenMinutes(amountOfMinutes) {
    this.lastDataReadTimestamp = this.currentDataReadTimestamp || new Date();
    this.currentDataReadTimestamp = new Date();
    let dateDiffInMinutes =
      (this.currentDataReadTimestamp - this.lastDataReadTimestamp) /
      (1000 * 60);
    return dateDiffInMinutes >= amountOfMinutes;
  }
  dataReceived(data) {
    let hexByteDataArr = [...data];
    let dataLength = hexByteDataArr.length;
    console.log(dataLength);
    if (dataLength === 22) {
      console.log(
        `${new Date().toLocaleString()} Serial Number received - ${hexByteDataArr}`
      );
      this.emit('serial_number');
    }
    if (dataLength === 12) {
      console.log(
        `${new Date().toLocaleString()} Log In received - ${hexByteDataArr}`
      );
      this.emit('log_in');
    }
    if (dataLength === 53) {
      console.log(
        `${new Date().toLocaleString()} Data From Inverter received - ${hexByteDataArr}`
      );
      this.emit('data');
      parseData(hexByteDataArr);
    }
  }
  startCommunication() {
    this.setListener(1000 * 3, commands.logIn);
  }
  attachDataEventOnParser() {
    this.parser.on('data', this.dataReceived.bind(this));
  }
  setParser(parser) {
    this.parser = parser;

    this.port.unpipe();
    this.port.pipe(parser);
    this.attachDataEventOnParser();
  }
  clearListener() {
    //console.log(`listener ${this.listener.toString()} stopped!`);
    clearInterval(this.listener);
    //console.log(`${JSON.stringify(this)}`);
  }
  setListener(timeout, command) {
    if (this.listener) clearInterval(this.listener);
    this.listener = setInterval(() => {
      this.writeAndDrain(command);
    }, timeout);
  }
}
