/** From a model to physical devices: what a model describes, and what connectors read. */
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CONNECTORS, connectorInfo, sensorKind } from "@/connectors/catalogue";
import {
  addDevice,
  addSensor,
  linkParameter,
  linkTargets,
  observeParameter,
  usersOf,
} from "@/components/workbench/edits";
import { runTrigger } from "@/engine/assistant/session";
import { checkConformance } from "@/engine/conformance";
import { availableKeys, devicesOf, providedKeys, toBatch, type DeviceSpec } from "@/engine/devices";
import { cloneFederation, type Federation } from "@/engine/federation";
import { applyEdit, extract, gateFor } from "@/engine/modelset";
import { buildGraph } from "@/diagram/graph";
import { nodeSize } from "@/diagram/layout";
import { liveValues } from "@/engine/runtime/live";
import { project } from "@/engine/runtime/projection";
import { linksOfType } from "@/engine/weaving/model";
import { discoverDevice, invokeOperation, readDevice } from "@/server/connectors";
import { simulatedCalls } from "@/server/connectors/simulated";
import { tinkerforgeConnector, type TinkerforgeLibrary } from "@/server/connectors/tinkerforge";
import { readDir } from "@/server/repository";
import { settle } from "@/server/settle";

import { SCENARIO, afterA1, baseline, newRepo } from "./helpers";

const EDIT = path.join(SCENARIO, "devices", "edit", "room2");

/** Room 2 with a device and a presence sensor, as the example edit describes it. */
function withDevice(fed: Federation = baseline()): Federation {
  return applyEdit(fed, "room2", readDir(EDIT));
}

describe("devices in a model", () => {
  it("reads devices, their sensors and what they sense from the model", () => {
    const fed = withDevice();
    expect(devicesOf(fed, "room2")).toEqual([
      {
        model: "room2",
        id: "hub",
        connector: "simulated",
        settings: {},
        sensors: [
          {
            id: "presence",
            kind: "presence",
            uid: "",
            settings: { value: "true" },
            parameters: [{ name: "detected", key: "occupied", eType: "EBoolean", unit: null, meaning: "occupancy" }],
            operations: [],
          },
        ],
      },
    ]);
    expect(devicesOf(fed, "room1")).toEqual([]);
    expect(devicesOf(baseline(), "room2")).toEqual([]);
  });

  it("counts what the sensors provide among the keys the model can bind", () => {
    const fed = withDevice();
    delete fed.capabilities.room2.occupied; // nothing reported it: the sensor provides it
    expect(providedKeys(fed, "room2")).toEqual({ occupied: { eType: "EBoolean", meaning: "occupancy" } });
    expect(Object.keys(availableKeys(fed, "room2"))).toEqual(["occupied"]);
    expect(checkConformance(fed)).toEqual([]);
    expect(gateFor(fed, "room2")).toEqual([]);
  });

  it("rejects an observation bound to a key that neither a sensor nor the DT provides", () => {
    const fed = withDevice();
    delete fed.capabilities.room2.occupied;
    fed.models.room2.objects.presence.bindings = { detected: "presence" };
    expect(gateFor(fed, "room2").map((i) => i.check)).toEqual(["O0->data"]);
  });

  it("keeps the keys a sensor provides out of what the DT must emit twice", () => {
    const emits = project(withDevice()).dts.room2.emits as { key: string; element: string }[];
    expect(emits.map((e) => e.element)).toEqual(["room2#occupancy.occupied"]);
  });

  it("is generic: the engine only knows the two concepts, not the connectors", () => {
    const fed = withDevice();
    fed.models.room2.objects.hub.slots.connector = "some-other-fieldbus";
    expect(devicesOf(fed, "room2")[0].connector).toBe("some-other-fieldbus");
    expect(gateFor(fed, "room2")).toEqual([]);
  });
});

describe("modelling a device from the catalogue", () => {
  it("describes a Tinkerforge device and its Bricklets as classes and objects that conform", () => {
    const fed = cloneFederation(baseline());
    const tinkerforge = connectorInfo("tinkerforge")!;
    const device = addDevice(fed, "room1", tinkerforge)!;
    expect(device).toBe("tinkerforge_device");
    expect(fed.models.room1.objects[device].slots).toEqual({ connector: "tinkerforge", host: "localhost", port: 4223 });
    const humidity = addSensor(fed, "room1", device, tinkerforge, sensorKind("tinkerforge", "humidity_v2")!)!;
    const second = addSensor(fed, "room1", device, tinkerforge, sensorKind("tinkerforge", "temperature_v2")!)!;

    const type = fed.models["room1@1"];
    expect(type.eClasses.TinkerforgeDevice.instanceOf).toBe("Device");
    expect(type.eClasses.HumidityV2.instanceOf).toBe("Sensor");
    expect(type.eClasses.HumidityV2.eAttributes.humidity).toMatchObject({ eType: "EDouble", unit: "percent" });
    // two sensors sense a temperature: each provides a key of its own
    expect(fed.models.room1.objects[humidity].bindings).toEqual({ humidity: "humidity", temperature: "temperature" });
    expect(fed.models.room1.objects[second].bindings).toEqual({ temperature: "temperature_v2_temperature" });
    expect(gateFor(fed, "room1")).toEqual([]);

    const [spec] = devicesOf(fed, "room1");
    expect(spec.settings).toEqual({ host: "localhost", port: 4223 });
    expect(spec.sensors.map((s) => [s.kind, s.parameters.map((p) => p.key)])).toEqual([
      ["humidity_v2", ["humidity", "temperature"]],
      ["temperature_v2", ["temperature_v2_temperature"]],
    ]);
  });

  it("offers every connector with the settings and sensors it knows", () => {
    expect(CONNECTORS.map((c) => c.type)).toEqual(["tinkerforge", "simulated"]);
    for (const connector of CONNECTORS) {
      for (const sensor of connector.sensors) {
        expect(sensor.parameters.length + (sensor.operations?.length ?? 0)).toBeGreaterThan(0);
        expect(new Set(sensor.parameters.map((p) => p.name)).size).toBe(sensor.parameters.length);
      }
    }
  });
});

describe("from what is attached to a device to the model", () => {
  const tinkerforge = connectorInfo("tinkerforge")!;
  const co2 = sensorKind("tinkerforge", "co2_v2")!;
  const motion = sensorKind("tinkerforge", "motion_detector_v2")!;

  it("adds a device with the settings given, and a sensor with the UID it was found with", () => {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room1", tinkerforge, { host: "192.0.2.10" })!;
    expect(fed.models.room1.objects[device].slots).toEqual({ connector: "tinkerforge", host: "192.0.2.10", port: 4223 });
    const first = addSensor(fed, "room1", device, tinkerforge, motion, "Mot1")!;
    const second = addSensor(fed, "room1", device, tinkerforge, motion, "Abc")!;
    expect([first, second]).toEqual(["motion_detector_v2", "motion_detector_v2_Abc"]);
    expect(fed.models.room1.objects[first].slots.uid).toBe("Mot1");
    expect(fed.models.room1.objects[second].slots.uid).toBe("Abc");
    // the same parameter of two sensors provides two keys
    expect(fed.models.room1.objects[first].bindings.motion_detected).toBe("motion_detected");
    expect(fed.models.room1.objects[second].bindings.motion_detected).toBe("motion_detector_v2_Abc_motion_detected");
    expect(devicesOf(fed, "room1")[0].sensors.map((s) => s.uid)).toEqual(["Mot1", "Abc"]);
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("links a sensed parameter to an observation the model already has", () => {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room1", tinkerforge)!;
    const sensor = addSensor(fed, "room1", device, tinkerforge, motion, "Mot1")!;
    // the occupancy of Room 1 is fed by a reported key so far: free it
    delete fed.models.room1.objects.occupancy.bindings.occupied;
    expect(linkTargets(fed, "room1", sensor, "motion_detected")).toEqual(["occupancy.occupied"]);
    expect(linkParameter(fed, "room1", sensor, "motion_detected", "occupancy.occupied")).toBe(true);
    expect(fed.models.room1.objects.occupancy.bindings).toEqual({ occupied: "motion_detected" });
    expect(usersOf(fed, "room1", "motion_detected")).toEqual(["occupancy.occupied"]);
    expect(linkTargets(fed, "room1", sensor, "motion_detected")).toEqual([]);
    expect(gateFor(fed, "room1")).toEqual([]);
  });

  it("lets a key the DT reported go once the model reads the sensor instead", () => {
    const repo = newRepo();
    const fed = repo.federation();
    const device = addDevice(fed, "room1", tinkerforge)!;
    addSensor(fed, "room1", device, tinkerforge, motion, "Mot1");
    // the observation of the model reads what the sensor provides, directly
    fed.models.room1.objects.occupancy.bindings = { occupied: "motion_detected" };
    expect(usersOf(fed, "room1", "occupied")).toEqual([]);
    delete fed.capabilities.room1.occupied;
    expect(Object.keys(availableKeys(fed, "room1"))).toEqual(["motion_detected"]);
    expect(gateFor(fed, "room1")).toEqual([]);
    settle(repo, "room1", { kind: "edit", files: extract(fed, "room1") }, { decision: "accept" });
    expect(repo.federation().capabilities.room1).toEqual({});
    expect(repo.changes("room1", 2)).toContain("-room1.data.occupied:Capability {");
  });

  it("only offers observations of the same type and unit", () => {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room1", tinkerforge)!;
    const sensor = addSensor(fed, "room1", device, tinkerforge, co2, "2fmB")!;
    delete fed.models.room1.objects.occupancy.bindings.occupied;
    expect(linkTargets(fed, "room1", sensor, "co2_concentration")).toEqual([]);
  });

  it("models a sensed parameter as a new observation of the DT, fed by the sensor", () => {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room1", tinkerforge)!;
    const sensor = addSensor(fed, "room1", device, tinkerforge, co2, "2fmB")!;
    const observation = observeParameter(fed, "room1", sensor, "co2_concentration")!;
    const type = fed.models["room1@1"];
    expect(type.eClasses.Co2Concentration.instanceOf).toBe("Observation");
    expect(type.eClasses.Co2Concentration.eAttributes.co2_concentration).toMatchObject({ eType: "EInt", unit: "ppm" });
    expect(type.eClasses.Co2Concentration.eReferences.source.eType).toBe("Co2V2");
    expect(fed.models.room1.objects[observation]).toMatchObject({
      instanceOf: "Co2Concentration",
      bindings: { co2_concentration: "co2_concentration" },
      slots: { source: sensor },
    });
    expect(usersOf(fed, "room1", "co2_concentration")).toEqual([`${observation}.co2_concentration`]);
    expect(gateFor(fed, "room1")).toEqual([]);
    // what it observes is something an initiating DT can weave
    expect((project(fed).dts.room1.emits as { key: string }[]).map((e) => e.key)).toContain("co2_concentration");
  });
});

describe("live readings on the model", () => {
  it("puts a reading on the key, on the sensor, on the observation, and on what another DT receives", () => {
    const fed = withDevice();
    const values = liveValues(fed, {
      room2: [{ sensor: "presence", parameter: "detected", key: "occupied", value: true }],
    });
    expect(values).toEqual({
      "room2@data#occupied": { value: true },
      "room2#presence.detected": { value: true },
      "room2#occupancy.occupied": { value: true },
      "building#occupancy_r2.occupied": { value: true },
    });
  });

  it("carries a value through the mapping of a correspondence", () => {
    const fed = afterA1().federation(); // Building derives occupied = count > 0 from Room 1
    const values = (count: number) =>
      liveValues(fed, { room1: [{ sensor: "s", parameter: "count", key: "count", value: count }] });
    expect(values(3)["building#occupancy_r1.occupied"]).toEqual({ value: true });
    expect(values(0)["building#occupancy_r1.occupied"]).toEqual({ value: false });
    expect(values(3)["room1#people_count.count"]).toEqual({ value: 3 });
  });

  it("shows a sensor that does not answer wherever its value would be", () => {
    const fed = withDevice();
    const values = liveValues(fed, {
      room2: [{ sensor: "presence", parameter: "detected", key: "occupied", error: "the sensor does not answer" }],
    });
    for (const element of ["room2@data#occupied", "room2#occupancy.occupied", "building#occupancy_r2.occupied"]) {
      expect(values[element]).toEqual({ error: "the sensor does not answer" });
    }
  });

  it("shows the readings on the diagram without moving it as values change", () => {
    const fed = withDevice();
    const kinds = new Set(["binding", "correspondence"] as const);
    const graph = (value: unknown) =>
      buildGraph(fed, null, kinds, {
        values: liveValues(fed, { room2: [{ sensor: "presence", parameter: "detected", key: "occupied", value }] }),
      });
    const row = (spec: ReturnType<typeof graph>, id: string) => spec.nodes.find((n) => n.id === id)!.rows;
    const spec = graph(true);
    expect(row(spec, "room2#occupancy")).toEqual([{ text: "occupied ← occupied", value: { value: true } }]);
    expect(row(spec, "room2#presence")[0]).toEqual({ text: "detected → occupied", value: { value: true } });
    expect(row(spec, "room2@data#occupied")[0].value).toEqual({ value: true });
    // what Building receives shows even though nothing in its own model is bound
    expect(row(spec, "building#occupancy_r2")).toEqual([{ text: "occupied", value: { value: true } }]);
    expect(row(spec, "building#occupancy_r1")).toEqual([{ text: "occupied", value: null }]);

    const sizes = (s: ReturnType<typeof graph>) => s.nodes.map((n) => nodeSize(n));
    expect(sizes(graph(1234567.891))).toEqual(sizes(spec));
    // without live readings the rows are as they were
    expect(buildGraph(fed, null, kinds).nodes.find((n) => n.id === "building#occupancy_r2")!.rows).toEqual([]);
  });
});

describe("actions of a device, as operations of the model", () => {
  const simulatedInfo = connectorInfo("simulated")!;

  function withSwitch() {
    const fed = cloneFederation(baseline());
    const device = addDevice(fed, "room2", simulatedInfo)!;
    const lamp = addSensor(fed, "room2", device, simulatedInfo, sensorKind("simulated", "switch")!)!;
    const buzzer = addSensor(fed, "room2", device, simulatedInfo, sensorKind("simulated", "buzzer")!)!;
    return { fed, lamp, buzzer };
  }

  it("is part of the notation: a class declares operations with typed parameters", () => {
    const { fed } = withSwitch();
    const type = fed.models["room2@1"];
    expect(type.eClasses.Switch.instanceOf).toBe("Sensor"); // it senses its state and acts
    expect(type.eClasses.Buzzer.instanceOf).toBe("Actuator"); // it only acts
    expect(type.eClasses.Switch.eOperations?.set.eParameters.on.eType).toBe("EBoolean");
    expect(gateFor(fed, "room2")).toEqual([]);
    // it is stored with the model and read back
    const files = extract(fed, "room2");
    expect(files["type.mlm.yaml"]).toContain("eOperations:");
    expect(applyEdit(baseline(), "room2", files).models["room2@1"].eClasses.Buzzer.eOperations).toEqual(
      type.eClasses.Buzzer.eOperations,
    );
    // a class without operations is written as before
    expect(extract(baseline(), "room1")["type.mlm.yaml"]).not.toContain("eOperations");
  });

  it("rejects an operation whose parameter has no known type", () => {
    const { fed } = withSwitch();
    fed.models["room2@1"].eClasses.Switch.eOperations!.set.eParameters.on.eType = "Voltage";
    expect(gateFor(fed, "room2").map((i) => i.check)).toEqual(["O1->O2"]);
  });

  it("shows the operations on the class in the diagram", () => {
    const { fed } = withSwitch();
    const spec = buildGraph(fed, null, new Set());
    expect(spec.nodes.find((n) => n.id === "room2@1#Switch")!.rows.map((r) => r.text)).toEqual([
      "kind: EString",
      "uid: EString",
      "on: EBoolean",
      "set(on)",
    ]);
    expect(spec.nodes.find((n) => n.id === "room2@1#Buzzer")!.rows.map((r) => r.text)).toContain("beep(duration)");
  });

  it("lists what every part of a device can be asked to do", () => {
    const { fed, lamp, buzzer } = withSwitch();
    const [device] = devicesOf(fed, "room2");
    expect(device.sensors.map((part) => [part.id, part.parameters.length, part.operations])).toEqual([
      [lamp, 1, [{ name: "set", parameters: [{ name: "on", eType: "EBoolean", unit: null }] }]],
      [buzzer, 0, [{ name: "beep", parameters: [{ name: "duration", eType: "EInt", unit: "ms" }] }]],
    ]);
  });

  it("invoking an operation acts on the device, and what it senses follows", async () => {
    const { fed, lamp, buzzer } = withSwitch();
    const [device] = devicesOf(fed, "room2");
    const on = async () => (await readDevice(device)).find((r) => r.sensor === lamp)?.value;
    await invokeOperation(device, lamp, "set", { on: false });
    expect(await on()).toBe(false);
    await invokeOperation(device, lamp, "set", { on: true });
    expect(await on()).toBe(true);
    await invokeOperation(device, buzzer, "beep", { duration: 150 });
    expect(simulatedCalls.at(-1)).toEqual({ part: buzzer, operation: "beep", args: { duration: 150 } });
  });

  it("checks a call against the model before it reaches the device", async () => {
    const { fed, lamp } = withSwitch();
    const [device] = devicesOf(fed, "room2");
    const before = simulatedCalls.length;
    await expect(invokeOperation(device, lamp, "toggle", {})).rejects.toThrow("has no operation toggle");
    await expect(invokeOperation(device, lamp, "set", { on: 1 })).rejects.toThrow("on must be EBoolean");
    await expect(invokeOperation(device, lamp, "set", { on: true, fast: true })).rejects.toThrow("no parameter fast");
    await expect(invokeOperation({ ...device, connector: "modbus" }, lamp, "set", { on: true })).rejects.toThrow(
      "no connector of type 'modbus'",
    );
    expect(simulatedCalls.length).toBe(before);
  });

  it("is a change like any other: the operations show in the diff of the version", () => {
    const repo = newRepo();
    const { fed } = withSwitch();
    settle(repo, "room2", { kind: "edit", files: extract(fed, "room2") }, { decision: "accept" });
    const changes = repo.changes("room2", 2);
    expect(changes).toContain("+room2.Switch.set:EOperation {");
    expect(changes).toContain("+        on: EBoolean");
    expect(changes).toContain("+    eOperations *-->  [");
  });
});

describe("the simulated connector", () => {
  it("reads the configured value, or a default one", async () => {
    const [device] = devicesOf(withDevice(), "room2");
    expect(await readDevice(device)).toEqual([{ sensor: "presence", parameter: "detected", key: "occupied", value: true }]);
    device.sensors[0].settings.value = "false";
    expect((await readDevice(device))[0].value).toBe(false);
    device.sensors[0].settings.value = "";
    expect((await readDevice(device))[0].value).toBe(true);
  });

  it("reports an error per parameter instead of failing", async () => {
    const [device] = devicesOf(withDevice(), "room2");
    device.sensors[0].settings.value = "fail";
    expect((await readDevice(device))[0].error).toBe("the sensor does not answer");
    expect((await readDevice({ ...device, connector: "modbus" }))[0].error).toBe("no connector of type 'modbus'");
  });
});

describe("from a reading to the modeling layer", () => {
  /** A repository where Room 2 committed the device model. */
  function repoWithDevice() {
    const repo = newRepo();
    const files = extract(withDevice(repo.federation()), "room2");
    settle(repo, "room2", { kind: "edit", files }, { decision: "accept" });
    return repo;
  }

  it("a model that describes its device is a version like any other", () => {
    const repo = repoWithDevice();
    expect(repo.head("room2")).toBe(2);
    expect(repo.changes("room2", 2)).toContain("+room2.hub:SimulatedDevice {");
    expect(devicesOf(repo.federation(), "room2")).toHaveLength(1);
  });

  it("a reading that matches the model is no change at all", async () => {
    const repo = repoWithDevice();
    const fed = repo.federation();
    const readings = await readDevice(devicesOf(fed, "room2")[0]);
    const batch = toBatch(fed, "room2", readings, 100);
    expect(batch).toEqual({
      source: "room2",
      capabilities: { occupied: { eType: "EBoolean", meaning: "occupancy" } },
      observations: [{ key: "occupied", value: true, timestamp: 100 }],
    });
    const result = runTrigger(repo.versions(), "room2", { kind: "observations", batch })!;
    expect(result.changeset.changes).toEqual([]);
    expect(linksOfType(result.drift, "VerticalDrift")).toEqual([]);
  });

  it("a sensor that is gone reaches the model as bottom-up drift", async () => {
    const repo = repoWithDevice();
    const fed = repo.federation();
    const [device] = devicesOf(fed, "room2");
    device.sensors[0].settings.value = "fail"; // unplugged
    const batch = toBatch(fed, "room2", await readDevice(device), 100);
    expect(batch.capabilities).toEqual({});
    expect(batch.observations).toEqual([]);

    const result = runTrigger(repo.versions(), "room2", { kind: "observations", batch })!;
    expect(result.changeset.changes.map((c) => `${c.kind} ${c.element}`)).toEqual(["removed room2@data#occupied"]);
    const vertical = linksOfType(result.drift, "VerticalDrift");
    expect(vertical.map((v) => [v.props.origin, v.ends.lower, v.ends.upper])).toEqual([
      ["bottom-up", "room2@data#occupied", "room2@2#Occupancy.occupied"],
    ]);
    // and, through the weaving of Building, as horizontal drift for the DT that did not change
    expect(linksOfType(result.drift, "HorizontalDrift").map((h) => h.props.correspondence)).toEqual(["c-r2-occupancy"]);
  });

  it("a value of another type than the model says is a change too", async () => {
    const repo = repoWithDevice();
    const fed = repo.federation();
    const batch = toBatch(fed, "room2", [{ sensor: "presence", parameter: "detected", key: "occupied", value: 3 }], 100);
    const result = runTrigger(repo.versions(), "room2", { kind: "observations", batch })!;
    expect(result.changeset.changes.map((c) => c.kind)).toEqual(["modified"]);
    expect(linksOfType(result.drift, "VerticalDrift")).toHaveLength(1);
  });
});

describe("the Tinkerforge connector", () => {
  /** Stands in for the official bindings: a Brick Daemon with two Bricklets. */
  function fakeLibrary(options: { reachable?: boolean } = {}): TinkerforgeLibrary & { log: string[] } {
    const log: string[] = [];
    class IPConnection {
      static CALLBACK_ENUMERATE = 253;
      static CALLBACK_CONNECTED = 0;
      static ENUMERATION_TYPE_DISCONNECTED = 2;
      private handlers = new Map<number, (...values: unknown[]) => void>();
      on(event: number, handler: (...values: unknown[]) => void) {
        this.handlers.set(event, handler);
      }
      connect(host: string, port: number, onError: (code: number) => void) {
        log.push(`connect ${host}:${port}`);
        if (options.reachable === false) onError(13);
        else this.handlers.get(IPConnection.CALLBACK_CONNECTED)?.(0);
      }
      disconnect() {
        log.push("disconnect");
      }
      enumerate() {
        const enumerate = this.handlers.get(IPConnection.CALLBACK_ENUMERATE);
        enumerate?.("HUM", "0", "a", [1, 0, 0], [2, 0, 0], 283, 0);
        enumerate?.("XYZ", "0", "b", [1, 0, 0], [2, 0, 0], 4242, 0);
        enumerate?.("OLD", "0", "c", [1, 0, 0], [2, 0, 0], 292, 2);
      }
    }
    class BrickletHumidityV2 {
      constructor(private uid: string) {}
      getHumidity(onValue: (v: number) => void, onError: (code: number) => void) {
        if (this.uid === "HUM") onValue(4567);
        else onError(31);
      }
      getTemperature(onValue: (v: number) => void) {
        onValue(2150);
      }
    }
    class BrickletMotionDetectorV2 {
      constructor(private uid: string) {}
      getMotionDetected(onValue: (v: number) => void) {
        onValue(1);
      }
    }
    return { IPConnection, BrickletHumidityV2, BrickletMotionDetectorV2, log } as unknown as TinkerforgeLibrary & {
      log: string[];
    };
  }

  const device: DeviceSpec = {
    model: "room1",
    id: "rpi",
    connector: "tinkerforge",
    settings: { host: "rpi.local", port: 4223 },
    sensors: [
      {
        id: "climate",
        kind: "humidity_v2",
        uid: "HUM",
        settings: {},
        operations: [],
        parameters: [
          { name: "humidity", key: "humidity", eType: "EDouble", unit: "percent", meaning: null },
          { name: "temperature", key: "temperature", eType: "EDouble", unit: "celsius", meaning: null },
        ],
      },
      {
        id: "motion",
        kind: "motion_detector_v2",
        uid: "MOT",
        settings: {},
        operations: [],
        parameters: [{ name: "motion_detected", key: "occupied", eType: "EBoolean", unit: null, meaning: "occupancy" }],
      },
    ],
  };

  it("connects to the Brick Daemon of the device and scales what the Bricklets return", async () => {
    const library = fakeLibrary();
    const readings = await tinkerforgeConnector(() => library).read(device);
    expect(readings).toEqual([
      { sensor: "climate", parameter: "humidity", key: "humidity", value: 45.67 },
      { sensor: "climate", parameter: "temperature", key: "temperature", value: 21.5 },
      { sensor: "motion", parameter: "motion_detected", key: "occupied", value: true },
    ]);
    expect(library.log).toEqual(["connect rpi.local:4223", "disconnect"]);
  });

  it("reports a Bricklet that does not answer, and goes on with the others", async () => {
    const wrong = structuredClone(device);
    wrong.sensors[0].uid = "GONE";
    const readings = await tinkerforgeConnector(() => fakeLibrary()).read(wrong);
    expect(readings[0].error).toContain("does not answer");
    expect(readings[1].value).toBe(21.5);
    expect(readings[2].value).toBe(true);
  });

  it("reports what the model gets wrong about the device", async () => {
    const wrong = structuredClone(device);
    wrong.sensors[0].uid = "";
    wrong.sensors[1].kind = "thermal_imaging";
    const readings = await tinkerforgeConnector(() => fakeLibrary()).read(wrong);
    expect(readings[0].error).toBe("the sensor has no UID");
    expect(readings[2].error).toBe("unknown kind of Bricklet 'thermal_imaging'");
  });

  it("gives every parameter the reason when the Brick Daemon cannot be reached", async () => {
    const readings = await tinkerforgeConnector(() => fakeLibrary({ reachable: false })).read(device);
    expect(readings).toHaveLength(3);
    expect(readings.every((r) => r.error === "the Brick Daemon cannot be reached (rpi.local:4223)")).toBe(true);
  });

  it("discovers the attached Bricklets and names the ones of the catalogue", async () => {
    const found = await tinkerforgeConnector(() => fakeLibrary()).discover!(device);
    expect(found).toEqual([
      { kind: "humidity_v2", uid: "HUM", label: "Humidity Bricklet 2.0" },
      { kind: null, uid: "XYZ", label: "device identifier 4242" },
    ]);
  });

  it("names, for every Bricklet of the catalogue, a class and getters the official bindings have", async () => {
    const real = (await import("tinkerforge")).default as Record<string, { DEVICE_IDENTIFIER: number; new (...a: unknown[]): object }>;
    for (const sensor of connectorInfo("tinkerforge")!.sensors) {
      const Bricklet = real[String(sensor.driver?.className)];
      expect(Bricklet, sensor.kind).toBeTypeOf("function");
      expect(Bricklet.DEVICE_IDENTIFIER).toBe(sensor.driver?.identifier);
      const instance = new Bricklet("uid", new (real.IPConnection as unknown as new () => object)()) as Record<string, unknown>;
      for (const parameter of sensor.parameters) {
        if (parameter.driver?.reader) continue; // read by logic of the driver
        expect(instance[String(parameter.driver?.getter)], `${sensor.kind}.${parameter.name}`).toBeTypeOf("function");
      }
      for (const operation of sensor.operations ?? []) {
        if (operation.driver?.special) continue;
        const setter = instance[String(operation.driver?.setter)] as (...args: unknown[]) => void;
        expect(setter, `${sensor.kind}.${operation.name}`).toBeTypeOf("function");
        // the arguments of the operation, then the two callbacks of the bindings
        expect(setter.length, `${sensor.kind}.${operation.name}`).toBe(operation.parameters.length + 2);
      }
    }
  });
});

describe("a simulated device in the modeler", () => {
  const info = connectorInfo("simulated")!;

  it("offers a part of every kind of the catalogue, to be added like the parts of a brick", async () => {
    const fed = cloneFederation(baseline());
    const hub = addDevice(fed, "room2", info)!;
    const spec = () => devicesOf(fed, "room2").find((d) => d.id === hub)!;

    // as the modeler asks: the device alone, before any of its parts is in the model
    const found = await discoverDevice({ ...spec(), sensors: [] });
    expect(found.map((part) => part.kind)).toEqual(info.sensors.map((kind) => kind.kind));
    expect(found.find((part) => part.kind === "presence")).toEqual({ kind: "presence", uid: "presence", label: "Presence sensor" });

    const offer = found.find((part) => part.kind === "presence")!;
    const sensor = addSensor(fed, "room2", hub, info, sensorKind("simulated", "presence")!, offer.uid)!;
    expect(sensor).toBe("presence2"); // `presence` is the entity of Room 2
    // the observation read a key the DT reported: the part can feed it instead
    expect(linkTargets(fed, "room2", sensor, "detected")).toEqual(["occupancy.occupied"]);
    expect(linkParameter(fed, "room2", sensor, "detected", "occupancy.occupied")).toBe(true);
    expect(linkTargets(fed, "room2", sensor, "detected")).toEqual([]);
    fed.models.room2.objects[sensor].slots.value = "false";
    expect(gateFor(fed, "room2")).toEqual([]);

    const readings = await readDevice(spec());
    expect(readings.map((r) => [r.parameter, r.value])).toEqual([["detected", false]]);
    expect(liveValues(fed, { room2: readings })["room2#occupancy.occupied"]?.value).toBe(false);

    // once in the model it is no longer offered a second time
    const again = await discoverDevice(spec());
    expect(again.filter((part) => part.uid === "presence")).toHaveLength(1);
    expect(again).toHaveLength(info.sensors.length);
  });
});
