const events = require('events');
const EventEmitter = events.EventEmitter;

class SerialCommunicator extends EventEmitter {
  constructor(port, parser) {
    super();
    this.lastDataReadTimestamp;
    this.currentDataReadTimestamp;
    this.listener;
    this.port = port;
    this.setParser(parser);
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
    console.log(`${dateDiffInMinutes} minutes before last data read`);
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
      this.emit('data', hexByteDataArr);
    }
  }
  startCommunication(startCommand, logInInterval) {
    this.setListener(logInInterval, startCommand);
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
    clearInterval(this.listener);
  }
  setListener(timeout, command) {
    if (this.listener) clearInterval(this.listener);
    this.listener = setInterval(() => {
      this.writeAndDrain(command);
    }, timeout);
  }
}

module.exports = SerialCommunicator;
