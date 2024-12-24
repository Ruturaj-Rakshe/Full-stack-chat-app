import {create} from 'zustand'; //this
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const BASE_URL = import.meta.env.NODE === 'development' ? 'http://localhost:5001' : '/';
export const useAuthStore = create((set, get) => ({
    authUser:null,
    isSigningUp:false,
    isLoggingIn:false,
    isUpdatingProfile:false,
    isCheckingAuth:true,
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try {
            const res = await axiosInstance.get('/auth/check', {withCredentials:true});
            set({authUser: res.data})
            get().connectSocket()

        } catch (error) {
            console.log("Error in checkAuth", error)
            set({authUser:null})
            toast.error("Failed to authenticate. Please log in.");
        }
        finally{
            set({isCheckingAuth:false})
        }

    },

    signup: async (data) => {
        set({isSigningUp:true})
        try {
            const res = await axiosInstance.post('/auth/signup', data);
            set({authUser: res.data})
            toast.success("Account created successfully")
            get().connectSocket()

        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isSigningUp:false})
        }

    },

    logout: async () => {
        try {
            await axiosInstance.post('/auth/logout')
            set({authUser:null})
            toast.success("Logged out successfully")
            get().disconnectSocket()
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    login: async (data) => {
        set({isLoggingIn:true})
        try {
            const res = await axiosInstance.post('/auth/login', data)
            set({authUser: res.data})
            toast.success("Logged in successfully")

            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message)
        }
        finally{
            set({isLoggingIn:false})
        }
        
    },

    updateProfile: async (data) => {
        set({isUpdatingProfile:true})
        try {
            const res = await axiosInstance.put('/auth/update-profile', data)
            toast.success("Profile updated successfully")
            set({authUser: res.data})
        } catch (error) {
            console.log("Error in updateProfile", error)
            toast.error(error.response.data.message)
        }
        finally{
            set({isUpdatingProfile:false})
        }
        
    },

    connectSocket: async () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return;

        const socket = io(BASE_URL,{ query:{
            userId: authUser._id,
        }});
        socket.connect();
        set({socket: socket})

        socket.on("getOnlineUsers", (userIds) => {
            set({onlineUsers: userIds})
        })
    },

    disconnectSocket: async () => {
        if(get().socket?.connected){
            get().socket.disconnect();

    }

}
}));