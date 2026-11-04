import { fireEvent, render, screen } from '@tests/testing.tsx';
import { mockFetchResponse } from '@tests/utils/mockFetchResponse.ts';
import { describe, expect, it } from 'vitest';
import { MagicLinkForm } from './MagicLinkForm.tsx';

describe('MagicLinkForm', () => {
  describe('when the email is invalid', () => {
    it('should show a validation error and not send the request', async () => {
      render(<MagicLinkForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'not-an-email' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Email me a link/i }));

      expect(
        await screen.findByText(/Enter a valid email/i),
      ).toBeInTheDocument();
    });
  });

  describe('when the email is valid', () => {
    it('should show the confirmation message', async () => {
      render(<MagicLinkForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'pilot@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Email me a link/i }));

      expect(await screen.findByText(/Check your inbox/i)).toBeInTheDocument();
      expect(screen.getByText(/pilot@example.com/)).toBeInTheDocument();
    });
  });

  describe('when the request fails', () => {
    it('should show an error and keep the form', async () => {
      mockFetchResponse(
        `${API_URL}/auth/magic-link`,
        { message: 'Too Many Requests' },
        429,
        'post',
      );
      render(<MagicLinkForm />);

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'pilot@example.com' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Email me a link/i }));

      expect(
        await screen.findByText(/Couldn't send the link/i),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Check your inbox/i)).not.toBeInTheDocument();
    });
  });
});
