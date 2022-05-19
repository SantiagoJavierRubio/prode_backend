import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema({
    matchId: String,
    userId: String,
    groupId: String,
    homeScore: Number,
    awayScore: Number,
    edited: {
        type: Date,
        default: Date.now()
    },
    checked: {
        type: Boolean,
        default: false
    }
}, {collection: 'predictions'})

const Prediction = mongoose.model('Predictions', predictionSchema)

export default Prediction