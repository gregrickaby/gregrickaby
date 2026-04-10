'use client'

import {createTheme, CSSVariablesResolver} from '@mantine/core'

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-text': 'rgb(51, 51, 51)',
    '--mantine-color-dimmed': 'rgb(89, 89, 89)'
  },
  dark: {'--mantine-color-text': 'rgb(198, 198, 198)'}
})

export const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'var(--font-sans), sans;',
  fontSizes: {md: '18px'},
  headings: {
    fontFamily: 'var(--font-serif), sans-serif'
  }
})
