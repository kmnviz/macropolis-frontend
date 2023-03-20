const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
      './src/pages/**/*.js',
      './src/components/**/*.js'
  ],
  theme: {
    fontFamily: {
        poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
    },
    extend: {
        width: {
            '384': '384px',
        }
    },
  },
  plugins: [],
}
