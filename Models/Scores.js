import mongoose from 'mongoose'

const ScoresSchema = new mongoose.Schema({
    groupId: String,
    userId: String,
    score: {
        type: Number,
        default: 0
    }
}, {collection: 'scores'})

const Scores = mongoose.model('Scores', ScoresSchema)

export default Scores