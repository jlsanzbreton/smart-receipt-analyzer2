import React, { useState, useRef } from "react";
import { CameraIcon, ArrowUpTrayIcon } from "@heroicons/react/24/solid";

interface FileUploadProps {
  onImageUpload: (imageDataBase64: string, fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Invalid file type. Please upload an image.");
        setPreview(null);
        setFileName(null);
        return;
      }
      setError(null);
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (preview && fileName) {
      // Remove the data URL prefix `data:image/...;base64,`
      const base64Data = preview.split(",")[1];
      if (base64Data) {
        onImageUpload(base64Data, fileName);
        setPreview(null); // Clear preview after successful upload
        setFileName(null);
      } else {
        setError("Could not process image data.");
      }
    } else {
      setError("Please select an image first.");
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const triggerCameraInput = () => cameraInputRef.current?.click();

  return (
    <div className="p-6 bg-slate-700 shadow-xl rounded-lg text-center space-y-6">
      <h2 className="text-2xl font-semibold text-white mb-4">Upload Receipt</h2>

      {error && (
        <p className="text-red-400 bg-red-900 p-3 rounded-md">{error}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={triggerCameraInput}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-teal-500 transition-transform transform hover:scale-105"
        >
          <CameraIcon className="h-6 w-6 mr-2" />
          Take Photo
        </button>
        <input
          type="file"
          accept="image/*"
          ref={cameraInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Take photo with camera"
          title="Take photo with camera"
        />
        <button
          onClick={triggerFileInput}
          className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-sky-500 transition-transform transform hover:scale-105"
        >
          <ArrowUpTrayIcon className="h-6 w-6 mr-2" />
          Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload image file"
          title="Upload image file"
        />
      </div>

      {preview && (
        <div className="mt-6 border-2 border-dashed border-slate-500 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-slate-300 mb-2">Preview:</h3>
          <img
            src={preview}
            alt="Receipt preview"
            className="max-w-full max-h-96 mx-auto rounded-md shadow-md"
          />
          {fileName && (
            <p className="text-slate-400 mt-2 text-sm">File: {fileName}</p>
          )}
        </div>
      )}

      {preview && (
        <button
          onClick={handleSubmit}
          className="w-full mt-6 px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-700 focus:ring-green-500 transition-transform transform hover:scale-105 disabled:opacity-50"
          disabled={!preview}
        >
          Process Receipt
        </button>
      )}
    </div>
  );
};
