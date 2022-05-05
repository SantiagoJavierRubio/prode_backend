import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema({
    matchId: String,
    userId: String,
    groupId: String,
    scoreHome: Number,
    scoreAway: Number,
    edited: {
        type: Date,
        default: Date.now()
    }
}, {collection: 'predictions'})

const Prediction = mongoose.model('Predictions', predictionSchema)

export default Prediction