import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settings.store';

export function useTheme() {
  const { theme, font, fontSize, blurPx } = useSettingsStore((s) => s.settings);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (font === 'default') {
      root.removeAttribute('data-font');
    } else {
      root.setAttribute('data-font', font);
    }
  }, [font]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--font-size-base',
      `${fontSize}px`,
    );
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--blur-px', `${blurPx}px`);
  }, [blurPx]);
}
