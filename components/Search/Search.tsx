'use client'

import type {PostMeta} from '@/lib/types'
import {ActionIcon} from '@mantine/core'
import {Spotlight, spotlight} from '@mantine/spotlight'
import {IconSearch} from '@tabler/icons-react'
import {useRouter} from 'next/navigation'

interface SearchProps {
  posts: PostMeta[]
}

export function Search({posts}: Readonly<SearchProps>) {
  const router = useRouter()

  const actions = posts.map((post) => ({
    id: post.slug,
    label: post.title,
    description: post.description ?? '',
    onClick: () => router.push(`/${post.slug}`)
  }))

  return (
    <Spotlight
      actions={actions}
      highlightQuery
      limit={7}
      maxHeight={350}
      nothingFound="No posts found."
      scrollable
      searchProps={{
        leftSection: <IconSearch size={16} aria-hidden />,
        placeholder: 'Search posts…'
      }}
      shortcut={['mod + K', '/']}
    />
  )
}

export function SearchButton() {
  return (
    <ActionIcon aria-label="Search" onClick={spotlight.open} variant="subtle">
      <IconSearch size={16} />
    </ActionIcon>
  )
}
