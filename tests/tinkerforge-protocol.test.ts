/**
 * The Tinkerforge connector with the official bindings, over a real TCP
 * connection. A Brick Daemon is not available in the tests, so a small server
 * stands in for it and speaks the Tinkerforge TCP/IP protocol: 8-byte header
 * (UID uint32 LE, length, function id, sequence number and options, flags),
 * `get_identity`, `enumerate` and the getters of the Bricklets attached.
 */
import type net from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { connectorInfo, sensorKind } from "@/connectors/catalogue";
import { addDevice, addReaction, addSensor, linkParameter } from "@/components/workbench/edits";
import { runTrigger } from "@/engine/assistant/session";
import { devicesOf, toBatch } from "@/engine/devices";
import { extract, gateFor } from "@/engine/modelset";
import { liveValues } from "@/engine/runtime/live";
import { actorOf, fire, reactionsOf } from "@/engine/runtime/reactions";
import { linksOfType } from "@/engine/weaving/model";
import { discoverDevice, invokeOperation, readDevice } from "@/server/connectors";
import { tinkerforgeConnector } from "@/server/connectors/tinkerforge";
import { settle } from "@/server/settle";

import { newRepo } from "./helpers";
import { checkHardware } from "./live/check";
import { fakeBrickDaemon, int16, int32, uint16, type FakeBricklet } from "./support/brick-daemon";

describe("the Tinkerforge connector over the Tinkerforge TCP/IP protocol", () => {
  let server: net.Server;
  let port = 0;
  let attached: FakeBricklet[] = [];
  // function ids and device identifiers come from the official bindings
  let lib: Record<string, Record<string, number>>;

  const humidity = (): FakeBricklet => ({
    uid: "Hum",
    identifier: lib.BrickletHumidityV2.DEVICE_IDENTIFIER,
    answers: {
      [lib.BrickletHumidityV2.FUNCTION_GET_HUMIDITY]: uint16(4567), // 45.67 %RH
      [lib.BrickletHumidityV2.FUNCTION_GET_TEMPERATURE]: int16(2150), // 21.50 °C
    },
  });
  const motion = (detected: boolean): FakeBricklet => ({
    uid: "Mot",
    identifier: lib.BrickletMotionDetectorV2.DEVICE_IDENTIFIER,
    answers: { [lib.BrickletMotionDetectorV2.FUNCTION_GET_MOTION_DETECTED]: Buffer.from([detected ? 1 : 0]) },
  });
  const barometer = (): FakeBricklet => ({
    uid: "Bar",
    identifier: lib.BrickletBarometerV2.DEVICE_IDENTIFIER,
    answers: {
      [lib.BrickletBarometerV2.FUNCTION_GET_AIR_PRESSURE]: int32(1013250), // 1013.250 hPa
      [lib.BrickletBarometerV2.FUNCTION_GET_TEMPERATURE]: int32(1987), // 19.87 °C
    },
  });

  beforeAll(async () => {
    lib = (await import("tinkerforge")).default;
    server = fakeBrickDaemon(() => attached);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as net.AddressInfo).port;
  });
  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

  /** Room 1 modelled from the catalogue, as the modeler does it: a device and its Bricklets. */
  function modelled(kinds: [string, string][]) {
    const repo = newRepo();
    const fed = repo.federation();
    const tinkerforge = connectorInfo("tinkerforge")!;
    const device = addDevice(fed, "room1", tinkerforge)!;
    Object.assign(fed.models.room1.objects[device].slots, { host: "127.0.0.1", port });
    for (const [kind, uid] of kinds) {
      const sensor = addSensor(fed, "room1", device, tinkerforge, sensorKind("tinkerforge", kind)!)!;
      fed.models.room1.objects[sensor].slots.uid = uid;
    }
    expect(gateFor(fed, "room1")).toEqual([]);
    settle(repo, "room1", { kind: "edit", files: extract(fed, "room1") }, { decision: "accept" });
    return repo;
  }

  it("reads the Bricklets a model describes, in the units the model declares", async () => {
    attached = [humidity(), motion(true), barometer()];
    const repo = modelled([
      ["humidity_v2", "Hum"],
      ["motion_detector_v2", "Mot"],
      ["barometer_v2", "Bar"],
    ]);
    const [device] = devicesOf(repo.federation(), "room1");
    const readings = await readDevice(device);
    expect(readings.map((r) => [r.sensor, r.parameter, r.value, r.error])).toEqual([
      ["humidity_v2", "humidity", 45.67, undefined],
      ["humidity_v2", "temperature", 21.5, undefined],
      ["motion_detector_v2", "motion_detected", true, undefined],
      ["barometer_v2", "air_pressure", 1013.25, undefined],
      ["barometer_v2", "temperature", 19.87, undefined],
    ]);
  });

  it("turns a reading into observations the modeling layer accepts without drift", async () => {
    attached = [humidity(), motion(false)];
    const repo = modelled([
      ["humidity_v2", "Hum"],
      ["motion_detector_v2", "Mot"],
    ]);
    const fed = repo.federation();
    const batch = toBatch(fed, "room1", await readDevice(devicesOf(fed, "room1")[0]), 100);
    expect(batch.observations).toEqual([
      { key: "humidity", value: 45.67, timestamp: 100 },
      { key: "temperature", value: 21.5, timestamp: 100 },
      { key: "motion_detected", value: false, timestamp: 100 },
    ]);
    const result = runTrigger(repo.versions(), "room1", { kind: "observations", batch })!;
    expect(result.changeset.changes).toEqual([]);
    expect(linksOfType(result.drift, "VerticalDrift")).toEqual([]);
  });

  it("discovers what is attached to the Brick Daemon", async () => {
    attached = [humidity(), motion(true), { uid: "Xyz", identifier: 4242, answers: {} }];
    const repo = modelled([["humidity_v2", "Hum"]]);
    const found = await discoverDevice(devicesOf(repo.federation(), "room1")[0]);
    expect(found).toEqual([
      { kind: "humidity_v2", uid: "Hum", label: "Humidity Bricklet 2.0" },
      { kind: "motion_detector_v2", uid: "Mot", label: "Motion Detector Bricklet 2.0" },
      { kind: null, uid: "Xyz", label: "device identifier 4242" },
    ]);
  });

  it("an unplugged Bricklet times out, and the model sees bottom-up drift", async () => {
    attached = [humidity(), motion(true)];
    const repo = modelled([
      ["humidity_v2", "Hum"],
      ["motion_detector_v2", "Mot"],
    ]);
    // An observation of the model uses what the motion detector provides.
    const fed = repo.federation();
    fed.models.room1.objects.occupancy.bindings = { occupied: "motion_detected" };
    settle(repo, "room1", { kind: "edit", files: extract(fed, "room1") }, { decision: "accept" });

    attached = [humidity()]; // the motion detector is pulled out
    const head = repo.federation();
    const readings = await readDevice(devicesOf(head, "room1")[0]);
    expect(readings.find((r) => r.parameter === "motion_detected")?.error).toContain("does not answer");
    expect(readings.find((r) => r.parameter === "humidity")?.value).toBe(45.67);

    const batch = toBatch(head, "room1", readings, 200);
    const result = runTrigger(repo.versions(), "room1", { kind: "observations", batch })!;
    expect(result.changeset.changes.map((c) => `${c.kind} ${c.element}`)).toEqual([
      "removed room1@data#motion_detected",
    ]);
    const vertical = linksOfType(result.drift, "VerticalDrift");
    expect(vertical.map((v) => [v.props.origin, v.ends.lower])).toEqual([["bottom-up", "room1@data#motion_detected"]]);
  }, 15000);

  it("passes the check that is run against real hardware (npm run device:check)", async () => {
    attached = [humidity(), motion(true), barometer(), { uid: "Xyz", identifier: 4242, answers: {} }];
    const report = await checkHardware("127.0.0.1", port);
    expect(report.found.map((f) => f.uid)).toEqual(["Hum", "Mot", "Bar", "Xyz"]);
    expect(report.problems).toEqual([]);
    expect(report.readings.map((r) => r.value)).toEqual([45.67, 21.5, true, 1013.25, 19.87]);
    // and it does catch a value outside what Tinkerforge documents
    attached = [{ ...humidity(), answers: { ...humidity().answers, [lib.BrickletHumidityV2.FUNCTION_GET_HUMIDITY]: uint16(20000) } }];
    expect((await checkHardware("127.0.0.1", port)).problems).toEqual([
      "humidity_v2_Hum.humidity = 200 is outside 0..100",
    ]);
  });

  describe("actions", () => {
    const relay = (): FakeBricklet => ({
      uid: "Rey",
      identifier: lib.BrickletIndustrialDualRelay.DEVICE_IDENTIFIER,
      answers: { [lib.BrickletIndustrialDualRelay.FUNCTION_GET_VALUE]: Buffer.from([1, 0]) },
      actions: [
        lib.BrickletIndustrialDualRelay.FUNCTION_SET_VALUE,
        lib.BrickletIndustrialDualRelay.FUNCTION_SET_SELECTED_VALUE,
      ],
    });
    const speaker = (): FakeBricklet => ({
      uid: "Spk",
      identifier: lib.BrickletPiezoSpeakerV2.DEVICE_IDENTIFIER,
      answers: {},
      actions: [lib.BrickletPiezoSpeakerV2.FUNCTION_SET_BEEP],
    });
    const button = (): FakeBricklet => ({
      uid: "Btn",
      identifier: lib.BrickletRGBLEDButton.DEVICE_IDENTIFIER,
      answers: { [lib.BrickletRGBLEDButton.FUNCTION_GET_BUTTON_STATE]: Buffer.from([0]) }, // 0 is pressed
      actions: [lib.BrickletRGBLEDButton.FUNCTION_SET_COLOR],
    });
    const device = (repo: ReturnType<typeof modelled>) => devicesOf(repo.federation(), "room1")[0];

    it("models the actions of a Bricklet as operations of its class", () => {
      attached = [];
      const repo = modelled([
        ["industrial_dual_relay", "Rey"],
        ["piezo_speaker_v2", "Spk"],
      ]);
      const type = repo.federation().models["room1@2"];
      // a relay senses its state and acts; a speaker only acts
      expect(type.eClasses.IndustrialDualRelay.instanceOf).toBe("Sensor");
      expect(type.eClasses.PiezoSpeakerV2.instanceOf).toBe("Actuator");
      expect(Object.keys(type.eClasses.IndustrialDualRelay.eOperations ?? {})).toEqual(["set_value", "set_channel"]);
      expect(device(repo).sensors.map((part) => [part.id, part.operations.map((o) => o.name)])).toEqual([
        ["industrial_dual_relay", ["set_value", "set_channel"]],
        ["piezo_speaker_v2", ["beep"]],
      ]);
      expect(repo.changes("room1", 2)).toContain("+room1.PiezoSpeakerV2.beep:EOperation {");
    });

    it("invokes an operation on the Bricklet, with its arguments in order", async () => {
      const [r, s, b] = [relay(), speaker(), button()];
      attached = [r, s, b];
      const repo = modelled([
        ["industrial_dual_relay", "Rey"],
        ["piezo_speaker_v2", "Spk"],
        ["rgb_led_button", "Btn"],
      ]);
      await invokeOperation(device(repo), "industrial_dual_relay", "set_value", { channel0: true, channel1: false });
      await invokeOperation(device(repo), "industrial_dual_relay", "set_channel", { channel: 1, value: true });
      await invokeOperation(device(repo), "piezo_speaker_v2", "beep", { frequency: 1000, volume: 1, duration: 200 });
      await invokeOperation(device(repo), "rgb_led_button", "set_color", { red: 10, green: 20, blue: 30 });

      expect(r.calls?.map((c) => [...c.payload])).toEqual([
        [1, 0],
        [1, 1],
      ]);
      const beep = s.calls![0].payload; // uint16 frequency, uint8 volume, uint32 duration
      expect([beep.readUInt16LE(0), beep.readUInt8(2), beep.readUInt32LE(3)]).toEqual([1000, 1, 200]);
      expect([...b.calls![0].payload]).toEqual([10, 20, 30]);
    });

    it("reads what a part that acts also senses", async () => {
      attached = [relay(), button()];
      const repo = modelled([
        ["industrial_dual_relay", "Rey"],
        ["rgb_led_button", "Btn"],
      ]);
      const readings = await readDevice(device(repo));
      expect(readings.map((r) => [r.parameter, r.value])).toEqual([
        ["channel0", true],
        ["channel1", false],
        ["pressed", true],
      ]);
    });

    it("refuses a call the model does not declare, before it reaches the device", async () => {
      const s = speaker();
      attached = [s];
      const repo = modelled([["piezo_speaker_v2", "Spk"]]);
      const call = (operation: string, args: Record<string, unknown>) =>
        invokeOperation(device(repo), "piezo_speaker_v2", operation, args);
      await expect(call("explode", {})).rejects.toThrow("has no operation explode");
      await expect(call("beep", { frequency: 1000, volume: 1 })).rejects.toThrow("duration is missing");
      await expect(call("beep", { frequency: "high", volume: 1, duration: 1 })).rejects.toThrow("frequency must be EInt");
      await expect(call("beep", { frequency: 20, volume: 1, duration: 1 })).rejects.toThrow("between 50 and 15000");
      await expect(invokeOperation(device(repo), "nothing", "beep", {})).rejects.toThrow("has no part nothing");
      expect(s.calls ?? []).toEqual([]);
    });

    it("a reaction of the model makes the speaker beep when motion is detected", async () => {
      const spk = speaker();
      attached = [motion(false), spk];
      const repo = modelled([
        ["motion_detector_v2", "Mot"],
        ["piezo_speaker_v2", "Spk"],
      ]);
      // the modeler's steps: motion feeds the occupancy of the room; when it becomes true, beep
      const fed = repo.federation();
      delete fed.models.room1.objects.occupancy.bindings.occupied;
      linkParameter(fed, "room1", "motion_detector_v2", "motion_detected", "occupancy.occupied");
      addReaction(fed, "room1", {
        input: "occupancy.occupied",
        when: "occupied",
        target: "piezo_speaker_v2",
        operation: "beep",
        args: { frequency: 2000, volume: 3, duration: 250 },
      });
      expect(gateFor(fed, "room1")).toEqual([]);
      settle(repo, "room1", { kind: "edit", files: extract(fed, "room1") }, { decision: "accept" });

      const head = repo.federation();
      const reading = async () => liveValues(head, { room1: await readDevice(devicesOf(head, "room1")[0]) });
      const react = async (before: Awaited<ReturnType<typeof reading>>, now: typeof before) => {
        for (const reaction of fire(reactionsOf(head, "room1"), before, now)) {
          const actor = actorOf(head, reaction)!;
          await invokeOperation(actor.device, actor.part.id, reaction.operation, reaction.args);
        }
      };
      const quiet = await reading();
      await react(quiet, await reading()); // nobody moves: nothing is asked of the speaker
      expect(spk.calls ?? []).toEqual([]);

      attached = [motion(true), spk]; // someone moves
      const moved = await reading();
      expect(moved["room1#occupancy.occupied"]).toEqual({ value: true });
      await react(quiet, moved);
      expect(spk.calls).toHaveLength(1);
      const beep = spk.calls![0].payload;
      expect([beep.readUInt16LE(0), beep.readUInt8(2), beep.readUInt32LE(3)]).toEqual([2000, 3, 250]);

      await react(moved, await reading()); // still moving: it does not beep again
      expect(spk.calls).toHaveLength(1);
    });

    it("reports an action that did not reach the Bricklet", async () => {
      attached = [];
      const repo = modelled([["piezo_speaker_v2", "Spk"]]);
      await expect(
        invokeOperation(device(repo), "piezo_speaker_v2", "beep", { frequency: 1000, volume: 1, duration: 200 }),
      ).rejects.toThrow("does not answer");
    }, 15000);
  });

  describe("the NFC Bricklet as a people counter", () => {
    interface Tag {
      id: number[];
      lastSeen: number; // ms since the Bricklet last saw it
    }
    /** An NFC Bricklet: its mode, and the tags its Simple mode lists. */
    function nfc(uid: string, tags: () => Tag[]) {
      const state = { mode: 0 };
      const bricklet: FakeBricklet = {
        uid,
        identifier: lib.BrickletNFC.DEVICE_IDENTIFIER,
        answers: {},
        respond: {
          [lib.BrickletNFC.FUNCTION_GET_MODE]: () => Buffer.from([state.mode]),
          [lib.BrickletNFC.FUNCTION_SET_MODE]: (payload) => {
            state.mode = payload.readUInt8(0);
            return Buffer.alloc(0);
          },
          [lib.BrickletNFC.FUNCTION_SIMPLE_GET_TAG_ID_LOW_LEVEL]: (payload) => {
            const tag = tags()[payload.readUInt8(0)];
            const answer = Buffer.alloc(16); // tag type, id length, id (10 bytes), last seen
            if (tag) {
              answer.writeUInt8(2, 0);
              answer.writeUInt8(tag.id.length, 1);
              answer.set(tag.id, 2);
              answer.writeUInt32LE(tag.lastSeen, 12);
            }
            return answer;
          },
        },
      };
      return { bricklet, state };
    }
    const A = [4, 10, 20, 30];
    const B = [4, 99, 98, 97];

    it("counts people from taps: a tag tapped is in, tapped again is out", async () => {
      let tags: Tag[] = [];
      let now = 100_000;
      const reader = nfc("Nfc", () => tags);
      attached = [reader.bricklet];
      const repo = modelled([["nfc", "Nfc"]]);
      const [spec] = devicesOf(repo.federation(), "room1");
      expect(spec.sensors[0].parameters.map((p) => [p.name, p.eType, p.unit, p.meaning])).toEqual([
        ["count", "EInt", "person", "people-count"],
      ]);
      const connector = tinkerforgeConnector(() => lib as never, () => now);
      const count = async () => (await connector.read(spec))[0];

      expect(reader.state.mode).toBe(0);
      expect((await count()).value).toBe(0);
      expect(reader.state.mode).toBe(lib.BrickletNFC.MODE_SIMPLE); // the Bricklet now reads tags by itself

      tags = [{ id: A, lastSeen: 200 }]; // someone taps
      expect((await count()).value).toBe(1);
      now += 2000;
      tags = [{ id: A, lastSeen: 2200 }]; // the same tap, still listed: counted once
      expect((await count()).value).toBe(1);

      now += 3000;
      tags = [
        { id: B, lastSeen: 100 }, // a second person
        { id: A, lastSeen: 5200 },
      ];
      expect((await count()).value).toBe(2);

      now += 5000;
      tags = [
        { id: A, lastSeen: 300 }, // the first one taps again: out
        { id: B, lastSeen: 5100 },
      ];
      expect((await count()).value).toBe(1);

      await connector.invoke!(spec, spec.sensors[0], "reset", {});
      expect((await count()).value).toBe(0);
      now += 6000;
      tags = [{ id: A, lastSeen: 50 }];
      expect((await count()).value).toBe(1);
    });

    it("does not count what the Bricklet already lists when counting starts", async () => {
      const reader = nfc("Nf2", () => [{ id: A, lastSeen: 800 }]);
      attached = [reader.bricklet];
      const repo = modelled([["nfc", "Nf2"]]);
      const [spec] = devicesOf(repo.federation(), "room1");
      const connector = tinkerforgeConnector(() => lib as never, () => 500_000);
      expect((await connector.read(spec))[0].value).toBe(0);
      expect((await connector.read(spec))[0].value).toBe(0);
    });

    it("reports an NFC Bricklet that is not there", async () => {
      attached = [];
      const repo = modelled([["nfc", "Nf3"]]);
      const reading = (await readDevice(devicesOf(repo.federation(), "room1")[0]))[0];
      expect(reading.error).toContain("does not answer");
    }, 15000);
  });

  it("a UID that belongs to another kind of Bricklet is reported as such", async () => {
    attached = [humidity()];
    const repo = modelled([["temperature_v2", "Hum"]]); // the model says a temperature Bricklet has this UID
    const readings = await readDevice(devicesOf(repo.federation(), "room1")[0]);
    expect(readings[0].error).toBe("the UID belongs to another kind of Bricklet");
  });

  it("reports a host where no Brick Daemon listens", async () => {
    const repo = modelled([["humidity_v2", "Hum"]]);
    const [device] = devicesOf(repo.federation(), "room1");
    await new Promise<void>((resolve) => server.close(() => resolve()));
    const readings = await readDevice(device);
    expect(readings.every((r) => r.error !== undefined)).toBe(true);
    expect(readings[0].error).toContain(`127.0.0.1:${port}`);
    await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve));
  }, 15000);
});
