import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import config from './config.js';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import './authentication/passportStrategies.js';
import 'dotenv/config';

// SERVER SETUP
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + '/public'));
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: [config.clientUrl, 'https://prodeqatar2022.netlify.app', 'http://prodeqatar2022.netlify.app']
  })
);
app.use(
  session({
    store: MongoStore.create({
      mongoUrl: config.mongoUrl,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    }),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 30
    }
  })
);

// AUTHENTICATION SETUP
app.use(passport.initialize());

// ROUTES
app.get('/', (req, res) => {
  res.send('Welcome to the back end!');
});
app.use('/auth', authRoutes);
app.get('/login', (req, res) => {
  res.send('logeate');
});

// DB INITIALIZE
const MONGO_OPTIONS = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(`${config.mongoUrl}`, MONGO_OPTIONS, (err) => {
  if (err) {
    console.log('Failed to connect to mongoDB');
    console.error(err);
  }
 else {
    console.log('Connected to mongoDB');
  }
});

// SERVER INITIALIZE
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Server para el prode mundial corriendo en el puerto ${PORT}`);
});
server.on('error', (err) => {
  console.error('Server error: ', err);
});
