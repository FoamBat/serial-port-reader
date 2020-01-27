const inverterSerialNumber = [31, 30, 30, 30, 31, 38, 35, 31, 31, 30, 31]; // 11 Bytes

function calculateChecksum(command) {
  console.log(command + ' len = ' + command.length);
  const length = command.length;
  const checksum = command.reduce((acc, val) => {
    return acc + val;
  }, 0);
  command[length] = checksum >> 8;
  command[length + 1] = checksum & 255;
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
