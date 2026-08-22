import { useEffect, useRef, useCallback } from 'react';

let toastTimeout = null;

export function useToast() {
  const show = useCallback((message) => {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.remove('show'), 2600);
  }, []);

  return show;
}

export default function Toast() {
  return <div id="toast" role="status"></div>;
}
