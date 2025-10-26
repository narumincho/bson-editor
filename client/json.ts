type JSONValue = string | number | boolean | null | ReadonlyArray<JSONValue> | {
  readonly [key: string]: JSONValue;
};

export const jsonStringToJsonValue = (str: string): JSONValue | undefined => {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
};

export const jsonValueToJsonString = (jsonValue: JSONValue): string => {
  return JSON.stringify(jsonValue);
};
