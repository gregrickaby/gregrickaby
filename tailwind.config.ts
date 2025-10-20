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
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-sans)',
              letterSpacing: theme('letterSpacing.tight'),
              textRendering: 'optimizeLegibility',
              textShadow: '0 2px 0 rgba(0, 0, 0, 0.05)'
            },
            p: {
              fontFamily: 'var(--font-serif)',
              textRendering: 'optimizeLegibility'
            },
            pre: {
              fontFamily: 'var(--font-mono)',
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
      }),
      keyframes: {
        fadeInDown: {
          '0%': {opacity: '0', transform: 'translateY(-20px)'},
          '100%': {opacity: '1', transform: 'translateY(0)'}
        },
        wiggle: {
          '0%, 100%': {transform: 'rotate(0deg)'},
          '50%': {transform: 'rotate(3deg)'}
        }
      },
      animation: {
        fadeInDown: 'fadeInDown 0.8s ease-out both',
        wiggle: 'wiggle 1s ease-in-out infinite'
      }
    }
  }
} satisfies Config

export default config
