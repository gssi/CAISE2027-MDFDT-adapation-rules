# Drift management in federations of digital twins: initial specification

Status: initial spec for a **reference implementation**. It accompanies a research paper; the goal is a small, readable system that reproduces two scenarios end to end, not a product.

## 1. Purpose

Show that drift in a federation of digital twins (DTs) can be managed **model-first**: every evolution is handled at the modeling layer, where a *modelling assistant* identifies the change, detects and classifies the drift, estimates its impact, and reports an *adaptation plan* to a human modeler. The running federation is regenerated from the model and never patched by hand.

The implementation must stay **generic**: no assumption on the application domain or on the internal structure of a DT. The smart-building example in section 6 is only the test case.

## 2. Concepts

| Term | Meaning |
|---|---|
| Participating DT | A DT that exposes data and functions about its own physical system. |
| Initiating DT | A DT that builds indicators, goals and rules on what participants expose. A **role in a relation**, not a container: the same DT can play both roles. |
| Multi-level model | Three levels: **O2** generic concepts, **O1** versioned DT types, **O0** instances of the federation. Runtime data sits below O0. |
| Version | Every O1 type is versioned (v1, v2, ...). Each O0 instance conforms to one version. Different versions of the same type can coexist. |
| Correspondence | An explicit, versioned statement of what an initiating DT expects from a participant: meaning, type, unit, timeliness, and the type version it was verified against. |
| Vertical drift | Inconsistency across levels of the **same** DT. *Bottom-up* if it originates in data, *top-down* if it originates in a type or concept. |
| Horizontal drift | A correspondence **between** DTs that no longer holds: *broken*, *missing*, or *ambiguous*. |
| Adaptation plan | A set of model changes that resolves a drift, plus the behaviour of affected elements until it is applied. |

Key observation the system must reproduce: a legitimate vertical evolution in one DT becomes horizontal drift for a DT that did not change.

## 3. Reference architecture

Two layers and two flows between them.

**Modeling layer**
- Multi-level model (O2, O1, O0) and correspondences.
- Model repository: stores versions; every commit passes a *conformance gate* (O0 conforms to O1, O1 to O2) and a *correspondence check*.
- Modelling assistant: runs the process in section 5.
- Modeler (human): accepts, edits or rejects the adaptation plan.

**Federation layer (runtime)**
- Initiating and participating DTs, generated from the model.
- Each participating DT exposes data and functions, and reports what it can observe (its capabilities).

**Flows**
- *Projection* (down): committed model → generated runtime configuration.
- *Observations* (up): runtime → modeling layer.

Assumption: all DT models and all correspondences are visible in one common model repository. Inside it every DT has a model of its own, with its own versions (section 9, decision 7); repositories under separate authorities are out of scope (section 7).

## 4. Model

Proposed minimal content; names and serialization are open (section 9).

- **O2 concept**: name, attributes. Example set: `Entity`, `Observation`, `Indicator`, `Goal`.
- **O1 type**: name, version, the O2 concept it specializes, attributes with type and unit.
- **O0 instance**: id, owning DT, the O1 type and version it conforms to, attribute bindings.
- **Correspondence**: id, initiating element, participating element, expected type version, expected value type and unit, meaning (free text or reference to an O2 concept), timeliness (max age, synchronization tolerance), optional mapping expression.
- **Relations between types**: an O1 type can refer to another type of the same model, with a multiplicity; a reference can be a containment (the whole is made of its parts, e.g. a building of its rooms).
- **Representation**: id, an entity of the model of a DT, and the DT that is the twin of that entity. It is how a DT made of what other DTs represent says so (the room of Building's model is the one Room 1 is the twin of).
- **Dependency links**: which indicators, goals and rules use which elements. They can be derived from the model rather than stored.
- **Capabilities** of a DT: the observation keys it can provide, with type and unit, including those not yet used by the model.

## 5. Process

Triggered by every identified change. Four steps, each producing an artifact that the next step consumes. The artifacts must be serializable and inspectable, since they are shown in the paper.

| Step | Input | Activity | Output artifact |
|---|---|---|---|
| 1. Change | runtime observation, or model edit | compare with the last committed version at every level | **change set**: what changed and its origin (DT, level) |
| 2. Drift | change set, correspondences | check conformance within the evolved DT; check correspondences involving the evolved elements | **classified drift**: vertical (bottom-up, top-down) and/or horizontal (broken, missing, ambiguous) |
| 3. Impact | classified drift, dependency links | follow dependencies to indicators, goals, rules and peer DTs | **impact report**: affected elements, DTs left at an older version, severity |
| 4. Adaptation | impact report, DT capabilities | generate and rank resolution options | **adaptation plan**: model changes plus interim behaviour |

Resolution options in step 4: **adapt** the dependent element to the new version; **derive** the expected value from the available one (a mapping in the correspondence); **migrate** the DTs left behind; or issue a **change request** when nothing in the model can resolve it.

Model-first loop: plan → modeler decision → commit (new model and correspondence versions) → projection → runtime. Later observations re-enter at step 1.

Rules the implementation must respect:
- The assistant proposes; only a modeler decision produces a commit.
- No value coercion across meanings (see A2).
- Static properties of a correspondence (type, unit, version) are checked at commit time. Timeliness is checked at runtime and, when violated, re-enters the process as a change.

## 6. Scenarios (acceptance tests)

Domain: a building with two rooms. `Room 1` and `Room 2` are participating DTs; `Building` is the initiating DT. Every DT has a model of its own (`room1`, `room2`, `building`): its type, its instance and, for `Building`, its weaving model. Only the O2 concepts (`core`) are shared, so the two rooms are separate models even where they look alike.

### Baseline (A0)
- `room1` and `room2`, each at version 1: sensor `Presence`, measurement `Occupancy` with `occupied: Boolean`.
- `building` version 1: `RoomOccupancy` with `occupied: Boolean`, used by a lighting and ventilation policy.
- Weaving model of `building`: `RoomOccupancy` ← `room1.Occupancy`, and ← `room2.Occupancy`; expected version 1 of each room, Boolean, with agreed accuracy and timeliness.
- Expected: every model passes its own gate; no drift.

### A1: sensor replacement (a participating DT evolves)
Trigger: runtime observation. Room 1 replaces the presence sensor with a people counter and now reports `count: Integer` instead of `occupied: Boolean`.

It takes two decisions, one per model.

**In the model of Room 1**
1. Change set: origin `Room 1`, data level; new observation key `count`, missing `occupied`.
2. Drift: **vertical, bottom-up** (data no longer conforms to version 1 of the type → proposes version 2 with `PeopleCounter` and `PeopleCount`). The assistant also reports the **horizontal, broken** correspondence of `Building`, which is not for this modeler to resolve.
3. Impact: `RoomOccupancy` for Room 1 and the policy, in `Building`. Room 2 not affected.
4. The modeler accepts: `room1` gets version 2. `building` and `room2` are untouched, and `Building` is now in drift.

**In the model of Building**, which did not change
1. Change set: the models it weaves moved on (origin `Room 1`).
2. Drift: **horizontal, broken**: the Boolean element the correspondence took part with no longer exists (it was verified against version 1 of `room1`).
3. Plan, ranked: (a) derive `occupied = count > 0` as a mapping in the correspondence; (b) adapt `Building` to consume the count; plus interim behaviour for the policy.
4. The modeler accepts (a): `building` gets version 2, all correspondences hold, the policy is evaluable again.

### A2: new count requirement (the initiating DT evolves)
Starts from the end state of A1. Trigger: model edit of `building`: it adds `RoomCount` (`count: Integer`), an indicator for the total number of people, and a safety goal. Counts must be observed within an agreed time interval and synchronization tolerance.

Expected outputs:
1. Change set: origin `Building`, type level.
2. Drift: **vertical, top-down** in `Building`. **Horizontal, missing**: no element of `room2` corresponds to `RoomCount`. The correspondence with Room 1 holds.
3. Impact: the total indicator and the safety goal cannot be evaluated for the whole building.
4. Plan: `Building` cannot change the model of another DT, so the plan is a **change request** to Room 2, with the goal scoped to the rooms that provide a count in the meantime.

Hard requirement: the system must **never** interpret `occupied = true` as `count = 1`. A test must cover this.

Variants:
- Room 2 has no count: the request waits for a new data source.
- Room 2 already reports a count its model does not use: the request reaches Room 2 as a **proposed next version** of its model, built from the class that models a count in a DT that has one. When its modeler accepts, `Building` is offered to bind the pending correspondence.

## 7. Scope

In scope: the model, the repository with both checks, the four-step process with inspectable artifacts, a simulated runtime sufficient to emit observations, the two scenarios as automated tests.

Out of scope for now: real devices, a graphical editor, multiple modeling authorities with separate repositories, performance.

## 8. Suggested milestones

1. Model structures, serialization, and the A0 baseline loaded from files.
2. Repository with versioning, conformance gate and correspondence check.
3. Steps 1 and 2 on A1 (change set, classified drift).
4. Steps 3 and 4 on A1, modeler decision, commit, projection.
5. A2 on top of the A1 end state, including both variants.
6. Runtime timeliness check as a change source.

## 9. Decisions

Settled on 2026-11-11, before writing code.

1. **Stack and serialization.** TypeScript: a pure engine that runs on the server and in the browser, inside a Next.js web app with a graphical modeler. Models are YAML files in a notation inspired by Ecore/EMF (`ePackage`, `eClasses`, `eAttributes`, `eReferences`) and extended to be multi-level: every model declares its `level` and the model of the level above that types it (`typedBy`); every element is an `instanceOf` an element of the level above. Typing cascades one level at a time; there is no potency. Ecore itself is two-level, so the kernel is a small one of its own. A first implementation in Python was replaced by this one on 2026-11-11; golden artifacts generated with it pin the behaviour of the scenarios.
2. **Nature of the assistant.** Steps 1 to 3 are deterministic. Step 4 is rule-based, behind the `AdaptationPlanner` interface.
3. **Relations between models.** Expressed as **weaving models**, conforming to a weaving metamodel written in the same notation. The level of a link depends on the kind of relation: *peer* (same level: a correspondence between O0 elements of two DTs, the evolution of a type version) or *vertical* (different levels of the same DT). The classified drift and the impact report are weaving models too. A correspondence links O0 elements and carries the expectations at type level.
4. **Level names.** O2, O1, O0.
5. **Interim behaviour.** `suspend`, `exclude_input`, `keep_last_valid`, declared on the dependent class with `onDrift` (default `suspend`).
6. **Modeler interaction.** In the web app: the modeler edits the model in the diagram, sees drift, impact and the ranked plan recomputed on every edit, and accepts, edits or rejects. The decision is stored next to the commit it produces.

7. **One model per DT, versioned on its own** (2026-11-11). The repository keeps a model for every DT (type, instance, weaving model if it initiates) and a version history for each. A model is committed alone, after its own gate: its conformance across levels and, for the correspondences it initiates, the check against the current version of the models it weaves. A DT that evolves does not force the others to: the drift reaches the initiating DT as a change in what it weaves. A resolution that needs another DT to change is a change request, possibly with a proposed version, decided by the modeler of that DT. A model can go back to an earlier version, which removes the versions after it; this is refused while a version of another model was committed against one of them, so that no model is left pointing at a version that no longer exists.
8. **Changes as versions, shown as model diffs.** A proposed change is the candidate next version of a model. What it changes is shown, and stored next to the version (`changes.munidiff`), in the Munidiff syntax (A. de la Vega, MODELS-C 2023): a unified diff whose hunks are model elements.
9. **Physical devices.** A DT model can describe how its data is sensed, with two more O2 concepts: `Device` (reached through a connector; its attributes are the connection settings) and `Sensor` (on a device; its bound attributes are the parameters it senses, each providing an observation key). The layer is generic: the engine only reads the description; a *connector* reads the hardware and returns an observation batch, which enters the process like any other. Connectors so far: Tinkerforge Bricklets behind a Brick Daemon (e.g. on a Raspberry Pi), and a simulated one. A sensor that stops answering is a capability that is gone: bottom-up drift. The modeler does not transcribe the hardware: what is attached to a device is discovered and offered for adding, and what a sensor senses is linked to an observation of the model. With live reading on, the model shows the current values on the elements they reach, including what an initiating DT receives through its correspondences. What a part of a device can be asked to do is modelled as well: a class declares operations with typed parameters, a third concept `Actuator` is for parts that only act, and an operation is invoked on an object of the model, checked against its declaration and performed by the connector. This is the *functions* half of what a participating DT exposes (section 2). A fourth concept, `Reaction`, relates the two halves inside a model: when a condition on what it observes becomes true, an operation is invoked. Reactions are checked by the gate and run on the live readings only when the modeler switches them on. Scenario A1 can be played on hardware: a reading reports the keys that are gone and the parts that are attached and not in the model, and the assistant proposes the version in which the new part replaces the old one.

10. **A new version is not drift in itself** (2026-11-12). A correspondence holds as long as the participating element exists with the type, unit and meaning the correspondence states, whatever else changed in the model of the participating DT. The type version in a correspondence is the one it was last verified against: it is reported next to what is wrong, and rewritten only when the modeler of the initiating DT resolves a drift. Before this, every commit of a participating DT put the initiating DT in drift, to be closed with a change of one line that said nothing.
11. **What a DT is made of is stated in its own model** (2026-11-13). The relations between the concepts of a DT are references between its O1 types, drawn in the diagram; a containment says that the whole is made of its parts. Building has `Building` made of `Room`s, and its observations have a room as source. When a part is itself represented by a DT, a *representation* link in the weaving of the model that has the part names that DT. The link is structure: it is checked (the entity and the DT exist, one twin per entity) and it is not a source of drift. O2 concepts stay without relations: relating them (an `Entity` made of `Entity`s) would constrain every DT type and is left out until a scenario needs it.
12. **Top-down drift is what the instance holds against its evolved type** (2026-11-13). When an edit changes the type of a DT, every conformance violation of its instance (a value, a reference or a bound observation key the type no longer admits) is classified as vertical drift, top-down, between the type element and the instance element. Before this, such a change showed only as a failed check of the gate, and the classified drift listed the horizontal consequences alone. The gate still refuses the version until the instance follows.
13. **The shared concepts are edited like any model, and a DT follows them by itself** (2026-11-15). The modeler can add, rename and delete an O2 concept and state what its instances are. `core` is committed alone and passes its own gate: its commit does not change, and is not stopped by, the type of a DT. A class of a DT type whose concept is gone is a vertical drift, top-down, between the concept and the class; the impact follows from the objects of that class; the plan has one resolution per class, owned by the model of that DT: *adapt*, automatic when the concept was renamed (the class is retyped), left to the modeler when it was deleted. The drift reaches a DT as it does from a model it weaves: `core` moved on since the DT was last committed. Only the type an instance conforms to is held to the concepts of today; an earlier version of a type was checked against those of its time. The alternative, a gate of `core` that refuses to break a conforming DT, was set aside: it would make the concepts unable to evolve once used, and hide a drift the approach is meant to show.
14. **A new DT starts as an empty model** (2026-11-15). The modeler adds a DT to the repository as version 1 of a model with an empty type, typed by the shared concepts, and an empty instance. Naming it is the decision that commits it; everything else is modelled in the versions that follow.
15. **The shared concepts are related, and their relations bind the DT types** (2026-11-15). This replaces the last sentence of decision 11. An O2 concept states relations to other concepts (kind, multiplicity), drawn in the diagram of `core` and edited there. A reference between two classes of a DT type is an instance of a relation between their concepts: it is admitted only when a relation leads from the concept of its class to the concept of its target, of the same kind (reference or containment) and within its multiplicity; a relation with a minimum of 1 is required of every class of its concept. A reference does not name its relation: it is found from the concepts of the two ends, so the DT models are written as before, at the price of not telling two relations between the same pair of concepts apart. The scenario states the relations its models use, all optional: an entity is made of entities; an observation has an entity or a sensor as source; an indicator and a rule have observations as inputs; a goal has indicators; a sensor and an actuator are on a device; a reaction has an observation as input and an actuator or a sensor as target. `requiresSource` stays a role: it is about where the value comes from (runtime data or another DT), not about a reference. A relation that is changed or removed while a DT type uses it is a vertical drift, top-down, on the reference, as in decision 13, with an *adapt* option left to the modeler of that DT. Concepts that state no relation at all constrain nothing: a repository created before this decision keeps working.

## 10. Terminology to keep consistent with the paper

Use: *participating DT*, *initiating DT*, *correspondence*, *vertical drift*, *horizontal drift*, *change set*, *classified drift*, *impact report*, *adaptation plan*, *modelling assistant*, *modeler*, *projection*, *model repository*.
