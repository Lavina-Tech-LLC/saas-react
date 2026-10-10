import { renderHook } from '@testing-library/react';

import type { User } from '../../../auth/types';
import { useAfterAuth } from './useAfterAuth';

const user = { id: 'u1', email: 'a@b.c' } as User;

describe('useAfterAuth', () => {
  it('calls onSignIn when a session appears', () => {
    const onSignIn = vi.fn();
    const { rerender } = renderHook(({ u }) => useAfterAuth(u, 'signIn', { onSignIn }), {
      initialProps: { u: null as User | null },
    });
    rerender({ u: user });
    expect(onSignIn).toHaveBeenCalledWith(user);
  });

  it('does not fire for a user who was already signed in', () => {
    const onSignIn = vi.fn();
    renderHook(() => useAfterAuth(user, 'signIn', { onSignIn }));
    expect(onSignIn).not.toHaveBeenCalled();
  });

  it('prefers onSignUp after a sign-up', () => {
    const onSignIn = vi.fn();
    const onSignUp = vi.fn();
    const { rerender } = renderHook(({ u }) => useAfterAuth(u, 'signUp', { onSignIn, onSignUp }), {
      initialProps: { u: null as User | null },
    });
    rerender({ u: user });
    expect(onSignUp).toHaveBeenCalledWith(user);
    expect(onSignIn).not.toHaveBeenCalled();
  });
});
