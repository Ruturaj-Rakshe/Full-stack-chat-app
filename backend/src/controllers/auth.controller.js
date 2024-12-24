import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";


export const signup = async (req, res) => {
    const {fullName, email, password} = req.body

    try{
        if(password.length < 6){
            return res.status(400).json({message: "Password must be atleast 6 characters"})
        }

        if(!fullName || !email || !password){
            return res.status(400).json({message: "All fields are required"})
        }

       const user = await User.findOne({email})
       if(user) return res.status(400).json({message: "Email already exists"})

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            generateToken(newUser._id, res) //._id is how mongodb stores it, adds a cookie with the token
            await newUser.save()
            res.status(201).json({message: "User created successfully"})
        }
        else{
            console.log("Error in signup controller")
            res.status(400).json({message: "Failed to create user"})
        }
    }
    catch(error){

    }
}

export const login = async (req, res) => {
    
    try {
        const {email, password} = req.body //here
        const user = await User.findOne({email})

        if(!user) return res.status(400).json({message: "User not found"})

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid credentials"})

        generateToken(user._id, res)

        res.status(200).json({message: `Login successful, welcome ${user.fullName}`})
    } catch (error) {
        console.log("Error in login controller", error.message)
        res.status(500).json({message: "Internal server error"})
    }
}

export const logout = (req, res) => {
    const user = req.user
    try {
        res.cookie("jwt", "", {
            maxAge: 0
        })
        res.status(200).json({message: "Logged out successfully"})
    } catch (error) {
        console.log("Error in signout controller", error.message);
        res.status(500).json({message: "Internal server error"})
    }
}


export const updateProfile = async (req, res) => {

    try {
        const {profilePic} = req.body; //here
        const userId = req.user._id;
        if(!profilePic) return res.status(400).json({message: "Profile picture is required"})

        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        const updateUser = await User.findByIdAndUpdate(userId, {profilePic: uploadResponse.secure_url}, {new: true})

        res.status(200).json({message: "Profile picture updated successfully", data: updateUser})
        
    } catch (error) {
        console.log("Error in updateProfile controller", error.message);
        res.status(500).json({message: "Internal server error"})
    }
}

export const checkAuth = (req, res) => {
    try {
        console.log("User ID from protectRoute middleware:", req.user);
        res.status(200).json(req.user);
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({message: "Internal server error"})
        
    }
}