/**
 * https://www.npmjs.com/package/bson より型がある程度つくようにした bsonライブラリ
 * @module
 */

import { Binary, deserialize, ObjectId, serialize } from "bson";

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
