import { Button } from "@/components/ui/button";
import bannerOne from "../../assets/banner-1.webp";
import bannerTwo from "../../assets/banner-2.webp";
import bannerThree from "../../assets/banner-3.webp";
import {
  Airplay,
  BabyIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudLightning,
  Heater,
  Images,
  Shirt,
  ShirtIcon,
  ShoppingBasket,
  UmbrellaIcon,
  WashingMachine,
  WatchIcon,
  TrendingUp,
  Sparkles,
  Sun,
  Cloud,
  Snowflake,
  Brain
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllFilteredProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate, Link } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { useLocation } from "../../contexts/LocationContext";
import RecommendationSection from "@/components/shopping-view/recommendation-section";
import { trackProductView } from "@/store/shop/recommendation-slice";

const categoriesWithIcon = [
  { id: "men", label: "Men", icon: ShirtIcon },
  { id: "women", label: "Women", icon: CloudLightning },
  { id: "kids", label: "Kids", icon: BabyIcon },
  { id: "accessories", label: "Accessories", icon: WatchIcon },
  { id: "footwear", label: "Footwear", icon: UmbrellaIcon }
];

const brandsWithIcon = [
  { id: "nike", label: "Nike", icon: Shirt },
  { id: "adidas", label: "Adidas", icon: WashingMachine },
  { id: "puma", label: "Puma", icon: ShoppingBasket },
  { id: "levi", label: "Levi's", icon: Airplay },
  { id: "zara", label: "Zara", icon: Images },
  { id: "h&m", label: "H&M", icon: Heater },
];

// Fallback banners in case no feature images are available
const fallbackBanners = [
  {
    image: bannerOne,
    title: "Summer Collection",
    description: "Discover our latest summer styles with weather-based discounts",
  },
  {
    image: bannerTwo,
    title: "Rainy Season Essentials",
    description: "Stay dry and stylish with our weather-adaptive collection",
  },
  {
    image: bannerThree,
    title: "Seasonal Offers",
    description: "Weather-based discounts that adapt to your local forecast",
  },
];

// Add a weather category section at the top
const weatherCategories = [
  { id: "summer", label: "Summer", icon: Sun, color: "amber" },
  { id: "rainy", label: "Rainy", icon: Cloud, color: "emerald" },
  { id: "winter", label: "Winter", icon: Snowflake, color: "blue" },
];

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplayTimeoutRef = useRef(null);
  
  const { productList, productDetails, weatherData } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { location: userLocation } = useLocation();

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get the banners from feature images or use fallbacks
  const banners = featureImageList && featureImageList.length > 0 
    ? featureImageList.map((slide, index) => ({
        image: slide?.image,
        title: slide?.title || `Featured Collection ${index + 1}`,
        description: slide?.description || "Discover exclusive products with weather-based pricing",
      }))
    : fallbackBanners;

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem.id],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate(`/shop/listing`);
  }

  function handleGetProductDetails(getCurrentProductId) {
    // Track product view for recommendation engine
    if (user?.id) {
      dispatch(trackProductView({
        userId: user.id,
        productId: getCurrentProductId
      }));
    }
    
    dispatch(fetchProductDetails({ 
      id: getCurrentProductId,
      locationData: userLocation
    }));
  }

  function handleAddtoCart(getCurrentProductId) {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        toast({
          title: "Product is added to cart",
        });
      }
    });
  }

  function goToSlide(index) {
    resetAutoplayTimer();
    setCurrentSlide(index);
  }

  function goToPreviousSlide() {
    resetAutoplayTimer();
    setCurrentSlide((prevSlide) => 
      (prevSlide - 1 + banners.length) % banners.length
    );
  }

  function goToNextSlide() {
    resetAutoplayTimer();
    setCurrentSlide((prevSlide) => 
      (prevSlide + 1) % banners.length
    );
  }

  function resetAutoplayTimer() {
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    
    if (isAutoplay) {
      autoplayTimeoutRef.current = setTimeout(() => {
        setCurrentSlide((prevSlide) => (prevSlide + 1) % banners.length);
      }, 5000);
    }
  }

  useEffect(() => {
    resetAutoplayTimer();
    return () => {
      if (autoplayTimeoutRef.current) {
        clearTimeout(autoplayTimeoutRef.current);
      }
    };
  }, [currentSlide, isAutoplay, banners.length]);

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    dispatch(
      fetchAllFilteredProducts({
        filterParams: {},
        sortParams: "price-lowtohigh",
        locationData: userLocation
      })
    );
  }, [dispatch, userLocation]);

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  // Get featured products - those with weather discounts or on sale
  const featuredProducts = productList?.filter(product => 
    (product.weatherDiscount && product.weatherDiscount.percentage > 0) || 
    product.salePrice > 0
  ).slice(0, 4);

  // Sort products by season based on their tags or other attributes
  const summerProducts = productList?.filter(product => 
    product.tags?.includes('summer') || 
    product.category?.includes('summer') ||
    product.description?.toLowerCase().includes('summer')
  ).slice(0, 4);
  
  const rainyProducts = productList?.filter(product => 
    product.tags?.includes('rainy') || 
    product.tags?.includes('monsoon') || 
    product.category?.includes('rainy') ||
    product.description?.toLowerCase().includes('rain') ||
    product.description?.toLowerCase().includes('monsoon')
  ).slice(0, 4);
  
  const winterProducts = productList?.filter(product => 
    product.tags?.includes('winter') || 
    product.category?.includes('winter') ||
    product.description?.toLowerCase().includes('winter')
  ).slice(0, 4);

  // Determine current season based on weather data
  const getCurrentSeason = () => {
    if (!weatherData || !weatherData.main) return null;
    
    const temp = weatherData.main.temp;
    if (temp >= 25) return 'summer';
    if (temp <= 15) return 'winter';
    return 'rainy'; // For temperatures between 15-25
  };

  const currentSeason = getCurrentSeason();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Enhanced sliding banner section */}
      <div className="relative w-full h-[600px] overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
        
        {/* Banner slides */}
        <div className="h-full relative">
          {banners.map((banner, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center z-20 text-white p-6">
                <div className="max-w-3xl text-center animate-appear">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                    {banner.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto drop-shadow-md">
                    {banner.description}
                  </p>
                  <Link to="/shop/listing" style={{ display: 'inline-block' }}>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
                      onClick={() => navigate('/shop/listing')}
                      onKeyDown={(e) => e.key === 'Enter' && navigate('/shop/listing')}
                      aria-label="Shop Now - View All Products"
                    >
                      Shop Now
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation arrows */}
        <Button
          variant="outline"
          size="icon"
          onClick={goToPreviousSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 z-30 rounded-full h-12 w-12 shadow-md"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={goToNextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/70 hover:bg-white/90 z-30 rounded-full h-12 w-12 shadow-md"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </Button>
        
        {/* Slide indicators */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-10"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Autoplay toggle */}
        <button
          onClick={() => setIsAutoplay(!isAutoplay)}
          className={`absolute bottom-6 right-6 z-30 rounded-full p-2 ${
            isAutoplay ? "bg-blue-600" : "bg-gray-600"
          }`}
          aria-label={isAutoplay ? "Pause autoplay" : "Start autoplay"}
        >
          {isAutoplay ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Weather Categories Section */}
      <section className="py-10 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <TrendingUp className="text-blue-600 mr-3 h-6 w-6" />
            <h2 className="text-2xl font-bold text-center">Shop by Season</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {weatherCategories.map((category) => {
              const isCurrentSeason = currentSeason === category.id;
              return (
                <Button
                  key={category.id}
                  onClick={() => {
                    sessionStorage.removeItem("filters");
                    const currentFilter = {
                      "tags": [category.id]
                    };
                    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
                    navigate(`/shop/listing`);
                  }}
                  className={`px-6 py-3 flex items-center gap-2 ${
                    isCurrentSeason 
                      ? `bg-${category.color}-500 text-white hover:bg-${category.color}-600 ring-2 ring-${category.color}-400` 
                      : 'bg-white hover:bg-gray-100'
                  } rounded-full shadow-sm transition-all`}
                >
                  <category.icon className={`h-5 w-5 ${isCurrentSeason ? 'text-white' : `text-${category.color}-500`}`} />
                  <span>{category.label}</span>
                  {isCurrentSeason && (
                    <span className="ml-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">Current</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Weather-based featured products section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center mb-8">
              <Sparkles className="text-blue-600 mr-3 h-7 w-7" />
              <h2 className="text-3xl font-bold text-center">Weather-Based Deals</h2>
            </div>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
              Special discounts based on your local weather conditions. These prices change with the forecast!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* AI-Powered Recommendations Section - Display prominently before other content */}
      <div className="mb-12 mt-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
          <RecommendationSection 
            userId={user?.id} 
            limit={4} 
            showHeading={true} 
          />
        </div>
      </div>

      {/* Current Season Spotlight Section */}
      {currentSeason && (
        <section className={`py-16 ${
          currentSeason === 'summer' ? 'bg-amber-50' : 
          currentSeason === 'winter' ? 'bg-blue-50' : 
          'bg-emerald-50'
        }`}>
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full mb-4 bg-white shadow-md">
                {currentSeason === 'summer' ? (
                  <Sun className="h-8 w-8 text-amber-500" />
                ) : currentSeason === 'winter' ? (
                  <Snowflake className="h-8 w-8 text-blue-500" />
                ) : (
                  <Cloud className="h-8 w-8 text-emerald-500" />
                )}
              </div>
              <h2 className="text-4xl font-bold mb-3">{
                currentSeason === 'summer' ? 'Summer Season Spotlight' : 
                currentSeason === 'winter' ? 'Winter Season Spotlight' : 
                'Rainy Season Spotlight'
              }</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {currentSeason === 'summer' 
                  ? 'Beat the heat with our summer collection. Special discounts based on your local temperature!' 
                  : currentSeason === 'winter' 
                  ? 'Stay warm and stylish with our winter essentials. Weather-based discounts for the cold season!' 
                  : 'Stay dry and comfortable with our rainy season collection. Special discounts for the wet weather!'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(currentSeason === 'summer' ? summerProducts : 
                currentSeason === 'winter' ? winterProducts : 
                rainyProducts)?.map((product) => (
                <ShoppingProductTile
                  key={product._id}
                  product={product}
                  handleGetProductDetails={handleGetProductDetails}
                  handleAddtoCart={handleAddtoCart}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <TrendingUp className="text-blue-600 mr-3 h-7 w-7" />
            <h2 className="text-3xl font-bold text-center">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoriesWithIcon.map((categoryItem, index) => (
              <Card
                key={categoryItem.id}
                onClick={() =>
                  handleNavigateToListingPage(categoryItem, "category")
                }
                className="cursor-pointer hover:shadow-xl transition-all duration-300 border-0 overflow-hidden group"
              >
                <CardContent className="flex flex-col items-center justify-center p-8 relative">
                  <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="bg-blue-100 rounded-full p-5 mb-5 z-10 group-hover:bg-blue-200 transition-colors">
                    <categoryItem.icon className="w-10 h-10 text-blue-700" />
                  </div>
                  <span className="font-bold text-lg z-10 group-hover:text-blue-700 transition-colors">{categoryItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Brands section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <ShoppingBasket className="text-blue-600 mr-3 h-7 w-7" />
            <h2 className="text-3xl font-bold text-center">Popular Brands</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {brandsWithIcon.map((brandItem, index) => (
              <Card
                key={brandItem.id}
                onClick={() => handleNavigateToListingPage(brandItem, "brand")}
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 group"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="bg-gray-100 rounded-full p-4 mb-4 group-hover:bg-blue-100 transition-colors">
                    <brandItem.icon className="w-8 h-8 text-gray-700 group-hover:text-blue-700 transition-colors" />
                  </div>
                  <span className="font-medium group-hover:text-blue-700 transition-colors">{brandItem.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All products section (maybe rename to "New Arrivals" to distinguish from seasonal sections) */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-8">
            <Sparkles className="text-blue-600 mr-3 h-7 w-7" />
            <h2 className="text-3xl font-bold text-center">New Arrivals</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {productList?.slice(0, 8).map((product) => (
              <ShoppingProductTile
                key={product._id}
                product={product}
                handleGetProductDetails={handleGetProductDetails}
                handleAddtoCart={handleAddtoCart}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/shop/listing')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {openDetailsDialog && (
        <ProductDetailsDialog
          open={openDetailsDialog}
          setOpen={setOpenDetailsDialog}
          productDetails={productDetails}
        />
      )}
    </div>
  );
}

export default ShoppingHome;
