const mongoose = require('mongoose');
const designSchema = new mongoose.Schema({
    designid:
    {
        type:String,
        required:true,
        unique:true
    },
    title:String,
    description:String,
    imagefront:String,
    imageback:String,
    makingCharges:Number,
    tailorid:{
        type:String,
        required:true
    }
        
});
const Design = mongoose.model('Design',designSchema);
module.exports = Design;
