import {GitHubRepo} from '@/types'

export const mockRepos: GitHubRepo[] = [
  {
    id: 1,
    name: 'repo-1',
    description: 'Mock repo',
    stargazers_count: 10,
    html_url: 'https://mockurl.com'
  },
  {
    id: 2,
    name: 'repo-2',
    description: 'Mock repo',
    stargazers_count: 5,
    html_url: 'https://mockurl.com'
  }
]
