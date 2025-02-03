import { beforeEach, describe, expect, it, vi } from 'vitest';
import { handleComponentGroups, handleTags } from './operations';
import { upsertComponentGroup, upsertComponentInternalTag } from './actions';
import type { SpaceComponentGroup } from '../constants';

// Mock the actions module
vi.mock('./actions', () => ({
  upsertComponentInternalTag: vi.fn(),
  upsertComponentGroup: vi.fn(),
}));

// Mock the spinner
vi.mock('@topcli/spinner', () => ({
  Spinner: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    succeed: vi.fn(),
    failed: vi.fn(),
    elapsedTime: 100,
  })),
}));

describe('operations', () => {
  const mockSpace = 'test-space';
  const mockPassword = 'test-password';
  const mockRegion = 'eu' as const;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleTags', () => {
    it('should successfully process tags', async () => {
      const mockTags = [
        { id: 1, name: 'tag1' },
        { id: 2, name: 'tag2' },
      ];

      // Mock successful upsert
      vi.mocked(upsertComponentInternalTag).mockResolvedValue(undefined);

      const result = await handleTags(mockSpace, mockPassword, mockRegion, mockTags);

      expect(upsertComponentInternalTag).toHaveBeenCalledTimes(2);
      expect(upsertComponentInternalTag).toHaveBeenCalledWith(mockSpace, mockTags[0], mockPassword, mockRegion);
      expect(upsertComponentInternalTag).toHaveBeenCalledWith(mockSpace, mockTags[1], mockPassword, mockRegion);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle failed tag processing', async () => {
      const mockTags = [
        { id: 1, name: 'tag1' },
        { id: 2, name: 'tag2' },
      ];

      // Mock first tag succeeding and second failing
      vi.mocked(upsertComponentInternalTag)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('API Error'));

      const result = await handleTags(mockSpace, mockPassword, mockRegion, mockTags);

      expect(upsertComponentInternalTag).toHaveBeenCalledTimes(2);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        name: 'tag2',
        error: new Error('API Error'),
      });
    });
  });

  describe('handleComponentGroups', () => {
    const mockGroups: SpaceComponentGroup[] = [
      {
        name: 'Folder A',
        id: 487969,
        uuid: 'a6e35ba1-505e-4941-8bb2-eaac3d0a26a4',
        parent_id: null,
        parent_uuid: null,
      },
      {
        name: 'Folder B',
        id: 489043,
        uuid: '558e0d2a-d1d2-4753-9a18-a37d3bb6f505',
        parent_id: 0,
        parent_uuid: '',
      },
      {
        name: 'Folder C',
        id: 489044,
        uuid: '80e208d8-985d-461d-9ac2-79edb0f746c8',
        parent_id: 489043,
        parent_uuid: '558e0d2a-d1d2-4753-9a18-a37d3bb6f505',
      },
      {
        name: 'Folder D',
        id: 492996,
        uuid: '71e33aad-4238-41e2-a27c-ccd3105cbfc3',
        parent_id: 489044,
        parent_uuid: '80e208d8-985d-461d-9ac2-79edb0f746c8',
      },
    ];

    it('should process groups in hierarchical order', async () => {
      // Mock responses for each group with new UUIDs and IDs
      const mockResponses: Record<string, SpaceComponentGroup> = {
        'Folder A': {
          name: 'Folder A',
          id: 1001,
          uuid: 'new-uuid-a',
          parent_id: 0,
          parent_uuid: '',
        },
        'Folder B': {
          name: 'Folder B',
          id: 1002,
          uuid: 'new-uuid-b',
          parent_id: 0,
          parent_uuid: '',
        },
        'Folder C': {
          name: 'Folder C',
          id: 1003,
          uuid: 'new-uuid-c',
          parent_id: 1002,
          parent_uuid: 'new-uuid-b',
        },
        'Folder D': {
          name: 'Folder D',
          id: 1004,
          uuid: 'new-uuid-d',
          parent_id: 1003,
          parent_uuid: 'new-uuid-c',
        },
      };

      // Mock the upsertComponentGroup function to return appropriate responses
      vi.mocked(upsertComponentGroup).mockImplementation(async (space, group) => {
        return mockResponses[group.name];
      });

      const result = await handleComponentGroups(mockSpace, mockPassword, mockRegion, mockGroups);

      // Verify successful processing
      expect(result.successful).toEqual(['Folder A', 'Folder B', 'Folder C', 'Folder D']);
      expect(result.failed).toHaveLength(0);

      // Verify correct order of processing and parent updates
      const calls = vi.mocked(upsertComponentGroup).mock.calls;

      // First two calls should be root folders (order doesn't matter)
      const rootCalls = calls.slice(0, 2).map(call => call[1].name);
      expect(rootCalls).toContain('Folder A');
      expect(rootCalls).toContain('Folder B');

      // Third call should be Folder C with updated parent references
      expect(calls[2][1]).toEqual(expect.objectContaining({
        name: 'Folder C',
        parent_id: 1002,
        parent_uuid: 'new-uuid-b',
      }));

      // Fourth call should be Folder D with updated parent references
      expect(calls[3][1]).toEqual(expect.objectContaining({
        name: 'Folder D',
        parent_id: 1003,
        parent_uuid: 'new-uuid-c',
      }));

      // Verify UUID and ID mappings
      expect(result.uuidMap.get('a6e35ba1-505e-4941-8bb2-eaac3d0a26a4')).toBe('new-uuid-a');
      expect(result.uuidMap.get('558e0d2a-d1d2-4753-9a18-a37d3bb6f505')).toBe('new-uuid-b');
      expect(result.uuidMap.get('80e208d8-985d-461d-9ac2-79edb0f746c8')).toBe('new-uuid-c');
      expect(result.uuidMap.get('71e33aad-4238-41e2-a27c-ccd3105cbfc3')).toBe('new-uuid-d');

      expect(result.idMap.get(487969)).toBe(1001);
      expect(result.idMap.get(489043)).toBe(1002);
      expect(result.idMap.get(489044)).toBe(1003);
      expect(result.idMap.get(492996)).toBe(1004);
    });

    it('should handle failures and continue processing', async () => {
      // Mock Folder B to fail
      vi.mocked(upsertComponentGroup).mockImplementation(async (space, group) => {
        if (group.name === 'Folder B') {
          throw new Error('Failed to create Folder B');
        }
        return {
          ...group,
          id: 1001,
          uuid: 'new-uuid',
        };
      });

      const result = await handleComponentGroups(mockSpace, mockPassword, mockRegion, mockGroups);

      // Verify Folder B failed but others processed
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        name: 'Folder B',
        error: new Error('Failed to create Folder B'),
      });

      // Verify Folder A was processed
      expect(result.successful).toContain('Folder A');
    });

    it('should handle empty groups array', async () => {
      const result = await handleComponentGroups(mockSpace, mockPassword, mockRegion, []);

      expect(result.successful).toHaveLength(0);
      expect(result.failed).toHaveLength(0);
      expect(result.uuidMap.size).toBe(0);
      expect(result.idMap.size).toBe(0);
    });
  });
});
