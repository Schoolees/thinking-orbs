import type { OrbTheme } from './types';

export function ancestorTheme(element: Element | null): boolean | null {
  let node: Element | null = element;

  while (node) {
    const theme = node.getAttribute('data-theme')
      ?? node.getAttribute('data-coreui-theme');

    if (theme === 'dark') {
      return true;
    }

    if (theme === 'light') {
      return false;
    }

    if (node.classList.contains('dark')) {
      return true;
    }

    if (node.classList.contains('light')) {
      return false;
    }

    node = node.parentElement;
  }

  return null;
}

export function systemPrefersDark(): boolean {
  return typeof matchMedia === 'undefined'
    || matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveDark(theme: OrbTheme, element: Element | null): boolean {
  if (theme === 'dark') {
    return true;
  }

  if (theme === 'light') {
    return false;
  }

  return ancestorTheme(element) ?? systemPrefersDark();
}

export function addMediaListener(
  mediaQuery: MediaQueryList | null,
  listener: (event: MediaQueryListEvent) => void
): () => void {
  if (!mediaQuery) {
    return () => undefined;
  }

  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);

    return () => mediaQuery.removeEventListener('change', listener);
  }

  mediaQuery.addListener(listener);

  return () => mediaQuery.removeListener(listener);
}
