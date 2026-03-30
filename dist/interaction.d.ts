import * as github from '@actions/github';
import { ClaudeClient } from './claude';
import { ReviewConfig } from './types';
type Octokit = ReturnType<typeof github.getOctokit>;
interface MemoryConfig {
    enabled: boolean;
    repo: string;
}
declare const BOT_MARKER = "<!-- manki -->";
/**
 * Handle a reply to one of our review comments.
 */
export declare function handleReviewCommentReply(octokit: Octokit, client: ClaudeClient, memoryConfig?: MemoryConfig, memoryToken?: string): Promise<void>;
/**
 * Handle @manki commands in PR comments.
 */
export declare function handlePRComment(octokit: Octokit, client: ClaudeClient | null, owner: string, repo: string, issueNumber: number, memoryConfig?: MemoryConfig, memoryToken?: string, config?: ReviewConfig): Promise<void>;
interface ParsedCommand {
    type: 'explain' | 'dismiss' | 'help' | 'remember' | 'forget' | 'check' | 'triage' | 'generic';
    args: string;
}
declare const BOT_MENTION_PATTERN: RegExp;
declare function parseCommand(body: string): ParsedCommand;
declare function buildReplyContext(originalComment: string, replyBody: string, filePath?: string | null, line?: number | null): string;
declare function isBotComment(body: string): boolean;
declare function hasBotMention(body: string): boolean;
interface TriageFinding {
    title: string;
    ref: string;
    section: string;
}
interface TriageResult {
    accepted: TriageFinding[];
    rejected: TriageFinding[];
}
interface FindingContent {
    description: string;
    permalink: string | null;
    suggestedFix: string | null;
}
declare function parseTriageBody(body: string): TriageResult;
declare function extractFindingContent(section: string): FindingContent;
declare function triageTitlePrefix(title: string): string;
declare function extractPrNumber(issueTitle: string): number | null;
declare function isReviewRequest(body: string): boolean;
declare function isBotMentionNonReview(body: string): boolean;
export { parseCommand, buildReplyContext, parseTriageBody, extractFindingContent, triageTitlePrefix, extractPrNumber, ParsedCommand, TriageFinding, TriageResult, FindingContent, BOT_MARKER, BOT_MENTION_PATTERN, isBotComment, hasBotMention, isReviewRequest, isBotMentionNonReview };
