import { describe, it, expect } from 'vitest';
import { PackageManifestSchema } from './manifest';

const validRule = {
  name: 'lozymon/nestjs-rules',
  version: '1.0.0',
  type: 'rule' as const,
  description: 'NestJS coding rules for AI tools',
  license: 'MIT',
  targets: {
    'claude-code': { file: 'targets/claude-code/CLAUDE.md' },
  },
};

const validPack = {
  name: 'lozymon/nestjs-pack',
  version: '1.0.0',
  type: 'pack' as const,
  description: 'Complete NestJS starter pack',
  license: 'MIT',
  includes: ['lozymon/nestjs-rules@^1.0.0'],
};

describe('PackageManifestSchema', () => {
  it('accepts a valid rule manifest', () => {
    expect(PackageManifestSchema.safeParse(validRule).success).toBe(true);
  });

  it('accepts a valid pack manifest', () => {
    expect(PackageManifestSchema.safeParse(validPack).success).toBe(true);
  });

  it('rejects an invalid name format', () => {
    const result = PackageManifestSchema.safeParse({ ...validRule, name: 'no-slash' });
    expect(result.success).toBe(false);
  });

  it('rejects an invalid version', () => {
    const result = PackageManifestSchema.safeParse({ ...validRule, version: 'not-semver' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-pack asset without targets', () => {
    const { targets: _, ...noTargets } = validRule;
    const result = PackageManifestSchema.safeParse(noTargets);
    expect(result.success).toBe(false);
  });

  it('rejects a pack without includes', () => {
    const { includes: _, ...noIncludes } = validPack;
    const result = PackageManifestSchema.safeParse(noIncludes);
    expect(result.success).toBe(false);
  });

  it('rejects an unknown asset type', () => {
    const result = PackageManifestSchema.safeParse({ ...validRule, type: 'unknown' });
    expect(result.success).toBe(false);
  });

  it('rejects a description over 200 characters', () => {
    const result = PackageManifestSchema.safeParse({ ...validRule, description: 'a'.repeat(201) });
    expect(result.success).toBe(false);
  });
});
