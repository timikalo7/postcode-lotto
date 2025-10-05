import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase, type CharityWithStory } from '../lib/supabase';
import { MapPin, X, ExternalLink, Mail } from 'lucide-react';

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
    <div className="relative h-screen">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-white to-transparent z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-[#1C1C1C] mb-2">
                  Your Impact, {userName}
                </h2>
                <p className="text-gray-600 mb-4">
                  Your £{donationAmount} donation is supporting {charitiesAffected} {charitiesAffected === 1 ? 'charity' : 'charities'} in your area
                </p>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Directly Supported</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-full border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Other Local Charities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#F4C400] rounded-full border-2 border-white shadow"></div>
                    <span className="text-gray-700 font-medium">Your Location</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSuggestionForm(true)}
                className="bg-[#5FB61A] hover:bg-[#4fa015] text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg whitespace-nowrap"
              >
                <Mail className="w-5 h-5" />
                Suggest a Charity
              </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#5FB61A] rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#1C1C1C]">{charity.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{charity.address}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {charity.description && (
            <p className="text-gray-600 mb-6">{charity.description}</p>
          )}

          {story ? (
            <div className="bg-[#F1F1F1] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-8 bg-[#5FB61A] rounded-full"></div>
                <h4 className="text-xl font-bold text-[#1C1C1C]">{story.title}</h4>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">{story.content}</p>
              {story.author && (
                <p className="text-sm text-gray-600 italic">- {story.author}</p>
              )}
              {story.news_url && (
                <a
                  href={story.news_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-4 text-[#5FB61A] hover:text-[#4fa015] font-semibold transition-colors"
                >
                  Read more stories
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 p-6 flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#1C1C1C]">Suggest a Charity</h3>
            <p className="text-sm text-gray-500 mt-1">
              Help us support more amazing causes
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-[#5FB61A] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-[#1C1C1C] mb-2">Thank You!</h4>
              <p className="text-gray-600">Your suggestion has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5FB61A] focus:outline-none transition-colors"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="charityName" className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                  Charity Name
                </label>
                <input
                  type="text"
                  id="charityName"
                  value={charityName}
                  onChange={(e) => setCharityName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5FB61A] focus:outline-none transition-colors"
                  placeholder="Name of the charity"
                  required
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-semibold text-[#1C1C1C] mb-2">
                  Why should we collaborate with them?
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#5FB61A] focus:outline-none transition-colors resize-none"
                  placeholder="Tell us about the charity's impact..."
                  rows={4}
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#FF6A00] hover:bg-[#e55f00] text-white font-bold py-3 px-6 rounded-lg transition-all"
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
