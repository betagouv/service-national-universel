export enum Folders {
    SRC = "src",
    CORE = "core",
    INFRA = "infra",
    SRC_CORE_PATTERN = "^(?=.*\bsrc\b)(?=.*\bcore\b)(?!.*.spec.ts$).*",
    SRC_CORE = "src/admin/core",
}
