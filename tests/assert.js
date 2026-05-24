export function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`PASS: ${message}`);
}

export function assertClose(actual, expected, message, tolerance = 0.01) {
  if (Math.abs(actual - expected) > tolerance) {
    console.error(`FAIL: ${message} — expected ${expected}, got ${actual}`);
    throw new Error(message);
  }
  console.log(`PASS: ${message}`);
}
