import { useEffect } from 'react';
import { findPublicTarget } from './resolvePublicHelp.js';

export default function usePublicHelpHighlight({ rootRef, targetId, enabled, level }) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled || !targetId) return;
    let restore = () => {};
    const apply = () => {
      restore(); restore = () => {};
      const field = findPublicTarget(root, targetId);
      if (!field || field.matches(':disabled') || !field.getClientRects().length) return;
      const target = field.matches('input[type=radio], input[type=checkbox]') ? field.closest('label') ?? field : field;
      const previous = target.getAttribute('data-public-help-level');
      target.setAttribute('data-public-help-level', String(level));
      const controls = field.matches('input, select, textarea, button, a') ? [field]
        : [...field.querySelectorAll('input, select, textarea, button')];
      for (const control of controls) {
        const ids = new Set((control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
        ids.add('public-context-help-text');
        control.setAttribute('aria-describedby', [...ids].join(' '));
      }
      restore = () => {
        if (previous === null) target.removeAttribute('data-public-help-level');
        else target.setAttribute('data-public-help-level', previous);
        for (const control of controls) {
          const ids = (control.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== 'public-context-help-text');
          if (ids.length) control.setAttribute('aria-describedby', ids.join(' '));
          else control.removeAttribute('aria-describedby');
        }
      };
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden'] });
    return () => { observer.disconnect(); restore(); };
  }, [rootRef, targetId, enabled, level]);
}
