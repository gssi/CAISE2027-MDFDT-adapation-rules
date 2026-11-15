/**
 * What the connectors can reach, as data: the settings of a device and, for
 * every kind of sensor, the parameters it senses. The modeler builds classes
 * from this, and a connector reads by it. Nothing here touches hardware, so the
 * browser can use it too.
 *
 * To support another kind of device, describe it here and register its driver
 * in `src/server/connectors/index.ts`.
 */

export interface SettingInfo {
  name: string;
  eType: string;
  fallback?: string | number | boolean;
  description: string;
}

export interface ParameterInfo {
  name: string;
  eType: string;
  unit?: string;
  meaning?: string;
  /** How an observation of this parameter is usually called in a model. */
  observation?: string;
  description: string;
  /** How the driver obtains it; opaque to everything but that driver. */
  driver?: Record<string, string | number | boolean>;
}

export interface ArgumentInfo {
  name: string;
  eType: string;
  unit?: string;
  fallback?: string | number | boolean;
  /** Bounds the device accepts, for numbers. */
  min?: number;
  max?: number;
  description: string;
}

/** Something a part of a device can be asked to do. */
export interface OperationInfo {
  name: string;
  description: string;
  parameters: ArgumentInfo[];
  /** How the driver performs it; opaque to everything but that driver. */
  driver?: Record<string, string | number | boolean>;
}

/** A kind of part of a device: what it senses, what it can be asked to do, or both. */
export interface SensorKindInfo {
  kind: string;
  label: string;
  settings: SettingInfo[];
  parameters: ParameterInfo[];
  operations?: OperationInfo[];
  driver?: Record<string, string | number | boolean>;
}

export interface ConnectorInfo {
  type: string;
  label: string;
  description: string;
  settings: SettingInfo[];
  sensors: SensorKindInfo[];
}

const UID: SettingInfo = {
  name: "uid",
  eType: "EString",
  description: "The UID printed on the Bricklet (also shown by Brick Viewer and by Discover).",
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
 */
const tinkerforge: ConnectorInfo = {
  type: "tinkerforge",
  label: "Tinkerforge (Brick Daemon)",
  description: "Bricklets reached through the Brick Daemon of a host, for example a Raspberry Pi.",
  settings: [
    { name: "host", eType: "EString", fallback: "localhost", description: "Host name or address of the Brick Daemon." },
    { name: "port", eType: "EInt", fallback: 4223, description: "Port of the Brick Daemon." },
  ],
  sensors: [
    {
      kind: "motion_detector_v2",
      label: "Motion Detector Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletMotionDetectorV2", identifier: 292 },
      parameters: [
        {
          name: "motion_detected",
          eType: "EBoolean",
          meaning: "occupancy",
          description: "Whether motion is being detected.",
          driver: { getter: "getMotionDetected", equals: 1 },
        },
      ],
      operations: [
        {
          name: "set_indicator",
          description: "Set the brightness of the three blue LEDs of the Bricklet.",
          driver: { setter: "setIndicator" },
          parameters: [
            { name: "top_left", eType: "EInt", fallback: 0, min: 0, max: 255, description: "Brightness, 0 to 255." },
            { name: "top_right", eType: "EInt", fallback: 0, min: 0, max: 255, description: "Brightness, 0 to 255." },
            { name: "bottom", eType: "EInt", fallback: 0, min: 0, max: 255, description: "Brightness, 0 to 255." },
          ],
        },
      ],
    },
    {
      kind: "temperature_v2",
      label: "Temperature Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletTemperatureV2", identifier: 2113 },
      parameters: [
        {
          name: "temperature",
          eType: "EDouble",
          unit: "celsius",
          meaning: "temperature",
          description: "Temperature.",
          driver: { getter: "getTemperature", scale: 0.01 },
        },
      ],
    },
    {
      kind: "humidity_v2",
      label: "Humidity Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletHumidityV2", identifier: 283 },
      parameters: [
        {
          name: "humidity",
          eType: "EDouble",
          unit: "percent",
          meaning: "relative-humidity",
          description: "Relative humidity.",
          driver: { getter: "getHumidity", scale: 0.01 },
        },
        {
          name: "temperature",
          eType: "EDouble",
          unit: "celsius",
          meaning: "temperature",
          description: "Temperature.",
          driver: { getter: "getTemperature", scale: 0.01 },
        },
      ],
    },
    {
      kind: "ambient_light_v3",
      label: "Ambient Light Bricklet 3.0",
      settings: [UID],
      driver: { className: "BrickletAmbientLightV3", identifier: 2131 },
      parameters: [
        {
          name: "illuminance",
          eType: "EDouble",
          unit: "lux",
          meaning: "illuminance",
          description: "Illuminance.",
          driver: { getter: "getIlluminance", scale: 0.01 },
        },
      ],
    },
    {
      kind: "co2_v2",
      label: "CO2 Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletCO2V2", identifier: 2147 },
      parameters: [
        {
          name: "co2_concentration",
          eType: "EInt",
          unit: "ppm",
          meaning: "co2-concentration",
          description: "CO2 concentration.",
          driver: { getter: "getCO2Concentration" },
        },
        {
          name: "temperature",
          eType: "EDouble",
          unit: "celsius",
          meaning: "temperature",
          description: "Temperature.",
          driver: { getter: "getTemperature", scale: 0.01 },
        },
        {
          name: "humidity",
          eType: "EDouble",
          unit: "percent",
          meaning: "relative-humidity",
          description: "Relative humidity.",
          driver: { getter: "getHumidity", scale: 0.01 },
        },
      ],
    },
    {
      kind: "air_quality",
      label: "Air Quality Bricklet",
      settings: [UID],
      driver: { className: "BrickletAirQuality", identifier: 297 },
      parameters: [
        {
          name: "iaq_index",
          eType: "EInt",
          meaning: "indoor-air-quality",
          description: "Indoor air quality index (0 to 500); the first value the getter returns.",
          driver: { getter: "getIAQIndex", index: 0 },
        },
        {
          name: "temperature",
          eType: "EDouble",
          unit: "celsius",
          meaning: "temperature",
          description: "Temperature.",
          driver: { getter: "getTemperature", scale: 0.01 },
        },
        {
          name: "humidity",
          eType: "EDouble",
          unit: "percent",
          meaning: "relative-humidity",
          description: "Relative humidity.",
          driver: { getter: "getHumidity", scale: 0.01 },
        },
        {
          name: "air_pressure",
          eType: "EDouble",
          unit: "hPa",
          meaning: "air-pressure",
          description: "Air pressure.",
          driver: { getter: "getAirPressure", scale: 0.01 },
        },
      ],
    },
    {
      kind: "barometer_v2",
      label: "Barometer Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletBarometerV2", identifier: 2117 },
      parameters: [
        {
          name: "air_pressure",
          eType: "EDouble",
          unit: "hPa",
          meaning: "air-pressure",
          description: "Air pressure.",
          driver: { getter: "getAirPressure", scale: 0.001 },
        },
        {
          name: "temperature",
          eType: "EDouble",
          unit: "celsius",
          meaning: "temperature",
          description: "Temperature.",
          driver: { getter: "getTemperature", scale: 0.01 },
        },
      ],
    },
    {
      kind: "distance_ir_v2",
      label: "Distance IR Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletDistanceIRV2", identifier: 2125 },
      parameters: [
        {
          name: "distance",
          eType: "EInt",
          unit: "mm",
          meaning: "distance",
          description: "Distance to the nearest object.",
          driver: { getter: "getDistance" },
        },
      ],
    },
    {
      kind: "sound_pressure_level",
      label: "Sound Pressure Level Bricklet",
      settings: [UID],
      driver: { className: "BrickletSoundPressureLevel", identifier: 290 },
      parameters: [
        {
          name: "decibel",
          eType: "EDouble",
          unit: "dB",
          meaning: "sound-pressure-level",
          description: "Sound pressure level.",
          driver: { getter: "getDecibel", scale: 0.1 },
        },
      ],
    },
    {
      kind: "industrial_dual_relay",
      label: "Industrial Dual Relay Bricklet",
      settings: [UID],
      driver: { className: "BrickletIndustrialDualRelay", identifier: 284 },
      parameters: [
        {
          name: "channel0",
          eType: "EBoolean",
          meaning: "relay-state",
          description: "Whether relay 0 is closed.",
          driver: { getter: "getValue", index: 0 },
        },
        {
          name: "channel1",
          eType: "EBoolean",
          meaning: "relay-state",
          description: "Whether relay 1 is closed.",
          driver: { getter: "getValue", index: 1 },
        },
      ],
      operations: [
        {
          name: "set_value",
          description: "Switch both relays at once.",
          driver: { setter: "setValue" },
          parameters: [
            { name: "channel0", eType: "EBoolean", fallback: false, description: "Close relay 0." },
            { name: "channel1", eType: "EBoolean", fallback: false, description: "Close relay 1." },
          ],
        },
        {
          name: "set_channel",
          description: "Switch one relay and leave the other as it is.",
          driver: { setter: "setSelectedValue" },
          parameters: [
            { name: "channel", eType: "EInt", fallback: 0, min: 0, max: 1, description: "Which relay: 0 or 1." },
            { name: "value", eType: "EBoolean", fallback: false, description: "Close it." },
          ],
        },
      ],
    },
    {
      kind: "piezo_speaker_v2",
      label: "Piezo Speaker Bricklet 2.0",
      settings: [UID],
      driver: { className: "BrickletPiezoSpeakerV2", identifier: 2145 },
      parameters: [],
      operations: [
        {
          name: "beep",
          description: "Beep at a frequency and volume for a duration; a duration of 0 stops the beep.",
          driver: { setter: "setBeep" },
          parameters: [
            { name: "frequency", eType: "EInt", unit: "Hz", fallback: 1000, min: 50, max: 15000, description: "50 to 15000 Hz." },
            { name: "volume", eType: "EInt", fallback: 1, min: 0, max: 10, description: "0 to 10." },
            { name: "duration", eType: "EInt", unit: "ms", fallback: 200, min: 0, max: 60000, description: "Milliseconds." },
          ],
        },
      ],
    },
    {
      kind: "nfc",
      label: "NFC Bricklet (people counter by taps)",
      settings: [UID],
      driver: { className: "BrickletNFC", identifier: 286 },
      parameters: [
        {
          name: "count",
          eType: "EInt",
          unit: "person",
          meaning: "people-count",
          observation: "PeopleCount",
          description:
            "People inside, estimated from taps: a tag tapped is in, tapped again is out. Counted since the app started.",
          driver: { reader: "nfcTapCount" },
        },
      ],
      operations: [
        {
          name: "reset",
          description: "Start counting again from nobody inside.",
          driver: { special: "nfcReset" },
          parameters: [],
        },
      ],
    },
    {
      kind: "rgb_led_button",
      label: "RGB LED Button Bricklet",
      settings: [UID],
      driver: { className: "BrickletRGBLEDButton", identifier: 282 },
      parameters: [
        {
          name: "pressed",
          eType: "EBoolean",
          meaning: "button-state",
          description: "Whether the button is being pressed.",
          driver: { getter: "getButtonState", equals: 0 },
        },
      ],
      operations: [
        {
          name: "set_color",
          description: "Set the colour of the LED in the button.",
          driver: { setter: "setColor" },
          parameters: [
            { name: "red", eType: "EInt", fallback: 0, min: 0, max: 255, description: "0 to 255." },
            { name: "green", eType: "EInt", fallback: 0, min: 0, max: 255, description: "0 to 255." },
            { name: "blue", eType: "EInt", fallback: 0, min: 0, max: 255, description: "0 to 255." },
          ],
        },
      ],
    },
  ],
};

const VALUE: SettingInfo = {
  name: "value",
  eType: "EString",
  description: "The value to report; empty for a default one. Write `fail` to behave like a sensor that is gone.",
};

/** No hardware: sensors that report what they are told. For trying the loop and for tests. */
/** A simulated part has no hardware identifier: its kind tells it from the other parts of the device. */
const PART: SettingInfo = { name: "uid", eType: "EString", description: "What tells this part from the others of its device." };

const simulated: ConnectorInfo = {
  type: "simulated",
  label: "Simulated device",
  description: "Sensors that report a configured value, to try the loop without hardware.",
  settings: [],
  sensors: [
    {
      kind: "presence",
      label: "Presence sensor",
      settings: [PART, VALUE],
      parameters: [{ name: "detected", eType: "EBoolean", meaning: "occupancy", description: "Whether someone is there." }],
    },
    {
      kind: "people_counter",
      label: "People counter",
      settings: [PART, VALUE],
      parameters: [
        { name: "count", eType: "EInt", unit: "person", meaning: "people-count", description: "How many people are there." },
      ],
    },
    {
      kind: "thermometer",
      label: "Thermometer",
      settings: [PART, VALUE],
      parameters: [
        { name: "temperature", eType: "EDouble", unit: "celsius", meaning: "temperature", description: "Temperature." },
      ],
    },
    {
      kind: "switch",
      label: "Switch",
      settings: [PART],
      parameters: [{ name: "on", eType: "EBoolean", meaning: "switch-state", description: "Whether it is on." }],
      operations: [
        {
          name: "set",
          description: "Turn it on or off.",
          parameters: [{ name: "on", eType: "EBoolean", fallback: true, description: "On." }],
        },
      ],
    },
    {
      kind: "buzzer",
      label: "Buzzer",
      settings: [PART],
      parameters: [],
      operations: [
        {
          name: "beep",
          description: "Beep for a duration.",
          parameters: [{ name: "duration", eType: "EInt", unit: "ms", fallback: 200, min: 0, max: 10000, description: "Milliseconds." }],
        },
      ],
    },
  ],
};

export const CONNECTORS: ConnectorInfo[] = [tinkerforge, simulated];

export function connectorInfo(type: string): ConnectorInfo | null {
  return CONNECTORS.find((connector) => connector.type === type) ?? null;
}

export function sensorKind(type: string, kind: string): SensorKindInfo | null {
  return connectorInfo(type)?.sensors.find((sensor) => sensor.kind === kind) ?? null;
}
