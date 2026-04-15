/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f6",
          100: "#d7e6de",
          500: "#2f6b57",
          700: "#234f41",
          900: "#16342b"
        },
        sand: "#f6f0e6",
        ink: "#18211d"
      },
      boxShadow: {
        panel: "0 18px 50px rgba(24, 33, 29, 0.08)"
      }
    },
  },
  plugins: [],
};
