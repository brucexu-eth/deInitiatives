import { InitiativeList } from '@/components/initiative-list';
import { ConnectButton } from '@/components/connect-button';

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">DeInitiatives</h1>
          <ConnectButton />
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <InitiativeList />
      </div>
    </main>
  );
}