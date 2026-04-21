/**
 * Repo-backed JSON storage.
 *
 * In production (Vercel), the filesystem is read-only, so we commit JSON
 * updates back to the GitHub repo via the GitHub REST API. This triggers a
 * Vercel rebuild, and within a minute or two the new data is live on the site.
 *
 * In local development (no GITHUB_TOKEN set), we fall back to plain
 * readFileSync / writeFileSync so you can edit instantly without round-tripping
 * through GitHub.
 *
 * Required env vars for production saves:
 *   GITHUB_TOKEN   — fine-grained personal access token with
 *                    "Contents: Read and write" permission on the repo
 *   GITHUB_OWNER   — GitHub username or org (e.g. "dwicks2113")
 *   GITHUB_REPO    — repo name (e.g. "meridas-garden2")
 *   GITHUB_BRANCH  — branch to commit to (defaults to "main")
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TOKEN  = process.env.GITHUB_TOKEN;
const OWNER  = process.env.GITHUB_OWNER;
const REPO   = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";

const useGitHub = !!(TOKEN && OWNER && REPO);

interface GhFileResponse {
  content: string;   // base64
  sha: string;
  encoding: string;
}

async function ghRead(repoPath: string): Promise<{ content: string; sha: string }> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${encodeURIComponent(BRANCH)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub read ${repoPath} failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as GhFileResponse;
  const content = Buffer.from(json.content, "base64").toString("utf-8");
  return { content, sha: json.sha };
}

async function ghWrite(
  repoPath: string,
  content: string,
  sha: string,
  commitMessage: string
): Promise<void> {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${repoPath}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      message: commitMessage,
      content: Buffer.from(content, "utf-8").toString("base64"),
      sha,
      branch: BRANCH,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub write ${repoPath} failed (${res.status}): ${body}`);
  }
}

/**
 * Read the current JSON contents of a file in the repo. In production this
 * fetches the live committed version via the GitHub API; in dev it reads from
 * disk. Use this inside mutating API routes only — ordinary pages should keep
 * using the top-of-file `import x from "@/data/x.json"` form.
 */
export async function readRepoJson<T = unknown>(repoPath: string): Promise<T> {
  if (useGitHub) {
    const { content } = await ghRead(repoPath);
    return JSON.parse(content) as T;
  }
  const full = join(process.cwd(), repoPath);
  return JSON.parse(readFileSync(full, "utf-8")) as T;
}

/**
 * Atomically read, modify, and write back a JSON file in the repo.
 *
 * In production this uses the GitHub API's file-update endpoint with SHA
 * concurrency control — a single commit per call. In dev it just rewrites
 * the file on disk.
 *
 * @param repoPath       path relative to the repo root, e.g. "src/data/recipes.json"
 * @param updater        function that takes the current parsed JSON and returns
 *                       the next version (may mutate or replace)
 * @param commitMessage  message used for the GitHub commit (ignored locally)
 * @returns              the updated value (post-updater)
 */
export async function updateRepoJson<T = unknown>(
  repoPath: string,
  updater: (current: T) => T,
  commitMessage: string
): Promise<T> {
  if (useGitHub) {
    const { content, sha } = await ghRead(repoPath);
    const current  = JSON.parse(content) as T;
    const snapshot = JSON.stringify(current); // before updater may mutate
    const next     = updater(current);
    // Skip the commit if nothing changed — GitHub rejects no-op file updates
    // with 422, and an empty commit is also useless.
    if (JSON.stringify(next) === snapshot) return next;
    await ghWrite(
      repoPath,
      JSON.stringify(next, null, 2) + "\n",
      sha,
      commitMessage
    );
    return next;
  }

  const full     = join(process.cwd(), repoPath);
  const current  = JSON.parse(readFileSync(full, "utf-8")) as T;
  const snapshot = JSON.stringify(current);
  const next     = updater(current);
  if (JSON.stringify(next) === snapshot) return next;
  writeFileSync(full, JSON.stringify(next, null, 2) + "\n");
  return next;
}

/**
 * True if we're running in a mode where saves will be committed to GitHub
 * (i.e. all required env vars are present). Useful if the client wants to
 * tell the user "this will trigger a rebuild" vs "saved locally".
 */
export function isUsingGitHub(): boolean {
  return useGitHub;
}
