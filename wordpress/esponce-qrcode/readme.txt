=== Plugin Name ===
Contributors: avivo
Donate link: http://www.esponce.com/
Tags: qr code, generator, plugin, addon
Requires at least: 2.0.2
Tested up to: 2.1
Stable tag: 4.3

QR Code Generator for custom content. Uses esponce.com web service to generate QR Codes.

== Description ==

This WordPress plug-in uses Esponce API to generate a QR Code with custom content. Size, padding and color can be set through the parameters.

== Installation ==

This section describes how to install the plugin and get it working.

e.g.

1. Upload `esponce-qrcode` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Place `[qrcode content="your content goes here"]` in your templates

== Frequently Asked Questions ==

= What are the parameteres? =

Parameters:
* content - content to be encoded into QR Code, could be any text, hyperlink, vcard, etc.
* size - size of a QR Code module (size of a "pixel")
* padding - padding size in module units, aka quiet zone
* version - optional, QR Code version, value from 1-40 or leave empty to automatically determine the optimized value
* em - encode mode: byte (default), alphanumeric, numeric
* ec - error correction: L, M (default), H, Q
* foreground - foreground color, RGB hex #RRGGBB or with alpha transparency #AARRGGBB
* background - background color, RGB hex #RRGGBB or with alpha transparency #AARRGGBB

= Can I track a QR Code? =

If you are registered at esponce.com you can create a trackable QR Code and put [qrcode track="id"] in the blog post.
Parameter 'id' should be ID of a trackable code, e.g. http//goo.by/wjt1wR -> id = "wjt1wR" and thus [qrcode track="wjt1wR"]

== Changelog ==

= 1.0 =
* Insert a QR Code into blog post
* [qrcode] tag
