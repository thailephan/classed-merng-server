const { UserInputError } = require('apollo-server-errors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
	validateLoginInput,
	validateRegisterInput,
} = require('../../util/validators');
const { SECRET_KEY } = require('../../config');
const User = require('../../models/User');

const generateToken = (user) =>
	jwt.sign(
		{
			id: user.id,
			email: user.email,
			username: user.username,
		},
		SECRET_KEY,
		{ expiresIn: '1h' },
	);

const userResolvers = {
	Mutation: {
		async login(_, { loginInput: { username, password } }) {
			const { errors, valid } = validateLoginInput(username, password);

			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}

			const user = await User.findOne({ username });

			if (!user) {
				errors.general = 'User not found';
				throw new UserInputError('Wrong credentials', { errors });
			}

			const match = await bcrypt.compare(password, user.password);

			if (!match) {
				errors.general = 'Wrong credential ';
				throw new UserInputError('Wrong credentials', { errors });
			}
			const token = generateToken(user);

			return {
				...user._doc,
				id: user._id,
				token,
			};
		},
		async register(
			_,
			{ registerInput: { username, email, password, confirmPassword } },
			context,
			info,
		) {
			// TODO: Validate user data
			const { valid, errors } = validateRegisterInput(
				username,
				email,
				password,
				confirmPassword,
			);
			if (!valid) {
				throw new UserInputError('Errors', { errors });
			}
			// TODO: Make sure user doesnt already exist
			const user = await User.findOne({ username });
			if (user) {
				throw new UserInputError('Username is taken', {
					errors: {
						username: 'This username is taken',
					},
				});
			}
			// TODO: has password and create an auth token
			const passwordHashed = await bcrypt.hash(password, 12);

			const newUser = new User({
				email,
				username,
				password: passwordHashed,
				createdAt: new Date().toISOString(),
			});

			const res = await newUser.save();

			const token = generateToken(res);
			return {
				...res._doc,
				id: res._id,
				token,
			};
		},
	},
};

module.exports = userResolvers;
