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
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-[#5FB61A] to-[#4fa015] text-white px-4 py-2 rounded-full shadow-lg">
              <Heart className="w-5 h-5 fill-current" />
              <span className="font-bold text-lg">People's Postcode Lottery</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Changing lives</span>
            <span className="text-[#5FB61A] font-bold">every day</span>
          </div>
        </div>
      </div>
    </header>
  );
}
