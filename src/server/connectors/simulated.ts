import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import { type DeviceSpec, type Reading } from "@/engine/devices";
import { type Dict } from "@/engine/kernel/model";

import { type DeviceConnector } from "./types";

const DEFAULT: Record<string, unknown> = { EBoolean: true, EInt: 2, EDouble: 21.5, EString: "" };

function parse(text: string, etype: string): unknown {
  if (etype === "EBoolean") return text.trim().toLowerCase() === "true";
  if (etype === "EInt") return Math.trunc(Number(text));
  if (etype === "EDouble") return Number(text);
  return text;
}

/** What simulated parts were asked to do: the state of a switch, the calls a buzzer got. */
const state = new Map<string, unknown>();
export const simulatedCalls: { part: string; operation: string; args: Dict }[] = [];
const slot = (device: DeviceSpec, part: string) => `${device.model}#${device.id}#${part}`;

/** Sensors that report the value they are configured with, and parts that do what they are asked. */
export const simulated: DeviceConnector = {
  type: "simulated",
  async read(device: DeviceSpec): Promise<Reading[]> {
    return device.sensors.flatMap((sensor) => {
      const known = sensorKind("simulated", sensor.kind);
      const wanted = String(sensor.settings.value ?? "").trim();
      return sensor.parameters.map((parameter): Reading => {
        const base = { sensor: sensor.id, parameter: parameter.name, key: parameter.key };
        if (!known) return { ...base, error: `unknown kind of sensor '${sensor.kind}'` };
        if (!known.parameters.some((p) => p.name === parameter.name)) {
          return { ...base, error: `a ${sensor.kind} has no parameter '${parameter.name}'` };
        }
        if (wanted === "fail") return { ...base, error: "the sensor does not answer" };
        if (sensor.kind === "switch") return { ...base, value: state.get(slot(device, sensor.id)) ?? false };
        return { ...base, value: wanted ? parse(wanted, parameter.eType) : DEFAULT[parameter.eType] };
      });
    });
  },
  async invoke(device, part, operation, args) {
    const known = sensorKind("simulated", part.kind)?.operations?.find((o) => o.name === operation);
    if (!known) throw new Error(`a ${part.kind} cannot ${operation}`);
    if (String(part.settings.value ?? "") === "fail") throw new Error("the device does not answer");
    simulatedCalls.push({ part: part.id, operation, args });
    if (part.kind === "switch") state.set(slot(device, part.id), args.on);
  },
  /** The parts of the model, and one part of every kind of the catalogue: a simulated device has them all. */
  async discover(device: DeviceSpec) {
    const modelled = device.sensors.map((sensor) => ({
      kind: sensor.kind,
      uid: sensor.uid || sensor.id,
      label: sensorKind("simulated", sensor.kind)?.label ?? sensor.kind,
    }));
    const offered = (connectorInfo("simulated")?.sensors ?? [])
      .map((kind) => ({ kind: kind.kind, uid: kind.kind, label: kind.label }))
      .filter((part) => !modelled.some((known) => known.uid === part.uid));
    return [...modelled, ...offered];
  },
};
