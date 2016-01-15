var xhr = require('xhr');
//var ZipSprite = require('../');

var zipFiles = [
	{
		size: 367,
		name: 'all.7zip.zip'
	},
	{
		size: 273,
		name: 'all.windows.zip'
	},
	{
		size: 367,
		name: 'all.zip'
	},
	{
		size: 153,
		name: 'archive_comment.zip'
	},
	{
		size: 130,
		name: 'backslash.zip'
	},
	{
		size: 196,
		name: 'data_descriptor.zip'
	},
	{
		size: 189,
		name: 'deflate.zip'
	},
	{
		size: 156,
		name: 'encrypted.zip'
	},
	{
		size: 180,
		name: 'extra_attributes.zip'
	},
	{
		size: 112,
		name: 'folder.zip'
	},
	{
		size: 157,
		name: 'image.zip'
	},
	{
		size: 400,
		name: 'nested_data_descriptor.zip'
	},
	{
		size: 368,
		name: 'nested.zip'
	},
	{
		size: 564,
		name: 'nested_zip64.zip'
	},
	{
		size: 209,
		name: 'pile_of_poo.zip'
	},
	{
		size: 139,
		name: 'slashes_and_izarc.zip'
	},
	{
		size: 210,
		name: 'store.zip'
	},
	{
		size: 222,
		name: 'subfolder.zip'
	},
	{
		size: 128,
		name: 'text.zip'
	},
	{
		size: 122,
		name: 'utf8_in_name.zip'
	},
	{
		size: 124,
		name: 'utf8.zip'
	},
	{
		size: 154,
		name: 'winrar_utf8_in_name.zip'
	},
	{
		size: 288,
		name: 'zip64.zip'
	},
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
			assert.equal(buffer.byteLength, file.size);
			done();
		});
	});
});