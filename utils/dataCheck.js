export const hasNulls = (data) => {
    if(!(data instanceof Array)) return true
    if(data.some(item => {
        if(item === null || item === undefined) return true
        return false
    })) return true
    return false
}

export const arePositiveNumbers = (data) => {
    if(!(data instanceof Array)) return false
    if(data.some(item => {
        if(isNaN(item)) return true
        if(item < 0) return true
        return false
    })) return false
    return true
}