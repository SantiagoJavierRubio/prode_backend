import 'dotenv/config'

const config = {
  mongoUrl:
    'mongodb+srv://prodemundial:apififacom@prode.x70cn.mongodb.net/ProdeDB?retryWrites=true&w=majority',
  sessionSecret: 'apififacom',
  googleClientId:
    '468076309040-gaddvkpp6tj8fpm5utn6e3fbbrj0jel2.apps.googleusercontent.com',
  googleClientSecret: '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',
  clientUrl: process.env.MODE === 'development' ? 'http://localhost:3000' : 'https://prodeqatar2022.netlify.app',
  emailAccount: 'MundialProde@outlook.com',
  emailPassword: 'api.fifa.com'
};

export default config;