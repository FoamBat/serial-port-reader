const events = require('events');
const EventEmitter = events.EventEmitter;

class SerialCommunicator extends EventEmitter {
  constructor(port, parser) {
    super();
    this.lastDataReadTimestamp;
    this.currentDataReadTimestamp;
    this.listener;
    this.inverterNumber;
    this.port = port;
    this.path = port.path;
    this.setParser(parser);
  }
  writeAndDrain(data) {
    var port = this.port;
    console.log(
      `${new Date().toLocaleString()} Data sent to inverter (${
        port.path
      }): ${data}`
    );
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
    console.log(
      `${new Date().toLocaleString()} (${
        this.path
      }) ${dateDiffInMinutes} minutes before last data read`
    );
    return dateDiffInMinutes >= amountOfMinutes;
  }
  dataReceived(data) {
    let decimalByteDataArr = [...data];
    let dataLength = decimalByteDataArr.length;
    console.log(dataLength);
    if (dataLength === 22) {
      console.log(
        `${new Date().toLocaleString()} (${
          this.path
        }) Serial Number received - ${decimalByteDataArr}`
      );
      this.emit('serial_number', decimalByteDataArr);
    }
    if (dataLength === 12) {
      console.log(
        `${new Date().toLocaleString()} (${
          this.path
        }) Log In received - ${decimalByteDataArr}`
      );
      this.emit('log_in', decimalByteDataArr);
    }
    if (dataLength === 53) {
      console.log(
        `${new Date().toLocaleString()} (${
          this.path
        }) Data From Inverter received - ${decimalByteDataArr}`
      );
      this.emit('data', decimalByteDataArr);
    }
  }
  attachDataEventOnParser() {
    this.parser.on('data', this.dataReceived.bind(this));
  }
  setInverterNumber(inverterNumber) {
    this.inverterNumber = inverterNumber;
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
  setListener(command, timeout) {
    if (this.listener) clearInterval(this.listener);
    this.listener = setInterval(() => {
      this.writeAndDrain(command);
    }, timeout);
  }
}

module.exports = SerialCommunicator;
