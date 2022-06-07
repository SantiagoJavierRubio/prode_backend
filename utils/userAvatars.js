import cloudinary from 'cloudinary'
import config from '../config.js'

cloudinary.config({
    cloud_name: config.cloudinary.name,
    api_key: config.cloudinary.key,
    api_secret: config.cloudinary.secret,
    secure: true
})

const getResources = async () => {
    return await cloudinary.v2.api.resources({
        type: 'upload',
        prefix: 'avatars',
        max_results: 100
    }, (err, result) => {
        if(err) throw new Error(err)
        else return result
    })
}

const transformUrl = (url) => {
    return url.replace(/upload\/\w+\//, 'upload/c_thumb,h_200,w_200,r_max/')
}

const getAvatars = async () => {
    const resources = await getResources()
    const urls = await resources?.resources.map(resource => {
        return transformUrl(resource.url)
    })
    return urls
}


export default getAvatars