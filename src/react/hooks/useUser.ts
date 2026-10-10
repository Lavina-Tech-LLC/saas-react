import { useSaaSContext } from '../context';

export function useUser() {
  const { user, isLoaded } = useSaaSContext();
  return { user, isLoaded };
}
