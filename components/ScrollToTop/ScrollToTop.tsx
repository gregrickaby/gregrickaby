'use client'

import {ActionIcon, Affix, Transition} from '@mantine/core'
import {useWindowScroll} from '@mantine/hooks'
import {IconArrowUp} from '@tabler/icons-react'

export function ScrollToTop() {
  const [scroll, scrollTo] = useWindowScroll()

  return (
    <Affix position={{bottom: 48, right: 24}} zIndex={1}>
      <Transition transition="slide-up" mounted={scroll.y > 200}>
        {(styles) => (
          <ActionIcon
            aria-label="Scroll to top"
            onClick={() => scrollTo({y: 0})}
            size="xl"
            style={styles}
          >
            <IconArrowUp size={20} />
          </ActionIcon>
        )}
      </Transition>
    </Affix>
  )
}
