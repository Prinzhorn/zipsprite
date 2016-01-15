var Blob = require('blob');
var createObjectURL = require('create-object-url');

var ZipSprite = function(buffer) {
	this._buffer = buffer;

	var view = new DataView(buffer);
	var endOfCentralDirSignatureIndex;
	var centralDirStartOffset;
	var index;
	var filesList = [];
	var filesByName = {};

	//Walk backwards and find the end of central dir signature.
	for(endOfCentralDirSignatureIndex = view.byteLength - 5; endOfCentralDirSignatureIndex >= 0; endOfCentralDirSignatureIndex--) {
		if(view.getUint32(endOfCentralDirSignatureIndex, true) === 0x06054b50) {
			break;
		}
	}

	if(endOfCentralDirSignatureIndex === -1) {
		throw new Error('Could not find end of central directory signature (0x06054b50)');
		return;
	}

	centralDirStartOffset = view.getUint32(endOfCentralDirSignatureIndex + 16, true);

	index = centralDirStartOffset;

	//Now we know where the central dir starts. List all filenames.
	while(view.getUint32(index, true) === 0x02014b50) {
		var compressedSize = view.getUint32(index + 20, true);
		var uncompressedSize = view.getUint32(index + 24, true);
		var fileNameLength = view.getUint16(index + 28, true);
		var extraFieldLength = view.getUint16(index + 30, true);
		var commentFieldLength = view.getUint16(index + 32, true);
		var localFileHeaderOffset = view.getUint32(index + 42, true);
		var fileName = String.fromCharCode.apply(String, new Uint8Array(buffer, index + 46, fileNameLength));

		//Move to next file entry.
		index = index + 46 + fileNameLength + extraFieldLength + commentFieldLength;

		//Skip folders.
		if(fileName.slice(-1) === '/') {
			continue;
		}

		filesList.push({
			name: fileName,
			//offset: localFileHeaderOffset,
			size: compressedSize
		});

		filesByName[fileName] = {
			offset: localFileHeaderOffset + 39,
			size: compressedSize
		};
	}

	//TODO: 37 is a magic number and only works when filename is 7 (like 001.jpg) and "extra field" is 0 bytes.
	/*
	var view = new Uint8Array(buffer, filesList[0].offset + 37, filesList[0].size);
	var blob = new Blob([view]);
	var image = document.createElement('img');
	image.src = createObjectURL(blob);
	document.body.appendChild(image);
	*/

	this._files = filesList;
	this._filesByName = filesByName;
};

ZipSprite.prototype.getFiles = function(filterExpression) {
	if(!filterExpression) {
		return this._files.slice(0);
	}

	return this._files.filter(function(file) {
		return filterExpression.test(file.name);
	});
};

ZipSprite.prototype.createURL = function(fileName) {
	var file = this._filesByName[fileName];
	var view;
	var blob;

	if(!file) {
		throw new Error('The zip does not contain ' + fileName);
	}

	view = new Uint8Array(this._buffer, file.offset, file.size);
	blob = new Blob([view]);

	return createObjectURL(blob);
};

module.exports = ZipSprite;