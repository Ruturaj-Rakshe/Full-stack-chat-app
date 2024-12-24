import {create} from 'zustand'
import { axiosInstance } from '../lib/axios.js';
import { toast } from 'react-hot-toast';
import { useAuthStore } from './useAuthStore.js';

export const useChatStore = create((set, get) => ({

    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,


    getUsers: async () => {
        set({isUsersLoading: true})
        try {
            const res = await axiosInstance.get('/messages/users')
            set({users: res.data})
        } catch (error) {
            toast.error("Failed to fetch users")
            console.log("Error in getUsers", error)
        }
        finally{
            set({isUsersLoading: false})
        }

    },

    getMessages: async (userId) => {
        set({isMessagesLoading: true})
        try {
            const res = await axiosInstance.get(`/messages/${userId}`)
            set({messages: res.data})
        } catch (error) {
            toast.error("Failed to fetch messages")
            console.log("Error in getMessages", error)
        }
        finally{
            set({isMessagesLoading: false})
        }
    },

    listenToMessages: () => {
        const {selectedUser} = get()
        if(!selectedUser) return; //no selected chat

        const socket = useAuthStore.getState().socket;


        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if(!isMessageSentFromSelectedUser) return;
            set({messages: [...get().messages, newMessage]})
        })
    },


    notListenToMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    
    setSelectedUser: (selectedUser) => set({selectedUser}),

    sendMessages: async (messageData) => {

        const {selectedUser, messages} = get();

        try{
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data]})
        }
        catch(error){
            toast.error("Failed to send message")

        }

    }

}))