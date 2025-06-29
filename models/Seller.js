const mongoose=require("mongoose");
const sellerSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    sellerid:{
        type:String,
        required:true,
        unique:true
    },
    contactnum:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    address:String,
    region:String,
    pincode:String
});

const Seller = mongoose.model("Seller",sellerSchema);
module.exports=Seller;