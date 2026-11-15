/**
 * A stand-in for a Brick Daemon: a TCP server that speaks the Tinkerforge
 * TCP/IP protocol (8-byte header: UID uint32 LE, length, function id, sequence
 * number and options, flags), `get_identity`, `enumerate` and the getters of
 * the Bricklets attached to it.
 */
import net from "node:net";

const BASE58 = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
export const uidNumber = (uid: string) => [...uid].reduce((value, char) => value * 58 + BASE58.indexOf(char), 0);

export interface FakeBricklet {
  uid: string;
  identifier: number;
  /** function id -> payload of the response */
  answers: Record<number, Buffer>;
  /** an answer that depends on the request, by function id */
  respond?: Record<number, (payload: Buffer) => Buffer>;
  /** function ids of the actions it takes; what it was asked is kept in `calls` */
  actions?: number[];
  calls?: { functionId: number; payload: Buffer }[];
}

export const int16 = (value: number) => {
  const b = Buffer.alloc(2);
  b.writeInt16LE(value);
  return b;
};
export const uint16 = (value: number) => {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(value);
  return b;
};
export const int32 = (value: number) => {
  const b = Buffer.alloc(4);
  b.writeInt32LE(value);
  return b;
};

function identity(bricklet: FakeBricklet): Buffer {
  const payload = Buffer.alloc(25);
  payload.write(bricklet.uid, 0, "ascii"); // char[8] uid
  payload.write("6Dct25", 8, "ascii"); // char[8] connected uid
  payload.write("a", 16, "ascii"); // position
  payload.set([1, 0, 0], 17); // hardware version
  payload.set([2, 0, 1], 20); // firmware version
  payload.writeUInt16LE(bricklet.identifier, 23);
  return payload;
}

function packet(uid: number, functionId: number, sequence: number, payload: Buffer): Buffer {
  const header = Buffer.alloc(8);
  header.writeUInt32LE(uid, 0);
  header.writeUInt8(8 + payload.length, 4);
  header.writeUInt8(functionId, 5);
  header.writeUInt8((sequence << 4) | 0x08, 6);
  header.writeUInt8(0, 7);
  return Buffer.concat([header, payload]);
}

/** A Brick Daemon with the given Bricklets attached. */
export function fakeBrickDaemon(bricklets: () => FakeBricklet[]): net.Server {
  return net.createServer((socket) => {
    let pending = Buffer.alloc(0);
    socket.on("error", () => undefined);
    socket.on("data", (chunk) => {
      pending = Buffer.concat([pending, chunk]);
      while (pending.length >= 8 && pending.length >= pending.readUInt8(4)) {
        const length = pending.readUInt8(4);
        const request = pending.subarray(0, length);
        pending = pending.subarray(length);
        const uid = request.readUInt32LE(0);
        const functionId = request.readUInt8(5);
        const sequence = request.readUInt8(6) >> 4;
        if (functionId === 254) {
          // enumerate: every Bricklet answers with a callback (sequence number 0)
          for (const bricklet of bricklets()) {
            socket.write(packet(uidNumber(bricklet.uid), 253, 0, Buffer.concat([identity(bricklet), Buffer.from([0])])));
          }
          continue;
        }
        const bricklet = bricklets().find((b) => uidNumber(b.uid) === uid);
        if (!bricklet) continue; // nothing with this UID: the request times out
        if (functionId === 255) socket.write(packet(uid, 255, sequence, identity(bricklet)));
        else if (bricklet.respond?.[functionId]) {
          socket.write(packet(uid, functionId, sequence, bricklet.respond[functionId](Buffer.from(request.subarray(8)))));
        } else if (bricklet.answers[functionId]) socket.write(packet(uid, functionId, sequence, bricklet.answers[functionId]));
        else if (bricklet.actions?.includes(functionId)) {
          (bricklet.calls ??= []).push({ functionId, payload: Buffer.from(request.subarray(8)) });
          // confirm, when the request asks for it
          if (request.readUInt8(6) & 0x08) socket.write(packet(uid, functionId, sequence, Buffer.alloc(0)));
        }
      }
    });
  });
}

