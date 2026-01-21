import { useState } from "react";
import { isValidFileType, isValidFileSize, fileToDataURL } from "@/utils";

/**
 * Hook to manage image upload
 * @param {Object} options - Configuration options
 * @returns {Object} Image state and handlers
 */
export const useImageUpload = (options = {}) => {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png"],
    onUpload = null,
  } = options;

  const [image, setImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (file) => {
    setError(null);

    // Validate file type
    if (!isValidFileType(file, allowedTypes)) {
      setError("Invalid file type. Please upload JPG or PNG only.");
      return;
    }

    // Validate file size
    if (!isValidFileSize(file, maxSizeMB)) {
      setError(`File size must be less than ${maxSizeMB}MB.`);
      return;
    }

    setLoading(true);
    try {
      const dataURL = await fileToDataURL(file);
      setImage(dataURL);

      if (onUpload) {
        await onUpload(file, dataURL);
      }
    } catch (err) {
      setError("Failed to process image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetImage = () => {
    setImage(null);
    setError(null);
  };

  return {
    image,
    error,
    loading,
    handleImageUpload,
    resetImage,
  };
};
