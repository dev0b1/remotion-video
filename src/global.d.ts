// Provide a fallback JSX namespace to satisfy TypeScript when React typings are not resolved.
// This prevents: "JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists".
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
