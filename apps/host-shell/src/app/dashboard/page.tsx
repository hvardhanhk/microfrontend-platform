import dynamic from 'next/dynamic';
import { Spinner } from '@platform/ui';

const UserMfe = dynamic(() => import('@/components/mfe/user-mfe'), {
  loading: () => <div className="flex h-96 items-center justify-center"><Spinner size="lg" /></div>,
});

export const metadata = { title: 'Dashboard' };

export default function Dashboard() {
  return <UserMfe />;
}
