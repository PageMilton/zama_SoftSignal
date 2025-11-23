'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Gradient Background */}
      <section className="relative container flex flex-col items-center justify-center gap-8 py-24 md:py-32 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/20 dark:via-background dark:to-emerald-950/20" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl animate-pulse dark:bg-indigo-800/20" />
          <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl animate-pulse [animation-delay:1s] dark:bg-emerald-800/20" />
        </div>

        {/* Logo with Animation */}
        <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30 animate-in fade-in slide-in-from-top-4 duration-700">
          <span className="text-4xl font-bold text-white">S</span>
        </div>
        
        <div className="flex flex-col items-center text-center space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Your Mental Wellness,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Privately Tracked
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Track your emotions, stress, and sleep patterns with complete privacy. 
            All data encrypted on-chain using FHEVM technology.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/dashboard">
              <Button 
                size="lg" 
                className="min-w-[200px] bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Launch App
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="min-w-[200px] border-2 hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-indigo-950/30 transition-all hover:scale-105" 
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
              <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Blockchain Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Open Source</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative container py-24 scroll-mt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/0 via-muted/50 to-muted/0 -z-10" />
        
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 font-medium text-sm mb-4">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Privacy-First Mental Health Tracking
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Powerful Features for
            <br />
            <span className="text-indigo-600">Complete Privacy</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">
            Powered by fully homomorphic encryption (FHEVM), your sensitive data never leaves your control
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-indigo-200 dark:hover:border-indigo-800">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Private Emotion Diary</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Record daily mood scores and stress levels - encrypted locally before going on-chain
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-200 dark:hover:border-emerald-800">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Trend Analysis</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                View your mental health trends computed directly on encrypted data
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-amber-200 dark:hover:border-amber-800">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-amber-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Risk Detection</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Get alerted to concerning patterns while keeping your data private
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-violet-200 dark:hover:border-violet-800">
            <CardHeader>
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-violet-500/30">
                <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <CardTitle className="text-lg">Anonymous Insights</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Contribute to mental health research without exposing personal data
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container py-24">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes with our simple four-step process
          </p>
        </div>

        <div className="relative grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-indigo-200 via-emerald-200 to-indigo-200 dark:from-indigo-800 dark:via-emerald-800 dark:to-indigo-800" />
          
          {[
            { 
              step: 1, 
              title: 'Connect your wallet', 
              desc: 'Use MetaMask or any Web3 wallet',
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              )
            },
            { 
              step: 2, 
              title: 'Record daily emotions', 
              desc: 'Encrypted locally using FHEVM',
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              )
            },
            { 
              step: 3, 
              title: 'Data stored on-chain', 
              desc: 'Fully encrypted, immutable records',
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )
            },
            { 
              step: 4, 
              title: 'View trends', 
              desc: 'Decrypted only by you, on demand',
              icon: (
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )
            },
          ].map((item, idx) => (
            <div key={item.step} className="relative flex flex-col items-center text-center group">
              <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-all duration-300 mb-6 z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                <div className="relative">{item.icon}</div>
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-sm font-bold text-indigo-600 border-2 border-indigo-100 dark:border-indigo-800">
                  {item.step}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology */}
      <section className="relative container py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/20 dark:via-background dark:to-emerald-950/20 -z-10" />
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/4 h-64 w-64 rounded-full bg-indigo-200/20 blur-3xl dark:bg-indigo-800/10" />
          <div className="absolute top-1/2 right-1/4 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-800/10" />
        </div>

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-100 to-emerald-100 dark:from-indigo-900/30 dark:to-emerald-900/30 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-200/50 dark:border-indigo-800/50">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            Powered by FHEVM
          </div>
          
          <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
            Fully Homomorphic
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-emerald-600 bg-clip-text text-transparent">
              Encryption
            </span>
          </h2>
          
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            FHEVM allows computations on encrypted data without ever exposing your personal information. 
            Your mental health data remains private while still enabling powerful trend analysis and risk detection.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-indigo-100 dark:border-indigo-800/50">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Sepolia Testnet</div>
                <div className="text-sm text-muted-foreground">FHEVM-enabled</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Ethereum Compatible</div>
                <div className="text-sm text-muted-foreground">EVM-based chain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-lg">SoftSignal</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Privacy-first mental health tracking powered by FHEVM. Your emotions, encrypted. Your data, yours alone.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4 text-sm">Resources</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  Documentation
                </Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  GitHub
                </Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  API Reference
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  Terms of Service
                </Link>
                <Link href="#" className="hover:text-indigo-600 transition-colors">
                  License
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © 2025 SoftSignal. Built with 💚 using FHEVM.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-indigo-600 transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
