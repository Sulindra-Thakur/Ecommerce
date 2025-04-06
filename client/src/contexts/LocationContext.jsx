import { createContext, useState, useEffect, useContext } from 'react';
import { buildApiUrl } from '../lib/api';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          setError(null);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          setError('Unable to retrieve your location');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  const fetchWeatherDiscount = async () => {
    if (!location) return;
    
    try {
      const response = await fetch(buildApiUrl('/api/shop/discount/weather'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(location),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather discount');
      }
      
      const data = await response.json();
      if (data.success) {
        setWeatherData(data.data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherDiscount();
    }
  }, [location]);

  return (
    <LocationContext.Provider 
      value={{ 
        location, 
        weatherData, 
        error, 
        loading, 
        getLocation, 
        fetchWeatherDiscount 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);

export default LocationContext; 