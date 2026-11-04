import { render, screen } from '@tests/testing.tsx';
import { describe, expect, it } from 'vitest';
import { LoginOptions } from './LoginOptions.tsx';

describe('LoginOptions', () => {
  describe('when rendered', () => {
    it('should offer Google and magic link login', () => {
      render(<LoginOptions />);

      expect(
        screen.getByRole('button', { name: /Continue with Google/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Email me a link/i }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('when the magic link was invalid', () => {
    it('should show an error message', () => {
      render(<LoginOptions />, { route: '/?error=magic_link_invalid' });

      expect(screen.getByRole('alert')).toHaveTextContent(/invalid, expired/i);
    });
  });
});
