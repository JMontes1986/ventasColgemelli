
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelfServiceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/self-service');
  }, [router]);

  return null; // No se renderiza nada mientras se redirige
}
