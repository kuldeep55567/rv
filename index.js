const express =require("express");
const app = express();
require("dotenv").config();
const {connection} = require("./Config/db")
const {UserRouter} = require(".//Routes/userRoute")
const cors = require("cors")
app.use(express.json())
app.use(cors())
app.use("/api",UserRouter)
app.listen(process.env.PORT,async()=>{
    try {
        await connection
        console.log("Database Connected Successfully");
    } catch (error) {
        console.log("Error while Connecting to Database");
    }
    console.log(`Server is running at port ${process.env.PORT}`);
})