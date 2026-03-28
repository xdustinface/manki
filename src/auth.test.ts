import * as core from '@actions/core';

import { getMemoryToken, resolveGitHubToken, TokenResult } from './auth';

jest.mock('@actions/core');
jest.mock('@actions/github');

const mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>;

describe('getMemoryToken', () => {
  beforeEach(() => {
    mockGetInput.mockReset();
  });

  it('returns memory_repo_token when set', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'memory_repo_token') return 'memory-token-123';
      if (name === 'github_token') return 'github-token-456';
      return '';
    });

    expect(getMemoryToken()).toBe('memory-token-123');
  });

  it('falls back to github_token when memory_repo_token is empty', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'memory_repo_token') return '';
      if (name === 'github_token') return 'github-token-456';
      return '';
    });

    expect(getMemoryToken()).toBe('github-token-456');
  });

  it('returns null when both tokens are empty', () => {
    mockGetInput.mockImplementation(() => '');

    expect(getMemoryToken()).toBeNull();
  });

  it('prefers memory_repo_token over github_token', () => {
    mockGetInput.mockImplementation((name: string) => {
      if (name === 'memory_repo_token') return 'memory-token';
      if (name === 'github_token') return 'github-token';
      return '';
    });

    expect(getMemoryToken()).toBe('memory-token');
  });
});

const GITHUB_TOKEN = 'ghp_test_token_123';
const TOKEN_URL = 'https://manki.dustinface.me/token';
const OWNER = 'test-owner';
const REPO = 'test-repo';
const APP_TOKEN = 'ghs_app_token_456';

function mockFetch(impl: (url: string, opts?: RequestInit) => Promise<Response>) {
  global.fetch = jest.fn(impl) as jest.Mock;
}

describe('resolveGitHubToken', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns app token when OIDC and token service succeed', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      return new Response(
        JSON.stringify({ token: APP_TOKEN, expires_at: '2026-03-28T12:00:00Z' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: APP_TOKEN, identity: 'app' });
    expect(core.setSecret).toHaveBeenCalledWith(APP_TOKEN);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('manki-labs[bot]'));

    const call = (global.fetch as jest.Mock).mock.calls[0];
    expect(call[0]).toBe(TOKEN_URL);
    expect(call[1].headers['Authorization']).toBe('Bearer fake-oidc-token');
    expect(JSON.parse(call[1].body)).toEqual({ owner: OWNER, repo: REPO });
  });

  it('falls back to github_token when OIDC token is not available', async () => {
    jest.spyOn(core, 'getIDToken').mockRejectedValue(new Error('OIDC not available'));

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('OIDC token not available'));
  });

  it('falls back when token service returns not found', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      return new Response('Not Found', { status: 404 });
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('not available'));
  });

  it('falls back when token service returns an error', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      return new Response('Internal Server Error', { status: 500 });
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('not available'));
  });

  it('falls back when token service returns invalid response (empty token)', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      return new Response(
        JSON.stringify({ token: '', expires_at: '2026-03-28T12:00:00Z' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('invalid response'));
  });

  it('falls back when token service returns invalid response (missing token)', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      return new Response(
        JSON.stringify({ expires_at: '2026-03-28T12:00:00Z' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('invalid response'));
  });

  it('falls back on network error', async () => {
    jest.spyOn(core, 'getIDToken').mockResolvedValue('fake-oidc-token');
    mockFetch(async () => {
      throw new Error('Network failure');
    });

    const result = await resolveGitHubToken(GITHUB_TOKEN, TOKEN_URL, OWNER, REPO);

    expect(result).toEqual<TokenResult>({ token: GITHUB_TOKEN, identity: 'actions' });
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining('App token resolution failed'));
  });
});
