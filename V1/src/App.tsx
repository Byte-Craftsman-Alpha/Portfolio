import { lazy, Suspense, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
        {/* Splash screen — renders on top until animation completes */}
        {!splashDone && (
          <SplashScreen onComplete={handleSplashComplete} />
        )}

        {/* Main content — fades in after splash */}
        <AnimatePresence>
          {splashDone && (
            <motion.div
              key="main-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <ScrollProgress />
              <PointerFollower />
              <KeyboardEffect />
              <UrlReporter />
              <Navbar />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Footer />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
