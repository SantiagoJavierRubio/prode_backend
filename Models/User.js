import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    score: {
        type: Number,
        default: 0
    },
    groups: {
        type: [String],
        default: ['general']
    },
    verified: {
        type: Boolean,
        default: false
    }
}, {collection: 'users'})

const User = mongoose.model('User', UserSchema)

export default User
