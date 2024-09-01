import passport from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UserRepository } from '../repositories/Impl/UserRepository.js';
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};
const userRepository = new UserRepository();
passport.use(new Strategy(opts, async (jwt_payload, done) => {
    try {
        const user = await userRepository.getUserById(jwt_payload.userId);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (err) {
        return done(err, false);
    }
}));
export default passport;
//# sourceMappingURL=passport.js.map