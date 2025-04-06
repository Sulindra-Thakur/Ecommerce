import ProductDetailsDialog from "@/components/shopping-view/product-details";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { fetchProductDetails } from "@/store/shop/products-slice";
import {
  getSearchResults,
  resetSearchResults,
} from "@/store/shop/search-slice";
import { trackSearchQuery, trackProductView } from "@/store/shop/recommendation-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { useLocation } from "../../contexts/LocationContext";
import { Loader2 } from "lucide-react";

function SearchProducts() {
  const [keyword, setKeyword] = useState("");
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { searchResults, isLoading } = useSelector((state) => state.shopSearch);
  const { productDetails } = useSelector((state) => state.shopProducts);
  const { location: userLocation } = useLocation();

  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.shopCart);
  const { toast } = useToast();
  
  // Get keyword from URL on initial load
  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword");
    if (keywordFromUrl) {
      setKeyword(keywordFromUrl);
      dispatch(getSearchResults(keywordFromUrl));
    }
  }, []);
  
  useEffect(() => {
    if (keyword && keyword.trim() !== "" && keyword.trim().length > 2) {
      const timer = setTimeout(() => {
        setSearchParams(new URLSearchParams(`?keyword=${keyword}`));
        dispatch(getSearchResults(keyword));
        
        // Track search query for recommendation engine
        if (user?.id) {
          dispatch(trackSearchQuery({
            userId: user.id,
            query: keyword
          }));
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } else if (keyword.trim() === "") {
      setSearchParams(new URLSearchParams(``));
      dispatch(resetSearchResults());
    }
  }, [keyword, dispatch, user]);

  function handleAddtoCart(getCurrentProductId, getTotalStock) {
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      if (indexOfCurrentItem > -1) {
        const getQuantity = getCartItems[indexOfCurrentItem].quantity;
        if (getQuantity + 1 > getTotalStock) {
          toast({
            title: `Only ${getQuantity} quantity can be added for this item`,
            variant: "destructive",
          });

          return;
        }
      }
    }

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

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  return (
    <div className="container mx-auto md:px-6 px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="w-full flex items-center">
          <Input
            value={keyword}
            name="keyword"
            onChange={(event) => setKeyword(event.target.value)}
            className="py-6"
            placeholder="Search Products..."
          />
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}
      
      {!isLoading && searchResults.length === 0 && keyword.trim() !== "" && (
        <div className="text-center py-10">
          <h1 className="text-3xl font-bold mb-2">No results found</h1>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {searchResults.map((item) => (
          <ShoppingProductTile
            key={item._id}
            handleAddtoCart={handleAddtoCart}
            product={item}
            handleGetProductDetails={handleGetProductDetails}
          />
        ))}
      </div>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default SearchProducts;
