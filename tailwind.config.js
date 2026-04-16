/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#f7f3ea",
        mist: "#ece5d8",
        ink: "#14110f",
        line: "#cfc5b5",
        primary: {
          50: "#fef1ec",
          100: "#fbd4c7",
          200: "#f5a889",
          300: "#eb7a55",
          400: "#d95f3d",
          500: "#c4492d",
          600: "#a93a22",
          700: "#8f2e1b",
          800: "#702416",
          900: "#4f190f",
        },
        accent: {
          50: "#eaf6f2",
          100: "#d9eee8",
          200: "#b6ddd2",
          300: "#8ec7b8",
          400: "#61ab99",
          500: "#468f7c",
          600: "#2f7a66",
          700: "#286454",
          800: "#234e44",
          900: "#1d3a32",
        },
        neutral: {
          50: "#f9f7f3",
          100: "#f1ede6",
          200: "#e4dbcf",
          300: "#d3c6b4",
          400: "#b5a794",
          500: "#8c8174",
          600: "#6a6259",
          700: "#4f4842",
          800: "#3f3b37",
          900: "#2a2724",
          950: "#171513",
        },
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "sans-serif"],
        display: ["var(--font-dm-serif)", "serif"],
      },
      screens: {
        xs: "360px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      boxShadow: {
        premium: "0 12px 50px rgba(20, 17, 15, 0.08)",
        "premium-lg": "0 24px 80px rgba(20, 17, 15, 0.14)",
        soft: "0 8px 30px rgba(47, 122, 102, 0.12)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(.2,.8,.2,1)",
        "slide-up": "slideUp 0.7s cubic-bezier(.2,.8,.2,1)",
        "slide-down": "slideDown 0.6s cubic-bezier(.2,.8,.2,1)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
