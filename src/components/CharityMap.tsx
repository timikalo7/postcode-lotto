import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase, type CharityWithStory } from '../lib/supabase';
import { MapPin, X, ExternalLink, Mail, Heart } from 'lucide-react';
import Header from './Header';

interface CharityMapProps {
  donationAmount: number;
  userName: string;
  userPostcode: string;
}

export default function CharityMap({ donationAmount, userName, userPostcode }: CharityMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [charities, setCharities] = useState<CharityWithStory[]>([]);
  const [selectedCharity, setSelectedCharity] = useState<CharityWithStory | null>(null);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [userLocation] = useState<[number, number]>([51.5074, -0.1278]);

  const charitiesAffected = Math.max(1, Math.floor(donationAmount / 50));

  useEffect(() => {
    loadCharities();
  }, []);

  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView(userLocation, 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);

      const userIcon = L.divIcon({
        html: '<div style="background-color: #F4C400; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker(userLocation, { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup(`<strong>Your Location</strong><br/>${userName}`);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && charities.length > 0) {
      addMarkersToMap();
    }
  }, [charities, charitiesAffected]);

  const loadCharities = async () => {
    const { data, error } = await supabase
      .from('charities')
      .select(`
        *,
        stories (*)
      `)
      .order('latitude');

    if (error) {
      console.error('Error loading charities:', error);
      return;
    }

    setCharities(data as CharityWithStory[]);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const addMarkersToMap = () => {
    if (!mapRef.current) return;

    const sortedCharities = [...charities].sort((a, b) => {
      const distA = calculateDistance(userLocation[0], userLocation[1], Number(a.latitude), Number(a.longitude));
      const distB = calculateDistance(userLocation[0], userLocation[1], Number(b.latitude), Number(b.longitude));
      return distA - distB;
    });

    sortedCharities.forEach((charity, index) => {
      const isAffected = index < charitiesAffected;
      const iconColor = isAffected ? '#DC2626' : '#9CA3AF';

      const icon = L.divIcon({
        html: `<div style="background-color: ${iconColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;"></div>`,
        className: 'charity-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      const marker = L.marker([Number(charity.latitude), Number(charity.longitude)], { icon })
        .addTo(mapRef.current!);

      marker.on('click', () => {
        setSelectedCharity(charity);
      });

      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        Number(charity.latitude),
        Number(charity.longitude)
      );

      marker.bindTooltip(
        `<strong>${charity.name}</strong><br/>${distance.toFixed(1)}km away`,
        { direction: 'top' }
      );
    });
  };

  return (
    <div className="relative h-screen flex flex-col">
      <Header variant="transparent" />
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        <div className="absolute top-4 left-0 right-0 z-10 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-white to-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-2 border-gray-100">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-[#5FB61A] to-[#4fa015] rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-7 h-7 text-white fill-current" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-[#1C1C1C]">
                        Thank you, {userName}!
                      </h2>
                      <p className="text-lg text-gray-600 font-medium mt-1">
                        Your £{donationAmount} donation is making a real difference
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-sm mt-6 flex-wrap">
                    <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                      <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white shadow"></div>
                      <span className="text-gray-800 font-semibold">Directly Supported ({charitiesAffected})</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <div className="w-5 h-5 bg-gray-400 rounded-full border-2 border-white shadow"></div>
                      <span className="text-gray-800 font-semibold">Other Local Charities</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F4C400]/20 px-4 py-2 rounded-full">
                      <div className="w-5 h-5 bg-[#F4C400] rounded-full border-2 border-white shadow"></div>
                      <span className="text-gray-800 font-semibold">Your Location</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuggestionForm(true)}
                  className="bg-gradient-to-r from-[#FF6A00] to-[#e55f00] hover:from-[#e55f00] hover:to-[#cc5400] text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 flex items-center gap-2 shadow-xl whitespace-nowrap"
                >
                  <Mail className="w-5 h-5" />
                  Suggest a Charity
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedCharity && (
        <CharityStoryPopup
          charity={selectedCharity}
          onClose={() => setSelectedCharity(null)}
        />
      )}

      {showSuggestionForm && (
        <SuggestionForm
          userName={userName}
          onClose={() => setShowSuggestionForm(false)}
        />
      )}
    </div>
  );
}

function CharityStoryPopup({ charity, onClose }: { charity: CharityWithStory; onClose: () => void }) {
  const story = charity.stories?.[0];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-100">
        <div className="sticky top-0 bg-gradient-to-r from-[#5FB61A] to-[#4fa015] p-8 flex items-start justify-between rounded-t-3xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">{charity.name}</h3>
              <p className="text-sm text-white/90 mt-2 font-medium">{charity.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {charity.description && (
            <p className="text-gray-700 mb-8 text-lg leading-relaxed">{charity.description}</p>
          )}

          {story ? (
            <div className="bg-gradient-to-br from-[#F4C400]/10 to-[#5FB61A]/10 rounded-2xl p-8 border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-14 bg-gradient-to-b from-[#5FB61A] to-[#4fa015] rounded-full"></div>
                <h4 className="text-2xl font-bold text-[#1C1C1C]">{story.title}</h4>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">{story.content}</p>
              {story.author && (
                <p className="text-base text-gray-600 italic font-medium border-l-4 border-[#F4C400] pl-4">- {story.author}</p>
              )}
              {story.news_url && (
                <a
                  href={story.news_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 bg-[#5FB61A] hover:bg-[#4fa015] text-white font-bold px-6 py-3 rounded-xl transition-all hover:shadow-lg"
                >
                  Read more inspiring stories
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-12 text-lg">
              No stories available for this charity yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SuggestionForm({ userName, onClose }: { userName: string; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [charityName, setCharityName] = useState('');
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const { error: insertError } = await supabase
      .from('charity_suggestions')
      .insert([
        {
          user_name: userName,
          user_email: email,
          charity_name: charityName,
          reason: reason
        }
      ]);

    if (insertError) {
      setError('Failed to submit suggestion. Please try again.');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border-2 border-gray-100">
        <div className="bg-gradient-to-r from-[#5FB61A] to-[#4fa015] p-8 flex items-start justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-white">Suggest a Charity</h3>
              <p className="text-sm text-white/90 mt-1 font-medium">
                Help us support more amazing causes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-[#5FB61A] to-[#4fa015] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-[#1C1C1C] mb-3">Thank You!</h4>
              <p className="text-gray-600 text-lg">Your suggestion has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-base font-bold text-[#1C1C1C] mb-3">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-lg"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="charityName" className="block text-base font-bold text-[#1C1C1C] mb-3">
                  Charity Name
                </label>
                <input
                  type="text"
                  id="charityName"
                  value={charityName}
                  onChange={(e) => setCharityName(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all text-lg"
                  placeholder="Name of the charity"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-base font-bold text-[#1C1C1C] mb-3">
                  Why should we collaborate with them?
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:border-[#5FB61A] focus:ring-2 focus:ring-[#5FB61A]/20 focus:outline-none transition-all resize-none text-lg"
                  placeholder="Tell us about the charity's impact..."
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="p-5 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-base text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF6A00] to-[#e55f00] hover:from-[#e55f00] hover:to-[#cc5400] text-white font-bold py-5 px-8 rounded-xl transition-all transform hover:scale-[1.02] hover:shadow-2xl shadow-xl text-lg"
              >
                Submit Suggestion
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
