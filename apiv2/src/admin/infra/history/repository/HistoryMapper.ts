import { createPatch } from "mongoose-patch-history";
import { PatchType } from "snu-lib";

export class HistoryMapper {
    static toUpdateHistory(original: object & { _id: string }, updated: object, options: any, user: object): PatchType {
        const doc = {
            data: () => updated,
            _original: original,
            _user: user,
            _id: original._id,
            modelName: options.includes?.modelName?.default,
            patches: {
                create: (patch) => patch,
            },
        };
        const history = createPatch(doc, options);
        return history;
    }
}
