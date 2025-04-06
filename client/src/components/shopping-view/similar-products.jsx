import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSimilarProducts } from "@/store/shop/recommendation-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import ShoppingProductTile from "./product-tile";
import { Layers } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { Skeleton } from "../ui/skeleton";
import { useLocation } from "../../contexts/LocationContext";

function SimilarProducts({ productId, limit = 4 }) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { location: userLocation } = useLocation();
  
  const { similarProducts, loading } = useSelector((state) => state.shopRecommendation);
  const { user } = useSelector((state) => state.auth);

  // Fetch similar products when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      dispatch(getSimilarProducts({ productId, limit }));
    }
  }, [dispatch, productId, limit]);

  // Handle product details
  const handleGetProductDetails = (currentProductId) => {
    dispatch(fetchProductDetails({ 
      id: currentProductId,
      locationData: userLocation
    }));
  };

  // Handle add to cart
  const handleAddToCart = (currentProductId) => {
    dispatch(
      addToCart({
        userId: user?.id,
        productId: currentProductId,
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

  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center mb-4">
          <Layers className="mr-2 h-5 w-5 text-gray-600" />
          <h3 className="text-xl font-bold">Similar Products</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(limit).fill(0).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!similarProducts || similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 border-t pt-8">
      <div className="flex items-center mb-4">
        <Layers className="mr-2 h-5 w-5 text-gray-600" />
        <h3 className="text-xl font-bold">Similar Products</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {similarProducts.map((product) => (
          <ShoppingProductTile
            key={product._id}
            product={product}
            handleGetProductDetails={handleGetProductDetails}
            handleAddtoCart={handleAddToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default SimilarProducts; 