
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// The self-service portal is now public at /self-service.
// This component will redirect any lingering traffic from old bookmarks.
export default function SelfServiceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/self-service');
  }, [router]);

  return null; // No se renderiza nada mientras se redirige
}
