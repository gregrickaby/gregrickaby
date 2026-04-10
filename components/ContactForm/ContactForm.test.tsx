import {render, screen} from '@/test-utils'
import {useActionState} from 'react'
import {ContactForm} from './ContactForm'

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useActionState: vi.fn(() => [{success: false, error: null}, vi.fn(), false])
  }
})

vi.mock('@/app/contact/actions', () => ({
  sendContactEmail: vi.fn()
}))

describe('ContactForm', () => {
  it('renders the heading', () => {
    render(<ContactForm />)
    expect(
      screen.getByRole('heading', {level: 1, name: 'Contact'})
    ).toBeInTheDocument()
  })

  it('renders the Name field', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  })

  it('renders the Email field', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('renders the How Can I Help dropdown', () => {
    render(<ContactForm />)
    expect(
      screen.getByRole('combobox', {name: /how can i help/i})
    ).toBeInTheDocument()
  })

  it('renders the Message field', () => {
    render(<ContactForm />)
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<ContactForm />)
    expect(
      screen.getByRole('button', {name: /send message/i})
    ).toBeInTheDocument()
  })

  it('shows the success alert when the action succeeds', () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {success: true, error: null},
      vi.fn(),
      false
    ])
    render(<ContactForm />)
    expect(screen.getByText('Message sent!')).toBeInTheDocument()
    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument()
  })

  it('shows the error alert when the action returns an error', () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {success: false, error: 'Something went wrong sending your message.'},
      vi.fn(),
      false
    ])
    render(<ContactForm />)
    expect(
      screen.getByText('Something went wrong sending your message.')
    ).toBeInTheDocument()
  })

  it('disables the submit button while pending', () => {
    vi.mocked(useActionState).mockReturnValueOnce([
      {success: false, error: null},
      vi.fn(),
      true
    ])
    render(<ContactForm />)
    expect(screen.getByRole('button', {name: /send message/i})).toBeDisabled()
  })
})
