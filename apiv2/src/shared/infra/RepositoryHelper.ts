export function getEntityUpdateSetUnset(entity: Record<string, any>) {
    const { set, unset } = Object.keys(entity).reduce(
        (acc, key) => {
            const value = entity[key];
            if (value === undefined) {
                acc.unset[key] = 1;
            } else {
                acc.set[key] = value;
            }
            return acc;
        },
        { set: {}, unset: {} },
    );
    return { $set: set, $unset: unset };
}
