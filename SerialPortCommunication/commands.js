const inverterSerialNumber = [49, 48, 48, 48, 49, 56, 53, 49, 49, 48, 49]; // 11 Bytes

//10001851101

function calculateChecksum(command) {
  const length = command.length;
  const checksum = command.reduce((acc, val) => {
    return acc + val;
  }, 0);
  command[length] = checksum >> 8;
  command[length + 1] = checksum & 255;
  //console.log(command + ' len = ' + command.length);
  return command;
}

const commands = {
  getSerialNumber: calculateChecksum([187, 187, 0, 0, 0, 0, 0, 0, 0]),
  getConfigurations: calculateChecksum([187, 187, 1, 0, 0, 1, 1, 4, 0]),
  getData: calculateChecksum([187, 187, 1, 0, 0, 1, 1, 2, 0]),
  // format of LogIn command [9 bytes + 11 bytes of serial number + 2 bytes of checksum]
  logIn: calculateChecksum(
    [187, 187, 0, 0, 0, 0, 0, 1, 12].concat(inverterSerialNumber, 1)
  )
};

module.exports = commands;
