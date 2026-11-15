"use client";

import { useEffect, useRef, useState } from "react";

import { type DeviceSpec, type Reading } from "@/engine/devices";
import { readDevices } from "@/server/actions";

export interface LiveState {
  /** The latest readings, by model. */
  readings: Record<string, Reading[]>;
  /** When they were taken, in seconds; null before the first reading. */
  at: number | null;
}

const NOTHING: LiveState = { readings: {}, at: null };

/**
 * Read the devices the models describe, again and again, while `enabled`.
 * Reading does not change anything; it stops while the page is hidden, and a
 * round that is still under way is not started twice.
 */
export function useLiveReadings(enabled: boolean, seconds: number, devices: DeviceSpec[]): LiveState {
  const [state, setState] = useState<LiveState>(NOTHING);
  const latest = useRef(devices);
  useEffect(() => {
    latest.current = devices;
  });
  const key = JSON.stringify(devices);

  useEffect(() => {
    if (!enabled) return;
    let stopped = false;
    let running = false;
    const round = async () => {
      if (running || document.hidden || !latest.current.length) return;
      running = true;
      try {
        const specs = latest.current;
        const readings = await readDevices(specs);
        if (stopped) return;
        const byModel: Record<string, Reading[]> = {};
        // a device has the readings of its own sensors, in the order it was asked
        let index = 0;
        for (const spec of specs) {
          const count = spec.sensors.reduce((sum, sensor) => sum + sensor.parameters.length, 0);
          (byModel[spec.model] ??= []).push(...readings.slice(index, index + count));
          index += count;
        }
        setState({ readings: byModel, at: Math.round(Date.now() / 1000) });
      } finally {
        running = false;
      }
    };
    round();
    const timer = setInterval(round, seconds * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [enabled, seconds, key]);

  return enabled ? state : NOTHING;
}
