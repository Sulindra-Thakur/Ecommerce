import ProductImageUpload from "@/components/admin-view/image-upload";
import { Button } from "@/components/ui/button";
import { addFeatureImage, getFeatureImages } from "@/store/common-slice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

function AdminDashboard() {
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const dispatch = useDispatch();
  const { featureImageList, isLoading } = useSelector((state) => state.commonFeature);

  function handleUploadFeatureImage() {
    // Add validation to prevent empty uploads
    if (!uploadedImageUrl || uploadedImageUrl.trim() === "") {
      console.warn("Cannot upload empty image URL");
      return;
    }

    dispatch(addFeatureImage(uploadedImageUrl)).then((data) => {
      if (data?.payload?.success) {
        dispatch(getFeatureImages());
        setImageFile(null);
        setUploadedImageUrl("");
      } else {
        console.error("Error uploading feature image:", data?.error);
      }
    });
  }

  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log("Feature Image List:", featureImageList);
  }, [featureImageList]);

  // Filter out any empty or invalid images before displaying
  const validFeatureImages = featureImageList?.filter(
    item => item?.image && item.image.trim() !== ""
  );

  return (
    <div>
      <ProductImageUpload
        imageFile={imageFile}
        setImageFile={setImageFile}
        uploadedImageUrl={uploadedImageUrl}
        setUploadedImageUrl={setUploadedImageUrl}
        setImageLoadingState={setImageLoadingState}
        imageLoadingState={imageLoadingState}
        isCustomStyling={true}
      />
      
      <Button 
        onClick={handleUploadFeatureImage} 
        className="mt-2 w-full bg-black text-white py-2 rounded-md font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!uploadedImageUrl || imageLoadingState}
      >
        {imageLoadingState ? "Uploading..." : "Upload"}
      </Button>
      
      <div className="flex flex-col gap-4 mt-5">
        {isLoading ? (
          <p>Loading banners...</p>
        ) : validFeatureImages?.length > 0 ? (
          validFeatureImages.map((featureImgItem) => (
            <div key={featureImgItem._id} className="relative">
              <img
                src={featureImgItem.image}
                className="w-full h-[300px] object-cover rounded-t-lg"
                alt="Feature banner"
                onError={(e) => {
                  console.error("Image failed to load:", featureImgItem.image);
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/800x300?text=Image+Load+Error";
                }}
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500">No banners uploaded yet</p>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;