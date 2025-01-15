import { getDistance } from "./location";

describe("getDistance", () => {
  it("should return the correct distance between two coordinates", () => {
    const coord1 = { lat: 51.5074, lon: -0.1278 }; // London coordinates
    const coord2 = { lat: 48.8566, lon: 2.3522 }; // Paris coordinates
    const expectedDistance = 343.75; // Approximate distance between London and Paris in kilometers

    const result = getDistance(coord1, coord2);

    expect(result).toBeCloseTo(expectedDistance, 0); // 0 is the number of decimal places to check for precision
  });

  it("should throw an error if any coordinate is missing lat/lon", () => {
    const coord1 = { lat: 51.5074, lon: -0.1278 };
    const coord2 = { lat: undefined, lon: 2.3522 } as any;

    expect(() => {
      // @ts-ignore
      getDistance(coord1, coord2);
    }).toThrow("Missing lat/lon");
  });
});
