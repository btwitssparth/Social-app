import { createContext,useContext,useState,useEffect, Children } from "react";
import api from "../api/axios";


const AuthContext= createContext();

export const AuthProvider= ({Children})=>{
    const [user,setUser]= useState(null)

    const fetchUser= async()=>{
        try {
            const res= await api.get("/auth/profile");
            setUser(res.data.data);
        } catch (error) {
            setUser(null)
        };
        
    };
    useEffect(()=>{
        fetchUser();
    },[]);

    return(
        <AuthContext.Provider value={{user,setUser,fetchUser}}>
            {Children}
        </AuthContext.Provider>
    );
};

export const useAuth=()=> useContext(AuthContext);
