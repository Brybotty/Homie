import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { AuthService } from '../services/auth.service';
import { User } from '../types/auth.types';

const authService = new AuthService();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value || '';
        const user = await authService.upsertUser({
          google_id: profile.id,
          email,
          full_name: profile.displayName || null,
          avatar_url: profile.photos?.[0]?.value || null,
        });
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    }
  )
);

// Serialización mínima — solo guardamos el id en sesión
passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await authService.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
