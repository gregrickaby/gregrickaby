'use client'

import {sendContactEmail} from '@/app/contact/actions'
import {INITIAL_STATE} from '@/lib/types'
import {
  Alert,
  Button,
  Container,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title
} from '@mantine/core'
import {useActionState} from 'react'

const HOW_CAN_I_HELP_OPTIONS = [
  {value: 'monthly retainer', label: 'Monthly Retainer'},
  {value: 'website hosting', label: 'Website Hosting'},
  {value: 'domain management', label: 'Domain Management'},
  {value: 'custom development', label: 'Custom Development'},
  {value: 'other', label: 'Other'}
]

/**
 * Contact form component with fields for name, email, how you can help,
 * and message. Uses a server action to send the email.
 *
 * @returns A React element with the contact form.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactEmail,
    INITIAL_STATE
  )

  return (
    <Container size="sm">
      <Stack>
        <Title order={1} ta="center">
          Contact
        </Title>
        <Text c="dimmed" ta="center">
          Use the form below to get in touch.
        </Text>

        {state.success && (
          <Alert color="green" title="Message sent!">
            Thanks for reaching out. I&apos;ll get back to you soon.
          </Alert>
        )}

        {state.error && (
          <Alert color="red" title="Something went wrong">
            {state.error}
          </Alert>
        )}

        {!state.success && (
          <form action={formAction}>
            <Stack>
              <TextInput
                label="Name"
                name="name"
                placeholder="Jane Doe"
                required
              />
              <TextInput
                label="Email"
                name="email"
                placeholder="jane.doe@email.com"
                required
                type="email"
              />
              <Select
                data={HOW_CAN_I_HELP_OPTIONS}
                label="How Can I Help?"
                name="howCanIHelp"
                placeholder="Select an option from the list"
                required
              />
              <Textarea
                autosize
                label="Message"
                minRows={5}
                name="message"
                placeholder="Your message"
                required
              />
              <Button type="submit" loading={pending}>
                Send Message
              </Button>
            </Stack>
          </form>
        )}
      </Stack>
    </Container>
  )
}
