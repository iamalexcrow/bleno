const fs = require("fs");
const bleno = require("bleno");

// Read XML file and convert to a buffer
const xmlFilePath = "./mpb-gatt-nrf.xml";
const xmlData = fs.readFileSync(xmlFilePath, "utf8");
const xmlBuffer = Buffer.from(xmlData, "utf8");

const serviceUuid = "7d8923f0-fb2d-4a2c-80ed-898559dee4d2";
let params = [];

const characteristics = xmlData.split("<characteristic").slice(1);
characteristics.forEach((p) => {
  const data = {
    uuid: p.split('uuid="')[1].slice(0, 36),
    properties: [],
  };
  const properties = p.split("property").slice(1);
  let par = [];
  properties.forEach((pr) => {
    const x = pr.split("/>").slice(0, 1);
    x.forEach((s) => {
      const z = s.split("=")[1].slice(1, -1);
      par.push(z);
    });
  });
  data.properties = par;
  params.push(data);
});
// Define UUIDs for service and characteristic

const properties = [];
params.forEach((p) => {
  properties.push(
    new bleno.Characteristic({
      uuid: p.uuid,
      properties: p.properties,
      // value: Buffer.from(xmlBuffer),
    })
  );
});

const primaryService = new bleno.PrimaryService({
  uuid: serviceUuid,
  characteristics: properties,
});

bleno.on("stateChange", (state) => {
  if (state === "poweredOn") {
    bleno.startAdvertising("YourDeviceName", [primaryService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on("advertisingStart", (error) => {
  if (!error) {
    console.log("Advertising started");
  }
});

bleno.on("advertisingStop", () => {
  console.log("Advertising stopped");
});
