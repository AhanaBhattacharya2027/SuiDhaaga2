const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    fabricid:String,
    designid:String,
    measurementImage:String,
    quantityOfClothes:Number,
    address:String,
    contactno:String,
    totalPrice:Number,
});
const Order = new mongoose.model('Order',orderSchema);
module.exports=Order;