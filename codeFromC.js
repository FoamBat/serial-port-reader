let PowerCom = {};

/* open device */
//device = Pc_open_device('/dev/ttyUSB0', 9600, 0, 8, 1);

/* print debugging informations */
//Pc_verbose = 1;

/* try to read registers first */
// PowerCom.device = device;
// PowerCom.timeout = 500;
// PowerCom.function = 4;

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
/* compute crc */
calculateChecksum(trame);

/* compute length of the packet to send */
long_emit = 11;
/* compute length of the slave answer */
longueur = 11 + 11; // 11 Header+checksum, 11 payload

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
