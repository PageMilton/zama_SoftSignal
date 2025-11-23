'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useFhevm } from '@/hooks/useFhevm';
import { useContract } from '@/hooks/useContract';
import { getUserEntryCount, getUserEntryIds, getEntry } from '@/lib/contract/SoftSignalContract';
import { batchDecrypt } from '@/lib/fhevm/decryption';
import { formatDate } from '@/lib/utils/formatting';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendPoint {
  date: string;
  timestamp: number;
  mood?: number;
  stress?: number;
  sleep?: number;
}

export default function TrendsPage() {
  const { address, isConnected, provider } = useWallet();
  const { instance } = useFhevm();
  const { contract, contractAddress } = useContract();

  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [avgStats, setAvgStats] = useState<{ mood: number; stress: number; sleep: number } | null>(null);

  useEffect(() => {
    if (contract && address) {
      loadTrendData();
    }
  }, [contract, address, timeRange]);

  const loadTrendData = async () => {
    if (!contract || !address) return;

    setIsLoading(true);
    try {
      const count = await getUserEntryCount(contract, address);
      if (count === 0) {
        setTrendData([]);
        return;
      }

      // Determine number of entries to fetch based on time range
      let entriesToFetch = count;
      if (timeRange === '7d') entriesToFetch = Math.min(count, 7);
      else if (timeRange === '30d') entriesToFetch = Math.min(count, 30);
      else if (timeRange === '90d') entriesToFetch = Math.min(count, 90);

      const startIndex = count > entriesToFetch ? count - entriesToFetch : 0;
      const ids = await getUserEntryIds(contract, address, startIndex, entriesToFetch);

      const entryPromises = ids.map(async (id) => {
        const entry = await getEntry(contract, id);
        return {
          id,
          moodHandle: entry.mood,
          stressHandle: entry.stress,
          sleepHandle: entry.sleep,
          timestamp: entry.timestamp,
          date: formatDate(entry.timestamp),
        };
      });

      const entries = await Promise.all(entryPromises);

      // Sort by timestamp
      entries.sort((a, b) => a.timestamp - b.timestamp);

      // Convert to trend points (not yet decrypted)
      const points: TrendPoint[] = entries.map((e) => ({
        date: e.date,
        timestamp: e.timestamp,
      }));

      setTrendData(points);
    } catch (error) {
      console.error('Failed to load trend data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecryptTrends = async () => {
    if (!instance || !contract || !contractAddress || !address || !provider) return;
    if (trendData.length === 0) return;

    setIsDecrypting(true);
    try {
      const count = await getUserEntryCount(contract, address);
      let entriesToFetch = count;
      if (timeRange === '7d') entriesToFetch = Math.min(count, 7);
      else if (timeRange === '30d') entriesToFetch = Math.min(count, 30);
      else if (timeRange === '90d') entriesToFetch = Math.min(count, 90);

      const startIndex = count > entriesToFetch ? count - entriesToFetch : 0;
      const ids = await getUserEntryIds(contract, address, startIndex, entriesToFetch);

      // Get signer
      const signer = await provider.getSigner();

      // Batch allow all entries (simplified - in production you might want to optimize this)
      const contractWithSigner = contract.connect(signer) as typeof contract;
      for (const id of ids) {
        try {
          await contractWithSigner.allowAccount(id, address);
        } catch (error) {
          // Might already be allowed, continue
          console.log(`Entry ${id} already allowed or error:`, error);
        }
      }

      // Get all handles
      const entries = await Promise.all(ids.map((id) => getEntry(contract, id)));
      const allHandles = entries.flatMap((e) => [e.mood, e.stress, e.sleep]);

      // Batch decrypt all values
      const decryptedValues = await batchDecrypt(
        instance,
        contractAddress,
        allHandles,
        address,
        signer
      );

      // Reconstruct trend data with decrypted values
      const decryptedTrends: TrendPoint[] = entries.map((entry, index) => ({
        date: formatDate(entry.timestamp),
        timestamp: entry.timestamp,
        mood: decryptedValues[index * 3] / 100,
        stress: decryptedValues[index * 3 + 1] / 100,
        sleep: decryptedValues[index * 3 + 2] / 100,
      }));

      // Sort by timestamp
      decryptedTrends.sort((a, b) => a.timestamp - b.timestamp);

      setTrendData(decryptedTrends);

      // Calculate averages
      const avgMood = decryptedTrends.reduce((sum, t) => sum + (t.mood || 0), 0) / decryptedTrends.length;
      const avgStress = decryptedTrends.reduce((sum, t) => sum + (t.stress || 0), 0) / decryptedTrends.length;
      const avgSleep = decryptedTrends.reduce((sum, t) => sum + (t.sleep || 0), 0) / decryptedTrends.length;

      setAvgStats({ mood: avgMood, stress: avgStress, sleep: avgSleep });
    } catch (error) {
      console.error('Failed to decrypt trends:', error);
      alert('Failed to decrypt trends. See console for details.');
    } finally {
      setIsDecrypting(false);
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
                Please connect your wallet to view trends
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </>
    );
  }

  const isDecrypted = trendData.length > 0 && trendData[0].mood !== undefined;

  return (
    <>
      <Navbar />
      <main className="container py-8 scroll-mt-16">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mental Health Trends</h1>
            <p className="text-muted-foreground">
              Visualize your patterns over time
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeRange === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('7d')}
            >
              7 Days
            </Button>
            <Button
              variant={timeRange === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('30d')}
            >
              30 Days
            </Button>
            <Button
              variant={timeRange === '90d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('90d')}
            >
              90 Days
            </Button>
            <Button
              variant={timeRange === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange('all')}
            >
              All Time
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Trend Chart</CardTitle>
                  <CardDescription>
                    Your mood, stress, and sleep patterns
                  </CardDescription>
                </div>
                {!isDecrypted && trendData.length > 0 && (
                  <Button
                    onClick={handleDecryptTrends}
                    disabled={isDecrypting || !instance}
                  >
                    {isDecrypting ? 'Decrypting...' : '🔓 Decrypt & View Trends'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              ) : trendData.length === 0 ? (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">
                    No entries yet. Start tracking from the dashboard!
                  </p>
                </div>
              ) : !isDecrypted ? (
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                  <p className="text-muted-foreground">
                    Click "Decrypt & View Trends" to visualize your data
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#3B82F6" name="Mood" strokeWidth={2} />
                    <Line type="monotone" dataKey="stress" stroke="#F97316" name="Stress" strokeWidth={2} />
                    <Line type="monotone" dataKey="sleep" stroke="#10B981" name="Sleep" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardDescription>Average Mood</CardDescription>
                <CardTitle className="text-4xl">
                  {avgStats ? avgStats.mood.toFixed(1) : '-'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Average Stress</CardDescription>
                <CardTitle className="text-4xl">
                  {avgStats ? avgStats.stress.toFixed(1) : '-'}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardDescription>Average Sleep</CardDescription>
                <CardTitle className="text-4xl">
                  {avgStats ? avgStats.sleep.toFixed(1) : '-'}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
