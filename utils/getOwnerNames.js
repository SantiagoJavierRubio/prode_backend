import User from '../DAOs/User.js';

const getOwnerNames = async (groups) => {
    try {
        const owners = groups.map(group => {
            return group.owner
        })
        const ownerNames = await User.getManyById(owners, '_id name');
        if(!ownerNames) throw new Error('Failed to get owner names');
        return groups.map(group => {
            const owner = ownerNames.find(owner => owner._id.toString() === group.owner.toString());
            return {
                name: group.name,
                members: group.members,
                owner: owner.name
            }
        })
    }
    catch(err) {
        return { error: err.message }
    }
}

export default getOwnerNames;