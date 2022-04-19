import Container from '../Containers/Models/User'
import Model from '../Models/User'
import bcrypt from 'bcryptjs'

const hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        return hash
    } catch(err) {
        return new Error('Failed to hash password')
    }
}

class User extends Container {
    constructor() {
        super(Model)
    }
    async createWithEmail(data) {
        try {
            if(!data.email) throw new Error('Email is required')
            if(!data.password) throw new Error('Password is required')
            let pwd = await hashPassword(data.password)
            const user = await this.create({ ...data, password: pwd })
            if(!user) throw new Error('Failed to create user')
            return user._id
        } catch (err) {
            return err
        }
    }
}


export default User