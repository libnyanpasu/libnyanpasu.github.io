import { Octokit, App } from 'octokit'

const BASE_OPTIONS = {
  owner: 'libnyanpasu',
  repo: 'clash-nyanpasu'
}

const octokit = new Octokit()

export const getLatestRelease = async () => {
  return await octokit.request(
    'GET /repos/{owner}/{repo}/releases/latest',
    BASE_OPTIONS
  )
}
