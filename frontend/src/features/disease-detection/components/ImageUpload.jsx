import { useImageUpload } from "@/hooks";
import Button from "@/components/ui/Button";

export const ImageUploadSection = ({ onAnalyze }) => {
  const { image, error, loading, handleImageUpload, resetImage } = useImageUpload();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 rounded-3xl p-8">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Upload Leaf Image
      </h2>

      <p className="mt-2 text-gray-600 dark:text-gray-300">
        Supported formats JPG, PNG. Use a clear image with visible leaf texture
      </p>

      <label className="mt-6 flex flex-col items-center justify-center border-2 border-dashed border-green-300 dark:border-green-700 rounded-2xl p-8 cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 transition">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
        />

        <span className="text-5xl">📸</span>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
          Click to upload or drag and drop
        </p>
      </label>

      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-200 text-sm">
          {error}
        </div>
      )}

      {image && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Preview</p>
          <img
            src={image}
            alt="Uploaded leaf"
            className="rounded-xl border border-green-100 dark:border-gray-700 max-h-96 w-full object-cover"
          />

          <div className="mt-4 flex gap-3">
            <Button onClick={onAnalyze} disabled={loading} className="flex-1">
              {loading ? "Analyzing..." : "Analyze Disease"}
            </Button>
            <Button variant="secondary" onClick={resetImage}>
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
