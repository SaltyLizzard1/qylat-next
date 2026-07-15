'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import LeapCalculator from '../../components/LeapCalculator';

export default function CalculatorPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <LeapCalculator />
      <Footer />
    </div>
  );
}
