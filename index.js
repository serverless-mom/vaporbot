var Jimp = require("jimp");
var tumblr = require('tumblr.js');
var secrets = require('./secrets')
var client = tumblr.createClient({
	consumer_key: secrets.key
});

function randomPast() {
	var rightNow = Math.round((new Date()).getTime() / 1000);
	var randomTime = Math.floor(Math.random() * 100000000);
	return rightNow - randomTime;
}
// Make the request
var beforeTime = randomPast();
client.taggedPosts('vaporwave', {
	before: beforeTime
}, function(err, data) {
	if (err) {
		return console.log(err);
	};
	var imagePostArray = data.filter(function(post) {
		return (post.type == 'photo')
	})
	processPosts(imagePostArray);
	console.log(imagePostArray.slice(-1).pop().timestamp)
});

function processPosts(imagePostArray) {
	imagePostArray.forEach(function(post) {
		var imageUrl = post.photos[0].original_size.url;
		var blogName = post.blog_name;
		manipulateAndSaveImage(imageUrl, blogName);
	})
}

function manipulateAndSaveImage(imageUrl, blogName) {
	Jimp.read(imageUrl, function(err, image) {
		if (err) throw err;
		image.convolute([
			[0, 1, 0],
			[1, -40, 1],
			[0, 1, 0]
		]).quality(50,
			function(err, newImage) {
				Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function(font) {
					newImage.print(font, -3, newImage.bitmap.height - 30, "tumblr: " +
						blogName);
					Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(function(font) {
						newImage.print(font, -5, newImage.bitmap.height - 31, "tumblr: " +
							blogName);
						newImage.write("./images/" + blogName + beforeTime + ".jpg");
					});
				});
			});

	});
}
