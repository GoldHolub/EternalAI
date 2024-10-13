import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from './EmailService.js';
import { TokenService } from './TokenService.js';
import { PaymentService } from './PaymentService.js';
const client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});
const emailService = new EmailService();
const tokenService = new TokenService();
const paymentService = new PaymentService();
export class UserService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async registerUser(email, password, name, googleToken, sharedToken) {
        try {
            if (googleToken) {
                const validGoogleToken = await this.verifyGoogleToken(googleToken);
                if (!validGoogleToken) {
                    throw new Error('Invalid Google token');
                }
                if (!validGoogleToken.email) {
                    return null;
                }
                let user = await this.userRepository.getUserByEmail(validGoogleToken.email);
                if (!user) {
                    const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
                    user = await this.userRepository.createUser(validGoogleToken.email, randomPassword, name);
                    if (validGoogleToken.email_verified) {
                        await this.userRepository.updateUser(user.id, { isGoogleVerified: true, isVerified: true, });
                    }
                    this.giveFreeAnswersToUser(sharedToken);
                }
                const token = this.createToken(user);
                return token ? { token } : null;
            }
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            let user = await this.userRepository.getUserByEmail(email);
            if (user && user.isVerified) {
                const token = this.createToken(user);
                return token ? { token } : null;
            }
            else if (user && !user.isVerified) {
                return null;
            }
            if (!user) {
                this.validateUserData({ email, password });
                const hashedPassword = await bcrypt.hash(password, 10);
                const newUser = await this.userRepository.createUser(email, hashedPassword);
                const emailConfirmationToken = await tokenService.generateVerificationToken(newUser.id, newUser.email);
                await emailService.sendVerificationEmail(newUser.email, emailConfirmationToken);
                this.giveFreeAnswersToUser(sharedToken);
            }
            return null;
        }
        catch (error) {
            console.error('Error registering user:', error);
            throw new Error('Failed to register user. Please try again later.');
        }
    }
    async login(email, password, accessToken) {
        try {
            let user;
            if (accessToken) {
                const validGoogleToken = await this.verifyGoogleToken(accessToken);
                if (!validGoogleToken || !validGoogleToken.email) {
                    return null;
                }
                user = await this.userRepository.getUserByEmail(validGoogleToken.email);
                if (!user) {
                    return null;
                }
            }
            else if (email && password) {
                user = await this.userRepository.getUserByEmail(email);
                if (!user || !user.isVerified) {
                    console.log('User not found or not verified');
                    return null;
                }
                const isPasswordValid = await bcrypt.compare(password, user.password);
                if (!isPasswordValid) {
                    //throw new Error('Invalid password');
                    return null;
                }
            }
            else {
                return null; // Neither password nor Google token provided
            }
            const token = this.createToken(user);
            return { token, isVerified: user.isVerified, hasAcceptedPolicy: user.hasAcceptedPolicy };
        }
        catch (error) {
            console.error('Error during login:', error);
            throw new Error('Login failed. Please try again later.');
        }
    }
    async verifyUserEmailToken(token) {
        try {
            const tokenData = tokenService.verifyToken(token);
            if (tokenData) {
                const user = await this.userRepository.getUserById(tokenData.userId);
                if (!user) {
                    throw new Error('User not found');
                }
                else if (tokenData.email !== user.email && user.isVerified) {
                    if (user.has_subscription) {
                        await paymentService.updateUserStripeAccountEmail(user.email, tokenData.email);
                    }
                    const updatedUser = await this.userRepository.updateUser(user.id, { email: tokenData.email });
                    return updatedUser?.email;
                }
                else if (tokenData.email === user.email) {
                    const updatedUser = await this.userRepository.updateUser(user.id, { isVerified: true });
                    return updatedUser?.email;
                }
            }
            throw new Error('Invalid token');
        }
        catch (error) {
            throw new Error(error);
        }
    }
    async sendForgottenPasswordEmail(email) {
        try {
            if (!email)
                throw new Error('Email is required');
            const user = await this.userRepository.getUserByEmail(email);
            if (!user || !user.email) {
                return false;
            }
            const token = await tokenService.generateVerificationToken(user.id, user.email);
            await emailService.sendPasswordResetEmail(user.email, token);
            return true;
        }
        catch (error) {
            console.error('Error resetting password:', error);
            throw new Error('Failed to send password reset email. Please try again later.');
        }
    }
    async resetForgottenPassword(token, newPassword) {
        try {
            const tokenData = tokenService.verifyToken(token);
            if (!tokenData)
                throw new Error(`Invalid token`);
            const user = await this.userRepository.getUserById(tokenData.userId);
            if (!user)
                throw new Error(`User not found`);
            if (user.email !== tokenData.email)
                throw new Error(`Wrong token`);
            if (!newPassword)
                throw new Error(`New password is required`);
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const updatedUser = await this.userRepository.updateUser(user.id, { password: hashedPassword });
            return true;
        }
        catch (error) {
            throw new Error(`Can't reset password. ${error.message}`);
        }
    }
    async getUserById(id) {
        try {
            return await this.userRepository.getUserById(id);
        }
        catch (error) {
            console.error('Error fetching user by ID:', error);
            throw new Error('Failed to fetch user. Please try again later.');
        }
    }
    async getUserByEmail(email) {
        try {
            return await this.userRepository.getUserByEmail(email);
        }
        catch (error) {
            console.error('Error fetching user by email:', error);
            throw new Error('Failed to fetch user. Please try again later.');
        }
    }
    async updateUser(user, updates) {
        try {
            const validUpdates = this.filterValidUpdateData(updates);
            if (validUpdates.password) {
                validUpdates.password = await bcrypt.hash(validUpdates.password, 10);
            }
            if (validUpdates.email && validUpdates.email !== user.email) {
                const existingUser = await this.userRepository.getUserByEmail(validUpdates.email);
                if (existingUser && existingUser.id !== user.id)
                    throw new Error('Email already in use');
                emailService.sendVerificationEmail(validUpdates.email, await tokenService.generateVerificationToken(user.id, validUpdates.email));
                validUpdates.email = user.email;
            }
            return await this.userRepository.updateUser(user.id, validUpdates);
        }
        catch (error) {
            console.error('Error updating user:', error);
            throw new Error(`Failed to update user. ${error.message}.`);
        }
    }
    async deleteUser(id) {
        try {
            return await this.userRepository.deleteUser(id);
        }
        catch (error) {
            console.error('Error deleting user:', error);
            throw new Error('Failed to delete user. Please try again later.');
        }
    }
    async getAllUsers() {
        try {
            return await this.userRepository.getAllUsers();
        }
        catch (error) {
            console.error('Error fetching all users:', error);
            throw new Error('Failed to fetch users. Please try again later.');
        }
    }
    async subscribeUser(userId) {
        try {
            const user = await this.userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            const updatedUser = await this.userRepository.updateUser(userId, { has_subscription: true });
            return updatedUser !== null;
        }
        catch (error) {
            console.error('Error subscribing user:', error);
            throw new Error('Failed to subscribe user. Please try again later.');
        }
    }
    async isUserSubscribed(userId) {
        try {
            const user = await this.userRepository.getUserById(userId);
            return user ? user.has_subscription : false;
        }
        catch (error) {
            console.error('Error checking user subscription:', error);
            throw new Error('Failed to check subscription status. Please try again later.');
        }
    }
    async changeUserRole(userId, newRole) {
        try {
            return await this.userRepository.updateUser(userId, { role: newRole });
        }
        catch (error) {
            console.error('Error changing user role:', error);
            throw new Error('Failed to change user role. Please try again later.');
        }
    }
    validateUserData(userData) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
        });
        const { error } = schema.validate(userData);
        if (error) {
            throw new Error(`Validation error: ${error.message}`);
        }
    }
    validateUpdateData(updates) {
        const schema = Joi.object({
            email: Joi.string().email(),
            name: Joi.string().min(3),
            phone: Joi.string().min(10),
            password: Joi.string().min(8),
            hasAcceptedPolicy: Joi.boolean(),
        }).or('email', 'name', 'phone', 'password', 'hasAcceptedPolicy');
        const { error } = schema.validate(updates);
        if (error) {
            throw new Error(`Validation error: ${error.message}`);
        }
    }
    filterValidUpdateData(updates) {
        const validUpdates = {};
        Object.keys(updates).forEach((key) => {
            const value = updates[key];
            if (value) {
                const s = validUpdates[key];
                //@ts-ignore
                validUpdates[key] = value;
            }
        });
        this.validateUpdateData(validUpdates);
        return validUpdates;
    }
    async verifyGoogleToken(accessToken) {
        const info = await client.getTokenInfo(accessToken);
        if (!info)
            throw new Error('Invalid Google token');
        return info;
    }
    createToken(user) {
        const token = jwt.sign({ userId: user.id, role: user.role, hasSubscription: user.has_subscription }, process.env.JWT_SECRET, { expiresIn: '1h' });
        return token;
    }
    async giveFreeAnswersToUser(sharedToken) {
        console.log(`shared token: ${sharedToken}`);
        if (!sharedToken)
            return;
        console.log(`shared token is present: ${sharedToken}`);
        const userData = tokenService.verifySharedToken(sharedToken);
        if (!userData?.userId)
            throw new Error('Invalid shared token');
        const userToShare = await this.userRepository.getUserById(userData.userId);
        if (!userToShare)
            throw new Error('User not found');
        await this.userRepository.updateUser(userToShare.id, { textAnswers: (userToShare.textAnswers - 3) });
    }
}
//# sourceMappingURL=UserService.js.map