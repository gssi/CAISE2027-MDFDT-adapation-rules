# FMDDT semantic drift: replication package

Reference implementation of **model-first drift management in a federation of digital twins**, with the scenarios of the paper and what is needed to run them again. Every evolution is handled at the modeling layer: a modelling assistant identifies the change, classifies the drift, estimates its impact and proposes an adaptation plan to a modeler.

Everything here runs on a simulated runtime: no device is needed.

## What is in the package

| Path | Content |
|---|---|
| `src/` | The app: the engine (`src/engine`, pure), the server side (`src/server`) and the modeler. |
| `scenarios/building/` | The models of the scenarios: two participating DTs (`room1`, `room2`), one initiating DT (`building`), the shared concepts (`core`), the inputs of A1 and A2 and the variant `room2-hidden-count`. |
| `tests/` | The acceptance tests: one file per scenario, and the reviewed diffs in `tests/expected`. |
| `init/SPEC.md` | The specification; section 6 defines the scenarios. |
| `docs/README.md` | How `evolution.ts` and `adaptation.ts` work, and every scenario played in the modeler with a screenshot per step. |
| `docs/scenario-summary.xlsx` | For every scenario: change set, classified drift, impact report, adaptation plan, outcome. |

## Requirements

Node.js 20.9 or later, with npm. Nothing else: the model repository is a folder on disk.

## Run the scenarios as tests

```sh
npm ci
npm test
```

| Scenario | Test |
|---|---|
| A0 · baseline | `tests/a0-baseline.test.ts` |
| A1 · a participating DT evolves, the initiating DT follows | `tests/a1-sensor-replacement.test.ts` |
| A1 with a device in the model | `tests/a1-devices.test.ts` |
| A2 · the initiating DT evolves, and the variant `room2-hidden-count` | `tests/a2-count-requirement.test.ts` |
| Timeliness | `tests/timeliness.test.ts` |
| No value coercion across meanings | `tests/no-coercion.test.ts` |

The versions the scenarios commit are compared with `tests/expected/*.munidiff`.

## Play the scenarios in the modeler

```sh
FMDDT_REPO=/tmp/fmddt-repo npm run dev      # http://localhost:3000
```

`FMDDT_REPO` names the model repository (default `./model-repo`). On an empty folder the app offers **Start from building**, the A0 baseline, and **Start from building (room2-hidden-count)**, the variant. To play a scenario again, start from an empty folder.

- **A1**: `room1` → *Runtime* → *Report from a DT* → `building/a1/observations.yaml` → **Send to the modeling layer**. The app shows the proposed version 2 of `room1`: accept it. `building` now carries the mark *drift*: open it and accept the derivation `count > 0`.
- **A2**: `building` → **Apply building/a2**. The correspondence with Room 2 is missing: the plan is a change request.
- **A2, variant**: started from the variant, after A1 and A2, `room2` → *Process* → **See the version the assistant proposes**; accept it, then bind the correspondence in `building`.
- **Timeliness**: *Runtime*: Room 2 emits `occupied = true`, `count = 1` at t = 20; Room 1 emits `count = 3` at t = 100; set the current time to 110 and press **Check timeliness**.

[docs/README.md](docs/README.md) has every step, with what the app answers.

## Check the package

```sh
npm run lint && npm run typecheck && npm run build
```

## License

[MIT](LICENSE).
