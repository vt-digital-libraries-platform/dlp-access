// Jest 27's jsdom environment lacks globals that newer dependencies use:
// TextEncoder/TextDecoder (react-router 7) and structuredClone.
import { TextEncoder, TextDecoder } from "util";
import { serialize, deserialize } from "v8";

Object.assign(global, {
  TextEncoder,
  TextDecoder,
  structuredClone: (value) => deserialize(serialize(value))
});
