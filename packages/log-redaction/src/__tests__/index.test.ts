import { REDACTED, isSensitiveKey, maskEmail, redactValue, redactString, redactUrl, redactLogInfo, redactSentryEvent, isUrlKey } from "../index";

const TOKEN_40 = "a".repeat(40);
const OTHER_TOKEN_40 = "b".repeat(40);

describe("logRedaction", () => {
  describe("isSensitiveKey", () => {
    it("flags referent/young secret fields whatever the case", () => {
      for (const key of [
        "password",
        "newPassword",
        "verifyPassword",
        "repassword",
        "token",
        "token2FA",
        "token_2fa",
        "TOKEN2FA",
        "invitationToken",
        "INVITATIONTOKEN",
        "forgotPasswordResetToken",
        "FORGOTPASSWORDRESETTOKEN",
        "tokenEmailValidation",
        "token_email_validation",
        "TOKENEMAILVALIDATION",
        "newEmailValidationToken",
        "phase3Token",
        "parent1Inscription2023Token",
        "parent2Inscription2023Token",
        "parent1Token",
        "parent2Token",
        "projectManagerToken",
        "structureManagerToken",
        "youngContractToken",
        "authorization",
        "cookie",
        // cookies de session, une valeur par application
        "jwt",
        "jwt_ref",
        "jwt_young",
        "jwtzamoud",
        "apiKey",
        "api-key",
        "SENDINBLUEKEY",
        "JWT_SECRET",
        // PH26 : cookie de confiance 2FA, un par compte — ni préfixe ni suffixe "token" une fois l'id concaténé.
        "trust_token-64a0f1c2b3d4e5f60718293a",
        // PH18/PM36 : `_original` (mongoose-patch-history) reprend parfois le document entier avant modification.
        "_original",
        "original",
      ]) {
        expect({ key, sensitive: isSensitiveKey(key) }).toEqual({ key, sensitive: true });
      }
    });

    it("keeps identifiers, statuses, codes and expiry dates", () => {
      for (const key of [
        "_id",
        "id",
        "code",
        "status",
        "role",
        "region",
        "token2FAExpires",
        "invitationExpires",
        "forgotPasswordResetExpires",
        "passwordChangedAt",
        "listIds",
        "message",
      ]) {
        expect({ key, sensitive: isSensitiveKey(key) }).toEqual({ key, sensitive: false });
      }
    });
  });

  describe("maskEmail", () => {
    it("keeps only the first character of the local part and the domain", () => {
      expect(maskEmail("jean.dupont@example.org")).toBe("j***@example.org");
    });
  });

  describe("redactValue", () => {
    const referent = {
      _id: "64a0f1c2b3d4e5f60718293a",
      email: "jean.dupont@example.org",
      password: "$2a$10$hash",
      token2FA: "123456",
      token2FAExpires: new Date("2026-09-08T10:00:00.000Z"),
      invitationToken: TOKEN_40,
      invitationExpires: "2026-09-15T10:00:00.000Z",
      forgotPasswordResetToken: OTHER_TOKEN_40,
      forgotPasswordResetExpires: null,
      phone: "0612345678",
      mobile: "+33612345678",
      status: "ACTIVE",
      role: "referent_department",
      department: ["Finistère"],
    };

    it("masks secrets and PII of a referent document but keeps debugging context", () => {
      const out = redactValue(referent);
      expect(out).toEqual({
        _id: "64a0f1c2b3d4e5f60718293a",
        email: "j***@example.org",
        password: REDACTED,
        token2FA: REDACTED,
        token2FAExpires: new Date("2026-09-08T10:00:00.000Z"),
        invitationToken: REDACTED,
        invitationExpires: "2026-09-15T10:00:00.000Z",
        forgotPasswordResetToken: REDACTED,
        forgotPasswordResetExpires: null,
        phone: REDACTED,
        mobile: REDACTED,
        status: "ACTIVE",
        role: "referent_department",
        department: ["Finistère"],
      });
    });

    it("does not mutate its input", () => {
      const copy = JSON.parse(JSON.stringify(referent));
      redactValue(referent);
      expect(JSON.parse(JSON.stringify(referent))).toEqual(copy);
    });

    it("masks upper-cased Brevo contact attributes nested in an object", () => {
      const out = redactValue({
        res: { code: "invalid_parameter", message: "email is invalid" },
        email: "jean.dupont@example.org",
        attributes: {
          TOKEN2FA: "123456",
          INVITATIONTOKEN: TOKEN_40,
          FORGOTPASSWORDRESETTOKEN: OTHER_TOKEN_40,
          TOKENEMAILVALIDATION: "654321",
          PHASE3TOKEN: TOKEN_40,
          PARENT1EMAIL: "parent@example.org",
          PHONE: "0612345678",
          REGION: "Bretagne",
          REGISTREDAT: "2024-01-01",
        },
        listIds: [1448],
      });
      expect(out).toEqual({
        res: { code: "invalid_parameter", message: "email is invalid" },
        email: "j***@example.org",
        attributes: {
          TOKEN2FA: REDACTED,
          INVITATIONTOKEN: REDACTED,
          FORGOTPASSWORDRESETTOKEN: REDACTED,
          TOKENEMAILVALIDATION: REDACTED,
          PHASE3TOKEN: REDACTED,
          PARENT1EMAIL: "p***@example.org",
          PHONE: REDACTED,
          REGION: "Bretagne",
          REGISTREDAT: "2024-01-01",
        },
        listIds: [1448],
      });
    });

    it("masks the auth request bodies fields (signin, 2FA, reset, invite, email validation)", () => {
      const out = redactValue({
        email: "jean.dupont@example.org",
        password: "Secret1!",
        newPassword: "Secret2!",
        verifyPassword: "Secret2!",
        repassword: "Secret2!",
        token: OTHER_TOKEN_40,
        token_2fa: "123456",
        token_email_validation: "654321",
        invitationToken: TOKEN_40,
        rememberMe: true,
      });
      expect(out).toEqual({
        email: "j***@example.org",
        password: REDACTED,
        newPassword: REDACTED,
        verifyPassword: REDACTED,
        repassword: REDACTED,
        token: REDACTED,
        token_2fa: REDACTED,
        token_email_validation: REDACTED,
        invitationToken: REDACTED,
        rememberMe: true,
      });
    });

    it("walks arrays and keeps primitives, null and undefined", () => {
      expect(redactValue({ items: [{ token: "x", n: 1 }, "plain", null], u: undefined, ok: true })).toEqual({
        items: [{ token: REDACTED, n: 1 }, "plain", null],
        u: undefined,
        ok: true,
      });
      expect(redactValue("hello")).toBe("hello");
      expect(redactValue(42)).toBe(42);
      expect(redactValue(null)).toBeNull();
    });

    it("does not loop on circular references", () => {
      const a: any = { name: "a", password: "x" };
      a.self = a;
      const out: any = redactValue(a);
      expect(out.password).toBe(REDACTED);
      expect(out.name).toBe("a");
      expect(typeof out.self).toBe("string");
    });
  });

  describe("redactString", () => {
    it("masks secret values and emails inside a JSON dump embedded in a message", () => {
      const dump = JSON.stringify({
        res: { code: "invalid_parameter", message: "email is invalid" },
        email: "jean.dupont@example.org",
        attributes: { TOKEN2FA: "123456", INVITATIONTOKEN: TOKEN_40, FORGOTPASSWORDRESETTOKEN: OTHER_TOKEN_40, REGION: "Bretagne" },
        listIds: [1448],
      });
      const out = redactString(`capture: Error: ${dump}`);
      expect(out).not.toContain(TOKEN_40);
      expect(out).not.toContain(OTHER_TOKEN_40);
      expect(out).not.toContain("123456");
      expect(out).not.toContain("jean.dupont");
      expect(out).toContain('"INVITATIONTOKEN":"**********"');
      expect(out).toContain('"TOKEN2FA":"**********"');
      expect(out).toContain('"email":"j***@example.org"');
      expect(out).toContain('"code":"invalid_parameter"');
      expect(out).toContain('"REGION":"Bretagne"');
      expect(out).toContain('"listIds":[1448]');
    });

    it("masks numeric JSON values of secret keys", () => {
      expect(redactString('{"token2FA":123456,"attempts2FA":0}')).toBe('{"token2FA":"**********","attempts2FA":0}');
    });

    it("masks tokens passed as URL query parameters", () => {
      expect(redactString(`GET /auth/signup/invite?token=${TOKEN_40}&utm_source=mail`)).toBe("GET /auth/signup/invite?token=**********&utm_source=mail");
      expect(redactString("/account/general?newEmailValidationToken=123456")).toBe("/account/general?newEmailValidationToken=**********");
    });

    it("leaves ordinary messages untouched", () => {
      expect(redactString('Young without cohortId: 3, cohorts: {"2026 HTS 02":3}')).toBe('Young without cohortId: 3, cohorts: {"2026 HTS 02":3}');
      expect(redactString("")).toBe("");
    });
  });

  describe("redactLogInfo", () => {
    it("redacts the message and every meta field of a winston info object", () => {
      const info: any = {
        level: "info",
        message: `capture: Error: {"invitationToken":"${TOKEN_40}"}`,
        payload: { password: "Secret1!", token: OTHER_TOKEN_40, email: "jean.dupont@example.org" },
        userID: "64a0f1c2b3d4e5f60718293a",
      };
      const out: any = redactLogInfo(info);
      expect(out.level).toBe("info");
      expect(out.message).toBe('capture: Error: {"invitationToken":"**********"}');
      expect(out.payload).toEqual({ password: REDACTED, token: REDACTED, email: "j***@example.org" });
      expect(out.userID).toBe("64a0f1c2b3d4e5f60718293a");
    });
  });

  describe("redactLogInfo with winston edge cases", () => {
    it("masks a sensitive key placed at the top level of the info object", () => {
      const out: any = redactLogInfo({ level: "info", message: "object message", token: "abc", userID: "1" } as any);
      expect(out.token).toBe(REDACTED);
      expect(out.message).toBe("object message");
      expect(out.level).toBe("info");
      expect(out.userID).toBe("1");
    });

    it("redacts the non-enumerable message and stack of an Error used as info, without mutating it", () => {
      const error: any = new Error("boom jean.dupont@example.org");
      error.level = "error";
      const out: any = redactLogInfo(error);
      expect(out.level).toBe("error");
      expect(out.message).toBe("boom j***@example.org");
      expect(out.stack).toContain("j***@example.org");
      expect(out.stack).not.toContain("jean.dupont");
      expect(error.message).toBe("boom jean.dupont@example.org");
    });

    it("keeps winston symbol properties", () => {
      const LEVEL = Symbol.for("level");
      const info: any = { level: "info", message: "x", [LEVEL]: "info" };
      const out: any = redactLogInfo(info);
      expect(out[LEVEL]).toBe("info");
    });
  });

  describe("isSensitiveKey — token en préfixe et frontières de suffixe", () => {
    it("flags the token_<qualif> convention used in query strings", () => {
      for (const key of ["token_jva", "token_ref", "token_young", "tokenJva", "TOKEN_JVA"]) {
        expect({ key, sensitive: isSensitiveKey(key) }).toEqual({ key, sensitive: true });
      }
    });

    it("flags password confirmation fields whose suffix merely ends with at/date/count", () => {
      for (const key of ["passwordRepeat", "password_repeat", "passwordUpdate", "passwordValidate", "passwordAccount"]) {
        expect({ key, sensitive: isSensitiveKey(key) }).toEqual({ key, sensitive: true });
      }
    });

    it("still keeps the real expiry and counter fields", () => {
      for (const key of ["token2FAExpires", "invitationExpires", "forgotPasswordResetExpires", "passwordChangedAt", "attempts2FA", "loginAttempts", "REGISTREDAT", "createdAt"]) {
        expect({ key, sensitive: isSensitiveKey(key) }).toEqual({ key, sensitive: false });
      }
    });
  });

  describe("maskEmail / redactString — email encodé", () => {
    it("masks an URL-encoded email (%40)", () => {
      expect(redactString("GET /referent?email=jean.dupont%40example.org")).toBe("GET /referent?email=j***@example.org");
      expect(redactString("/young?email=jean.dupont%40example.org&page=1")).toBe("/young?email=j***@example.org&page=1");
    });
  });

  describe("redactString — messages de validation Joi", () => {
    it("masks the value quoted in a Joi message when the field is sensitive", () => {
      expect(redactString('"password" with value "abc" fails to match the required pattern')).toBe('"password" with value "**********" fails to match the required pattern');
      expect(redactString('"phone" with value "06 12" fails to match')).toBe('"phone" with value "**********" fails to match');
    });

    it("keeps the value for a non-sensitive field", () => {
      expect(redactString('"zip" with value "29200" fails to match')).toBe('"zip" with value "29200" fails to match');
    });
  });

  describe("redactString — coût borné", () => {
    it("stays linear on long adversarial strings", () => {
      for (const input of ["a".repeat(200_000), "x".repeat(100_000) + "@" + "y".repeat(100_000), "a.b".repeat(60_000)]) {
        const start = Date.now();
        redactString(input);
        expect({ len: input.length, ms: Date.now() - start < 500 }).toEqual({ len: input.length, ms: true });
      }
    });
  });

  describe("redactUrl", () => {
    it("masks a token carried as a path segment", () => {
      expect(redactUrl(`/contract/token/${TOKEN_40}`)).toBe("/contract/token/**********");
      expect(redactUrl(`/session-phase1/check-token/${TOKEN_40}`)).toBe("/session-phase1/check-token/**********");
      expect(redactUrl(`/cle/referent-signup/token/${TOKEN_40}`)).toBe("/cle/referent-signup/token/**********");
    });

    it("masks a route parameter whose name is sensitive and keeps the identifiers", () => {
      expect(redactUrl(`/young/validate_phase3/64a0f1c2b3d4e5f60718293a/${TOKEN_40}`, { young: "64a0f1c2b3d4e5f60718293a", token: TOKEN_40 })).toBe(
        "/young/validate_phase3/64a0f1c2b3d4e5f60718293a/**********",
      );
    });

    it("masks a long hex token in a path segment even without route params", () => {
      // `crypto.randomBytes(20).toString("hex")` = 40 caractères ; un ObjectId mongo en fait 24 et reste lisible
      expect(redactUrl(`/young/validate_phase3/64a0f1c2b3d4e5f60718293a/${TOKEN_40}`)).toBe("/young/validate_phase3/64a0f1c2b3d4e5f60718293a/**********");
      expect(redactUrl("/young/64a0f1c2b3d4e5f60718293a/documents")).toBe("/young/64a0f1c2b3d4e5f60718293a/documents");
    });

    it("masks sensitive query parameters and truncates emails, keeping the rest", () => {
      expect(redactUrl("/jeveuxaider/signin?token_jva=eyJhbGciOiJIUzI1NiJ9.payload.sig")).toBe("/jeveuxaider/signin?token_jva=**********");
      expect(redactUrl("/referent?email=jean.dupont%40example.org&role=admin")).toBe("/referent?email=j***@example.org&role=admin");
      expect(redactUrl("/young?page=1&cohort=2026%20HTS%2002")).toBe("/young?page=1&cohort=2026%20HTS%2002");
    });
  });

  describe("redactValue — valeurs portées par une clé générique", () => {
    it("masks the value of a Joi validation detail when its key/label is sensitive", () => {
      const out: any = redactValue({
        _original: { email: "jean.dupont@example", password: "Secret1!", zip: "29200" },
        details: [
          { message: '"email" must be a valid email', path: ["email"], context: { key: "email", label: "email", value: "jean.dupont@example", invalids: ["jean.dupont@example"] } },
          { message: '"password" length must be at least 8 characters long', path: ["password"], context: { key: "password", label: "password", limit: 8, value: "abc" } },
          { message: '"zip" must be a string', path: ["zip"], context: { key: "zip", label: "zip", value: "29200" } },
        ],
      });

      // PH26/PM36 : `_original` (le corps entier soumis à Joi) est désormais masqué en bloc, pas
      // seulement champ par champ — un champ métier non reconnu (adresse, santé…) y restait sinon en
      // clair, contrairement aux clés `details[].context` déjà reconnues et sélectivement redactées.
      expect(out._original).toBe(REDACTED);
      expect(out.details[0].context).toEqual({ key: "email", label: "email", value: "j***@example", invalids: ["j***@example"] });
      expect(out.details[1].context).toEqual({ key: "password", label: "password", limit: 8, value: REDACTED });
      expect(out.details[2].context).toEqual({ key: "zip", label: "zip", value: "29200" });
    });
  });

  describe("redactValue / redactLogInfo — robustesse", () => {
    it("does not blow the stack on a toJSON chain and never throws", () => {
      const wrapper: any = {};
      wrapper.toJSON = () => ({ toJSON: wrapper.toJSON });
      expect(() => redactValue({ wrapper })).not.toThrow();
      expect(() => redactLogInfo({ level: "info", message: "x", wrapper } as any)).not.toThrow();
    });

    it("never throws when a meta carries its own toJSON returning a primitive", () => {
      expect(() => redactLogInfo({ level: "info", message: "z", toJSON: () => 42 } as any)).not.toThrow();
      const out: any = redactLogInfo({ level: "info", message: "z", toJSON: () => 42 } as any);
      expect(out.level).toBe("info");
    });

    it("never throws when a meta has a getter that throws", () => {
      const meta: any = {
        level: "info",
        message: "y",
        get boom() {
          throw new Error("getter");
        },
      };
      expect(() => redactLogInfo(meta)).not.toThrow();
    });

    it("keeps an Error used as message printable", () => {
      const out: any = redactLogInfo({ level: "error", message: new Error("boom jean.dupont@example.org") } as any);
      expect(String(out.message)).toBe("Error: boom j***@example.org");
      const empty: any = redactLogInfo({ level: "error", message: new Error("") } as any);
      expect(String(empty.message)).toBe("Error");
    });

    it("does not hand the raw splat metas to the transports", () => {
      const SPLAT = Symbol.for("splat");
      const LEVEL = Symbol.for("level");
      const info: any = { level: "info", message: "msg", password: "Secret1!", [SPLAT]: [{ password: "Secret1!" }], [LEVEL]: "info" };
      const out: any = redactLogInfo(info);

      expect(out[LEVEL]).toBe("info");
      expect(out.password).toBe(REDACTED);
      expect(JSON.stringify(out[SPLAT] ?? null)).not.toContain("Secret1!");
    });
  });

  describe("isUrlKey — attributs de span OTel", () => {
    it("flags http.url and http.target", () => {
      expect(isUrlKey("http.url")).toBe(true);
      expect(isUrlKey("http.target")).toBe(true);
    });
  });

  describe("redactSentryEvent (PH18/PH26/PM36)", () => {
    it("supprime entièrement request.data plutôt que de le redacter par nom de clé", () => {
      const event: any = { request: { data: { firstName: "Jean", freeText: "numéro de sécu 1 85 12..." } } };
      const out: any = redactSentryEvent(event);
      expect(out.request.data).toBeUndefined();
      expect("data" in out.request).toBe(false);
    });

    it("redacte les clés de span http.url / http.target (transactions de performance)", () => {
      const event: any = {
        spans: [{ description: "GET /young", data: { "http.url": "https://api.snu.gouv.fr/young?email=victime@example.org", "http.target": "/young?token=abc" } }],
      };
      const out: any = redactSentryEvent(event);
      expect(JSON.stringify(out.spans)).not.toContain("victime@example.org");
      expect(JSON.stringify(out.spans)).not.toContain("token=abc");
    });

    it("redacte exception.values[].value (message d'erreur MongoServerError avec un email)", () => {
      const event: any = {
        exception: { values: [{ type: "MongoServerError", value: 'E11000 duplicate key error: dup key: { email: "victime@example.org" }' }] },
      };
      const out: any = redactSentryEvent(event);
      expect(out.exception.values[0].value).not.toContain("victime@example.org");
    });

    it("redacte le cookie trust_token-<id>", () => {
      const event: any = { request: { cookies: { "trust_token-64a0f1c2b3d4e5f60718293a": "jeton-secret", jwt_ref: "autre-secret" } } };
      const out: any = redactSentryEvent(event);
      expect(out.request.cookies["trust_token-64a0f1c2b3d4e5f60718293a"]).toBe(REDACTED);
      expect(out.request.cookies.jwt_ref).toBe(REDACTED);
    });
  });
});
