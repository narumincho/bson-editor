import { createLocationAndNextDataView, indexOf } from "./dataView.ts";
import {
  getInt32,
  getString,
  getUint8,
  ReadonlyDataView,
  toReadonlyDataView,
} from "./dataView.ts";
import { assertEquals } from "@std/assert";

const toCompareObject = (
  result: ReadonlyDataView,
): {
  readonly offset: number;
  readonly length: number;
} => ({
  offset: result.__dataView.byteOffset,
  length: result.__dataView.byteLength,
});

Deno.test("getUint8 ok", () => {
  const dataView = toReadonlyDataView(
    new DataView(new Uint8Array([0, 1, 2, 3, 4]).buffer, 1, 3),
  );
  const result = getUint8(dataView);
  assertEquals(result.value, 1);
  assertEquals(toCompareObject(result.next), {
    offset: 2,
    length: 2,
  });
});

Deno.test("getInt32 ok", () => {
  const dataView = toReadonlyDataView(
    new DataView(new Uint8Array([0, 3, 2, 1, 0, 1, 6]).buffer, 1, 6),
  );
  const result = getInt32(dataView);
  assertEquals(result.value, 3 + 2 * 256 + 1 * 256 * 256);
  assertEquals(toCompareObject(result.next), {
    offset: 5,
    length: 2,
  });
});

Deno.test("getInt32 overflow", () => {
  const dataView = toReadonlyDataView(
    new DataView(new Uint8Array([0, 3, 2, 1]).buffer, 1),
  );
  const result = getInt32(dataView);
  assertEquals(result.value, undefined);
  assertEquals(toCompareObject(result.next), {
    offset: 0,
    length: 0,
  });
});

Deno.test("getInt32 outside", () => {
  const dataView = toReadonlyDataView(
    new DataView(new Uint8Array([0, 3, 2, 1, 0, 1, 6]).buffer, 1, 3),
  );
  const result = getInt32(dataView);
  assertEquals(result.value, undefined);
  assertEquals(toCompareObject(result.next), {
    offset: 0,
    length: 0,
  });
});

Deno.test("getString", () => {
  const dataView = toReadonlyDataView(
    new DataView(new TextEncoder().encode("サンプルテキスト").buffer),
  );
  const result = getString(dataView);
  assertEquals(result, {
    originalIfInvalidUtf8Error: undefined,
    value: "サンプルテキスト",
  });
});

Deno.test("indexOf with offset", () => {
  assertEquals(
    indexOf(
      toReadonlyDataView(
        new DataView(new Uint8Array([0, 15, 28, 3, 28, 22]).buffer, 3),
      ),
      28,
    ),
    1,
  );
});

Deno.test("indexOf outside", () => {
  assertEquals(
    indexOf(
      toReadonlyDataView(
        new DataView(new Uint8Array([0, 15, 28, 3, 28, 22, 9]).buffer, 0, 3),
      ),
      22,
    ),
    undefined,
  );
});

Deno.test("createLocationAndNextDataView", () => {
  const buffer = new Uint8Array([0, 15, 28, 3, 28, 22, 9]).buffer;
  const dataView = toReadonlyDataView(new DataView(buffer, 1, 3));
  assertEquals(
    createLocationAndNextDataView(dataView, 2),
    {
      left: toReadonlyDataView(new DataView(buffer, 1, 2)),
      right: toReadonlyDataView(new DataView(buffer, 3, 2)),
      overflow: false,
    },
  );
});
