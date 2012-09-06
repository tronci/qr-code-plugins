#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# QR Code Generator plug-in for Inkscape 0.48
# plug-in version: 1.1
# provided by Esponce team
# http://www.esponce.com/

# Install: copy .inx and .py files to your Inkscape share\extensions directory
# Use: open Inkscape and select in menu: Extensions > Render > Barcode - QR Code...

# ***** BEGIN MIT LICENSE BLOCK *****
#
# Copyright (C) 2012 Esponce d.o.o.
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy of
# this software and associated documentation files (the "Software"), to deal in
# the Software without restriction, including without limitation the rights to
# use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
# of the Software, and to permit persons to whom the Software is furnished to do
# so, subject to the following conditions:
# 
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.
#
# ***** END MIT LICENCE BLOCK *****

import inkex

import urllib
import httplib
from StringIO import StringIO
from xml.etree.ElementTree import ElementTree

import platform

import gettext
_ = gettext.gettext
    
#******************************************************************************************
# Generates a SVG rectangle element representing a QR Code module.
#******************************************************************************************
def qrcode_draw_module((w,h), (x,y), style, parent):

    attribs = {
        'x'         : str(x),
        'y'         : str(y),
        'width'     : str(w),
        'height'    : str(h),
        'style'     : style
    }
    
    inkex.etree.SubElement(parent, inkex.addNS('rect','svg'), attribs)
    
#******************************************************************************************
# Calls the Esponce QR Code web service to generate a SVG image.
#******************************************************************************************
def qrcode_generate(content, size, padding, version, em, ec):

    attribs = {
        'content': content,
        'size': size,
        'padding': padding,
        'em': em,
        'ec': ec,
        'format': 'svg',
        'source': 'inkscape'
    }
    
    if version > 0:
        attribs['version'] = version
    
    headers = {
        #User-Agent: QRCode/3.0 (Windows 7; Inkscape; Python 2.7.2; U; en)
        "User-Agent": "QRCode/3.0 (%s %s; Inkscape; Python %s; U; en)" % (platform.system(), platform.release(), platform.python_version()),
        "Accept":"text/plain"
    }
    
    # Make a request to server to generate a vector QR Code
    con = httplib.HTTPConnection("www.esponce.com")
    query = urllib.urlencode(attribs)
    con.request("GET", "/api/v3/generate?%s" % query, None, headers)
    
    response = con.getresponse()
    if response.status == 200:
        result = response.read()
    else:
        inkex.errormsg(_('Error during the progress. Please check parameters.'))
    con.close()
    return result
    
#******************************************************************************************
# Generates and renders a QR Code image to the workspace.
#******************************************************************************************
def qrcode_render(content, size, padding, version, em, ec, newline, parent):
    
    if newline:
        content = content.replace("\\n", "\n")
        content = content.replace("\\r", "\r")
    
    # Generate QR Code - call web service
    qrcode = qrcode_generate(content, size, padding, version, em, ec)
    #if not result:
    #    return
    
    # Parse SVG and draw elements to the workspace
    tree = ElementTree()
    tree.parse(StringIO(qrcode))
    root = tree.getroot()
    xmlns = "{http://www.w3.org/2000/svg}"
    modules = list(root.getiterator(xmlns + "rect"))
    for m in modules:
        # <rect x="32" y="32" width="8" height="8" style="fill:rgb(0,0,0);" />
        x = m.attrib["x"]
        y = m.attrib["y"]
        w = m.attrib["width"]
        h = m.attrib["height"]
        style = m.attrib["style"]
        qrcode_draw_module((w,h), (x,y), style, parent)

#******************************************************************************************
# Reference: http://wiki.inkscape.org/wiki/index.php/PythonEffectTutorial
#******************************************************************************************            
class QRCode(inkex.Effect):
    def __init__(self):
        inkex.Effect.__init__(self)
        
        # Get options
        self.OptionParser.add_option("--content", action="store", type="string", dest="CONTENT", default='Inkscapes')
        self.OptionParser.add_option("--size", action="store", type="int", dest="SIZE", default=8)
        self.OptionParser.add_option("--padding", action="store", type="int", dest="PADDING", default=4)
        self.OptionParser.add_option("--version", action="store", type="string", dest="VERSION", default='')
        self.OptionParser.add_option("--em", action="store", type="string", dest="EM", default='byte')
        self.OptionParser.add_option("--ec", action="store", type="string", dest="EC", default='M')
        self.OptionParser.add_option("--newline", action="store", type="inkbool",  dest="NEWLINE", default='true')
            
    def effect(self):
        
        so = self.options
        
        # Check required parameters
        if so.CONTENT == '':
            inkex.errormsg(_('Please enter some content.'))
        else:
            # Create an element group in Inkscape
            transform = 'translate' + str(self.view_center)
            attribs = { inkex.addNS('label','inkscape'): 'QRCode', 'transform': transform }
            group = inkex.etree.SubElement(self.current_layer, 'g', attribs)
            
            # Render QR Code to the workspace
            qrcode_render(so.CONTENT, so.SIZE, so.PADDING, so.VERSION, so.EM, so.EC, so.NEWLINE, group)
            
            
if __name__ == '__main__':
    e = QRCode()
    e.affect()
