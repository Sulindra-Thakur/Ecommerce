import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";
import { ShoppingCart } from "lucide-react";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  // Calculate the final price with weather discount if applicable
  const hasWeatherDiscount = product?.weatherDiscount && product?.weatherDiscount.percentage > 0;
  const finalPrice = hasWeatherDiscount ? product?.weatherDiscountedPrice : 
                     (product?.salePrice > 0 ? product?.salePrice : product?.price);

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden group transition-all duration-300 hover:shadow-xl">
      <div onClick={() => handleGetProductDetails(product?._id)} className="cursor-pointer">
        <div className="relative overflow-hidden">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[300px] object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 shadow-md">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 shadow-md">
              {`Only ${product?.totalStock} items left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 shadow-md">
              Sale
            </Badge>
          ) : null}
          
          {/* Weather discount badge */}
          {hasWeatherDiscount && (
            <Badge className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-700 shadow-md animate-pulse">
              {product.weatherDiscount.percentage}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <h2 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-blue-700 transition-colors">{product?.title}</h2>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[15px] text-muted-foreground bg-gray-100 px-2 py-1 rounded">
              {categoryOptionsMap[product?.category]}
            </span>
            <span className="text-[15px] text-muted-foreground bg-gray-100 px-2 py-1 rounded">
              {brandOptionsMap[product?.brand]}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span
              className={`${
                hasWeatherDiscount || product?.salePrice > 0 ? "line-through text-gray-500" : ""
              } text-lg font-semibold`}
            >
              ${product?.price}
            </span>
            {(hasWeatherDiscount || product?.salePrice > 0) && (
              <span className="text-xl font-bold text-blue-700">
                ${finalPrice}
              </span>
            )}
          </div>
          
          {/* Weather discount reason */}
          {hasWeatherDiscount && (
            <div className="text-sm text-blue-600 mt-1 font-medium bg-blue-50 p-2 rounded-md border border-blue-100">
              {product.weatherDiscount.reason}
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter className="bg-gray-50 border-t">
        {product?.totalStock === 0 ? (
          <Button className="w-full opacity-60 cursor-not-allowed">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="mt-2 w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-md font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          > 
            <ShoppingCart size={18} />
            Add to cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default ShoppingProductTile;
