import { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        dsfr: {
          "focus-blue": "#0a76f6",
        },
        ds: {
          gray: {
            900: "#111827",
            500: "#6B7280",
            400: "#9CA3AF",
          },
          "deep-blue": {
            900: "#0C1035",
            500: "#30345B",
            50: "#EEEFF5",
          },
        },
      },
      boxShadow: {
        container: "0px 0px 8px 0px rgba(0, 0, 0, 0.08)",
        "fr-container": "0px 5px 10px 0 rgba(0, 0, 0, 0.05)",
      },
    },
  },
} as Partial<Config>;
