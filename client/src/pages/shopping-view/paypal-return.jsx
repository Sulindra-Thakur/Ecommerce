import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    if (paymentId && payerId) {
      const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));
      
      if (!orderId) {
        toast({
          title: "Order information not found",
          description: "There was an issue with your order. Please try again.",
          variant: "destructive"
        });
        setIsProcessing(false);
        setTimeout(() => navigate("/shop/home"), 3000);
        return;
      }

      dispatch(capturePayment({ paymentId, payerId, orderId }))
        .then((data) => {
          if (data?.payload?.success) {
            sessionStorage.removeItem("currentOrderId");
            navigate("/shop/payment-success");
          } else {
            toast({
              title: "Payment processing failed",
              description: "Please try again or contact support",
              variant: "destructive"
            });
            setIsProcessing(false);
            setTimeout(() => navigate("/shop/checkout"), 3000);
          }
        })
        .catch(error => {
          console.error("Payment capture error:", error);
          toast({
            title: "Payment error",
            description: "An unexpected error occurred",
            variant: "destructive"
          });
          setIsProcessing(false);
          setTimeout(() => navigate("/shop/checkout"), 3000);
        });
    } else {
      toast({
        title: "Missing payment information",
        description: "Required payment details were not found",
        variant: "destructive"
      });
      setIsProcessing(false);
      setTimeout(() => navigate("/shop/checkout"), 3000);
    }
  }, [paymentId, payerId, dispatch, navigate, toast]);

  return (
    <Card className="max-w-md mx-auto my-8">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">
          {isProcessing ? "Processing Payment..." : "Payment Status"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {isProcessing ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-center">
              Please wait while we confirm your payment with PayPal.
              <br />
              Do not close this window.
            </p>
          </>
        ) : (
          <p className="text-center text-red-500">
            There was an issue with your payment.
            <br />
            You will be redirected in a few seconds.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PaypalReturnPage;
