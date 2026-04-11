'use client'

import type {PostMeta} from '@/lib/types'
import {ActionIcon} from '@mantine/core'
import {Spotlight, spotlight} from '@mantine/spotlight'
import {IconSearch} from '@tabler/icons-react'
import {useRouter} from 'next/navigation'

/**
 * Props for the Search component.
 *
 * @interface
 */
interface SearchProps {
  /** Array of post metadata for searchable posts. */
  posts: PostMeta[]
}

/**
 * Spotlight search modal that allows users to quickly find and navigate
 * to posts by searching titles and descriptions.
 *
 * @param props - The props for the Search component.
 * @returns A React element with the spotlight search modal.
 */
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

/**
 * A button that opens the spotlight search modal when clicked.
 * Displays a search icon and is typically placed in the header.
 *
 * @returns A React element with the search button.
 */
export function SearchButton() {
  return (
    <ActionIcon aria-label="Search" onClick={spotlight.open} variant="subtle">
      <IconSearch size={16} />
    </ActionIcon>
  )
}
