<?php
/*
Plugin Name: Esponce QR Code Generator
Plugin URI: http://code.google.com/p/qr-code-plugins/
Description: Generates a QR Code and inserts it into the blog.
Version: 1.0
Author: Esponce.com
Author URI: http://www.esponce.com/
License: MIT License
*/

/***** BEGIN MIT LICENSE BLOCK *****
 *
 * Copyright (C) 2012 Avivo d.o.o.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 ***** END MIT LICENCE BLOCK *****/

/**************************************************************************************//**
 * Generates QR Code URL
 ******************************************************************************************/
class QRCodeAPI
{
	public function getURL($content, $format = "png", $version = null, $size = null, $padding = null, $em = null, $ec = null, $foreground = null, $background = null, $attachment = false)
	{
		$query = "content=" . urlencode($content);
		if (!empty($format)) $query .= "&format=$format";
		if (!empty($version)) $query .= "&version=$version";
		if (!empty($size)) $query .= "&size=$size";
		if (!empty($padding)) $query .= "&padding=$padding";
		if (!empty($em)) $query .= "&em=$em";
		if (!empty($ec)) $query .= "&ec=$ec";
		if (!empty($foreground)) $query .= "&foreground=" . urlencode($foreground);
		if (!empty($background)) $query .= "&background=" . urlencode($background);
		if (!empty($attachment) && $attachment) $query .= "&attachment=true";
		$query .= "&source=wp";
		$url = "http://www.esponce.com/api/v3/generate?" . $query;
		return $url;
	}
	
	public function getShortLink($id)
	{
		return "http://goo.by/$id.png";
	}
}

/**************************************************************************************//**
 * Initialization
 ******************************************************************************************/
function esponce_init()
{
}

/**************************************************************************************//**
 * Shortcode sytnax: [qrcode content="" size="" padding="" foreground="" background=""]
 ******************************************************************************************/
function esponce_shortcode($atts)
{
	//Get attributes
	$definition = array
	(
		'content' => '',
		'format' => 'png',
		'version' => null,
		'padding' => null,
		'size' => null,
		'em' => null,
		'ec' => null,
		'foreground' => null,
		'background' => null,
		'track' => null,
		'cache' => 'true'
	);
		
	$a = shortcode_atts($definition, $atts);
	
	$content = $a['content'];
	$format = $a['format'];
	$version = $a['version'];
	$padding = $a['padding'];
	$size = $a['size'];
	$em = $a['em'];
	$ec = $a['ec'];
	$foreground = $a['foreground'];
	$background = $a['background'];
	$track = $a['track'];
	$cache = $a['cache'];

	//Build URL to QR Code image
	$api = new QRCodeAPI();
	
	$url = "";
	if (!empty($track))
	{
		//TODO: Return QR Code with logo
		$url = $api->getShortLink($track);
	}
	else
	{
		$url = $api->getURL($content, $format, $version, $size, $padding, $em, $ec, $foreground, $background);
	}
	
	//Download and store image locally
	if ($cache == 'true')
	{
		//TODO: Download and store image locally
	}
	
	//Build HTML image
	$html = "<img src=\"$url\" alt=\"$content\" title=\"$content\" class=\"esponce_qrcode\" />";

	//Return (and do not echo)
	return $html;
}

/**************************************************************************************//**
 * Adds features to TinyMCE editor
 ******************************************************************************************/
function esponce_tinymce_button($buttons)
{
    array_push($buttons, "separator", "inject_esponce_qrcode");
    return $buttons;
}

function esponce_tinymce_register($plugins)
{
	$url = plugins_url("esponce-qrcode/tinymce/plugin.js");
    $plugins["inject_esponce_qrcode"] = $url;
    return $plugins;
}

/**************************************************************************************//**
 * Attach functions to WordPress
 ******************************************************************************************/
add_action('init', 'esponce_init');
add_filter('mce_external_plugins', 'esponce_tinymce_register');
add_filter('mce_buttons', 'esponce_tinymce_button', 0);
add_shortcode('qrcode', 'esponce_shortcode');

?>