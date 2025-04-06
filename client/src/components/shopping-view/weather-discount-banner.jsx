import { useLocation } from '../../contexts/LocationContext';
import { useEffect, useState } from 'react';
import { CloudSun, Thermometer, X } from 'lucide-react';

const WeatherDiscountBanner = () => {
  const { weatherData, loading, error, getLocation } = useLocation();
  const [show, setShow] = useState(true);
  
  // Hide banner after a certain time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 15000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!show || loading || error || !weatherData || !weatherData.discount || weatherData.discount.percentage === 0) {
    return null;
  }
  
  const { weather, discount } = weatherData;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 px-5 shadow-lg flex items-center justify-between rounded-lg mb-4 animate-appear transition-all">
      <div className="flex items-center space-x-4">
        <div className="bg-white/20 p-3 rounded-full hidden sm:block">
          <CloudSun className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wider">Current Weather</span>
          <span className="text-lg font-bold flex items-center">
            <Thermometer className="w-4 h-4 mr-1" />
            {weather.temperature}°C in {weather.location}
            <span className="ml-2 text-xs bg-white/30 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
              {weather.conditions}
            </span>
          </span>
        </div>
      </div>
      
      <div className="flex flex-col items-end">
        <span className="text-sm font-medium">Weather Discount</span>
        <span className="text-2xl font-extrabold">{discount.percentage}% OFF</span>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full mt-1">{discount.reason}</span>
      </div>
      
      <button 
        onClick={() => setShow(false)}
        className="ml-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default WeatherDiscountBanner; 