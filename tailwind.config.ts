// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: 'var(--color-primary)',
                secondary: 'var(--color-secondary)',
                background: 'var(--color-background)',
                foreground: 'var(--color-foreground)',
                accent: 'var(--color-accent)',
            },
        },
    },
    plugins: [],
}

export default config
