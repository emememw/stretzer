const fs = require("fs-extra");
const concatFiles = require("concat-files");
const path = require("path");

const Bundler = module.exports = {};

Bundler.collectFilesAsync = function collectFilesAsync(directory, filter) {
	return new Promise((resolve, reject) => {
		const files = [];
		if (directory) {
			fs.walk(directory, {
				filter,
			})
			.on("data", file => {
				if(filter(file.path)) {
					files.push(file);
				}
			})
			.on("end", () => resolve(files))
			.on("error", error => reject(error));
		} else {
			reject("Error: No directory given!");
		}
	});
};

Bundler.bundleAsync = function bundleAsync(directory, targetDirectory) {
	return new Promise((resolve, reject) => {
		this.collectFilesAsync(directory, file => file.endsWith(".md"))
		.then(files => this.bundleFilesAsync(files.map(file => file.path), targetDirectory))
		.then(() => this.collectFilesAsync(directory, file => file.endsWith(".png") || file.endsWith(".jpg")))
		.then(files => this.bundleImagesAsync(files.map(file => file.path), targetDirectory))
		.then(() => resolve())
		.catch(error => reject(error));
	});
};

Bundler.bundleFilesAsync = function bundleFilesAsync(files, targetDirectory) {
	return new Promise((resolve, reject) => {
		this.sortFiles(files);
		const distDir = targetDirectory;
		fs.ensureDirSync(distDir);
		concatFiles(files, `${distDir}/bundle.md`, (error) => {
			if (error) {
				reject(error);
			} else {
				resolve(files);
			}
		});
	});
};

Bundler.bundleImagesAsync = function bundleImagesAsync(files, targetDirectory) {
	const distDir = targetDirectory;
	return new Promise((resolve, reject) => {
		files.forEach((file) => {
			fs.copySync(file, `${distDir}/${file.substring(file.lastIndexOf("/"), file.length)}`);
		});
		resolve();
	})	
}

Bundler.sortFiles = function sortFiles(files) {
	files.sort((fileA, fileB) => {
		let result = 0;
		if(fileA < fileB) {
			result = -1;
		} else if(fileA > fileB) {
			result = 1;
		}
		if (fileB.endsWith("/index.md")) {
			result = 1;
		}
		return result;
	});
}
