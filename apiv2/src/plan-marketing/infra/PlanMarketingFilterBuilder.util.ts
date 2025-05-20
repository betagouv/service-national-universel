export function buildFilter(
    filter?: Record<string, unknown>,
    specialKeys: string[] = []
): Record<string, unknown> {
    return Object.entries(filter ?? {})
        .filter(([key, value]) =>
            !specialKeys.includes(key) || value !== undefined
        )
        .reduce<Record<string, unknown>>((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {});
}