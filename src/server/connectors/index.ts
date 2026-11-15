/**
 * The connectors the platform can use, by the `connector` setting of a device.
 * Adding a kind of device takes its description in `src/connectors/catalogue.ts`
 * and its driver here.
 */
import { checkArguments, type DeviceSpec, type Discovered, type Reading } from "@/engine/devices";
import { type Dict } from "@/engine/kernel/model";

import { simulated } from "./simulated";
import { tinkerforgeConnector, type TinkerforgeLibrary } from "./tinkerforge";
import { type DeviceConnector } from "./types";

export const connectors: Record<string, DeviceConnector> = {
  simulated,
  tinkerforge: tinkerforgeConnector(async () => (await import("tinkerforge")).default as TinkerforgeLibrary),
};

const all = (device: DeviceSpec, error: string): Reading[] =>
  device.sensors.flatMap((sensor) =>
    sensor.parameters.map((parameter) => ({ sensor: sensor.id, parameter: parameter.name, key: parameter.key, error })),
  );

/** Read every sensor of a device; a device that cannot be reached yields an error per parameter. */
export async function readDevice(device: DeviceSpec, known = connectors): Promise<Reading[]> {
  const connector = known[device.connector];
  if (!connector) return all(device, `no connector of type '${device.connector}'`);
  try {
    return await connector.read(device);
  } catch (error) {
    return all(device, error instanceof Error ? error.message : String(error));
  }
}

export async function discoverDevice(device: DeviceSpec, known = connectors): Promise<Discovered[]> {
  const connector = known[device.connector];
  if (!connector) throw new Error(`no connector of type '${device.connector}'`);
  if (!connector.discover) throw new Error(`a ${device.connector} device cannot list its sensors`);
  return connector.discover(device);
}

/**
 * Ask a part of a device to do something its class declares. The call is
 * checked against the model first: the part, the operation and the types of
 * the arguments.
 */
export async function invokeOperation(
  device: DeviceSpec,
  partId: string,
  operation: string,
  args: Dict,
  known = connectors,
): Promise<void> {
  const connector = known[device.connector];
  if (!connector) throw new Error(`no connector of type '${device.connector}'`);
  if (!connector.invoke) throw new Error(`a ${device.connector} device takes no actions`);
  const part = device.sensors.find((sensor) => sensor.id === partId);
  if (!part) throw new Error(`${device.id} has no part ${partId}`);
  const declared = part.operations.find((o) => o.name === operation);
  if (!declared) throw new Error(`${partId} has no operation ${operation}`);
  const problems = checkArguments(declared, args);
  if (problems.length) throw new Error(problems.join("; "));
  await connector.invoke(device, part, operation, args);
}
