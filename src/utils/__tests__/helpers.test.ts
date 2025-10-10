import { describe, it, expect } from 'vitest';
import { formatTimestamp, sanitizeInput, validateEmail, generateId } from '../helpers';

describe('helpers', () => {
  describe('formatTimestamp', () => {
    it('should format timestamp correctly', () => {
      const date = new Date('2024-01-01T12:30:45Z');
      const result = formatTimestamp(date);
      expect(result).toBe('12:30');
    });

    it('should handle different time formats', () => {
      const date1 = new Date('2024-01-01T09:05:00Z');
      const date2 = new Date('2024-01-01T23:59:59Z');
      
      expect(formatTimestamp(date1)).toBe('09:05');
      expect(formatTimestamp(date2)).toBe('23:59');
    });
  });

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const input = '<script>alert("xss")</script>Hello World';
      const result = sanitizeInput(input);
      expect(result).toBe('Hello World');
    });

    it('should handle empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('should handle null input', () => {
      expect(sanitizeInput(null as any)).toBe('');
    });

    it('should preserve safe content', () => {
      const input = 'Hello, this is a safe message!';
      const result = sanitizeInput(input);
      expect(result).toBe(input);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
      expect(id1.length).toBeGreaterThan(0);
    });

    it('should generate IDs with consistent format', () => {
      const id = generateId();
      expect(id).toMatch(/^[a-zA-Z0-9-_]+$/);
    });
  });
});
