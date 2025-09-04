/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b0b0c',
        surface: '#111214',
        primary: '#d3132a',
        accent: '#f7b500',
        'text-primary': '#f5f7fa',
        'text-muted': '#b4b8bf',
        success: '#21c27a',
        warning: '#f7b500',
        danger: '#ff3b30',
      },
    },
  },
  plugins: [],
}