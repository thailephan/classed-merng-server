/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable indent */
/* eslint-disable no-tabs */
const { ApolloServer, PubSub } = require('apollo-server');
const mongoose = require('mongoose');

const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs');
const {
	MONGODB_CLOUD,
	MONGODB_LOCAL,
	PASS,
	USER,
} = require('./config');

const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: ({ req }) => ({ req, pubsub }),
});

mongoose
	// .connect(MONGODB_LOCAL, {
	// 	dbName: 'merng',
	// 	useNewUrlParser: true,
	// 	useUnifiedTopology: true,
	// })

	// Connect for ATLAS MONGODB
	.connect(MONGODB_CLOUD, {
		dbName: 'merng',
		user: USER,
		pass: PASS,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('MongoDB Connected');
		return server.listen({ port: PORT });
	})
	.then((res) => {
		console.log(`Server is running at port ${res.url}`);
	})
	.catch((err) => {
		console.error(err);
	});
