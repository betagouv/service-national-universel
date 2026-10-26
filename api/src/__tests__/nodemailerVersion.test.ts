function isAtLeast(version: string, min: string): boolean {
  const v = version.split(".").map(Number);
  const m = min.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (v[i] > m[i]) return true;
    if (v[i] < m[i]) return false;
  }
  return true;
}

it("nodemailer >= 10.0.9 (alertes Dependabot 912-926, GOO-177)", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { version } = require("nodemailer/package.json");
  expect(isAtLeast(version, "10.0.9")).toBe(true);
});
