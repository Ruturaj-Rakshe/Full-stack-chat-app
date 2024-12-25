import express from "express"
import authRoutes from "./routes/auth.route.js"
import messageRoutes from "./routes/message.route.js"
import dotenv from "dotenv"
import { connectdb } from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors";
import { server,app, } from "./lib/socket.js";

import path from "path"

dotenv.config()

console.log("JWT_SECRET:", process.env.JWT_SECRET);




const PORT = process.env.PORT || 6001

const __dirname = path.resolve()


app.use(cors({
    origin: ["http://localhost:5173","http://localhost:5174"],
    credentials: true

}))

app.use(express.json())
app.use(cookieParser())



app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

server.listen(PORT, () => {
    console.log("Server is running on port: "+PORT);
    connectdb()
})