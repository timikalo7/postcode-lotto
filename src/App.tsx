import { useState } from 'react';
import DonationStep from './components/DonationStep';
import CharityMap from './components/CharityMap';

interface DonationData {
  amount: number;
  name: string;
  postcode: string;
}

function App() {
  const [donationData, setDonationData] = useState<DonationData | null>(null);

  const handleDonationComplete = (data: DonationData) => {
    setDonationData(data);
  };

  return (
    <div>
      {!donationData ? (
        <DonationStep onComplete={handleDonationComplete} />
      ) : (
        <CharityMap
          donationAmount={donationData.amount}
          userName={donationData.name}
          userPostcode={donationData.postcode}
        />
      )}
    </div>
  );
}

export default App;
