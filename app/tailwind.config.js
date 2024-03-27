const { Media } = require("reactstrap");
const colors = require("tailwindcss/colors");
const plugin = require("tailwindcss/plugin");

/* https://find-nearest-tailwind-colour.netlify.app/ */
module.exports = {
  presets: [require("@snu/ds/tailwind.config")],
  content: ["./src/**/*.{js,ts,jsx,tsx}", "../packages/ds/dist/**/*.{js,jsx}"],
  safelist: ["w-full", "w-auto", "w-10"],
  darkMode: Media, // or 'media' or 'class'
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
    extend: {
      transitionProperty: {
        height: "height",
        maxHeight: "max-height",
      },
      lineHeight: {
        12: "3rem",
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(0deg, rgba(66, 56, 157, 1) 0%, rgba(66, 56, 157, 0.8575805322128851) 24%, rgba(66, 56, 157, 0.5606617647058824) 79%, rgba(0, 212, 255, 0) 100%), url('/src/assets/phase3.jpg')",
      },
      cursor: {
        "col-resize": "col-resize",
        "row-resize": "row-resize",
      },
      boxShadow: {
        one: "rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
        base: "0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)",
        block: "0px 10px 20px rgba(0, 0, 0, 0.1)",
        nina: "0px 2px 10px 1px #00000012",
        ninaButton: "0px 4px 10px 3px rgba(0, 0, 0, 0.07);",
        ninaBlock: "0px 2px 15px 2px rgba(0, 0, 0, 0.09);",
        ninaInverted: "0px -16px 16px -16px rgba(0, 0, 0, 0.32), 0px -8px 16px rgba(0, 0, 0, 0.1)",
        ninaBlue: "0px 8px 15px rgba(50,70,255,0.3)",
      },
      fontSize: {
        0: "0px",
      },
      colors: {
        "snu-purple-900": "#32257F",
        "snu-purple-800": "#3830a9",
        "snu-purple-600": "#43389b",
        "snu-purple-300": "#5145cc",
        "snu-purple-200": "#4F46E5",
        "snu-purple-100": "#C7D2FE",
        warmGray: colors.stone,
        trueGray: colors.neutral,
        coolGray: colors.gray,
        "beige-gris-galet-975": "#f9f6f2",
        "blue-france-sun-113": "#000091",
        "blue-france-sun-113-hover": "#1212ff",
        "blue-france-info": "#0063cb",
        "grey-625": "#929292",
        "grey-925": "#e5e5e5",
        "snu-primary": "#42389d",
        "snu-primary-2": "#5145cd",
      },
      font: {
        sans: ["Ubuntu", "ui-sans-serif", "system-ui"],
        caveat: ["Caveat", "cursive"],
      },
      fontFamily: {
        ubuntu: ["Marianne", "Ubuntu", "ui-sans-serif", "system-ui"],
        caveat: ["Caveat", "cursive"],
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
    maxHeight: {
      0: "0",
      42: "0",
      32: "8rem",
      36: "9rem",
      40: "10rem",
      44: "11rem",
      48: "12rem",
      52: "13rem",
      56: "14rem",
      60: "15rem",
      62: "16rem",
      66: "17rem",
      80: "20rem",
      84: "21rem",
      88: "22rem",
      90: "23rem",
      94: "24rem",
      96: "25rem",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("third", "&:nth-child(3)");
    }),
  ],
};
