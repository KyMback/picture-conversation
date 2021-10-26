import { int32ToUint8Array, uint8ArrayToInt32 } from "./index";

describe("int32ToUint8Array", () => {
  it("0 should be 0,0,0,0", () => {
    const result = int32ToUint8Array(0);

    expect(result).toHaveLength(4);
    expect([...result]).toEqual([0, 0, 0, 0]);
  });

  it("10000 should be 0,0,39,16", () => {
    const result = int32ToUint8Array(10000);

    expect(result).toHaveLength(4);
    expect([...result]).toEqual([0, 0, 39, 16]);
  });

  it("83891971 should be 5,0,23,3", () => {
    const result = int32ToUint8Array(83891971);

    expect(result).toHaveLength(4);
    expect([...result]).toEqual([5, 0, 23, 3]);
  });
});

describe("uint8ArrayToInt32", () => {
  it("0,0,0,0 should be 0", function () {
    const result = uint8ArrayToInt32(new Uint8Array([0, 0, 0, 0]));

    expect(result).toBe(0);
  });

  it("0,0,39,16 should be 10000", function () {
    const result = uint8ArrayToInt32(new Uint8Array([0, 0, 39, 16]));

    expect(result).toBe(10000);
  });

  it("5,0,23,3 should be 83891971", function () {
    const result = uint8ArrayToInt32(new Uint8Array([5, 0, 23, 3]));

    expect(result).toBe(8389171);
  });
});
