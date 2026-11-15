import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import { type DeviceSpec, type Discovered, type Reading } from "@/engine/devices";

import { type DeviceConnector } from "./types";

type Callback<T> = (value: T) => void;

/** The part of the Tinkerforge bindings the connector uses. */
export interface TinkerforgeConnection {
  connect(host: string, port: number, onError: Callback<number>): void;
  disconnect(onError?: Callback<number>): void;
  enumerate(onError?: Callback<number>): void;
  setTimeout?(milliseconds: number): void;
  setAutoReconnect?(reconnect: boolean): void;
  on(event: number, handler: (...values: unknown[]) => void): void;
}

export interface TinkerforgeLibrary {
  IPConnection: {
    new (): TinkerforgeConnection;
    CALLBACK_ENUMERATE: number;
    CALLBACK_CONNECTED: number;
    ENUMERATION_TYPE_DISCONNECTED: number;
  };
  [bricklet: string]: unknown;
}

type Bricklet = Record<string, (...args: unknown[]) => void>;
type BrickletClass = new (uid: string, connection: TinkerforgeConnection) => Bricklet;

const ERRORS: Record<number, string> = {
  11: "already connected",
  12: "not connected",
  13: "the Brick Daemon cannot be reached",
  21: "the Bricklet does not know this function",
  31: "the Bricklet does not answer (timeout): check that it is plugged in and its UID",
  41: "invalid parameter",
  42: "function not supported",
  81: "the UID belongs to another kind of Bricklet",
  82: "the Bricklet was replaced",
};
const describe = (code: unknown) => ERRORS[Number(code)] ?? `Tinkerforge error ${String(code)}`;

const WAIT = 4000;

/** What the bindings call a device they know, by its identifier. */
function nameOf(library: TinkerforgeLibrary, identifier: unknown): string | null {
  for (const candidate of Object.values(library)) {
    if (typeof candidate !== "function") continue;
    const device = candidate as unknown as { DEVICE_IDENTIFIER?: number; DEVICE_DISPLAY_NAME?: string };
    if (device.DEVICE_IDENTIFIER === identifier && device.DEVICE_DISPLAY_NAME) return device.DEVICE_DISPLAY_NAME;
  }
  return null;
}

function connect(library: TinkerforgeLibrary, device: DeviceSpec): Promise<TinkerforgeConnection> {
  const host = String(device.settings.host ?? "localhost");
  const port = Number(device.settings.port ?? 4223);
  const connection = new library.IPConnection();
  connection.setAutoReconnect?.(false);
  connection.setTimeout?.(2500);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      connection.disconnect(() => undefined);
      reject(new Error(`no Brick Daemon answers at ${host}:${port}`));
    }, WAIT);
    connection.on(library.IPConnection.CALLBACK_CONNECTED, () => {
      clearTimeout(timer);
      resolve(connection);
    });
    connection.connect(host, port, (code) => {
      clearTimeout(timer);
      reject(new Error(`${describe(code)} (${host}:${port})`));
    });
  });
}

/** Call a function of the bindings; resolves with everything it returns. */
function call(bricklet: Bricklet, name: string, args: unknown[] = []): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    if (typeof bricklet[name] !== "function") reject(new Error(`the bindings have no ${name}`));
    else {
      bricklet[name](
        ...args,
        (...values: unknown[]) => resolve(values),
        (code: unknown) => reject(new Error(describe(code))),
      );
    }
  });
}

// -- parameters a single call of the bindings cannot give ---------------------

const NFC_SIMPLE = 4; // BrickletNFC.MODE_SIMPLE: the Bricklet reads tag IDs by itself
const NFC_SLOTS = 8; // "Up to eight tags are saved"
const TAP_GAP = 3000; // sightings of a tag closer than this are one tap

interface TapCounter {
  started: boolean;
  /** tag id -> whether it is inside, and when it was last seen (connector clock, ms) */
  tags: Map<string, { inside: boolean; last: number }>;
}

/** What the NFC tap counters know; kept while the server runs. */
const counters = new Map<string, TapCounter>();
const counterKey = (device: DeviceSpec, uid: string) =>
  `${String(device.settings.host ?? "localhost")}:${String(device.settings.port ?? 4223)}:${uid}`;

/**
 * People inside, estimated from the taps on an NFC Bricklet in Simple mode: the
 * Bricklet lists the tags it saw with the time since it last saw each. A tag
 * seen again after a pause is a new tap, and a tap moves its tag in or out.
 * What the Bricklet already lists when counting starts is not a tap.
 */
async function nfcTapCount(bricklet: Bricklet, counter: TapCounter, now: number): Promise<number> {
  const [mode] = await call(bricklet, "getMode");
  if (mode !== NFC_SIMPLE) await call(bricklet, "setMode", [NFC_SIMPLE]);
  for (let index = 0; index < NFC_SLOTS; index++) {
    let entry: unknown[];
    try {
      entry = await call(bricklet, "simpleGetTagID", [index]);
    } catch {
      break; // the Bricklet is still getting ready for this mode: nothing to count yet
    }
    const [, id, lastSeen] = entry;
    if (!Array.isArray(id) || id.length === 0) continue;
    const tag = id.join(":");
    const sighting = now - Number(lastSeen);
    const known = counter.tags.get(tag);
    if (!counter.started) counter.tags.set(tag, { inside: false, last: sighting });
    else if (!known) counter.tags.set(tag, { inside: true, last: sighting });
    else if (sighting > known.last + TAP_GAP) {
      known.inside = !known.inside;
      known.last = sighting;
    } else known.last = Math.max(known.last, sighting);
  }
  counter.started = true;
  return [...counter.tags.values()].filter((tag) => tag.inside).length;
}

/**
 * Bricklets behind a Brick Daemon. The library and the clock are parameters so
 * that the connector can be exercised without hardware.
 */
export function tinkerforgeConnector(
  load: () => TinkerforgeLibrary | Promise<TinkerforgeLibrary>,
  clock: () => number = Date.now,
): DeviceConnector {
  return {
    type: "tinkerforge",

    async read(device: DeviceSpec): Promise<Reading[]> {
      const all = device.sensors.flatMap((sensor) =>
        sensor.parameters.map((parameter) => ({ sensor: sensor.id, parameter: parameter.name, key: parameter.key })),
      );
      let library: TinkerforgeLibrary;
      let connection: TinkerforgeConnection;
      try {
        library = await load();
        connection = await connect(library, device);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        return all.map((reading) => ({ ...reading, error: reason }));
      }
      const readings: Reading[] = [];
      try {
        for (const sensor of device.sensors) {
          const known = sensorKind("tinkerforge", sensor.kind);
          const BrickletOf = known ? (library[String(known.driver?.className)] as BrickletClass | undefined) : undefined;
          const bricklet = known && BrickletOf && sensor.uid ? new BrickletOf(sensor.uid, connection) : null;
          for (const parameter of sensor.parameters) {
            const base = { sensor: sensor.id, parameter: parameter.name, key: parameter.key };
            const how = known?.parameters.find((p) => p.name === parameter.name)?.driver;
            if (!known) readings.push({ ...base, error: `unknown kind of Bricklet '${sensor.kind}'` });
            else if (!sensor.uid) readings.push({ ...base, error: "the sensor has no UID" });
            else if (!bricklet) readings.push({ ...base, error: `the bindings have no ${known.driver?.className}` });
            else if (!how) readings.push({ ...base, error: `a ${sensor.kind} has no parameter '${parameter.name}'` });
            else {
              try {
                if (how.reader === "nfcTapCount") {
                  const slot = counterKey(device, sensor.uid);
                  if (!counters.has(slot)) counters.set(slot, { started: false, tags: new Map() });
                  readings.push({ ...base, value: await nfcTapCount(bricklet, counters.get(slot)!, clock()) });
                  continue;
                }
                const returned = await call(bricklet, String(how.getter));
                const raw = returned[typeof how.index === "number" ? how.index : 0];
                const value =
                  how.equals !== undefined
                    ? raw === how.equals
                    : parameter.eType === "EBoolean"
                      ? raw === true || raw === 1
                      : typeof how.scale === "number"
                        ? Math.round(Number(raw) * how.scale * 1000) / 1000
                        : Number(raw);
                readings.push({ ...base, value });
              } catch (error) {
                readings.push({ ...base, error: error instanceof Error ? error.message : String(error) });
              }
            }
          }
        }
      } finally {
        connection.disconnect(() => undefined);
      }
      return readings;
    },

    async invoke(device, part, operation, args) {
      const known = sensorKind("tinkerforge", part.kind);
      const how = known?.operations?.find((o) => o.name === operation);
      if (!known) throw new Error(`unknown kind of Bricklet '${part.kind}'`);
      if (!part.uid) throw new Error("the part has no UID");
      if (how?.driver?.special === "nfcReset") {
        counters.get(counterKey(device, part.uid))?.tags.forEach((tag) => (tag.inside = false));
        return;
      }
      if (!how?.driver?.setter) throw new Error(`a ${part.kind} cannot ${operation}`);
      // the device takes the arguments in the order the catalogue gives them
      const ordered = how.parameters.map((p) => {
        const value = args[p.name];
        if (typeof value === "number" && ((p.min !== undefined && value < p.min) || (p.max !== undefined && value > p.max))) {
          throw new Error(`${p.name} must be between ${p.min} and ${p.max}`);
        }
        return value;
      });
      const library = await load();
      const BrickletOf = library[String(known.driver?.className)] as BrickletClass | undefined;
      if (!BrickletOf) throw new Error(`the bindings have no ${known.driver?.className}`);
      const connection = await connect(library, device);
      try {
        const bricklet = new BrickletOf(part.uid, connection);
        // ask the Bricklet to confirm, so that an action that did not arrive is an error
        (bricklet as unknown as { setResponseExpectedAll?: (expected: boolean) => void }).setResponseExpectedAll?.(true);
        await call(bricklet, String(how.driver.setter), ordered);
      } finally {
        connection.disconnect(() => undefined);
      }
    },

    async discover(device: DeviceSpec): Promise<Discovered[]> {
      const library = await load();
      const connection = await connect(library, device);
      const found = new Map<string, Discovered>();
      const kinds = connectorInfo("tinkerforge")?.sensors ?? [];
      try {
        connection.on(library.IPConnection.CALLBACK_ENUMERATE, (uid, _parent, _position, _hardware, _firmware, id, type) => {
          if (type === library.IPConnection.ENUMERATION_TYPE_DISCONNECTED) return;
          const known = kinds.find((kind) => kind.driver?.identifier === id);
          found.set(String(uid), {
            kind: known?.kind ?? null,
            uid: String(uid),
            label: known?.label ?? nameOf(library, id) ?? `device identifier ${String(id)}`,
          });
        });
        connection.enumerate();
        await new Promise((resolve) => setTimeout(resolve, 800));
      } finally {
        connection.disconnect(() => undefined);
      }
      return [...found.values()];
    },
  };
}
