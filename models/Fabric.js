const mongoose=require("mongoose");
const fabricSchema = new mongoose.Schema({
    fabricid:{
        type:String,
        required:true,
        unique:true,
    },
    title:String,
    description:String,
    material:String,
    pricepermeter:Number,
    image:String,
    sellerid:{
        type:String,
        required:true
    }
});
const Fabric = mongoose.model('Fabric',fabricSchema);
module.exports = Fabric;