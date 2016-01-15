var xhr = require('xhr');
var minimatch = require("minimatch")

var ZipSprite = require('../');

var zipFiles = [
	{
		name: 'all.7zip.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			},
			{
				name: 'images/smile.gif',
				size: 41,
				offset: 134
			}
		],
		filtered: {
			filter: minimatch.filter('images/*'),
			files: [
				{
					name: 'images/smile.gif',
					size: 41,
					offset: 134
				}
			]
		}
	},
	{
		name: 'all.windows.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			},
			{
				name: 'images/smile.gif',
				size: 37,
				offset: 97
			}
		],
		filtered: {
			filter: minimatch.filter('*'),
			files: [
				{
					name: 'Hello.txt',
					size: 12,
					offset: 39
				}
			]
		}
	},
	{
		name: 'all.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			},
			{
				name: 'images/smile.gif',
				size: 41,
				offset: 134
			}
		],
		filtered: {
			filter: minimatch.filter('*.txt'),
			files: [
				{
					name: 'Hello.txt',
					size: 12,
					offset: 39
				}
			]
		}
	},
	{
		name: 'archive_comment.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			}
		]
	},
	{
		name: 'backslash.zip',
		files: [
			{
				name: 'Hel\\lo.txt',
				size: 12,
				offset: 40
			}
		]
	},
	{
		name: 'data_descriptor.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 67
			}
		]
	},
	{
		name: 'deflate.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 73,
				offset: 39
			}
		]
	},
	{
		name: 'encrypted.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 24,
				offset: 39
			}
		]
	},
	{
		name: 'extra_attributes.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 67
			}
		]
	},
	{
		name: 'folder.zip',
		files: []
	},
	{
		name: 'image.zip',
		files: [
			{
				name: 'smile.gif',
				size: 41,
				offset: 39
			}
		]
	},
	{
		name: 'nested_data_descriptor.zip',
		files: [
			{
				name: 'data_descriptor.zip',
				size: 196,
				offset: 77
			}
		]
	},
	{
		name: 'nested.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			},
			{
				name: 'zip_within_zip.zip',
				size: 128,
				offset: 99
			}
		]
	},
	{
		throws: true,
		name: 'slashes_and_izarc.zip',
		files: [
			{
				name: 'test/Hello.txt',
				size: 13,
				offset: 44
			}
		]
	},
	{
		name: 'store.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 94,
				offset: 39
			}
		]
	},
	{
		name: 'subfolder.zip',
		files: []
	},
	{
		name: 'text.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12,
				offset: 39
			}
		]
	}
];

//Test that the file list of every zip can be read (file name, offset from start and size).
zipFiles.forEach(function(testFile) {
	QUnit.test(testFile.name, function(assert) {
		var done = assert.async();
		var options = {
			url: 'zip/' + testFile.name,
			method: 'GET',
			responseType: 'arraybuffer'
		};

		xhr(options, function(err, response, buffer) {
			if(testFile.throws) {
				assert.throws(function() {
					new ZipSprite(buffer);
				});
			} else {
				var sprite = new ZipSprite(buffer);
				assert.deepEqual(sprite.getFiles(), testFile.files);

				//Test if we can get a filtered list of files, e.g. subfolders.
				if(testFile.filtered) {
					assert.deepEqual(sprite.getFiles(testFile.filtered.filter), testFile.filtered.files);
				}
			}

			done();
		});
	});
});

//Make sure loading an image form inside of a zip using Blob URLs actually works.
QUnit.test('Load image', function(assert) {
	var done = assert.async();

	var options = {
		url: 'zip/image.zip',
		method: 'GET',
		responseType: 'arraybuffer'
	};

	xhr(options, function(err, response, buffer) {
		var sprite = new ZipSprite(buffer);
		var image = new Image();

		image.onload = function() {
			assert.equal(image.width, 5);
			assert.equal(image.height, 5);
			sprite.revokeURL(image.src);
			done();
		};

		image.onerror = function() {
			sprite.revokeURL(image.src);
			assert.notOk(true, 'Image onerror fired');
		};

		image.src = sprite.createURL('smile.gif');
	});
});