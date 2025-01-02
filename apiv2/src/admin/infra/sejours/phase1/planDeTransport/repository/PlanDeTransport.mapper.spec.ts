import { PlanDeTransportDocument } from "../provider/PlanDeTransportMongo.provider";
import { PlanDeTransportMapper } from "./PlanDeTransport.mapper";

describe("PlanDeTransportMapper", () => {
    it("should reverse mapping correctly", () => {
        const mockDocument = {
            _id: "123456",
            youngCapacity: 100,
            youngSeatsTaken: 50,
            centerId: "center123",
            busId: "bus456",
            cohort: "Summer 2023",
            cohortId: "cohort123",
            totalCapacity: 150,
            followerCapacity: 20,
            travelTime: "180",
            centerArrivalTime: "10:00",
            centerDepartureTime: "15:00",
            delayedForth: "15",
            delayedBack: "10",
            departureString: "2023-06-01",
            returnString: "2023-07-01",
            centerRegion: "Region X",
            centerDepartment: "Department Y",
            centerAddress: "123 Center St.",
            centerZip: "12345",
            centerName: "Center Name",
            centerCode: "C123",
        } as PlanDeTransportDocument;

        const newDocument = PlanDeTransportMapper.toEntity(PlanDeTransportMapper.toModel(mockDocument));
        expect(newDocument).toEqual(mockDocument);
    });
});
