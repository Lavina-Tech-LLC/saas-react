import { lazy, Suspense } from 'react';

import type { SettingsPanelProps } from '../SettingsPanel/SettingsPanel';

// Settings load on first use, not with the user button: most visits never open them, so an app's first download
// leaves them out (with an unbundled dist and sideEffects: false, the app's bundler gives them a chunk of their own)
const loadPanel = () => import('../SettingsPanel/SettingsPanel');
const Panel = lazy(() => loadPanel().then((module) => ({ default: module.SettingsPanel })));

/** Starts loading the panel ahead of the click — called when the menu that leads to it opens. */
export function preloadSettingsPanel() {
  void loadPanel();
}

export function LazySettingsPanel(props: SettingsPanelProps) {
  return (
    <Suspense fallback={null}>
      <Panel {...props} />
    </Suspense>
  );
}
