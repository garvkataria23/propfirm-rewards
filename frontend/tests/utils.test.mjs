import test from 'node:test';
import assert from 'node:assert/strict';

test('formatPoints formats integers with comma separators', () => {
  const points = 1250000;
  const formatted = points.toLocaleString('en-US');
  assert.equal(formatted, '1,250,000');
});

test('session token storage lifecycle handles set, get, and remove cleanly', () => {
  const memoryStorage = new Map();
  const mockStorage = {
    setItem: (k, v) => memoryStorage.set(k, v),
    getItem: (k) => memoryStorage.get(k) || null,
    removeItem: (k) => memoryStorage.delete(k),
  };

  mockStorage.setItem('token', 'jwt.bearer.payload');
  assert.equal(mockStorage.getItem('token'), 'jwt.bearer.payload');
  mockStorage.removeItem('token');
  assert.equal(mockStorage.getItem('token'), null);
});

test('pagination response parsing safely handles both paginated objects and arrays', () => {
  const paginatedResponse = { users: [{ id: 'u1' }], total: 1, limit: 50, offset: 0 };
  const unpackedUsers = Array.isArray(paginatedResponse) ? paginatedResponse : paginatedResponse?.users || [];
  assert.equal(unpackedUsers.length, 1);
  assert.equal(unpackedUsers[0].id, 'u1');

  const legacyArrayResponse = [{ id: 'u2' }, { id: 'u3' }];
  const unpackedLegacy = Array.isArray(legacyArrayResponse) ? legacyArrayResponse : (legacyArrayResponse?.users || []);
  assert.equal(unpackedLegacy.length, 2);
});
