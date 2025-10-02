import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    caption: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setForm({ ...form, image: file });
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.image) {
      setError("Please select an image");
      return;
    }

    if (!form.caption.trim()) {
      setError("Please add a caption");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("caption", form.caption);
      formData.append("Image", form.image);

      await api.post("/post/createPost", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/");
    } catch (err) {
      console.error("Failed to create post:", err);
      setError(
        err.response?.data?.message || "Failed to create post. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate("/")} style={styles.backBtn}>
            ← Back
          </button>
          <h2>Create New Post</h2>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}

          <div style={styles.formGroup}>
            <label style={styles.label}>Caption</label>
            <textarea
              placeholder="What's on your mind?"
              value={form.caption}
              onChange={(e) => setForm({ ...form, caption: e.target.value })}
              style={styles.textarea}
              rows="4"
              maxLength="500"
            />
            <small style={styles.charCount}>
              {form.caption.length}/500 characters
            </small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Image</label>
            <div style={styles.uploadArea}>
              {preview ? (
                <div style={styles.previewContainer}>
                  <img src={preview} alt="Preview" style={styles.preview} />
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, image: null });
                      setPreview(null);
                    }}
                    style={styles.removeBtn}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <label style={styles.uploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                  <div style={styles.uploadPlaceholder}>
                    <span style={styles.uploadIcon}>📷</span>
                    <p>Click to upload an image</p>
                    <small>JPG, PNG, GIF up to 5MB</small>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={styles.cancelBtn}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                ...(loading ? styles.submitBtnDisabled : {}),
              }}
              disabled={loading}
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "600px",
    padding: "2rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "2rem",
  },
  backBtn: {
    backgroundColor: "#e4e6eb",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#333",
  },
  textarea: {
    padding: "0.75rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    fontFamily: "inherit",
    resize: "vertical",
    outline: "none",
  },
  charCount: {
    fontSize: "0.8rem",
    color: "#65676b",
    textAlign: "right",
  },
  uploadArea: {
    border: "2px dashed #ddd",
    borderRadius: "8px",
    minHeight: "200px",
  },
  uploadLabel: {
    display: "block",
    cursor: "pointer",
    padding: "2rem",
    textAlign: "center",
  },
  fileInput: {
    display: "none",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    color: "#65676b",
  },
  uploadIcon: {
    fontSize: "3rem",
  },
  previewContainer: {
    position: "relative",
    padding: "1rem",
  },
  preview: {
    width: "100%",
    maxHeight: "400px",
    objectFit: "contain",
    borderRadius: "8px",
  },
  removeBtn: {
    position: "absolute",
    top: "1.5rem",
    right: "1.5rem",
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  actions: {
    display: "flex",
    gap: "1rem",
    justifyContent: "flex-end",
    marginTop: "1rem",
  },
  cancelBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#e4e6eb",
    color: "#050505",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  submitBtn: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
  },
  submitBtnDisabled: {
    backgroundColor: "#a0c4ff",
    cursor: "not-allowed",
  },
  error: {
    backgroundColor: "#fee",
    color: "#c00",
    padding: "0.75rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
  },
};