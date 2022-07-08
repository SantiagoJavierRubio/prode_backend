import 'dotenv/config';
import { hasNulls } from './dataCheck.js'
import CustomError from '../Errors/CustomError.js'

// const GROUP_CODES = process.env.MODO_PRUEBA ? {
//     A: '275075',
//     B: '275077',
//     C: '275079',
//     D: '275081',
//     E: '275083',
//     F: '275085',
//     G: '275087',
//     H: '275089'
// } : {
//     A: '285065',
//     B: '285066',
//     C: '285067',
//     D: '285068',
//     E: '285069',
//     F: '285070',
//     G: '285071',
//     H: '285072'
// }
const GROUP_CODES = {}
const STAGE_CODES = {}
switch(process.env.MODO_PRUEBA) {
    case 'FAKE_DATA':
        STAGE_CODES.GRUPOS = '111111',
        STAGE_CODES.OCTAVOS = '222222',
        STAGE_CODES.CUARTOS = '333333',
        STAGE_CODES.SEMIFINAL = '444444',
        STAGE_CODES.FINAL = '555555',
        STAGE_CODES.TERCER_PUESTO = '666666',
        GROUP_CODES.A = '100001',
        GROUP_CODES.B = '100002',
        GROUP_CODES.C = '100003',
        GROUP_CODES.D = '100004',
        GROUP_CODES.E = '100005',
        GROUP_CODES.F = '100006',
        GROUP_CODES.G = '100007',
        GROUP_CODES.H = '100008'
        break;
    case 'RUSIA':
        STAGE_CODES.GRUPOS = '275073',
        STAGE_CODES.OCTAVOS = '275093',
        STAGE_CODES.CUARTOS = '275095',
        STAGE_CODES.SEMIFINAL = '275097',
        STAGE_CODES.FINAL = '275101',
        STAGE_CODES.TERCER_PUESTO = '275099',
        GROUP_CODES.A = '275075',
        GROUP_CODES.B = '275077',
        GROUP_CODES.C = '275079',
        GROUP_CODES.D = '275081',
        GROUP_CODES.E = '275083',
        GROUP_CODES.F = '275085',
        GROUP_CODES.G = '275087',
        GROUP_CODES.H = '275089'
        break;
    default:
        STAGE_CODES.GRUPOS = '285063',
        STAGE_CODES.OCTAVOS = '285073',
        STAGE_CODES.CUARTOS = '285074',
        STAGE_CODES.SEMIFINAL = '285075',
        STAGE_CODES.FINAL = '285077',
        STAGE_CODES.TERCER_PUESTO = '285076',
        GROUP_CODES.A = '285065',
        GROUP_CODES.B = '285066',
        GROUP_CODES.C = '285067',
        GROUP_CODES.D = '285068',
        GROUP_CODES.E = '285069',
        GROUP_CODES.F = '285070',
        GROUP_CODES.G = '285071',
        GROUP_CODES.H = '285072'
}

export const getGroupCode = (input) => {
    if(hasNulls([input])) throw new CustomError(406, 'No group code or name')
    const i = input.toUpperCase()
    if(GROUP_CODES[i]) return GROUP_CODES[i]
    return input
}

export const getStageCode = (input) => {
    if(hasNulls([input])) throw new CustomError(406, 'No stage code or name')
    const i = input.toUpperCase()
    if(STAGE_CODES[i]) return STAGE_CODES[i]
    return input
}