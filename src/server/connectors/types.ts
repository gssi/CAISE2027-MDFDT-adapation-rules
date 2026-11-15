import { type DeviceSpec, type Discovered, type Reading, type SensorSpec } from "@/engine/devices";
import { type Dict } from "@/engine/kernel/model";

/**
 * A connector reaches one kind of device. It gets the description of a device
 * taken from a model and returns what its sensors read; it knows nothing about
 * models, drift or the repository.
 */
export interface DeviceConnector {
  type: string;
  /** One reading per parameter of every sensor: a value, or the reason there is none. */
  read(device: DeviceSpec): Promise<Reading[]>;
  /** The sensors attached to the device, when the connector can tell. */
  discover?(device: DeviceSpec): Promise<Discovered[]>;
  /** Ask a part of the device to do something; rejects with the reason when it cannot. */
  invoke?(device: DeviceSpec, part: SensorSpec, operation: string, args: Dict): Promise<void>;
}
