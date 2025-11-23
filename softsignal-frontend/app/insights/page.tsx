'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { useFhevm } from '@/hooks/useFhevm';
import { useContract } from '@/hooks/useContract';
import { getRiskLevel, getUserEntryCount, allowRiskLevel } from '@/lib/contract/SoftSignalContract';
import { decryptRiskLevel } from '@/lib/fhevm/decryption';

type RiskLevel = 'low' | 'moderate' | 'elevated' | 'high';

export default function InsightsPage() {
  const { address, isConnected, provider } = useWallet();
  const { instance } = useFhevm();
  const { contract, contractAddress } = useContract();

  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [entryCount, setEntryCount] = useState<number>(0);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (contract && address) {
      checkDataAvailability();
    }
  }, [contract, address]);

  const checkDataAvailability = async () => {
    if (!contract || !address) return;

    try {
      const count = await getUserEntryCount(contract, address);
      setEntryCount(count);
      setHasData(count > 0);
    } catch (error) {
      console.error('Failed to check data availability:', error);
    }
  };

  const handleDecryptRisk = async () => {
    if (!instance || !contract || !contractAddress || !address || !provider) return;

    setIsDecrypting(true);
    try {
      // Get signer and create contract with signer
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer) as typeof contract;

      // Step 1: Grant permission to decrypt risk level
      console.log('[Insights] Granting permission to decrypt risk level...');
      await allowRiskLevel(contractWithSigner);
      console.log('[Insights] Permission granted');

      // Step 2: Get encrypted risk level
      console.log('[Insights] Getting encrypted risk level...');
      const encryptedRisk = await getRiskLevel(contractWithSigner, address);
      console.log('[Insights] Got encrypted risk:', encryptedRisk);

      // Step 3: Decrypt the risk level
      console.log('[Insights] Decrypting risk level...');
      const decrypted = await decryptRiskLevel(
        instance,
        contractAddress,
        encryptedRisk,
        address,
        signer
      );
      console.log('[Insights] Decrypted value:', decrypted);

      // Map number to risk level
      const riskLevels: RiskLevel[] = ['low', 'moderate', 'elevated', 'high'];
      const level = riskLevels[Math.min(decrypted, 3)] || 'low';

      setRiskLevel(level);
    } catch (error) {
      console.error('Failed to decrypt risk level:', error);
      alert('Failed to decrypt risk level. See console for details.');
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
                Please connect your wallet to view insights
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </>
    );
  }

  const getRiskColor = (level: RiskLevel | null) => {
    if (!level) return 'bg-gray-500/10 text-gray-600';
    switch (level) {
      case 'low':
        return 'bg-green-500/10 text-green-600';
      case 'moderate':
        return 'bg-amber-500/10 text-amber-600';
      case 'elevated':
        return 'bg-orange-500/10 text-orange-600';
      case 'high':
        return 'bg-red-500/10 text-red-600';
    }
  };

  const getRiskText = (level: RiskLevel | null) => {
    if (!level) return 'Unknown Risk';
    return level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';
  };

  const getRiskDescription = (level: RiskLevel | null) => {
    if (!level) return 'Decrypt your data to see risk assessment';
    switch (level) {
      case 'low':
        return 'No concerning patterns detected. Your mental health indicators look good!';
      case 'moderate':
        return 'Some minor concerns detected. Consider reviewing your patterns.';
      case 'elevated':
        return 'Several concerning indicators detected. You may want to take action.';
      case 'high':
        return 'Multiple concerning patterns detected. Please consider seeking support.';
    }
  };

  const getRecommendations = (level: RiskLevel | null) => {
    if (!level) return [];
    switch (level) {
      case 'low':
        return [
          'Continue tracking daily to build more insights',
          'Your patterns look healthy',
          'Keep up the good work!',
        ];
      case 'moderate':
        return [
          'Review your trends to identify patterns',
          'Consider stress reduction techniques',
          'Maintain consistent sleep schedule',
        ];
      case 'elevated':
        return [
          'Pay close attention to your mood patterns',
          'Consider mindfulness or relaxation exercises',
          'Talk to someone you trust about how you\'re feeling',
          'Evaluate your sleep hygiene',
        ];
      case 'high':
        return [
          'Reach out to a mental health professional',
          'Talk to trusted friends or family',
          'Consider crisis helplines if needed',
          'Focus on self-care and rest',
          'Don\'t hesitate to seek support',
        ];
    }
  };

  return (
    <>
      <Navbar />
      <main className="container py-8 scroll-mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mental Health Insights</h1>
          <p className="text-muted-foreground">
            Risk assessment and pattern detection
          </p>
        </div>

        {!hasData ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                Start tracking your emotions from the dashboard to get insights
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Risk Assessment</CardTitle>
                    <CardDescription>
                      Based on your encrypted data from the last 30 days ({entryCount} entries)
                    </CardDescription>
                  </div>
                  {!riskLevel && (
                    <Button
                      onClick={handleDecryptRisk}
                      disabled={isDecrypting || !instance}
                    >
                      {isDecrypting ? 'Decrypting...' : '🔓 Decrypt Risk Level'}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div
                      className={`inline-block px-6 py-3 rounded-full font-semibold text-lg mb-2 ${getRiskColor(
                        riskLevel
                      )}`}
                    >
                      {getRiskText(riskLevel)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getRiskDescription(riskLevel)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {riskLevel && (
              <>
                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Mood Volatility</CardTitle>
                      <CardDescription>Stability of mood scores</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {riskLevel === 'low' || riskLevel === 'moderate' ? 'Low' : 'High'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Stress Persistence</CardTitle>
                      <CardDescription>Days with high stress</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {riskLevel === 'low' ? 'Low' : riskLevel === 'moderate' ? 'Medium' : 'High'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Sleep Consistency</CardTitle>
                      <CardDescription>Regularity of sleep</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {riskLevel === 'low' || riskLevel === 'moderate' ? 'Good' : 'Poor'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>
                      Personalized wellness suggestions based on your risk level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {getRecommendations(riskLevel).map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span
                            className={`mr-2 ${
                              riskLevel === 'low'
                                ? 'text-green-600'
                                : riskLevel === 'moderate'
                                ? 'text-amber-600'
                                : 'text-orange-600'
                            }`}
                          >
                            {riskLevel === 'low' ? '✓' : '•'}
                          </span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {(riskLevel === 'elevated' || riskLevel === 'high') && (
                  <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                    <CardHeader>
                      <CardTitle className="text-orange-900 dark:text-orange-100">
                        Need Support?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-4">
                        If you're experiencing persistent mental health concerns, consider reaching out:
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li>
                          <strong>National Suicide Prevention Lifeline:</strong> 988
                        </li>
                        <li>
                          <strong>Crisis Text Line:</strong> Text HOME to 741741
                        </li>
                        <li>
                          <strong>SAMHSA National Helpline:</strong> 1-800-662-4357
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </>
  );
}
