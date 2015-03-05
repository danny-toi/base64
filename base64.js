'use strict';

function StringBuffer() {
    this.buffer = [];
}

StringBuffer.prototype.append = function(string) {
    this.buffer.push(string);
    return this;
};

StringBuffer.prototype.toString = function() {
    return this.buffer.join('');
};

function Utf8EncodeEnumerator(input) {
    this._input = input;
    this._index = -1;
    this._buffer = [];
}

Utf8EncodeEnumerator.prototype = {

    current: Number.NaN,

    moveNext: function() {
        if (this._buffer.length > 0) {
            this.current = this._buffer.shift();
            return true;
        }

        if (this._index >= (this._input.length - 1)) {
            this.current = Number.NaN;
            return false;
        }

        var charCode = this._input.charCodeAt(++this._index);

        if ((charCode == 13) && (this._input.charCodeAt(this._index + 1) == 10)) {
            charCode = 10;
            this._index += 2;
        }

        if (charCode < 128) {
            this.current = charCode;
        } else if ((charCode > 127) && (charCode < 2048)) {
            this.current = (charCode >> 6) | 192;
            this._buffer.push((charCode & 63) | 128);
        } else {
            this.current = (charCode >> 12) | 224;
            this._buffer.push(((charCode >> 6) & 63) | 128);
            this._buffer.push((charCode & 63) | 128);
        }

        return true;
    }
};

function Base64DecodeEnumerator(input) {
    this._input = input;
    this._index = -1;
    this._buffer = [];
}

Base64DecodeEnumerator.prototype = {

    current: 64,

    moveNext: function() {
        if (this._buffer.length > 0) {
            this.current = this._buffer.shift();
            return true;
        }

        if (this._index >= (this._input.length - 1)) {
            this.current = 64;
            return false;
        }

        var enc1 = Base64.codex.indexOf(this._input.charAt(++this._index)),
            enc2 = Base64.codex.indexOf(this._input.charAt(++this._index)),
            enc3 = Base64.codex.indexOf(this._input.charAt(++this._index)),
            enc4 = Base64.codex.indexOf(this._input.charAt(++this._index));

        var chr1 = (enc1 << 2) | (enc2 >> 4),
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2),
            chr3 = ((enc3 & 3) << 6) | enc4;

        this.current = chr1;

        if (enc3 != 64) {
            this._buffer.push(chr2);
        }

        if (enc4 != 64) {
            this._buffer.push(chr3);
        }

        return true;
    }
};

var Base64 = {

    codex: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function(input) {

        var output = new StringBuffer(),
            enumerator = new Utf8EncodeEnumerator(input),
            chr1, chr2, chr3,
            enc1, enc2, enc3, enc4;

        while (enumerator.moveNext()) {
            chr1 = enumerator.current;

            enumerator.moveNext();
            chr2 = enumerator.current;

            enumerator.moveNext();
            chr3 = enumerator.current;

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output.append(this.codex.charAt(enc1) + this.codex.charAt(enc2) + this.codex.charAt(enc3) + this.codex.charAt(enc4));
        }

        return output.toString();
    },

    decode: function(input) {
        var output = new StringBuffer(),
            enumerator = new Base64DecodeEnumerator(input),
            charCode, charCode2, charCode3;

        while (enumerator.moveNext()) {
            charCode = enumerator.current;

            if (charCode < 128) {
                output.append(String.fromCharCode(charCode));
            } else if ((charCode > 191) && (charCode < 224)) {
                enumerator.moveNext();
                charCode2 = enumerator.current;
                output.append(String.fromCharCode(((charCode & 31) << 6) | (charCode2 & 63)));
            } else {
                enumerator.moveNext();
                charCode2 = enumerator.current;

                enumerator.moveNext();
                charCode3 = enumerator.current;

                output.append(String.fromCharCode(((charCode & 15) << 12) | ((charCode2 & 63) << 6) | (charCode3 & 63)));
            }
        }

        return output.toString();
    }
};
