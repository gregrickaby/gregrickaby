// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const addNextjsError = vi.fn()
vi.mock('@datadog/browser-rum-nextjs', () => ({ addNextjsError }))

const { default: RootError } = await import('@/app/error')
const { default: SiteError } = await import('@/app/(site)/error')
const { default: SearchError } = await import('@/app/search/error')
const { default: GlobalError } = await import('@/app/global-error')

const reload = vi.fn()
Object.defineProperty(window, 'location', { value: { reload }, configurable: true })

afterEach(() => {
  cleanup()
  addNextjsError.mockClear()
  reload.mockClear()
})

describe('error boundary', () => {
  it.each([
    ['root', RootError],
    ['site', SiteError],
    ['search', SearchError],
  ])('%s reports the error and offers a reload and a way home', (_name, ErrorPage) => {
    const error = Object.assign(new Error('boom'), { digest: 'd1' })
    render(<ErrorPage error={error} />)

    expect(addNextjsError).toHaveBeenCalledWith(error)
    expect(screen.getByRole('heading', { name: "Couldn't load this page" })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to the home page' }).getAttribute('href')).toBe(
      '/',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Reload the page' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})

describe('global error boundary', () => {
  it('reports the error and offers a reload', () => {
    const error = Object.assign(new Error('boom'), { digest: 'd2' })
    render(<GlobalError error={error} />)

    expect(addNextjsError).toHaveBeenCalledWith(error)
    expect(document.title).toBe("Couldn't load this page - Greg Rickaby")
    expect(screen.getByRole('heading', { name: "Couldn't load this page" })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reload the page' }))
    expect(reload).toHaveBeenCalledOnce()
  })
})
