const GROUP_CODES = {
    A: '285065',
    B: '285066',
    C: '285067',
    D: '285068',
    E: '285069',
    F: '285070',
    G: '285071',
    H: '285072'
}

const STAGE_CODES = {
    GRUPOS: '285063',
    OCTAVOS: '285073',
    CUARTOS: '285074',
    SEMIFINALES: '285075',
    FINAL: '285077',
    TERCER_PUESTO: '285076'
}

export const getGroupCode = (input) => {
    if(!input) return { error: 'No input' }
    const i = input.toUpperCase()
    if(GROUP_CODES[i]) return GROUP_CODES[i]
    return input
}

export const getStageCode = (input) => {
    if(!input) return { error: 'No input' }
    const i = input.toUpperCase()
    if(STAGE_CODES[i]) return STAGE_CODES[i]
    return input
}