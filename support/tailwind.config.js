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
    extend: {
      colors: {
        "snu-purple-900": "#342484",
        "snu-purple-800": "#3830a9",
        "snu-purple-600": "#43389b",
        "snu-purple-300": "#5145cc",
        "snu-purple-100": "#dee7ff",
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
    },
    maxHeight: {
      0: "0",
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
