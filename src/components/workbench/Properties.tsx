"use client";

import { useState } from "react";

import {
  CONCEPT_ROLES,
  CORRESPONDENCE,
  classProps,
  instances,
  findLink,
  links,
  typeOf,
  type Federation,
} from "@/engine/federation";
import {
  INTERIM_BEHAVIOURS,
  PRIMITIVES,
  modelKey,
  signature,
  targets,
  type EClass,
  type EObject,
  type Model,
} from "@/engine/kernel/model";
import { availableKeys, devicesOf, isSensor, providedKeys, type Reading } from "@/engine/devices";
import { parseRef, ref } from "@/engine/kernel/refs";
import { checkConformance } from "@/engine/conformance";
import {
  nameProblem,
  removeConcept,
  renameAttribute,
  renameClass,
  renameConcept,
  renameObject,
} from "@/engine/modeling/rename";
import { modelOf } from "@/engine/modelset";
import { type LiveValue } from "@/engine/runtime/live";
import { type CorrespondenceStatus } from "@/engine/weaving/checks";

import { Act, Choice, Code, Field, Section, Text, Tone } from "./controls";
import { DeviceModeling } from "./Devices";
import { Operations } from "./Operations";
import { Reactions, type Fired } from "./Reactions";
import {
  addCorrespondence,
  attributeElements,
  removeLink,
  representationOf,
  retargetCorrespondence,
  setRepresentation,
  uniqueName,
  usersOf,
} from "./edits";

export interface PropertiesProps {
  fed: Federation;
  /** The model that is open: only what it owns can be edited. */
  focus: string;
  selected: string | null;
  readOnly: boolean;
  statuses: CorrespondenceStatus[];
  update: (change: (fed: Federation) => void) => void;
  onSelect: (id: string | null) => void;
  onOpen: (model: string) => void;
  /** Live readings of the open model, when live reading is on. */
  readings?: Reading[];
  /** Reactions: whether they run, on which readings, and what fired. */
  reactions?: { armed: boolean; values: Record<string, LiveValue> | null; log: Fired[]; conceptsUnsaved: boolean };
}

const LINK = "link:";

function renameKey<T>(record: Record<string, T>, from: string, to: string): Record<string, T> {
  return Object.fromEntries(Object.entries(record).map(([key, value]) => [key === from ? to : key, value]));
}

const MULTIPLICITY = ["0..1", "1", "0..*", "1..*"];
const boundsOf = (text: string) => ({
  lowerBound: text.startsWith("1") ? 1 : 0,
  upperBound: text.endsWith("*") ? -1 : 1,
});
const multiplicityOf = (lower: number, upper: number) =>
  upper === -1 ? (lower >= 1 ? "1..*" : "0..*") : lower >= 1 ? "1" : "0..1";

/** The name of a class or of an object, to change it. */
function Rename(props: { name: string; taken: string[]; note: string; onRename: (to: string) => void }) {
  const [refused, setRefused] = useState<{ name: string; why: string } | null>(null);
  return (
    <Field label="Name">
      <Text
        label="Name"
        value={props.name}
        onCommit={(value) => {
          const to = value.trim();
          const why = to === props.name ? null : nameProblem(props.taken.filter((n) => n !== props.name), to);
          if (why) return setRefused({ name: to, why });
          setRefused(null);
          if (to !== props.name) props.onRename(to);
        }}
      />
      {refused ? (
        <p className="text-xs text-red-900">
          {refused.name ? `Not renamed to ${refused.name}: ` : "Not renamed: "}
          {refused.why}.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{props.note}</p>
      )}
    </Field>
  );
}

export function Properties(props: PropertiesProps) {
  const { fed, selected, focus } = props;
  if (selected === null) return <Overview {...props} />;
  if (selected.startsWith(LINK)) {
    const id = selected.slice(LINK.length);
    const link = findLink(fed, id);
    const mine = link ? modelOf(link.ends.initiating ?? "") === focus : true;
    return <CorrespondenceEditor {...props} readOnly={props.readOnly || !mine} id={id} />;
  }
  if (selected.startsWith("proxy:")) return <Foreign {...props} model={selected.slice("proxy:".length)} />;
  const parsed = parseRef(selected);
  const owner = modelOf(selected.replace(/@data$/, ""));
  if (owner !== focus) return <Foreign {...props} model={owner} element={selected} />;
  const model = fed.models[parsed.model];
  if (parsed.data || selected.endsWith("@data")) {
    const name = parsed.model.replace(/@data$/, "");
    return (
      <Capabilities
        fed={fed}
        instance={name}
        only={parsed.path[0]}
        readOnly={props.readOnly}
        update={props.update}
        onSelect={props.onSelect}
      />
    );
  }
  if (!model) return <p className="text-sm text-muted-foreground">This element is not part of the model shown.</p>;
  if (!parsed.path.length) return <ModelEditor {...props} model={model} />;
  if (model.level === "O0") {
    const obj = model.objects[parsed.path[0]];
    return obj ? <ObjectEditor {...props} model={model} obj={obj} /> : <Gone />;
  }
  const eclass = model.eClasses[parsed.path[0]];
  return eclass ? <ClassEditor {...props} model={model} eclass={eclass} /> : <Gone />;
}

/** An element of another model: it is edited there, by the modeler of that DT. */
function Foreign({ model, element, onOpen }: PropertiesProps & { model: string; element?: string }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">{element ?? model}</h2>
      <p className="text-sm text-muted-foreground">
        This belongs to the model <strong>{model}</strong>. It is shown here because a weaving link of the open model
        touches it; it is edited in its own model.
      </p>
      <Act onClick={() => onOpen(model)}>Open {model}</Act>
    </div>
  );
}

const Gone = () => <p className="text-sm text-muted-foreground">This element no longer exists in the model shown.</p>;

// -- overview ----------------------------------------------------------------

function Overview({ fed, focus, statuses, readOnly, readings, reactions, update, onSelect }: PropertiesProps) {
  const model = fed.models[focus];
  const type = fed.models[model?.typedBy ?? ""];
  const mine = links(fed, CORRESPONDENCE).filter((link) => modelOf(link.ends.initiating ?? "") === focus);
  const uses = links(fed, CORRESPONDENCE).filter((link) => modelOf(link.ends.participating ?? "") === focus);
  const row = "flex min-h-10 w-full items-center justify-between gap-2 rounded-md px-2 text-left text-sm hover:bg-muted";
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Select the model, a class, an object or a correspondence in the diagram to see and edit it.
      </p>
      <Section title="This model">
        <ul className="space-y-1">
          {type && (
            <li>
              <button className={row} onClick={() => onSelect(modelKey(type))}>
                <span className="font-medium">{modelKey(type)}</span>
                <span className="text-xs text-muted-foreground">O1 · type</span>
              </button>
            </li>
          )}
          {model && (
            <li>
              <button className={row} onClick={() => onSelect(focus)}>
                <span className="font-medium">{focus}</span>
                <span className="text-xs text-muted-foreground">
                  {model.level === "O2" ? "O2 · concepts" : "O0 · instance"}
                </span>
              </button>
            </li>
          )}
        </ul>
      </Section>
      {!readOnly && type && <AddElement fed={fed} model={type} update={update} onSelect={onSelect} />}
      {!readOnly && model && model.level !== "O1" && (
        <AddElement fed={fed} model={model} update={update} onSelect={onSelect} />
      )}
      {model?.level === "O0" && (
        <DeviceModeling
          fed={fed}
          model={focus}
          readOnly={readOnly}
          readings={readings}
          update={update}
          onSelect={onSelect}
        />
      )}
      {model?.level === "O0" && (
        <Reactions
          fed={fed}
          model={focus}
          readOnly={readOnly}
          armed={reactions?.armed ?? false}
          values={reactions?.values ?? null}
          log={reactions?.log ?? []}
          conceptsUnsaved={reactions?.conceptsUnsaved ?? false}
          update={update}
          onSelect={onSelect}
        />
      )}
      {mine.length > 0 && (
        <Section title="Correspondences it initiates">
          <ul className="space-y-1">
            {mine.map((link) => (
              <li key={link.id}>
                <button className={row} onClick={() => onSelect(LINK + link.id)}>
                  <span className="min-w-0 truncate">{link.id}</span>
                  <Tone value={statuses.find((s) => s.correspondence === link.id)?.status ?? "holds"} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {uses.length > 0 && (
        <Section title="Other DTs that depend on it">
          <ul className="space-y-1">
            {uses.map((link) => (
              <li key={link.id}>
                <button className={row} onClick={() => onSelect(LINK + link.id)}>
                  <span className="min-w-0 truncate">
                    {modelOf(link.ends.initiating)} · {link.id}
                  </span>
                  <Tone value={statuses.find((s) => s.correspondence === link.id)?.status ?? "holds"} />
                </button>
              </li>
            ))}
          </ul>
        </Section>
      )}
      {model?.level === "O2" && (
        <Section title="Admitted derivations">
          {fed.derivations.length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
          <ul className="space-y-1 text-sm">
            {fed.derivations.map((rule) => (
              <li key={`${rule.source}->${rule.target}`}>
                {rule.source} → {rule.target}: <Code>{rule.expression}</Code>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function onSelectLater(onSelect: (id: string | null) => void, id: string | null) {
  if (id) queueMicrotask(() => onSelect(id));
}

// -- models ------------------------------------------------------------------

/** A new class in a type, or a new object in an instance: its name and what it is an instance of. */
function AddElement({ fed, model, update, onSelect }: Pick<PropertiesProps, "fed" | "update" | "onSelect"> & { model: Model }) {
  const key = modelKey(model);
  const type = typeOf(fed, model);
  const meta = fed.models[model.typedBy ?? ""];
  const [name, setName] = useState("");
  const [kind, setKind] = useState("");
  const concepts = model.level === "O2";
  const options = model.level === "O0" ? Object.keys(type?.eClasses ?? {}) : Object.keys(meta?.eClasses ?? {});
  const chosen = kind || options[0] || "";

  const add = () => {
    const wanted = name.trim();
    if (!wanted || (!chosen && !concepts)) return;
    update((f) => {
      const target = f.models[key];
      if (concepts) {
        const id = uniqueName(Object.keys(target.eClasses), wanted);
        target.eClasses[id] = { name: id, instanceOf: null, eAttributes: {}, eReferences: {}, properties: {} };
        onSelectLater(onSelect, ref(key, id));
      } else if (target.level === "O0") {
        const id = uniqueName(Object.keys(target.objects), wanted);
        target.objects[id] = { name: id, instanceOf: chosen, bindings: {}, slots: {} };
        onSelectLater(onSelect, ref(key, id));
      } else {
        const id = uniqueName(Object.keys(target.eClasses), wanted);
        target.eClasses[id] = { name: id, instanceOf: chosen, eAttributes: {}, eReferences: {}, properties: {} };
        onSelectLater(onSelect, ref(key, id));
      }
    });
    setName("");
  };

  return (
    <Section title={concepts ? `Add a concept to ${key}` : model.level === "O0" ? `Add an object to ${key}` : `Add a class to ${key}`}>
      <div className={`grid items-end gap-2 ${concepts ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr_1fr_auto]"} ${!concepts && options.length === 0 ? "hidden" : ""}`}>
        <Field label="Name">
          <input
            className="h-10 min-w-0 rounded-md border bg-background px-2 text-sm text-foreground"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && add()}
          />
        </Field>
        {!concepts && (
          <Field label="instanceOf">
            <Choice value={chosen} options={options} onChange={setKind} />
          </Field>
        )}
        <Act onClick={add} disabled={!name.trim() || (!chosen && !concepts)}>
          Add
        </Act>
      </div>
      {concepts && (
        <p className="text-sm text-muted-foreground">
          A concept is shared by every DT: the classes of their types are its instances.
        </p>
      )}
      {!concepts && options.length === 0 && (
        <p className="text-sm text-muted-foreground">
          {model.level === "O0" ? "The type of this model has no class yet: add one first." : "There is no concept to instantiate."}
        </p>
      )}
    </Section>
  );
}

function ModelEditor({ fed, model, readOnly, update, onSelect }: PropertiesProps & { model: Model }) {
  const key = modelKey(model);

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-base font-semibold">{key}</h2>
        <p className="text-sm text-muted-foreground">
          {model.level === "O0" ? "O0 · instances of a DT" : model.level === "O1" ? "O1 · versioned DT type" : "O2 · generic concepts"}
        </p>
      </header>
      {model.level === "O0" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="DT">
            <Text
              value={model.dt ?? ""}
              disabled={readOnly}
              onCommit={(value) => update((f) => void (f.models[key].dt = value || null))}
            />
          </Field>
          <Field label="Conforms to">
            <p className="flex h-10 items-center text-sm text-foreground">{model.typedBy}</p>
          </Field>
        </div>
      )}
      {model.level === "O1" && (
        <p className="text-sm">
          Typed by <Code>{model.typedBy}</Code>. Committing the model gives this type its next version.
        </p>
      )}
      {!readOnly && <AddElement fed={fed} model={model} update={update} onSelect={onSelect} />}
      {model.level === "O0" && (
        <Capabilities fed={fed} instance={model.name} readOnly={readOnly} update={update} onSelect={onSelect} />
      )}
    </div>
  );
}

/** The observation keys of a DT: what it reported and what its sensors provide, and who uses them. */
function Capabilities(props: {
  fed: Federation;
  instance: string;
  only?: string;
  readOnly?: boolean;
  update?: (change: (fed: Federation) => void) => void;
  onSelect?: (id: string | null) => void;
}) {
  const { fed, instance, only } = props;
  const provided = providedKeys(fed, instance);
  const keys = Object.entries(availableKeys(fed, instance)).filter(([key]) => !only || key === only);
  return (
    <Section title={only ? `Observation key of ${instance}` : "Observation keys of the DT"}>
      {keys.length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
      <ul className="space-y-1 text-sm">
        {keys.map(([key, capability]) => {
          const users = usersOf(fed, instance, key);
          const sensed = key in provided;
          return (
            <li key={key} className="flex min-h-10 items-center justify-between gap-2">
              <span className="min-w-0">
                <Code>{key}</Code> {[capability.eType, capability.unit, capability.meaning].filter(Boolean).join(" · ")}
                <span className="block text-xs text-muted-foreground">
                  {sensed ? "provided by a sensor of the model" : "reported by the DT"}
                  {users.length ? ` · used by ${users.join(", ")}` : " · not used"}
                </span>
              </span>
              {!props.readOnly && props.update && !sensed && users.length === 0 && (
                <Act
                  title="The DT no longer reports this key, and nothing in the model uses it"
                  onClick={() => {
                    props.update?.((f) => void delete f.capabilities[instance]?.[key]);
                    if (only) props.onSelect?.(instance);
                  }}
                >
                  Remove
                </Act>
              )}
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted-foreground">
        A key the DT reports changes with an observation from the runtime; one that nothing uses any more can be
        removed here. A key a sensor provides is changed on the sensor.
      </p>
    </Section>
  );
}

// -- classes -----------------------------------------------------------------

function ClassEditor(props: PropertiesProps & { model: Model; eclass: EClass }) {
  const { fed, model, eclass, update, onSelect } = props;
  const key = modelKey(model);
  const readOnly = props.readOnly;
  const meta = fed.models[model.typedBy ?? ""];
  // The classes of the DT types in use that are instances of this concept.
  const users =
    model.level === "O2"
      ? instances(fed).flatMap((instance) => {
          const type = typeOf(fed, instance);
          return Object.values(type?.eClasses ?? {})
            .filter((c) => type?.typedBy === key && c.instanceOf === eclass.name)
            .map((c) => ref(modelKey(type as Model), c.name));
        })
      : [];
  const inherited = classProps(fed, model, eclass.name);
  const edit = (change: (c: EClass) => void) => update((f) => change(f.models[key].eClasses[eclass.name]));
  // The references of this class that no relation between the shared concepts admits.
  const unadmitted =
    model.level === "O1"
      ? checkConformance(fed).filter((issue) => {
          const at = parseRef(issue.element);
          return issue.check === "O1->O2" && at.model === key && at.path[0] === eclass.name && at.path.length === 2;
        })
      : [];
  // What the concept of this class can relate to; null when the concepts state no relation at all.
  const related = Object.values(meta?.eClasses ?? {}).some((c) => Object.keys(c.eReferences).length > 0);
  const admitted = related
    ? Object.values(meta?.eClasses[eclass.instanceOf ?? ""]?.eReferences ?? {}).map(
        (r) => `${r.eType} (${r.name}${r.containment ? ", made of" : ""}${r.upperBound === -1 ? ", many" : ""})`,
      )
    : null;

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-base font-semibold">{eclass.name}</h2>
        <p className="text-sm text-muted-foreground">{model.level === "O2" ? "Concept" : "Class"} of {key}</p>
      </header>
      {!readOnly && model.level === "O2" && (
        <Rename
          key={eclass.name}
          name={eclass.name}
          taken={Object.keys(model.eClasses)}
          note="The types of the DTs are not touched: a DT that uses this concept finds the change as drift, and its modeler follows."
          onRename={(to) => {
            update((f) => void renameConcept(f, key, eclass.name, to));
            onSelect(ref(key, to));
          }}
        />
      )}
      {!readOnly && model.level === "O1" && (
        <Rename
          key={eclass.name}
          name={eclass.name}
          taken={Object.keys(model.eClasses)}
          note="Its objects and the references to it follow. Another DT that uses it finds the change as drift."
          onRename={(to) => {
            update((f) => void renameClass(f, model.name, eclass.name, to));
            onSelect(ref(key, to));
          }}
        />
      )}
      {model.level === "O1" && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="instanceOf (O2 concept)">
            <Choice
              value={eclass.instanceOf ?? ""}
              disabled={readOnly}
              options={Object.keys(meta?.eClasses ?? {})}
              onChange={(value) => edit((c) => void (c.instanceOf = value))}
            />
          </Field>
          {inherited.dependent && (
            <Field label="Interim behaviour (onDrift)">
              <Choice
                value={eclass.properties.onDrift ?? ""}
                disabled={readOnly}
                empty="suspend (default)"
                options={INTERIM_BEHAVIOURS}
                onChange={(value) =>
                  edit((c) => {
                    if (value) c.properties.onDrift = value;
                    else delete c.properties.onDrift;
                  })
                }
              />
            </Field>
          )}
        </div>
      )}
      {model.level === "O2" && (
        <Section title="What its instances are">
          <ul className="space-y-1.5 text-sm">
            {Object.entries(CONCEPT_ROLES).map(([flag, meaning]) => (
              <li key={flag}>
                <label className="flex min-h-10 items-start gap-2">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0"
                    disabled={readOnly}
                    checked={Boolean(eclass.properties[flag])}
                    onChange={(event) =>
                      edit((c) => {
                        if (event.target.checked) c.properties[flag] = true;
                        else delete c.properties[flag];
                      })
                    }
                  />
                  <span className="min-w-0">
                    <Code>{flag}</Code> <span className="text-muted-foreground">{meaning}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {!Object.keys(CONCEPT_ROLES).some((flag) => eclass.properties[flag]) && (
            <p className="text-sm text-muted-foreground">With none of them, an entity: what the other concepts are about.</p>
          )}
        </Section>
      )}
      {model.level === "O2" && (
        <Section title="Classes of the DTs that are its instances">
          {users.length === 0 && <p className="text-sm text-muted-foreground">None: no DT uses this concept.</p>}
          <ul className="space-y-1 text-sm">
            {users.map((user) => (
              <li key={user}>
                <Code>{user}</Code>
              </li>
            ))}
          </ul>
          {users.length > 0 && !readOnly && (
            <p className="text-xs text-muted-foreground">
              Renaming or deleting the concept puts these DTs in drift, top-down, until their modelers follow.
            </p>
          )}
        </Section>
      )}
      <Section
        title="Attributes"
        action={
          !readOnly && (
            <Act
              onClick={() =>
                edit((c) => {
                  const name = uniqueName(Object.keys(c.eAttributes), "attribute");
                  c.eAttributes[name] = { name, eType: "EInt", unit: null, meaning: null, upperBound: 1 };
                })
              }
            >
              Add
            </Act>
          )
        }
      >
        {Object.values(eclass.eAttributes).map((attribute) => (
          <div key={attribute.name} className="grid grid-cols-[1.2fr_1fr_0.8fr_1.1fr_auto] items-end gap-1.5">
            <Field label="Name">
              <Text
                value={attribute.name}
                disabled={readOnly}
                onCommit={(value) =>
                  value &&
                  update((f) => {
                    if (model.level === "O1" && fed.models[model.name]) {
                      void renameAttribute(f, model.name, eclass.name, attribute.name, value);
                      return;
                    }
                    const c = f.models[key].eClasses[eclass.name];
                    c.eAttributes = renameKey(c.eAttributes, attribute.name, value);
                    c.eAttributes[value].name = value;
                  })
                }
              />
            </Field>
            <Field label="eType">
              <Choice
                value={attribute.eType}
                disabled={readOnly}
                options={PRIMITIVES}
                onChange={(value) => edit((c) => void (c.eAttributes[attribute.name].eType = value))}
              />
            </Field>
            <Field label="Unit">
              <Text
                value={attribute.unit ?? ""}
                disabled={readOnly}
                onCommit={(value) => edit((c) => void (c.eAttributes[attribute.name].unit = value || null))}
              />
            </Field>
            <Field label="Meaning">
              <Text
                value={attribute.meaning ?? ""}
                disabled={readOnly}
                onCommit={(value) => edit((c) => void (c.eAttributes[attribute.name].meaning = value || null))}
              />
            </Field>
            {!readOnly && (
              <Act
                variant="ghost"
                title={`Remove ${attribute.name}`}
                className="w-10 px-0"
                onClick={() => edit((c) => void delete c.eAttributes[attribute.name])}
              >
                ✕
              </Act>
            )}
          </div>
        ))}
        {Object.keys(eclass.eAttributes).length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
      </Section>
      {model.level !== "O0" && (
        <Section
          title={model.level === "O2" ? "Relations to other concepts" : "References"}
          action={
            !readOnly && (
              <Act
                onClick={() =>
                  edit((c) => {
                    const name = uniqueName(Object.keys(c.eReferences), "reference");
                    c.eReferences[name] = {
                      name,
                      eType: Object.keys(model.eClasses)[0],
                      lowerBound: 0,
                      upperBound: 1,
                      containment: false,
                    };
                  })
                }
              >
                Add
              </Act>
            )
          }
        >
          {Object.values(eclass.eReferences).map((reference) => (
            <div key={reference.name} className="grid grid-cols-[1.1fr_1.2fr_0.8fr_1fr_auto] items-end gap-1.5">
              <Field label="Name">
                <Text
                  value={reference.name}
                  disabled={readOnly}
                  onCommit={(value) =>
                    value &&
                    edit((c) => {
                      c.eReferences = renameKey(c.eReferences, reference.name, value);
                      c.eReferences[value].name = value;
                    })
                  }
                />
              </Field>
              <Field label="eType">
                <Choice
                  value={reference.eType}
                  disabled={readOnly}
                  options={Object.keys(model.eClasses)}
                  onChange={(value) => edit((c) => void (c.eReferences[reference.name].eType = value))}
                />
              </Field>
              <Field label="Multiplicity">
                <Choice
                  value={multiplicityOf(reference.lowerBound, reference.upperBound)}
                  disabled={readOnly}
                  options={MULTIPLICITY}
                  onChange={(value) => edit((c) => void Object.assign(c.eReferences[reference.name], boundsOf(value)))}
                />
              </Field>
              <Field label="Kind">
                <Choice
                  value={reference.containment ? "containment" : "reference"}
                  disabled={readOnly}
                  options={[
                    { value: "reference", label: "refers to" },
                    { value: "containment", label: "is made of" },
                  ]}
                  onChange={(value) =>
                    edit((c) => void (c.eReferences[reference.name].containment = value === "containment"))
                  }
                />
              </Field>
              {!readOnly && (
                <Act
                  variant="ghost"
                  title={`Remove ${reference.name}`}
                  className="w-10 px-0"
                  onClick={() => edit((c) => void delete c.eReferences[reference.name])}
                >
                  ✕
                </Act>
              )}
            </div>
          ))}
          {Object.keys(eclass.eReferences).length === 0 && <p className="text-sm text-muted-foreground">None.</p>}
          {unadmitted.map((issue) => (
            <p key={issue.element} className="text-sm text-red-900">
              <Code>{parseRef(issue.element).path[1]}</Code> {issue.message}.
            </p>
          ))}
          {model.level === "O2" && (
            <p className="text-xs text-muted-foreground">
              A reference between two classes of a DT type is an instance of a relation between their concepts: it is
              admitted only when such a relation exists, of the same kind and within its multiplicity. A relation
              with a minimum of 1 is required of every class of this concept.
            </p>
          )}
          {model.level === "O1" && admitted !== null && (
            <p className="text-xs text-muted-foreground">
              {admitted.length
                ? `By the shared concepts, the concept ${eclass.instanceOf} can relate to: ${admitted.join(", ")}.`
                : `The shared concepts state no relation for the concept ${eclass.instanceOf}: this class can have no reference.`}
            </p>
          )}
        </Section>
      )}
      {Object.keys(eclass.eOperations ?? {}).length > 0 && (
        <Section title="Operations">
          {Object.values(eclass.eOperations ?? {}).map((operation) => (
            <div key={operation.name} className="flex items-start justify-between gap-2 rounded-md border p-2 text-sm">
              <span className="min-w-0">
                <span className="font-medium">{operation.name}</span>(
                {Object.values(operation.eParameters)
                  .map((p) => `${p.name}: ${p.eType}${p.unit ? ` [${p.unit}]` : ""}`)
                  .join(", ")}
                )
                {operation.description && (
                  <span className="block text-xs text-muted-foreground">{operation.description}</span>
                )}
              </span>
              {!readOnly && (
                <Act
                  variant="ghost"
                  title={`Remove ${operation.name}`}
                  className="w-10 shrink-0 px-0"
                  onClick={() =>
                    edit((c) => {
                      delete c.eOperations?.[operation.name];
                      if (c.eOperations && !Object.keys(c.eOperations).length) delete c.eOperations;
                    })
                  }
                >
                  ✕
                </Act>
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            What an instance of this class can be asked to do. They are invoked on the object, in its Properties.
          </p>
        </Section>
      )}
      {!readOnly && (
        <Act
          variant="destructive"
          onClick={() => {
            update((f) => {
              if (f.models[key].level === "O2") removeConcept(f, key, eclass.name);
              else delete f.models[key].eClasses[eclass.name];
            });
            onSelect(key);
          }}
        >
          {model.level === "O2" ? "Delete concept" : "Delete class"}
        </Act>
      )}
    </div>
  );
}

// -- objects -----------------------------------------------------------------

function parseValue(text: string, etype: string): unknown {
  if (etype === "EBoolean") return text.trim().toLowerCase() === "true";
  if (etype === "EInt" || etype === "EDouble") return Number(text);
  return text;
}

function ObjectEditor(props: PropertiesProps & { model: Model; obj: EObject }) {
  const { fed, model, obj, readOnly, statuses, update, onSelect } = props;
  const type = typeOf(fed, model);
  const eclass = type?.eClasses[obj.instanceOf];
  const needsSource = Boolean(classProps(fed, type, obj.instanceOf).requiresSource);
  const capabilities = Object.keys(availableKeys(fed, model.name));
  const provides = isSensor(fed, model, obj);
  const part = devicesOf(fed, model.name)
    .flatMap((device) => device.sensors.map((spec) => ({ device, spec })))
    .find((candidate) => candidate.spec.id === obj.name);
  const edit = (change: (o: EObject) => void) => update((f) => change(f.models[model.name].objects[obj.name]));
  const others = Object.values(fed.models).filter((m) => m.level === "O0" && m.name !== model.name);
  // An entity: what the other concepts are about, with no role of its own in the model.
  const role = classProps(fed, type, obj.instanceOf);
  const plainEntity = !Object.keys(CONCEPT_ROLES).some((flag) => role[flag]);
  const twin = representationOf(fed, ref(model.name, obj.name));

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-base font-semibold">{obj.name}</h2>
        <p className="text-sm text-muted-foreground">
          Object of {model.name} ({model.typedBy})
        </p>
      </header>
      {!readOnly && (
        <Rename
          key={obj.name}
          name={obj.name}
          taken={Object.keys(model.objects)}
          note="What refers to it in this model follows. Another DT that uses it finds the change as drift."
          onRename={(to) => {
            update((f) => void renameObject(f, model.name, obj.name, to));
            onSelect(ref(model.name, to));
          }}
        />
      )}
      <Field label="instanceOf">
        <Choice
          value={obj.instanceOf}
          disabled={readOnly}
          options={[...new Set([obj.instanceOf, ...Object.keys(type?.eClasses ?? {})])]}
          onChange={(value) => edit((o) => void (o.instanceOf = value))}
        />
      </Field>
      {!eclass && (
        <p className="text-sm text-red-800">
          {model.typedBy} has no class {obj.instanceOf}: the object does not conform to its type.
        </p>
      )}
      {eclass && plainEntity && (twin || (!readOnly && others.length > 0)) && (
        <Field label="Twin: the DT of this entity">
          <Choice
            value={twin ?? ""}
            disabled={readOnly}
            empty="none"
            options={others.map((m) => ({ value: m.name, label: m.dt ? `${m.dt} · ${m.name}` : m.name }))}
            onChange={(value) => update((f) => setRepresentation(f, ref(model.name, obj.name), value || null))}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            What this model is made of, when another DT is the twin of the part. It is a link of the weaving of{" "}
            {model.name}: the other model is not touched.
          </p>
        </Field>
      )}
      {eclass && Object.keys(eclass.eAttributes).length > 0 && (
        <Section title="Attributes">
          {Object.values(eclass.eAttributes).map((attribute) => {
            const element = ref(model.name, obj.name, attribute.name);
            const incoming = links(fed, CORRESPONDENCE).filter((l) => l.ends.initiating === element);
            return (
              <div key={attribute.name} className="space-y-1.5 rounded-md border p-2">
                <p className="text-sm">
                  <span className="font-medium">{attribute.name}</span>: {attribute.eType}
                  {attribute.unit ? ` [${attribute.unit}]` : ""}
                  {attribute.meaning && <span className="text-muted-foreground"> · {attribute.meaning}</span>}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {provides ? (
                    <Field label="Sensed: provides observation key">
                      <Text
                        value={obj.bindings[attribute.name] ?? ""}
                        disabled={readOnly}
                        placeholder="(a setting, not sensed)"
                        onCommit={(value) =>
                          edit((o) => {
                            if (value.trim()) o.bindings[attribute.name] = value.trim();
                            else delete o.bindings[attribute.name];
                          })
                        }
                      />
                    </Field>
                  ) : (
                    <Field label="Bound to observation key">
                      <Choice
                        value={obj.bindings[attribute.name] ?? ""}
                        disabled={readOnly}
                        empty="(not bound)"
                        options={[...new Set([...capabilities, ...Object.values(obj.bindings)])]}
                        onChange={(value) =>
                          edit((o) => {
                            if (value) o.bindings[attribute.name] = value;
                            else delete o.bindings[attribute.name];
                          })
                        }
                      />
                    </Field>
                  )}
                  {!needsSource && (
                    <Field label="Value">
                      <Text
                        value={attribute.name in obj.slots ? String(obj.slots[attribute.name]) : ""}
                        disabled={readOnly}
                        onCommit={(value) =>
                          edit((o) => {
                            if (value === "") delete o.slots[attribute.name];
                            else o.slots[attribute.name] = parseValue(value, attribute.eType);
                          })
                        }
                      />
                    </Field>
                  )}
                </div>
                {incoming.map((link) => (
                  <button
                    key={link.id}
                    className="flex min-h-10 w-full items-center justify-between gap-2 rounded-md bg-muted/60 px-2 text-left text-sm hover:bg-muted"
                    onClick={() => onSelect(LINK + link.id)}
                  >
                    <span className="min-w-0 truncate">
                      {link.id} ← {link.ends.participating ?? "?"}
                    </span>
                    <Tone value={statuses.find((s) => s.correspondence === link.id)?.status ?? "holds"} />
                  </button>
                ))}
                {!readOnly && needsSource && !(attribute.name in obj.bindings) && (
                  <Field label="Add a correspondence: provided by">
                    <Choice
                      value=""
                      empty="choose a DT or an element…"
                      options={[
                        ...others.map((m) => ({ value: m.name, label: `${m.name} (element not known yet)` })),
                        ...attributeElements(fed, model.name),
                      ]}
                      onChange={(value) =>
                        value && update((f) => void onSelectLater(onSelect, LINK + addCorrespondence(f, element, value)))
                      }
                    />
                  </Field>
                )}
              </div>
            );
          })}
        </Section>
      )}
      {part && part.spec.operations.length > 0 && (
        <Section title="Operations">
          <Operations device={part.device} part={part.spec} />
        </Section>
      )}
      {eclass && Object.keys(eclass.eOperations ?? {}).length > 0 && !part && (
        <Section title="Operations">
          <p className="text-sm text-muted-foreground">
            {Object.values(eclass.eOperations ?? {}).map(signature).join(", ")}. They can be invoked once this object
            refers to a device.
          </p>
        </Section>
      )}
      {eclass && Object.keys(eclass.eReferences).length > 0 && (
        <Section title="References">
          {Object.values(eclass.eReferences).map((reference) => {
            const candidates = Object.values(model.objects).filter((o) => o.instanceOf === reference.eType);
            const current = targets(obj, reference.name);
            const many = reference.upperBound === -1;
            return (
              <div key={reference.name} className="space-y-1 rounded-md border p-2">
                <p className="text-sm">
                  <span className="font-medium">{reference.name}</span>: {reference.eType} [
                  {multiplicityOf(reference.lowerBound, reference.upperBound)}]
                </p>
                {many ? (
                  <div className="flex flex-wrap gap-x-4">
                    {candidates.map((candidate) => (
                      <label key={candidate.name} className="flex min-h-10 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4"
                          disabled={readOnly}
                          checked={current.includes(candidate.name)}
                          onChange={(event) =>
                            edit((o) => {
                              const next = event.target.checked
                                ? [...targets(o, reference.name), candidate.name]
                                : targets(o, reference.name).filter((t) => t !== candidate.name);
                              if (next.length) o.slots[reference.name] = next;
                              else delete o.slots[reference.name];
                            })
                          }
                        />
                        {candidate.name}
                      </label>
                    ))}
                    {candidates.length === 0 && (
                      <p className="text-sm text-muted-foreground">No object of {reference.eType} yet.</p>
                    )}
                  </div>
                ) : (
                  <Choice
                    value={current[0] ?? ""}
                    disabled={readOnly}
                    empty="(none)"
                    options={candidates.map((c) => c.name)}
                    onChange={(value) =>
                      edit((o) => {
                        if (value) o.slots[reference.name] = value;
                        else delete o.slots[reference.name];
                      })
                    }
                  />
                )}
              </div>
            );
          })}
        </Section>
      )}
      {!readOnly && (
        <Act
          variant="destructive"
          onClick={() => {
            update((f) => {
              delete f.models[model.name].objects[obj.name];
              setRepresentation(f, ref(model.name, obj.name), null); // its twin is stated for it alone
            });
            onSelect(model.name);
          }}
        >
          Delete object
        </Act>
      )}
    </div>
  );
}

// -- correspondences ---------------------------------------------------------

function CorrespondenceEditor(props: PropertiesProps & { id: string }) {
  const { fed, id, readOnly, statuses, update, onSelect } = props;
  const link = findLink(fed, id);
  if (!link) return <Gone />;
  const status = statuses.find((s) => s.correspondence === id);
  const initiating = link.ends.initiating;
  const own = parseRef(initiating).model;
  const others = Object.values(fed.models).filter((m) => m.level === "O0" && m.name !== own);
  const edit = (change: (props: Record<string, unknown>) => void) =>
    update((f) => {
      const target = findLink(f, id);
      if (target) change(target.props);
    });
  const timeliness = (name: string, value: string) =>
    edit((p) => {
      const next = { ...((p.timeliness as Record<string, number>) ?? {}) };
      if (value === "" || Number.isNaN(Number(value))) delete next[name];
      else next[name] = Number(value);
      if (Object.keys(next).length) p.timeliness = next;
      else delete p.timeliness;
    });

  return (
    <div className="space-y-5">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">{id}</h2>
          <p className="text-sm text-muted-foreground">Correspondence · peer link between two DTs</p>
        </div>
        {status && <Tone value={status.status} />}
      </header>
      {status && status.reasons.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-sm text-red-900">
          {status.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      <Field label="Initiating element (what is expected)">
        <button className="min-h-10 text-left" onClick={() => onSelect(ref(own, parseRef(initiating).path[0]))}>
          <Code>{initiating}</Code>
        </button>
      </Field>
      <Field label="Participating element (what provides it)">
        <Choice
          value={link.ends.participating ?? ""}
          disabled={readOnly}
          options={[
            ...new Set([
              ...(link.ends.participating ? [link.ends.participating] : []),
              ...others.map((m) => m.name),
              ...attributeElements(fed, own),
            ]),
          ]}
          onChange={(value) => update((f) => retargetCorrespondence(f, id, value))}
        />
      </Field>
      <Section title="Expectations">
        <p className="text-sm">
          {Object.entries((link.props.expects as Record<string, unknown>) ?? {})
            .map(([name, value]) => `${name === "typeVersion" ? "verified against" : name}: ${String(value)}`)
            .join(" · ") || "None stated."}
        </p>
        <p className="text-xs text-muted-foreground">
          Refreshed from the participating element whenever you choose one; checked at every commit. A newer version
          of the participating model is not drift while the element still has this type, unit and meaning.
        </p>
      </Section>
      <Field label="Mapping (derives the expected value, e.g. count > 0)">
        <Text
          value={(link.props.mapping as string) ?? ""}
          disabled={readOnly}
          placeholder="none"
          onCommit={(value) =>
            edit((p) => {
              if (value.trim()) p.mapping = value.trim();
              else delete p.mapping;
            })
          }
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Timeliness: max age (s)">
          <Text
            value={String(link.props.timeliness?.maxAge ?? "")}
            disabled={readOnly}
            onCommit={(value) => timeliness("maxAge", value)}
          />
        </Field>
        <Field label="Sync tolerance (s)">
          <Text
            value={String(link.props.timeliness?.syncTolerance ?? "")}
            disabled={readOnly}
            onCommit={(value) => timeliness("syncTolerance", value)}
          />
        </Field>
      </div>
      {link.props.status === "pending" && (
        <Section title="Pending change request">
          <p className="text-sm">{link.props.changeRequest}</p>
          {!readOnly && (
            <Act
              onClick={() =>
                edit((p) => {
                  delete p.status;
                  delete p.changeRequest;
                  delete p.interim;
                })
              }
            >
              Close the change request
            </Act>
          )}
        </Section>
      )}
      {!readOnly && (
        <Act
          variant="destructive"
          onClick={() => {
            update((f) => removeLink(f, id));
            onSelect(null);
          }}
        >
          Delete correspondence
        </Act>
      )}
    </div>
  );
}
