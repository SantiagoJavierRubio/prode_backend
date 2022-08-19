import mongoose from 'mongoose'

const GroupSchema = new mongoose.Schema({
    name: String,
    owner: String,
    members: [String],
    rules: {
        type: Object,
        default: {
            manifesto: '',
            scoring: {
                NONE: 0,
                WINNER: 1,
                FULL: 3
            },
            timeLimit: 0
        }
    }
}, {collection: 'groups'})

GroupSchema.methods.addMember = function(id) {
    this.members.push(id)
    return this.members
}

const Group = mongoose.model('Group', GroupSchema)

export default Group