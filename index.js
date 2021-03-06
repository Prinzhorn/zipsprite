var Blob = require('blob');
var createObjectURL = require('create-object-url');
var revokeObjectURL = require('revoke-object-url');

var ZipSprite = function(buffer) {
	this._buffer = buffer;
	this._view = new DataView(this._buffer);
	this._files = [];
	this._filesByName = {};
	this._URLCache = {};

	this._extractFileList();
};

ZipSprite.prototype._extractFileList = function() {
	var index = this._findCentralDirStartOffset();

	//Iterate over every central directory file header.
	while(this._view.getUint32(index, true) === 0x02014b50) {
		var fileNameLength = this._view.getUint16(index + 28, true);
		var extraFieldLength = this._view.getUint16(index + 30, true);
		var commentFieldLength = this._view.getUint16(index + 32, true);
		var localFileHeaderOffset = this._view.getUint32(index + 42, true);
		var fileName = String.fromCharCode.apply(String, new Uint8Array(this._buffer, index + 46, fileNameLength));

		this._extractFileEntry(localFileHeaderOffset, fileName);

		//Move to next file entry.
		index = index + 46 + fileNameLength + extraFieldLength + commentFieldLength;
	}
};

ZipSprite.prototype._findCentralDirStartOffset = function() {
	var endOfCentralDirSignatureIndex;

	//Walk backwards and find the end of central dir signature.
	for(endOfCentralDirSignatureIndex = this._view.byteLength - 5; endOfCentralDirSignatureIndex >= 0; endOfCentralDirSignatureIndex--) {
		if(this._view.getUint32(endOfCentralDirSignatureIndex, true) === 0x06054b50) {
			break;
		}
	}

	if(endOfCentralDirSignatureIndex === -1) {
		throw new Error('Could not find end of central directory signature (0x06054b50)');
	}

	return this._view.getUint32(endOfCentralDirSignatureIndex + 16, true);
};

ZipSprite.prototype._extractFileEntry = function(localFileHeaderOffset, centralDirFileName) {
	if(this._view.getUint32(localFileHeaderOffset, true) !== 0x04034b50) {
		throw new Error('Expected local file header signature (0x04034b50)');
	}

	var view = this._view;
	var compressedSize = view.getUint32(localFileHeaderOffset + 18, true);
	var fileNameLength = view.getUint16(localFileHeaderOffset + 26, true);
	var extraFieldLength = view.getUint16(localFileHeaderOffset + 28, true);
	var fileName = String.fromCharCode.apply(String, new Uint8Array(this._buffer, localFileHeaderOffset + 30, fileNameLength));
	var fileDataOffset = localFileHeaderOffset + 30 + fileNameLength + extraFieldLength;

	//The file name from the local file header does not match the name from the central dir.
	//https://github.com/Stuk/jszip/issues/251
	if(fileName !== centralDirFileName) {
		throw new Error('Invalid zip. The two file name entries "' + centralDirFileName + '" and "' + fileName + '" do not match.');
	}

	//Skip folders.
	if(fileName.slice(-1) === '/') {
		return;
	}

	this._files.push({
		name: fileName,
		offset: fileDataOffset,
		size: compressedSize
	});

	this._filesByName[fileName] = {
		offset: fileDataOffset,
		size: compressedSize
	};
};

ZipSprite.prototype.getFiles = function(filterFunction) {
	if(!filterFunction) {
		return this._files.slice(0);
	}

	return this._files.filter(function(file) {
		return filterFunction(file.name);
	});
};

ZipSprite.prototype.createURL = function(fileName) {
	var cachedURL = this._URLCache[fileName];
	var file;
	var view;
	var blob;

	if(cachedURL) {
		return cachedURL;
	}

	file = this._filesByName[fileName];

	if(!file) {
		throw new Error('The zip does not contain ' + fileName);
	}

	//We're using Uint8Array instead of DataView because IE.
	//https://gist.github.com/Prinzhorn/5a9d7db4e4fb9372b2e6
	view = new Uint8Array(this._buffer, file.offset, file.size);
	blob = new Blob([view], {type: 'application/octet-stream'});

	cachedURL = this._URLCache[fileName] = createObjectURL(blob);

	return cachedURL;
};

ZipSprite.prototype.revokeURL = function(fileName) {
	revokeObjectURL(this._URLCache[fileName]);
	delete this._URLCache[fileName];
};

module.exports = ZipSprite;