// @vitest-environment happy-dom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const addNextjsError = vi.fn()
vi.mock('@datadog/browser-rum-nextjs', () => ({ addNextjsError }))

const { default: RootError } = await import('@/app/error')
const { default: SiteError } = await import('@/app/(site)/error')
const { default: SearchError } = await import('@/app/search/error')
const { default: GlobalError } = await import('@/app/global-error')

afterEach(() => {
  cleanup()
  addNextjsError.mockClear()
})

describe('error boundary', () => {
  it.each([
    ['root', RootError],
    ['site', SiteError],
    ['search', SearchError],
  ])('%s reports the error and offers a retry and a way home', (_name, ErrorPage) => {
    const error = Object.assign(new Error('boom'), { digest: 'd1' })
    const retry = vi.fn()
    render(<ErrorPage error={error} retry={retry} />)

    expect(addNextjsError).toHaveBeenCalledWith(error)
    expect(screen.getByRole('heading', { name: "Couldn't load this page" })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Back to the home page' }).getAttribute('href')).toBe(
      '/',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})

describe('global error boundary', () => {
  it('reports the error and offers a retry', () => {
    const error = Object.assign(new Error('boom'), { digest: 'd2' })
    const retry = vi.fn()
    render(<GlobalError error={error} retry={retry} />)

    expect(addNextjsError).toHaveBeenCalledWith(error)
    expect(document.title).toBe("Couldn't load this page - Greg Rickaby")
    expect(screen.getByRole('heading', { name: "Couldn't load this page" })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(retry).toHaveBeenCalledOnce()
  })
})
