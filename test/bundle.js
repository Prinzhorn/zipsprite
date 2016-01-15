(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var createObjectURL = require('create-object-url');

var ZipSprite = function(buffer) {
	var view = new DataView(buffer);
	var endOfCentralDirSignatureIndex;
	var centralDirStartOffset;
	var index;
	var files = [];

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

		files.push({
			name: fileName,
			//offset: localFileHeaderOffset,
			size: compressedSize
		});
	}

	//TODO: 37 is a magic number and only works when filename is 7 (like 001.jpg) and "extra field" is 0 bytes.
	/*
	var view = new Uint8Array(buffer, files[0].offset + 37, files[0].size);
	var blob = new Blob([view]);
	var image = document.createElement('img');
	image.src = createObjectURL(blob);
	document.body.appendChild(image);
	*/

	this.files = files;
};

module.exports = ZipSprite;
},{"create-object-url":2}],2:[function(require,module,exports){
var createObjectURL;

if(self.URL) {
	createObjectURL = URL.createObjectURL.bind(URL);
} else if(self.webkitURL) {
	createObjectURL = webkitURL.createObjectURL.bind(webkitURL);
} else {
	createObjectURL = function() {
		return '';
	};
}

module.exports = createObjectURL;
},{}],3:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":5}],4:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],5:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],6:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":3,"trim":7}],7:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],8:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":4,"is-function":5,"once":9,"parse-headers":6,"xtend":10}],9:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],10:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],11:[function(require,module,exports){
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
},{"../":1,"xhr":8}]},{},[11]);
