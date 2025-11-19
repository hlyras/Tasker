const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const User = require('../app/model/user/main');

passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // O email do Google
        const email = profile.emails[0].value;

        // Verifica se o usuário já existe no banco
        let hasUser = (
          await User.filter({
            strict_params: {
              keys: ["email"],
              values: [email]
            }
          })
        )[0];

        // Se não existir, cria automaticamente

        let user = new User();
        user.id = hasUser?.id || null;
        user.email = email;
        user.name = profile.displayName;
        user.origin = "google";

        if (!hasUser) {
          let user_create_response = await user.create();
          if (user_create_response.err) {
            console.log(user_create_response.err);
            return done(user_create_response.err);
          }

          user.id = user_create_response.insertId;
        }

        // se o displayName for diferente atualizar...
        // se o avatar for diferente atualizar...

        return done(null, {
          id: user.id,
          email: user.email,
          name: user.displayName,
          avatar: profile.photos[0].value,
          origin: 'google'
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser(async (user, done) => done(null, user));

module.exports = passport;