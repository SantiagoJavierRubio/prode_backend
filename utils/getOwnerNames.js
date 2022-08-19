import User from '../DAOs/User.js';
import CustomError from '../Errors/CustomError.js';

const getOwnerNames = async (groups) => {
    if(!groups) throw new CustomError(406, 'Missing groups')
    const owners = groups.map(group => {
        return group.owner
    })
    const ownerNames = await User.getManyById(owners, '_id name');
    if(!ownerNames) throw new CustomError(500, 'Failed to get owner names');
    return groups.map(group => {
        const owner = ownerNames.find(owner => owner._id.toString() === group.owner.toString());
        return {
            id: group._id,
            name: group.name,
            members: group.members,
            owner: owner.name,
            rules: group.rules
        }
    })
}

export default getOwnerNames;