# Adaptation rules at work: examples from the model repository

This note shows the rules of the modelling assistant (`evolution.ts`, `adaptation.ts`) as they were applied in recorded runs of scenario A1, then the screenshots of the walkthrough on a device.

Every committed version keeps the artifacts of the process that produced it, under `<model>/versions/NNNN/process/`:

| File | Process step |
|---|---|
| `1-change-set.yaml` | 1 · change set |
| `2-classified-drift.wm.yaml` | 2 · classified drift |
| `3-impact-report.wm.yaml` | 3 · impact report |
| `4-adaptation-plan.yaml` | 4 · adaptation plan |
| `5-decision.yaml` | the modeler decision |

The examples quote these files from two repositories: `model-repo-a1` (current run) and `model-repo-a1-archived-1` (an earlier, complete run, up to `room1` v4 and `building` v4).

## The rules, in short

| Rule | Applies to | Automatic? |
|---|---|---|
| **No adaptation** | a change that keeps conformance and every correspondence | nothing to do |
| **Evolution** | data of a DT no longer conform to its type: next version of the type, instance migrated | automatic; the gate may ask the modeler to review it |
| **Retarget** (`adapt`) | the participating element changed version but still agrees in meaning, type and unit | automatic |
| **Derive** | a mapping between the two meanings is admitted by the derivation catalogue and type-checks | automatic |
| **Bind** (`adapt`) | a missing correspondence, and the participating DT already models the element | automatic |
| **Adapt the initiating DT** | always offered for a broken correspondence: new type version, dependents revised | semi-automatic: needs the modeler |
| **Change request** | no automatic option survives verification | committed as *pending* |

Every automatic option is verified by applying it to the candidate model. It enters the plan only if its correspondence then holds and no other correspondence breaks. Options are ranked from the least to the most invasive and named `a`, `b`, …. Each option and each plan belongs to the model that owns what it changes: correspondences belong to the initiating DT.

---

## Example 1 · A non-breaking change: no adaptation

**Where:** `model-repo-a1/room1/versions/0002` (and the same pattern in `room2/versions/0002`).

**Change.** A model edit in Room 1 adds the physical device and its sensor: a `TinkerforgeDevice` and a `MotionDetectorV2` at O1 and O0. The observation `occupancy.occupied` is now bound to the key `motion_detected` instead of `occupied`. The new attribute keeps type `EBoolean` and meaning `occupancy`.

```yaml
# 1-change-set.yaml (excerpt)
trigger: model_edit
origin: { dt: Room 1, model: room1@1, level: O1 }
changes:
  - kind: modified
    level: O0
    element: room1#occupancy.bindings.occupied
    before: occupied
    after: motion_detected
  - { kind: added, level: O1, element: room1@1#MotionDetectorV2, ... }
```

**Drift and impact.** Nothing breaks: the model still conforms, and the correspondence check compares type, unit and meaning, which are unchanged.

```yaml
# 2-classified-drift.wm.yaml
holding: [c-r1-occupancy, c-r2-occupancy]
links: []
# 3-impact-report.wm.yaml
affectedDTs: []
unaffectedDTs: [Room 2, Building, Room 1]
```

**Plan and decision.** The plan has no resolutions and no interim behaviour. The modeler of Room 1 accepts, and no other DT is involved.

```yaml
resolutions: []
interim: []
# 5-decision.yaml
decision: accept
choices: {}
```

**Why it matters.** A DT can change its own model, here to add how its data are physically sensed, without anyone else being asked. Drift is about meaning, type, unit and version, not about how a value is produced.

---

## Example 2 · A breaking change seen from the participating DT: change request

**Where:** `model-repo-a1/room1/versions/0003`.

**Change.** Room 1 replaces motion detection with an NFC people counter. `Occupancy.occupied` keeps its name but becomes an `EInt` with meaning `people-count` and unit `person`, bound to the `count` of the new `Nfc` sensor. Two reactions on the occupancy are added.

**Drift.** The correspondence that Building owns breaks. The reasons are recorded one by one, and the last one is the no-coercion rule:

```yaml
- id: hd-1
  type: HorizontalDrift
  status: broken
  correspondence: c-r1-occupancy
  initiating: building#occupancy_r1.occupied
  participating: room1#occupancy.occupied
  reasons:
    - expects room1@1, but room1 conforms to room1@2
    - expects eType EBoolean, but room1#occupancy.occupied has EInt
    - expects meaning occupancy, but room1#occupancy.occupied has people-count
    - room1#occupancy.occupied provides EInt, building#occupancy_r1.occupied needs EBoolean, and there is no mapping
    - unit 'person' does not match the expected unit None
    - "meaning 'people-count' differs from 'occupancy': no value coercion across meanings"
```

**Impact.** The impact report has two entries:

- the element of Building is reached through the correspondence, with severity *high*;
- the lighting and ventilation policy is reached through a dependency inside Building, with severity *medium*.

Room 2 is listed as not affected.

```yaml
- { source: room1#occupancy.occupied, target: building#occupancy_r1.occupied,
    category: correspondence, severity: high, via: c-r1-occupancy }
- { source: building#occupancy_r1, target: building#policy,
    category: dependency, severity: medium, interim: exclude_input }
```

**Plan.** In Room 1's process the plan for `c-r1-occupancy` contains only the fallback, a change request addressed to the owner of the correspondence. The interim behaviour of the policy comes with it.

```yaml
resolutions:
  - correspondence: c-r1-occupancy
    options:
      - id: a
        kind: change_request
        description: "change request: restore room1#occupancy.occupied as expected by
          building#occupancy_r1.occupied: ...; affected elements keep their interim
          behaviour in the meantime"
interim:
  - { element: building#policy, behaviour: exclude_input,
      because: building#occupancy_r1, until: the plan is committed }
```

**Decision.** The modeler of Room 1 accepts the new version of Room 1, and `choices` is empty. The plan for Building is information for Room 1, not something Room 1 can apply, so Building's model is not touched by this commit. Building is now in drift, and it is Building's turn (Example 3).

```yaml
decision: accept
choices: {}
```

---

## Example 3 · The initiating DT follows: derive (automatic) or adapt (needs the modeler)

**Where:** `model-repo-a1/building/versions/0002`.

**Change.** For Building the change arrives as a new version of a model it weaves (`origin: Room 1, room1@3, level O1`). The drift is the same broken correspondence as in Example 2. This time it is planned in the model that owns it.

**Plan.** The planner produces two ranked options:

```yaml
- id: a
  rank: 1
  kind: derive
  automatic: true
  description: derive occupied = occupied > 0 from room1#occupancy.occupied, as a mapping in c-r1-occupancy
  changes:                      # the diff obtained by applying the option (verification)
    - { element: building-weaving#c-r1-occupancy.expects.typeVersion, before: room1@1, after: room1@3 }
    - { element: building-weaving#c-r1-occupancy.expects.eType,       before: EBoolean, after: EInt }
    - { element: building-weaving#c-r1-occupancy.expects.meaning,     before: occupancy, after: people-count }
    - { element: building-weaving#c-r1-occupancy.expects.unit,        after: person }
    - { element: building-weaving#c-r1-occupancy.mapping,             after: occupied > 0 }
- id: b
  rank: 2
  kind: adapt
  automatic: false
  description: "adapt Building to consume room1#occupancy.occupied (EInt, person) in place of
    building#occupancy_r1.occupied: a new type version, and building#policy revised by the modeler"
  params: { revise: [building#policy] }
  changes: []
```

**Which rules produced it.**

- **Derive.** The shared concepts declare one derivation, `people-count → occupancy: value > 0`. The planner renames `value` to the source attribute (here still called `occupied`, now a count), checks that the expression yields `EBoolean`, and applies it. The listed `changes` are the result of that application. The correspondence now expects what Room 1 really provides and carries the mapping that turns it into what Building needs.
- **Adapt.** Option (b) is always offered when the participating element has changed. It is not automatic, because it requires rewriting `building#policy`, so its `changes` are empty: the modeler writes them.
- **No reverse derivation.** The catalogue has no rule from `occupancy` to `people-count`. That is why, in scenario A2, the same planner can never answer a missing count with `occupied = true → count = 1`.

**Decision.** The modeler of Building chooses (a) for drift `hd-1`:

```yaml
decision: accept
choices: { hd-1: a }
```

The policy stops excluding Room 1's input. Room 2 was never involved.

In the earlier run (`model-repo-a1-archived-1/building/versions/0004`) the same rule is applied twice in one decision, after both rooms had moved to a people count: `choices: { hd-1: a, hd-2: a }`.

---

## Example 4 · Retarget: only the version changed

**Where:** `model-repo-a1-archived-1/building/versions/0003`.

Room 2 moved to `room2@2`, adding a simulated device and a second presence sensor. Its occupancy kept type, unit and meaning, so the correspondence breaks for a single reason:

```yaml
reasons:
  - expects room2@1, but room2 conforms to room2@2
```

The first option is the least invasive one, an automatic retarget: point the correspondence to the element in the new version, with no mapping. Adapt remains as option (b).

```yaml
- { id: a, kind: adapt, automatic: true,  description: retarget c-r2-occupancy to room2#occupancy.occupied }
- { id: b, kind: adapt, automatic: false, description: "adapt Building to consume room2#occupancy.occupied (EBoolean) ..." }
# 5-decision.yaml
choices: { hd-1: a }
```

The drift is real but trivial: only the expected type version differs (`typeVersion: room2@1`), and the planner resolves it without a mapping.

---

## Screenshots: scenario A1 on a device

The screenshots are in `docs/img/a1-on-device/` and illustrate the walkthrough in `docs/a1-on-device.md`, played against a working copy of the model repository (`model-repo-a1`) on real Tinkerforge hardware. In that run Room 1 moves from v3 to v4 and Building to v4. The version numbers therefore differ from those recorded in the current `model-repo-a1`, which was reset and played again.

Paths below are relative to a file in `Claude outputs/`.

### Before the change

**Step 0 · The starting point.** The model of Room 1 on three lanes: types (O1), instances (O0) and data. The element of Building that depends on it through `c-r1-occupancy` is shown dotted.

![room1 before the change](../docs/img/a1-on-device/00-start.png)

**Step 1 · The model is live.** Readings from the device appear on the model and, through the correspondence, on Building.

![live readings on the model](../docs/img/a1-on-device/01-live.png)

### The physical change (trigger)

**Step 2 · The motion detector goes away.** `motion_detected` gives no data.

![the motion detector treated as detached](../docs/img/a1-on-device/02-detached.png)

**Step 3 · What is attached now.** The NFC Bricklet is found on the brick and reported as a new source of data.

![the attached parts, with the NFC reader ticked](../docs/img/a1-on-device/03-attached.png)

### The process in Room 1

**Step 4 · Change set (step 1).** Trigger `runtime_observation`, origin Room 1, level data: `motion_detected` removed, `count` added.

![change set and classified drift](../docs/img/a1-on-device/04-change-set-drift.png)

**Step 5 · Classified drift (step 2) and the evolution proposal.** Two bottom-up vertical drifts and the broken horizontal drift on `c-r1-occupancy`. The proposed evolution room1 v3 → v4 is shown as a dashed proposal (Occupancy → PeopleCount, MotionDetectorV2 → Nfc).

![the proposal in the diagram](../docs/img/a1-on-device/05-proposal.jpg)

**Step 6 · Impact report (step 3) and adaptation plan (step 4).** Room 2 is not affected. The options (a) derive and (b) adapt are shown without a choice, because the correspondence belongs to Building. Interim behaviour: the reaction is suspended and the policy excludes the input.

![impact report and adaptation plan](../docs/img/a1-on-device/06-impact-plan.png)

### The modeler of Room 1

**Step 7 · The gate.** The proposal cannot be accepted yet: the condition of the reaction refers to `occupied`, which no longer exists.

![the gate holds the proposal](../docs/img/a1-on-device/07-gate.png)

The modeler rewrites the condition (`count > 0`). This is the semi-automatic part of the evolution.

![the reaction re-pointed by the modeler](../docs/img/a1-on-device/08-reaction.png)

**Step 8 · Diff and commit of room1 v4.** The Munidiff of the version, the acceptance, and the result. Building now carries the *drift* mark.

![the Munidiff of version 4](../docs/img/a1-on-device/09-changes.png)

![accepting the version](../docs/img/a1-on-device/10-accept.png)

![room1 at version 4](../docs/img/a1-on-device/11-room1-v4.png)

### The modeler of Building

**Step 9 · Building finds the drift.** Origin Room 1 at level O1, broken horizontal drift on `c-r1-occupancy`.

![building finds the drift](../docs/img/a1-on-device/12-building-drift.png)

The plan, now with a choice: (a) derive `occupied = count > 0`, (b) adapt, which needs the modeler.

![the adaptation plan of building](../docs/img/a1-on-device/13-building-plan.png)

The diff of option (a) touches one element, the correspondence. After acceptance Building is at v4 and the drift mark is gone.

![the Munidiff of building version 4](../docs/img/a1-on-device/14-building-changes.png)

![building at version 4](../docs/img/a1-on-device/15-building-v4.png)
