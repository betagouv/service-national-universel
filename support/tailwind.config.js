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
