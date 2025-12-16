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
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleComment = async (postId) => {
    const text = commentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await api.post(`/post/comment/${postId}`, { text });
      setPosts(posts.map((p) => (p._id === postId ? res.data.data : p)));
      setCommentText({ ...commentText, [postId]: "" });
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const toggleComments = (postId) => {
    setShowComments({
      ...showComments,
      [postId]: !showComments[postId],
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
<header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
  <div className="max-w-4xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-xl">🚀</span>
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          SocialApp
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
          <img
            src={user?.profilePic}
            alt={user?.username}
            className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
          />
          <span className="font-medium">{user?.username}</span>
        </div>
        
        {/* Messages Button */}
        <button
          onClick={() => navigate("/messages")}
          className="relative text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition"
          title="Messages"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        <button
          onClick={() => navigate("/create-post")}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-md hover:shadow-lg"
        >
          + Create
        </button>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchPosts} className="ml-4 underline">
              Retry
            </button>
          </div>
        )}

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No posts yet</h2>
            <p className="text-gray-600 mb-6">Be the first to share something!</p>
            <button
              onClick={() => navigate("/create-post")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-md"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article key={post._id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.user?.profilePic}
                      alt={post.user?.username}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.user?.username || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full max-h-[600px] object-cover"
                  />
                )}

                {/* Post Caption */}
                {post.caption && (
                  <div className="px-4 pt-3">
                    <p className="text-gray-800">{post.caption}</p>
                  </div>
                )}

                {/* Post Actions */}
                <div className="px-4 py-3 flex items-center space-x-4 border-t border-gray-100 mt-3">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      post.likes?.includes(user?._id)
                        ? "text-red-500 bg-red-50"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg className="w-5 h-5" fill={post.likes?.includes(user?._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="font-semibold text-sm">
                      {post.likes?.length || 0}
                    </span>
                  </button>

                  <button
                    onClick={() => toggleComments(post._id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="font-semibold text-sm">
                      {post.comments?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                      {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                          <div key={comment._id} className="flex space-x-3">
                            <img
                              src={comment.user?.profilePic}
                              alt={comment.user?.username}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <p className="font-semibold text-sm text-gray-900">
                                {comment.user?.username || "Unknown"}
                              </p>
                              <p className="text-sm text-gray-700 mt-1">
                                {comment.text}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4 text-sm">
                          No comments yet. Be the first to comment!
                        </p>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="mt-4 flex space-x-2">
                      <img
                        src={user?.profilePic}
                        alt={user?.username}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[post._id] || ""}
                        onChange={(e) =>
                          setCommentText({
                            ...commentText,
                            [post._id]: e.target.value,
                          })
                        }
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleComment(post._id);
                          }
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                      <button
                        onClick={() => handleComment(post._id)}
                        className="bg-blue-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition"
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