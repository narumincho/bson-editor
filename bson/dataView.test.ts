import { indexOf } from "./dataView.ts";
import {
  getInt32,
  getString,
  getUint8,
  ReadonlyDataView,
  toReadonlyDataView,
} from "./dataView.ts";
import { assertEquals } from "jsr:@std/assert";

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
  assertEquals(result.withLocationValue, {
    location: {
      startIndex: 1,
      endIndex: 2,
    },
    value: 1,
  });
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
  assertEquals(result.withLocationValue, {
    location: {
      startIndex: 1,
      endIndex: 5,
    },
    value: 3 + 2 * 256 + 1 * 256 * 256,
  });
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
  assertEquals(result.withLocationValue, {
    location: {
      startIndex: 1,
      endIndex: 4,
    },
    value: undefined,
  });
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
    location: {
      startIndex: 0,
      endIndex: 24,
    },
    value: {
      originalIfInvalidUtf8Error: undefined,
      value: "サンプルテキスト",
    },
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
