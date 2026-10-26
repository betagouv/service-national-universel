import { REDACTED, FILTERED, redactFrontUrl, redactFrontBreadcrumb, redactFrontSentryEvent } from "../index";

// JWT factice construit à l'exécution : un littéral de forme JWT déclenche les scanners de secrets
const base64url = (value: object | string) => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url");
const JWT = [base64url({ alg: "HS256" }), base64url({ _id: "123" }), base64url("signature")].join(".");
const TOKEN_40 = "f".repeat(40);
const YOUNG_ID = "5f8d0d55b54764421b7156c1";

describe("sentryFront", () => {
  describe("redactFrontUrl", () => {
    it("retire la query string et le fragment", () => {
      expect(redactFrontUrl(`https://moncompte.snu.gouv.fr/validate-contract?token=${TOKEN_40}`)).toBe(
        `https://moncompte.snu.gouv.fr/validate-contract?${FILTERED}`,
      );
      expect(redactFrontUrl("/ticket?advancedSearch=jean.dupont@mail.fr#top")).toBe(`/ticket?${FILTERED}`);
    });

    it("masque les jetons portés par le chemin et garde les identifiants", () => {
      expect(redactFrontUrl(`https://api.snu.gouv.fr/contract/token/${TOKEN_40}`)).toBe(`https://api.snu.gouv.fr/contract/token/${REDACTED}`);
      expect(redactFrontUrl(`/young/validate_phase3/${YOUNG_ID}/${TOKEN_40}`)).toBe(`/young/validate_phase3/${YOUNG_ID}/${REDACTED}`);
    });

    it("laisse une URL sans secret intacte", () => {
      expect(redactFrontUrl(`/volontaire/${YOUNG_ID}/phase2`)).toBe(`/volontaire/${YOUNG_ID}/phase2`);
    });
  });

  describe("redactFrontBreadcrumb", () => {
    it("supprime les breadcrumbs console", () => {
      expect(
        redactFrontBreadcrumb({
          category: "console",
          message: "validate data: ",
          data: { arguments: [{ address: "1 rue" }] },
        }),
      ).toBeNull();
    });

    it("rédige les URL des breadcrumbs fetch et navigation", () => {
      const fetchCrumb = redactFrontBreadcrumb({
        category: "fetch",
        data: {
          url: `https://api.snu.gouv.fr/contract/token/${TOKEN_40}?x=1`,
          method: "GET",
          status_code: 500,
        },
      });
      expect(fetchCrumb?.data).toEqual({
        url: `https://api.snu.gouv.fr/contract/token/${REDACTED}?${FILTERED}`,
        method: "GET",
        status_code: 500,
      });

      const navigation = redactFrontBreadcrumb({
        category: "navigation",
        data: { from: "/auth", to: `/auth/reset?token=${TOKEN_40}` },
      });
      expect(navigation?.data).toEqual({
        from: "/auth",
        to: `/auth/reset?${FILTERED}`,
      });
    });
  });

  describe("redactFrontSentryEvent", () => {
    it("retire le JWT et les corps de requête des extras", () => {
      const event = redactFrontSentryEvent({
        extra: {
          path: "CHECK TOKEN",
          token: JWT,
          body: { email: "a@b.fr", password: "secret" },
          responseText: "<html>",
        },
      });
      expect(event?.extra).toEqual({
        path: "CHECK TOKEN",
        token: REDACTED,
        body: FILTERED,
        responseText: FILTERED,
      });
    });

    it("retire l'en-tête Authorization, le corps et la réponse d'une AxiosError (extraErrorDataIntegration)", () => {
      const event = redactFrontSentryEvent({
        contexts: {
          trace: { trace_id: "abc", span_id: "def" },
          AxiosError: {
            code: "ERR_BAD_RESPONSE",
            status: 500,
            config: {
              url: `/young/${YOUNG_ID}?q=secret`,
              method: "put",
              headers: {
                Authorization: `JWT ${JWT}`,
                "Content-Type": "application/json",
              },
              data: JSON.stringify({
                firstName: "Jean",
                allergies: "arachide",
              }),
            },
            response: { status: 500, data: { ok: false } },
            request: {},
          },
        },
      });
      const axiosContext = event?.contexts.AxiosError as Record<string, any>;
      expect(axiosContext.config.headers.Authorization).toBe(REDACTED);
      expect(axiosContext.config.data).toBe(FILTERED);
      expect(axiosContext.config.url).toBe(`/young/${YOUNG_ID}?${FILTERED}`);
      expect(axiosContext.response).toBe(FILTERED);
      expect(axiosContext.request).toBe(FILTERED);
      expect(axiosContext.status).toBe(500);
      expect(event?.contexts.trace).toEqual({
        trace_id: "abc",
        span_id: "def",
      });
    });

    it("supprime le state Redux joint par createReduxEnhancer", () => {
      const event = redactFrontSentryEvent({
        contexts: {
          state: {
            state: {
              type: "redux",
              value: { Auth: { young: { email: "a@b.fr" } } },
            },
          },
        },
      });
      expect(event?.contexts).toEqual({});
    });

    it("nettoie la requête, les en-têtes, l'utilisateur, les messages et les spans", () => {
      const event = redactFrontSentryEvent({
        request: {
          url: `https://admin.snu.gouv.fr/auth/signup/invite?token=${TOKEN_40}`,
          query_string: `token=${TOKEN_40}`,
          cookies: { jwt_ref: JWT },
          data: { password: "x" },
          headers: {
            Authorization: `JWT ${JWT}`,
            Referer: `https://admin.snu.gouv.fr/validate?token=${TOKEN_40}&young_id=${YOUNG_ID}`,
            "User-Agent": "Firefox",
          },
        },
        user: { id: YOUNG_ID, email: "jean.dupont@mail.fr" },
        message: `Failed to fetch https://api.snu.gouv.fr/contract/token/${TOKEN_40}`,
        exception: {
          values: [
            {
              type: "TypeError",
              value: `NetworkError when attempting to fetch /auth/reset?token=${TOKEN_40}`,
            },
          ],
        },
        transaction: "/validate-contract",
        spans: [
          {
            description: `GET https://api.snu.gouv.fr/contract/token/${TOKEN_40}?a=1`,
            data: { url: `https://api.snu.gouv.fr/x?token=${TOKEN_40}` },
          },
        ],
        breadcrumbs: [
          { category: "console", message: "capture" },
          { category: "ui.click", message: "button" },
        ],
      });
      expect(event?.request).toEqual({
        url: `https://admin.snu.gouv.fr/auth/signup/invite?${FILTERED}`,
        headers: {
          Authorization: REDACTED,
          Referer: `https://admin.snu.gouv.fr/validate?${FILTERED}`,
          "User-Agent": "Firefox",
        },
      });
      expect(event?.user).toEqual({ id: YOUNG_ID, email: "j***@mail.fr" });
      expect(event?.message).toBe(`Failed to fetch https://api.snu.gouv.fr/contract/token/${REDACTED}`);
      expect(event?.exception.values[0].value).toBe(`NetworkError when attempting to fetch /auth/reset?token=${REDACTED}`);
      expect(event?.spans[0]).toEqual({
        description: `GET https://api.snu.gouv.fr/contract/token/${REDACTED}?${FILTERED}`,
        data: { url: `https://api.snu.gouv.fr/x?${FILTERED}` },
      });
      expect(event?.breadcrumbs).toEqual([{ category: "ui.click", message: "button" }]);
    });

    it("n'échoue jamais : un objet dont la lecture lève est abandonné plutôt qu'envoyé", () => {
      const hostile = {};
      Object.defineProperty(hostile, "extra", {
        enumerable: true,
        get() {
          throw new Error("boom");
        },
      });
      expect(redactFrontSentryEvent(hostile)).toBeNull();
    });
  });
});
