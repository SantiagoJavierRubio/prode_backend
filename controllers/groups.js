import Group from '../DAOs/Group.js'

export const create = async (req, res) => {
    try {
        const groupData = req.body
        if(!groupData.name) throw new Error('Group name is required')
        const user = await req.user
        const newGroup = await Group.createGroup(groupData, user)
        if(newGroup.error) throw new Error(newGroup.error)
        res.status(201).json(newGroup)
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}
export const join = async (req, res) => {
    try {
        const groupName = req.query.groupName;
        if(!groupName) throw new Error('No group')
        const user = await req.user
        const result = await Group.addMember(groupName, user)
        if(result.error) throw new Error(result.error)
        res.status(200).json(result)
    }
    catch(err) {
        res.status(400).json({error: err.message})
    }
}