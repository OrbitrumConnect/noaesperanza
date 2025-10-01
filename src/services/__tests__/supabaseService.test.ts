import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseService } from '../supabaseService';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('../../integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('supabaseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('saveMessage', () => {
    it('should save message successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: { id: '123' }, error: null });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const message = {
        content: 'Test message',
        role: 'user' as const,
        userId: 'user123',
      };

      const result = await supabaseService.salvarArquivoViaTexto(message);

      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
      expect(mockInsert).toHaveBeenCalledWith([message]);
      expect(result).toEqual({ id: '123' });
    });

    it('should handle save message error', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const message = {
        content: 'Test message',
        role: 'user' as const,
        userId: 'user123',
      };

      await expect(supabaseService.saveMessage(message)).rejects.toThrow('Database error');
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages successfully', async () => {
      const mockMessages = [
        { id: '1', content: 'Hello', role: 'user' },
        { id: '2', content: 'Hi there', role: 'assistant' },
      ];
      
      const mockSelect = vi.fn().mockResolvedValue({ data: mockMessages, error: null });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      const result = await supabaseService.getMessages('user123');

      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(result).toEqual(mockMessages);
    });

    it('should handle get messages error', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ data: null, error: { message: 'Query error' } });
      mockSupabase.from.mockReturnValue({ select: mockSelect });

      await expect(supabaseService.getMessages('user123')).rejects.toThrow('Query error');
    });
  });

  describe('saveEvaluation', () => {
    it('should save evaluation successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ data: { id: 'eval123' }, error: null });
      mockSupabase.from.mockReturnValue({ insert: mockInsert });

      const evaluation = {
        userId: 'user123',
        responses: { question1: 'answer1' },
        completedAt: new Date(),
      };

      const result = await supabaseService.saveEvaluation(evaluation);

      expect(mockSupabase.from).toHaveBeenCalledWith('evaluations');
      expect(mockInsert).toHaveBeenCalledWith([evaluation]);
      expect(result).toEqual({ id: 'eval123' });
    });
  });

  describe('getUserType', () => {
    it('should return user type successfully', async () => {
      const mockUser = { id: 'user123', user_metadata: { user_type: 'institutional' } };
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

      const result = await supabaseService.getUserType();

      expect(mockSupabase.auth.getUser).toHaveBeenCalled();
      expect(result).toBe('institutional');
    });

    it('should return default user type when no user', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const result = await supabaseService.getUserType();

      expect(result).toBe('regular');
    });
  });
});
