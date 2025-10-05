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

      <div className="flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
              <img 
                src="/peoples-postcode-lottery-logo.png" 
                alt="People's Postcode Lottery" 
                className="h-12 sm:h-16 w-auto"
              />
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#5FB61A] to-[#4fa015] rounded-full shadow-xl">
                <span className="text-3xl sm:text-4xl text-white font-bold">£</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1C1C1C] mb-4 leading-tight px-2">
              See Your Impact
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto px-4">
              Discover how your contribution transforms lives across London
            </p>
            <div className="mt-6 inline-flex items-center gap-2 bg-[#F4C400]/20 px-4 sm:px-6 py-2 sm:py-3 rounded-full border-2 border-[#F4C400] mx-2">
              <span className="text-sm sm:text-base text-[#1C1C1C] font-bold text-center">Powered by People's Postcode Lottery</span>
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#5FB61A] fill-current" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-[#F4C400] text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#F4C400] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2 text-sm sm:text-base">Direct Impact</h3>
              <p className="text-xs sm:text-sm text-gray-600">Support charities making real change</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-[#5FB61A] text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#5FB61A] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <MapPin className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2 text-sm sm:text-base">Local Support</h3>
              <p className="text-xs sm:text-sm text-gray-600">Help communities near you</p>
            </div>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-[#FF6A00] text-center transform hover:scale-105 transition-transform">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF6A00] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="font-bold text-[#1C1C1C] mb-2 text-sm sm:text-base">Real Stories</h3>
              <p className="text-xs sm:text-sm text-gray-600">See the people you're helping</p>
            </div>
          </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 lg:p-10 border-2 border-gray-100">
          <div className="mb-8 sm:mb-10">
            <label className="block text-lg sm:text-xl font-bold text-[#1C1C1C] mb-4 sm:mb-6">
              How much would you like to donate?
            </label>
            <div className="bg-gradient-to-br from-[#5FB61A]/10 to-[#F4C400]/10 rounded-2xl p-6 sm:p-8 mb-6">
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-[#5FB61A] to-[#4fa015] bg-clip-text text-transparent">
                    £{amount}
                  </span>
                </div>
                <p className="text-base sm:text-lg text-gray-600 mt-3 font-medium px-2">
                  Supporting {Math.max(1, Math.floor(amount / 50))} amazing {Math.floor(amount / 50) === 1 ? 'charity' : 'charities'} in London
                </p>
              </div>
              <div className="relative px-2">
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full h-3 sm:h-4 bg-[#F1F1F1] rounded-full appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #5FB61A 0%, #5FB61A ${((amount - 10) / 990) * 100}%, #F1F1F1 ${((amount - 10) / 990) * 100}%, #F1F1F1 100%)`
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-4 px-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-white px-2 sm:px-3 py-1 rounded-full shadow">£10</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-600 bg-white px-2 sm:px-3 py-1 rounded-full shadow">£1,000</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <div>
              <label htmlFor="name" className="block text-sm sm:text-base font-bold text-[#1C1C1C] mb-2 sm:mb-3">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-base sm:text-lg"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="postcode" className="block text-sm sm:text-base font-bold text-[#1C1C1C] mb-2 sm:mb-3">
                London Postcode
              </label>
              <input
                type="text"
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-base sm:text-lg"
                placeholder="e.g., SW1A 1AA"
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-2 flex items-center gap-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                Must be a valid London postcode
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-sm sm:text-base text-red-700 font-semibold">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#FF6A00] to-[#e55f00] hover:from-[#e55f00] hover:to-[#cc5400] text-white font-bold py-4 sm:py-5 px-6 sm:px-8 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-3 shadow-xl text-base sm:text-lg"
          >
            See Your Impact
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </form>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-sm sm:text-base text-gray-600 font-medium mb-4 sm:mb-6 px-4">
            Together we're making a difference in communities across London
          </p>
          
          <div className="bg-gradient-to-r from-[#5FB61A]/10 via-[#F4C400]/10 to-[#FF6A00]/10 rounded-2xl p-4 sm:p-6 border-2 border-gray-100">
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-[#5FB61A]">£32M+</div>
                <div className="text-xs sm:text-sm text-gray-600">Raised for charity</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-[#F4C400]">8,500+</div>
                <div className="text-xs sm:text-sm text-gray-600">Charities supported</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-[#FF6A00]">3M+</div>
                <div className="text-xs sm:text-sm text-gray-600">Lives changed</div>
              </div>
            </div>
            <div className="mt-3 sm:mt-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500 font-medium px-2">
                People's Postcode Lottery players have helped make this possible
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
