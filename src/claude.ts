import { execFile } from 'child_process';
import { promisify } from 'util';

import Anthropic from '@anthropic-ai/sdk';
import * as core from '@actions/core';

const execFileAsync = promisify(execFile);

export interface ClaudeClientOptions {
  oauthToken?: string;
  apiKey?: string;
  model: string;
}

export interface ClaudeResponse {
  content: string;
}

export class ClaudeClient {
  private oauthToken?: string;
  private apiKey?: string;
  private anthropic?: Anthropic;
  private model: string;

  constructor(options: ClaudeClientOptions) {
    this.oauthToken = options.oauthToken;
    this.apiKey = options.apiKey;
    this.model = options.model;

    if (!this.oauthToken && !this.apiKey) {
      throw new Error('Either claude_code_oauth_token or anthropic_api_key must be provided');
    }

    if (this.apiKey) {
      this.anthropic = new Anthropic({ apiKey: this.apiKey });
    }
  }

  async sendMessage(systemPrompt: string, userMessage: string): Promise<ClaudeResponse> {
    if (this.oauthToken) {
      return this.sendViaOAuth(systemPrompt, userMessage);
    }
    return this.sendViaAPI(systemPrompt, userMessage);
  }

  private async sendViaOAuth(systemPrompt: string, userMessage: string): Promise<ClaudeResponse> {
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userMessage}`;

    try {
      const { stdout } = await execFileAsync('claude', [
        '-p', fullPrompt,
        '--output-format', 'text',
        '--model', this.model,
      ], {
        env: {
          ...process.env,
          CLAUDE_CODE_OAUTH_TOKEN: this.oauthToken,
        },
        maxBuffer: 50 * 1024 * 1024,
        timeout: 300000,
      });

      return { content: stdout.trim() };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      core.warning(`Claude CLI failed: ${msg}`);
      throw new Error(`Claude CLI invocation failed: ${msg}`);
    }
  }

  private async sendViaAPI(systemPrompt: string, userMessage: string): Promise<ClaudeResponse> {
    if (!this.anthropic) throw new Error('Anthropic client not initialized');

    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 16384,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const textBlocks = response.content.filter(b => b.type === 'text');
    return { content: textBlocks.map(b => b.text).join('\n') };
  }
}
