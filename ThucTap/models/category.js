const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
    name: {
        type:String,
        required:true,
    },
    image: {
        type:String,
        required:true,
    },
    status: {
        type: Boolean,
        required: false,

    },

});
//const User = mongoose.model('User', userSchema);
//module.exports = User;
module.exports = mongoose.model('category', UserSchema);
