ZipSprite
=========

`npm install zipsprite`

ZipSprite is a general purpose library to use uncompressed zip files as a container format in the browser. ZipSprite can be used to reduce HTTP requests whether you're creating a game, a multimedia interactive or an app.

For example if your game needs a set of asset (like five images, three audio files and nine models) ASAP before it can load you can bundle these assets into one zip and then use ZipSprite to use them like they would be separate files. This example would save 16 HTTP requests (17 assets vs 1 zip).

Since the zip files are uncompressed (compression is already done by the image/audio/video format you use) ZipStream is very low on CPU usage. **It's basically just handing out pointers to memory in the form of URLs.**


How to use
----------

First you need to get the zip file into memory as `ArrayBuffer`. This is out of scope of ZipSprite, but you could for example load it via xhr with `responseType` set to `arraybuffer`. Then construct a new ZipStream instance and get a URL to the file you want!

```js
var xhr = require('xhr');
var ZipSprite = require('zipsprite');

var options = {
	url: 'assets.zip',
	method: 'GET',
	responseType: 'arraybuffer'
};

xhr(options, function(err, response, buffer) {
	var sprite = new ZipSprite(buffer);

	//Get URLs to specific files inside the zip.
	var boom = sprite.createURL('audio/explosion.mp3');
	var wow = sprite.createURL('images/memes/doge.jpg');

	//Or get all files inside the zip.
	//Every file has a `name` property you can pass to createURL.
	var files = sprite.getFiles();

	//Or just some of the files?
	//This demo uses minimatch for globbing, but your filter function can do whatever you want (e.g. regular expressions).
	var wav = sprite.getFiles(minimatch('audio/*.wav'));
});
```

Calling `createURL` multiple times for the same file returns the same URL.

After you've used the URL (you've displayed the image, loaded the model or played the audio) release the Blob URL. This is especially important for longer sessions because you'll otherwise eat memory.

```js
sprite.revokeURL('images/mind-blown.gif');
```