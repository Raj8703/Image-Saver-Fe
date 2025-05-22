import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";

const Home = () => {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchImages = useCallback(async () => {
    try {
      const res = await axios.get("https://image-saver-be.onrender.com/api/upload", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImages(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch images.");
      if (err.response?.status === 403 || err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [token, navigate]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://image-saver-be.onrender.com/api/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchImages();
    } catch {
      setError("Failed to delete image.");
    }
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Download failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else {
      fetchImages();
    }
  }, [token, navigate, fetchImages]); // ✅ Now fetchImages is safely included

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📁 My Images</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-200 text-red-700 rounded">{error}</div>
      )}

      <ImageUpload
        token={token}
        onUploadSuccess={fetchImages}
        onError={setError}
      />

      {images.length === 0 ? (
        <p>No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => {
            const imageUrl = `https://image-saver-be.onrender.com/${img.path}`;
            const filename = img.path.split("/").pop();
            return (
              <div key={img._id} className="border p-2 rounded shadow">
                <img
                  src={imageUrl}
                  alt="Uploaded"
                  className="w-full h-40 object-cover mb-2 rounded"
                />
                <div className="flex justify-between">
                  <button
                    onClick={() => handleDownload(imageUrl, filename)}
                    className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(img._id)}
                    className="bg-red-400 text-white px-2 py-1 rounded hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
