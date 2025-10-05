import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F1F1F1] to-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#5FB61A] rounded-full mb-6">
            <span className="text-4xl text-white font-bold">£</span>
          </div>
          <h1 className="text-5xl font-bold text-[#1C1C1C] mb-4">
            Make a Difference Today
          </h1>
          <p className="text-xl text-gray-600">
            See how your donation impacts communities across London
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-10">
            <label className="block text-lg font-semibold text-[#1C1C1C] mb-4">
              How much would you like to donate?
            </label>
            <div className="relative">
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-3 bg-[#F1F1F1] rounded-full appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #5FB61A 0%, #5FB61A ${((amount - 10) / 990) * 100}%, #F1F1F1 ${((amount - 10) / 990) * 100}%, #F1F1F1 100%)`
                }}
              />
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">£10</span>
              <div className="text-center">
                <span className="text-5xl font-bold text-[#5FB61A]">£{amount}</span>
                <p className="text-sm text-gray-500 mt-1">
                  Supporting {Math.max(1, Math.floor(amount / 50))} {Math.floor(amount / 50) === 1 ? 'charity' : 'charities'}
                </p>
              </div>
              <span className="text-sm text-gray-500">£1,000</span>
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5FB61A] focus:outline-none transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="postcode" className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                London Postcode
              </label>
              <input
                type="text"
                id="postcode"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5FB61A] focus:outline-none transition-colors"
                placeholder="e.g., SW1A 1AA"
              />
              <p className="text-xs text-gray-500 mt-1">
                Must be a London postcode
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 shadow-lg"
          >
            See Your Impact
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            People's Postcode Lottery · Making a difference in communities
          </p>
        </div>
      </div>
    </div>
  );
}
