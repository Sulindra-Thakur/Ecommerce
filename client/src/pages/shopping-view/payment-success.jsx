import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearCart } from "@/store/shop/cart-slice";
import { useSelector } from "react-redux";

function PaymentSuccessPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Clear cart upon successful payment
  useEffect(() => {
    if (user?.id && typeof user.id === 'string' && user.id.length === 24) {
      dispatch(clearCart(user.id));
    } else {
      // If no valid user ID, just reset the cart state without API call
      dispatch({ type: 'shoppingCart/resetCart' });
    }
  }, [dispatch, user]);

  return (
    <Card className="max-w-md mx-auto my-12 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
        <CardTitle className="text-2xl text-green-700">Payment Successful!</CardTitle>
        <CardDescription>Your order has been placed successfully</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 pt-4">
        <p className="text-center text-gray-600">
          Thank you for your purchase. We'll send you an email confirmation shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700" 
            onClick={() => navigate("/shop/account")}
          >
            View Orders
          </Button>
          <Button 
            className="flex-1" 
            variant="outline"
            onClick={() => navigate("/shop/home")}
          >
            Continue Shopping
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentSuccessPage;
