module.exports = {
  mode: "jit",
  purge: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "snu-purple-900": "#392f79",
        "snu-purple-600": "#43389b",
        "snu-purple-300": "#5145cc",
      },
      font: {
        sans: ["Ubuntu", "ui-sans-serif", "system-ui"],
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
