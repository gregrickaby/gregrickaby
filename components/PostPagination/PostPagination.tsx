'use client'

import {Pagination} from '@mantine/core'
import {useRouter} from 'next/navigation'

interface PostPaginationProps {
  total: number
  current: number
  baseUrl?: string
}

export function PostPagination({
  total,
  current,
  baseUrl = '/'
}: Readonly<PostPaginationProps>) {
  const router = useRouter()

  if (total <= 1) return null

  const separator = baseUrl.includes('?') ? '&' : '?'

  return (
    <Pagination
      mt="xl"
      total={total}
      value={current}
      onChange={(page) => router.push(`${baseUrl}${separator}page=${page}`)}
    />
  )
}
