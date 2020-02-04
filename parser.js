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

module.exports = parseData;
