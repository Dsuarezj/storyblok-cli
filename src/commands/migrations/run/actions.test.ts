import { vol } from 'memfs';
import { readJavascriptFile, readMigrationFiles } from './actions';
import { FileSystemError } from '../../../utils/error';

vi.mock('node:fs');
vi.mock('node:fs/promises');

describe('readJavascriptFile', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should read javascript file successfully', async () => {
    vol.fromJSON({
      '/path/to/migrations/12345/migration-1.js': 'export default function (block) { return block; }',
    });

    const result = await readJavascriptFile('/path/to/migrations/12345/migration-1.js');
    expect(result).toEqual('export default function (block) { return block; }');
  });

  it('should throw FileSystemError when file does not exist', async () => {
    await expect(readJavascriptFile('/path/to/nonexistent.js')).rejects.toThrow(FileSystemError);
  });

  it('should throw FileSystemError when file is empty', async () => {
    vol.fromJSON({
      '/path/to/migrations/12345/empty.js': '',
    });

    await expect(readJavascriptFile('/path/to/migrations/12345/empty.js')).rejects.toThrow(FileSystemError);
  });
});

describe('readMigrationFiles', () => {
  it('should read migration files successfully', async () => {
    vol.fromJSON({
      '/path/to/migrations/12346/migration-1.js': 'export default function (block) { return block; }',
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12346',
    });

    expect(result).toEqual([
      {
        name: 'migration-1.js',
        content: 'export default function (block) { return block; }',
      },
    ]);
  });

  it('should throw FileSystemError when directory does not exist', async () => {
    await expect(readMigrationFiles({
      path: '/path/to/',
      space: '12347',
    })).rejects.toThrow(FileSystemError);
  });

  it('should return empty array when directory is empty', async () => {
    vol.fromJSON({
      '/path/to/migrations/12348/': null,
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12348',
    });

    expect(result).toEqual([]);
  });

  it('should throw FileSystemError when file does not end with .js', async () => {
    vol.fromJSON({
      '/path/to/migrations/12349/migration-1.txt': 'export default function (block) { return block; }',
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12349',
    });

    expect(result).toEqual([]);
  });

  it('should return empty array when no JS files are found', async () => {
    vol.fromJSON({
      '/path/to/migrations/12349/migration-1.txt': 'export default function (block) { return block; }',
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12349',
    });

    expect(result).toEqual([]);
  });

  it('should return filtered files when filter is provided', async () => {
    vol.fromJSON({
      '/path/to/migrations/12350/migration-1.suffix.js': 'export default function (block) { return block; }',
      '/path/to/migrations/12350/migration-2.js': 'export default function (block) { return block; }',
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12350',
      filter: '**.suffix.js',
    });

    expect(result.length).toBe(1);
    expect(result[0].name).toBe('migration-1.suffix.js');
  });

  it('should return empty array when file does not match filter', async () => {
    vol.fromJSON({
      '/path/to/migrations/12350/migration-1.js': 'export default function (block) { return block; }',
      '/path/to/migrations/12350/migration-2.js': 'export default function (block) { return block; }',
    });

    const result = await readMigrationFiles({
      path: '/path/to/',
      space: '12350',
      filter: 'component-*',
    });

    expect(result).toEqual([]);
  });
});
