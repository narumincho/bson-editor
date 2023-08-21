import {
  createOutOfRangeErrorMessage,
  getInt32,
  getString,
  getUint8,
  ReadonlyDataView,
  setLocalOffsetAndLengthDataView,
  toReadonlyDataView,
} from "./dataView.ts";
import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.198.0/testing/asserts.ts";

Deno.test("setLocalOffsetAndLengthDataView ok", () => {
  const dataView = new DataView(new Uint8Array(10).buffer);
  const result = setLocalOffsetAndLengthDataView(
    toReadonlyDataView(dataView),
    3,
    4
  );
  // **********
  // ---****---
  // ---****---
  assertEquals(toCompareObject(result), {
    offset: 3,
    length: 4,
  });
});

Deno.test("setLocalOffsetAndLengthDataView inside", () => {
  const dataView = new DataView(new Uint8Array(10).buffer, 1, 8);
  const result = setLocalOffsetAndLengthDataView(
    toReadonlyDataView(dataView),
    3,
    4
  );
  // -********-
  // ----****--
  // ----****--
  assertEquals(toCompareObject(result), {
    offset: 4,
    length: 4,
  });
});

Deno.test("setLocalOffsetAndLengthDataView no change", () => {
  const dataView = new DataView(new Uint8Array(10).buffer, 1, 8);
  const result = setLocalOffsetAndLengthDataView(
    toReadonlyDataView(dataView),
    0,
    8
  );
  // -********-
  // -********-
  // -********-
  assertEquals(toCompareObject(result), {
    offset: 1,
    length: 8,
  });
});

Deno.test("setLocalOffsetAndLengthDataView left over", () => {
  const dataView = new DataView(new Uint8Array(10).buffer, 1, 8);
  // -********-
  // *****-----
  // -****-----
  assertThrows(
    () => setLocalOffsetAndLengthDataView(toReadonlyDataView(dataView), -1, 5),
    RangeError,
    createOutOfRangeErrorMessage({
      rawNewLeft: 0,
      rawNewRight: 5,
      oldLeft: 1,
      oldRight: 9,
    })
  );
});

Deno.test("setLocalOffsetAndLengthDataView right over", () => {
  const dataView = new DataView(new Uint8Array(10).buffer, 1, 8);
  // -********-
  // -----*****
  // -----****-
  assertThrows(
    () => setLocalOffsetAndLengthDataView(toReadonlyDataView(dataView), 4, 5),
    RangeError,
    createOutOfRangeErrorMessage({
      rawNewLeft: 5,
      rawNewRight: 10,
      oldLeft: 1,
      oldRight: 9,
    })
  );
});

Deno.test("setLocalOffsetAndLengthDataView flip", () => {
  const dataView = new DataView(new Uint8Array(10).buffer, 1, 8);
  // -**|******-
  // --!|-------
  // ---|-------
  assertThrows(
    () => setLocalOffsetAndLengthDataView(toReadonlyDataView(dataView), 2, -1),
    RangeError,
    createOutOfRangeErrorMessage({
      rawNewLeft: 3,
      rawNewRight: 2,
      oldLeft: 1,
      oldRight: 9,
    })
  );
});

const toCompareObject = (
  result: ReadonlyDataView
): {
  readonly offset: number;
  readonly length: number;
} => ({
  offset: result.__dataView.byteOffset,
  length: result.__dataView.byteLength,
});

Deno.test("getUint8 ok", () => {
  const dataView = toReadonlyDataView(
    new DataView(new Uint8Array([0, 1, 2, 3, 4]).buffer, 1, 3)
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
    new DataView(new Uint8Array([0, 0, 0, 0, 3, 5, 6]).buffer, 1, 6)
  );
  const result = getInt32(dataView);
  assertEquals(result.withLocationValue, {
    location: {
      startIndex: 1,
      endIndex: 5,
    },
    value: 3,
  });
  assertEquals(toCompareObject(result.next), {
    offset: 5,
    length: 2,
  });
});

Deno.test("getString", () => {
  const dataView = toReadonlyDataView(
    new DataView(new TextEncoder().encode("サンプルテキスト").buffer)
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
