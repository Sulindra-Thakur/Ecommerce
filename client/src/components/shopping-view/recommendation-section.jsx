import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPersonalizedRecommendations } from "@/store/shop/recommendation-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ShoppingProductTile from "./product-tile";
import { Brain, ChevronRight, Sparkles, Telescope } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../ui/skeleton";
import { useLocation } from "../../contexts/LocationContext";

function RecommendationSection({ userId, limit = 4, showHeading = true }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { location: userLocation } = useLocation();
  
  const { 
    personalizedRecommendations, 
    loading, 
    recommendationType,
    userPreferences 
  } = useSelector((state) => state.shopRecommendation);
  
  const { user } = useSelector((state) => state.auth);

  // Fetch recommendations when component mounts
  useEffect(() => {
    if (userId && userId !== 'undefined' && userId !== 'null') {
      dispatch(getPersonalizedRecommendations({ 
        userId, 
        limit,
        locationData: userLocation 
      }));
    } else {
      // If no valid userId, still try to get trending recommendations
      dispatch(getPersonalizedRecommendations({ 
        userId: 'trending',
        limit,
        locationData: userLocation 
      }));
    }
  }, [dispatch, userId, limit, userLocation]);

  // Handle product details
  const handleGetProductDetails = (productId) => {
    dispatch(fetchProductDetails({ 
      id: productId,
      locationData: userLocation
    }));
  };

  // Handle add to cart
  const handleAddToCart = (productId) => {
    dispatch(
      addToCart({
        userId: user?.id,
        productId,
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
  };

  // View all recommendations
  const viewAllRecommendations = () => {
    navigate("/shop/listing");
  };

  // Get heading text based on recommendation type
  const getHeadingText = () => {
    if (recommendationType === "trending") {
      return "Trending Products";
    } else if (recommendationType === "personalized") {
      return "Recommended For You";
    }
    return "AI Recommendations";
  };

  // Get recommendation explanation based on type
  const getRecommendationExplanation = () => {
    if (recommendationType === "trending") {
      return "Popular products that shoppers like you are viewing right now";
    } else if (recommendationType === "personalized") {
      if (userPreferences?.categories?.includes("footwear")) {
        return "Products similar to your recently viewed and purchased footwear";
      }
      return "Products tailored to your browsing patterns and purchase history";
    }
    return "Smart product suggestions powered by our recommendation engine";
  };

  // Get icon based on recommendation type
  const HeadingIcon = recommendationType === "trending" ? Telescope : Brain;

  // Show preference tags if personalized
  const showPreferences = () => {
    if (!userPreferences || !recommendationType || recommendationType !== "personalized") {
      return null;
    }

    const allPreferences = [
      ...(userPreferences.categories || []), 
      ...(userPreferences.seasons || [])
    ];

    if (allPreferences.length === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3 mb-4">
        <span className="text-sm text-gray-600 font-medium">Based on your interest in:</span>
        {allPreferences.map((pref) => (
          <span 
            key={pref} 
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full font-medium shadow-sm"
          >
            {pref.charAt(0).toUpperCase() + pref.slice(1)}
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
        {Array(limit).fill(0).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!personalizedRecommendations || personalizedRecommendations.length === 0) {
    return (
      <div className="text-center py-10">
        <Brain className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-xl font-medium mb-2">Gathering your preferences</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Browse more products or make purchases to help our AI understand your preferences better.
        </p>
        <p className="text-sm text-blue-600 mt-3">
          Try viewing multiple products in the same category for better recommendations!
        </p>
      </div>
    );
  }

  return (
    <section className="py-4">
      {showHeading && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <HeadingIcon className="mr-2 h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">{getHeadingText()}</h2>
            <Sparkles className="ml-2 h-5 w-5 text-amber-500" />
          </div>
          <p className="text-gray-600">{getRecommendationExplanation()}</p>
          {showPreferences()}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {personalizedRecommendations.map((product) => (
          <ShoppingProductTile
            key={product._id}
            product={product}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddToCart}
          />
        ))}
      </div>

      {personalizedRecommendations.length >= limit && (
        <div className="flex justify-center mt-8">
          <Button 
            onClick={viewAllRecommendations}
            className="flex items-center bg-blue-50 text-blue-700 hover:bg-blue-100"
            variant="outline"
          >
            View more recommendations
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

export default RecommendationSection; 