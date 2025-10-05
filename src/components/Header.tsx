import { Heart } from 'lucide-react';

interface HeaderProps {
  variant?: 'default' | 'transparent';
}

export default function Header({ variant = 'default' }: HeaderProps) {
  const bgClass = variant === 'transparent'
    ? 'bg-white/95 backdrop-blur-sm'
    : 'bg-white';

  return (
    <header className={`${bgClass} border-b border-gray-200 shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <img 
              src="/peoples-postcode-lottery-logo.png" 
              alt="People's Postcode Lottery" 
              className="h-8 sm:h-10 lg:h-12 w-auto"
            />
            <div className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-[#5FB61A] to-[#4fa015] text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full shadow-lg">
              <Heart className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 fill-current" />
              <span className="font-bold text-xs sm:text-sm lg:text-lg">Impact Tracker</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm">
            <span className="text-gray-600">Changing lives</span>
            <span className="text-[#5FB61A] font-bold">every day</span>
          </div>
        </div>
      </div>
    </header>
  );
}
