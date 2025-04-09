import { createPatch } from "mongoose-patch-history";
import { PatchType } from "snu-lib";

export class HistoryMapper {
    static toUpdateHistory(
        original: object & { _id: string },
        updated: object,
        options: any,
        user: object,
    ): PatchType | null {
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
        if (!history.ref) {
            if (history.isFulfilled) {
                return null;
            }
            throw new Error(
                "Cannot create patch for document _id !" +
                    JSON.stringify(history) +
                    JSON.stringify(original) +
                    JSON.stringify(updated),
            );
        }
        return history;
    }

    static toUpdateHistories(
        updates: Array<{ original: object & { _id: string }; updated: object }>,
        options: any,
        user: object,
    ): PatchType[] {
        return updates.reduce((acc, history) => {
            const patch = HistoryMapper.toUpdateHistory(history.original, history.updated, options, user);
            if (patch) {
                return [...acc, patch];
            }
            return acc;
        }, [] as PatchType[]);
    }

    static toDeleteHistory({
        original,
        originalValue,
        options,
        user,
    }: {
        original: object & { _id: PatchType["ref"]; cohortId?: string };
        originalValue?: string;
        options: {
            includes: {
                modelName: {
                    default: string;
                };
            };
        };
        user: PatchType["user"];
    }): PatchType {
        const history = {
            ops: [
                {
                    op: "destroy",
                    path: "/",
                    value: "deleted",
                    originalValue: originalValue || original._id.toString(),
                },
            ],
            ref: original._id,
            cohortId: original.cohortId,
            modelName: options.includes.modelName.default,
            user: user,
            date: new Date(),
        } as PatchType;

        return history;
    }
}
