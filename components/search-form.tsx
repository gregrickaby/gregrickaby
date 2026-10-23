import Form from 'next/form'

import { SearchIcon } from '@/components/icons'

import styles from './search-form.module.css'

/**
 * A GET form to `/search`. With JavaScript, `next/form` navigates on the
 * client and prefetches the results page; without it, the browser submits it.
 */
export function SearchForm({ defaultValue, id }: { defaultValue?: string; id: string }) {
  return (
    <Form action="/search" className={styles.form} role="search">
      <label className="visually-hidden" htmlFor={id}>
        Search posts
      </label>
      <input
        className={styles.input}
        defaultValue={defaultValue}
        id={id}
        name="q"
        placeholder="Search posts"
        type="search"
      />
      <button aria-label="Search" className={styles.button} data-boop="tilt" type="submit">
        <SearchIcon size={16} />
      </button>
    </Form>
  )
}
