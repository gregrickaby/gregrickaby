import {mockPost} from '@/lib/mocks'
import '@testing-library/jest-dom'
import {render} from '@testing-library/react'
import {axe} from 'jest-axe'
import {describe, expect} from 'vitest'
import {ArticleCard} from './ArticleCard'

describe('ArticleCard Component', () => {
  it('should render an article card', () => {
    const {getByTestId} = render(<ArticleCard post={mockPost} />)
    const articleCard = getByTestId('article-card')
    expect(articleCard).toBeInTheDocument()
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<ArticleCard post={mockPost} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    const {getByTestId} = render(<ArticleCard post={mockPost} />)
    const articleCard = getByTestId('article-card')
    expect(articleCard).toMatchSnapshot()
  })
})
