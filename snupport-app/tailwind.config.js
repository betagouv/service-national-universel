const colors = require("tailwindcss/colors");

module.exports = {
  content: ["index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "media", // or 'media' or 'class'
  theme: {
    minWidth: {
      0: "0",
      "1/4": "265px",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
    screens: {
      sm: "300px",
      smmd: "351px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      print: { raw: "print" },
    },
    maxHeight: {
      0: "0",
      64: "16rem",
      80: "20rem",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
    extend: {
      boxShadow: {
        one: "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
        base: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        block: "0px 10px 20px rgba(0, 0, 0, 0.1)",
      },
      fontSize: {
        0: "0px",
      },
      colors: {
        "accent-color": "#4F46E5",
        "black-dark": "#111827",
        "grey-text": "#6B7280",
        "light-grey": "#D1D5DB",
        "light-purple": "#C7D2FE",
        "purple-snu": "#32257F",
        "snu-purple-900": "#32257F",
        "snu-purple-800": "#3830a9",
        "snu-purple-600": "#43389b",
        "snu-purple-300": "#5145cc",
        "snu-purple-200": "#4F46E5",
        "snu-purple-100": "#C7D2FE",
        warmGray: colors.stone,
        trueGray: colors.neutral,
        coolGray: colors.gray,
        custom: {
          green: "#61C091",
          red: "#C93D38",
        },
      },
      fontFamily: {
        inter: ["Inter", "ui-sans-serif", "system-ui"],
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      cursor: {
        "col-resize": "col-resize",
        "row-resize": "row-resize",
      },
      width: {
        "screen-1/4": "25vw",
        "screen-1/2": "50vw",
        "screen-3/4": "75vw",
      },
      maxWidth: {
        "screen-1/4": "25vw",
        "screen-1/2": "50vw",
        "screen-3/4": "75vw",
        "screen-80": "80vw",
        "screen-85": "85vw",
        "screen-90": "90vw",
        "screen-95": "95vw",
      },
      height: {
        "screen-1/4": "25vw",
        "screen-1/2": "50vw",
        "screen-3/4": "75vw",
        84: "21rem",
        88: "22rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
  variants: {
    extend: {
      display: ["group-hover"],
    },
  },
};
