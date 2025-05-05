import type { GatsbyConfig } from "gatsby";
import dotenv from "dotenv";

// Load environment variables based on the active environment
const activeEnv = process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || "development";
console.log(`Using environment: ${activeEnv}`);

// Load the appropriate .env file
dotenv.config({
	path: `.env.${activeEnv}`,
});

const config: GatsbyConfig = {
	siteMetadata: {
		title: `MapGuesser`,
		siteUrl: `https://mapguesser.com`
	},
	// More easily incorporate content into your pages through automatic TypeScript type generation and better GraphQL IntelliSense.
	// If you use VSCode you can also use the GraphQL plugin
	// Learn more at: https://gatsby.dev/graphql-typegen
	graphqlTypegen: true,
	plugins: ["gatsby-plugin-postcss"]
};

export default config;
