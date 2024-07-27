import type {Config} from 'tailwindcss'

const config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['var(--font-sans)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'Times', 'serif']
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      typography: (theme: any) => ({
        DEFAULT: {
          // Default Prose styles.
          css: {
            a: {
              textDecoration: 'underline',
              '&:hover': {
                textDecoration: 'none'
              }
            },
            h1: {
              fontFamily: 'var(--font-serif)',
              letterSpacing: theme('letterSpacing.tight'),
              textRendering: 'optimizeLegibility',
              textShadow: '0 2px 0 rgba(0, 0, 0, 0.05)'
            },
            h2: {
              fontFamily: 'var(--font-serif)',
              letterSpacing: theme('letterSpacing.tight'),
              textRendering: 'optimizeLegibility',
              textShadow: '0 2px 0 rgba(0, 0, 0, 0.05)'
            },
            p: {
              textRendering: 'optimizeLegibility'
            },
            pre: {
              fontSize: '0.875rem'
            }
          }
        },
        xl: {
          // XL Prose styles.
          css: {
            h1: {
              fontSize: '4rem',
              lineHeight: '1.1',
              marginBottom: theme('margin.6')
            },
            h2: {
              fontSize: '2.5rem',
              lineHeight: '1.1',
              marginBottom: theme('margin.4')
            },
            pre: {
              fontSize: '1rem'
            }
          }
        }
      })
    }
  },
  plugins: [require('@tailwindcss/typography')]
} satisfies Config

export default config
