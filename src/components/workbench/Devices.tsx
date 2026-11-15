"use client";

import { useEffect, useState } from "react";

import { CONNECTORS, connectorInfo, sensorKind } from "@/connectors/catalogue";
import { type ObservationBatch } from "@/engine/assistant/change";
import {
  devicesOf,
  toBatch,
  type AttachedPart,
  type DeviceSpec,
  type Discovered,
  type Reading,
} from "@/engine/devices";
import { type Federation } from "@/engine/federation";
import { type Dict } from "@/engine/kernel/model";
import { discoverSensors, readDevices } from "@/server/actions";

import { Act, Choice, Code, Field, Section, Tone } from "./controls";
import { addDevice, addSensor, linkParameter, linkTargets, observeParameter, usersOf } from "./edits";
import { Operations } from "./Operations";

function shown(reading: Reading | undefined): React.ReactNode {
  if (!reading) return null;
  if (reading.error !== undefined) return <Tone value="broken">no data</Tone>;
  const value = typeof reading.value === "number" ? Math.round(reading.value * 100) / 100 : reading.value;
  return <strong>{String(value)}</strong>;
}

/** What is attached to a device, asked again whenever the way to reach it changes. */
function useDiscovery(device: DeviceSpec) {
  const [state, setState] = useState<{ key: string; found: Discovered[] | null; problem: string | null }>({
    key: "",
    found: null,
    problem: null,
  });
  const [again, setAgain] = useState(0);
  const key = `${device.connector}|${JSON.stringify(device.settings)}|${again}`;
  const reach = JSON.stringify({ ...device, sensors: [] });

  useEffect(() => {
    let cancelled = false;
    // a moment, so that a host is not tried while it is still being typed
    const timer = setTimeout(async () => {
      const result = await discoverSensors(JSON.parse(reach) as DeviceSpec);
      if (cancelled) return;
      setState(result.ok ? { key, found: result.found, problem: null } : { key, found: null, problem: result.error });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [key, reach]);

  const current = state.key === key;
  return {
    searching: !current,
    found: current ? state.found : null,
    problem: current ? state.problem : null,
    refresh: () => setAgain((n) => n + 1),
  };
}

/**
 * A device in the modeler: what is attached to it is discovered and offered
 * for adding, and what its sensors sense can be linked to the model.
 */
function ModelledDevice(props: {
  fed: Federation;
  device: DeviceSpec;
  readOnly: boolean;
  readings: Reading[] | undefined;
  update: (change: (fed: Federation) => void) => void;
  onSelect: (id: string) => void;
}) {
  const { fed, device, readOnly } = props;
  const model = device.model;
  const info = connectorInfo(device.connector);
  const discovery = useDiscovery(device);
  const [once, setOnce] = useState<Reading[] | null>(null);
  const [busy, setBusy] = useState(false);
  const readings = props.readings ?? once ?? [];
  const select = (id: string | null) => id && queueMicrotask(() => props.onSelect(`${model}#${id}`));

  const known = new Set(device.sensors.map((sensor) => sensor.uid).filter(Boolean));
  const found = discovery.found ?? [];
  const addable = found.filter((item) => item.kind && !known.has(item.uid));
  const absent = discovery.found ? device.sensors.filter((s) => s.uid && !found.some((f) => f.uid === s.uid)) : [];
  const add = (items: Discovered[]) =>
    info &&
    props.update((f) => {
      // The view stays here: the next step, linking what the part senses, is in this section.
      for (const item of items) {
        const kind = sensorKind(info.type, item.kind ?? "");
        if (kind) addSensor(f, model, device.id, info, kind, item.uid);
      }
    });

  return (
    <div className="space-y-3 rounded-md border p-2">
      <div className="flex items-start justify-between gap-2">
        <button className="min-h-10 text-left text-sm" onClick={() => props.onSelect(`${model}#${device.id}`)}>
          <span className="font-medium">{device.id}</span>{" "}
          <span className="text-muted-foreground">
            {info?.label ?? `unknown connector '${device.connector}'`}
            {Object.entries(device.settings).map(([name, value]) => ` · ${name} ${String(value)}`)}
          </span>
        </button>
        <Act variant="ghost" onClick={discovery.refresh} disabled={discovery.searching}>
          {discovery.searching ? "Looking…" : "Look again"}
        </Act>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attached to the device</p>
          {!readOnly && addable.length > 1 && <Act onClick={() => add(addable)}>Add all {addable.length}</Act>}
        </div>
        {discovery.problem && <p className="text-sm text-red-900">{discovery.problem}</p>}
        {discovery.found && found.length === 0 && <p className="text-sm text-muted-foreground">Nothing answered.</p>}
        <ul className="space-y-1 text-sm">
          {found.map((item) => (
            <li key={item.uid} className="flex min-h-10 items-center justify-between gap-2">
              <span className="min-w-0">
                <Code>{item.uid}</Code> {item.label}
              </span>
              {known.has(item.uid) ? (
                <Tone value="holds">in the model</Tone>
              ) : item.kind ? (
                !readOnly && <Act onClick={() => add([item])}>Add</Act>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">not in the catalogue</span>
              )}
            </li>
          ))}
          {absent.map((sensor) => (
            <li key={sensor.id} className="flex min-h-10 items-center justify-between gap-2 text-red-900">
              <span>
                <Code>{sensor.uid}</Code> {sensor.id} is in the model
              </span>
              <Tone value="broken">not attached</Tone>
            </li>
          ))}
        </ul>
      </div>

      {device.sensors.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What its parts sense and can do
          </p>
          {device.sensors.map((sensor) => (
            <div key={sensor.id} className="space-y-1">
              <button className="min-h-10 text-left text-sm font-medium" onClick={() => props.onSelect(`${model}#${sensor.id}`)}>
                {sensor.id} <span className="font-normal text-muted-foreground">{sensor.kind}</span>
              </button>
              {sensor.parameters.map((parameter) => {
                const users = usersOf(fed, model, parameter.key);
                const targets = readOnly ? [] : linkTargets(fed, model, sensor.id, parameter.name);
                const live = readings.find((r) => r.sensor === sensor.id && r.parameter === parameter.name);
                return (
                  <div key={parameter.name} className="rounded-md bg-muted/50 p-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="min-w-0">
                        {parameter.name}{" "}
                        <span className="text-muted-foreground">
                          {parameter.eType}
                          {parameter.unit ? ` [${parameter.unit}]` : ""} → <Code>{parameter.key}</Code>
                        </span>
                      </span>
                      {shown(live)}
                    </div>
                    {users.map((user) => (
                      <button
                        key={user}
                        className="block min-h-10 text-left hover:underline"
                        onClick={() => props.onSelect(`${model}#${user.split(".")[0]}`)}
                      >
                        feeds <Code>{user}</Code>
                      </button>
                    ))}
                    {!readOnly && users.length === 0 && (
                      <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                        <Choice
                          label={`Link ${parameter.name} to`}
                          value=""
                          empty={targets.length ? "link to an observation…" : "no observation fits yet"}
                          disabled={!targets.length}
                          options={targets}
                          onChange={(target) =>
                            target && props.update((f) => void linkParameter(f, model, sensor.id, parameter.name, target))
                          }
                        />
                        <Act
                          title="A new observation of this DT, fed by this parameter"
                          onClick={() =>
                            props.update((f) => void select(observeParameter(f, model, sensor.id, parameter.name)))
                          }
                        >
                          New observation
                        </Act>
                      </div>
                    )}
                  </div>
                );
              })}
              <Operations device={device} part={sensor} />
            </div>
          ))}
          {!props.readings && device.sensors.some((sensor) => sensor.parameters.length > 0) && (
            <Act
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setOnce(await readDevices([device]));
                setBusy(false);
              }}
            >
              {busy ? "Reading…" : "Read the sensors"}
            </Act>
          )}
        </div>
      )}
    </div>
  );
}

/** In the modeler: the devices of the open model, and a way to add one. */
export function DeviceModeling(props: {
  fed: Federation;
  model: string;
  readOnly: boolean;
  /** Live readings of this model, when live reading is on. */
  readings?: Reading[];
  update: (change: (fed: Federation) => void) => void;
  onSelect: (id: string) => void;
}) {
  const { fed, model } = props;
  const devices = devicesOf(fed, model);
  const [connector, setConnector] = useState(CONNECTORS[0].type);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const info = connectorInfo(connector);

  const add = () => {
    if (!info) return;
    const given: Dict = {};
    for (const setting of info.settings) {
      const text = (settings[setting.name] ?? "").trim();
      if (text) given[setting.name] = setting.eType === "EInt" ? Number(text) : text;
    }
    // The view stays here: what the device offers to attach is listed in this section.
    props.update((f) => void addDevice(f, model, info, given));
    setSettings({});
  };

  return (
    <Section title="Devices and sensors">
      <p className="text-xs text-muted-foreground">
        A device is reached through a connector. What is attached to it is found and offered here; what a sensor senses
        provides an observation key, which you link to the observations of this model.
      </p>
      {devices.map((device) => (
        <ModelledDevice
          key={device.id}
          fed={fed}
          device={device}
          readOnly={props.readOnly}
          readings={props.readings}
          update={props.update}
          onSelect={props.onSelect}
        />
      ))}
      {devices.length === 0 && <p className="text-sm text-muted-foreground">This model describes no device yet.</p>}
      {!props.readOnly && info && (
        <div className="space-y-2 rounded-md border border-dashed p-2">
          <Choice
            label="Connector"
            value={connector}
            options={CONNECTORS.map((c) => ({ value: c.type, label: c.label }))}
            onChange={(value) => (setConnector(value), setSettings({}))}
          />
          <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            {info.settings.map((setting) => (
              <Field key={setting.name} label={setting.name}>
                <input
                  aria-label={setting.description}
                  title={setting.description}
                  className="h-10 min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
                  placeholder={String(setting.fallback ?? "")}
                  value={settings[setting.name] ?? ""}
                  onChange={(event) => setSettings({ ...settings, [setting.name]: event.target.value })}
                  onKeyDown={(event) => event.key === "Enter" && add()}
                />
              </Field>
            ))}
            <Act variant="default" className="col-start-3" onClick={add}>
              Add device
            </Act>
          </div>
        </div>
      )}
    </Section>
  );
}

/**
 * At runtime: read the devices of the committed models and hand the result to
 * the modeling layer. A reading also looks at what is attached, so that a part
 * the model does not have is reported as new; a sensor can be treated as
 * detached, to try what happens when it is replaced without unplugging it.
 */
export function DeviceRuntime(props: {
  fed: Federation;
  models: string[];
  now: number;
  /** The latest live readings, by model; empty when live reading is off. */
  live: Record<string, Reading[]>;
  blockedFor: (model: string | null) => string | null;
  onBatch: (batch: ObservationBatch) => void;
  onSend: (batch: ObservationBatch) => void;
}) {
  const devices = props.models.flatMap((model) => devicesOf(props.fed, model));
  const [manual, setManual] = useState<Record<string, { readings: Reading[]; attached: AttachedPart[] }>>({});
  const [detached, setDetached] = useState<Record<string, boolean>>({});
  const [reported, setReported] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState("");
  if (!devices.length) {
    return (
      <Section title="Physical devices">
        <p className="text-sm text-muted-foreground">
          No committed model describes a device. Add one from the Properties of a DT model.
        </p>
      </Section>
    );
  }
  return (
    <Section title="Physical devices">
      <p className="text-sm text-muted-foreground">
        Reading a device gives what its DT reports now: values, which keys it can still provide, and what is attached
        that the model does not have.
      </p>
      {devices.map((device) => {
        const id = `${device.model}#${device.id}`;
        const mine = (reading: Reading) => device.sensors.some((s) => s.id === reading.sensor);
        const off = (sensor: string) => detached[`${id}#${sensor}`] === true;
        const read = manual[id]?.readings ?? props.live[device.model]?.filter(mine);
        // a sensor treated as detached does not answer, whatever the device says
        const readings = read?.map((reading) =>
          off(reading.sensor) ? { ...reading, value: undefined, error: "detached (simulated)" } : reading,
        );
        const attached = manual[id]?.attached ?? [];
        const fresh = attached.filter((part) => !device.sensors.some((s) => s.uid === part.uid));
        // Of what is attached and not in the model, only what the modeler picks is reported as new.
        const picked = fresh.filter((part) => reported[`${id}#${part.uid}`]);
        const why = props.blockedFor(device.model);
        const failed = (readings ?? []).filter((r) => r.error !== undefined);
        const changed = failed.length > 0 || picked.length > 0;
        const batch = () => toBatch(props.fed, device.model, readings ?? [], props.now, picked);
        return (
          <div key={id} className="space-y-2 rounded-md border p-2">
            <p className="text-sm">
              <span className="font-medium">{id.replace("#", " · ")}</span>{" "}
              <span className="text-muted-foreground">{connectorInfo(device.connector)?.label ?? device.connector}</span>
            </p>
            {device.sensors
              .filter((sensor) => sensor.parameters.length > 0)
              .map((sensor) => (
                <div key={sensor.id} className="space-y-0.5 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{sensor.id}</span>
                    <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={off(sensor.id)}
                        onChange={(event) => setDetached({ ...detached, [`${id}#${sensor.id}`]: event.target.checked })}
                      />
                      treat as detached
                    </label>
                  </div>
                  {sensor.parameters.map((parameter) => (
                    <div key={parameter.name} className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        {parameter.name} → <Code>{parameter.key}</Code>
                      </span>
                      {shown(readings?.find((r) => r.sensor === sensor.id && r.parameter === parameter.name))}
                    </div>
                  ))}
                </div>
              ))}
            {fresh.length > 0 && (
              <div className="text-sm">
                <p className="font-medium">Attached and not in the model</p>
                <p className="text-xs text-muted-foreground">Tick what the DT now reports as a new source of data.</p>
                {fresh.map((part) => (
                  <label key={part.uid} className="flex min-h-10 cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={reported[`${id}#${part.uid}`] === true}
                      onChange={(event) => setReported({ ...reported, [`${id}#${part.uid}`]: event.target.checked })}
                    />
                    <Code>{part.uid}</Code> {connectorInfo(device.connector)?.sensors.find((k) => k.kind === part.kind.kind)?.label ?? part.kind.kind}
                  </label>
                ))}
              </div>
            )}
            {failed.length > 0 && (
              <p className="text-sm text-red-900">
                {failed.length} parameter(s) give no data: {failed[0].error}.
              </p>
            )}
            {changed && (
              <p className="text-xs text-muted-foreground">
                Sending this reports the keys that are gone and the parts that are new: the modelling assistant
                proposes the version that follows.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Act
                disabled={busy === id || device.sensors.length === 0}
                onClick={async () => {
                  setBusy(id);
                  const [result, discovery] = await Promise.all([readDevices([device]), discoverSensors(device)]);
                  setBusy("");
                  const parts: AttachedPart[] = (discovery.ok ? discovery.found : []).flatMap((item) => {
                    const kind = item.kind ? sensorKind(device.connector, item.kind) : null;
                    return kind && kind.parameters.length ? [{ device: device.id, uid: item.uid, kind }] : [];
                  });
                  setManual({ ...manual, [id]: { readings: result, attached: parts } });
                  props.onBatch(toBatch(props.fed, device.model, result, props.now));
                }}
              >
                {busy === id ? "Reading…" : "Read and look at what is attached"}
              </Act>
              {readings && (
                <Act
                  variant={changed ? "default" : "outline"}
                  disabled={Boolean(why)}
                  title={why ?? undefined}
                  onClick={() => props.onSend(batch())}
                >
                  Send to the modeling layer
                </Act>
              )}
            </div>
            {why && readings && <p className="text-xs text-amber-900">{why}</p>}
          </div>
        );
      })}
    </Section>
  );
}
