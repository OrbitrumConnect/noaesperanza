import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatMessage } from '../ChatMessage';

// Mock the AIAvatar component
vi.mock('../AIAvatar', () => ({
  default: ({ isTyping }: { isTyping: boolean }) => (
    <div data-testid="ai-avatar">{isTyping ? 'typing' : 'idle'}</div>
  ),
}));

describe('ChatMessage', () => {
  it('should render user message correctly', () => {
    const message = 'Hello, Nôa!';

    render(<ChatMessage message={message} sender="user" />);
    
    expect(screen.getByText('Hello, Nôa!')).toBeInTheDocument();
    expect(screen.getByTestId('user-message')).toBeInTheDocument();
  });

  it('should render AI message correctly', () => {
    const message = 'Hello! How can I help you?';

    render(<ChatMessage message={message} sender="noa" />);
    
    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument();
    expect(screen.getByTestId('ai-message')).toBeInTheDocument();
  });

  it('should show typing indicator when message is being generated', () => {
    const message = 'Typing...';

    render(<ChatMessage message={message} sender="noa" />);
    
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    expect(screen.getByTestId('ai-avatar')).toHaveTextContent('typing');
  });

  it('should format timestamp correctly', () => {
    const message = 'Test message';

    render(<ChatMessage message={message} sender="user" />);
    
    expect(screen.getByText('12:30')).toBeInTheDocument();
  });

  it('should handle empty content gracefully', () => {
    const message = '';

    render(<ChatMessage message={message} sender="noa" />);
    
    expect(screen.getByTestId('ai-message')).toBeInTheDocument();
    expect(screen.queryByText('')).toBeInTheDocument();
  });
});
