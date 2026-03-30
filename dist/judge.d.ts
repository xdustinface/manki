import { ClaudeClient } from './claude';
import { RepoMemory } from './memory';
import { LinkedIssue } from './github';
import { DiffFile, Finding, FindingSeverity, ReviewConfig, ParsedDiff, PrContext } from './types';
export interface JudgeInput {
    findings: Finding[];
    diff: ParsedDiff;
    rawDiff: string;
    memory?: RepoMemory;
    repoContext: string;
    prContext?: PrContext;
    linkedIssues?: LinkedIssue[];
    agentCount: number;
}
export interface JudgedFinding {
    title: string;
    severity: FindingSeverity;
    reasoning: string;
    confidence: 'high' | 'medium' | 'low';
}
export interface JudgeResult {
    summary: string;
    findings: JudgedFinding[];
}
export declare function buildJudgeSystemPrompt(config: ReviewConfig, agentCount: number): string;
export declare function buildJudgeUserMessage(findings: Finding[], codeContextMap: Map<string, string>, memoryContext: string, prContext?: PrContext, linkedIssues?: LinkedIssue[], changedFiles?: DiffFile[]): string;
export declare function extractCodeContext(finding: Finding, diff: ParsedDiff): string;
export declare function filterMemoryForFindings(findings: Finding[], memory: RepoMemory): string;
export declare function parseJudgeResponse(responseText: string): JudgeResult;
export declare function runJudgeAgent(client: ClaudeClient, config: ReviewConfig, input: JudgeInput): Promise<{
    findings: Finding[];
    summary: string;
}>;
export declare function mapJudgedToFindings(original: Finding[], judged: JudgedFinding[]): Finding[];
export declare function deduplicateFindings(findings: Finding[]): Finding[];
