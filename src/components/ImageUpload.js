import React, { useState } from "react";
import axios from "axios";

const ImageUpload = ({ token, onUploadSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      onUploadSuccess();
      onError("");
    } catch (error) {
      onError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = ""; // Reset input
    }
  };

  return (
    <div className="mb-6">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        className="border p-2 rounded cursor-pointer"
      />
      {loading && <p className="text-gray-600 mt-2">Uploading...</p>}
    </div>
  );
};

export default ImageUpload;
