'use client'

import {
  createTheme,
  CSSVariablesResolver,
  MantineColorsTuple
} from '@mantine/core'

const tomato: MantineColorsTuple = [
  '#fff0e4',
  '#ffe0cf',
  '#fac0a1',
  '#f69e6e',
  '#f28043',
  '#f06e27',
  '#f06418',
  '#d6530c',
  '#bf4906',
  '#a73c00'
]

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    '--mantine-color-text': 'rgb(51, 51, 51)',
    '--mantine-color-dimmed': 'rgb(89, 89, 89)'
  },
  dark: {'--mantine-color-text': 'rgb(198, 198, 198)'}
})

export const theme = createTheme({
  colors: {tomato},
  primaryColor: 'tomato',
  primaryShade: {light: 5, dark: 6},
  fontFamily: 'var(--font-sans), sans-serif',
  fontSizes: {md: '18px'},
  headings: {
    fontFamily: 'var(--font-serif), serif'
  }
})
