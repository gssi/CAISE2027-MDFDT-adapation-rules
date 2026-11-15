/**
 * The check run against a Brick Daemon, real or not: list what is attached,
 * read every Bricklet of the catalogue through the connector, and compare the
 * values with the ranges Tinkerforge documents for each Bricklet.
 */
import { connectorInfo } from "@/connectors/catalogue";
import { type DeviceSpec, type Discovered, type Reading } from "@/engine/devices";
import { discoverDevice, readDevice } from "@/server/connectors";

/** Plausible values, in the unit of the catalogue, from the documented ranges. */
const RANGE: Record<string, [number, number]> = {
  temperature: [-45, 165],
  humidity: [0, 100],
  illuminance: [0, 64000.01],
  co2_concentration: [0, 40000],
  iaq_index: [0, 500],
  air_pressure: [260, 1260],
  distance: [0, 65535],
  decibel: [0, 120],
  count: [0, 8], // the NFC Bricklet remembers up to eight tags
};

export interface HardwareReport {
  found: Discovered[];
  readings: Reading[];
  problems: string[];
  text: string;
}

export async function checkHardware(host: string, port: number): Promise<HardwareReport> {
  const tinkerforge = connectorInfo("tinkerforge")!;
  const device: DeviceSpec = { model: "live", id: "device", connector: "tinkerforge", settings: { host, port }, sensors: [] };
  const found = await discoverDevice(device);
  device.sensors = found
    .filter((item) => item.kind)
    .map((item) => {
      const kind = tinkerforge.sensors.find((s) => s.kind === item.kind)!;
      return {
        id: `${kind.kind}_${item.uid}`,
        kind: kind.kind,
        uid: item.uid,
        settings: {},
        operations: [],
        parameters: kind.parameters.map((p) => ({
          name: p.name,
          key: `${kind.kind}_${item.uid}_${p.name}`,
          eType: p.eType,
          unit: p.unit ?? null,
          meaning: p.meaning ?? null,
        })),
      };
    });
  const readings = device.sensors.length ? await readDevice(device) : [];
  const problems: string[] = [];
  if (!found.length) problems.push("no Brick or Bricklet answered the enumeration");
  for (const reading of readings) {
    const name = `${reading.sensor}.${reading.parameter}`;
    const range = RANGE[reading.parameter];
    if (reading.error !== undefined) problems.push(`${name}: ${reading.error}`);
    else if (range && !(Number(reading.value) >= range[0] && Number(reading.value) <= range[1])) {
      problems.push(`${name} = ${String(reading.value)} is outside ${range[0]}..${range[1]}`);
    } else if (!range && typeof reading.value !== "boolean") {
      problems.push(`${name} = ${String(reading.value)} is not a Boolean`);
    }
  }
  const text = [
    `Attached to ${host}:${port}`,
    ...found.map((item) => `  ${item.uid.padEnd(8)} ${item.label}${item.kind ? "" : "  (not in the catalogue)"}`),
    "Readings",
    ...readings.map(
      (r) => `  ${r.sensor}.${r.parameter} = ${r.error === undefined ? String(r.value) : `ERROR ${r.error}`}`,
    ),
  ].join("\n");
  return { found, readings, problems, text };
}
