const mongoose = require('mongoose')

const msgSchema = new mongoose.Schema({
    type : {
        type:String,
        required : true
    },
    username : {
        type:String
    },
    message : {
        type:String
    },
    filename : {
        type:String
    },
    time : {
        type: Date
    },
    room : {
        type: String
    }
},{collection: 'messages'})

module.exports = mongoose.model('Msg',msgSchema)