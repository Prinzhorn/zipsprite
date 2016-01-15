var Blob = require('blob');
var createObjectURL = require('create-object-url');

var ZipSprite = function(buffer) {
	this._buffer = buffer;
	this._view = new DataView(this._buffer);
	this._files = [];
	this._filesByName = {};

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

		this._extractFileEntry(localFileHeaderOffset);

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

ZipSprite.prototype._extractFileEntry = function(localFileHeaderOffset) {
	if(this._view.getUint32(localFileHeaderOffset, true) !== 0x04034b50) {
		throw new Error('Expected local file header signature (0x04034b50)');
	}

	var view = this._view;
	var compressedSize = view.getUint32(localFileHeaderOffset + 18, true);
	var fileNameLength = view.getUint16(localFileHeaderOffset + 26, true);
	var extraFieldLength = view.getUint16(localFileHeaderOffset + 28, true);
	var fileName = String.fromCharCode.apply(String, new Uint8Array(this._buffer, localFileHeaderOffset + 30, fileNameLength));
	var fileDataOffset = localFileHeaderOffset + 30 + fileNameLength + extraFieldLength;

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