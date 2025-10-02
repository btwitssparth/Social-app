import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [showComments, setShowComments] = useState({});

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPosts();
  }, [user, navigate]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/post/posts");
      setPosts(res.data.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
      setError("Failed to load posts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await api.post(`/post/like/${postId}`);
      // Update the post in state with new likes
      setPosts(posts.map(p => 
        p._id === postId ? res.data.data : p
      ));
    } catch (err) {
      console.error("Failed to like post:", err);
      alert("Failed to like post");
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      const res = await api.post(`/post/comment/${postId}`, { text });
      // Update the post with new comment
      setPosts(posts.map(p => 
        p._id === postId ? res.data.data : p
      ));
      // Clear comment input
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Failed to add comment");
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId]
    });
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <p style={styles.error}>{error}</p>
        <button onClick={fetchPosts}>Retry</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1>Social Feed</h1>
          <div style={styles.userInfo}>
            <span>Welcome, {user?.username}!</span>
            <button onClick={handleCreatePost} style={styles.createBtn}>
              Create Post
            </button>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {posts.length === 0 ? (
          <div style={styles.noPosts}>
            <p>No posts yet. Be the first to create one!</p>
            <button onClick={handleCreatePost}>Create Post</button>
          </div>
        ) : (
          <div style={styles.postsContainer}>
            {posts.map((post) => (
              <article key={post._id} style={styles.post}>
                <div style={styles.postHeader}>
                  <div style={styles.authorInfo}>
                    {post.user?.profilePic && (
                      <img
                        src={post.user.profilePic}
                        alt={post.user.username}
                        style={styles.avatar}
                      />
                    )}
                    <strong>{post.user?.username || "Unknown User"}</strong>
                  </div>
                  <span style={styles.timestamp}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    style={styles.postImage}
                  />
                )}

                {post.caption && (
                  <p style={styles.caption}>{post.caption}</p>
                )}

                <div style={styles.postActions}>
                  <button
                    onClick={() => handleLike(post._id)}
                    style={{
                      ...styles.actionBtn,
                      ...(post.likes?.includes(user?._id) ? styles.liked : {})
                    }}
                  >
                    ❤️ {post.likes?.length || 0} {post.likes?.length === 1 ? 'Like' : 'Likes'}
                  </button>
                  <button
                    onClick={() => toggleComments(post._id)}
                    style={styles.actionBtn}
                  >
                    💬 {post.comments?.length || 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div style={styles.commentsSection}>
                    <div style={styles.commentsList}>
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment._id} style={styles.comment}>
                            <div style={styles.commentHeader}>
                              {comment.user?.profilePic && (
                                <img
                                  src={comment.user.profilePic}
                                  alt={comment.user.username}
                                  style={styles.commentAvatar}
                                />
                              )}
                              <strong>{comment.user?.username || "Unknown"}</strong>
                            </div>
                            <p style={styles.commentText}>{comment.text}</p>
                            <span style={styles.commentTime}>
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p style={styles.noComments}>No comments yet</p>
                      )}
                    </div>

                    <div style={styles.addComment}>
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post._id]: e.target.value
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleComment(post._id);
                          }
                        }}
                        style={styles.commentInput}
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        style={styles.commentBtn}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  header: {
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    padding: "1rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    maxWidth: "600px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userInfo: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  createBtn: {
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "#e4e6eb",
    color: "#050505",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  main: {
    maxWidth: "600px",
    margin: "2rem auto",
    padding: "0 1rem",
  },
  noPosts: {
    backgroundColor: "#fff",
    padding: "3rem",
    borderRadius: "8px",
    textAlign: "center",
  },
  postsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  post: {
    backgroundColor: "#fff",
    borderRadius: "8px",
    padding: "1rem",
    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  authorInfo: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  timestamp: {
    fontSize: "0.875rem",
    color: "#65676b",
  },
  postImage: {
    width: "100%",
    maxHeight: "500px",
    objectFit: "cover",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  },
  caption: {
    margin: "0.5rem 0",
    lineHeight: "1.5",
  },
  postActions: {
    display: "flex",
    gap: "0.5rem",
    borderTop: "1px solid #e4e6eb",
    paddingTop: "0.5rem",
    marginTop: "0.5rem",
  },
  actionBtn: {
    flex: 1,
    padding: "0.5rem",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "0.9rem",
  },
  liked: {
    color: "#e41e3f",
    fontWeight: "bold",
  },
  commentsSection: {
    marginTop: "1rem",
    borderTop: "1px solid #e4e6eb",
    paddingTop: "1rem",
  },
  commentsList: {
    maxHeight: "300px",
    overflowY: "auto",
    marginBottom: "1rem",
  },
  comment: {
    padding: "0.5rem",
    backgroundColor: "#f0f2f5",
    borderRadius: "8px",
    marginBottom: "0.5rem",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  commentAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  commentText: {
    margin: "0.25rem 0",
    fontSize: "0.9rem",
  },
  commentTime: {
    fontSize: "0.75rem",
    color: "#65676b",
  },
  noComments: {
    textAlign: "center",
    color: "#65676b",
    fontStyle: "italic",
  },
  addComment: {
    display: "flex",
    gap: "0.5rem",
  },
  commentInput: {
    flex: 1,
    padding: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "20px",
    outline: "none",
  },
  commentBtn: {
    padding: "0.5rem 1rem",
    backgroundColor: "#1877f2",
    color: "white",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
  },
  error: {
    color: "#e41e3f",
    marginBottom: "1rem",
  },
};