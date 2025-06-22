/**
 * https://jsr.io/@lucsoft/web-bson がなぜか型がついていなかったのでつくように bsonライブラリ
 * @module
 */

import { Binary, deserialize, ObjectId, serialize } from "@lucsoft/web-bson";

export { Binary, ObjectId } from "@lucsoft/web-bson";

export type Document = {
  readonly [key: string]: Element;
};

export type Element =
  | number // 1
  | string // 2
  | Document // 3
  | ReadonlyArray<Element> // 4
  | Binary // 5
  | ObjectId // 7
  | boolean // 8
  | Date // 9
  | null; // 10;

export const toBson = (document: Document): Uint8Array => {
  return serialize(document);
};

export const fromBson = (binary: Uint8Array): Document => {
  return deserialize(binary);
};
