const mockSendMail = vi.fn().mockResolvedValue({})
const mockCreateTransport = vi.fn().mockReturnValue({sendMail: mockSendMail})

vi.mock('nodemailer', () => ({
  default: {createTransport: mockCreateTransport}
}))

function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(fields)) {
    fd.append(key, value)
  }
  return fd
}

const VALID = {
  name: 'Greg',
  email: 'greg@example.com',
  howCanIHelp: 'other',
  message: 'Hello!'
}

const INITIAL = {success: false, error: null}

describe('sendContactEmail action', () => {
  beforeEach(() => {
    mockSendMail.mockClear()
  })

  it('returns an error when a required field is missing', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData({...VALID, name: ''})
    const result = await sendContactEmail(INITIAL, fd)
    expect(result).toEqual({success: false, error: 'All fields are required.'})
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('returns an error for an invalid email address', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData({...VALID, email: 'not-an-email'})
    const result = await sendContactEmail(INITIAL, fd)
    expect(result).toEqual({
      success: false,
      error: 'Please enter a valid email address.'
    })
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('returns success and sends mail for valid input', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData(VALID)
    const result = await sendContactEmail(INITIAL, fd)
    expect(result).toEqual({success: true, error: null})
    expect(mockSendMail).toHaveBeenCalledOnce()
  })

  it('escapes HTML entities in the email body', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData({
      ...VALID,
      name: '<script>alert(1)</script>',
      message: '<img src=x onerror=alert(1)>'
    })
    await sendContactEmail(INITIAL, fd)
    const {html} = mockSendMail.mock.calls[0][0] as {html: string}
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&lt;img')
  })

  it('returns an error when sendMail throws', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('SMTP connection failed'))
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData(VALID)
    const result = await sendContactEmail(INITIAL, fd)
    expect(result).toEqual({
      success: false,
      error: 'Failed to send message. Please try again.'
    })
  })

  it('returns an error for an invalid howCanIHelp value', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData({...VALID, howCanIHelp: 'hacked value'})
    const result = await sendContactEmail(INITIAL, fd)
    expect(result).toEqual({
      success: false,
      error: 'Invalid service selection.'
    })
    expect(mockSendMail).not.toHaveBeenCalled()
  })

  it('strips CRLF from name in the from header', async () => {
    const {sendContactEmail} = await import('../contact/actions')
    const fd = makeFormData({...VALID, name: 'Greg\r\nBcc: attacker@evil.com'})
    await sendContactEmail(INITIAL, fd)
    const {from} = mockSendMail.mock.calls[0][0] as {from: string}
    expect(from).not.toContain('\r')
    expect(from).not.toContain('\n')
  })
})
