import {MantineProvider} from '@mantine/core'
import {RenderOptions, render as rtlRender} from '@testing-library/react'
import type {PropsWithChildren, ReactElement} from 'react'

/**
 * Custom render function that wraps the UI with all required providers.
 */
export function render(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const Wrapper = ({children}: PropsWithChildren) => (
    <MantineProvider defaultColorScheme="auto">{children}</MantineProvider>
  )

  return {
    ...rtlRender(ui, {wrapper: Wrapper, ...options})
  }
}
