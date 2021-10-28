import "regenerator-runtime/runtime";
import { writeDataAsLastBitsToBuffer } from "./write";

describe("writeDataAsLastBitsToBuffer", () => {
  describe("Buffer [17,87,93,255, 44,56,82,255, 17,87,93,255]", () => {
    const bufferValues = [17, 87, 93, 255, 44, 56, 82, 255, 17, 87, 93, 255];

    it("92 should be written as 16,87,92,255,45,57,83,255,16,86,93,255", () => {
      const buffer = new Uint8ClampedArray(bufferValues);
      const data = new Uint8Array([92]);

      writeDataAsLastBitsToBuffer(buffer, data);

      expect([...buffer]).toEqual([
        16, 87, 92, 255, 45, 57, 83, 255, 16, 86, 93, 255,
      ]);
    });

    it("117 should be written as 16,87,93,255,45,56,83,255,16,87,93,255", () => {
      const buffer = new Uint8ClampedArray(bufferValues);
      const data = new Uint8Array([117]);

      writeDataAsLastBitsToBuffer(buffer, data);

      expect([...buffer]).toEqual([
        16, 87, 93, 255, 45, 56, 83, 255, 16, 87, 93, 255,
      ]);
    });
  });

  describe("Buffer [17,87,93,255, 44,56,82,254, 44,56,82,255, 17,87,93,255]", () => {
    const bufferValues = [
      17, 87, 93, 255, 44, 56, 82, 254, 44, 56, 82, 255, 17, 87, 93, 255,
    ];

    it("92 should be written as 16,87,92,255,44,56,82,254,45,57,83,255,16,86,93,255", () => {
      const buffer = new Uint8ClampedArray(bufferValues);
      const data = new Uint8Array([92]);

      writeDataAsLastBitsToBuffer(buffer, data);

      expect([...buffer]).toEqual([
        16, 87, 92, 255, 44, 56, 82, 254, 45, 57, 83, 255, 16, 86, 93, 255,
      ]);
    });

    it("117 should be written as 16,87,93,255,44,56,82,254,45,56,83,255,16,87,93,255", () => {
      const buffer = new Uint8ClampedArray(bufferValues);
      const data = new Uint8Array([117]);

      writeDataAsLastBitsToBuffer(buffer, data);

      expect([...buffer]).toEqual([
        16, 87, 93, 255, 44, 56, 82, 254, 45, 56, 83, 255, 16, 87, 93, 255,
      ]);
    });
  });

  it("PC to large buffer", () => {
    const buffer = new Uint8ClampedArray([
      169, 213, 226, 255, 169, 212, 226, 255, 168, 212, 226, 255, 168, 213, 226,
      255, 168, 212, 226, 255, 168, 212, 227, 255,
    ]);
    const data = new TextEncoder().encode("PC");

    writeDataAsLastBitsToBuffer(buffer, data);

    expect([...buffer]).toEqual([
      168, 213, 226, 255, 169, 212, 226, 255, 168, 212, 226, 255, 169, 212, 226,
      255, 168, 212, 227, 255, 169, 212, 227, 255,
    ]);
  });
});
