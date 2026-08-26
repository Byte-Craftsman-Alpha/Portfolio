import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProofMetrics from './components/ProofMetrics';
import ContributionGrid from './components/ContributionGrid';
import Projects from './components/Projects';
import CapabilityMap from './components/CapabilityMap';
import RatingBadges from './components/RatingBadges';
import Principles from './components/Principles';
import LearningTimeline from './components/LearningTimeline';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ScrollProgress from './components/ScrollProgress';
import PointerFollower from './components/PointerFollower';
import KeyboardEffect from './components/KeyboardEffect';
import UrlReporter from './components/UrlReporter';
import SplashScreen from './components/SplashScreen';

const NotFound = lazy(() => import('./pages/NotFound'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="w-8 h-8 border-2 border-hairline border-t-charcoal rounded-full"
      />
    </div>
  );
}

function HomePage() {
  return (
    <main>
      <Hero />
      <ProofMetrics />
      <ContributionGrid />
      <Projects />
      <CapabilityMap />
      <RatingBadges />
      <Principles />
      <LearningTimeline />
      <Contact />
    </main>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <BrowserRouter>
      <div className="bg-ivory text-charcoal min-h-screen font-sans antialiased">
        {/* Global UI layers — OUTSIDE blur container so they're never blurred */}
        <PointerFollower />
        <KeyboardEffect />
        <ScrollProgress />
        <UrlReporter />

        {/* Splash screen — fixed overlay, z-[100] */}
        <SplashScreen onComplete={handleSplashComplete} />

        {/* Main content — ALWAYS in DOM, starts blurred, unblurs when splash completes */}
        <motion.div
          initial={{ filter: 'blur(8px)', opacity: 0.15 }}
          animate={{
            filter: splashDone ? 'blur(0px)' : 'blur(8px)',
            opacity: splashDone ? 1 : 0.15,
          }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </motion.div>
      </div>
    </BrowserRouter>
  );
}
