import * as core from '@actions/core';
import * as github from '@actions/github';

import { createAuthenticatedOctokit } from './auth';
import {
  BOT_MARKER,
  CANCELLED_MARKER,
  FORCE_REVIEW_MARKER,
  REVIEW_COMPLETE_MARKER,
  RUN_ID_MARKER_REGEX,
  markProgressCommentCancelled,
} from './github';

/**
 * Post-step that runs on cancellation/failure. Finds this run's progress
 * comment (matched by its embedded run_id marker) and marks it cancelled
 * proactively so the next trigger won't treat it as a zombie.
 */
async function runPost(): Promise<void> {
  const runId = github.context.runId;
  const owner = github.context.repo.owner;
  const repo = github.context.repo.repo;

  const prNumber =
    github.context.payload.pull_request?.number ??
    github.context.payload.issue?.number;
  if (!prNumber) {
    core.info('No PR/issue number in context — skipping post-cleanup');
    return;
  }

  let octokit;
  try {
    ({ octokit } = await createAuthenticatedOctokit());
  } catch (error) {
    core.warning(`Post-cleanup: failed to authenticate: ${error instanceof Error ? error.message : error}`);
    return;
  }

  let comments;
  try {
    ({ data: comments } = await octokit.rest.issues.listComments({
      owner, repo, issue_number: prNumber, per_page: 100, direction: 'desc',
    }));
  } catch (error) {
    core.warning(`Post-cleanup: failed to list comments: ${error instanceof Error ? error.message : error}`);
    return;
  }

  const target = comments.find(c => {
    if (c.user?.type !== 'Bot') return false;
    const body = c.body ?? '';
    if (!body.includes(BOT_MARKER)) return false;
    if (body.includes(REVIEW_COMPLETE_MARKER)) return false;
    if (body.includes(FORCE_REVIEW_MARKER)) return false;
    if (body.includes(CANCELLED_MARKER)) return false;
    const match = body.match(RUN_ID_MARKER_REGEX);
    return match !== null && Number(match[1]) === runId;
  });

  if (!target) {
    core.info(`Post-cleanup: no progress comment found for run ${runId}`);
    return;
  }

  await markProgressCommentCancelled(
    octokit, owner, repo, target.id, target.body ?? '',
    'Review cancelled (run was cancelled or failed)',
  );
  core.info(`Post-cleanup: marked progress comment ${target.id} as cancelled`);
}

runPost().catch(error => {
  core.warning(`Post-cleanup failed: ${error instanceof Error ? error.message : error}`);
});
