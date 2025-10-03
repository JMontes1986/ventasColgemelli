
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page is deprecated. The self-service portal is now public at /self-service.
// This component will redirect any lingering traffic.
export default function SelfServicePosRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/self-service');
  }, [router]);

  return null;
}
