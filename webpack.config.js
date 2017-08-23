var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	context: path.join(__dirname, "src"),
	devtool: debug ? "inline-sourcemap" : false,
	entry: "./js/client.js",
	module: {
		loaders: [
		{
			test: /\.js?$/,
			exclude: /(node_modules|bower_components)/,
			loader: 'babel-loader',
			query: {
				presets: ['react', 'es2015', 'stage-0'],
				plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
			}
		},
		{
			test: /\.scss$/,
			use: debug ? [{
				loader: "style-loader" // creates style nodes from JS strings
			}, {
				loader: "css-loader" // translates CSS into CommonJS
			}, {
				loader: "sass-loader" // compiles Sass to CSS
			}] : ExtractTextPlugin.extract({
				fallback: "style-loader",
				use: [
				{
					loader: "css-loader",
					options: {
						minimize: true,
					},
				},
				{
					loader: "sass-loader",
					options: {
						includePaths: [path.resolve(__dirname, "./src")],
					},
				},
				],
			}),
		},
		{
			test: /\.(png|jpg|gif)$/,
			use: [
			{
				loader: 'file-loader',
				options: {
					name: '[name]-[md5:hash:base64:3].[ext]',
					outputPath: 'images/',
				}
			},
			],
		},
		]
	},
	output: {
		path: __dirname + "/output/",
		filename: "client.min.js"
	},
	plugins: debug ? [] : [
	new ExtractTextPlugin('style.min.css'),
	new webpack.optimize.OccurrenceOrderPlugin(),
	new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
	],
	externals: {
		"jquery": "jQuery",
		"react": "React",
		"react-dom": "ReactDOM",
		"animejs": "anime"
	}
};
