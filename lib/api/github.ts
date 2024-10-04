import {Repo} from '@/lib/types'

/**
 * Get most starred GitHub repos.
 *
 * @see https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
 */
export async function getGithubRepos(limit: number): Promise<Repo[]> {
  try {
    // Send the request to the GitHub API.
    const response = await fetch(
      `https://api.github.com/users/gregrickaby/repos?per_page=100`,
      {next: {revalidate: 3600}} // 1 hour.
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const repos: Repo[] = await response.json()

    // Verify data has repos.
    if (!repos || repos.length === 0) {
      throw new Error('No repos found.')
    }

    // Sort repositories by stargazers_count in descending order.
    const sortedRepos = repos.toSorted(
      (a: Repo, b: Repo) => b.stargazers_count - a.stargazers_count
    )

    // Return the top N repos.
    return sortedRepos.slice(0, limit)
  } catch (error) {
    console.error(`Exception thrown in getGithubRepos():`, error)
    throw error
  }
}
