import ProductImageUpload from "@/components/admin-view/image-upload";
import AdminProductTile from "@/components/admin-view/product-tile";
import CommonForm from "@/components/common/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { addProductFormElements } from "@/config";
import {
  addNewProduct,
  deleteProduct,
  editProduct,
  fetchAllProducts,
} from "@/store/admin/products-slice";
import { Fragment, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const initialFormData = {
  image: null,
  title: "",
  description: "",
  category: "",
  brand: "",
  price: "",
  salePrice: "",
  totalStock: "",
  averageReview: 0,
  seasonal: "all",
  tags: "",
  weatherDiscountEligible: true,
};

function AdminProducts() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { productList, isLoading } = useSelector((state) => state.adminProducts);
  const dispatch = useDispatch();
  const { toast } = useToast();

  function onSubmit(event) {
    event.preventDefault();
    
    if (imageLoadingState) {
      toast({
        title: "Please wait for image to upload",
        variant: "destructive",
      });
      return;
    }
    
    if (!uploadedImageUrl && !currentEditedId) {
      toast({
        title: "Please upload an image",
        variant: "destructive",
      });
      return;
    }
    
    // Format data before submission
    const processedFormData = {
      ...formData,
      price: Number(formData.price),
      salePrice: Number(formData.salePrice) || 0,
      totalStock: Number(formData.totalStock),
      // Parse tags from comma-separated string to array if needed
      tags: typeof formData.tags === 'string' ? 
        formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
        formData.tags
    };
    
    setIsSubmitting(true);

    if (currentEditedId !== null) {
      // Handle edit product
      dispatch(
        editProduct({
          id: currentEditedId,
          formData: {
            ...processedFormData,
            image: uploadedImageUrl || formData.image,
          },
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setFormData(initialFormData);
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setUploadedImageUrl("");
          toast({
            title: "Product updated successfully",
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to update product",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
      }).catch(err => {
        console.error(err);
        toast({
          title: "Error updating product",
          variant: "destructive",
        });
        setIsSubmitting(false);
      });
    } else {
      // Handle add new product
      dispatch(
        addNewProduct({
          ...processedFormData,
          image: uploadedImageUrl,
        })
      ).then((data) => {
        if (data?.payload?.success) {
          dispatch(fetchAllProducts());
          setOpenCreateProductsDialog(false);
          setImageFile(null);
          setFormData(initialFormData);
          setUploadedImageUrl("");
          toast({
            title: "Product added successfully",
          });
        } else {
          toast({
            title: data?.payload?.message || "Failed to add product",
            variant: "destructive",
          });
        }
        setIsSubmitting(false);
      }).catch(err => {
        console.error(err);
        toast({
          title: "Error adding product",
          variant: "destructive",
        });
        setIsSubmitting(false);
      });
    }
  }

  function handleDelete(getCurrentProductId) {
    dispatch(deleteProduct(getCurrentProductId)).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllProducts());
        toast({
          title: "Product deleted successfully",
        });
      } else {
        toast({
          title: "Failed to delete product",
          variant: "destructive",
        });
      }
    }).catch(err => {
      console.error(err);
      toast({
        title: "Error deleting product",
        variant: "destructive",
      });
    });
  }

  function isFormValid() {
    return formData.title && 
           formData.price && 
           formData.totalStock && 
           formData.category && 
           formData.brand && 
           formData.description && 
           (uploadedImageUrl || (currentEditedId !== null && formData.image));
  }

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  // Set image URL when editing a product
  useEffect(() => {
    if (currentEditedId !== null && formData.image) {
      setUploadedImageUrl(formData.image);
    }
  }, [currentEditedId, formData.image]);

  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button
          onClick={() => setOpenCreateProductsDialog(true)}
          className="bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add New Product
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading products...</p>
        </div>
      ) : productList && productList.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productList.map((productItem) => (
            <AdminProductTile
              key={productItem._id}
              setFormData={setFormData}
              setOpenCreateProductsDialog={setOpenCreateProductsDialog}
              setCurrentEditedId={setCurrentEditedId}
              product={productItem}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No products found. Add a new product to get started.</p>
        </div>
      )}
      
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={(open) => {
          if (!open) {
            setOpenCreateProductsDialog(false);
            setCurrentEditedId(null);
            setFormData(initialFormData);
            setImageFile(null);
            setUploadedImageUrl("");
          }
        }}
      >
        <SheetContent side="right" className="overflow-auto bg-white w-full max-w-md sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Product" : "Add New Product"}
            </SheetTitle>
          </SheetHeader>
          <ProductImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null && !imageFile}
          />
          <div className="py-6">
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Update Product" : "Add Product"}
              formControls={addProductFormElements}
              isBtnDisabled={!isFormValid() || imageLoadingState || isSubmitting}
              isSubmitting={isSubmitting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default AdminProducts;
