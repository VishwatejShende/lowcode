/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            colors: {
                bg: '#0f1117',
                card: '#1c2028',
                accent: '#388bfd',
                'accent-hover': '#58a3ff',
                border: '#2a2f3a',
                muted: '#6b7280',
                surface: '#252b36',
            },
            fontFamily: {
                sans: ['DM Sans', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};