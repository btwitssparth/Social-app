import { useEffect,useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Home(){
    const {user}= useAuth();
    const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get("/post").then((res) => setPosts(res.data.data));
  }, []);

  return (
    <div>
        
      <h2>Welcome {user?.username}</h2>
      {posts.map((p) => (
        <div key={p._id}>
          <h3>{p.caption}</h3>
          <p>By {p.user.username}</p>
          <button onClick={() => api.post(`/post/${p._id}/like`)}>Like</button>
        </div>
      ))}
    </div>
  );
}
