import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Register(){
    const {fetchUser}= useAuth();
    const [form,setForm]= useState({username:"",enail:"",password:"",profilePic:null});

    const handleSubmit = async(e)=>{
        e.preventDefault();
        await api.post("/register",form);
        await fetchUser();
    };

    return(
          <form onSubmit={handleSubmit}>
      <input placeholder="Username" value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input placeholder="Email" type="email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Register</button>
    </form>
    )
}