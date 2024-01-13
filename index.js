const mongoose = require("mongoose");
const dotenv=require('dotenv').config()
const PORT = process.env.PORT || 4000
const nocache = require("nocache");
const dbConnect=require("./config/dbConnect")
const morgan=require("morgan")

const { notFound, errorHandler } = require("./middleware/errorHandler");
// connecting db




const express = require("express");
const app = express();
const path=require('path')
dbConnect.dbConnect();
app.use(morgan("dev"))
//loading assets

app.use('/admin',express.static(path.join(__dirname,"public/admin")))
app.use('/user',express.static(path.join(__dirname,"public/admin")))
app.use(express.static(path.join(__dirname, "public")));
app.use("/docs", express.static(path.join(__dirname, "docs")));



// app.use(nocache());

const disableBackButton = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store,must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '1');
      next();
  };


//for user routes
const userRoute = require('./routes/userRoute');
app.use("/", disableBackButton,userRoute);


//for admin routes
const adminRoute = require('./routes/adminRoute');
app.use("/admin", disableBackButton,adminRoute);

app.set("view engine", "ejs");
app.set("views", "./views/errors");
app.use(notFound);
app.use(errorHandler);

const port = 3000
app.listen(PORT, 
  () => console.log(`Server is running At http://localhost:${PORT}`))