const colors = require("tailwindcss/colors");
/* https://find-nearest-tailwind-colour.netlify.app/ */
module.exports = {
  mode: "jit",
  purge: {
    mode: "all",
    content: ["./src/{components,pages,layout}/**/*.{js,ts,jsx,tsx}", "node_modules/react-toastify/dist/ReactToastify.min.css"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    screens: {
      sm: "300px",
      // => @media (min-width: 300px) { ... }
      md: "768px",

      lg: "1024px",

      xl: "1280px",

      "2xl": "1536px",
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
        "snu-purple-900": "#32257F",
        "snu-purple-800": "#3830a9",
        "snu-purple-600": "#43389b",
        "snu-purple-300": "#5145cc",
        "snu-purple-200": "#4F46E5",
        "snu-purple-100": "#C7D2FE",
        warmGray: colors.warmGray,
        trueGray: colors.trueGray,
        coolGray: colors.coolGray,
      },
      font: {
        sans: ["Ubuntu", "ui-sans-serif", "system-ui"],
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
      80: "20rem",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
