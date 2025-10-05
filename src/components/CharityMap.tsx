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
      mapRef.current = L.map(mapContainerRef.current, {
        attributionControl: false,
        zoomControl: false
      }).setView(userLocation, 12);

      // Custom styled tile layer with enhanced theming
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | People\'s Postcode Lottery',
        opacity: 0.7,
        className: 'themed-map-tiles'
      }).addTo(mapRef.current);

      // Add a subtle overlay to match the theme
      const overlayPane = mapRef.current.getPane('overlayPane');
      if (overlayPane) {
        overlayPane.style.filter = 'sepia(0.1) saturate(1.1) hue-rotate(-5deg) brightness(1.05)';
      }

      // Add custom zoom control with enhanced Postcode Lottery styling
      const customZoomControl = L.control.zoom({
        position: 'bottomright'
      });
      customZoomControl.addTo(mapRef.current);

      // Add custom attribution with enhanced branding
      const customAttribution = L.control.attribution({
        position: 'bottomleft',
        prefix: false
      });
      customAttribution.addAttribution(`
        <span style="
          background: linear-gradient(135deg, #5FB61A 0%, #4fa015 100%);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 10px;
          border: 1px solid #F4C400;
        ">People's Postcode Lottery</span> | © OpenStreetMap
      `);
      customAttribution.addTo(mapRef.current);

      // Enhanced user location icon with Google Maps style pin
      const userIcon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: 32px;
            height: 38px;
            cursor: pointer;
            animation: pulse 2s infinite;
          ">
            
            <!-- User pin body (teardrop shape) -->
            <div style="
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #F4C400 0%, #FF6A00 100%);
              border-radius: 50% 50% 50% 0;
              transform: translateX(-50%) rotate(-45deg);
              border: 4px solid white;
              box-shadow: 0 8px 24px rgba(244, 196, 0, 0.6), 0 4px 12px rgba(0,0,0,0.3);
            "></div>
            
            <!-- User pin center with user icon -->
            <div style="
              position: absolute;
              bottom: 10px;
              left: 50%;
              transform: translateX(-50%);
              width: 14px;
              height: 14px;
              background: white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              font-weight: bold;
              color: #F4C400;
            ">👤</div>
            
            <!-- Pulsing ring animation -->
            <div style="
              position: absolute;
              bottom: 6px;
              left: 50%;
              transform: translateX(-50%);
              width: 40px;
              height: 40px;
              border: 3px solid #F4C400;
              border-radius: 50%;
              opacity: 0.6;
              animation: userPulse 2s infinite;
              z-index: 0;
            "></div>
          </div>
        `,
        className: 'user-location-pin',
        iconSize: [32, 38],
        iconAnchor: [16, 38]
      });

      L.marker(userLocation, { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup(`
          <div style="
            padding: 16px; 
            text-align: center;
            background: linear-gradient(135deg, #F4C400 0%, #FF6A00 100%);
            color: white;
            border-radius: 8px;
            margin: -8px;
          ">
            <div style="font-weight: bold; font-size: 18px; margin-bottom: 6px;">📍 Your Location</div>
            <div style="font-weight: 600; font-size: 16px;">${userName}</div>
            <div style="opacity: 0.9; font-size: 13px; margin-top: 4px;">Postcode: ${userPostcode}</div>
            <div style="
              background: rgba(255,255,255,0.2);
              padding: 4px 8px;
              border-radius: 12px;
              margin-top: 8px;
              font-size: 11px;
              font-weight: bold;
            ">People's Postcode Lottery Player</div>
          </div>
        `, {
          className: 'custom-popup themed-popup'
        });
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
      const iconSize = isAffected ? 28 : 22;
      const shadowColor = isAffected ? '#F4C400' : '#9CA3AF';

      // Google Maps style pin markers with Postcode Lottery branding
      const icon = L.divIcon({
        html: `
          <div style="
            position: relative;
            width: ${iconSize}px;
            height: ${iconSize * 1.2}px;
            cursor: pointer;
          " 
          class="charity-pin-marker">
            
            <div class="charity-pin-container" style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              transition: all 0.3s ease;
              transform-origin: center bottom;
              ${isAffected ? 'animation: charityPulse 3s infinite;' : ''}
            ">
              
              <!-- Pin body (teardrop shape) -->
              <div style="
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: ${iconSize}px;
                height: ${iconSize}px;
                background: linear-gradient(135deg, ${iconColor} 0%, ${iconColor}dd 100%);
                border-radius: 50% 50% 50% 0;
                transform: translateX(-50%) rotate(-45deg);
                border: 3px solid ${isAffected ? '#F4C400' : 'white'};
                box-shadow: 0 6px 16px ${shadowColor}66, 0 3px 8px rgba(0,0,0,0.3);
              "></div>
              
              <!-- Pin center dot -->
              <div style="
                position: absolute;
                bottom: ${iconSize * 0.3}px;
                left: 50%;
                transform: translateX(-50%);
                width: ${iconSize * 0.4}px;
                height: ${iconSize * 0.4}px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
                z-index: 10;
              "></div>
              
              ${isAffected ? `
                <!-- Golden badge for supported charities -->
                <div style="
                  position: absolute;
                  top: -4px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background: linear-gradient(135deg, #F4C400 0%, #FF6A00 100%);
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 2px 6px rgba(244, 196, 0, 0.6);
                  z-index: 15;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    font-size: 8px;
                    font-weight: bold;
                    line-height: 1;
                  ">★</div>
                </div>
              ` : ''}
              
            </div>
          </div>
        `,
        className: 'charity-pin-marker',
        iconSize: [iconSize, iconSize * 1.2],
        iconAnchor: [iconSize / 2, iconSize * 1.2]
      });

      const marker = L.marker([Number(charity.latitude), Number(charity.longitude)], { icon })
        .addTo(mapRef.current!);

      // Add proper event listeners for hover effects
      marker.on('mouseover', function(this: L.Marker) {
        const iconElement = this.getElement();
        if (iconElement) {
          const pinContainer = iconElement.querySelector('.charity-pin-container') as HTMLElement;
          if (pinContainer) {
            pinContainer.style.transform = 'scale(1.2)';
            pinContainer.style.zIndex = '1000';
          }
        }
      });

      marker.on('mouseout', function(this: L.Marker) {
        const iconElement = this.getElement();
        if (iconElement) {
          const pinContainer = iconElement.querySelector('.charity-pin-container') as HTMLElement;
          if (pinContainer) {
            pinContainer.style.transform = 'scale(1)';
            pinContainer.style.zIndex = 'auto';
          }
        }
      });

      marker.on('click', () => {
        setSelectedCharity(charity);
      });

      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        Number(charity.latitude),
        Number(charity.longitude)
      );

      // Enhanced tooltip with stronger Postcode Lottery branding
      const tooltipContent = `
        <div style="
          text-align: center;
          background: linear-gradient(135deg, ${isAffected ? '#5FB61A' : '#6B7280'} 0%, ${isAffected ? '#4fa015' : '#4B5563'} 100%);
          color: white;
          padding: 12px;
          border-radius: 8px;
          border: 2px solid ${isAffected ? '#F4C400' : '#9CA3AF'};
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        ">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">
            ${charity.name}
          </div>
          <div style="color: ${isAffected ? '#F4C400' : '#E5E7EB'}; font-size: 12px; margin-bottom: 2px;">
            📍 ${distance.toFixed(1)}km away
          </div>
          ${isAffected ? `
            <div style="
              background: rgba(244, 196, 0, 0.2);
              color: #F4C400;
              font-size: 10px;
              font-weight: bold;
              padding: 2px 6px;
              border-radius: 10px;
              margin-top: 4px;
              border: 1px solid #F4C400;
            ">
              ★ DIRECTLY SUPPORTED
            </div>
          ` : `
            <div style="
              background: rgba(255,255,255,0.1);
              color: #E5E7EB;
              font-size: 10px;
              padding: 2px 6px;
              border-radius: 10px;
              margin-top: 4px;
            ">
              Local Charity
            </div>
          `}
          <div style="
            font-size: 9px;
            color: rgba(255,255,255,0.7);
            margin-top: 4px;
            font-style: italic;
          ">Click to learn more</div>
        </div>
      `;

      marker.bindTooltip(tooltipContent, { 
        direction: 'top',
        className: 'postcode-lottery-tooltip themed-tooltip',
        offset: [0, -15]
      });
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      <Header variant="transparent" />
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />

        <div className="absolute top-2 sm:top-4 left-0 right-0 z-10 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-white to-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-5 border-2 border-[#F4C400]">
              <div className="flex flex-col lg:flex-row items-start justify-between gap-3 lg:gap-4">
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-3">
                    <img 
                      src="/peoples-postcode-lottery-logo.png" 
                      alt="People's Postcode Lottery" 
                      className="h-6 sm:h-8 lg:h-10 w-auto"
                    />
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-[#5FB61A] to-[#4fa015] rounded-full flex items-center justify-center shadow-lg">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white fill-current" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1C1C1C] mb-1">
                      Thank you, {userName}!
                    </h2>
                    <p className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">
                      Your £{donationAmount} donation is making a real difference
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 sm:gap-2 bg-[#F4C400]/20 px-2 sm:px-3 py-1 rounded-full border border-[#F4C400]">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#5FB61A] rounded-full"></div>
                      <span className="text-xs text-[#1C1C1C] font-bold">Impact Tracker</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs mt-2 sm:mt-3">
                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-full border border-red-200">
                      <div className="w-3 h-3 bg-red-600 rounded-full border border-white shadow-sm"></div>
                      <span className="text-gray-800 font-semibold">Supported ({charitiesAffected})</span>
                    </div>
                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                      <div className="w-3 h-3 bg-gray-400 rounded-full border border-white shadow-sm"></div>
                      <span className="text-gray-800 font-semibold">Local</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#F4C400]/20 px-2 py-1 rounded-full border border-[#F4C400]">
                      <div className="w-3 h-3 bg-[#F4C400] rounded-full border border-white shadow-sm"></div>
                      <span className="text-gray-800 font-semibold">You</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowSuggestionForm(true)}
                  className="w-full lg:w-auto bg-gradient-to-r from-[#FF6A00] to-[#e55f00] hover:from-[#e55f00] hover:to-[#cc5400] text-white font-bold px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-lg transition-all transform hover:scale-105 flex items-center justify-center gap-1.5 shadow-lg border border-[#FF6A00]/20"
                >
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm">Suggest Charity</span>
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
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border-2 border-white/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-2">{charity.name}</h3>
              <p className="text-sm text-white/90 font-medium mb-2">{charity.address}</p>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-[#F4C400] rounded-full"></div>
                <span className="text-xs text-white font-bold">Supported by People's Postcode Lottery</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors bg-white/20 hover:bg-white/30 rounded-full p-3 border-2 border-white/30"
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
