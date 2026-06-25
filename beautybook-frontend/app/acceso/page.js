'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AccesoPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/login'); }, [router]);
  return <LoadingSpinner />;
}
