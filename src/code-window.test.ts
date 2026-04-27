import { extractCurrentCodeWindow } from './code-window';

describe('extractCurrentCodeWindow', () => {
  function makeFile(lineCount: number): string {
    return Array.from({ length: lineCount }, (_, i) => `line ${i + 1}`).join('\n');
  }

  it('returns a windowed snippet with `>>>` marker on the flagged line', () => {
    const fileContents = new Map([['src/a.ts', makeFile(20)]]);
    const out = extractCurrentCodeWindow(fileContents, 'src/a.ts', 10);
    expect(out).toContain('>>> 10: line 10');
    // line 10 ± 5 inclusive
    expect(out).toContain('   5: line 5');
    expect(out).toContain('   15: line 15');
    // outside the window
    expect(out).not.toContain('line 4');
    expect(out).not.toContain('line 16');
  });

  it('clamps the window start at line 1 for early flagged lines', () => {
    const fileContents = new Map([['src/a.ts', makeFile(20)]]);
    const out = extractCurrentCodeWindow(fileContents, 'src/a.ts', 1);
    const lines = out.split('\n');
    expect(lines[0]).toBe('>>> 1: line 1');
    // Window upper bound is line 1 + 5 = 6
    expect(out).toContain('   6: line 6');
    expect(out).not.toContain('line 7');
  });

  it('clamps the window end at the last line for late flagged lines', () => {
    const fileContents = new Map([['src/a.ts', makeFile(8)]]);
    const out = extractCurrentCodeWindow(fileContents, 'src/a.ts', 8);
    const lines = out.split('\n');
    expect(lines[lines.length - 1]).toBe('>>> 8: line 8');
    // Window lower bound is 8 - 5 = 3
    expect(out).toContain('   3: line 3');
    expect(out).not.toContain('line 2');
  });

  it('returns `(file content unavailable)` when the file is missing from the map', () => {
    const fileContents = new Map<string, string>();
    expect(extractCurrentCodeWindow(fileContents, 'src/missing.ts', 5)).toBe('(file content unavailable)');
  });

  it('returns `(file content unavailable)` when fileContents is undefined', () => {
    expect(extractCurrentCodeWindow(undefined, 'src/a.ts', 5)).toBe('(file content unavailable)');
  });

  it('returns empty string for invalid line numbers', () => {
    const fileContents = new Map([['src/a.ts', makeFile(10)]]);
    expect(extractCurrentCodeWindow(fileContents, 'src/a.ts', 0)).toBe('');
    expect(extractCurrentCodeWindow(fileContents, 'src/a.ts', -3)).toBe('');
    expect(extractCurrentCodeWindow(fileContents, 'src/a.ts', NaN)).toBe('');
    expect(extractCurrentCodeWindow(fileContents, 'src/a.ts', Infinity)).toBe('');
  });

  it('returns empty string for empty file path', () => {
    const fileContents = new Map([['src/a.ts', makeFile(10)]]);
    expect(extractCurrentCodeWindow(fileContents, '', 5)).toBe('');
  });
});
