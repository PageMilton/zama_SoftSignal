'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useFhevm } from '@/hooks/useFhevm';
import { useContract } from '@/hooks/useContract';
import { encryptEmotionEntry } from '@/lib/fhevm/encryption';
import { getUserEntryCount } from '@/lib/contract/SoftSignalContract';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, isConnected, connect, availableProviders, provider } = useWallet();
  const { instance } = useFhevm();
  const { contract, contractAddress } = useContract();

  const [mood, setMood] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleep, setSleep] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entryCount, setEntryCount] = useState<number | null>(null);
  const [hasEnteredToday, setHasEnteredToday] = useState(false);

  useEffect(() => {
    if (contract && address) {
      getUserEntryCount(contract, address).then(setEntryCount);
    }
  }, [contract, address]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instance || !contract || !contractAddress || !address || !provider) return;

    setIsSubmitting(true);
    try {
      const encrypted = await encryptEmotionEntry(
        instance,
        contractAddress,
        address,
        mood,
        stress,
        sleep
      );

      const timestamp = Math.floor(Date.now() / 1000);
      const tags: string[] = [];

      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as typeof contract;

      const tx = await contractWithSigner.addEntry(
        encrypted.handles[0],
        encrypted.handles[1],
        encrypted.handles[2],
        timestamp,
        tags,
        encrypted.inputProof
      );

      await tx.wait();

      setHasEnteredToday(true);
      if (entryCount !== null) {
        setEntryCount(entryCount + 1);
      }

      alert('Entry submitted successfully!');
    } catch (error) {
      console.error('Failed to submit entry:', error);
      alert('Failed to submit entry. See console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Navbar />
        <main className="container py-24 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={() => connect(availableProviders[0])}
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-8 scroll-mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">How are you feeling today?</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardDescription>Days Tracked</CardDescription>
              <CardTitle className="text-4xl">{entryCount ?? '...'}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Current Streak</CardDescription>
              <CardTitle className="text-4xl">-</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Latest Mood</CardDescription>
              <CardTitle className="text-4xl">
                {hasEnteredToday ? mood : '-'}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Today's Entry */}
        {!hasEnteredToday ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Record Today's Emotions</CardTitle>
              <CardDescription>
                All data is encrypted before being stored on-chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mood Score: {mood}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>😢 Very Low</span>
                    <span>😄 Very High</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Stress Level: {stress}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={stress}
                    onChange={(e) => setStress(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Low Stress</span>
                    <span>High Stress</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sleep Quality: {sleep}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={sleep}
                    onChange={(e) => setSleep(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor Sleep</span>
                    <span>Great Sleep</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !instance || !contract}
                >
                  {isSubmitting ? 'Submitting...' : 'Save Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>✓ Today's Entry Recorded</CardTitle>
              <CardDescription>
                Your entry has been encrypted and stored on-chain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/diary">
                <Button variant="outline" className="w-full">
                  View Entry History
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/trends">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>View Trends</CardTitle>
                <CardDescription>
                  Visualize your mental health patterns over time
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/insights">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>
                  Check for concerning patterns in your data
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
