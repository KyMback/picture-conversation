import { readDataAsLastBitsOfBytes } from "./index";

describe("readDataAsLastBitsOfBytes", () => {
  it("Throw Error if incorrect buffer length", () => {
    const buffer = new Uint8Array();

    expect(() => readDataAsLastBitsOfBytes(buffer, 0, 4)).toThrow();
  });

  describe("Read bytes from 0 position", () => {
    it("Read byte is 10", () => {
      const buffer = new Uint8Array([0, 0, 0, 0, 1, 0, 1, 0]);

      const result = readDataAsLastBitsOfBytes(buffer, 0, 1);

      expect(result).toHaveLength(1);
      expect(result).toContain(10);
    });

    it("Read bytes are 11, 27, 164", () => {
      const buffer = new Uint8Array([
        0, 0, 0, 0, 1, 0, 1, 1,
        0, 0, 0, 1, 1, 0, 1, 1,
        1, 0, 1, 0, 0, 1, 0, 0,
        1, 0, 1, 0, 0, 1, 0, 0,
      ]);

      const result = readDataAsLastBitsOfBytes(buffer, 0, 3);

      expect(result).toHaveLength(3);
      expect([...result]).toEqual([11,27,164]);
    });


    describe("With not just 1 and 0 in buffer", () => {
      it("Read byte is 11", () => {
        const buffer = new Uint8Array([0, 84, 72, 0, 1, 10, 27, 17]);

        const result = readDataAsLastBitsOfBytes(buffer, 0, 1);

        expect(result).toHaveLength(1);
        expect(result).toContain(11);
      });

      it("Read bytes are 11, 27, 164", () => {
        const buffer = new Uint8Array([
          0, 0, 22, 0, 73, 84, 7, 11,
          0, 0, 0, 81, 1, 0, 1, 1,
          23, 0, 11, 0, 0, 67, 0, 4,
          35, 0, 13, 0, 0, 69, 2, 0,
        ]);

        const result = readDataAsLastBitsOfBytes(buffer, 0, 3);

        expect(result).toHaveLength(3);
        expect([...result]).toEqual([11, 27, 164]);
      });
    });
  });

  describe("Read bytes not from the start", () => {
    describe("With not just 1 and 0 in buffer", () => {
      it("Read bytes are 11, 10", () => {
        const buffer = new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0,
          0, 84, 72, 0, 1, 10, 27, 17,
          0, 84, 72, 0, 1, 10, 27, 0,
        ]);

        const result = readDataAsLastBitsOfBytes(buffer, 1, 2);

        expect(result).toHaveLength(2);
        expect([...result]).toEqual([11, 10]);
      });

      it("Read bytes are 11, 27, 164", () => {
        const buffer = new Uint8Array([
          0, 0, 0, 0, 0, 0, 0, 0,
          1, 1, 1, 1, 1, 1, 1, 1,
          0, 0, 22, 0, 73, 84, 7, 11,
          0, 0, 0, 81, 1, 0, 1, 1,
          23, 0, 11, 0, 0, 67, 0, 4,
          35, 0, 13, 0, 0, 69, 2, 0,
        ]);

        const result = readDataAsLastBitsOfBytes(buffer, 2, 3);

        expect(result).toHaveLength(3);
        expect([...result]).toEqual([11, 27, 164]);
      });
    });
  });
});

