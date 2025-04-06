import { Outlet } from "react-router-dom";
import ShoppingHeader from "./header";
import WeatherDiscountBanner from "./weather-discount-banner";
import { useLocation } from "../../contexts/LocationContext";

function ShoppingLayout() {
  const { weatherData } = useLocation();
  
  // Only show the banner if there's an active weather discount
  const showWeatherBanner = weatherData?.discount?.percentage > 0;
  
  return (
    <div className="flex flex-col bg-white overflow-hidden">
      {/* common header */}
      <ShoppingHeader />
      <main className="flex flex-col w-full">
        {/* Weather discount banner */}
        {showWeatherBanner && (
          <div className="container mx-auto px-4 mt-4">
            <WeatherDiscountBanner />
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}

export default ShoppingLayout;
