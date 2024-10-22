import {mockPost} from '@/mocks'
import {act, render, screen} from '@testing-library/react'
import {axe} from 'jest-axe'
import {ArticleCard} from './ArticleCard'

describe('ArticleCard Component', () => {
  it('should render an article card', () => {
    render(<ArticleCard post={mockPost} />)
    const articleCard = screen.getByTestId('article-card')
    expect(articleCard).toBeInTheDocument()
  })

  it('should not have any accessibility issues', async () => {
    const {container} = render(<ArticleCard post={mockPost} />)
    let results
    await act(async () => {
      results = await axe(container)
    })
    expect(results).toHaveNoViolations()
  })

  it('should match snapshot', () => {
    render(<ArticleCard post={mockPost} />)
    const articleCard = screen.getByTestId('article-card')
    expect(articleCard).toMatchSnapshot()
  })
})
