const mongoose=require("mongoose");
const customerSchema = new mongoose.Schema({
    name:String,
    contactno:{
        type:String,
        required:true,
        unique:true
    },
    userid:{
        type:String,
        required:true,
        unique:true
    },
    password:String
});
const Customer = mongoose.model('Customer',customerSchema);
module.exports=Customer;