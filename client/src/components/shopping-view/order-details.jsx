import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { format } from "date-fns";

function ShoppingOrderDetailsView({ orderDetails }) {
  const { user } = useSelector((state) => state.auth);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch {
      return dateString?.split("T")[0] || "";
    }
  };

  return (
    <DialogContent className="bg-white max-w-[95vw] sm:max-w-[650px] max-h-[70vh] overflow-y-auto p-4 rounded-lg">
      <div className="grid gap-6 p-6">
        {/* Order Summary Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-medium">{orderDetails?._id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{formatDate(orderDetails?.orderDate)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">${orderDetails?.totalAmount?.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">{orderDetails?.paymentMethod}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Payment Status</p>
              <Badge
                variant={
                  orderDetails?.paymentStatus === "paid" 
                    ? "success" 
                    : "default"
                }
                className="capitalize text-sm font-semibold px-3 py-1"
              >
                {orderDetails?.paymentStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Order Status</p>
              <Badge
                variant={
                  orderDetails?.orderStatus === "confirmed"
                    ? "success"
                    : orderDetails?.orderStatus === "rejected"
                    ? "destructive"
                    : "default"
                }
                className="capitalize text-sm font-semibold px-3 py-1"
              >
                {orderDetails?.orderStatus}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        {/* Order Items Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Order Items</h3>
          <div className="space-y-3">
            {orderDetails?.cartItems?.length > 0 ? (
              orderDetails.cartItems.map((item) => (
                <div 
                  key={item._id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                    <p className="font-medium">${Number(item.price || 0).toFixed(2)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items found</p>
            )}
          </div>
        </div>

        <Separator className="my-2" />

        {/* Shipping Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Shipping Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user?.userName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{orderDetails?.addressInfo?.phone}</p>
            </div>
            <div className="col-span-2 space-y-2">
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {orderDetails?.addressInfo?.address}, {orderDetails?.addressInfo?.city}, {orderDetails?.addressInfo?.pincode}
              </p>
            </div>
            {orderDetails?.addressInfo?.notes && (
              <div className="col-span-2 space-y-2">
                <p className="text-sm text-gray-500">Delivery Notes</p>
                <p className="font-medium">{orderDetails.addressInfo.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;