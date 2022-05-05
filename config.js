import 'dotenv/config'
let url = ''
if(process.env.MODE === 'development' || !process.env.MODE) {
  url = 'http://localhost:3000'
} 
else {
  url = 'https://prodeqatar2022.vercel.app'
}

const config = {
  mongoUrl:
    'mongodb+srv://prodemundial:apififacom@prode.x70cn.mongodb.net/ProdeDB?retryWrites=true&w=majority',
  sessionSecret: 'apififacom',
  googleClientId:
    '468076309040-gaddvkpp6tj8fpm5utn6e3fbbrj0jel2.apps.googleusercontent.com',
  googleClientSecret: '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',
  clientUrl: url,
  emailAccount: 'MundialProde@outlook.com',
  emailPassword: 'api.fifa.com'
};

export default config;
