import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import i18n from 'i18n';
import { fork } from 'child_process'
import config from './config.js';
import authRoutes from './routes/auth.js';
import fifaRoutes from './routes/fifa.js';
import predictionRoutes from './routes/predictions.js';
import groupRoutes from './routes/groups.js';
import userRoutes from './routes/user.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import errorHandler from './Errors/errorHandler.js';
import './authentication/passportStrategies.js';
import 'dotenv/config';

const app = express();
i18n.configure({
  locales: config.langs,
  directory: path.join(process.cwd(), 'locales')
})
// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + '/public'));
app.use(cookieParser());
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
      secure: true,
      sameSite: 'None',
      httpOnly: false,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
  );
  app.set('trust proxy', 1);
  app.use(
    cors({
      credentials: true,
      origin: config.clientUrl
    })
  );
  app.use(helmet());
  app.use((req, res, next) => {
    const l = req.get('accept-language')
    i18n.setLocale(l)
    next()
  })
  app.use(errorHandler);

// AUTHENTICATION SETUP
app.use(passport.initialize());

// ROUTES
app.get('/', (req, res) => {
  res.send('Welcome to the back end!');
});
app.post('/score-predictions', async (req, res) => {
  // if(req.body.password === config.scoringPassword) {
    fork('scorePredictions.js');
    res.send('server received scoring command')
  // }
  // else {
  //   res.send('incorrect password')
  // }
})
app.use('/auth', authRoutes);
app.use('/fifa', fifaRoutes)
app.use('/predictions', predictionRoutes)
app.use('/group', groupRoutes)
app.use('/user', userRoutes)
// import {scorePredictions} from './scorePredictions.js'
// app.get('/score-predictions', async (req, res) => {
//   const start = process.hrtime();
//   const result = await scorePredictions();
//   const end = process.hrtime(start);
//   const time = (end[0] * 1e9 + end[1])/1e9;
//   if(result.scored) res.send(`Scored ${result.scored.length} predictions in ${time} seconds`);
//   else res.send(result)
// })

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
  console.log(`Server para el prode mundial corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV || 'development'}`);
});
server.on('error', (err) => {
  console.error('Server error: ', err);
});
