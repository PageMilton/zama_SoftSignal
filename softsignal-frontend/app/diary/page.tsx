'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useFhevm } from '@/hooks/useFhevm';
import { useContract } from '@/hooks/useContract';
import { getUserEntryCount, getUserEntryIds, getEntry, allowAccount } from '@/lib/contract/SoftSignalContract';
import { userDecrypt } from '@/lib/fhevm/decryption';
import { formatDate } from '@/lib/utils/formatting';

interface DecryptedEntry {
  id: number;
  mood: number | null;
  stress: number | null;
  sleep: number | null;
  timestamp: number;
  isDecrypting: boolean;
}

export default function DiaryPage() {
  const { address, isConnected, provider } = useWallet();
  const { instance } = useFhevm();
  const { contract, contractAddress } = useContract();

  const [entries, setEntries] = useState<DecryptedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (contract && address) {
      loadEntries();
    }
  }, [contract, address]);

  const loadEntries = async () => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const count = await getUserEntryCount(contract, address);
      if (count === 0) {
        setEntries([]);
        return;
      }

      const ids = await getUserEntryIds(contract, address, 0, count);
      const entryPromises = ids.map(async (id) => {
        const entry = await getEntry(contract, id);
        return {
          id,
          mood: null,
          stress: null,
          sleep: null,
          timestamp: entry.timestamp,
          isDecrypting: false,
        };
      });

      const loadedEntries = await Promise.all(entryPromises);
      setEntries(loadedEntries.reverse()); // Most recent first
    } catch (error) {
      console.error('Failed to load entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecrypt = async (entryId: number) => {
    if (!instance || !contract || !contractAddress || !address || !provider) return;

    setEntries((prev) =>
      prev.map((e) => (e.id === entryId ? { ...e, isDecrypting: true } : e))
    );

    try {
      // Grant permission
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as typeof contract;
      await allowAccount(contractWithSigner, entryId, address);

      // Get encrypted handles
      const entry = await getEntry(contract, entryId);

      // Decrypt values with signer
      const mood = await userDecrypt(instance, contractAddress, entry.mood, address, signer);
      const stress = await userDecrypt(instance, contractAddress, entry.stress, address, signer);
      const sleep = await userDecrypt(instance, contractAddress, entry.sleep, address, signer);

      setEntries((prev) =>
        prev.map((e) =>
          e.id === entryId
            ? { ...e, mood: mood / 100, stress: stress / 100, sleep: sleep / 100, isDecrypting: false }
            : e
        )
      );
    } catch (error) {
      console.error('Failed to decrypt entry:', error);
      setEntries((prev) =>
        prev.map((e) => (e.id === entryId ? { ...e, isDecrypting: false } : e))
      );
      alert('Failed to decrypt entry. See console for details.');
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
                Please connect your wallet to view your diary
              </CardDescription>
            </CardHeader>
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
          <h1 className="text-3xl font-bold mb-2">Your Emotion History</h1>
          <p className="text-muted-foreground">
            All entries are encrypted on-chain. Click decrypt to view.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Entries Yet</CardTitle>
              <CardDescription>
                Start tracking your emotions from the dashboard
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Entry #{entry.id}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(entry.timestamp)}
                      </CardDescription>
                    </div>
                    {entry.mood === null ? (
                      <Button
                        size="sm"
                        onClick={() => handleDecrypt(entry.id)}
                        disabled={entry.isDecrypting}
                      >
                        {entry.isDecrypting ? 'Decrypting...' : '🔓 Decrypt & View'}
                      </Button>
                    ) : (
                      <div className="text-sm text-green-600 font-medium">
                        ✓ Decrypted
                      </div>
                    )}
                  </div>
                </CardHeader>
                {entry.mood !== null && (
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Mood</p>
                        <p className="text-2xl font-bold">{entry.mood.toFixed(1)}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Stress</p>
                        <p className="text-2xl font-bold">{entry.stress?.toFixed(1)}/10</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Sleep</p>
                        <p className="text-2xl font-bold">{entry.sleep?.toFixed(1)}/10</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
