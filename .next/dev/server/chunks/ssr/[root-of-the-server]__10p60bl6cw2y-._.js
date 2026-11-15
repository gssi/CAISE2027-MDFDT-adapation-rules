module.exports = [
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/node:fs [external] (node:fs, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs", () => require("node:fs"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/server/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "004984ea75aee3c2624b16e73654c431e605d4ae00",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getExamples"],
    "0091cdb289581606c9cd89b8898badab7e57cdd19e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getState"],
    "00bb35c320a4a5476efd556c7a160c4c857bd8b1ba",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["archiveLegacy"],
    "4088ba51c3b81d5be97231e7d436759a112df7ae0b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["discoverSensors"],
    "40a22edda2f2d8fd6cde2f10f9beb879fdb6474d72",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readDevices"],
    "6041aace9b98b890437485808c1a5c4da9eb2c0919",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["restoreVersion"],
    "60b601fda8966d1e43b4f0da1bc13b4daf780427ef",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initRepository"],
    "60e5436603b41702764da7bb06985ce73cabc4d21f",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getVersion"],
    "70a7bd85790da1911c051bb9adead5fc614db4e96b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decide"],
    "7877d470e09f02d5dad37d8d82688c1cf65525b048",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invoke"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => "[project]/src/server/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/.next-internal/server/app/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/server/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
}),
"[project]/src/connectors/catalogue.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * What the connectors can reach, as data: the settings of a device and, for
 * every kind of sensor, the parameters it senses. The modeler builds classes
 * from this, and a connector reads by it. Nothing here touches hardware, so the
 * browser can use it too.
 *
 * To support another kind of device, describe it here and register its driver
 * in `src/server/connectors/index.ts`.
 */ __turbopack_context__.s([
    "CONNECTORS",
    ()=>CONNECTORS,
    "connectorInfo",
    ()=>connectorInfo,
    "sensorKind",
    ()=>sensorKind
]);
const UID = {
    name: "uid",
    eType: "EString",
    description: "The UID printed on the Bricklet (also shown by Brick Viewer and by Discover)."
};
/**
 * Tinkerforge Bricks and Bricklets behind a Brick Daemon, e.g. on a Raspberry
 * Pi with a HAT Brick. `getter` is the function of the official bindings (with
 * `index` when it returns several values, `equals` when a Boolean is one of its
 * codes); `setter` is the function an operation calls, with the parameters of
 * the operation in order; `reader` and `special` name logic of the driver for
 * what a single call of the bindings cannot give;
 * `scale` turns the integer it returns into the unit given here. The scales
 * were checked against the JavaScript API documentation of each Bricklet
 * (tinkerforge.com/en/doc/Software/Bricklets) on 2026-11-11.
 */ const tinkerforge = {
    type: "tinkerforge",
    label: "Tinkerforge (Brick Daemon)",
    description: "Bricklets reached through the Brick Daemon of a host, for example a Raspberry Pi.",
    settings: [
        {
            name: "host",
            eType: "EString",
            fallback: "localhost",
            description: "Host name or address of the Brick Daemon."
        },
        {
            name: "port",
            eType: "EInt",
            fallback: 4223,
            description: "Port of the Brick Daemon."
        }
    ],
    sensors: [
        {
            kind: "motion_detector_v2",
            label: "Motion Detector Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletMotionDetectorV2",
                identifier: 292
            },
            parameters: [
                {
                    name: "motion_detected",
                    eType: "EBoolean",
                    meaning: "occupancy",
                    description: "Whether motion is being detected.",
                    driver: {
                        getter: "getMotionDetected",
                        equals: 1
                    }
                }
            ],
            operations: [
                {
                    name: "set_indicator",
                    description: "Set the brightness of the three blue LEDs of the Bricklet.",
                    driver: {
                        setter: "setIndicator"
                    },
                    parameters: [
                        {
                            name: "top_left",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "Brightness, 0 to 255."
                        },
                        {
                            name: "top_right",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "Brightness, 0 to 255."
                        },
                        {
                            name: "bottom",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "Brightness, 0 to 255."
                        }
                    ]
                }
            ]
        },
        {
            kind: "temperature_v2",
            label: "Temperature Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletTemperatureV2",
                identifier: 2113
            },
            parameters: [
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature.",
                    driver: {
                        getter: "getTemperature",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "humidity_v2",
            label: "Humidity Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletHumidityV2",
                identifier: 283
            },
            parameters: [
                {
                    name: "humidity",
                    eType: "EDouble",
                    unit: "percent",
                    meaning: "relative-humidity",
                    description: "Relative humidity.",
                    driver: {
                        getter: "getHumidity",
                        scale: 0.01
                    }
                },
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature.",
                    driver: {
                        getter: "getTemperature",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "ambient_light_v3",
            label: "Ambient Light Bricklet 3.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletAmbientLightV3",
                identifier: 2131
            },
            parameters: [
                {
                    name: "illuminance",
                    eType: "EDouble",
                    unit: "lux",
                    meaning: "illuminance",
                    description: "Illuminance.",
                    driver: {
                        getter: "getIlluminance",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "co2_v2",
            label: "CO2 Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletCO2V2",
                identifier: 2147
            },
            parameters: [
                {
                    name: "co2_concentration",
                    eType: "EInt",
                    unit: "ppm",
                    meaning: "co2-concentration",
                    description: "CO2 concentration.",
                    driver: {
                        getter: "getCO2Concentration"
                    }
                },
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature.",
                    driver: {
                        getter: "getTemperature",
                        scale: 0.01
                    }
                },
                {
                    name: "humidity",
                    eType: "EDouble",
                    unit: "percent",
                    meaning: "relative-humidity",
                    description: "Relative humidity.",
                    driver: {
                        getter: "getHumidity",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "air_quality",
            label: "Air Quality Bricklet",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletAirQuality",
                identifier: 297
            },
            parameters: [
                {
                    name: "iaq_index",
                    eType: "EInt",
                    meaning: "indoor-air-quality",
                    description: "Indoor air quality index (0 to 500); the first value the getter returns.",
                    driver: {
                        getter: "getIAQIndex",
                        index: 0
                    }
                },
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature.",
                    driver: {
                        getter: "getTemperature",
                        scale: 0.01
                    }
                },
                {
                    name: "humidity",
                    eType: "EDouble",
                    unit: "percent",
                    meaning: "relative-humidity",
                    description: "Relative humidity.",
                    driver: {
                        getter: "getHumidity",
                        scale: 0.01
                    }
                },
                {
                    name: "air_pressure",
                    eType: "EDouble",
                    unit: "hPa",
                    meaning: "air-pressure",
                    description: "Air pressure.",
                    driver: {
                        getter: "getAirPressure",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "barometer_v2",
            label: "Barometer Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletBarometerV2",
                identifier: 2117
            },
            parameters: [
                {
                    name: "air_pressure",
                    eType: "EDouble",
                    unit: "hPa",
                    meaning: "air-pressure",
                    description: "Air pressure.",
                    driver: {
                        getter: "getAirPressure",
                        scale: 0.001
                    }
                },
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature.",
                    driver: {
                        getter: "getTemperature",
                        scale: 0.01
                    }
                }
            ]
        },
        {
            kind: "distance_ir_v2",
            label: "Distance IR Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletDistanceIRV2",
                identifier: 2125
            },
            parameters: [
                {
                    name: "distance",
                    eType: "EInt",
                    unit: "mm",
                    meaning: "distance",
                    description: "Distance to the nearest object.",
                    driver: {
                        getter: "getDistance"
                    }
                }
            ]
        },
        {
            kind: "sound_pressure_level",
            label: "Sound Pressure Level Bricklet",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletSoundPressureLevel",
                identifier: 290
            },
            parameters: [
                {
                    name: "decibel",
                    eType: "EDouble",
                    unit: "dB",
                    meaning: "sound-pressure-level",
                    description: "Sound pressure level.",
                    driver: {
                        getter: "getDecibel",
                        scale: 0.1
                    }
                }
            ]
        },
        {
            kind: "industrial_dual_relay",
            label: "Industrial Dual Relay Bricklet",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletIndustrialDualRelay",
                identifier: 284
            },
            parameters: [
                {
                    name: "channel0",
                    eType: "EBoolean",
                    meaning: "relay-state",
                    description: "Whether relay 0 is closed.",
                    driver: {
                        getter: "getValue",
                        index: 0
                    }
                },
                {
                    name: "channel1",
                    eType: "EBoolean",
                    meaning: "relay-state",
                    description: "Whether relay 1 is closed.",
                    driver: {
                        getter: "getValue",
                        index: 1
                    }
                }
            ],
            operations: [
                {
                    name: "set_value",
                    description: "Switch both relays at once.",
                    driver: {
                        setter: "setValue"
                    },
                    parameters: [
                        {
                            name: "channel0",
                            eType: "EBoolean",
                            fallback: false,
                            description: "Close relay 0."
                        },
                        {
                            name: "channel1",
                            eType: "EBoolean",
                            fallback: false,
                            description: "Close relay 1."
                        }
                    ]
                },
                {
                    name: "set_channel",
                    description: "Switch one relay and leave the other as it is.",
                    driver: {
                        setter: "setSelectedValue"
                    },
                    parameters: [
                        {
                            name: "channel",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 1,
                            description: "Which relay: 0 or 1."
                        },
                        {
                            name: "value",
                            eType: "EBoolean",
                            fallback: false,
                            description: "Close it."
                        }
                    ]
                }
            ]
        },
        {
            kind: "piezo_speaker_v2",
            label: "Piezo Speaker Bricklet 2.0",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletPiezoSpeakerV2",
                identifier: 2145
            },
            parameters: [],
            operations: [
                {
                    name: "beep",
                    description: "Beep at a frequency and volume for a duration; a duration of 0 stops the beep.",
                    driver: {
                        setter: "setBeep"
                    },
                    parameters: [
                        {
                            name: "frequency",
                            eType: "EInt",
                            unit: "Hz",
                            fallback: 1000,
                            min: 50,
                            max: 15000,
                            description: "50 to 15000 Hz."
                        },
                        {
                            name: "volume",
                            eType: "EInt",
                            fallback: 1,
                            min: 0,
                            max: 10,
                            description: "0 to 10."
                        },
                        {
                            name: "duration",
                            eType: "EInt",
                            unit: "ms",
                            fallback: 200,
                            min: 0,
                            max: 60000,
                            description: "Milliseconds."
                        }
                    ]
                }
            ]
        },
        {
            kind: "nfc",
            label: "NFC Bricklet (people counter by taps)",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletNFC",
                identifier: 286
            },
            parameters: [
                {
                    name: "count",
                    eType: "EInt",
                    unit: "person",
                    meaning: "people-count",
                    observation: "PeopleCount",
                    description: "People inside, estimated from taps: a tag tapped is in, tapped again is out. Counted since the app started.",
                    driver: {
                        reader: "nfcTapCount"
                    }
                }
            ],
            operations: [
                {
                    name: "reset",
                    description: "Start counting again from nobody inside.",
                    driver: {
                        special: "nfcReset"
                    },
                    parameters: []
                }
            ]
        },
        {
            kind: "rgb_led_button",
            label: "RGB LED Button Bricklet",
            settings: [
                UID
            ],
            driver: {
                className: "BrickletRGBLEDButton",
                identifier: 282
            },
            parameters: [
                {
                    name: "pressed",
                    eType: "EBoolean",
                    meaning: "button-state",
                    description: "Whether the button is being pressed.",
                    driver: {
                        getter: "getButtonState",
                        equals: 0
                    }
                }
            ],
            operations: [
                {
                    name: "set_color",
                    description: "Set the colour of the LED in the button.",
                    driver: {
                        setter: "setColor"
                    },
                    parameters: [
                        {
                            name: "red",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "0 to 255."
                        },
                        {
                            name: "green",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "0 to 255."
                        },
                        {
                            name: "blue",
                            eType: "EInt",
                            fallback: 0,
                            min: 0,
                            max: 255,
                            description: "0 to 255."
                        }
                    ]
                }
            ]
        }
    ]
};
const VALUE = {
    name: "value",
    eType: "EString",
    description: "The value to report; empty for a default one. Write `fail` to behave like a sensor that is gone."
};
/** No hardware: sensors that report what they are told. For trying the loop and for tests. */ /** A simulated part has no hardware identifier: its kind tells it from the other parts of the device. */ const PART = {
    name: "uid",
    eType: "EString",
    description: "What tells this part from the others of its device."
};
const simulated = {
    type: "simulated",
    label: "Simulated device",
    description: "Sensors that report a configured value, to try the loop without hardware.",
    settings: [],
    sensors: [
        {
            kind: "presence",
            label: "Presence sensor",
            settings: [
                PART,
                VALUE
            ],
            parameters: [
                {
                    name: "detected",
                    eType: "EBoolean",
                    meaning: "occupancy",
                    description: "Whether someone is there."
                }
            ]
        },
        {
            kind: "people_counter",
            label: "People counter",
            settings: [
                PART,
                VALUE
            ],
            parameters: [
                {
                    name: "count",
                    eType: "EInt",
                    unit: "person",
                    meaning: "people-count",
                    description: "How many people are there."
                }
            ]
        },
        {
            kind: "thermometer",
            label: "Thermometer",
            settings: [
                PART,
                VALUE
            ],
            parameters: [
                {
                    name: "temperature",
                    eType: "EDouble",
                    unit: "celsius",
                    meaning: "temperature",
                    description: "Temperature."
                }
            ]
        },
        {
            kind: "switch",
            label: "Switch",
            settings: [
                PART
            ],
            parameters: [
                {
                    name: "on",
                    eType: "EBoolean",
                    meaning: "switch-state",
                    description: "Whether it is on."
                }
            ],
            operations: [
                {
                    name: "set",
                    description: "Turn it on or off.",
                    parameters: [
                        {
                            name: "on",
                            eType: "EBoolean",
                            fallback: true,
                            description: "On."
                        }
                    ]
                }
            ]
        },
        {
            kind: "buzzer",
            label: "Buzzer",
            settings: [
                PART
            ],
            parameters: [],
            operations: [
                {
                    name: "beep",
                    description: "Beep for a duration.",
                    parameters: [
                        {
                            name: "duration",
                            eType: "EInt",
                            unit: "ms",
                            fallback: 200,
                            min: 0,
                            max: 10000,
                            description: "Milliseconds."
                        }
                    ]
                }
            ]
        }
    ]
};
const CONNECTORS = [
    tinkerforge,
    simulated
];
function connectorInfo(type) {
    return CONNECTORS.find((connector)=>connector.type === type) ?? null;
}
function sensorKind(type, kind) {
    return connectorInfo(type)?.sensors.find((sensor)=>sensor.kind === kind) ?? null;
}
}),
"[project]/src/engine/assistant/adaptation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADAPT",
    ()=>ADAPT,
    "CHANGE_REQUEST",
    ()=>CHANGE_REQUEST,
    "DERIVE",
    ()=>DERIVE,
    "PlanError",
    ()=>PlanError,
    "RuleBasedPlanner",
    ()=>RuleBasedPlanner,
    "applyOption",
    ()=>applyOption,
    "incomingRequests",
    ()=>incomingRequests,
    "planFromDict",
    ()=>planFromDict,
    "planToDict",
    ()=>planToDict,
    "providingKey",
    ()=>providingKey
]);
/**
 * Step 4: generate and rank the resolution options.
 *
 * Resolution options: **adapt** the dependent element to the new version,
 * **derive** the expected value from the available one (a mapping in the
 * correspondence), **bind** or **migrate** the DTs left behind, or issue a
 * **change request** when nothing in the model can resolve the drift.
 *
 * The planner sits behind `AdaptationPlanner`: the rule-based one below is
 * deterministic, a different one can generate and explain options another way.
 * An option is data (a kind and its parameters); `applyOption` turns it into
 * model changes, so a plan can be stored, inspected and applied later.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modelset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/checks.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/drift.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/evolution.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$impact$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/impact.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
;
;
const DERIVE = "derive";
const ADAPT = "adapt";
const CHANGE_REQUEST = "change_request";
class PlanError extends Error {
}
function planToDict(plan) {
    return {
        artifact: "adaptation-plan",
        trigger: plan.trigger,
        base: plan.base,
        baseChanges: plan.baseChanges.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["changeToDict"]),
        resolutions: plan.resolutions.map((r)=>({
                drift: r.drift,
                owner: r.owner,
                correspondence: r.correspondence,
                element: r.element,
                options: r.options.map((o)=>({
                        id: o.id,
                        kind: o.kind,
                        rank: o.rank,
                        automatic: o.automatic,
                        description: o.description,
                        params: o.params,
                        changes: o.changes.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["changeToDict"])
                    }))
            })),
        interim: plan.interim
    };
}
function planFromDict(data) {
    return {
        trigger: data.trigger,
        base: data.base ?? null,
        baseChanges: (data.baseChanges ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["changeFromDict"]),
        resolutions: (data.resolutions ?? []).map((r)=>({
                drift: r.drift,
                owner: r.owner ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(r.element),
                element: r.element,
                correspondence: r.correspondence ?? null,
                options: (r.options ?? []).map((o)=>({
                        id: o.id,
                        kind: o.kind,
                        rank: o.rank,
                        description: o.description,
                        automatic: o.automatic ?? true,
                        params: o.params ?? {},
                        changes: (o.changes ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["changeFromDict"])
                    }))
            })),
        interim: data.interim ?? []
    };
}
function option(kind, description, params, automatic = true) {
    return {
        id: "",
        kind,
        rank: 0,
        description,
        automatic,
        params,
        changes: []
    };
}
// -- applying an option ------------------------------------------------------
function expectation(fed, element) {
    const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, element);
    if (!resolved?.attribute) throw new PlanError(`unknown element ${element}`);
    const expects = {
        typeVersion: resolved.model.typedBy,
        eType: resolved.attribute.eType
    };
    if (resolved.attribute.unit !== null) expects.unit = resolved.attribute.unit;
    if (resolved.attribute.meaning !== null) expects.meaning = resolved.attribute.meaning;
    return expects;
}
/** The element that replaces a participating element after its DT evolved. */ function successorElement(head, fed, participating) {
    const before = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(head, participating);
    if (!before?.eclass) return null;
    const oldType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(head, before.model);
    const next = oldType ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["successor"])(fed, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(oldType), before.eclass.name)) : null;
    const instance = fed.models[before.model.name];
    if (next === null || !instance) return null;
    const nextRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(next);
    if (nextRef.model !== instance.typedBy) return null;
    const objects = Object.values(instance.objects).filter((o)=>o.instanceOf === nextRef.path[0]);
    const attributes = fed.models[nextRef.model].eClasses[nextRef.path[0]].eAttributes;
    const names = Object.keys(attributes);
    if (objects.length !== 1 || !names.length) return null;
    const wanted = before.ref.path[1];
    const attribute = wanted in attributes ? wanted : names.length === 1 ? names[0] : null;
    return attribute ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, objects[0].name, attribute) : null;
}
/** The admitted mapping from `provided` to `initiating`, if any; an empty
 * string when the two elements agree without a mapping. */ function derivation(fed, provided, initiating) {
    const source = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, provided)?.attribute;
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, initiating)?.attribute;
    if (!source || !target) return null;
    if (source.meaning === target.meaning) {
        return source.eType === target.eType && source.unit === target.unit ? "" : null;
    }
    const rule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findRule"])(fed.derivations, source.meaning, target.meaning);
    if (rule === null) return null;
    try {
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["inferType"])(rule.expression, "value", source.eType) !== target.eType) return null;
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingError"]) return null;
        throw error;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renameSource"])(rule.expression, "value", source.name);
}
function retarget(fed, correspondence, participating, mapping) {
    const link = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findLink"])(fed, correspondence);
    if (link === null) throw new PlanError(`unknown correspondence ${correspondence}`);
    link.ends.participating = participating;
    const expects = {
        ...link.props.expects ?? {}
    };
    for (const stale of [
        "typeVersion",
        "eType",
        "unit",
        "meaning"
    ])delete expects[stale];
    link.props.expects = {
        ...expectation(fed, participating),
        ...expects
    };
    if (mapping) link.props.mapping = mapping;
    else delete link.props.mapping;
    for (const key of [
        "status",
        "changeRequest",
        "interim"
    ])delete link.props[key];
}
function applyOption(candidate, chosen) {
    if (!chosen.automatic) {
        throw new PlanError(`option ${chosen.id} (${chosen.kind}) needs the modeler: decide with 'edit' and ` + "provide the edited model");
    }
    const fed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(candidate);
    const params = chosen.params;
    if (chosen.kind === DERIVE || chosen.kind === ADAPT) {
        retarget(fed, params.correspondence, params.participating, params.mapping ?? "");
    } else if (chosen.kind === CHANGE_REQUEST) {
        let link = params.correspondence ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findLink"])(fed, params.correspondence) : null;
        if (link === null) {
            const name = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["weavingName"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(params.element));
            const wm = fed.weaving[name] ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodel"])(name);
            const owner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(params.element);
            link = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])(`cr-${[
                owner.model,
                ...owner.path
            ].join("-")}`, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"], {
                initiating: params.element
            });
            wm.links.push(link);
        }
        link.props.status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"];
        link.props.changeRequest = params.request;
        if (params.interim?.length) link.props.interim = params.interim.map((i)=>({
                ...i
            }));
    } else {
        throw new PlanError(`unknown option kind ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(chosen.kind)}`);
    }
    return fed;
}
function providingKey(fed, model, need) {
    for (const [key, capability] of Object.entries(fed.capabilities[model] ?? {})){
        const meaning = capability.meaning ?? null;
        if ((capability.eType ?? null) !== need.eType || (capability.unit ?? null) !== need.unit) continue;
        if (meaning === null || need.meaning === null || meaning === need.meaning) return key;
    }
    return null;
}
function incomingRequests(fed, model) {
    const out = [];
    for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["links"])(fed, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"])){
        const participating = link.ends.participating;
        if (link.props.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"] || !participating || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(participating) !== model) continue;
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(participating).path.length) continue; // a request about an element that exists is not ours to model
        const need = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, link.ends.initiating)?.attribute ?? null;
        out.push({
            correspondence: link.id,
            from: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(link.ends.initiating),
            element: link.ends.initiating,
            request: link.props.changeRequest ?? "",
            proposal: need ? proposeForRequest(fed, model, need) : null
        });
    }
    return out;
}
function proposeForRequest(fed, model, need) {
    const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanceOfModel"])(fed, model);
    const type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance);
    const version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["versionOf"])(fed, model);
    if (!instance || !type || version === null || providingKey(fed, model, need) === null) return null;
    const fits = (a)=>a.eType === need.eType && a.unit === need.unit && (a.meaning === null || need.meaning === null || a.meaning === need.meaning);
    if (Object.values(type.eClasses).some((c)=>Object.values(c.eAttributes).some(fits))) return null;
    // A class of another DT that models this data, with the classes it requires.
    let template = null;
    for (const other of Object.values(fed.models)){
        if (other.level !== "O1" || other.name === model) continue;
        const peer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanceOfModel"])(fed, other.name);
        if (peer?.typedBy !== (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(other)) continue; // only current versions
        for (const eclass of Object.values(other.eClasses)){
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, other, eclass.name).requiresSource) continue;
            if (Object.values(eclass.eAttributes).some(fits)) template ??= [
                other,
                eclass
            ];
        }
    }
    if (!template) return null;
    const candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(fed);
    const target = candidate.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(type)];
    const copy = (source, name)=>{
        if (name in target.eClasses) return;
        const eclass = source.eClasses[name];
        target.eClasses[name] = structuredClone(eclass);
        for (const reference of Object.values(eclass.eReferences))copy(source, reference.eType);
    };
    copy(template[0], template[1].name);
    const next = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asNextVersion"])(candidate, fed, model, version + 1);
    try {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["migrateInstance"])(next, model, `${model}@${version + 1}`);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EvolutionError"]) return null;
        throw error;
    }
    return next;
}
// -- rule-based planner ------------------------------------------------------
const settled = (status)=>status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HOLDS"] || status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"];
class RuleBasedPlanner {
    plan(context) {
        const plan = {
            trigger: context.changeset.trigger,
            base: context.changeset.base,
            baseChanges: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["diff"])(context.head, context.candidate),
            resolutions: [],
            interim: this.interim(context)
        };
        for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linksOfType"])(context.drift, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HORIZONTAL"])){
            const resolution = {
                drift: link.id,
                owner: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(link.ends.initiating),
                element: link.ends.initiating,
                correspondence: link.props.correspondence ?? null,
                options: []
            };
            const proposals = link.props.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MISSING"] ? this.provide(context, link) : this.deriveBroken(context, link);
            const kept = proposals.filter((p)=>this.verify(context, resolution, p));
            if (!kept.some((p)=>p.automatic)) {
                const request = this.changeRequest(context, link);
                if (this.verify(context, resolution, request)) kept.push(request);
            }
            this.rank(kept);
            resolution.options = kept;
            plan.resolutions.push(resolution);
        }
        // A change request that is waiting can be closed as soon as the
        // participating DT models what was asked for.
        for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["links"])(context.candidate, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"])){
            if (link.props.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"] || !link.ends.participating) continue;
            const resolution = {
                drift: `pending:${link.id}`,
                owner: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(link.ends.initiating),
                element: link.ends.initiating,
                correspondence: link.id,
                options: []
            };
            const asked = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])(link.id, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HORIZONTAL"], {
                ...link.ends
            }, {
                correspondence: link.id,
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MISSING"]
            });
            asked.ends.participating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(link.ends.participating);
            const kept = this.provide(context, asked).filter((p)=>this.verify(context, resolution, p));
            if (!kept.length) continue;
            this.rank(kept);
            resolution.options = kept;
            plan.resolutions.push(resolution);
        }
        return plan;
    }
    rank(options) {
        options.forEach((o, index)=>{
            o.id = "abcdefghijklmnopqrstuvwxyz"[index];
            o.rank = index + 1;
        });
    }
    // Every proposal is checked by applying it: an option enters the plan only
    // if its correspondence then holds (or is pending) and no other one breaks.
    verify(context, resolution, proposal) {
        if (!proposal.automatic) return true;
        let result;
        try {
            result = applyOption(context.candidate, proposal);
        } catch (error) {
            if (error instanceof PlanError) return false;
            throw error;
        }
        const before = new Map((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkCorrespondences"])(context.candidate).map((s)=>[
                s.correspondence,
                s.status
            ]));
        for (const status of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkCorrespondences"])(result)){
            const mine = resolution.correspondence ? status.correspondence === resolution.correspondence : status.initiating === resolution.element;
            if (settled(status.status)) continue;
            if (mine || settled(before.get(status.correspondence))) return false;
        }
        proposal.changes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["diff"])(context.candidate, result);
        return true;
    }
    interim(context) {
        const interim = [];
        for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linksOfType"])(context.impact, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$impact$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IMPACT"])){
            if (link.props.category !== "dependency") continue;
            const entry = {
                element: link.ends.target,
                behaviour: link.props.interim,
                because: link.ends.source,
                until: "the plan is committed"
            };
            if (!interim.some((e)=>JSON.stringify(e) === JSON.stringify(entry))) interim.push(entry);
        }
        return interim;
    }
    deriveBroken(context, link) {
        const participating = link.ends.participating;
        const initiating = link.ends.initiating;
        const correspondence = link.props.correspondence ?? null;
        if (!participating || correspondence === null) return [];
        const next = successorElement(context.head, context.candidate, participating);
        if (next === null) return [];
        const options = [];
        const provided = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(context.candidate, next)?.attribute;
        const mapping = derivation(context.candidate, next, initiating);
        const params = {
            correspondence,
            participating: next
        };
        if (mapping === "") {
            options.push(option(ADAPT, `retarget ${correspondence} to ${next}`, params));
        } else if (mapping) {
            const wanted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(initiating).path.at(-1);
            options.push(option(DERIVE, `derive ${wanted} = ${mapping} from ${next}, as a mapping in ${correspondence}`, {
                ...params,
                mapping
            }));
        }
        const owner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(initiating));
        const revise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dependents"])(context.candidate, context.candidate.models[owner.model], owner.path[0]).map(([obj])=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(owner.model, obj.name));
        const described = [
            provided?.eType,
            provided?.unit
        ].filter(Boolean).join(", ");
        options.push(option(ADAPT, `adapt ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(context.candidate, owner.model)} to consume ${next} ` + `(${described}) in place of ${initiating}: a new type version, and ` + `${revise.join(", ") || "its dependents"} revised by the modeler`, {
            ...params,
            revise
        }, false));
        return options;
    }
    /** Elements the participating DT already models that can provide what is missing. */ provide(context, link) {
        const fed = context.candidate;
        const participating = link.ends.participating;
        const correspondence = link.props.correspondence ?? null;
        if (!participating || correspondence === null) return [];
        const instance = fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(participating).model];
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance);
        if (!instance || o1 === null) return [];
        const options = [];
        for (const obj of Object.values(instance.objects)){
            for (const attribute of Object.keys(o1.eClasses[obj.instanceOf]?.eAttributes ?? {})){
                const provided = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, obj.name, attribute);
                const mapping = derivation(fed, provided, link.ends.initiating);
                if (mapping === null) continue;
                options.push(option(mapping ? DERIVE : ADAPT, `provide ${link.ends.initiating} ${mapping ? `= ${mapping} ` : ""}from ${provided}`, {
                    correspondence,
                    participating: provided,
                    mapping
                }));
            }
        }
        return options;
    }
    changeRequest(context, link) {
        const initiating = link.ends.initiating;
        const participating = link.ends.participating;
        const need = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(context.candidate, initiating)?.attribute;
        const described = (need ? [
            need.meaning,
            need.eType,
            need.unit
        ] : []).filter(Boolean).join(", ");
        let request;
        if (link.props.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MISSING"]) {
            const where = participating ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelOf"])(participating) : "a participating DT";
            const key = need && participating ? providingKey(context.candidate, where, need) : null;
            request = key ? `model the observation key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)} that ${where} already provides, for ${initiating} (${described})` : `new data source in ${where} providing ${initiating} (${described})`;
        } else {
            request = `restore ${participating} as expected by ${initiating}: ` + (link.props.reasons ?? []).join("; ");
        }
        const owner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(initiating);
        const interim = this.interim(context).filter((i)=>this.reaches(context, owner, i.element)).map((i)=>({
                element: i.element,
                behaviour: i.behaviour
            }));
        return option(CHANGE_REQUEST, `change request: ${request}; affected elements keep their interim behaviour in the meantime`, {
            correspondence: link.props.correspondence ?? null,
            element: initiating,
            request,
            interim
        });
    }
    reaches(context, start, target) {
        const edges = new Map();
        for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linksOfType"])(context.impact, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$impact$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["IMPACT"])){
            edges.set(link.ends.source, [
                ...edges.get(link.ends.source) ?? [],
                link.ends.target
            ]);
        }
        const queue = [
            start
        ];
        const seen = new Set([
            start
        ]);
        while(queue.length){
            for (const following of edges.get(queue.shift()) ?? []){
                if (following === target) return true;
                if (!seen.has(following)) {
                    seen.add(following);
                    queue.push(following);
                }
            }
        }
        return false;
    }
}
}),
"[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EDIT",
    ()=>EDIT,
    "RUNTIME",
    ()=>RUNTIME,
    "TIMELINESS",
    ()=>TIMELINESS,
    "boundKeys",
    ()=>boundKeys,
    "changeFromDict",
    ()=>changeFromDict,
    "changeSetFromDict",
    ()=>changeSetFromDict,
    "changeSetToDict",
    ()=>changeSetToDict,
    "changeToDict",
    ()=>changeToDict,
    "diff",
    ()=>diff,
    "fromEdit",
    ()=>fromEdit,
    "fromObservations",
    ()=>fromObservations,
    "fromTimeliness",
    ()=>fromTimeliness
]);
/**
 * Step 1: identify the change and its origin (DT, level).
 *
 * A change is either observed at runtime (the data a DT provides no longer
 * matches the committed model) or made by the modeler (a model edit). Both are
 * compared with the last committed version, at every level.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const RUNTIME = "runtime_observation";
const EDIT = "model_edit";
const TIMELINESS = "timeliness_violation";
const CONTAINERS = [
    "eClasses",
    "objects",
    "eAttributes",
    "eReferences"
];
const present = (value)=>value !== null && value !== undefined;
function changeToDict(change) {
    const out = {
        kind: change.kind,
        level: change.level,
        element: change.element
    };
    if (present(change.before)) out.before = change.before;
    if (present(change.after)) out.after = change.after;
    return out;
}
function changeFromDict(data) {
    const out = {
        kind: data.kind,
        level: data.level,
        element: data.element
    };
    if (present(data.before)) out.before = data.before;
    if (present(data.after)) out.after = data.after;
    return out;
}
function changeSetToDict(set) {
    return {
        artifact: "change-set",
        trigger: set.trigger,
        base: set.base,
        origin: {
            dt: set.originDT,
            model: set.origin,
            level: set.originLevel
        },
        changes: set.changes.map(changeToDict)
    };
}
function changeSetFromDict(data) {
    const origin = data.origin ?? {};
    return {
        trigger: data.trigger,
        origin: origin.model ?? null,
        originDT: origin.dt ?? null,
        originLevel: origin.level ?? null,
        base: data.base ?? null,
        changes: (data.changes ?? []).map(changeFromDict)
    };
}
// -- generic diff of two versions of the modeling layer ----------------------
const isDict = (value)=>typeof value === "object" && value !== null && !Array.isArray(value);
const same = (a, b)=>JSON.stringify(a) === JSON.stringify(b);
function union(a, b) {
    return [
        ...Object.keys(a),
        ...Object.keys(b).filter((key)=>!(key in a))
    ];
}
function walk(prefix, level, before, after, out) {
    if (isDict(before) && isDict(after)) {
        for (const key of union(before, after)){
            if (CONTAINERS.includes(key)) {
                walk(prefix, level, before[key] ?? {}, after[key] ?? {}, out);
                continue;
            }
            const element = `${prefix}${prefix.endsWith("#") ? "" : "."}${key}`;
            if (!(key in after)) out.push({
                kind: "removed",
                level,
                element,
                before: before[key]
            });
            else if (!(key in before)) out.push({
                kind: "added",
                level,
                element,
                after: after[key]
            });
            else walk(element, level, before[key], after[key], out);
        }
    } else if (!same(before, after)) {
        out.push({
            kind: "modified",
            level,
            element: prefix,
            before,
            after
        });
    }
}
function weavingTree(fed, name) {
    const tree = {};
    for (const link of fed.weaving[name]?.links ?? []){
        const body = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linkToDict"])(link);
        delete body.id;
        tree[link.id] = body;
    }
    return tree;
}
function diff(before, after) {
    const out = [];
    for (const key of union(before.models, after.models)){
        const old = before.models[key];
        const now = after.models[key];
        const level = (now ?? old).level;
        if (!now) out.push({
            kind: "removed",
            level,
            element: key,
            before: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(old)
        });
        else if (!old) out.push({
            kind: "added",
            level,
            element: key,
            after: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(now)
        });
        else walk(`${key}#`, level, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(old), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(now), out);
    }
    for (const name of union(before.weaving, after.weaving)){
        walk(`${name}#`, "weaving", weavingTree(before, name), weavingTree(after, name), out);
    }
    for (const name of union(before.capabilities, after.capabilities)){
        const old = before.capabilities[name] ?? {};
        const now = after.capabilities[name] ?? {};
        for (const key of union(old, now)){
            const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dataRef"])(name, key);
            if (!(key in now)) out.push({
                kind: "removed",
                level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                element,
                before: old[key]
            });
            else if (!(key in old)) out.push({
                kind: "added",
                level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                element,
                after: now[key]
            });
            else if (!same(old[key], now[key])) {
                out.push({
                    kind: "modified",
                    level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                    element,
                    before: old[key],
                    after: now[key]
                });
            }
        }
    }
    const rules = (fed)=>Object.fromEntries(fed.derivations.map((r)=>[
                `${r.source}->${r.target}`,
                r.expression
            ]));
    walk("derivations#", "catalogue", rules(before), rules(after), out);
    return out;
}
function boundKeys(fed, instanceName) {
    const out = {};
    const instance = fed.models[instanceName];
    for (const obj of Object.values(instance?.objects ?? {})){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(fed, instance, obj)) continue;
        for (const [attribute, key] of Object.entries(obj.bindings))out[key] = [
            obj.name,
            attribute
        ];
    }
    return out;
}
function fromObservations(head, batch, base = null) {
    const source = batch.source;
    const instance = head.models[source];
    const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(head, instance);
    const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["availableKeys"])(head, source);
    const reported = batch.capabilities;
    const changes = new Map();
    if (reported) {
        for (const key of union(known, reported)){
            const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dataRef"])(source, key);
            if (!(key in reported)) {
                changes.set(element, {
                    kind: "removed",
                    level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                    element,
                    before: known[key]
                });
            } else if (!(key in known)) {
                changes.set(element, {
                    kind: "added",
                    level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                    element,
                    after: reported[key]
                });
            } else if (!same(known[key], reported[key])) {
                changes.set(element, {
                    kind: "modified",
                    level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                    element,
                    before: known[key],
                    after: reported[key]
                });
            }
        }
    }
    const current = reported ?? known;
    const bound = boundKeys(head, source);
    for (const observation of batch.observations ?? []){
        const { key, value } = observation;
        const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dataRef"])(source, key);
        if (changes.has(element)) continue;
        if (!(key in current)) {
            changes.set(element, {
                kind: "added",
                level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                element,
                after: {
                    eType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etypeOf"])(value)
                }
            });
        } else if (key in bound && o1 !== null) {
            const [objName, attribute] = bound[key];
            const expected = o1.eClasses[instance.objects[objName].instanceOf].eAttributes[attribute];
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(value, expected.eType)) {
                changes.set(element, {
                    kind: "modified",
                    level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                    element,
                    before: {
                        eType: expected.eType
                    },
                    after: {
                        eType: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etypeOf"])(value)
                    }
                });
            }
        }
    }
    return {
        trigger: RUNTIME,
        origin: source,
        originDT: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(head, source),
        originLevel: changes.size ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"] : null,
        base,
        changes: [
            ...changes.values()
        ]
    };
}
function fromEdit(head, working, base = null) {
    const changes = diff(head, working);
    const set = {
        trigger: EDIT,
        origin: null,
        originDT: null,
        originLevel: null,
        base,
        changes
    };
    for (const level of __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LEVELS"]){
        const atLevel = changes.filter((c)=>c.level === level);
        if (atLevel.length) {
            const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(atLevel[0].element).model;
            set.origin = key;
            set.originLevel = level;
            set.originDT = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(working, key);
            return set;
        }
    }
    if (changes.length) set.originLevel = changes[0].level;
    return set;
}
function fromTimeliness(head, violations, base = null) {
    const origin = violations.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(violations[0].source).model : null;
    return {
        trigger: TIMELINESS,
        origin,
        originDT: origin ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(head, origin) : null,
        originLevel: violations.length ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"] : null,
        base,
        changes: violations.map((v)=>({
                kind: "modified",
                level: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"],
                element: v.source,
                before: v.expected,
                after: v
            }))
    };
}
}),
"[project]/src/engine/assistant/drift.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BOTTOM_UP",
    ()=>BOTTOM_UP,
    "HORIZONTAL",
    ()=>HORIZONTAL,
    "TOP_DOWN",
    ()=>TOP_DOWN,
    "VERTICAL",
    ()=>VERTICAL,
    "classify",
    ()=>classify,
    "hasDrift",
    ()=>hasDrift
]);
/**
 * Step 2: detect and classify the drift.
 *
 * Vertical drift is an inconsistency across levels of the same DT: bottom-up
 * when it originates in data, top-down when it originates in a type or concept.
 * Horizontal drift is a correspondence between DTs that no longer holds:
 * broken, missing or ambiguous.
 *
 * The classified drift is a weaving model: every drift is a link between the
 * elements that are no longer consistent.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/conformance.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/checks.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/evolution.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const VERTICAL = "VerticalDrift";
const HORIZONTAL = "HorizontalDrift";
const BOTTOM_UP = "bottom-up";
const TOP_DOWN = "top-down";
/** Data of a DT that no longer conforms to its type. */ function bottomUp(head, changeset, evolved) {
    const source = changeset.origin;
    const instance = head.models[source];
    const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(head, instance);
    if (!instance || o1 === null) return [];
    const bound = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boundKeys"])(head, source);
    const dt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(head, source);
    const out = [];
    for (const change of changeset.changes){
        if (change.level !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"]) continue;
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(change.element).path[0];
        let upper;
        let reason;
        if (key in bound && (change.kind === "removed" || change.kind === "modified")) {
            const [objName, attribute] = bound[key];
            upper = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1), instance.objects[objName].instanceOf, attribute);
            const what = change.kind === "removed" ? "is no longer provided" : "changed its type";
            reason = `the observation key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)} bound to ${upper} ${what}`;
        } else if (evolved && change.kind === "added") {
            upper = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1);
            const reported = change.after ?? {};
            const described = [
                reported.eType,
                reported.unit
            ].filter(Boolean).join(", ");
            reason = `no element of ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1)} accounts for the new observation key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)}` + (described ? ` (${described})` : "");
        } else {
            continue; // a capability the model does not use is not a drift
        }
        out.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", VERTICAL, {
            upper,
            lower: change.element
        }, {
            origin: BOTTOM_UP,
            dt,
            reasons: [
                reason
            ]
        }));
    }
    return out;
}
/**
 * Instances and data of a DT that do not follow its evolved type yet: the
 * instance still conforms to an earlier version, holds something the type no
 * longer admits, or lacks something the type requires.
 */ function topDown(candidate, changeset, unprovided) {
    const origin = candidate.models[changeset.origin ?? ""];
    const conformance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkConformance"])(candidate);
    const out = [];
    for (const instance of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(candidate)){
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(candidate, instance);
        if (o1 === null || origin && origin.level === "O1" && o1.name !== origin.name) continue;
        const dt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(candidate, instance.name);
        const latest = Math.max(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["versions"])(candidate, o1.name));
        if (o1.version < latest) {
            const newer = `${o1.name}@${latest}`;
            out.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", VERTICAL, {
                upper: newer,
                lower: instance.name
            }, {
                origin: TOP_DOWN,
                dt,
                reasons: [
                    `${instance.name} still conforms to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1)}, not to ${newer}`
                ]
            }));
        }
        // what the instance holds, checked against the type as it is now
        for (const issue of conformance){
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(issue.element);
            if (!issue.check.startsWith("O0->") || parsed.model !== instance.name || parsed.data) continue;
            const obj = instance.objects[parsed.path[0]];
            const upper = obj ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1), obj.instanceOf, ...parsed.path.slice(1)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1);
            out.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", VERTICAL, {
                upper,
                lower: issue.element
            }, {
                origin: TOP_DOWN,
                dt,
                reasons: [
                    issue.message
                ]
            }));
        }
        for (const element of unprovided){
            const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(element);
            if (parsed.model !== instance.name) continue;
            const obj = instance.objects[parsed.path[0]];
            if (!obj) continue;
            const upper = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1), obj.instanceOf, parsed.path[1]);
            out.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", VERTICAL, {
                upper,
                lower: element
            }, {
                origin: TOP_DOWN,
                dt,
                reasons: [
                    `${upper} is required by the type, but no data provides it`
                ]
            }));
        }
    }
    return out;
}
function classify(head, candidate, changeset, evolution = null) {
    const statuses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkCorrespondences"])(candidate);
    let drifted = statuses.filter((s)=>s.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HOLDS"] && s.status !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"]);
    let vertical = [];
    const horizontal = [];
    if (changeset.trigger === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RUNTIME"] && changeset.changes.length) {
        vertical = bottomUp(head, changeset, evolution !== null);
    } else if (changeset.trigger === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EDIT"] && [
        "O1",
        "O2"
    ].includes(changeset.originLevel ?? "")) {
        vertical = topDown(candidate, changeset, drifted.map((s)=>s.initiating));
    } else if (changeset.trigger === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["TIMELINESS"]) {
        drifted = [];
        for (const change of changeset.changes){
            const violation = change.after;
            horizontal.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", HORIZONTAL, {
                initiating: violation.element,
                participating: violation.participating
            }, {
                status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BROKEN"],
                correspondence: violation.correspondence,
                reasons: [
                    violation.reason
                ]
            }));
        }
    }
    for (const status of drifted){
        const ends = {
            initiating: status.initiating
        };
        if (status.participating) ends.participating = status.participating;
        horizontal.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])("", HORIZONTAL, ends, {
            status: status.status,
            correspondence: status.correspondence,
            reasons: [
                ...status.reasons
            ]
        }));
    }
    vertical.forEach((link, index)=>link.id = `vd-${index + 1}`);
    horizontal.forEach((link, index)=>link.id = `hd-${index + 1}`);
    const driftedIds = new Set(horizontal.map((link)=>link.props.correspondence));
    const props = {
        artifact: "classified-drift",
        trigger: changeset.trigger,
        holding: statuses.filter((s)=>s.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HOLDS"] && !driftedIds.has(s.correspondence)).map((s)=>s.correspondence)
    };
    if (evolution !== null) props.proposedEvolution = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["proposalToDict"])(evolution);
    const all = [
        ...vertical,
        ...horizontal
    ];
    const woven = [
        ...new Set(all.flatMap((l)=>Object.values(l.ends).map((e)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(e).model)))
    ];
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodel"])("classified-drift", {
        woven: woven.sort(),
        links: all,
        props
    });
}
function hasDrift(drift) {
    return drift.links.length > 0;
}
}),
"[project]/src/engine/assistant/evolution.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EvolutionError",
    ()=>EvolutionError,
    "migrateInstance",
    ()=>migrateInstance,
    "proposalToDict",
    ()=>proposalToDict,
    "proposeEvolution",
    ()=>proposeEvolution
]);
/**
 * Model evolutions the modelling assistant can propose.
 *
 * `proposeEvolution` answers a bottom-up change: when the data of a DT no
 * longer conforms to its type, it proposes the next version of the type and
 * moves the instance to it. `migrateInstance` moves an instance to an existing
 * version of its type. Both only build candidates: nothing is committed
 * without a modeler decision.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modeling$2f$parts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modeling/parts.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modelset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
class EvolutionError extends Error {
}
function proposalToDict(proposal) {
    return {
        type: proposal.package,
        from: proposal.fromVersion,
        to: proposal.toVersion,
        instance: proposal.instance,
        replaces: proposal.replaces.map(([before, after])=>`${before} -> ${after}`)
    };
}
function camel(key) {
    return key.split(/[_\-\s]+/).filter(Boolean).map((part)=>part[0].toUpperCase() + part.slice(1)).join("");
}
function snake(name) {
    return name.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "_").toLowerCase();
}
/** The capability key that can back an attribute: same type and unit, and the
 * same meaning whenever both sides declare one. */ function matchingKey(capabilities, attribute) {
    const fits = (capability)=>{
        if ((capability.eType ?? null) !== attribute.eType) return false;
        if ((capability.unit ?? null) !== attribute.unit) return false;
        const declared = capability.meaning ?? null;
        return declared === null || attribute.meaning === null || declared === attribute.meaning;
    };
    if (attribute.name in capabilities && fits(capabilities[attribute.name])) return attribute.name;
    const candidates = Object.keys(capabilities).filter((key)=>fits(capabilities[key]));
    return candidates.length === 1 ? candidates[0] : null;
}
function migrateInstance(fed, instanceName, targetKey) {
    const instance = fed.models[instanceName];
    const target = fed.models[targetKey];
    const capabilities = fed.capabilities[instanceName] ?? {};
    const objects = {};
    for (const obj of Object.values(instance.objects)){
        const eclass = target.eClasses[obj.instanceOf];
        if (!eclass) continue;
        const kept = structuredClone(obj);
        kept.bindings = Object.fromEntries(Object.entries(kept.bindings).filter(([a])=>a in eclass.eAttributes));
        kept.slots = Object.fromEntries(Object.entries(kept.slots).filter(([s])=>s in eclass.eAttributes || s in eclass.eReferences));
        objects[kept.name] = kept;
    }
    const instantiated = new Set(Object.values(objects).map((o)=>o.instanceOf));
    for (const eclass of Object.values(target.eClasses)){
        if (instantiated.has(eclass.name)) continue;
        const obj = {
            name: snake(eclass.name),
            instanceOf: eclass.name,
            bindings: {},
            slots: {}
        };
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, target, eclass.name).requiresSource) {
            for (const attribute of Object.values(eclass.eAttributes)){
                const key = matchingKey(capabilities, attribute);
                if (key === null) {
                    throw new EvolutionError(`${instanceName} has no capability for ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(targetKey, eclass.name, attribute.name)}`);
                }
                obj.bindings[attribute.name] = key;
            }
        }
        objects[obj.name] = obj;
    }
    for (const obj of Object.values(objects)){
        for (const reference of Object.values(target.eClasses[obj.instanceOf].eReferences)){
            const valid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, reference.name).filter((t)=>t in objects);
            if (valid.length || reference.lowerBound === 0) {
                if (!valid.length) delete obj.slots[reference.name];
                continue;
            }
            const candidates = Object.values(objects).filter((o)=>o.instanceOf === reference.eType);
            // What it referred to is gone and nothing takes its place for sure: the
            // reference is left open, for the gate to point out and the modeler to settle.
            if (candidates.length === 1) obj.slots[reference.name] = candidates[0].name;
            else delete obj.slots[reference.name];
        }
    }
    instance.objects = objects;
    instance.typedBy = targetKey;
}
function proposeEvolution(head, changeset) {
    const candidate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(head);
    const source = changeset.origin;
    if (source === null || !(source in candidate.models)) return [
        candidate,
        null
    ];
    const capabilities = candidate.capabilities[source] ??= {};
    const lost = [];
    const fresh = {};
    for (const change of changeset.changes){
        const body = change.after ?? change.before;
        if (change.level !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"] || typeof body !== "object" || body === null) continue;
        const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(change.element).path[0];
        if (change.kind === "removed" || change.kind === "modified") {
            lost.push(key);
            delete capabilities[key];
        }
        if (change.kind === "added" || change.kind === "modified") {
            fresh[key] = {
                ...change.after
            };
            capabilities[key] = {
                ...change.after
            };
        }
    }
    const bound = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boundKeys"])(head, source);
    const lostBound = lost.filter((key)=>key in bound);
    if (!lostBound.length) return [
        candidate,
        null
    ];
    const instance = head.models[source];
    const old = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(head, instance);
    if (old === null) return [
        candidate,
        null
    ];
    const evolved = structuredClone(old);
    evolved.version = Math.max(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["versions"])(head, old.name)) + 1;
    const removed = [];
    for (const key of lostBound){
        const [objName, attribute] = bound[key];
        const eclass = evolved.eClasses[instance.objects[objName].instanceOf];
        if (!eclass) continue;
        delete eclass.eAttributes[attribute];
        if (!Object.keys(eclass.eAttributes).length) {
            removed.push(eclass);
            delete evolved.eClasses[eclass.name];
        }
    }
    const template = removed[0] ?? null;
    const meta = head.models[old.typedBy ?? ""];
    let concept = template?.instanceOf ?? null;
    if (concept === null && meta) {
        concept = Object.entries(meta.eClasses).find(([, c])=>c.properties.requiresSource)?.[0] ?? null;
    }
    let replaces = [];
    const added = [];
    for (const [key, capability] of Object.entries(fresh)){
        if (key in bound && !lostBound.includes(key)) continue;
        if (capability.part) continue; // provided by a part of a device: modelled with the part, below
        const className = capability.observation || camel(key);
        let eclass = evolved.eClasses[className];
        if (!eclass) {
            eclass = {
                name: className,
                instanceOf: concept,
                eAttributes: {},
                eReferences: template ? structuredClone(template.eReferences) : {},
                properties: template ? structuredClone(template.properties) : {}
            };
            evolved.eClasses[className] = eclass;
            added.push(className);
        }
        eclass.eAttributes[key] = {
            name: key,
            eType: capability.eType,
            unit: capability.unit ?? null,
            meaning: capability.meaning ?? null,
            upperBound: 1
        };
        const sourceHint = capability.source;
        if (sourceHint && template) {
            // The DT names a new data source: it replaces the one of the lost data.
            for (const reference of Object.values({
                ...eclass.eReferences
            })){
                const previous = evolved.eClasses[reference.eType];
                const stillUsed = Object.values(evolved.eClasses).some((c)=>c !== eclass && Object.values(c.eReferences).some((r)=>r.eType === reference.eType));
                if (!previous || stillUsed || reference.eType === sourceHint) continue;
                delete evolved.eClasses[previous.name];
                evolved.eClasses[sourceHint] = {
                    name: sourceHint,
                    instanceOf: previous.instanceOf,
                    eAttributes: structuredClone(previous.eAttributes),
                    eReferences: {},
                    properties: structuredClone(previous.properties)
                };
                eclass.eReferences[reference.name] = {
                    name: reference.name,
                    eType: sourceHint,
                    lowerBound: reference.lowerBound,
                    upperBound: reference.upperBound,
                    containment: false
                };
                replaces.push([
                    previous.name,
                    sourceHint
                ]);
            }
        }
    }
    const paired = [];
    for(let i = 0; i < Math.min(removed.length, added.length); i++){
        paired.push([
            removed[i].name,
            added[i]
        ]);
    }
    replaces = [
        ...paired,
        ...replaces
    ];
    // A sensor all of whose parameters are gone is gone itself, with its class
    // when no other sensor of that kind is left.
    const goneSensors = Object.values(instance.objects).filter((obj)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(head, instance, obj) && Object.keys(obj.bindings).length > 0 && Object.values(obj.bindings).every((key)=>lost.includes(key)));
    const goneClasses = [
        ...new Set(goneSensors.map((obj)=>obj.instanceOf))
    ].filter((name)=>Object.values(instance.objects).every((obj)=>obj.instanceOf !== name || goneSensors.includes(obj)));
    for (const name of goneClasses)delete evolved.eClasses[name];
    candidate.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(evolved)] = evolved;
    migrateInstance(candidate, source, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(evolved));
    for (const obj of goneSensors)delete candidate.models[source].objects[obj.name];
    // A part that is attached but was not in the model: the part, and an
    // observation of every parameter it senses, on the key it provides.
    const parts = new Map();
    for (const [key, capability] of Object.entries(fresh)){
        if (!capability.part) continue;
        const entry = parts.get(capability.part.uid) ?? {
            part: capability.part,
            keys: {},
            hints: {}
        };
        entry.keys[capability.part.parameter] = key;
        if (capability.observation) entry.hints[capability.part.parameter] = capability.observation;
        parts.set(capability.part.uid, entry);
    }
    const newSensors = [];
    const newObservations = [];
    for (const { part, keys, hints } of parts.values()){
        const reached = {
            type: String(candidate.models[source].objects[part.device]?.slots.connector ?? ""),
            settings: []
        };
        const sensor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modeling$2f$parts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addSensor"])(candidate, source, part.device, reached, part.kind, part.uid, keys);
        if (!sensor) continue;
        newSensors.push(candidate.models[source].objects[sensor].instanceOf);
        for (const [parameter, key] of Object.entries(keys)){
            const observation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modeling$2f$parts$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["observeParameter"])(candidate, source, sensor, parameter, hints[parameter]);
            if (observation) newObservations.push(candidate.models[source].objects[observation].instanceOf);
            delete capabilities[key]; // the sensor of the model provides it now
        }
    }
    if (parts.size) {
        // What replaced what: the observations left without data by the new ones,
        // the sensors that are gone by the parts that came.
        const pairs = [];
        removed.slice(added.length).forEach((eclass, i)=>newObservations[i] && pairs.push([
                eclass.name,
                newObservations[i]
            ]));
        goneClasses.forEach((name, i)=>newSensors[i] && pairs.push([
                name,
                newSensors[i]
            ]));
        replaces = [
            ...replaces,
            ...pairs
        ];
        // What referred to something replaced now refers to what replaced it.
        const became = new Map(replaces);
        for (const eclass of Object.values(evolved.eClasses)){
            for (const reference of Object.values(eclass.eReferences)){
                if (!(reference.eType in evolved.eClasses) && became.has(reference.eType)) {
                    reference.eType = became.get(reference.eType);
                }
            }
        }
        migrateInstance(candidate, source, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(evolved));
    }
    for (const obj of Object.values(candidate.models[source].objects)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(candidate, candidate.models[source], obj)) continue;
        for (const [attribute, key] of Object.entries(obj.bindings))if (lost.includes(key)) delete obj.bindings[attribute];
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linkVersions"])(candidate, old, evolved, replaces);
    return [
        candidate,
        {
            package: old.name,
            instance: source,
            fromVersion: old.version,
            toVersion: evolved.version,
            replaces
        }
    ];
}
}),
"[project]/src/engine/assistant/impact.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "IMPACT",
    ()=>IMPACT,
    "assess",
    ()=>assess
]);
/**
 * Step 3: estimate the impact of the classified drift.
 *
 * Dependencies are followed from the drifted elements to the indicators, goals
 * and rules that use them, and across correspondences to peer DTs. The impact
 * report is a weaving model: every link relates a drifted element to an element
 * it affects, either between peers (same level) or vertically (across levels).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/drift.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const IMPACT = "ImpactLink";
const SEVERITY = {
    suspend: "high",
    exclude_input: "medium",
    keep_last_valid: "medium"
};
const EFFECT = {
    suspend: "cannot be evaluated",
    exclude_input: "can only be evaluated on a reduced scope",
    keep_last_valid: "is evaluated on the last valid value"
};
class Report {
    links = [];
    seen = new Set();
    add(source, target, props) {
        const pair = `${source} -> ${target}`;
        if (source === target || this.seen.has(pair)) return;
        this.seen.add(pair);
        const kept = Object.fromEntries(Object.entries(props).filter(([, v])=>v !== null && v !== undefined));
        this.links.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])(`im-${this.links.length + 1}`, IMPACT, {
            source,
            target
        }, kept));
    }
}
/** Follow the dependency links from an O0 object, inside its DT and across the
 * correspondences where it is the participating element. */ function follow(fed, start, report) {
    const queue = [
        start
    ];
    const visited = new Set([
        start
    ]);
    while(queue.length){
        const current = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(queue.shift());
        const instance = fed.models[current.model];
        if (!instance || !current.path.length) continue;
        const objRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(current.model, current.path[0]);
        for (const [dependent, reference] of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dependents"])(fed, instance, current.path[0])){
            const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, dependent.name);
            const inputs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(dependent, reference);
            const behaviour = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interimOf"])(fed, instance, dependent);
            report.add(objRef, target, {
                direction: "peer",
                scope: "intra-dt",
                category: "dependency",
                severity: SEVERITY[behaviour] ?? "high",
                reason: `${target} ${EFFECT[behaviour] ?? EFFECT.suspend}: it uses ` + `${objRef} (${reference}, ${inputs.length} in total)`,
                interim: behaviour
            });
            if (!visited.has(target)) {
                visited.add(target);
                queue.push(target);
            }
        }
        for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["links"])(fed, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"])){
            const participating = link.ends.participating;
            if (!participating || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(participating) !== objRef) continue;
            const initiating = link.ends.initiating;
            report.add(participating, initiating, {
                direction: "peer",
                scope: "inter-dt",
                category: "correspondence",
                severity: "high",
                via: link.id,
                reason: `${initiating} depends on ${participating}`
            });
            const owner = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(initiating);
            if (!visited.has(owner)) {
                visited.add(owner);
                queue.push(owner);
            }
        }
    }
}
function assess(head, candidate, drift) {
    const report = new Report();
    const participants = [];
    for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linksOfType"])(drift, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["VERTICAL"])){
        const { upper, lower } = link.ends;
        const lowerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(lower);
        if (link.props.origin === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["BOTTOM_UP"]) {
            const bound = lowerRef.data ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["boundKeys"])(head, lowerRef.model) : {};
            if (lowerRef.path.length && lowerRef.path[0] in bound) {
                const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(lowerRef.model, ...bound[lowerRef.path[0]]);
                report.add(lower, target, {
                    direction: "vertical",
                    scope: "intra-dt",
                    category: "conformance",
                    severity: "high",
                    reason: `${target} has no conforming data any more`
                });
                follow(head, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(target), report);
            }
        } else {
            report.add(upper, lower, {
                direction: "vertical",
                scope: "intra-dt",
                category: "conformance",
                severity: "high",
                reason: `${lower} does not satisfy ${upper}`
            });
            if (lowerRef.path.length) follow(candidate, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(lower), report);
        }
    }
    for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linksOfType"])(drift, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HORIZONTAL"])){
        const initiating = link.ends.initiating;
        const participating = link.ends.participating;
        if (participating) {
            participants.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(participating).model);
            report.add(participating, initiating, {
                direction: "peer",
                scope: "inter-dt",
                category: "correspondence",
                severity: "high",
                via: link.props.correspondence,
                reason: `the correspondence is ${link.props.status}: ${initiating} cannot be provided`
            });
        }
        follow(candidate, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ownerOf"])(initiating), report);
    }
    // Participating DTs left at an older version of their type.
    const leftBehind = [];
    for (const name of new Set(participants)){
        const instance = candidate.models[name];
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(candidate, instance);
        if (o1 === null) continue;
        const latest = Math.max(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["versions"])(candidate, o1.name));
        if (o1.version < latest) {
            const newer = `${o1.name}@${latest}`;
            leftBehind.push(`${name} (${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1)}, latest is ${newer})`);
            report.add(newer, name, {
                direction: "vertical",
                scope: "intra-dt",
                category: "left-behind",
                severity: "low",
                reason: `${name} is left at ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1)} while ${newer} exists`
            });
        }
    }
    const affected = new Set();
    for (const link of report.links){
        for (const end of Object.values(link.ends)){
            const model = candidate.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(end).model] ?? head.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(end).model];
            if (model && model.level === "O0") affected.add(model.name);
        }
    }
    const inUse = {};
    for (const instance of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(candidate)){
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(candidate, instance);
        if (o1 !== null) (inUse[o1.name] ??= new Set()).add(o1.version);
    }
    const dts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(candidate).map((i)=>[
            i.name,
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dtLabel"])(candidate, i.name)
        ]);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodel"])("impact-report", {
        woven: [
            ...affected
        ].sort(),
        links: report.links,
        props: {
            artifact: "impact-report",
            affectedDTs: dts.filter(([name])=>affected.has(name)).map(([, label])=>label),
            unaffectedDTs: dts.filter(([name])=>!affected.has(name)).map(([, label])=>label),
            coexistingVersions: Object.fromEntries(Object.entries(inUse).filter(([, used])=>used.size > 1).map(([pkg, used])=>[
                    pkg,
                    [
                        ...used
                    ].sort((a, b)=>a - b)
                ])),
            leftBehind
        }
    });
}
}),
"[project]/src/engine/assistant/process.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACCEPT",
    ()=>ACCEPT,
    "EDIT_DECISION",
    ()=>EDIT_DECISION,
    "REJECT",
    ()=>REJECT,
    "artifactsOf",
    ()=>artifactsOf,
    "decisionToDict",
    ()=>decisionToDict,
    "onEdit",
    ()=>onEdit,
    "onObservations",
    ()=>onObservations,
    "onTimeliness",
    ()=>onTimeliness,
    "resolveDecision",
    ()=>resolveDecision
]);
/**
 * The four-step process of the modelling assistant and the model-first loop.
 *
 * change -> classified drift -> impact report -> adaptation plan, then the
 * modeler decides: only a decision produces a commit, and the runtime is
 * regenerated from the committed model (projection).
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/adaptation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/change.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/drift.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/evolution.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$impact$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/impact.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
const ACCEPT = "accept";
const EDIT_DECISION = "edit";
const REJECT = "reject";
function artifactsOf(result) {
    return {
        "1-change-set.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["changeSetToDict"])(result.changeset)),
        "2-classified-drift.wm.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelToDict"])(result.drift)),
        "3-impact-report.wm.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelToDict"])(result.impact)),
        "4-adaptation-plan.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["planToDict"])(result.plan))
    };
}
function run(head, candidate, changeset, evolution, planner) {
    const drift = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$drift$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classify"])(head, candidate, changeset, evolution);
    const impact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$impact$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assess"])(head, candidate, drift);
    const plan = (planner ?? new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RuleBasedPlanner"]()).plan({
        head,
        candidate,
        changeset,
        drift,
        impact
    });
    return {
        head,
        candidate,
        changeset,
        drift,
        impact,
        plan
    };
}
function onObservations(head, batch, base = null, planner) {
    const changeset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fromObservations"])(head, batch, base);
    const [candidate, evolution] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$evolution$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["proposeEvolution"])(head, changeset);
    return run(head, candidate, changeset, evolution, planner);
}
function onEdit(head, working, base = null, planner) {
    return run(head, working, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fromEdit"])(head, working, base), null, planner);
}
function onTimeliness(head, violations, base = null, planner) {
    const changeset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$change$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fromTimeliness"])(head, violations, base);
    return run(head, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(head), changeset, null, planner);
}
function resolveDecision(candidate, plan, decision, focus) {
    const kind = decision.decision;
    if (kind === REJECT) return null;
    if (kind !== ACCEPT && kind !== EDIT_DECISION) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"](`unknown decision '${kind}'`);
    const choices = decision.choices ?? {};
    let result = candidate;
    for (const resolution of plan.resolutions){
        if (focus !== undefined && resolution.owner !== focus) continue;
        const chosen = choices[resolution.drift] ?? decision.option;
        if (chosen === undefined || chosen === null) {
            if (kind === EDIT_DECISION) continue; // resolved by the modeler's own edits
            throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"](`no option chosen for ${resolution.drift}`);
        }
        const found = resolution.options.find((o)=>o.id === String(chosen));
        if (!found) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"](`${resolution.drift} has no option '${chosen}'`);
        result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["applyOption"])(result, found);
    }
    return result;
}
function decisionToDict(decision) {
    const out = {
        decision: decision.decision
    };
    if (decision.option !== undefined) out.option = decision.option;
    if (decision.choices) out.choices = decision.choices;
    if (decision.message) out.message = decision.message;
    return out;
}
}),
"[project]/src/engine/assistant/session.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * The modelling assistant at work on a repository of models: what triggers a
 * run of the process for the model a modeler has open, computed the same way
 * in the browser (to show it) and on the server (to commit the decision).
 */ __turbopack_context__.s([
    "assembleAt",
    ()=>assembleAt,
    "headFederation",
    ()=>headFederation,
    "headsOf",
    ()=>headsOf,
    "incomingDrift",
    ()=>incomingDrift,
    "restoreBlockers",
    ()=>restoreBlockers,
    "runTrigger",
    ()=>runTrigger,
    "withWorkingCopy",
    ()=>withWorkingCopy
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modelset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/runtime/projection.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$simulator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/runtime/simulator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/adaptation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/process.ts [app-rsc] (ecmascript)");
;
;
;
;
;
function headsOf(versions) {
    const heads = {};
    for (const v of versions)heads[v.model] = Math.max(heads[v.model] ?? 0, v.version);
    return heads;
}
function assembleAt(versions, at) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assemble"])(versions.filter((v)=>at[v.model] === v.version), versions.filter((v)=>at[v.model] !== undefined && v.version < at[v.model]));
}
function restoreBlockers(versions, model, target) {
    const first = {};
    for (const v of versions){
        const against = v.context?.[model];
        if (v.model === model || against === undefined || against <= target) continue;
        if (!first[v.model] || v.version < first[v.model].version) first[v.model] = {
            model: v.model,
            version: v.version,
            against
        };
    }
    return Object.values(first);
}
function headFederation(versions) {
    return assembleAt(versions, headsOf(versions));
}
function incomingDrift(versions, focus) {
    const heads = headsOf(versions);
    const head = assembleAt(versions, heads);
    const context = versions.find((v)=>v.model === focus && v.version === heads[focus])?.context ?? {};
    const before = {
        ...heads
    };
    let moved = false;
    for (const woven of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wovenBy"])(head, focus)){
        if (context[woven] !== undefined && context[woven] !== heads[woven]) {
            before[woven] = context[woven];
            moved = true;
        }
    }
    if (!moved) return null;
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onEdit"])(assembleAt(versions, before), head, heads[focus]);
    return result.drift.links.length || result.plan.resolutions.length ? result : null;
}
function withWorkingCopy(versions, focus, files) {
    const heads = headsOf(versions);
    const current = versions.filter((v)=>heads[v.model] === v.version);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assemble"])(current.map((v)=>v.model === focus ? {
            ...v,
            files
        } : v), versions.filter((v)=>v.version < heads[v.model] || v.model === focus));
}
function runTrigger(versions, focus, trigger) {
    const heads = headsOf(versions);
    const head = assembleAt(versions, heads);
    const base = heads[focus] ?? null;
    if (trigger.kind === "edit") {
        // only what the model owns can change in its working copy
        const working = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["transplant"])(head, withWorkingCopy(versions, focus, trigger.files), focus);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onEdit"])(head, working, base);
    }
    if (trigger.kind === "observations") return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onObservations"])(head, trigger.batch, base);
    if (trigger.kind === "timeliness") {
        const violations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$simulator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkTimeliness"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["project"])(head, base), trigger.batches, trigger.now);
        return violations.length ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onTimeliness"])(head, violations, base) : null;
    }
    if (trigger.kind === "incoming") return incomingDrift(versions, focus);
    const request = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["incomingRequests"])(head, focus).find((r)=>r.correspondence === trigger.correspondence);
    return request?.proposal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onEdit"])(head, request.proposal, base) : null;
}
;
}),
"[project]/src/engine/conformance.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "checkConformance",
    ()=>checkConformance,
    "issueText",
    ()=>issueText
]);
/**
 * Conformance gate: O1 conforms to O2, O0 conforms to O1, and the bindings
 * of O0 are backed by the capabilities the DT reports.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
;
;
;
function issueText(issue) {
    return `[${issue.check}] ${issue.element}: ${issue.message}`;
}
function checkTypes(fed, model, issues) {
    const key = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(model);
    const add = (element, message)=>issues.push({
            check: "O1->O2",
            element,
            message
        });
    const meta = fed.models[model.typedBy ?? ""];
    if (!meta || meta.level !== "O2") {
        add(key, `typedBy ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(model.typedBy)} is not an O2 model`);
        return;
    }
    if (!Number.isInteger(model.version)) add(key, "an O1 type must carry a version");
    for (const eclass of Object.values(model.eClasses)){
        const where = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(key, eclass.name);
        if (!(eclass.instanceOf !== null && eclass.instanceOf in meta.eClasses)) {
            add(where, `instanceOf ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(eclass.instanceOf)} is not in ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(meta)}`);
        }
        for (const attribute of Object.values(eclass.eAttributes)){
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PRIMITIVES"].includes(attribute.eType)) {
                add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(key, eclass.name, attribute.name), "unknown eType");
            }
        }
        for (const reference of Object.values(eclass.eReferences)){
            if (!(reference.eType in model.eClasses)) {
                add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(key, eclass.name, reference.name), `eType ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(reference.eType)} is not a class of ${key}`);
            }
        }
        for (const operation of Object.values(eclass.eOperations ?? {})){
            for (const parameter of Object.values(operation.eParameters)){
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PRIMITIVES"].includes(parameter.eType)) {
                    add((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(key, eclass.name, operation.name), `parameter ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(parameter.name)} has an unknown eType`);
                }
            }
        }
        const behaviour = eclass.properties.onDrift;
        if (behaviour !== undefined && behaviour !== null && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["INTERIM_BEHAVIOURS"].includes(behaviour)) {
            add(where, `unknown interim behaviour ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(behaviour)}`);
        }
    }
}
function checkInstances(fed, model, issues) {
    const add = (check, element, message)=>issues.push({
            check,
            element,
            message
        });
    const o1 = fed.models[model.typedBy ?? ""];
    if (!o1 || o1.level !== "O1") {
        add("O0->O1", model.name, `typedBy ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(model.typedBy)} is not an O1 type`);
        return;
    }
    const capabilities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["availableKeys"])(fed, model.name);
    for (const obj of Object.values(model.objects)){
        const where = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(model.name, obj.name);
        const eclass = o1.eClasses[obj.instanceOf];
        if (!eclass) {
            add("O0->O1", where, `instanceOf ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(obj.instanceOf)} is not in ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(o1)}`);
            continue;
        }
        for (const [attributeName, key] of Object.entries(obj.bindings)){
            const attribute = eclass.eAttributes[attributeName];
            const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(model.name, obj.name, attributeName);
            if (!attribute) {
                add("O0->O1", element, `${eclass.name} has no such attribute`);
                continue;
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(fed, model, obj)) continue; // a sensor provides the key: nothing has to report it
            const capability = capabilities[key];
            if (!capability) {
                add("O0->data", element, `bound key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)} is not a capability of the DT`);
            } else if ((capability.eType ?? null) !== attribute.eType) {
                add("O0->data", element, `key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)} provides ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["str"])(capability.eType)}, the type expects ${attribute.eType}`);
            } else if ((capability.unit ?? null) !== attribute.unit) {
                add("O0->data", element, `key ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)} has unit ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(capability.unit)}, ` + `the type expects ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(attribute.unit)}`);
            }
        }
        for (const [slot, value] of Object.entries(obj.slots)){
            const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(model.name, obj.name, slot);
            if (slot in eclass.eAttributes) {
                const etype = eclass.eAttributes[slot].eType;
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(value, etype)) {
                    add("O0->O1", element, `value ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(value)} does not conform to ${etype}`);
                }
            } else if (!(slot in eclass.eReferences)) {
                add("O0->O1", element, `${eclass.name} has no such feature`);
            }
        }
        for (const reference of Object.values(eclass.eReferences)){
            const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(model.name, obj.name, reference.name);
            const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, reference.name);
            if (found.length < reference.lowerBound) {
                add("O0->O1", element, `needs at least ${reference.lowerBound} target(s)`);
            }
            if (reference.upperBound !== -1 && found.length > reference.upperBound) {
                add("O0->O1", element, `accepts at most ${reference.upperBound} target(s)`);
            }
            for (const target of found){
                const other = model.objects[target];
                if (!other) {
                    add("O0->O1", element, `target ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(target)} does not exist`);
                } else if (other.instanceOf !== reference.eType) {
                    add("O0->O1", element, `target ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(target)} is a ${other.instanceOf}, expected ${reference.eType}`);
                }
            }
        }
    }
}
function checkConformance(fed) {
    const issues = [];
    for (const model of Object.values(fed.models)){
        if (model.level === "O1") checkTypes(fed, model, issues);
        else if (model.level === "O0") checkInstances(fed, model, issues);
    }
    return issues;
}
}),
"[project]/src/engine/devices.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Physical devices, as a DT model describes them.
 *
 * Two O2 concepts carry the description, whatever the domain and the kind of
 * hardware: a class that is `instanceOf` a concept marked `device` stands for
 * a device reached through a connector (its attributes are the settings of
 * the connection); a class of a concept marked `sensor` stands for a sensor on
 * a device. The attributes of a sensor that are bound are the parameters it
 * senses, each bound to the observation key it provides; the others are its
 * settings (which kind of sensor, which one). A part that only acts is of a
 * concept marked `actuator`. What a part can be asked to do are the operations
 * of its class, so the actions of the hardware are part of the model.
 *
 * This module only reads the model. Talking to hardware is the job of a
 * connector (`src/connectors`), chosen by the `connector` setting of a device.
 */ __turbopack_context__.s([
    "availableKeys",
    ()=>availableKeys,
    "checkArguments",
    ()=>checkArguments,
    "devicesOf",
    ()=>devicesOf,
    "isSensor",
    ()=>isSensor,
    "providedKeys",
    ()=>providedKeys,
    "toBatch",
    ()=>toBatch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
;
;
function flagged(fed, type, obj, flag) {
    return Boolean((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, type, obj.instanceOf)[flag]);
}
function settingsOf(type, obj, skip) {
    const eclass = type.eClasses[obj.instanceOf];
    const out = {};
    for (const name of Object.keys(eclass?.eAttributes ?? {})){
        if (!skip.includes(name) && !(name in obj.bindings) && name in obj.slots) out[name] = obj.slots[name];
    }
    return out;
}
function sensorOf(type, obj) {
    const eclass = type.eClasses[obj.instanceOf];
    return {
        id: obj.name,
        kind: String(obj.slots.kind ?? ""),
        uid: String(obj.slots.uid ?? ""),
        settings: settingsOf(type, obj, [
            "kind",
            "uid"
        ]),
        parameters: Object.entries(obj.bindings).filter(([name])=>name in (eclass?.eAttributes ?? {})).map(([name, key])=>{
            const attribute = eclass.eAttributes[name];
            return {
                name,
                key,
                eType: attribute.eType,
                unit: attribute.unit,
                meaning: attribute.meaning
            };
        }),
        operations: Object.values(eclass?.eOperations ?? {}).map((operation)=>({
                name: operation.name,
                parameters: Object.values(operation.eParameters).map((p)=>({
                        name: p.name,
                        eType: p.eType,
                        unit: p.unit
                    }))
            }))
    };
}
function devicesOf(fed, model) {
    const instance = fed.models[model];
    const type = instance?.level === "O0" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance) : null;
    if (!instance || !type) return [];
    const objects = Object.values(instance.objects);
    return objects.filter((obj)=>flagged(fed, type, obj, "device")).map((device)=>({
            model,
            id: device.name,
            connector: String(device.slots.connector ?? ""),
            settings: settingsOf(type, device, [
                "connector"
            ]),
            sensors: objects.filter((obj)=>flagged(fed, type, obj, "sensor") || flagged(fed, type, obj, "actuator")).filter((obj)=>Object.keys(type.eClasses[obj.instanceOf]?.eReferences ?? {}).some((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, r).includes(device.name))).map((obj)=>sensorOf(type, obj))
        }));
}
function isSensor(fed, instance, obj) {
    return flagged(fed, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance), obj, "sensor");
}
function providedKeys(fed, model) {
    const instance = fed.models[model];
    const type = instance?.level === "O0" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance) : null;
    const out = {};
    if (!instance || !type) return out;
    for (const obj of Object.values(instance.objects)){
        if (!flagged(fed, type, obj, "sensor")) continue;
        for (const parameter of sensorOf(type, obj).parameters){
            const capability = {
                eType: parameter.eType
            };
            if (parameter.unit !== null) capability.unit = parameter.unit;
            if (parameter.meaning !== null) capability.meaning = parameter.meaning;
            out[parameter.key] = capability;
        }
    }
    return out;
}
function availableKeys(fed, model) {
    return {
        ...fed.capabilities[model] ?? {},
        ...providedKeys(fed, model)
    };
}
function toBatch(fed, model, readings, timestamp, attached = []) {
    const capabilities = availableKeys(fed, model);
    for (const reading of readings)if (reading.error !== undefined) delete capabilities[reading.key];
    const modelled = new Set(devicesOf(fed, model).flatMap((device)=>device.sensors.map((part)=>part.uid)));
    for (const part of attached){
        if (modelled.has(part.uid)) continue;
        for (const parameter of part.kind.parameters){
            const key = parameter.name in capabilities ? `${part.kind.kind}_${part.uid}_${parameter.name}` : parameter.name;
            const capability = {
                eType: parameter.eType
            };
            if (parameter.unit) capability.unit = parameter.unit;
            if (parameter.meaning) capability.meaning = parameter.meaning;
            if (parameter.observation) capability.observation = parameter.observation;
            capabilities[key] = {
                ...capability,
                part: {
                    ...part,
                    parameter: parameter.name
                }
            };
        }
    }
    return {
        source: model,
        capabilities,
        observations: readings.filter((reading)=>reading.error === undefined).map((reading)=>({
                key: reading.key,
                value: reading.value,
                timestamp
            }))
    };
}
function checkArguments(operation, args) {
    const problems = [];
    for (const parameter of operation.parameters){
        if (!(parameter.name in args)) problems.push(`${parameter.name} is missing`);
        else if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(args[parameter.name], parameter.eType)) {
            problems.push(`${parameter.name} must be ${parameter.eType}`);
        }
    }
    for (const name of Object.keys(args)){
        if (!operation.parameters.some((p)=>p.name === name)) problems.push(`${operation.name} has no parameter ${name}`);
    }
    return problems;
}
}),
"[project]/src/engine/federation.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CORRESPONDENCE",
    ()=>CORRESPONDENCE,
    "EVOLUTION",
    ()=>EVOLUTION,
    "REPRESENTATION",
    ()=>REPRESENTATION,
    "classProps",
    ()=>classProps,
    "cloneFederation",
    ()=>cloneFederation,
    "dependents",
    ()=>dependents,
    "dtLabel",
    ()=>dtLabel,
    "emptyFederation",
    ()=>emptyFederation,
    "federationFromFiles",
    ()=>federationFromFiles,
    "federationToFiles",
    ()=>federationToFiles,
    "findLink",
    ()=>findLink,
    "instances",
    ()=>instances,
    "interimOf",
    ()=>interimOf,
    "levelOf",
    ()=>levelOf,
    "links",
    ()=>links,
    "modelPath",
    ()=>modelPath,
    "overlay",
    ()=>overlay,
    "resolve",
    ()=>resolve,
    "successor",
    ()=>successor,
    "typeOf",
    ()=>typeOf,
    "versions",
    ()=>versions
]);
/**
 * The content of the modeling layer: models of the three levels, weaving
 * models, the capabilities reported by the DTs and the derivation catalogue.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const CORRESPONDENCE = "Correspondence";
const EVOLUTION = "Evolution";
const REPRESENTATION = "Representation";
function emptyFederation() {
    return {
        models: {},
        weaving: {},
        capabilities: {},
        derivations: []
    };
}
function cloneFederation(fed) {
    return structuredClone(fed);
}
// -- persistence -------------------------------------------------------------
function byPath(left, right) {
    const a = left.split("/");
    const b = right.split("/");
    for(let i = 0; i < Math.min(a.length, b.length); i++){
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }
    return a.length - b.length;
}
function federationFromFiles(files) {
    const fed = emptyFederation();
    const paths = Object.keys(files).sort(byPath);
    for (const path of paths.filter((p)=>p.endsWith(".mlm.yaml"))){
        const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[path]));
        fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(model)] = model;
    }
    for (const path of paths.filter((p)=>p.endsWith(".wm.yaml"))){
        const wm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[path]));
        fed.weaving[wm.name] = wm;
    }
    for (const path of paths){
        const match = /^capabilities\/([^/]+)\.yaml$/.exec(path);
        if (match) fed.capabilities[match[1]] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[path]) ?? {};
    }
    if (files["derivations.yaml"] !== undefined) {
        fed.derivations = ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files["derivations.yaml"]) ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ruleFromDict"]);
    }
    return fed;
}
function modelPath(model) {
    const name = model.level === "O1" ? `${model.name}.v${model.version}` : model.name;
    return `${model.level.toLowerCase()}/${name}.mlm.yaml`;
}
function federationToFiles(fed) {
    const files = {};
    for (const model of Object.values(fed.models)){
        files[modelPath(model)] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(model));
    }
    for (const wm of Object.values(fed.weaving)){
        files[`weaving/${wm.name}.wm.yaml`] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelToDict"])(wm));
    }
    for (const [name, capabilities] of Object.entries(fed.capabilities)){
        files[`capabilities/${name}.yaml`] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])(capabilities);
    }
    if (fed.derivations.length) {
        files["derivations.yaml"] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])(fed.derivations.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ruleToDict"]));
    }
    return files;
}
function overlay(fed, files) {
    return federationFromFiles({
        ...federationToFiles(fed),
        ...files
    });
}
function instances(fed) {
    return Object.values(fed.models).filter((m)=>m.level === "O0");
}
function typeOf(fed, instance) {
    return fed.models[instance?.typedBy ?? ""] ?? null;
}
function versions(fed, pkg) {
    return Object.values(fed.models).filter((m)=>m.level === "O1" && m.name === pkg && m.version !== null).map((m)=>m.version).sort((a, b)=>a - b);
}
function classProps(fed, o1, className) {
    const eclass = o1?.eClasses[className];
    if (!o1 || !eclass) return {};
    const meta = fed.models[o1.typedBy ?? ""];
    const inherited = meta?.eClasses[eclass.instanceOf ?? ""]?.properties ?? {};
    return {
        ...inherited,
        ...eclass.properties
    };
}
function interimOf(fed, instance, obj) {
    return classProps(fed, typeOf(fed, instance), obj.instanceOf).onDrift ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DEFAULT_INTERIM"];
}
function levelOf(fed, ref) {
    if (ref.data) return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["DATA_LEVEL"];
    return fed.models[ref.model]?.level ?? null;
}
function dtLabel(fed, key) {
    const model = fed.models[key];
    if (!model) return key;
    if (model.level === "O0") return model.dt || model.name;
    const labels = [
        ...new Set(instances(fed).filter((i)=>typeOf(fed, i)?.name === model.name).map((i)=>i.dt || i.name))
    ].sort();
    return labels.length === 1 ? labels[0] : model.name;
}
function resolve(fed, reference) {
    const ref = typeof reference === "string" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(reference) : reference;
    const model = fed.models[ref.model];
    if (!model || ref.data || ref.path.length > 2) return null;
    const resolved = {
        ref,
        model,
        eclass: null,
        obj: null,
        attribute: null
    };
    if (!ref.path.length) return resolved;
    if (model.level === "O0") {
        const obj = model.objects[ref.path[0]];
        const o1 = typeOf(fed, model);
        if (!obj || !o1) return null;
        resolved.obj = obj;
        resolved.eclass = o1.eClasses[obj.instanceOf] ?? null;
    } else {
        resolved.eclass = model.eClasses[ref.path[0]] ?? null;
    }
    if (resolved.eclass === null) return null;
    if (ref.path.length === 2) {
        resolved.attribute = resolved.eclass.eAttributes[ref.path[1]] ?? null;
        if (resolved.attribute === null) return null;
    }
    return resolved;
}
function dependents(fed, instance, objName) {
    const o1 = typeOf(fed, instance);
    const found = [];
    for (const obj of Object.values(instance.objects)){
        const eclass = o1?.eClasses[obj.instanceOf];
        if (!eclass) continue;
        for (const reference of Object.keys(eclass.eReferences)){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, reference).includes(objName)) found.push([
                obj,
                reference
            ]);
        }
    }
    return found;
}
function links(fed, type) {
    return Object.values(fed.weaving).flatMap((wm)=>wm.links.filter((l)=>l.type === type));
}
function findLink(fed, id) {
    for (const wm of Object.values(fed.weaving)){
        const link = wm.links.find((l)=>l.id === id);
        if (link) return link;
    }
    return null;
}
function successor(fed, element) {
    let current = element;
    const seen = new Set();
    while(!seen.has(current)){
        seen.add(current);
        const following = links(fed, EVOLUTION).filter((l)=>l.ends.from === current).map((l)=>l.ends.to);
        if (!following.length) break;
        current = following[0];
    }
    return current !== element ? current : null;
}
}),
"[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Multi-level modelling kernel.
 *
 * The notation borrows the Ecore vocabulary (EPackage, EClass, EAttribute,
 * EReference) and extends it to three levels with cascading typing:
 *
 *  - O2: generic concepts;
 *  - O1: versioned DT types, every class is `instanceOf` an O2 concept;
 *  - O0: instances of the federation, every object is `instanceOf` an O1 class.
 *
 * Runtime data sits below O0 and is not part of a model. Everything is plain
 * data, so a model can be cloned, compared and sent to the browser as is.
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
__turbopack_context__.s([
    "DATA_LEVEL",
    ()=>DATA_LEVEL,
    "DEFAULT_INTERIM",
    ()=>DEFAULT_INTERIM,
    "INTERIM_BEHAVIOURS",
    ()=>INTERIM_BEHAVIOURS,
    "LEVELS",
    ()=>LEVELS,
    "NUMERIC",
    ()=>NUMERIC,
    "PRIMITIVES",
    ()=>PRIMITIVES,
    "attributeFromDict",
    ()=>attributeFromDict,
    "attributeToDict",
    ()=>attributeToDict,
    "classFromDict",
    ()=>classFromDict,
    "classToDict",
    ()=>classToDict,
    "etypeOf",
    ()=>etypeOf,
    "modelFromDict",
    ()=>modelFromDict,
    "modelKey",
    ()=>modelKey,
    "modelToDict",
    ()=>modelToDict,
    "objectFromDict",
    ()=>objectFromDict,
    "objectToDict",
    ()=>objectToDict,
    "operationFromDict",
    ()=>operationFromDict,
    "operationToDict",
    ()=>operationToDict,
    "referenceFromDict",
    ()=>referenceFromDict,
    "referenceToDict",
    ()=>referenceToDict,
    "repr",
    ()=>repr,
    "signature",
    ()=>signature,
    "str",
    ()=>str,
    "targets",
    ()=>targets,
    "valueConforms",
    ()=>valueConforms
]);
const LEVELS = [
    "O2",
    "O1",
    "O0"
];
const DATA_LEVEL = "data";
const PRIMITIVES = [
    "EBoolean",
    "EInt",
    "EDouble",
    "EString"
];
const NUMERIC = [
    "EInt",
    "EDouble"
];
const INTERIM_BEHAVIOURS = [
    "suspend",
    "exclude_input",
    "keep_last_valid"
];
const DEFAULT_INTERIM = "suspend";
function valueConforms(value, etype) {
    if (etype === "EBoolean") return typeof value === "boolean";
    if (etype === "EInt") return typeof value === "number" && Number.isInteger(value);
    if (etype === "EDouble") return typeof value === "number" && Number.isFinite(value);
    if (etype === "EString") return typeof value === "string";
    return false;
}
function etypeOf(value) {
    if (typeof value === "boolean") return "EBoolean";
    if (typeof value === "number") return Number.isInteger(value) ? "EInt" : "EDouble";
    if (typeof value === "string") return "EString";
    return null;
}
function repr(value) {
    if (value === null || value === undefined) return "None";
    if (typeof value === "string") return `'${value}'`;
    if (typeof value === "boolean") return value ? "True" : "False";
    return String(value);
}
function str(value) {
    return typeof value === "string" ? value : repr(value);
}
function modelKey(model) {
    return model.level === "O1" ? `${model.name}@${model.version}` : model.name;
}
function attributeFromDict(name, data) {
    const d = typeof data === "string" ? {
        eType: data
    } : data;
    return {
        name,
        eType: d.eType,
        unit: d.unit ?? null,
        meaning: d.meaning ?? null,
        upperBound: d.upperBound ?? 1
    };
}
function attributeToDict(attribute) {
    const out = {
        eType: attribute.eType
    };
    if (attribute.unit !== null) out.unit = attribute.unit;
    if (attribute.meaning !== null) out.meaning = attribute.meaning;
    if (attribute.upperBound !== 1) out.upperBound = attribute.upperBound;
    return out;
}
function referenceFromDict(name, data) {
    const d = typeof data === "string" ? {
        eType: data
    } : data;
    return {
        name,
        eType: d.eType,
        lowerBound: d.lowerBound ?? 0,
        upperBound: d.upperBound ?? 1,
        containment: d.containment ?? false
    };
}
function referenceToDict(reference) {
    const out = {
        eType: reference.eType
    };
    if (reference.lowerBound !== 0) out.lowerBound = reference.lowerBound;
    if (reference.upperBound !== 1) out.upperBound = reference.upperBound;
    if (reference.containment) out.containment = true;
    return out;
}
function operationFromDict(name, data) {
    const d = data ?? {};
    return {
        name,
        eParameters: mapEntries(d.eParameters ?? {}, attributeFromDict),
        description: d.description ?? null
    };
}
function operationToDict(operation) {
    const out = {};
    if (operation.description !== null) out.description = operation.description;
    if (Object.keys(operation.eParameters).length) {
        out.eParameters = mapEntries(operation.eParameters, (_, a)=>attributeToDict(a));
    }
    return out;
}
function signature(operation) {
    return `${operation.name}(${Object.keys(operation.eParameters).join(", ")})`;
}
function mapEntries(input, f) {
    const out = {};
    for (const [key, value] of Object.entries(input))out[key] = f(key, value);
    return out;
}
function classFromDict(name, data) {
    const rest = {
        ...data ?? {}
    };
    const attributes = rest.eAttributes ?? {};
    const references = rest.eReferences ?? {};
    const instanceOf = rest.instanceOf ?? null;
    const operations = rest.eOperations;
    delete rest.eAttributes;
    delete rest.eReferences;
    delete rest.eOperations;
    delete rest.instanceOf;
    const eclass = {
        name,
        instanceOf,
        eAttributes: mapEntries(attributes, attributeFromDict),
        eReferences: mapEntries(references, referenceFromDict),
        properties: rest
    };
    if (operations && Object.keys(operations).length) eclass.eOperations = mapEntries(operations, operationFromDict);
    return eclass;
}
function classToDict(eclass) {
    const out = {};
    if (eclass.instanceOf) out.instanceOf = eclass.instanceOf;
    Object.assign(out, eclass.properties);
    if (Object.keys(eclass.eAttributes).length) {
        out.eAttributes = mapEntries(eclass.eAttributes, (_, a)=>attributeToDict(a));
    }
    if (Object.keys(eclass.eReferences).length) {
        out.eReferences = mapEntries(eclass.eReferences, (_, r)=>referenceToDict(r));
    }
    if (eclass.eOperations && Object.keys(eclass.eOperations).length) {
        out.eOperations = mapEntries(eclass.eOperations, (_, o)=>operationToDict(o));
    }
    return out;
}
function objectFromDict(name, data) {
    const rest = {
        ...data
    };
    const instanceOf = rest.instanceOf;
    const bindings = {
        ...rest.bindings ?? {}
    };
    delete rest.instanceOf;
    delete rest.bindings;
    return {
        name,
        instanceOf,
        bindings,
        slots: rest
    };
}
function objectToDict(obj) {
    const out = {
        instanceOf: obj.instanceOf
    };
    if (Object.keys(obj.bindings).length) out.bindings = {
        ...obj.bindings
    };
    Object.assign(out, obj.slots);
    return out;
}
function targets(obj, reference) {
    const value = obj.slots[reference];
    if (value === null || value === undefined) return [];
    return Array.isArray(value) ? [
        ...value
    ] : [
        value
    ];
}
function modelFromDict(data) {
    const level = data.level;
    if (!LEVELS.includes(level)) throw new Error(`unknown level ${repr(level)}`);
    if (level === "O0") {
        return {
            level,
            name: data.name,
            version: null,
            typedBy: data.typedBy ?? null,
            dt: data.dt ?? null,
            eClasses: {},
            objects: mapEntries(data.objects ?? {}, objectFromDict)
        };
    }
    return {
        level,
        name: data.ePackage,
        version: data.version ?? null,
        typedBy: data.typedBy ?? null,
        dt: null,
        eClasses: mapEntries(data.eClasses ?? {}, classFromDict),
        objects: {}
    };
}
function modelToDict(model) {
    const out = {
        level: model.level
    };
    if (model.level === "O0") {
        out.name = model.name;
        if (model.dt) out.dt = model.dt;
        if (model.typedBy) out.typedBy = model.typedBy;
        out.objects = mapEntries(model.objects, (_, o)=>objectToDict(o));
        return out;
    }
    out.ePackage = model.name;
    if (model.version !== null) out.version = model.version;
    if (model.typedBy) out.typedBy = model.typedBy;
    out.eClasses = mapEntries(model.eClasses, (_, c)=>classToDict(c));
    return out;
}
}),
"[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dataRef",
    ()=>dataRef,
    "formatRef",
    ()=>formatRef,
    "ownerOf",
    ()=>ownerOf,
    "parseRef",
    ()=>parseRef,
    "ref",
    ()=>ref
]);
/**
 * Element references, uniform across levels.
 *
 *   room@1#Occupancy.occupied   an attribute of an O1 class (type level)
 *   r1#occupancy.occupied       an attribute of an O0 object (instance level)
 *   r1@data#count               a runtime observation key of a DT (data level)
 *   r2                          a whole model
 */ const DATA_SUFFIX = "@data";
function parseRef(text) {
    const hash = text.indexOf("#");
    let left = hash === -1 ? text : text.slice(0, hash);
    const right = hash === -1 ? "" : text.slice(hash + 1);
    const data = left.endsWith(DATA_SUFFIX);
    if (data) left = left.slice(0, -DATA_SUFFIX.length);
    return {
        model: left,
        path: right.split(".").filter(Boolean),
        data
    };
}
function formatRef(ref) {
    const left = ref.model + (ref.data ? DATA_SUFFIX : "");
    return ref.path.length ? `${left}#${ref.path.join(".")}` : left;
}
function ownerOf(text) {
    const parsed = parseRef(text);
    return formatRef({
        ...parsed,
        path: parsed.path.slice(0, 1)
    });
}
function dataRef(model, key) {
    return formatRef({
        model,
        path: [
            key
        ],
        data: true
    });
}
function ref(model, ...path) {
    return formatRef({
        model,
        path,
        data: false
    });
}
}),
"[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "dumpYaml",
    ()=>dumpYaml,
    "loadYaml",
    ()=>loadYaml
]);
/** YAML helpers: human-readable, diffable, key order preserved. */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yaml$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/yaml/dist/index.js [app-rsc] (ecmascript)");
;
function loadYaml(text) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yaml$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parse"])(text);
}
function dumpYaml(data) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$yaml$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["stringify"])(data, {
        aliasDuplicateObjects: false,
        lineWidth: 100
    });
}
}),
"[project]/src/engine/mapping.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MappingError",
    ()=>MappingError,
    "SOURCE_NAME",
    ()=>SOURCE_NAME,
    "conditionType",
    ()=>conditionType,
    "conditionValue",
    ()=>conditionValue,
    "evaluate",
    ()=>evaluate,
    "findRule",
    ()=>findRule,
    "inferType",
    ()=>inferType,
    "namesIn",
    ()=>namesIn,
    "renameSource",
    ()=>renameSource,
    "ruleFromDict",
    ()=>ruleFromDict,
    "ruleToDict",
    ()=>ruleToDict,
    "sameExpression",
    ()=>sameExpression
]);
/**
 * Mapping expressions of correspondences and the derivation catalogue.
 *
 * A mapping derives the value expected by an initiating DT from the value a
 * participating DT provides, e.g. `count > 0`. The language is deliberately
 * small and strictly typed, so that a value can never be coerced across
 * meanings: there is no conditional, arithmetic rejects Booleans, and an
 * expression must read its source. A Boolean can therefore never become a number.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
;
const SOURCE_NAME = "value";
class MappingError extends Error {
}
const COMPARISONS = [
    ">=",
    "<=",
    "==",
    "!=",
    ">",
    "<"
];
const TOKEN = /\s*(>=|<=|==|!=|[()<>+\-*/]|\d+\.\d+|\d+|[A-Za-z_][A-Za-z_0-9]*)/y;
function tokenize(expression) {
    const tokens = [];
    TOKEN.lastIndex = 0;
    let position = 0;
    while(position < expression.length){
        if (!expression.slice(position).trim()) break;
        TOKEN.lastIndex = position;
        const match = TOKEN.exec(expression);
        if (!match) throw new MappingError(`invalid mapping ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expression)}: invalid syntax`);
        tokens.push(match[1]);
        position = TOKEN.lastIndex;
    }
    return tokens;
}
function parse(expression) {
    const tokens = tokenize(expression);
    let index = 0;
    const invalid = ()=>new MappingError(`invalid mapping ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expression)}: invalid syntax`);
    const peek = ()=>tokens[index];
    const next = ()=>tokens[index++];
    function atom() {
        const token = next();
        if (token === undefined) throw invalid();
        if (token === "(") {
            const inner = or();
            if (next() !== ")") throw invalid();
            return inner;
        }
        if (/^\d/.test(token)) return {
            kind: "const",
            value: Number(token)
        };
        if (token === "True" || token === "true") return {
            kind: "const",
            value: true
        };
        if (token === "False" || token === "false") return {
            kind: "const",
            value: false
        };
        if ([
            "and",
            "or",
            "not",
            "if",
            "else"
        ].includes(token)) throw invalid();
        if (/^[A-Za-z_]/.test(token)) return {
            kind: "name",
            id: token
        };
        throw invalid();
    }
    function unary() {
        if (peek() === "-") {
            next();
            return {
                kind: "unary",
                op: "-",
                operand: unary()
            };
        }
        return atom();
    }
    function product() {
        let left = unary();
        while(peek() === "*" || peek() === "/")left = {
            kind: "binary",
            op: next(),
            left,
            right: unary()
        };
        return left;
    }
    function sum() {
        let left = product();
        while(peek() === "+" || peek() === "-"){
            left = {
                kind: "binary",
                op: next(),
                left,
                right: product()
            };
        }
        return left;
    }
    function comparison() {
        const left = sum();
        if (!COMPARISONS.includes(peek())) return left;
        const op = next();
        const node = {
            kind: "compare",
            op,
            left,
            right: sum()
        };
        if (COMPARISONS.includes(peek())) throw new MappingError("unsupported comparison");
        return node;
    }
    function not() {
        if (peek() === "not") {
            next();
            return {
                kind: "unary",
                op: "not",
                operand: not()
            };
        }
        return comparison();
    }
    function and() {
        const values = [
            not()
        ];
        while(peek() === "and"){
            next();
            values.push(not());
        }
        return values.length === 1 ? values[0] : {
            kind: "bool",
            op: "and",
            values
        };
    }
    function or() {
        const values = [
            and()
        ];
        while(peek() === "or"){
            next();
            values.push(and());
        }
        return values.length === 1 ? values[0] : {
            kind: "bool",
            op: "or",
            values
        };
    }
    const tree = or();
    if (index < tokens.length) throw invalid();
    return tree;
}
function names(node) {
    switch(node.kind){
        case "name":
            return [
                node.id
            ];
        case "const":
            return [];
        case "unary":
            return names(node.operand);
        case "bool":
            return node.values.flatMap(names);
        default:
            return [
                ...names(node.left),
                ...names(node.right)
            ];
    }
}
function infer(node, env) {
    switch(node.kind){
        case "name":
            if (!(node.id in env)) throw new MappingError(`unknown name ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(node.id)}`);
            return env[node.id];
        case "const":
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["etypeOf"])(node.value);
        case "compare":
            {
                const left = infer(node.left, env);
                const right = infer(node.right, env);
                if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(left) && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(right)) return "EBoolean";
                if ([
                    "==",
                    "!="
                ].includes(node.op) && left === "EBoolean" && right === "EBoolean") {
                    return "EBoolean";
                }
                throw new MappingError(`cannot compare ${left} with ${right}`);
            }
        case "binary":
            {
                const left = infer(node.left, env);
                const right = infer(node.right, env);
                if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(left) || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(right)) {
                    throw new MappingError("arithmetic on a Boolean is a value coercion across meanings and is not allowed");
                }
                return node.op === "/" || left === "EDouble" || right === "EDouble" ? "EDouble" : "EInt";
            }
        case "bool":
            if (node.values.some((v)=>infer(v, env) !== "EBoolean")) {
                throw new MappingError("logical operators need Boolean operands");
            }
            return "EBoolean";
        case "unary":
            {
                const operand = infer(node.operand, env);
                if (node.op === "not" && operand === "EBoolean") return "EBoolean";
                if (node.op === "-" && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(operand)) return operand;
                throw new MappingError("unsupported unary operator");
            }
    }
}
function inferType(expression, sourceName, sourceType) {
    const node = parse(expression);
    const env = {
        [sourceName]: sourceType,
        [SOURCE_NAME]: sourceType
    };
    if (!names(node).some((name)=>name in env)) {
        throw new MappingError("a mapping must read the value provided by the participating DT");
    }
    const result = infer(node, env);
    if (sourceType === "EBoolean" && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NUMERIC"].includes(result)) {
        throw new MappingError("a Boolean cannot be mapped to a number"); // unreachable by construction
    }
    return result;
}
function evaluateNode(node, env) {
    switch(node.kind){
        case "name":
            return env[node.id];
        case "const":
            return node.value;
        case "compare":
            {
                const left = evaluateNode(node.left, env);
                const right = evaluateNode(node.right, env);
                if (node.op === ">") return left > right;
                if (node.op === ">=") return left >= right;
                if (node.op === "<") return left < right;
                if (node.op === "<=") return left <= right;
                if (node.op === "==") return left === right;
                return left !== right;
            }
        case "binary":
            {
                const left = evaluateNode(node.left, env);
                const right = evaluateNode(node.right, env);
                if (node.op === "+") return left + right;
                if (node.op === "-") return left - right;
                if (node.op === "*") return left * right;
                return left / right;
            }
        case "bool":
            {
                const values = node.values.map((v)=>evaluateNode(v, env));
                return node.op === "and" ? values.every(Boolean) : values.some(Boolean);
            }
        case "unary":
            {
                const operand = evaluateNode(node.operand, env);
                return node.op === "not" ? !operand : -operand;
            }
    }
}
function evaluate(expression, sourceName, sourceType, value) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(value, sourceType)) {
        throw new MappingError(`value ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(value)} does not conform to ${sourceType}`);
    }
    inferType(expression, sourceName, sourceType);
    return evaluateNode(parse(expression), {
        [sourceName]: value,
        [SOURCE_NAME]: value
    });
}
function namesIn(expression) {
    return [
        ...new Set(names(parse(expression)))
    ];
}
function conditionType(expression, types) {
    const node = parse(expression);
    if (!names(node).length) throw new MappingError("a condition must read a value");
    return infer(node, types);
}
function conditionValue(expression, types, values) {
    if (conditionType(expression, types) !== "EBoolean") throw new MappingError("a condition must be Boolean");
    for (const name of namesIn(expression)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(values[name], types[name])) {
            throw new MappingError(`value ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(values[name])} of ${name} does not conform to ${types[name]}`);
        }
    }
    return evaluateNode(parse(expression), values) === true;
}
function rename(node, from, to) {
    switch(node.kind){
        case "name":
            return node.id === from ? {
                kind: "name",
                id: to
            } : node;
        case "const":
            return node;
        case "unary":
            return {
                ...node,
                operand: rename(node.operand, from, to)
            };
        case "bool":
            return {
                ...node,
                values: node.values.map((v)=>rename(v, from, to))
            };
        default:
            return {
                ...node,
                left: rename(node.left, from, to),
                right: rename(node.right, from, to)
            };
    }
}
const PRECEDENCE = {
    or: 1,
    and: 2,
    not: 3,
    "*": 6,
    "/": 6
};
function precedence(node) {
    if (node.kind === "bool") return PRECEDENCE[node.op];
    if (node.kind === "unary") return node.op === "not" ? 3 : 7;
    if (node.kind === "compare") return 4;
    if (node.kind === "binary") return PRECEDENCE[node.op] ?? 5;
    return 9;
}
function unparse(node) {
    const wrap = (child, min)=>precedence(child) < min ? `(${unparse(child)})` : unparse(child);
    switch(node.kind){
        case "name":
            return node.id;
        case "const":
            return typeof node.value === "boolean" ? node.value ? "True" : "False" : String(node.value);
        case "unary":
            return node.op === "not" ? `not ${wrap(node.operand, 3)}` : `-${wrap(node.operand, 7)}`;
        case "bool":
            return node.values.map((v)=>wrap(v, precedence(node) + 1)).join(` ${node.op} `);
        default:
            {
                const own = precedence(node);
                return `${wrap(node.left, own)} ${node.op} ${wrap(node.right, own + 1)}`;
            }
    }
}
function renameSource(expression, from, to) {
    return unparse(rename(parse(expression), from, to));
}
function sameExpression(left, right, sourceName) {
    const normal = (e)=>JSON.stringify(rename(parse(e), sourceName, SOURCE_NAME));
    return normal(left) === normal(right);
}
function ruleFromDict(data) {
    return {
        source: data.from,
        target: data.to,
        expression: data.expression
    };
}
function ruleToDict(rule) {
    return {
        from: rule.source,
        to: rule.target,
        expression: rule.expression
    };
}
function findRule(rules, source, target) {
    if (!source || !target) return null;
    return rules.find((rule)=>rule.source === source && rule.target === target) ?? null;
}
}),
"[project]/src/engine/modeling/parts.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addDevice",
    ()=>addDevice,
    "addSensor",
    ()=>addSensor,
    "linkParameter",
    ()=>linkParameter,
    "linkTargets",
    ()=>linkTargets,
    "observeParameter",
    ()=>observeParameter,
    "pascal",
    ()=>pascal,
    "plainAttribute",
    ()=>plainAttribute,
    "uniqueName",
    ()=>uniqueName,
    "usersOf",
    ()=>usersOf
]);
/**
 * Describing devices in a DT model: the device, its parts, what they sense and
 * what the model observes of it. Functions that change a model in place; the
 * modeler calls them, and so does the modelling assistant when it proposes the
 * version that follows a change of the hardware.
 *
 * A kind of device or part is given as data (its settings, parameters and
 * operations): the catalogue of a connector fits, and nothing here knows which.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
;
;
function uniqueName(taken, stem) {
    const names = new Set(taken);
    if (!names.has(stem)) return stem;
    let index = 2;
    while(names.has(`${stem}${index}`))index++;
    return `${stem}${index}`;
}
const pascal = (text)=>text.split(/[_\-\s]+/).filter(Boolean).map((part)=>part[0].toUpperCase() + part.slice(1)).join("");
function conceptWith(fed, type, flag) {
    const meta = fed.models[type.typedBy ?? ""];
    return Object.values(meta?.eClasses ?? {}).find((c)=>c.properties[flag])?.name ?? null;
}
const plainAttribute = (name, eType, unit, meaning)=>({
        name,
        eType,
        unit: unit ?? null,
        meaning: meaning ?? null,
        upperBound: 1
    });
function addDevice(fed, model, connector, settings = {}) {
    const instance = fed.models[model];
    const type = fed.models[instance?.typedBy ?? ""];
    const concept = type ? conceptWith(fed, type, "device") : null;
    if (!instance || !type || !concept) return null;
    const className = `${pascal(connector.type)}Device`;
    type.eClasses[className] ??= {
        name: className,
        instanceOf: concept,
        eAttributes: Object.fromEntries([
            {
                name: "connector",
                eType: "EString"
            },
            ...connector.settings
        ].map((s)=>[
                s.name,
                plainAttribute(s.name, s.eType)
            ])),
        eReferences: {},
        properties: {}
    };
    const name = uniqueName(Object.keys(instance.objects), `${connector.type}_device`);
    const slots = {
        connector: connector.type
    };
    for (const setting of connector.settings){
        const value = settings[setting.name] ?? setting.fallback;
        if (value !== undefined && value !== "") slots[setting.name] = value;
    }
    instance.objects[name] = {
        name,
        instanceOf: className,
        bindings: {},
        slots
    };
    return name;
}
function addSensor(fed, model, device, connector, kind, uid = "", /** The observation key of a parameter, when it is already decided. */ given = {}) {
    const instance = fed.models[model];
    const type = fed.models[instance?.typedBy ?? ""];
    // a part that senses nothing only acts
    const concept = type ? (kind.parameters.length ? null : conceptWith(fed, type, "actuator")) ?? conceptWith(fed, type, "sensor") : null;
    const deviceObject = instance?.objects[device];
    if (!instance || !type || !concept || !deviceObject) return null;
    // the class of this kind of part; a class of the same name that is something else keeps its name
    const taken = type.eClasses[pascal(kind.kind)];
    const className = taken && (taken.instanceOf !== concept || !("kind" in taken.eAttributes)) ? uniqueName(Object.keys(type.eClasses), `${pascal(kind.kind)}${kind.parameters.length ? "Sensor" : "Actuator"}`) : pascal(kind.kind);
    type.eClasses[className] ??= {
        name: className,
        instanceOf: concept,
        eAttributes: Object.fromEntries([
            [
                "kind",
                plainAttribute("kind", "EString")
            ],
            ...kind.settings.map((s)=>[
                    s.name,
                    plainAttribute(s.name, s.eType)
                ]),
            ...kind.parameters.map((p)=>[
                    p.name,
                    plainAttribute(p.name, p.eType, p.unit, p.meaning)
                ])
        ]),
        eReferences: {
            device: {
                name: "device",
                eType: deviceObject.instanceOf,
                lowerBound: 1,
                upperBound: 1,
                containment: false
            }
        },
        ...kind.operations?.length ? {
            eOperations: Object.fromEntries(kind.operations.map((operation)=>[
                    operation.name,
                    {
                        name: operation.name,
                        description: operation.description,
                        eParameters: Object.fromEntries(operation.parameters.map((p)=>[
                                p.name,
                                plainAttribute(p.name, p.eType, p.unit)
                            ]))
                    }
                ]))
        } : {},
        properties: {}
    };
    // a second sensor of the same kind is told apart by its UID
    const name = kind.kind in instance.objects && uid && uid !== kind.kind ? uniqueName(Object.keys(instance.objects), `${kind.kind}_${uid}`) : uniqueName(Object.keys(instance.objects), kind.kind);
    const keys = new Set(Object.keys((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["availableKeys"])(fed, model)));
    const bindings = {};
    for (const parameter of kind.parameters){
        const key = given[parameter.name] ?? (keys.has(parameter.name) ? uniqueName(keys, `${name}_${parameter.name}`) : parameter.name);
        keys.add(key);
        bindings[parameter.name] = key;
    }
    const slots = {
        kind: kind.kind,
        device
    };
    for (const setting of kind.settings)slots[setting.name] = setting.name === "uid" ? uid : setting.fallback ?? "";
    instance.objects[name] = {
        name,
        instanceOf: className,
        bindings,
        slots
    };
    return name;
}
function usersOf(fed, model, key) {
    const instance = fed.models[model];
    const out = [];
    for (const obj of Object.values(instance?.objects ?? {})){
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(fed, instance, obj)) continue;
        for (const [attribute, bound] of Object.entries(obj.bindings))if (bound === key) out.push(`${obj.name}.${attribute}`);
    }
    return out;
}
function linkTargets(fed, model, sensor, parameter) {
    const instance = fed.models[model];
    const type = fed.models[instance?.typedBy ?? ""];
    const sensed = type?.eClasses[instance?.objects[sensor]?.instanceOf ?? ""]?.eAttributes[parameter];
    if (!instance || !type || !sensed) return [];
    const out = [];
    const sensedKeys = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["providedKeys"])(fed, model);
    for (const obj of Object.values(instance.objects)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, type, obj.instanceOf).requiresSource || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(fed, instance, obj)) continue;
        for (const attribute of Object.values(type.eClasses[obj.instanceOf]?.eAttributes ?? {})){
            if ((obj.bindings[attribute.name] ?? "") in sensedKeys) continue;
            if (attribute.eType === sensed.eType && attribute.unit === sensed.unit) out.push(`${obj.name}.${attribute.name}`);
        }
    }
    return out;
}
function linkParameter(fed, model, sensor, parameter, target) {
    const instance = fed.models[model];
    const type = fed.models[instance?.typedBy ?? ""];
    const [objectName, attribute] = target.split(".");
    const obj = instance?.objects[objectName];
    const source = instance?.objects[sensor];
    const key = source?.bindings[parameter];
    if (!instance || !type || !obj || !source || !key) return false;
    obj.bindings[attribute] = key;
    // the observation says where its data comes from, when its class can
    for (const reference of Object.values(type.eClasses[obj.instanceOf]?.eReferences ?? {})){
        if (reference.eType === source.instanceOf && reference.upperBound === 1) obj.slots[reference.name] = sensor;
    }
    return true;
}
function observeParameter(fed, model, sensor, parameter, /** How to call the class of the observation; by default after the parameter. */ called) {
    const instance = fed.models[model];
    const type = fed.models[instance?.typedBy ?? ""];
    const meta = fed.models[type?.typedBy ?? ""];
    const source = instance?.objects[sensor];
    const sensed = type?.eClasses[source?.instanceOf ?? ""]?.eAttributes[parameter];
    const concept = Object.values(meta?.eClasses ?? {}).find((c)=>c.properties.requiresSource)?.name;
    const key = source?.bindings[parameter];
    if (!instance || !type || !source || !sensed || !concept || !key) return null;
    const className = uniqueName(Object.keys(type.eClasses), called || pascal(parameter));
    type.eClasses[className] = {
        name: className,
        instanceOf: concept,
        eAttributes: {
            [parameter]: {
                ...sensed,
                name: parameter
            }
        },
        eReferences: {
            source: {
                name: "source",
                eType: source.instanceOf,
                lowerBound: 1,
                upperBound: 1,
                containment: false
            }
        },
        properties: {}
    };
    const snake = (text)=>text.replace(/(?<=[a-z0-9])(?=[A-Z])/g, "_").toLowerCase();
    const name = uniqueName(Object.keys(instance.objects), called ? snake(className) : `${parameter}_observation`);
    instance.objects[name] = {
        name,
        instanceOf: className,
        bindings: {
            [parameter]: key
        },
        slots: {
            source: sensor
        }
    };
    return name;
}
}),
"[project]/src/engine/modelset.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FILES",
    ()=>FILES,
    "applyEdit",
    ()=>applyEdit,
    "asNextVersion",
    ()=>asNextVersion,
    "assemble",
    ()=>assemble,
    "changedModels",
    ()=>changedModels,
    "evolutionName",
    ()=>evolutionName,
    "extract",
    ()=>extract,
    "gateFor",
    ()=>gateFor,
    "instanceOfModel",
    ()=>instanceOfModel,
    "linkVersions",
    ()=>linkVersions,
    "modelIds",
    ()=>modelIds,
    "modelOf",
    ()=>modelOf,
    "renamedClasses",
    ()=>renamedClasses,
    "transplant",
    ()=>transplant,
    "versionOf",
    ()=>versionOf,
    "weavingName",
    ()=>weavingName,
    "wovenBy",
    ()=>wovenBy
]);
/**
 * A repository holds one model per DT, each with its own versions. The engine
 * works on a `Federation`: this module composes it from the models and takes it
 * apart again, model by model.
 *
 * A DT model owns its O1 type (`room1@2`), its O0 instance (`room1`), the
 * capabilities its DT reports and, when it is an initiating DT, the weaving
 * model that relates it to other DTs. The shared O2 concepts are a model too.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/conformance.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$reactions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/runtime/reactions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/checks.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
;
const FILES = {
    concepts: "concepts.mlm.yaml",
    derivations: "derivations.yaml",
    type: "type.mlm.yaml",
    instance: "instance.mlm.yaml",
    capabilities: "capabilities.yaml",
    weaving: "weaving.wm.yaml",
    evolution: "evolution.wm.yaml"
};
const weavingName = (model)=>`${model}-weaving`;
const evolutionName = (model)=>`${model}-evolution`;
function modelOf(key) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(key).model.split("@")[0];
}
function load(fed, version, typeOnly) {
    for (const [file, text] of Object.entries(version.files)){
        if (file.endsWith(".mlm.yaml")) {
            const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(text));
            if (typeOnly && (model.level !== "O1" || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(model) in fed.models)) continue;
            fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(model)] = model;
        } else if (typeOnly) {
            continue;
        } else if (file.endsWith(".wm.yaml")) {
            const wm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(text));
            fed.weaving[wm.name] = wm;
        } else if (file === FILES.capabilities) {
            fed.capabilities[version.model] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(text) ?? {};
        } else if (file === FILES.derivations) {
            fed.derivations = ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(text) ?? []).map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ruleFromDict"]);
        }
    }
}
function assemble(current, history = []) {
    const fed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emptyFederation"])();
    for (const version of current)load(fed, version, false);
    for (const version of history)load(fed, version, true);
    return fed;
}
function modelIds(fed) {
    return Object.values(fed.models).filter((m)=>m.level !== "O1").map((m)=>m.name);
}
function instanceOfModel(fed, model) {
    const found = fed.models[model];
    return found && found.level === "O0" ? found : null;
}
function versionOf(fed, model) {
    const type = fed.models[instanceOfModel(fed, model)?.typedBy ?? ""];
    return type?.version ?? null;
}
function extract(fed, model) {
    const files = {};
    const found = fed.models[model];
    if (!found) return files;
    if (found.level === "O2") {
        files[FILES.concepts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(found));
        if (fed.derivations.length) files[FILES.derivations] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])(fed.derivations.map(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ruleToDict"]));
        return files;
    }
    const type = fed.models[found.typedBy ?? ""];
    if (type) files[FILES.type] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(type));
    files[FILES.instance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelToDict"])(found));
    files[FILES.capabilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])(fed.capabilities[model] ?? {});
    const weaving = fed.weaving[weavingName(model)];
    if (weaving?.links.length) files[FILES.weaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelToDict"])(weaving));
    const evolution = fed.weaving[evolutionName(model)];
    if (evolution?.links.length) files[FILES.evolution] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelToDict"])(evolution));
    return files;
}
function changedModels(before, after) {
    const ids = [
        ...new Set([
            ...modelIds(before),
            ...modelIds(after)
        ])
    ];
    return ids.filter((id)=>JSON.stringify(extract(before, id)) !== JSON.stringify(extract(after, id)));
}
function transplant(base, source, model) {
    const fed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(base);
    const from = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(source);
    if (from.models[model]?.level === "O2" || fed.models[model]?.level === "O2") {
        if (from.models[model]) fed.models[model] = from.models[model];
        fed.derivations = from.derivations;
        return fed;
    }
    for (const key of Object.keys(fed.models))if (modelOf(key) === model) delete fed.models[key];
    for (const [key, value] of Object.entries(from.models))if (modelOf(key) === model) fed.models[key] = value;
    if (model in from.capabilities) fed.capabilities[model] = from.capabilities[model];
    else delete fed.capabilities[model];
    for (const name of [
        weavingName(model),
        evolutionName(model)
    ]){
        if (from.weaving[name]) fed.weaving[name] = from.weaving[name];
        else delete fed.weaving[name];
    }
    return fed;
}
function linkVersions(fed, before, after, replaces = []) {
    const wm = fed.weaving[evolutionName(before.name)] ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodel"])(evolutionName(before.name));
    for (const key of [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(before),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(after)
    ])if (!wm.woven.includes(key)) wm.woven.push(key);
    const stem = `ev-${before.name}-${before.version}-${after.version}`;
    const add = (id, from, to)=>{
        if (!wm.links.some((link)=>link.id === id)) wm.links.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wlink"])(id, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["EVOLUTION"], {
            from,
            to
        }));
    };
    add(stem, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(before), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(after));
    for (const [old, now] of replaces)add(`${stem}-${old}`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(before), old), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(after), now));
    for (const name of Object.keys(before.eClasses)){
        if (name in after.eClasses) add(`${stem}-${name}`, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(before), name), (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(after), name));
    }
}
function renamedClasses(before, after) {
    const gone = Object.keys(before.eClasses).filter((name)=>!(name in after.eClasses));
    const fresh = Object.keys(after.eClasses).filter((name)=>!(name in before.eClasses));
    const shape = (model, name, moved)=>{
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classToDict"])(model.eClasses[name]);
        for (const reference of Object.values(data.eReferences ?? {})){
            if (typeof reference !== "string" && moved.includes(reference.eType)) reference.eType = "?";
        }
        return JSON.stringify(data);
    };
    const pairs = [];
    for (const old of gone){
        const same = (name)=>shape(after, name, fresh) === shape(before, old, gone);
        const matches = fresh.filter(same);
        const rivals = gone.filter((other)=>shape(before, other, gone) === shape(before, old, gone));
        if (matches.length === 1 && rivals.length === 1) pairs.push([
            old,
            matches[0]
        ]);
    }
    return pairs;
}
function asNextVersion(candidate, head, model, next) {
    const fed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(candidate);
    const instance = instanceOfModel(fed, model);
    const edited = fed.models[instance?.typedBy ?? ""];
    if (!instance || !edited || edited.version === next) return fed;
    const committed = head.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(edited)];
    const type = {
        ...edited,
        version: next
    };
    fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(type)] = type;
    if (committed) fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(committed)] = structuredClone(committed);
    else delete fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(edited)];
    instance.typedBy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(type);
    if (committed) {
        // The trace of the earlier versions is not the modeler's to edit: it is taken as committed.
        const trace = evolutionName(model);
        if (head.weaving[trace]) fed.weaving[trace] = structuredClone(head.weaving[trace]);
        else delete fed.weaving[trace];
        linkVersions(fed, committed, type, renamedClasses(committed, type));
    }
    return fed;
}
function gateFor(fed, model) {
    const mine = (element)=>modelOf(element) === model;
    const issues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkConformance"])(fed).filter((issue)=>mine(issue.element));
    for (const name of [
        weavingName(model),
        evolutionName(model)
    ]){
        if (fed.weaving[name]) issues.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["validateWModel"])(fed, fed.weaving[name]));
    }
    issues.push(...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$reactions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkReactions"])(fed, model));
    for (const status of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkCorrespondences"])(fed)){
        if (!mine(status.initiating) || status.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HOLDS"] || status.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"]) continue;
        issues.push({
            check: `correspondence:${status.status}`,
            element: status.correspondence || status.initiating,
            message: status.reasons.join("; ")
        });
    }
    return issues;
}
function wovenBy(fed, model) {
    const out = new Set();
    for (const link of fed.weaving[weavingName(model)]?.links ?? []){
        if (link.type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"] || !link.ends.participating) continue;
        out.add(modelOf(link.ends.participating));
    }
    return [
        ...out
    ];
}
function applyEdit(fed, model, files) {
    const out = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cloneFederation"])(fed);
    const instance = instanceOfModel(out, model);
    const current = out.models[instance?.typedBy ?? ""];
    if (!instance || !current) return out;
    if (files[FILES.type]) {
        const type = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[FILES.type]));
        out.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(current)] = {
            ...type,
            name: model,
            version: current.version
        };
    }
    if (files[FILES.instance]) {
        const edited = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[FILES.instance]));
        out.models[model] = {
            ...edited,
            name: model,
            typedBy: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelKey"])(current)
        };
    }
    if (files[FILES.weaving]) {
        const edited = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(files[FILES.weaving]));
        const wm = out.weaving[weavingName(model)] ??= (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["wmodel"])(weavingName(model));
        for (const link of edited.links){
            const index = wm.links.findIndex((known)=>known.id === link.id);
            if (index === -1) wm.links.push(link);
            else wm.links[index] = link;
        }
        for (const name of edited.woven)if (!wm.woven.includes(name)) wm.woven.push(name);
    }
    return out;
}
}),
"[project]/src/engine/munidiff.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "munidiff",
    ()=>munidiff
]);
/**
 * Differences between two versions of a model, in the Munidiff syntax
 * (A. de la Vega, "Towards an Interoperable Textual Format for Model
 * Differences Reporting", MODELS-C 2023): a unified diff whose hunks are model
 * elements instead of lines of text.
 *
 *   @@ @@
 *    room1.Occupancy:EClass {        a changed element lists only what changed,
 *   +    onDrift: suspend            the new value before the old one
 *   -    onDrift: exclude_input
 *    }
 *
 * `-->` is a reference, `*-->` a containment; an added or removed element has
 * `+` or `-` on every line. Elements are matched by qualified name. For an O0
 * object the type after the colon is the O1 class it is an instance of.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modelset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
;
;
;
const INDENT = "    ";
const attribute = (name, value)=>({
        name,
        separator: ": ",
        many: false,
        values: value === null || value === undefined ? [] : [
            String(value)
        ]
    });
const reference = (name, targets, many = false)=>({
        name,
        separator: " --> ",
        many,
        values: targets
    });
const containment = (name, parts)=>({
        name,
        separator: " *--> ",
        many: true,
        values: parts
    });
/** The label of the element a reference points to, in any model. An element
 * that no longer exists keeps the label it had in the other version. */ function labelOf(fed, other, element) {
    const parsed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(element);
    const dotted = [
        parsed.model.split("@")[0],
        ...parsed.data ? [
            "data"
        ] : [],
        ...parsed.path
    ].join(".");
    if (parsed.data) return `${dotted}:Capability`;
    const found = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, element) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(other, element);
    if (!found || !parsed.path.length) return dotted;
    if (found.attribute) return `${dotted}:EAttribute`;
    if (found.obj) return `${dotted}:${found.obj.instanceOf}`;
    return `${dotted}:EClass`;
}
function classElements(fed, model, out) {
    const meta = fed.models[model.typedBy ?? ""];
    for (const eclass of Object.values(model.eClasses)){
        const id = `${model.name}.${eclass.name}`;
        const features = [];
        if (eclass.instanceOf) {
            features.push(reference("instanceOf", [
                `${meta?.name ?? model.typedBy}.${eclass.instanceOf}:EClass`
            ]));
        }
        for (const [name, value] of Object.entries(eclass.properties))features.push(attribute(name, value));
        const attributes = Object.values(eclass.eAttributes);
        const references = Object.values(eclass.eReferences);
        if (attributes.length) {
            features.push(containment("eAttributes", attributes.map((a)=>`${id}.${a.name}:EAttribute`)));
        }
        if (references.length) {
            features.push(containment("eReferences", references.map((r)=>`${id}.${r.name}:EReference`)));
        }
        const operations = Object.values(eclass.eOperations ?? {});
        if (operations.length) {
            features.push(containment("eOperations", operations.map((o)=>`${id}.${o.name}:EOperation`)));
        }
        out.set(id, {
            label: `${id}:EClass`,
            features
        });
        for (const o of operations){
            const parameters = Object.values(o.eParameters).map((p)=>`${p.name}: ${p.eType}${p.unit ? ` [${p.unit}]` : ""}`);
            out.set(`${id}.${o.name}`, {
                label: `${id}.${o.name}:EOperation`,
                features: [
                    attribute("description", o.description),
                    {
                        name: "eParameters",
                        separator: ": ",
                        many: true,
                        values: parameters
                    }
                ]
            });
        }
        for (const a of attributes){
            out.set(`${id}.${a.name}`, {
                label: `${id}.${a.name}:EAttribute`,
                features: [
                    attribute("eType", a.eType),
                    attribute("unit", a.unit),
                    attribute("meaning", a.meaning)
                ]
            });
        }
        for (const r of references){
            out.set(`${id}.${r.name}`, {
                label: `${id}.${r.name}:EReference`,
                features: [
                    reference("eType", [
                        `${model.name}.${r.eType}:EClass`
                    ]),
                    attribute("lowerBound", r.lowerBound),
                    attribute("upperBound", r.upperBound)
                ]
            });
        }
    }
}
function flatten(prefix, value, out) {
    for (const [name, inner] of Object.entries(value))out.push(attribute(`${prefix}.${name}`, inner));
}
/** Every element of one model, by qualified name, in a stable order. */ function elementsOf(fed, other, model) {
    const out = new Map();
    const found = fed.models[model];
    if (!found) return out;
    if (found.level === "O2") {
        classElements(fed, found, out);
        for (const rule of fed.derivations){
            const id = `${model}.${rule.source}->${rule.target}`;
            out.set(id, {
                label: `${id}:Derivation`,
                features: [
                    attribute("expression", rule.expression)
                ]
            });
        }
        return out;
    }
    const instance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instanceOfModel"])(fed, model);
    const type = fed.models[instance?.typedBy ?? ""];
    if (type) classElements(fed, type, out);
    for (const obj of Object.values(instance?.objects ?? {})){
        const eclass = type?.eClasses[obj.instanceOf];
        const features = [];
        const bindings = Object.entries(obj.bindings).map(([a, key])=>`${a} <- ${key}`);
        if (bindings.length) features.push({
            name: "bindings",
            separator: ": ",
            many: true,
            values: bindings
        });
        for (const [slot, value] of Object.entries(obj.slots)){
            if (eclass && slot in eclass.eReferences) {
                const targets = (Array.isArray(value) ? value : [
                    value
                ]).map((t)=>`${model}.${t}:${instance?.objects[t]?.instanceOf ?? "?"}`);
                features.push(reference(slot, targets, eclass.eReferences[slot].upperBound !== 1));
            } else {
                features.push(attribute(slot, value));
            }
        }
        out.set(`${model}.${obj.name}`, {
            label: `${model}.${obj.name}:${obj.instanceOf}`,
            features
        });
    }
    for (const [key, capability] of Object.entries(fed.capabilities[model] ?? {})){
        const id = `${model}.data.${key}`;
        out.set(id, {
            label: `${id}:Capability`,
            features: Object.entries(capability).map(([name, value])=>attribute(name, value))
        });
    }
    for (const link of fed.weaving[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["weavingName"])(model)]?.links ?? []){
        if (link.type !== __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"]) continue;
        const features = [];
        for (const [end, element] of Object.entries(link.ends))features.push(reference(end, [
            labelOf(fed, other, element)
        ]));
        for (const [name, value] of Object.entries(link.props)){
            if (value === null || value === undefined) continue;
            if (Array.isArray(value)) {
                features.push({
                    name,
                    separator: ": ",
                    many: true,
                    values: value.map((v)=>typeof v === "object" ? Object.values(v).join(": ") : String(v))
                });
            } else if (typeof value === "object") {
                flatten(name, value, features);
            } else {
                features.push(attribute(name, value));
            }
        }
        out.set(`${model}.${link.id}`, {
            label: `${model}.${link.id}:${link.type}`,
            features
        });
    }
    return out;
}
/** Lines of a feature, without the diff prefix. */ function featureLines(feature) {
    if (!feature.many) return [
        `${INDENT}${feature.name}${feature.separator}${feature.values[0]}`
    ];
    return [
        `${INDENT}${feature.name}${feature.separator} [`,
        ...feature.values.map((value)=>`${INDENT}${INDENT}${value}`),
        `${INDENT}]`
    ];
}
/** Longest common subsequence of two lists, as index pairs. */ function common(a, b) {
    const table = Array.from({
        length: a.length + 1
    }, ()=>new Array(b.length + 1).fill(0));
    for(let i = a.length - 1; i >= 0; i--){
        for(let j = b.length - 1; j >= 0; j--){
            table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
        }
    }
    const pairs = [];
    let i = 0;
    let j = 0;
    while(i < a.length && j < b.length){
        if (a[i] === b[j]) pairs.push([
            i++,
            j++
        ]);
        else if (table[i + 1][j] >= table[i][j + 1]) i++;
        else j++;
    }
    return pairs;
}
function changedFeature(before, after) {
    const shape = after ?? before;
    const old = before?.values ?? [];
    const now = after?.values ?? [];
    if (!shape.many) {
        return [
            ...now.map((value)=>`+${INDENT}${shape.name}${shape.separator}${value}`),
            ...old.map((value)=>`-${INDENT}${shape.name}${shape.separator}${value}`)
        ];
    }
    const lines = [
        ` ${INDENT}${shape.name}${shape.separator} [`
    ];
    let i = 0;
    let j = 0;
    for (const [x, y] of [
        ...common(old, now),
        [
            old.length,
            now.length
        ]
    ]){
        for(; j < y; j++)lines.push(`+${INDENT}${INDENT}${now[j]}`);
        for(; i < x; i++)lines.push(`-${INDENT}${INDENT}${old[i]}`);
        if (x < old.length) lines.push(` ${INDENT}${INDENT}${old[x]}`);
        i = x + 1;
        j = y + 1;
    }
    lines.push(` ${INDENT}]`);
    return lines;
}
function munidiff(before, after, model, options = {}) {
    const old = elementsOf(before, after, model);
    const now = elementsOf(after, before, model);
    const hunks = [];
    for (const id of [
        ...old.keys(),
        ...[
            ...now.keys()
        ].filter((key)=>!old.has(key))
    ]){
        const a = old.get(id);
        const b = now.get(id);
        if (a && !b) {
            const body = a.features.filter((f)=>f.values.length).flatMap(featureLines);
            hunks.push([
                "@@ @@",
                `-${a.label} {`,
                ...body.map((line)=>`-${line}`),
                "-}"
            ].join("\n"));
        } else if (b && !a) {
            const body = b.features.filter((f)=>f.values.length).flatMap(featureLines);
            hunks.push([
                "@@ @@",
                `+${b.label} {`,
                ...body.map((line)=>`+${line}`),
                "+}"
            ].join("\n"));
        } else if (a && b) {
            const names = [
                ...a.features.map((f)=>f.name),
                ...b.features.map((f)=>f.name)
            ];
            const body = [];
            for (const name of [
                ...new Set(names)
            ]){
                const x = a.features.find((f)=>f.name === name);
                const y = b.features.find((f)=>f.name === name);
                if (JSON.stringify(x?.values ?? []) === JSON.stringify(y?.values ?? [])) continue;
                body.push(...changedFeature(x, y));
            }
            // an element whose type changed (an object of another class) shows both labels
            if (a.label !== b.label) hunks.push([
                "@@ @@",
                `+${b.label} {`,
                `-${a.label} {`,
                ...body,
                " }"
            ].join("\n"));
            else if (body.length) hunks.push([
                "@@ @@",
                ` ${b.label} {`,
                ...body,
                " }"
            ].join("\n"));
        }
    }
    if (!hunks.length) return "";
    return [
        `--- ${options.from ?? `${model} (before)`}`,
        `+++ ${options.to ?? `${model} (after)`}`,
        ...hunks
    ].join("\n");
}
}),
"[project]/src/engine/runtime/projection.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "project",
    ()=>project
]);
/**
 * Projection: the committed model, turned into the runtime configuration.
 *
 * The federation is regenerated from the model and never patched by hand: each
 * DT gets the observation keys it must emit, the inputs it takes from its peers
 * (with mapping and timeliness) and the state of its dependent elements.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/checks.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const STATE = {
    suspend: "suspended",
    exclude_input: "scoped",
    keep_last_valid: "last-valid"
};
function project(fed, commit = null) {
    const dts = {};
    for (const instance of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(fed)){
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance);
        const emits = [];
        for (const obj of Object.values(instance.objects)){
            const eclass = o1?.eClasses[obj.instanceOf];
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isSensor"])(fed, instance, obj)) continue; // it provides keys; what uses them is listed
            for (const [attribute, key] of Object.entries(obj.bindings)){
                const declared = eclass?.eAttributes[attribute];
                if (!declared) continue;
                const entry = {
                    key,
                    element: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, obj.name, attribute),
                    eType: declared.eType
                };
                if (declared.unit) entry.unit = declared.unit;
                emits.push(entry);
            }
        }
        dts[instance.name] = {
            dt: instance.dt || instance.name,
            type: instance.typedBy,
            roles: [],
            emits,
            inputs: [],
            dependents: []
        };
    }
    const pending = {};
    for (const name of Object.keys(dts))pending[name] = new Set();
    for (const link of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["links"])(fed, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"])){
        const initiating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(link.ends.initiating);
        if (!(initiating.model in dts)) continue;
        const entry = {
            element: link.ends.initiating,
            correspondence: link.id,
            status: "active"
        };
        if (link.props.status === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"]) {
            entry.status = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$checks$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PENDING"];
            entry.changeRequest = link.props.changeRequest ?? null;
            pending[initiating.model].add(initiating.path[0]);
        } else {
            const participating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(link.ends.participating ?? "");
            const provider = fed.models[participating.model]?.objects[participating.path[0]];
            const resolved = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, participating);
            if (!provider || !resolved?.attribute) continue; // not committable: skipped
            entry.from = participating.model;
            entry.key = provider.bindings[participating.path[1]] ?? null;
            entry.source = {
                name: participating.path[1],
                eType: resolved.attribute.eType
            };
            if (link.props.mapping) entry.mapping = link.props.mapping;
            if (link.props.timeliness) entry.timeliness = {
                ...link.props.timeliness
            };
            if (!dts[participating.model].roles.includes("participating")) {
                dts[participating.model].roles.push("participating");
            }
        }
        if (!dts[initiating.model].roles.includes("initiating")) {
            dts[initiating.model].roles.push("initiating");
        }
        dts[initiating.model].inputs.push(entry);
    }
    for (const instance of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(fed)){
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance);
        const unavailable = pending[instance.name];
        const states = {};
        let changed = true;
        while(changed){
            // propagate along the dependency links
            changed = false;
            for (const obj of Object.values(instance.objects)){
                if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, o1, obj.instanceOf).dependent) continue;
                const eclass = o1?.eClasses[obj.instanceOf];
                const used = Object.keys(eclass?.eReferences ?? {}).flatMap((r)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, r));
                const excluded = used.filter((t)=>unavailable.has(t));
                const degraded = used.filter((t)=>t in states && states[t].status !== "active");
                const behaviour = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["interimOf"])(fed, instance, obj);
                const state = {
                    element: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, obj.name),
                    class: obj.instanceOf,
                    uses: used.map((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, t)),
                    status: "active"
                };
                if (excluded.length || degraded.length) {
                    state.status = STATE[behaviour] ?? "suspended";
                    state.interim = behaviour;
                    if (excluded.length) state.excluded = excluded.map((t)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, t));
                }
                if (JSON.stringify(states[obj.name]) !== JSON.stringify(state)) {
                    states[obj.name] = state;
                    changed = true;
                }
            }
        }
        dts[instance.name].dependents = Object.values(states);
    }
    return {
        artifact: "projection",
        commit,
        dts
    };
}
}),
"[project]/src/engine/runtime/reactions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Reactions: what a DT does by itself when something it observes changes.
 *
 * A reaction is an object of a DT model whose class is of a concept marked
 * `reaction`. It refers to what it observes (`input`) and to the part of a
 * device that acts (`target`), and says when (`when`, a condition over the
 * attributes of the input, in the language of the mappings) and what
 * (`operation`, with one slot per argument).
 *
 * A reaction fires on a rising edge: when its condition was false at the last
 * reading and is true now. This module only reads the model and decides; the
 * connector of the device performs the operation.
 */ __turbopack_context__.s([
    "actorOf",
    ()=>actorOf,
    "checkReactions",
    ()=>checkReactions,
    "fire",
    ()=>fire,
    "holds",
    ()=>holds,
    "reactionsOf",
    ()=>reactionsOf
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
;
;
;
;
;
const FIXED = [
    "when",
    "operation"
];
function reactionsOf(fed, model) {
    const instance = fed.models[model];
    const type = instance?.level === "O0" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance) : null;
    if (!instance || !type) return [];
    const out = [];
    for (const obj of Object.values(instance.objects)){
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, type, obj.instanceOf).reaction) continue;
        const eclass = type.eClasses[obj.instanceOf];
        const input = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, "input")[0] ?? null;
        const observed = type.eClasses[instance.objects[input ?? ""]?.instanceOf ?? ""];
        const args = {};
        for (const name of Object.keys(eclass?.eAttributes ?? {})){
            if (!FIXED.includes(name) && name in obj.slots) args[name] = obj.slots[name];
        }
        out.push({
            model,
            id: obj.name,
            input,
            types: Object.fromEntries(Object.values(observed?.eAttributes ?? {}).map((a)=>[
                    a.name,
                    a.eType
                ])),
            when: String(obj.slots.when ?? ""),
            target: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["targets"])(obj, "target")[0] ?? null,
            operation: String(obj.slots.operation ?? ""),
            args
        });
    }
    return out;
}
function actorOf(fed, reaction) {
    for (const device of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["devicesOf"])(fed, reaction.model)){
        const part = device.sensors.find((candidate)=>candidate.id === reaction.target);
        if (part) return {
            device,
            part
        };
    }
    return null;
}
function checkReactions(fed, model) {
    const issues = [];
    for (const reaction of reactionsOf(fed, model)){
        const add = (message)=>issues.push({
                check: "reaction",
                element: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(model, reaction.id),
                message
            });
        if (!reaction.input) add("it observes nothing: set its input");
        if (!reaction.when.trim()) add("it has no condition (when)");
        else if (reaction.input) {
            try {
                const unknown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["namesIn"])(reaction.when).filter((name)=>!(name in reaction.types));
                if (unknown.length) add(`${reaction.input} has no attribute ${unknown.join(", ")}`);
                else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["conditionType"])(reaction.when, reaction.types) !== "EBoolean") {
                    add(`the condition '${reaction.when}' is not Boolean`);
                }
            } catch (error) {
                if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingError"])) throw error;
                add(`invalid condition '${reaction.when}': ${error.message}`);
            }
        }
        if (!reaction.target) {
            add("nothing acts: set its target");
            continue;
        }
        const actor = actorOf(fed, reaction);
        if (!actor) {
            add(`${reaction.target} is not a part of a device`);
            continue;
        }
        const operation = actor.part.operations.find((o)=>o.name === reaction.operation);
        if (!operation) add(`${reaction.target} has no operation '${reaction.operation}'`);
        else for (const problem of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkArguments"])(operation, reaction.args))add(problem);
    }
    return issues;
}
function holds(reaction, values) {
    if (!reaction.input || !reaction.when.trim()) return undefined;
    const read = {};
    try {
        for (const name of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["namesIn"])(reaction.when)){
            const live = values[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(reaction.model, reaction.input, name)];
            if (!live || live.error !== undefined || live.value === undefined) return undefined;
            read[name] = live.value;
        }
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["conditionValue"])(reaction.when, reaction.types, read);
    } catch (error) {
        if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingError"]) return undefined;
        throw error;
    }
}
function fire(reactions, before, now) {
    return reactions.filter((reaction)=>holds(reaction, before) === false && holds(reaction, now) === true);
}
}),
"[project]/src/engine/runtime/simulator.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Simulated runtime: just enough to emit observations, to compute what an
 * initiating DT receives, and to check timeliness.
 *
 * Timeliness is the one property of a correspondence that cannot be checked at
 * commit time: a violation observed here re-enters the process as a change.
 */ __turbopack_context__.s([
    "checkTimeliness",
    ()=>checkTimeliness,
    "emit",
    ()=>emit,
    "receive",
    ()=>receive
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
;
;
function emit(source, values, timestamp, capabilities) {
    const batch = {
        source
    };
    if (capabilities !== undefined) batch.capabilities = capabilities;
    batch.observations = Object.entries(values).map(([key, value])=>({
            key,
            value,
            timestamp
        }));
    return batch;
}
function latest(batches) {
    const out = new Map();
    for (const batch of batches){
        for (const observation of batch.observations ?? []){
            const slot = `${batch.source}\u0000${observation.key}`;
            const known = out.get(slot);
            if (!known || observation.timestamp >= known.timestamp) out.set(slot, observation);
        }
    }
    return out;
}
const slotOf = (entry)=>`${entry.from}\u0000${entry.key}`;
function receive(config, batches) {
    const seen = latest(batches);
    const values = {};
    for (const dt of Object.values(config.dts)){
        for (const entry of dt.inputs){
            const observation = seen.get(slotOf(entry));
            if (entry.status !== "active" || !observation) continue;
            let value = observation.value;
            if (entry.mapping) {
                value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["evaluate"])(entry.mapping, entry.source.name, entry.source.eType, value);
            }
            values[entry.element] = value;
        }
    }
    return values;
}
function participatingOf(config, entry) {
    for (const emitted of config.dts[entry.from].emits){
        if (emitted.key === entry.key) return emitted.element;
    }
    return entry.from;
}
function checkTimeliness(config, batches, now) {
    const seen = latest(batches);
    const violations = [];
    for (const [name, dt] of Object.entries(config.dts)){
        const observed = {};
        for (const entry of dt.inputs){
            const timeliness = entry.timeliness;
            if (entry.status !== "active" || !timeliness) continue;
            const observation = seen.get(slotOf(entry));
            const base = {
                correspondence: entry.correspondence,
                element: entry.element,
                participating: participatingOf(config, entry),
                source: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dataRef"])(entry.from, entry.key)
            };
            const age = observation ? now - observation.timestamp : null;
            const maxAge = timeliness.maxAge;
            if (maxAge !== undefined && maxAge !== null && (age === null || age > maxAge)) {
                const when = age === null ? "never observed" : `observed ${age} s ago`;
                violations.push({
                    ...base,
                    violation: "maxAge",
                    expected: {
                        maxAge
                    },
                    reason: `timeliness violated: ${base.source} ${when}, maximum age is ${maxAge} s`
                });
            } else if (observation) {
                const owner = entry.element.split("#")[1].split(".")[0];
                observed[owner] = {
                    at: observation.timestamp,
                    timeliness,
                    base
                };
            }
        }
        for (const dependent of dt.dependents){
            const used = dependent.uses.map((u)=>u.split("#")[1]);
            const together = used.filter((u)=>u in observed).map((u)=>observed[u]);
            const tolerances = together.filter((t)=>"syncTolerance" in t.timeliness).map((t)=>t.timeliness.syncTolerance);
            if (together.length < 2 || !tolerances.length) continue;
            const times = together.map((t)=>t.at);
            const spread = Math.max(...times) - Math.min(...times);
            const tolerance = Math.min(...tolerances);
            if (spread > tolerance) {
                const oldest = together.reduce((a, b)=>b.at < a.at ? b : a).base;
                violations.push({
                    ...oldest,
                    violation: "syncTolerance",
                    expected: {
                        syncTolerance: tolerance
                    },
                    reason: `timeliness violated: the inputs of ${name}#${dependent.element.split("#")[1]} ` + `were observed ${spread} s apart, tolerance is ${tolerance} s`
                });
            }
        }
    }
    return violations;
}
}),
"[project]/src/engine/weaving/checks.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AMBIGUOUS",
    ()=>AMBIGUOUS,
    "BROKEN",
    ()=>BROKEN,
    "HOLDS",
    ()=>HOLDS,
    "MISSING",
    ()=>MISSING,
    "PENDING",
    ()=>PENDING,
    "checkCorrespondences",
    ()=>checkCorrespondences,
    "correspondenceIssues",
    ()=>correspondenceIssues,
    "gate",
    ()=>gate,
    "validateWModel",
    ()=>validateWModel,
    "validateWeaving",
    ()=>validateWeaving
]);
/**
 * Checks on weaving models.
 *
 * `validateWeaving` checks the links against the weaving metamodel, including
 * the direction of each relation (peer or vertical).
 * `checkCorrespondences` is the correspondence check of the model repository:
 * the static properties (type, unit, meaning) of every correspondence, against
 * the participating element as it is now.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/conformance.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/federation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/refs.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
const HOLDS = "holds";
const BROKEN = "broken";
const MISSING = "missing";
const AMBIGUOUS = "ambiguous";
const PENDING = "pending";
// -- conformance of links to the weaving metamodel ---------------------------
function checkValue(value, etype, many) {
    if (many) return Array.isArray(value) && value.every((v)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(v, etype));
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["valueConforms"])(value, etype);
}
function checkContained(where, className, data, issues) {
    const eclass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["weavingMetamodel"])().eClasses[className];
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        issues.push({
            check: "weaving",
            element: where,
            message: `expected a ${className}`
        });
        return;
    }
    for (const [key, value] of Object.entries(data)){
        const attribute = eclass.eAttributes[key];
        if (!attribute) {
            issues.push({
                check: "weaving",
                element: where,
                message: `${className} has no attribute ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)}`
            });
        } else if (value !== null && value !== undefined && !checkValue(value, attribute.eType, attribute.upperBound !== 1)) {
            issues.push({
                check: "weaving",
                element: where,
                message: `${key}=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(value)} does not conform to ${attribute.eType}`
            });
        }
    }
}
function linkDirection(fed, link) {
    const levels = new Set(Object.values(link.ends).map((end)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["levelOf"])(fed, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(end))));
    if (levels.has(null) || levels.size === 0) return null;
    return levels.size === 1 ? "peer" : "vertical";
}
function validateWModel(fed, model) {
    const issues = [];
    const add = (element, message)=>issues.push({
            check: "weaving",
            element,
            message
        });
    const seen = new Set();
    for (const link of model.links){
        const where = `${model.name}#${link.id}`;
        if (seen.has(link.id)) add(where, "duplicate link id");
        seen.add(link.id);
        const eclass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["linkClass"])(link.type);
        if (eclass === null) {
            add(where, `unknown link type ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(link.type)}`);
            continue;
        }
        for (const [name, reference] of Object.entries(eclass.eReferences)){
            if (reference.eType === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LINK_END"]) {
                if (reference.lowerBound >= 1 && !(name in link.ends)) add(where, `end ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(name)} is required`);
                continue;
            }
            const value = link.props[name];
            if (value === null || value === undefined) continue;
            const items = reference.upperBound !== 1 ? value : [
                value
            ];
            if (!Array.isArray(items)) {
                add(where, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(name)} must be a list`);
                continue;
            }
            for (const item of items)checkContained(`${where}.${name}`, reference.eType, item, issues);
        }
        for (const [key, value] of Object.entries(link.props)){
            if (key in eclass.eReferences || value === null || value === undefined) continue;
            const attribute = eclass.eAttributes[key];
            if (!attribute) {
                add(where, `${link.type} has no feature ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(key)}`);
            } else if (!checkValue(value, attribute.eType, attribute.upperBound !== 1)) {
                add(where, `${key}=${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(value)} does not conform to ${attribute.eType}`);
            }
        }
        for (const end of Object.values(link.ends)){
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["levelOf"])(fed, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(end)) === null) add(where, `end ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(end)} refers to an unknown model`);
        }
        if (link.type === __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["REPRESENTATION"] && link.ends.entity && link.ends.dt) {
            const entity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(link.ends.entity);
            const dt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(link.ends.dt);
            const owner = fed.models[entity.model];
            if (owner && (owner.level !== "O0" || entity.path.length !== 1 || !(entity.path[0] in owner.objects))) {
                add(where, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(link.ends.entity)} is not an object of a DT model`);
            }
            if (fed.models[dt.model] && (dt.path.length || dt.data || fed.models[dt.model].level !== "O0")) {
                add(where, `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(link.ends.dt)} is not a DT model`);
            }
            if (dt.model === entity.model) add(where, "a DT does not represent an entity of its own model");
            const key = `entity:${link.ends.entity}`;
            if (seen.has(key)) add(where, `${link.ends.entity} is already represented by a DT`);
            seen.add(key);
        }
        const declared = eclass.properties.direction ?? "any";
        const expected = declared === "any" ? link.props.direction : declared;
        const actual = linkDirection(fed, link);
        if (actual !== null && expected && actual !== expected) {
            add(where, `a ${expected} relation cannot have ${actual} ends`);
        }
    }
    return issues;
}
function validateWeaving(fed) {
    return Object.values(fed.weaving).flatMap((model)=>validateWModel(fed, model));
}
function checkLink(fed, link) {
    const initiatingRef = link.ends.initiating ?? "";
    const participatingRef = link.ends.participating ?? null;
    const result = {
        status: HOLDS,
        initiating: initiatingRef,
        correspondence: link.id,
        participating: participatingRef,
        reasons: []
    };
    const initiating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, initiatingRef);
    if (initiating === null || initiating.attribute === null || initiating.obj === null) {
        result.status = BROKEN;
        result.reasons.push(`the initiating element ${initiatingRef} does not exist`);
        return result;
    }
    if (link.props.status === PENDING) {
        result.status = PENDING;
        if (!link.props.changeRequest) {
            result.status = BROKEN;
            result.reasons.push("a pending correspondence must carry a change request");
        }
        return result;
    }
    if (participatingRef === null || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(participatingRef).path.length) {
        result.status = MISSING;
        const where = participatingRef || "any participating DT";
        result.reasons.push(`no element of ${where} corresponds to ${initiatingRef}`);
        return result;
    }
    const participating = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolve"])(fed, participatingRef);
    const expects = link.props.expects ?? {};
    const participant = fed.models[(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["parseRef"])(participatingRef).model];
    if (participating !== null && participating.model.name === initiating.model.name) {
        result.reasons.push("a correspondence relates two different DTs");
    }
    // The version the correspondence was verified against. A newer version of the
    // participant is not drift in itself: it is said only next to what is wrong.
    const moved = participant && expects.typeVersion !== undefined && expects.typeVersion !== null && expects.typeVersion !== participant.typedBy ? `expects ${expects.typeVersion}, but ${participant.name} conforms to ${participant.typedBy}` : null;
    const broken = ()=>{
        if (moved) result.reasons.unshift(moved);
        result.status = BROKEN;
        return result;
    };
    if (participating === null || participating.attribute === null || participating.obj === null) {
        result.reasons.push(`the participating element ${participatingRef} no longer exists`);
        return broken();
    }
    const provided = participating.attribute;
    const expected = initiating.attribute;
    for (const name of [
        "eType",
        "unit",
        "meaning"
    ]){
        const wanted = expects[name];
        if (wanted !== undefined && wanted !== null && wanted !== provided[name]) {
            result.reasons.push(`expects ${name} ${wanted}, but ${participatingRef} has ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["str"])(provided[name])}`);
        }
    }
    if (expects.eType !== undefined && expects.eType !== null && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PRIMITIVES"].includes(expects.eType)) {
        result.reasons.push(`unknown expected eType ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expects.eType)}`);
    }
    const mapping = link.props.mapping ?? null;
    const sameMeaning = provided.meaning === expected.meaning;
    if (mapping === null) {
        if (provided.eType !== expected.eType) {
            result.reasons.push(`${participatingRef} provides ${provided.eType}, ${initiatingRef} needs ` + `${expected.eType}, and there is no mapping`);
        }
        if (provided.unit !== expected.unit) {
            result.reasons.push(`unit ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(provided.unit)} does not match the expected unit ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expected.unit)}`);
        }
        if (!sameMeaning) {
            result.reasons.push(`meaning ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(provided.meaning)} differs from ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expected.meaning)}: ` + "no value coercion across meanings");
        }
    } else {
        let valid = true;
        try {
            const derived = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["inferType"])(mapping, provided.name, provided.eType);
            if (derived !== expected.eType) {
                result.reasons.push(`the mapping yields ${derived}, ${initiatingRef} needs ${expected.eType}`);
            }
        } catch (error) {
            if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingError"])) throw error;
            valid = false;
            result.reasons.push(`invalid mapping ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(mapping)}: ${error.message}`);
        }
        if (!sameMeaning) {
            const rule = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["findRule"])(fed.derivations, provided.meaning, expected.meaning);
            if (rule === null) {
                result.reasons.push(`no admitted derivation from ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(provided.meaning)} to ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(expected.meaning)}: ` + "no value coercion across meanings");
            } else if (valid) {
                let same = true;
                try {
                    same = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sameExpression"])(mapping, rule.expression, provided.name);
                } catch (error) {
                    if (!(error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["MappingError"])) throw error;
                }
                if (!same) {
                    result.reasons.push(`the mapping differs from the admitted derivation ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["repr"])(rule.expression)}`);
                }
            }
        }
    }
    return result.reasons.length ? broken() : result;
}
function checkCorrespondences(fed) {
    const results = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["links"])(fed, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CORRESPONDENCE"]).map((link)=>checkLink(fed, link));
    const byInitiating = new Map();
    for (const result of results){
        if (result.status === HOLDS || result.status === BROKEN) {
            byInitiating.set(result.initiating, [
                ...byInitiating.get(result.initiating) ?? [],
                result
            ]);
        }
    }
    for (const [initiating, group] of byInitiating){
        if (group.length > 1) {
            const others = group.map((r)=>String(r.correspondence)).join(", ");
            for (const result of group){
                result.status = AMBIGUOUS;
                result.reasons.push(`${initiating} has several correspondences: ${others}`);
            }
        }
    }
    const covered = new Set(results.map((r)=>r.initiating));
    for (const instance of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["instances"])(fed)){
        const o1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["typeOf"])(fed, instance);
        if (o1 === null) continue;
        for (const obj of Object.values(instance.objects)){
            const eclass = o1.eClasses[obj.instanceOf];
            if (!eclass || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$federation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["classProps"])(fed, o1, eclass.name).requiresSource) continue;
            for (const attribute of Object.keys(eclass.eAttributes)){
                const element = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$refs$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ref"])(instance.name, obj.name, attribute);
                if (attribute in obj.bindings || attribute in obj.slots || covered.has(element)) continue;
                results.push({
                    status: MISSING,
                    initiating: element,
                    correspondence: null,
                    participating: null,
                    reasons: [
                        `${element} is neither bound to data nor provided by another DT`
                    ]
                });
            }
        }
    }
    return results;
}
function correspondenceIssues(fed) {
    return checkCorrespondences(fed).filter((result)=>result.status !== HOLDS && result.status !== PENDING).map((result)=>({
            check: `correspondence:${result.status}`,
            element: result.correspondence || result.initiating,
            message: result.reasons.join("; ")
        }));
}
function gate(fed) {
    return [
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkConformance"])(fed),
        ...validateWeaving(fed),
        ...correspondenceIssues(fed)
    ];
}
}),
"[project]/src/engine/weaving/metamodel.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Weaving metamodel, in the same multi-level notation as the models it weaves. */ __turbopack_context__.s([
    "WEAVING_METAMODEL_YAML",
    ()=>WEAVING_METAMODEL_YAML
]);
const WEAVING_METAMODEL_YAML = `
# Weaving metamodel, in the same multi-level notation as the models it weaves.
#
# A weaving model (WModel) holds links (WLink) whose ends (WLinkEnd) are
# element references. Every link class declares the direction of the relation:
#   peer      the ends sit at the same level (between DTs, or between versions)
#   vertical  the ends sit at different levels of the same DT
#   any       the link states its own direction
level: O2
ePackage: weaving
eClasses:
  WLinkEnd: {}

  Expectation:
    eAttributes:
      typeVersion: EString
      eType: EString
      unit: EString
      meaning: EString
      accuracy: EDouble

  Timeliness:
    eAttributes:
      maxAge: EInt
      syncTolerance: EInt

  InterimBehaviour:
    eAttributes:
      element: EString
      behaviour: EString

  # What an initiating DT expects from a participating DT.
  Correspondence:
    direction: peer
    eAttributes:
      mapping: EString
      status: EString
      changeRequest: EString
    eReferences:
      initiating: { eType: WLinkEnd, lowerBound: 1 }
      participating: { eType: WLinkEnd }
      expects: { eType: Expectation, containment: true }
      timeliness: { eType: Timeliness, containment: true }
      interim: { eType: InterimBehaviour, containment: true, upperBound: -1 }

  # An entity in the model of a DT, and the DT that is the twin of that entity:
  # how a DT states that it is made of what other DTs represent.
  Representation:
    direction: peer
    eReferences:
      entity: { eType: WLinkEnd, lowerBound: 1 }
      dt: { eType: WLinkEnd, lowerBound: 1 }

  # A type version, or one of its elements, and its successor.
  Evolution:
    direction: peer
    eReferences:
      from: { eType: WLinkEnd, lowerBound: 1 }
      to: { eType: WLinkEnd, lowerBound: 1 }

  # Inconsistency across levels of the same DT.
  VerticalDrift:
    direction: vertical
    eAttributes:
      origin: EString # bottom-up | top-down
      dt: EString
      reasons: { eType: EString, upperBound: -1 }
    eReferences:
      upper: { eType: WLinkEnd, lowerBound: 1 }
      lower: { eType: WLinkEnd, lowerBound: 1 }

  # A correspondence between DTs that no longer holds.
  HorizontalDrift:
    direction: peer
    eAttributes:
      status: EString # broken | missing | ambiguous
      correspondence: EString
      reasons: { eType: EString, upperBound: -1 }
    eReferences:
      initiating: { eType: WLinkEnd, lowerBound: 1 }
      participating: { eType: WLinkEnd }

  # A drifted element and an element it affects.
  ImpactLink:
    direction: any
    eAttributes:
      direction: EString # peer | vertical
      scope: EString # intra-dt | inter-dt
      category: EString # conformance | correspondence | dependency | left-behind
      severity: EString # high | medium | low
      via: EString
      reason: EString
      interim: EString
    eReferences:
      source: { eType: WLinkEnd, lowerBound: 1 }
      target: { eType: WLinkEnd, lowerBound: 1 }
`;
}),
"[project]/src/engine/weaving/model.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LINK_END",
    ()=>LINK_END,
    "METAMODEL_NAME",
    ()=>METAMODEL_NAME,
    "endNames",
    ()=>endNames,
    "linkById",
    ()=>linkById,
    "linkClass",
    ()=>linkClass,
    "linkFromDict",
    ()=>linkFromDict,
    "linkToDict",
    ()=>linkToDict,
    "linksOfType",
    ()=>linksOfType,
    "weavingMetamodel",
    ()=>weavingMetamodel,
    "wlink",
    ()=>wlink,
    "wmodel",
    ()=>wmodel,
    "wmodelFromDict",
    ()=>wmodelFromDict,
    "wmodelToDict",
    ()=>wmodelToDict
]);
/** Weaving models: relations between models, kept outside the woven models. */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/model.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$metamodel$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/weaving/metamodel.ts [app-rsc] (ecmascript)");
;
;
;
const LINK_END = "WLinkEnd";
const METAMODEL_NAME = "weaving";
let cached = null;
function weavingMetamodel() {
    if (cached === null) cached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$model$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["modelFromDict"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$weaving$2f$metamodel$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["WEAVING_METAMODEL_YAML"]));
    return cached;
}
function linkClass(linkType) {
    return weavingMetamodel().eClasses[linkType] ?? null;
}
function endNames(linkType) {
    const eclass = linkClass(linkType);
    if (eclass === null) return [];
    return Object.entries(eclass.eReferences).filter(([, reference])=>reference.eType === LINK_END).map(([name])=>name);
}
function wlink(id, type, ends, props = {}) {
    return {
        id,
        type,
        ends,
        props
    };
}
function wmodel(name, init = {}) {
    return {
        name,
        typedBy: METAMODEL_NAME,
        woven: [],
        links: [],
        props: {},
        ...init
    };
}
function linkFromDict(data) {
    const rest = {
        ...data
    };
    const { id, type } = rest;
    delete rest.id;
    delete rest.type;
    const ends = {};
    for (const name of endNames(type)){
        if (rest[name] !== null && rest[name] !== undefined) ends[name] = rest[name];
        delete rest[name];
    }
    return {
        id,
        type,
        ends,
        props: rest
    };
}
function linkToDict(link) {
    const out = {
        id: link.id,
        type: link.type,
        ...link.ends
    };
    for (const [key, value] of Object.entries(link.props)){
        if (value !== null && value !== undefined) out[key] = value;
    }
    return out;
}
function wmodelFromDict(data) {
    const rest = {
        ...data
    };
    const out = {
        name: rest.wModel,
        typedBy: rest.typedBy ?? METAMODEL_NAME,
        woven: [
            ...rest.woven ?? []
        ],
        links: (rest.links ?? []).map(linkFromDict),
        props: {}
    };
    for (const key of [
        "wModel",
        "typedBy",
        "woven",
        "links"
    ])delete rest[key];
    out.props = rest;
    return out;
}
function wmodelToDict(model) {
    const out = {
        wModel: model.name,
        typedBy: model.typedBy
    };
    if (model.woven.length) out.woven = [
        ...model.woven
    ];
    Object.assign(out, model.props);
    out.links = model.links.map(linkToDict);
    return out;
}
function linkById(model, id) {
    return model.links.find((link)=>link.id === id) ?? null;
}
function linksOfType(model, type) {
    return model.links.filter((link)=>link.type === type);
}
}),
"[project]/src/server/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"004984ea75aee3c2624b16e73654c431e605d4ae00":{"name":"getExamples"},"0091cdb289581606c9cd89b8898badab7e57cdd19e":{"name":"getState"},"00bb35c320a4a5476efd556c7a160c4c857bd8b1ba":{"name":"archiveLegacy"},"4088ba51c3b81d5be97231e7d436759a112df7ae0b":{"name":"discoverSensors"},"40a22edda2f2d8fd6cde2f10f9beb879fdb6474d72":{"name":"readDevices"},"6041aace9b98b890437485808c1a5c4da9eb2c0919":{"name":"restoreVersion"},"60b601fda8966d1e43b4f0da1bc13b4daf780427ef":{"name":"initRepository"},"60e5436603b41702764da7bb06985ce73cabc4d21f":{"name":"getVersion"},"70a7bd85790da1911c051bb9adead5fc614db4e96b":{"name":"decide"},"7877d470e09f02d5dad37d8d82688c1cf65525b048":{"name":"invoke"}},"src/server/actions.ts",""] */ __turbopack_context__.s([
    "archiveLegacy",
    ()=>archiveLegacy,
    "decide",
    ()=>decide,
    "discoverSensors",
    ()=>discoverSensors,
    "getExamples",
    ()=>getExamples,
    "getState",
    ()=>getState,
    "getVersion",
    ()=>getVersion,
    "initRepository",
    ()=>initRepository,
    "invoke",
    ()=>invoke,
    "readDevices",
    ()=>readDevices,
    "restoreVersion",
    ()=>restoreVersion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/adaptation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/connectors/index.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/repository.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$settle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/settle.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const repoPath = ()=>process.env.FMDDT_REPO ?? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "model-repo");
const scenarios = ()=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "scenarios");
function stateOf(repo) {
    const models = repo.models();
    return {
        path: repo.root,
        initialized: models.length > 0,
        legacy: repo.isLegacy(),
        models,
        versions: repo.versions(),
        infos: models.flatMap((model)=>repo.history(model))
    };
}
function failure(error) {
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GateError"]) {
        return {
            ok: false,
            error: "the model does not pass its checks",
            issues: error.issues
        };
    }
    if (error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"]) return {
        ok: false,
        error: error.message
    };
    return {
        ok: false,
        error: error instanceof Error ? error.message : String(error)
    };
}
async function getState() {
    return stateOf(new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath()));
}
const subdirs = (dir)=>__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir) ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir, {
        withFileTypes: true
    }).filter((e)=>e.isDirectory()).map((e)=>e.name) : [];
async function getExamples() {
    const examples = {
        baselines: [],
        batches: [],
        edits: []
    };
    for (const scenario of subdirs(scenarios())){
        const root = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(scenarios(), scenario);
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "models"))) continue;
        examples.baselines.push({
            scenario,
            variant: null
        });
        for (const variant of subdirs(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, "variants")))examples.baselines.push({
            scenario,
            variant
        });
        for (const step of subdirs(root)){
            const dir = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(root, step);
            for (const [file, text] of Object.entries((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readDir"])(dir))){
                if (file.startsWith("observations")) examples.batches.push({
                    name: `${scenario}/${step}/${file}`,
                    text
                });
            }
            for (const model of subdirs(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, "edit"))){
                examples.edits.push({
                    name: `${scenario}/${step}`,
                    model,
                    files: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readDir"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, "edit", model))
                });
            }
        }
    }
    return examples;
}
async function initRepository(scenario, variant) {
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath());
    if (repo.isRepository()) return {
        ok: false,
        error: "the repository already has models"
    };
    if (repo.isLegacy()) return {
        ok: false,
        error: "archive the repository of the earlier format first"
    };
    if (!subdirs(scenarios()).includes(scenario)) return {
        ok: false,
        error: "unknown scenario"
    };
    try {
        const models = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readModels"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(scenarios(), scenario, "models"));
        if (variant) {
            if (!subdirs(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(scenarios(), scenario, "variants")).includes(variant)) {
                return {
                    ok: false,
                    error: "unknown variant"
                };
            }
            for (const over of (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readModels"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(scenarios(), scenario, "variants", variant))){
                const target = models.find((m)=>m.model === over.model);
                if (target) Object.assign(target.files, over.files);
            }
        }
        repo.init(models);
        return {
            ok: true,
            version: 1,
            state: stateOf(repo)
        };
    } catch (error) {
        return failure(error);
    }
}
async function archiveLegacy() {
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath());
    if (!repo.isLegacy()) return {
        ok: false,
        error: "there is nothing to archive"
    };
    let index = 1;
    while(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(`${repo.root}-archived-${index}`))index++;
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].renameSync(repo.root, `${repo.root}-archived-${index}`);
    return {
        ok: true,
        version: null,
        state: stateOf(repo)
    };
}
async function getVersion(model, version) {
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath());
    return {
        info: repo.info(model, version),
        process: repo.processFiles(model, version),
        changes: repo.changes(model, version)
    };
}
async function readDevices(devices) {
    const readings = await Promise.all(devices.map((device)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["readDevice"])(device)));
    return readings.flat();
}
async function discoverSensors(device) {
    try {
        return {
            ok: true,
            found: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["discoverDevice"])(device)
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
async function invoke(device, part, operation, args) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["invokeOperation"])(device, part, operation, args);
        return {
            ok: true
        };
    } catch (error) {
        return {
            ok: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
async function restoreVersion(model, version) {
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath());
    try {
        if (!repo.models().includes(model)) return {
            ok: false,
            error: `unknown model ${model}`
        };
        repo.restore(model, version);
        repo.writeProjection();
        return {
            ok: true,
            version,
            state: stateOf(repo)
        };
    } catch (error) {
        return failure(error);
    }
}
async function decide(focus, trigger, decision) {
    const repo = new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$repository$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Repository"](repoPath());
    try {
        if (!repo.models().includes(focus)) return {
            ok: false,
            error: `unknown model ${focus}`
        };
        const version = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$settle$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["settle"])(repo, focus, trigger, decision);
        return {
            ok: true,
            version,
            state: stateOf(repo)
        };
    } catch (error) {
        return failure(error);
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getState,
    getExamples,
    initRepository,
    archiveLegacy,
    getVersion,
    readDevices,
    discoverSensors,
    invoke,
    restoreVersion,
    decide
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getState, "0091cdb289581606c9cd89b8898badab7e57cdd19e", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getExamples, "004984ea75aee3c2624b16e73654c431e605d4ae00", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(initRepository, "60b601fda8966d1e43b4f0da1bc13b4daf780427ef", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(archiveLegacy, "00bb35c320a4a5476efd556c7a160c4c857bd8b1ba", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getVersion, "60e5436603b41702764da7bb06985ce73cabc4d21f", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(readDevices, "40a22edda2f2d8fd6cde2f10f9beb879fdb6474d72", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(discoverSensors, "4088ba51c3b81d5be97231e7d436759a112df7ae0b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(invoke, "7877d470e09f02d5dad37d8d82688c1cf65525b048", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(restoreVersion, "6041aace9b98b890437485808c1a5c4da9eb2c0919", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(decide, "70a7bd85790da1911c051bb9adead5fc614db4e96b", null);
}),
"[project]/src/server/connectors/index.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectors",
    ()=>connectors,
    "discoverDevice",
    ()=>discoverDevice,
    "invokeOperation",
    ()=>invokeOperation,
    "readDevice",
    ()=>readDevice
]);
/**
 * The connectors the platform can use, by the `connector` setting of a device.
 * Adding a kind of device takes its description in `src/connectors/catalogue.ts`
 * and its driver here.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/devices.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$simulated$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/connectors/simulated.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$tinkerforge$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/connectors/tinkerforge.ts [app-rsc] (ecmascript)");
;
;
;
const connectors = {
    simulated: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$simulated$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["simulated"],
    tinkerforge: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$connectors$2f$tinkerforge$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tinkerforgeConnector"])(async ()=>(await __turbopack_context__.A("[externals]/tinkerforge [external] (tinkerforge, cjs, [project]/node_modules/tinkerforge, async loader)")).default)
};
const all = (device, error)=>device.sensors.flatMap((sensor)=>sensor.parameters.map((parameter)=>({
                sensor: sensor.id,
                parameter: parameter.name,
                key: parameter.key,
                error
            })));
async function readDevice(device, known = connectors) {
    const connector = known[device.connector];
    if (!connector) return all(device, `no connector of type '${device.connector}'`);
    try {
        return await connector.read(device);
    } catch (error) {
        return all(device, error instanceof Error ? error.message : String(error));
    }
}
async function discoverDevice(device, known = connectors) {
    const connector = known[device.connector];
    if (!connector) throw new Error(`no connector of type '${device.connector}'`);
    if (!connector.discover) throw new Error(`a ${device.connector} device cannot list its sensors`);
    return connector.discover(device);
}
async function invokeOperation(device, partId, operation, args, known = connectors) {
    const connector = known[device.connector];
    if (!connector) throw new Error(`no connector of type '${device.connector}'`);
    if (!connector.invoke) throw new Error(`a ${device.connector} device takes no actions`);
    const part = device.sensors.find((sensor)=>sensor.id === partId);
    if (!part) throw new Error(`${device.id} has no part ${partId}`);
    const declared = part.operations.find((o)=>o.name === operation);
    if (!declared) throw new Error(`${partId} has no operation ${operation}`);
    const problems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$devices$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["checkArguments"])(declared, args);
    if (problems.length) throw new Error(problems.join("; "));
    await connector.invoke(device, part, operation, args);
}
}),
"[project]/src/server/connectors/simulated.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "simulated",
    ()=>simulated,
    "simulatedCalls",
    ()=>simulatedCalls
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/connectors/catalogue.ts [app-rsc] (ecmascript)");
;
const DEFAULT = {
    EBoolean: true,
    EInt: 2,
    EDouble: 21.5,
    EString: ""
};
function parse(text, etype) {
    if (etype === "EBoolean") return text.trim().toLowerCase() === "true";
    if (etype === "EInt") return Math.trunc(Number(text));
    if (etype === "EDouble") return Number(text);
    return text;
}
/** What simulated parts were asked to do: the state of a switch, the calls a buzzer got. */ const state = new Map();
const simulatedCalls = [];
const slot = (device, part)=>`${device.model}#${device.id}#${part}`;
const simulated = {
    type: "simulated",
    async read (device) {
        return device.sensors.flatMap((sensor)=>{
            const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sensorKind"])("simulated", sensor.kind);
            const wanted = String(sensor.settings.value ?? "").trim();
            return sensor.parameters.map((parameter)=>{
                const base = {
                    sensor: sensor.id,
                    parameter: parameter.name,
                    key: parameter.key
                };
                if (!known) return {
                    ...base,
                    error: `unknown kind of sensor '${sensor.kind}'`
                };
                if (!known.parameters.some((p)=>p.name === parameter.name)) {
                    return {
                        ...base,
                        error: `a ${sensor.kind} has no parameter '${parameter.name}'`
                    };
                }
                if (wanted === "fail") return {
                    ...base,
                    error: "the sensor does not answer"
                };
                if (sensor.kind === "switch") return {
                    ...base,
                    value: state.get(slot(device, sensor.id)) ?? false
                };
                return {
                    ...base,
                    value: wanted ? parse(wanted, parameter.eType) : DEFAULT[parameter.eType]
                };
            });
        });
    },
    async invoke (device, part, operation, args) {
        const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sensorKind"])("simulated", part.kind)?.operations?.find((o)=>o.name === operation);
        if (!known) throw new Error(`a ${part.kind} cannot ${operation}`);
        if (String(part.settings.value ?? "") === "fail") throw new Error("the device does not answer");
        simulatedCalls.push({
            part: part.id,
            operation,
            args
        });
        if (part.kind === "switch") state.set(slot(device, part.id), args.on);
    },
    /** The parts of the model, and one part of every kind of the catalogue: a simulated device has them all. */ async discover (device) {
        const modelled = device.sensors.map((sensor)=>({
                kind: sensor.kind,
                uid: sensor.uid || sensor.id,
                label: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sensorKind"])("simulated", sensor.kind)?.label ?? sensor.kind
            }));
        const offered = ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connectorInfo"])("simulated")?.sensors ?? []).map((kind)=>({
                kind: kind.kind,
                uid: kind.kind,
                label: kind.label
            })).filter((part)=>!modelled.some((known)=>known.uid === part.uid));
        return [
            ...modelled,
            ...offered
        ];
    }
};
}),
"[project]/src/server/connectors/tinkerforge.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "tinkerforgeConnector",
    ()=>tinkerforgeConnector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/connectors/catalogue.ts [app-rsc] (ecmascript)");
;
const ERRORS = {
    11: "already connected",
    12: "not connected",
    13: "the Brick Daemon cannot be reached",
    21: "the Bricklet does not know this function",
    31: "the Bricklet does not answer (timeout): check that it is plugged in and its UID",
    41: "invalid parameter",
    42: "function not supported",
    81: "the UID belongs to another kind of Bricklet",
    82: "the Bricklet was replaced"
};
const describe = (code)=>ERRORS[Number(code)] ?? `Tinkerforge error ${String(code)}`;
const WAIT = 4000;
/** What the bindings call a device they know, by its identifier. */ function nameOf(library, identifier) {
    for (const candidate of Object.values(library)){
        if (typeof candidate !== "function") continue;
        const device = candidate;
        if (device.DEVICE_IDENTIFIER === identifier && device.DEVICE_DISPLAY_NAME) return device.DEVICE_DISPLAY_NAME;
    }
    return null;
}
function connect(library, device) {
    const host = String(device.settings.host ?? "localhost");
    const port = Number(device.settings.port ?? 4223);
    const connection = new library.IPConnection();
    connection.setAutoReconnect?.(false);
    connection.setTimeout?.(2500);
    return new Promise((resolve, reject)=>{
        const timer = setTimeout(()=>{
            connection.disconnect(()=>undefined);
            reject(new Error(`no Brick Daemon answers at ${host}:${port}`));
        }, WAIT);
        connection.on(library.IPConnection.CALLBACK_CONNECTED, ()=>{
            clearTimeout(timer);
            resolve(connection);
        });
        connection.connect(host, port, (code)=>{
            clearTimeout(timer);
            reject(new Error(`${describe(code)} (${host}:${port})`));
        });
    });
}
/** Call a function of the bindings; resolves with everything it returns. */ function call(bricklet, name, args = []) {
    return new Promise((resolve, reject)=>{
        if (typeof bricklet[name] !== "function") reject(new Error(`the bindings have no ${name}`));
        else {
            bricklet[name](...args, (...values)=>resolve(values), (code)=>reject(new Error(describe(code))));
        }
    });
}
// -- parameters a single call of the bindings cannot give ---------------------
const NFC_SIMPLE = 4; // BrickletNFC.MODE_SIMPLE: the Bricklet reads tag IDs by itself
const NFC_SLOTS = 8; // "Up to eight tags are saved"
const TAP_GAP = 3000; // sightings of a tag closer than this are one tap
/** What the NFC tap counters know; kept while the server runs. */ const counters = new Map();
const counterKey = (device, uid)=>`${String(device.settings.host ?? "localhost")}:${String(device.settings.port ?? 4223)}:${uid}`;
/**
 * People inside, estimated from the taps on an NFC Bricklet in Simple mode: the
 * Bricklet lists the tags it saw with the time since it last saw each. A tag
 * seen again after a pause is a new tap, and a tap moves its tag in or out.
 * What the Bricklet already lists when counting starts is not a tap.
 */ async function nfcTapCount(bricklet, counter, now) {
    const [mode] = await call(bricklet, "getMode");
    if (mode !== NFC_SIMPLE) await call(bricklet, "setMode", [
        NFC_SIMPLE
    ]);
    for(let index = 0; index < NFC_SLOTS; index++){
        let entry;
        try {
            entry = await call(bricklet, "simpleGetTagID", [
                index
            ]);
        } catch  {
            break; // the Bricklet is still getting ready for this mode: nothing to count yet
        }
        const [, id, lastSeen] = entry;
        if (!Array.isArray(id) || id.length === 0) continue;
        const tag = id.join(":");
        const sighting = now - Number(lastSeen);
        const known = counter.tags.get(tag);
        if (!counter.started) counter.tags.set(tag, {
            inside: false,
            last: sighting
        });
        else if (!known) counter.tags.set(tag, {
            inside: true,
            last: sighting
        });
        else if (sighting > known.last + TAP_GAP) {
            known.inside = !known.inside;
            known.last = sighting;
        } else known.last = Math.max(known.last, sighting);
    }
    counter.started = true;
    return [
        ...counter.tags.values()
    ].filter((tag)=>tag.inside).length;
}
function tinkerforgeConnector(load, clock = Date.now) {
    return {
        type: "tinkerforge",
        async read (device) {
            const all = device.sensors.flatMap((sensor)=>sensor.parameters.map((parameter)=>({
                        sensor: sensor.id,
                        parameter: parameter.name,
                        key: parameter.key
                    })));
            let library;
            let connection;
            try {
                library = await load();
                connection = await connect(library, device);
            } catch (error) {
                const reason = error instanceof Error ? error.message : String(error);
                return all.map((reading)=>({
                        ...reading,
                        error: reason
                    }));
            }
            const readings = [];
            try {
                for (const sensor of device.sensors){
                    const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sensorKind"])("tinkerforge", sensor.kind);
                    const BrickletOf = known ? library[String(known.driver?.className)] : undefined;
                    const bricklet = known && BrickletOf && sensor.uid ? new BrickletOf(sensor.uid, connection) : null;
                    for (const parameter of sensor.parameters){
                        const base = {
                            sensor: sensor.id,
                            parameter: parameter.name,
                            key: parameter.key
                        };
                        const how = known?.parameters.find((p)=>p.name === parameter.name)?.driver;
                        if (!known) readings.push({
                            ...base,
                            error: `unknown kind of Bricklet '${sensor.kind}'`
                        });
                        else if (!sensor.uid) readings.push({
                            ...base,
                            error: "the sensor has no UID"
                        });
                        else if (!bricklet) readings.push({
                            ...base,
                            error: `the bindings have no ${known.driver?.className}`
                        });
                        else if (!how) readings.push({
                            ...base,
                            error: `a ${sensor.kind} has no parameter '${parameter.name}'`
                        });
                        else {
                            try {
                                if (how.reader === "nfcTapCount") {
                                    const slot = counterKey(device, sensor.uid);
                                    if (!counters.has(slot)) counters.set(slot, {
                                        started: false,
                                        tags: new Map()
                                    });
                                    readings.push({
                                        ...base,
                                        value: await nfcTapCount(bricklet, counters.get(slot), clock())
                                    });
                                    continue;
                                }
                                const returned = await call(bricklet, String(how.getter));
                                const raw = returned[typeof how.index === "number" ? how.index : 0];
                                const value = how.equals !== undefined ? raw === how.equals : parameter.eType === "EBoolean" ? raw === true || raw === 1 : typeof how.scale === "number" ? Math.round(Number(raw) * how.scale * 1000) / 1000 : Number(raw);
                                readings.push({
                                    ...base,
                                    value
                                });
                            } catch (error) {
                                readings.push({
                                    ...base,
                                    error: error instanceof Error ? error.message : String(error)
                                });
                            }
                        }
                    }
                }
            } finally{
                connection.disconnect(()=>undefined);
            }
            return readings;
        },
        async invoke (device, part, operation, args) {
            const known = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["sensorKind"])("tinkerforge", part.kind);
            const how = known?.operations?.find((o)=>o.name === operation);
            if (!known) throw new Error(`unknown kind of Bricklet '${part.kind}'`);
            if (!part.uid) throw new Error("the part has no UID");
            if (how?.driver?.special === "nfcReset") {
                counters.get(counterKey(device, part.uid))?.tags.forEach((tag)=>tag.inside = false);
                return;
            }
            if (!how?.driver?.setter) throw new Error(`a ${part.kind} cannot ${operation}`);
            // the device takes the arguments in the order the catalogue gives them
            const ordered = how.parameters.map((p)=>{
                const value = args[p.name];
                if (typeof value === "number" && (p.min !== undefined && value < p.min || p.max !== undefined && value > p.max)) {
                    throw new Error(`${p.name} must be between ${p.min} and ${p.max}`);
                }
                return value;
            });
            const library = await load();
            const BrickletOf = library[String(known.driver?.className)];
            if (!BrickletOf) throw new Error(`the bindings have no ${known.driver?.className}`);
            const connection = await connect(library, device);
            try {
                const bricklet = new BrickletOf(part.uid, connection);
                // ask the Bricklet to confirm, so that an action that did not arrive is an error
                bricklet.setResponseExpectedAll?.(true);
                await call(bricklet, String(how.driver.setter), ordered);
            } finally{
                connection.disconnect(()=>undefined);
            }
        },
        async discover (device) {
            const library = await load();
            const connection = await connect(library, device);
            const found = new Map();
            const kinds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$connectors$2f$catalogue$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["connectorInfo"])("tinkerforge")?.sensors ?? [];
            try {
                connection.on(library.IPConnection.CALLBACK_ENUMERATE, (uid, _parent, _position, _hardware, _firmware, id, type)=>{
                    if (type === library.IPConnection.ENUMERATION_TYPE_DISCONNECTED) return;
                    const known = kinds.find((kind)=>kind.driver?.identifier === id);
                    found.set(String(uid), {
                        kind: known?.kind ?? null,
                        uid: String(uid),
                        label: known?.label ?? nameOf(library, id) ?? `device identifier ${String(id)}`
                    });
                });
                connection.enumerate();
                await new Promise((resolve)=>setTimeout(resolve, 800));
            } finally{
                connection.disconnect(()=>undefined);
            }
            return [
                ...found.values()
            ];
        }
    };
}
}),
"[project]/src/server/repository.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GateError",
    ()=>GateError,
    "Repository",
    ()=>Repository,
    "readDir",
    ()=>readDir,
    "readModels",
    ()=>readModels
]);
/**
 * Model repository on disk: one model per DT, each with its own versions.
 *
 *   <root>/repository.yaml                 the models, in order
 *   <root>/<model>/HEAD                    its current version
 *   <root>/<model>/versions/0002/          the files of that version
 *       version.yaml                       parent, message, and the version the
 *                                          other models were at (its context)
 *       changes.munidiff                   what changed since the parent
 *       process/                           the artifacts and the decision behind it
 *
 * A model is committed on its own, after passing its own gate.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs [external] (node:fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/engine/assistant/session.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/conformance.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/modelset.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$munidiff$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/munidiff.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/runtime/projection.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
class GateError extends Error {
    issues;
    constructor(issues){
        super("commit rejected:\n" + issues.map((issue)=>`  ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$conformance$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["issueText"])(issue)}`).join("\n")), this.issues = issues;
    }
}
const META = "version.yaml";
const CHANGES = "changes.munidiff";
const tag = (version)=>String(version).padStart(4, "0");
function readDir(dir) {
    const files = {};
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) return files;
    for (const entry of __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir, {
        withFileTypes: true
    })){
        if (entry.isFile() && entry.name.endsWith(".yaml")) {
            files[entry.name] = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, entry.name), "utf8");
        }
    }
    return files;
}
function writeDir(dir, files) {
    __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].mkdirSync(dir, {
        recursive: true
    });
    for (const [name, text] of Object.entries(files))__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, name), text, "utf8");
}
function readModels(dir) {
    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(dir)) throw new Error(`model directory not found: ${dir}`);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readdirSync(dir, {
        withFileTypes: true
    }).filter((entry)=>entry.isDirectory()).map((entry)=>({
            model: entry.name,
            version: 1,
            files: readDir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, entry.name))
        })).filter((model)=>Object.keys(model.files).length > 0);
}
class Repository {
    root;
    constructor(root){
        this.root = root;
    }
    /** A repository of the earlier format: one global history for all the models. */ isLegacy() {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, "HEAD")) && __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, "commits"));
    }
    models() {
        const index = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, "repository.yaml");
        if (!__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(index)) return [];
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(index, "utf8"))?.models ?? [];
    }
    isRepository() {
        return this.models().length > 0;
    }
    head(model) {
        const marker = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, model, "HEAD");
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(marker) ? Number(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(marker, "utf8").trim()) : null;
    }
    versionDir(model, version) {
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, model, "versions", tag(version));
    }
    info(model, version) {
        const dir = this.versionDir(model, version);
        const data = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadYaml"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, META), "utf8"));
        return {
            model,
            id: data.id,
            parent: data.parent ?? null,
            message: data.message,
            context: data.context ?? {},
            hasProcess: __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, "process"))
        };
    }
    history(model) {
        return Array.from({
            length: this.head(model) ?? 0
        }, (_, index)=>this.info(model, index + 1));
    }
    read(model, version) {
        const files = readDir(this.versionDir(model, version));
        delete files[META];
        return {
            model,
            version,
            files,
            context: this.info(model, version).context
        };
    }
    /** Every version of every model. */ versions() {
        return this.models().flatMap((model)=>Array.from({
                length: this.head(model) ?? 0
            }, (_, index)=>this.read(model, index + 1)));
    }
    /** The modeling layer at the current version of every model. */ federation() {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["headFederation"])(this.versions());
    }
    /**
   * Commit `model` as it is in `candidate`, as its next version. The model must
   * pass its gate; the other models are not touched.
   */ commit(model, candidate, message, process) {
        const versions = this.versions();
        const parent = this.head(model);
        const next = (parent ?? 0) + 1;
        const head = parent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["headFederation"])(versions) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assemble"])([]);
        const fed = parent ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["asNextVersion"])(candidate, head, model, next) : candidate;
        const issues = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["gateFor"])(fed, model);
        if (issues.length) throw new GateError(issues);
        const dir = this.versionDir(model, next);
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(dir, {
            recursive: true,
            force: true
        }); // what a restore interrupted half-way left behind
        const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["headsOf"])(versions);
        delete context[model];
        writeDir(dir, (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extract"])(fed, model));
        writeDir(dir, {
            [META]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])({
                id: next,
                parent,
                message,
                context
            })
        });
        const changes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$munidiff$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["munidiff"])(head, fed, model, {
            from: parent ? `${model}/versions/${tag(parent)}` : "/dev/null",
            to: `${model}/versions/${tag(next)}`
        });
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, CHANGES), changes, "utf8");
        if (process) writeDir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(dir, "process"), process);
        const known = this.models();
        if (!known.includes(model)) {
            writeDir(this.root, {
                "repository.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])({
                    models: [
                        ...known,
                        model
                    ]
                })
            });
        }
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, model, "HEAD"), `${next}\n`);
        return next;
    }
    /**
   * Make an earlier version of `model` its current one again and remove the
   * versions after it. Refused while a version of another model was committed
   * against one of them: that model goes back first. Returns what was removed.
   */ restore(model, target) {
        const head = this.head(model);
        if (head === null) throw new Error(`unknown model ${model}`);
        if (!Number.isInteger(target) || target < 1 || target >= head) {
            throw new Error(`${model} has no version ${target} before its current one`);
        }
        const blockers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["restoreBlockers"])(this.versions(), model, target);
        if (blockers.length) {
            throw new Error(blockers.map((b)=>`${b.model} v${b.version} was committed against ${model} v${b.against}: restore ${b.model} first`).join("; "));
        }
        // HEAD first: the versions after it are no longer part of the model whatever happens next.
        __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].writeFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, model, "HEAD"), `${target}\n`);
        const removed = [];
        for(let version = target + 1; version <= head; version++){
            __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].rmSync(this.versionDir(model, version), {
                recursive: true,
                force: true
            });
            removed.push(version);
        }
        return removed;
    }
    /** First version of every model of a set; a model that weaves others comes after them. */ init(models) {
        const fed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$modelset$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["assemble"])(models);
        const rank = (m)=>"concepts.mlm.yaml" in m.files ? 0 : "weaving.wm.yaml" in m.files ? 2 : 1;
        for (const model of [
            ...models
        ].sort((a, b)=>rank(a) - rank(b))){
            this.commit(model.model, fed, "initial model");
        }
        this.writeProjection();
    }
    processFiles(model, version) {
        return readDir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.versionDir(model, version), "process"));
    }
    changes(model, version) {
        const file = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.versionDir(model, version), CHANGES);
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].existsSync(file) ? __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs__$5b$external$5d$__$28$node$3a$fs$2c$__cjs$29$__["default"].readFileSync(file, "utf8") : "";
    }
    writeProjection() {
        const target = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(this.root, "runtime");
        writeDir(target, {
            "config.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$runtime$2f$projection$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["project"])(this.federation()))
        });
        return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(target, "config.yaml");
    }
}
}),
"[project]/src/server/settle.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "settle",
    ()=>settle
]);
/**
 * The model-first loop on the server, for the model a modeler has open: run
 * the process on the trigger against the current versions, apply the decision,
 * commit that model as its next version. Only this commits.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/adaptation.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/assistant/process.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/engine/assistant/session.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/engine/kernel/yaml.ts [app-rsc] (ecmascript)");
;
;
;
;
const MESSAGE = {
    edit: "model edit",
    observations: "evolution after a runtime observation",
    timeliness: "change request after a timeliness violation",
    incoming: "adaptation to the models it weaves",
    request: "change requested by another DT"
};
function settle(repo, focus, trigger, decision) {
    if (trigger.kind === "observations" && trigger.batch.source !== focus) {
        throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"](`the observations come from ${trigger.batch.source}, not from ${focus}`);
    }
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$session$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["runTrigger"])(repo.versions(), focus, trigger);
    if (!result) throw new __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$adaptation$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PlanError"]("there is nothing to decide");
    const model = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["resolveDecision"])(result.candidate, result.plan, decision, focus);
    if (model === null) return null;
    const version = repo.commit(focus, model, decision.message || MESSAGE[trigger.kind], {
        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["artifactsOf"])(result),
        "5-decision.yaml": (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$kernel$2f$yaml$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["dumpYaml"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$engine$2f$assistant$2f$process$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["decisionToDict"])(decision))
    });
    repo.writeProjection();
    return version;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__10p60bl6cw2y-._.js.map