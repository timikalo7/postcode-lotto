import { useState } from 'react';
import { ArrowRight, Heart, MapPin, Users } from 'lucide-react';
import Header from './Header';

interface DonationStepProps {
  onComplete: (data: { amount: number; name: string; postcode: string }) => void;
}

export default function DonationStep({ onComplete }: DonationStepProps) {
  const [amount, setAmount] = useState(100);
  const [name, setName] = useState('');
  const [postcode, setPostcode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!postcode.trim()) {
      setError('Please enter your postcode');
      return;
    }

    const normalizedPostcode = postcode.toUpperCase().replace(/\s/g, '');
    const londonPostcodePattern = /^(E|EC|N|NW|SE|SW|W|WC|BR|CR|DA|EN|HA|IG|KT|RM|SM|TW|UB|WD)\d/;

    if (!londonPostcodePattern.test(normalizedPostcode)) {
      setError('Please enter a valid London postcode');
      return;
    }

    onComplete({ amount, name, postcode: postcode.trim() });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F1F1F1] via-white to-[#F1F1F1]">
      <Header />

      <div className="flex items-center justify-center p-6 py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#5FB61A] to-[#4fa015] rounded-full mb-6 shadow-xl">
              <span className="text-5xl text-white font-bold">£</span>
            </div>
            <h1 className="text-6xl font-bold text-[#1C1C1C] mb-4 leading-tight">
              See Your Impact
            </h1>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
              Discover how your contribution transforms lives across London
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#F4C400] text-center transform hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-[#F4C400] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2">Direct Impact</h3>
              <p className="text-sm text-gray-600">Support charities making real change</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#5FB61A] text-center transform hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-[#5FB61A] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2">Local Support</h3>
              <p className="text-sm text-gray-600">Help communities near you</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#FF6A00] text-center transform hover:scale-105 transition-transform">
              <div className="w-14 h-14 bg-[#FF6A00] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2">Real Stories</h3>
              <p className="text-sm text-gray-600">See the people you're helping</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-10 border-2 border-gray-100">
          <div className="mb-10">
            <label className="block text-xl font-bold text-[#1C1C1C] mb-6">
              How much would you like to donate?
            </label>
            <div className="bg-gradient-to-br from-[#5FB61A]/10 to-[#F4C400]/10 rounded-2xl p-8 mb-6">
              <div className="text-center mb-8">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-7xl font-bold bg-gradient-to-r from-[#5FB61A] to-[#4fa015] bg-clip-text text-transparent">
                    £{amount}
                  </span>
                </div>
                <p className="text-lg text-gray-600 mt-3 font-medium">
                  Supporting {Math.max(1, Math.floor(amount / 50))} amazing {Math.floor(amount / 50) === 1 ? 'charity' : 'charities'} in London
                </p>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-4 bg-[#F1F1F1] rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #5FB61A 0%, #5FB61A ${((amount - 10) / 990) * 100}%, #F1F1F1 ${((amount - 10) / 990) * 100}%, #F1F1F1 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full shadow">£10</span>
                <span className="text-sm font-semibold text-gray-600 bg-white px-3 py-1 rounded-full shadow">£1,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-base font-bold text-[#1C1C1C] mb-3">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="postcode" className="block text-base font-bold text-[#1C1C1C] mb-3">
                London Postcode
              </label>
              <input
                type="text"
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-lg"
                placeholder="e.g., SW1A 1AA"
              />
              <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Must be a valid London postcode
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-5 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-base text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#e55f00] hover:from-[#e55f00] hover:to-[#cc5400] text-white font-bold py-5 px-8 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3 shadow-xl text-lg"
          >
            See Your Impact
            <ArrowRight className="w-6 h-6" />
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-base text-gray-600 font-medium">
            Together we're making a difference in communities across London
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}
