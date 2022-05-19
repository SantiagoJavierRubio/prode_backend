import 'dotenv/config'
const URLS = {
  client: '',
  server: ''
}
if(process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  URLS.client = 'http://localhost:3000',
  URLS.server = 'http://localhost:8080'
} 
else {
  URLS.client = 'https://prodeqatar2022.vercel.app',
  URLS.server = 'https://prode-mundial-backend.herokuapp.com'
}

const config = {
  mongoUrl:
    'mongodb+srv://prodemundial:apififacom@prode.x70cn.mongodb.net/ProdeDB?retryWrites=true&w=majority',
  sessionSecret: 'apififacom',
  googleClientId:
    '468076309040-gaddvkpp6tj8fpm5utn6e3fbbrj0jel2.apps.googleusercontent.com',
  googleClientSecret: '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',
  clientUrl: URLS.client,
  serverUrl: URLS.server,
  emailAccount: 'prode.mundial.virtual@gmail.com',
  emailPassword: 'mrsqhxfbwfpfzbyu'
};

export default config;
