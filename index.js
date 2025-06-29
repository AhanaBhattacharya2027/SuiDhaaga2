const express = require("express");
const mongoose=require("mongoose");
const dotenv = require("dotenv");
const Tailor = require('./models/Tailor.js');
const Seller = require('./models/Seller.js');
const Fabric=require('./models/Fabric.js')
const Design = require('./models/Design.js');
const Order = require('./models/Order.js')
const multer = require("multer");
const { storage } = require('./cloudinary.js');
const upload = multer({ storage });
const app=express();
const session = require('express-session');

const MongoStore = require("connect-mongo");
dotenv.config();
const cors = require('cors');
app.use(cors({
  origin: "https://sui-dhaaga-frontend.vercel.app", // or your frontend origin
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie:{
        secure: true,
        httpOnly: true,
        sameSite:"none"

    }
}));
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

app.post('/api/seller-registered',async(req,res)=>{
    const {sellerid} = req.body;
    const existingSeller = await Seller.findOne({sellerid:sellerid});
    if(existingSeller)
    {
        return res.status(400).json({message:"Seller ID already exists! Choose another one"});
    }
    const newSeller = new Seller(req.body);
    await newSeller.save();
    req.session.sellerid = newSeller.sellerid;
    console.log(req.session.sellerid);
    res.status(201).json({message:"Seller registered successfully", redirectTo:`/seller-dashboard/${sellerid}`});

});
app.post('/api/tailor-registered',async (req,res)=>{
    const {tailorid} = req.body;
    const existingTailor = await Tailor.findOne({tailorid:tailorid});
    if(existingTailor)
    {
        return res.status(400).json({message:"Tailor ID already exists! Choose another one"});
    }
    const newTailor = new Tailor(req.body);
    await newTailor.save();
    req.session.tailorid=tailorid;
    res.status(201).json({ message: "Tailor registered successfully", redirectTo: `/tailor-dashboard/${tailorid}` });
});
app.post('/api/fabric-registered', upload.single("image"), async(req,res)=>{
    if (!req.file || !req.session.sellerid) {
    return res.status(400).json({ message: "Missing image or session" });
    }
    const newFabric = new Fabric({
        fabricid:req.body.fabricid,
        title:req.body.title,
        description:req.body.description,
        material:req.body.material,
        pricepermeter:req.body.pricepermeter,
        image:req.file.path,
        sellerid:req.session.sellerid
    });
    await newFabric.save();
    res.status(201).json({
      message: "Fabric uploaded successfully!",
      redirectTo: `/seller-dashboard/${req.session.sellerid}`,
    });
});
app.get('/api/seller-dashboard/:id', async(req,res)=>{
    const sellerid =req.params.id;
    const existingSeller = await Seller.findOne({sellerid:sellerid});
    if(!existingSeller)
    {
        return res.status(404).json({message:"Seller Not found"});
    }
    const fabrics= await Fabric.find({sellerid:sellerid});
    res.status(200).json({seller:existingSeller,fabrics:fabrics})  ;

});
app.get('/api/tailor-dashboard/:id', async(req,res)=>{
    const tailorid=req.params.id;
    const existingTailor = await Tailor.findOne({tailorid:tailorid});
    
    
    if(!existingTailor)
    {
        return res.status(404).json({message:"Tailor Not Found"});
    }
    const contributedDesigns = await Design.find({tailorid:tailorid});
    res.status(200).json({tailor:existingTailor,designs:contributedDesigns});

});
app.post('/api/design-registered', upload.fields([{ name: 'imagefront' }, { name: 'imageback' }]),async (req,res)=>{
    const tailorid=req.session.tailorid;
    if (!tailorid) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }  
    const designid = req.body.designid;
    const existingDesign = await Design.findOne({designid:designid});
    if(existingDesign)
    {
        res.status(400).json({message:"Choose unique design Id"});
    }
    const imagefrontUrl = req.files['imagefront'][0].path;
    const imagebackUrl = req.files['imageback'][0].path;
    const newDesign = new Design({
        designid:req.body.designid,
        title:req.body.title,
        description:req.body.description,
        imagefront:imagefrontUrl,
        imageback:imagebackUrl,
        makingCharges:req.body.makingCharges,
        tailorid:req.session.tailorid

    });

    await newDesign.save();
    return res.status(201).json({redirectTo:`/tailor-dashboard/${tailorid}`});


});
app.post("/api/seller-logged-in", async (req,res)=>{
    const{sellerid,password} = req.body;
    const existingSeller = await Seller.findOne({sellerid:sellerid});
    if(!existingSeller)
    {
        res.status(404).json({message:"Seller does not exists!"});
    }
    else
    {
        req.session.sellerid=sellerid;
        res.status(201).json({redirectTo:`/seller-dashboard/${sellerid}`});
    }
});
app.post('/api/order-placed', upload.single("measurementImage"), async (req,res) => {

    const {fabricid,designid,quantityOfClothes, contactno,address} = req.body;
    const design = await Design.findOne({designid:designid});
    const fabric = await Fabric.findOne({fabricid:fabricid}); 
    if(!design || !fabric)
    {
        return res.status(404).json({ message: "Invalid fabric or design ID" });
    }
    const total = fabric.pricepermeter*quantityOfClothes+design.makingCharges+100;
    const newOrder = new Order({
        fabricid:fabricid,
        designid:designid,
        measurementImage:req.file.path,
        quantityOfClothes:quantityOfClothes,
        address:address,
        contactno:contactno,
        totalPrice:total,
    });
    await newOrder.save();
    res.status(201).json({message:"Order placed successfully"});
})
app.post('/api/tailor-logged-in', async (req, res) => {
    const { tailorid, password } = req.body;

    const existingTailor = await Tailor.findOne({ tailorid: tailorid });
    if (!existingTailor) {
        return res.status(404).json({ message: "Tailor does not exist!" });
    }

    if (existingTailor.password !== password) {
        return res.status(401).json({ message: "Incorrect password" });
    }

    req.session.tailorid = tailorid;
    return res.status(201).json({ redirectTo: `/tailor-dashboard/${tailorid}` });
});
app.get('/api/all-designs', async (req,res)=>{
    const allDesigns =  await Design.find({});
    res.status(200).json({designs:allDesigns});
});
app.listen("5000",()=>{
    console.log("App is listening at port 5000");
});