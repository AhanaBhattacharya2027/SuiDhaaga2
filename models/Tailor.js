const mongoose=require("mongoose");
const tailorSchema = new mongoose.Schema({
    name:String,
    tailorid:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    contactnum:String,
    address:String,
    region:String,
    pincode:Number
});
const Tailor = mongoose.model("Tailor",tailorSchema);
module.exports = Tailor;