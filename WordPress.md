# Note #
The WordPress plugin will no longer be updated in Google Code repository. **Latest version** is available on the [official WordPress plugin](http://wordpress.org/extend/plugins/esponce-qr-code-generator/) site.

# Introduction #

This WordPress plug-in uses Esponce API to generate a QR Code with custom content. Size, padding and color can be set through the parameters.

# Installation #
1. Upload **esponce-qrcode** folder to the **/wp-content/plugins/** directory

2. Activate the plugin through the **Plugins** menu in WordPress
<a href='Hidden comment: http://www.esponce.com/Uploaded/Blog/wordpress-enable.png'></a>

3. Click on the QR Code icon in editor or place the syntax in your blog post
```
[qrcode content="your content goes here" size="8" padding="4"]
```

# Parameters #
  * **content** - content to be encoded into QR Code, could be any text, hyperlink, vcard, etc.
  * **size** - size of a QR Code module (size of a "pixel")
  * **padding** - padding size in module units, aka quiet zone
  * **version** - optional, QR Code version, value from 1-40 or leave empty to automatically determine the optimized value
  * **em** - encode mode: byte (default), alphanumeric, numeric
  * **ec** - error correction: L, M (default), H, Q
  * **foreground** - foreground color, RGB hex #RRGGBB or with alpha transparency #AARRGGBB
  * **background** - background color, RGB hex #RRGGBB or with alpha transparency #AARRGGBB

# Screenshot #
Version 1.0 on WordPress 3.0
![http://www.esponce.com/Uploaded/Blog/wordpress-syntax.png](http://www.esponce.com/Uploaded/Blog/wordpress-syntax.png)

Version 1.2 on WordPress 3.3.2, available on the [WordPress plugin](http://wordpress.org/extend/plugins/esponce-qr-code-generator/) site
![http://www.esponce.com/Uploaded/Blog/wordpress-dialog.png](http://www.esponce.com/Uploaded/Blog/wordpress-dialog.png)