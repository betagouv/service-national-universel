import { JEUNE_PATCHHISTORY_OPTIONS } from "@admin/infra/sejours/jeune/provider/JeuneMongo.provider";
import { HistoryMapper } from "./HistoryMapper";

describe("HistoryMapper", () => {
    describe("toUpdateHistory", () => {
        it("should return a PatchType object with user firstname", () => {
            const original = { _id: "id", statusPhase1: "WAITING_AFFECTATION", otherField: 2 };
            const updated = { _id: "id", statusPhase1: "AFFECTED", otherField: 2 };
            const options = JEUNE_PATCHHISTORY_OPTIONS;
            const user = { firstName: "firstName" };

            const result = HistoryMapper.toUpdateHistory(original, updated, options, user);

            expect(result).toEqual({
                modelName: "young",
                ops: [
                    {
                        op: "replace",
                        originalValue: "WAITING_AFFECTATION",
                        path: "/statusPhase1",
                        value: "AFFECTED",
                    },
                ],
                ref: "id",
                user: {
                    firstName: "firstName",
                },
            });
        });
    });
});
