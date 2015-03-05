Base64 encoding and decoding
====================

  The library to create a base-64 encoded string and decode a string of data which has been encoded using base-64 encoding.

  *Licensed under the [MIT license](http://www.opensource.org/licenses/mit-license.php).*

Examples
--------

```javascript
var string = 'This is a plain text.',
    encoded = Base64.encode(string),
    decoded = Base64.decode(encoded);
console.log(encoded == 'VGhpcyBpcyBhIHBsYWluIHRleHQu');
console.log(decoded == string);
```
