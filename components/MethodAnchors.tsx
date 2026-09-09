'use client';
import { useEffect } from 'react';

export default function MethodAnchors() {
  useEffect(() => {
    const reveal = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith('method-') && !id.startsWith('personal-')) return;
      const target = document.getElementById(id);
      if (target instanceof HTMLDetailsElement) { target.open = true; target.scrollIntoView(); }
    };
    reveal(); window.addEventListener('hashchange', reveal);
    return () => window.removeEventListener('hashchange', reveal);
  }, []);
  return null;
}
