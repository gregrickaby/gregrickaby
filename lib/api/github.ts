export interface Repo {
  id: number
  name: string
  description: string
  stargazers_count: number
  html_url: string
}

/**
 * Get most starred GitHub repos.
 *
 * @see https://docs.github.com/en/rest/reference/repos#list-repositories-for-a-user
 */
export async function getGithubRepos(limit: number): Promise<Repo[]> {
  try {
    // Fetch 100 repos from the GitHub API.
    const response = await fetch(
      `https://api.github.com/users/gregrickaby/repos?per_page=100`
    )

    // If the response status is not 200, throw an error.
    if (!response.ok) {
      console.error('Response Status:', response.status)
      throw new Error(response.statusText)
    }

    // Read the response as JSON.
    const repos = await response.json()

    // Verify data has repos.
    if (!repos || repos.length === 0) {
      throw new Error('No repos found.')
    }

    // Sort repositories by stargazers_count in descending order.
    const sortedRepos = repos.sort(
      (a: Repo, b: Repo) => b.stargazers_count - a.stargazers_count
    )

    // Return the top N repos.
    return sortedRepos.slice(0, limit)
  } catch (error) {
    console.error(error)
    throw error
  }
}
