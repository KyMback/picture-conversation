import { writeDataAsLastBitsToBuffer } from "./index";

describe("writeDataAsLastBitsToBuffer", () => {
  describe("Buffer 8 * 3 zeros", () => {
    it("92, 255, 0 should be written as 0,1,0,1,1,1,0,0, 1,1,1,1,1,1,1,1, 0,0,0,0,0,0,0,0", () => {
      const buffer = new Uint8Array(8 * 3);
      const data = new Uint8Array([92, 255, 0]);

      writeDataAsLastBitsToBuffer(buffer, 0, data);

      expect([...buffer]).toEqual([
        0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      ]);
    });

    it("92 should be written at 1 index as 0,0,0,0,0,0,0,0, 0,1,0,1,1,1,0,0, 0,0,0,0,0,0,0,0", () => {
      const buffer = new Uint8Array(8 * 3);
      const data = new Uint8Array([92]);

      writeDataAsLastBitsToBuffer(buffer, 1, data);

      expect([...buffer]).toEqual([
        0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      ]);
    });
  });

  describe("Buffer [17,87,93,21,44,56,82,1]", () => {
    const bufferValues = [17, 87, 93, 21, 44, 56, 82, 1];

    it("92 should be written as 16,87,92,21,45,57,82,0", () => {
      const buffer = new Uint8Array(bufferValues);
      const data = new Uint8Array([92]);

      writeDataAsLastBitsToBuffer(buffer, 0, data);

      expect([...buffer]).toEqual([16, 87, 92, 21, 45, 57, 82, 0]);
    });

    it("117 should be written as 16,87,93,21,44,57,82,1", () => {
      const buffer = new Uint8Array(bufferValues);
      const data = new Uint8Array([117]);

      writeDataAsLastBitsToBuffer(buffer, 0, data);

      expect([...buffer]).toEqual([16, 87, 93, 21, 44, 57, 82, 1]);
    });
  });

  describe("Buffer [0,0,0,0,0,0,0,0,17,87,93,21,44,56,82,1]", () => {
    const bufferValues = [
      0, 0, 0, 0, 0, 0, 0, 0, 17, 87, 93, 21, 44, 56, 82, 1,
    ];

    describe("Write into second position", () => {
      it("92 should be written as 0,0,0,0,0,0,0,0,16,87,92,21,45,57,82,0", () => {
        const buffer = new Uint8Array(bufferValues);
        const data = new Uint8Array([92]);

        writeDataAsLastBitsToBuffer(buffer, 1, data);

        expect([...buffer]).toEqual([
          0, 0, 0, 0, 0, 0, 0, 0, 16, 87, 92, 21, 45, 57, 82, 0,
        ]);
      });

      it("117 should be written as 0,0,0,0,0,0,0,0,16,87,93,21,44,57,82,1", () => {
        const buffer = new Uint8Array(bufferValues);
        const data = new Uint8Array([117]);

        writeDataAsLastBitsToBuffer(buffer, 1, data);

        expect([...buffer]).toEqual([
          0, 0, 0, 0, 0, 0, 0, 0, 16, 87, 93, 21, 44, 57, 82, 1,
        ]);
      });
    });
  });
});
