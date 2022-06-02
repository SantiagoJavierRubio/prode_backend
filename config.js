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
  URLS.client = process.env.CLIENT_URL,
  URLS.server = process.env.SERVER_URL
}

const config = {
  mongoUrl: process.env.MONGO_URL,
  sessionSecret: process.env.SESSION_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  clientUrl: URLS.client,
  serverUrl: URLS.server,
  emailAccount: process.env.EMAIL_ACCOUNT,
  emailPassword: process.env.EMAIL_PASSWORD
};

export default config;
