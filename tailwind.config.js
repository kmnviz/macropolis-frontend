const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
        './src/pages/**/*.js',
        './src/components/**/*.js'
    ],
    theme: {
        fontFamily: {
            poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
            grotesk: ['Space Grotesk', ...defaultTheme.fontFamily.sans],
        },
        extend: {
            width: {
                '320': '320px',
                '384': '384px',
                '576': '576px',
            },
            borderRadius: {
                '4xl': '96px',
            },
        },
        screens: {
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        }
    },
    plugins: [],
}
