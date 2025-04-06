import { Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "../ui/use-toast";
import { Badge } from "../ui/badge";

function UserCartItemsContent({ cartItem }) {
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  // Check if product has weather discount
  const hasWeatherDiscount = cartItem?.weatherDiscount && cartItem?.weatherDiscount.percentage > 0;
  
  // Calculate final price with all discounts
  const finalPrice = hasWeatherDiscount ? cartItem?.weatherDiscountedPrice : 
                     (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price);
  
  // Calculate total price
  const totalPrice = (finalPrice * cartItem?.quantity).toFixed(2);

  function handleUpdateQuantity(getCartItem, typeOfAction) {
    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        console.log(getCurrentProductIndex, getTotalStock, "getTotalStock");

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });

            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  }

  function handleCartItemDelete(getCartItem) {
    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <img
          src={cartItem?.image}
          alt={cartItem?.title}
          className="w-20 h-20 rounded object-cover"
        />
        {hasWeatherDiscount && (
          <Badge className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-[10px]">
            {cartItem.weatherDiscount.percentage}% OFF
          </Badge>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            <Minus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">Decrease</span>
          </Button>
        </div>
        {hasWeatherDiscount && (
          <div className="text-xs text-blue-500 mt-1">
            {cartItem.weatherDiscount.reason}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end">
        {hasWeatherDiscount && (
          <p className="text-sm line-through text-gray-500">
            ${(cartItem?.price * cartItem?.quantity).toFixed(2)}
          </p>
        )}
        <p className="font-semibold">
          ${totalPrice}
        </p>
        <Trash
          onClick={() => handleCartItemDelete(cartItem)}
          className="cursor-pointer mt-1"
          size={20}
        />
      </div>
    </div>
  );
}

export default UserCartItemsContent;
