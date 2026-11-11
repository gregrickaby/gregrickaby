import { describe, expect, it } from 'vitest'

import { splitDemos, splitSections } from '@/lib/html'

describe('splitSections', () => {
  it('splits at each h2, keeping the lead', () => {
    expect(
      splitSections(
        '<p>Lead</p>\n<h2 id="a">First</h2>\n<p>One</p><h2 id="b">Second</h2><p>Two</p>',
      ),
    ).toEqual([
      { id: null, title: null, html: '<p>Lead</p>' },
      { id: 'a', title: 'First', html: '<p>One</p>' },
      { id: 'b', title: 'Second', html: '<p>Two</p>' },
    ])
  })

  it('returns one section when there are no headings', () => {
    expect(splitSections('<p>Only</p>')).toEqual([{ id: null, title: null, html: '<p>Only</p>' }])
  })
})

describe('splitDemos', () => {
  it('splits HTML around demo markers, dropping empty runs', () => {
    expect(
      splitDemos(
        '<p>One</p>\n<div data-demo="notes"></div>\n<div data-demo="fade"></div><p>Two</p>',
      ),
    ).toEqual([{ html: '<p>One</p>' }, { demo: 'notes' }, { demo: 'fade' }, { html: '<p>Two</p>' }])
  })

  it('returns the HTML as one run without markers', () => {
    expect(splitDemos('<p>Only</p>')).toEqual([{ html: '<p>Only</p>' }])
  })
})
