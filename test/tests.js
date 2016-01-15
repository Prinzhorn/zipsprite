var xhr = require('xhr');
var minimatch = require("minimatch")

var ZipSprite = require('../');

var globFilter = function(pattern) {
	return function(path) {
		return minimatch(path, pattern);
	};
};

var zipFiles = [
	{
		name: 'all.7zip.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			},
			{
				name: 'images/smile.gif',
				size: 41
			}
		],
		filtered: {
			filter: globFilter('images/*'),
			files: [
				{
					name: 'images/smile.gif',
					size: 41
				}
			]
		}
	},
	{
		name: 'all.windows.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			},
			{
				name: 'images/smile.gif',
				size: 37
			}
		],
		filtered: {
			filter: globFilter('*'),
			files: [
				{
					name: 'Hello.txt',
					size: 12
				}
			]
		}
	},
	{
		name: 'all.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			},
			{
				name: 'images/smile.gif',
				size: 41
			}
		],
		filtered: {
			filter: globFilter('*.txt'),
			files: [
				{
					name: 'Hello.txt',
					size: 12
				}
			]
		}
	},
	{
		name: 'archive_comment.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	},
	{
		name: 'backslash.zip',
		files: [
			{
				name: 'Hel\\lo.txt',
				size: 12
			}
		]
	},
	{
		name: 'data_descriptor.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	},
	{
		name: 'deflate.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 73
			}
		]
	},
	{
		name: 'encrypted.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 24
			}
		]
	},
	{
		name: 'extra_attributes.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
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
				size: 41
			}
		]
	},
	{
		name: 'nested_data_descriptor.zip',
		files: [
			{
				name: 'data_descriptor.zip',
				size: 196
			}
		]
	},
	{
		name: 'nested.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			},
			{
				name: 'zip_within_zip.zip',
				size: 128
			}
		]
	},
	{
		name: 'slashes_and_izarc.zip',
		files: [
			{
				name: 'test\\Hello.txt',
				size: 13
			}
		]
	},
	{
		name: 'store.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 94
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
				size: 12
			}
		]
	}
];

//Test that the file list of every zip can be read (file name, offset from start and size).
zipFiles.forEach(function(file) {
	QUnit.test(file.name, function(assert) {
		var done = assert.async();
		var options = {
			url: 'zip/' + file.name,
			method: 'GET',
			responseType: 'arraybuffer'
		};

		xhr(options, function(err, response, buffer) {
			var sprite = new ZipSprite(buffer);
			assert.deepEqual(sprite.getFiles(), file.files);

			//Test if we can get a filtered list of files, e.g. subfolders.
			if(file.filtered) {
				assert.deepEqual(sprite.getFiles(file.filtered.filter), file.filtered.files);
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
			done();
		};

		image.onerror = function() {
			assert.notOk(true, 'Image onerror fired');
		};

		image.src = sprite.createURL('smile.gif');
	});
});