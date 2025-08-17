import { describe, it, expect } from 'vitest';
import { getBaseUrl } from './Helpers';

describe('Helpers', () => {
  describe('getBaseUrl', () => {
    it('should return the base URL', () => {
      const result = getBaseUrl();
      expect(typeof result).toBe('string');
      expect(result).toBeTruthy();
    });
  });
});
