#! /usr/bin/env node
const argv = require('yargs').argv;

const Bundler = require("./bundler");
const Converter = require("./converter");
const path = require("path");

if (argv._ && argv._.length > 1) {
	const sourceDirectory = argv._[0];
	const targetDirectory = argv._[1];
	Bundler.bundleAsync(sourceDirectory, targetDirectory)
	.then(() => Converter.convertAsync(`${targetDirectory}/bundle.md`))
	.then(() => console.log("done"))
	.catch(error => console.log(error));
} else {
	console.log("Error: Please provide source and target directory.");
}
