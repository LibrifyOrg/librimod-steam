const webpack = require("webpack");
const util = require("util");
const path = require("path");
const fs = require("fs");

let configPath = path.join(process.cwd(), "librimod.json");
let packagePath = path.join(process.cwd(), "package.json");
let config;

if(fs.existsSync(configPath)) {
	config = require(configPath);
}
else {
	try {
		config = require(packagePath);
	}
	catch {
		return console.error("Can't find the package.json");
	}
}

if(config === undefined) {
	return console.error("The librimod config wasn't found in librimod.json or package.json");
}

const distFolder = path.resolve(process.cwd(), config.dist);
const webpackConfig = {
	entry: [path.join(process.cwd(), config.index)].concat(config.entry || []),
	output: {
		path: distFolder,
		filename: config.index,
		library: "",
		libraryTarget: "commonjs2"
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /\/node_modules\//,
				loader: "babel-loader"
			},
			{
				test: /\.scss$/,
				use: [
					"file-loader",
					"extract-loader",
					"css-loader",
					"sass-loader"
				]
			}
		]
	},
	target: "node"
};

if(!fs.existsSync(distFolder) || !fs.statSync(distFolder).isDirectory()) {
	fs.mkdirSync(distFolder);
}

if(fs.existsSync(configPath)) {
	fs.copyFileSync(configPath, path.join(distFolder, "librimod.json"));
}
else {
	fs.copyFileSync(packagePath, path.join(distFolder, "librimod.json"));
}

const startTime = process.hrtime();

util.promisify(webpack)(webpackConfig)
.then(() => {
	const endTime = process.hrtime(startTime);

	console.log(`Build successfully in ${endTime[0]}s and ${endTime[1] / 1000000}ms`);
})
.catch(console.error);