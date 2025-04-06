import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";

function AdminProductTile({
  product,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const handleEdit = () => {
    // Format the product data for the form
    const formattedData = {
      title: product?.title || "",
      description: product?.description || "",
      price: product?.price || 0,
      salePrice: product?.salePrice || 0,
      totalStock: product?.totalStock || 0,
      category: product?.category || "",
      brand: product?.brand || "",
      image: product?.image || null,
      seasonal: product?.seasonal || "all",
      tags: product?.tags?.join(", ") || "",
      weatherDiscountEligible: product?.weatherDiscountEligible !== false, // Default to true
      averageReview: product?.averageReview || 0
    };
    
    setFormData(formattedData);
    setCurrentEditedId(product?._id);
    setOpenCreateProductsDialog(true);
  };

  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden">
      <div>
        <div className="relative">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[200px] object-cover rounded-t-lg"
          />
          <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 text-xs rounded">
            Stock: {product?.totalStock}
          </div>
        </div>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold mb-2 truncate">{product?.title}</h2>
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              <span className={`${product?.salePrice > 0 ? "line-through text-muted-foreground" : "text-primary"} text-lg font-semibold`}>
                ${product?.price.toFixed(2)}
              </span>
              {product?.salePrice > 0 && (
                <span className="text-lg font-bold text-green-600">${product?.salePrice.toFixed(2)}</span>
              )}
            </div>
            <div className="text-sm bg-gray-100 px-2 py-1 rounded">
              {product?.seasonal || "All Seasons"}
            </div>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {product?.tags?.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 pt-0">
          <Button
            onClick={handleEdit}
            variant="outline"
            className="w-1/2 mr-2"
          >
            Edit
          </Button>
          <Button 
            onClick={() => handleDelete(product?._id)} 
            variant="destructive"
            className="w-1/2"
          >
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default AdminProductTile;
