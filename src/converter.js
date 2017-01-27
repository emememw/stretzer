const markdownpdf = require("markdown-pdf")
const path = require("path");
const cheerio = require("cheerio");
const through = require("through2");

const Converter = module.exports = {};

Converter.convertAsync = function convertAsync(bundleFile) {
	return new Promise((resolve, reject) => {
		markdownpdf({
			preProcessHtml: this.preProcessHtml(bundleFile.replace("/bundle.md", "")),
		}).from(bundleFile).to(bundleFile.replace("/bundle.md", "/bundle.pdf"), function () {
			resolve();
		});
	});
};

Converter.preProcessHtml = function preProcessHtml(basePath) {
	return function() {
		return through(function (chunk, encoding, callback) {
			const $ = cheerio.load(chunk);
			$('img[src]').each(function() {
				let imagePath = $(this).attr('src');
				imagePath = path.resolve(basePath, imagePath);
				$(this).attr('src', 'file://' + (process.platform === 'win32' ? '/' : '') + imagePath);
	  	});
			this.push($.html());
			callback();
	 	});
	}
}
