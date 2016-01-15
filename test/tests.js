var xhr = require('xhr');
var ZipSprite = require('../');

var zipFiles = [
	{
		size: 367,
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
		]
	},
	{
		size: 273,
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
		]
	},
	{
		size: 367,
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
		]
	},
	{
		size: 153,
		name: 'archive_comment.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	},
	{
		size: 130,
		name: 'backslash.zip',
		files: [
			{
				name: 'Hel\\lo.txt',
				size: 12
			}
		]
	},
	{
		size: 196,
		name: 'data_descriptor.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	},
	{
		size: 189,
		name: 'deflate.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 73
			}
		]
	},
	{
		size: 156,
		name: 'encrypted.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 24
			}
		]
	},
	{
		size: 180,
		name: 'extra_attributes.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	},
	{
		size: 112,
		name: 'folder.zip',
		files: []
	},
	{
		size: 157,
		name: 'image.zip',
		files: [
			{
				name: 'smile.gif',
				size: 41
			}
		]
	},
	{
		size: 400,
		name: 'nested_data_descriptor.zip',
		files: [
			{
				name: 'data_descriptor.zip',
				size: 196
			}
		]
	},
	{
		size: 368,
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
		size: 139,
		name: 'slashes_and_izarc.zip',
		files: [
			{
				name: 'test\\Hello.txt',
				size: 13
			}
		]
	},
	{
		size: 210,
		name: 'store.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 94
			}
		]
	},
	{
		size: 222,
		name: 'subfolder.zip',
		files: []
	},
	{
		size: 128,
		name: 'text.zip',
		files: [
			{
				name: 'Hello.txt',
				size: 12
			}
		]
	}
];

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
			assert.equal(buffer.byteLength, file.size);
			assert.deepEqual(sprite.files, file.files);

			done();
		});
	});
});