import { LigneDeBusMapper } from "./LigneDeBus.mapper";

describe("LigneDeBusMapper", () => {
    it("should reverse mapping correctly", () => {
        const mockDocument = {
            _id: "someId",
            meetingPointsIds: ["point1", "point2"],
            youngCapacity: 40,
            youngSeatsTaken: 20,
            centerId: "center123",
            busId: "bus456",
            cohortId: undefined,
            cohort: "Cohort Name",
            sessionId: "sessionId123",
            totalCapacity: 50,
            followerCapacity: 5,
            travelTime: 120,
            centerArrivalTime: new Date("2023-10-01T08:00:00"),
            centerDepartureTime: new Date("2023-10-01T14:00:00"),
            delayedForth: 10,
            delayedBack: 15,
            departuredDate: new Date("2023-10-01"),
            returnDate: new Date("2023-10-05"),
            mergedBusIds: ["bus789"],
        } as any;

        const newDocument = LigneDeBusMapper.toEntity(LigneDeBusMapper.toModel(mockDocument));
        expect(newDocument).toEqual(mockDocument);
    });
});
