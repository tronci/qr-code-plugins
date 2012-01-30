#!/usr/bin/env python
# -*- coding: UTF-8 -*-

# QR Code Generator plug-in for Blender 2.5.7+
# plug-in version: 1.0
# provided by Esponce team
# http://www.esponce.com/

# ***** BEGIN MIT LICENSE BLOCK *****
#
# Copyright (C) 2012 Avivo d.o.o.
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

bl_info = {
    "name": "QR Code",
    "author": "Esponce.com",
    "version": (1,0),
    "blender": (2, 5, 7),
    "api": 35853,
    "location": "View3D > Add > Mesh",
    "description": "Adds a QR Code mesh to the Add Mesh menu. Requires internet connection to generate a QR Code pattern.",
    "warning": "",
    "wiki_url": "http://code.google.com/p/qr-code-plugins",
    "tracker_url": "http://code.google.com/p/qr-code-plugins",
    "category": "Add Mesh"}
    
#******************************************************************************************
# Notes:
# * What is QR Code? See http://www.esponce.com/about-qr-codes
# * Press SHIFT+A and select Add Mesh > QR Code
# * Requires internet connection to generate a QR Code pattern.
# * Set properties then check the 'Construct' checkbox. Cannot preview changes in real time
#   due to internet connection (Blender may slow down or server may block IP on mass request).
# * Tested on Windows 7, Blender 2.57.1, Python 3.2 (bundled), all 64-bit
# * I haven't found a solution to separate mesh into cubes in Python. This can be done
#   in GUI by going into Edit Mode, press P key and select 'By loose parts'.
# * Also had some problems finding button element, so 'Construct' checkbox is used instead.
# * QR Code is registered trademark of DENSO WAVE INCORPORATED
#
# Install:
# * Copy this file in the directory with other scripts. In Windows:
#     %appdata%\Blender Foundation\Blender\2.57\scripts\addons
# * Open Blender > File > User Preferences (CTRL+ALT+U) > Add-Ons (tab) > Add Mesh (left)
# * Check the add-on named "Add Mesh: QR Code". If the add-on does not get activated check System Console.
#
# Debug:
# * Open Blender > Help > Toggle System Console to display log 
#******************************************************************************************

import bpy
from bpy.props import *

import http.client
import urllib
import urllib.request
from urllib import *

import xml.etree.ElementTree
from xml.etree.ElementTree import ElementTree

import mathutils
from mathutils import *

import platform

#******************************************************************************************
# Creates a new mesh.
#******************************************************************************************
def create_mesh_object(context, verts, edges, faces, name):
    
    # Create new mesh
    mesh = bpy.data.meshes.new(name)

    # Make a mesh from a list of verts/edges/faces.
    mesh.from_pydata(verts, edges, faces)

    # Update mesh geometry after adding stuff.
    mesh.update()

    # Blender 2.58
    #from bpy_extras.object_utils import object_data_add
    #return object_data_add(context, mesh, operator=None)

    # Blender 2.57
    import add_object_utils
    return add_object_utils.object_data_add(context, mesh, operator=None)

#******************************************************************************************
# Calls the Esponce QR Code web service to generate a SVG image.
#******************************************************************************************
def qrcode_generate(content, size = 8, padding = 4, version = "", em = "byte", ec = "M"):
    
    attribs = {
        'content': content,
        'size': size,
        'padding': padding,
        'em': em,
        'ec': ec,
        'format': 'svg',
        'source': 'blender'
    }
    
    if int(version) > 0:
        attribs['version'] = version
    
    headers = {
        #User-Agent: QRCode/3.0 (Windows 7; Blender 2.57; Python 3.2.0; U; en)
        "User-Agent": "QRCode/3.0 (%s %s; Blender %s; Python %s; U; en)" % (platform.system(), platform.release(), bpy.app.version_string, platform.python_version()),
        "Accept":"text/plain"
    }
    
    query = urllib.parse.urlencode(attribs)
    url = "http://www.esponce.com/api/v3/generate?%s" % query
    print("QR Code request: " + url)
    
    result = ""
    
    try:
        request = urllib.request.Request(url, headers = headers)
        f = urllib.request.urlopen(request)
        #f = urllib.request.urlopen(url)
        print("QR Code response: success")
        result = f.read()
    except urllib.error.HTTPError as e:
        print("QR Code response: ", e.code)
    except urllib.error.URLError as e:
        print("QR Code response: ", e.reason)
    
    return result
    
#******************************************************************************************
# Open SVG image of QR Code from the disk.
#******************************************************************************************
def qrcode_open(path):
    file = open(path, "r")
    qrcode = file.read()
    file.close()
    return qrcode
    
#******************************************************************************************
# Create QR Code vertices and faces
#******************************************************************************************
def add_qrcode(content, size = 8, padding = 4, version = 0, em = "byte", ec = "M", quads = True, extrude = True, join = True):
    
    i = 0
    z = 0.0
    verts = []
    faces = []
    
    # Generate QR Code matrix
    try:
        #qrcode = qrcode_open("d:\share\sample.svg")
        qrcode = qrcode_generate(content, size, padding, version, em, ec)
    except:
        # Exception when no internet connection?
        print("Check if internet connection is available.")
        return verts, faces
    
    # Handle SVG content as XML document
    root = xml.etree.ElementTree.XML(qrcode)
    xmlns = "{http://www.w3.org/2000/svg}"

    # Set scale factor, original values are too large for 3D view
    factor = 0.01
    
    # <svg width="256" height="256" ...
    width = float(root.attrib["width"]) * factor
    height = float(root.attrib["height"]) * factor
    
    # Calculate offset, so the object center point is actually in center
    whalf = width / 2
    hhalf = height / 2
    
    # For each 'rect' tag...
    modules = list(root.getiterator(xmlns + "rect"))
    for m in modules:
        
        # <rect x="32" y="32" width="8" height="8" style="fill:rgb(0,0,0);" />
        x = float(m.attrib["x"]) * factor - whalf
        y = hhalf - float(m.attrib["y"]) * factor
        w = float(m.attrib["width"]) * factor
        h = float(m.attrib["height"]) * factor
        
        # Check if module rectangle (not background rectangle)
        if int(m.attrib["width"]) == size and int(m.attrib["height"]) == size:
            
            zoffset = 0
            if extrude: zoffset = -w/2
            
            # Lower layer
            verts.append(Vector((x + 0, y + 0, z + zoffset)))
            verts.append(Vector((x + w, y + 0, z + zoffset)))
            verts.append(Vector((x + w, y + h, z + zoffset)))
            verts.append(Vector((x + 0, y + h, z + zoffset)))
            
            # Upper layer
            if extrude:
                verts.append(Vector((x + 0, y + 0, z + w + zoffset)))
                verts.append(Vector((x + w, y + 0, z + w + zoffset)))
                verts.append(Vector((x + w, y + h, z + w + zoffset)))
                verts.append(Vector((x + 0, y + h, z + w + zoffset)))
                
            # Number of vertices per QR Code module
            vertices = 4
            if extrude: vertices = 8
            
            # Start: index of first new vertex
            s = i * vertices
            
            # Quads
            if quads:
                if extrude:
                    # Bottom and top - normals point out
                    faces.append([s + 3, s + 2, s + 1, s + 0])
                    faces.append([s + 4, s + 5, s + 6, s + 7])
                
                    # Between top and bottom - normals point out
                    faces.append([s + 0, s + 1, s + 5, s + 4])
                    faces.append([s + 1, s + 2, s + 6, s + 5])
                    faces.append([s + 2, s + 3, s + 7, s + 6])
                    faces.append([s + 3, s + 0, s + 4, s + 7])
                else:
                    # Bottom - normals point up
                    faces.append([s + 0, s + 1, s + 2, s + 3])
                    
            # Triangles
            else:
                if extrude:
                    # Bottom and top - normals point out
                    faces.append([s + 2, s + 1, s + 0])
                    faces.append([s + 3, s + 2, s + 0])
                    faces.append([s + 4, s + 5, s + 6])
                    faces.append([s + 4, s + 6, s + 7])
                    
                    # Between top and bottom - normals point out
                    faces.append([s + 0, s + 1, s + 5])
                    faces.append([s + 0, s + 5, s + 4])
                    faces.append([s + 1, s + 2, s + 6])
                    faces.append([s + 1, s + 6, s + 5])
                    faces.append([s + 2, s + 3, s + 7])
                    faces.append([s + 2, s + 7, s + 6])
                    faces.append([s + 3, s + 0, s + 4])
                    faces.append([s + 3, s + 4, s + 7])
                    
                else:
                    # Bottom - normals point up
                    faces.append([s + 0, s + 1, s + 2])
                    faces.append([s + 0, s + 2, s + 3])
                    
            # Increment loop counter
            i = i + 1

    return verts, faces

#******************************************************************************************
# Class definition
#******************************************************************************************
class AddQRCode(bpy.types.Operator):
    # Add a QR Code mesh
    bl_idname = "mesh.primitive_qrcode"
    bl_label = "Add QR Code"
    bl_options = {'REGISTER', 'UNDO'}

    #******************************************************************************************
    # Properties
    #******************************************************************************************
    
    # Work-around for button, 'Construct' is automatically unchecked after render
    construct = bpy.props.BoolProperty(name="Construct", description="Generate the object. Note: set other properties first then check this box to create a mesh.", default = True)
    
    content = bpy.props.StringProperty(name="Content", description="Content to be encoded in QR Code.", default="Lorem Ipsum")
    module_size = bpy.props.IntProperty(name="Module Size", description="Size of a single rectangle in QR Code.", min=1, max=20, default=8)
    padding = bpy.props.IntProperty(name="Padding", description="Offset from the bounds.", min=0, max=10, default=4)
    
    vlist = [
        ("0", "Auto", "Auto"),
        ("1", "1", "1"),
        ("2", "2", "2"),
        ("3", "3", "3"),
        ("4", "4", "4"),
        ("5", "5", "5"),
        ("6", "6", "6"),
        ("7", "7", "7"),
        ("8", "8", "8"),
        ("9", "9", "9"),
        ("10", "10", "10"),
        ("11", "11", "11"),
        ("12", "12", "12"),
        ("13", "13", "13"),
        ("14", "14", "14"),
        ("15", "15", "15"),
        ("16", "16", "16"),
        ("17", "17", "17"),
        ("18", "18", "18"),
        ("19", "19", "19"),
        ("20", "20", "20"),
        ("21", "21", "21"),
        ("22", "22", "22"),
        ("23", "23", "23"),
        ("24", "24", "24"),
        ("25", "25", "25"),
        ("26", "26", "26"),
        ("27", "27", "27"),
        ("28", "28", "28"),
        ("29", "29", "29"),
        ("30", "30", "30"),
        ("31", "31", "31"),
        ("32", "32", "32"),
        ("33", "33", "33"),
        ("34", "34", "34"),
        ("35", "35", "35"),
        ("36", "36", "36"),
        ("37", "37", "37"),
        ("38", "38", "38"),
        ("39", "39", "39"),
        ("40", "40", "40")
    ]
    # debug, temporary until API accepts 0 or -1 as 'Auto'
    version = bpy.props.EnumProperty(items=vlist, name="Version", description="Version defines a capacity factor in QR Code. Use 'Auto' if not sure.", default="0")
    
    emlist = [
        ("byte", "Byte", "Byte"),
        ("alphanumeric", "Alphanumeric", "Alphanumeric"),
        ("numeric", "Numeric", "Numeric")
    ]
    em = bpy.props.EnumProperty(items=emlist, name="Encode Mode", description="Optimize QR Code with encoding if content contains numbers or letters. Use 'Byte' if not sure.", default="byte")
    
    eclist = [
        ("L", "L", "L"),
        ("M", "M", "M"),
        ("H", "H", "H"),
        ("Q", "Q", "Q")
    ]
    ec = bpy.props.EnumProperty(items=eclist, name="Error Correction", description="Defines recovery chances if QR Code is damaged or dirty. Use 'M' if not sure.", default="M")
    
    quads = bpy.props.BoolProperty(name="Quads", description="A value indicating whether to created quads of triangles.", default=True)
    extrude = bpy.props.BoolProperty(name="Extrude", description="Enable to extrude blocks to 3D otherwise keep it flat 2D.", default=True)
    #join = bpy.props.BoolProperty(name="Join Modules", description="Join all blocks into one mesh.", default=True)
    join = True

    #******************************************************************************************
    # Override GUI rendering
    #******************************************************************************************
    def _draw(self, context):
        layout = self.layout

        box = layout.box()
        box.prop(self, 'construct')

        # Properties
        box = layout.box()
        box.label(text='Properties')
        box.prop(self, 'content')
        box.prop(self, 'module_size')
        box.prop(self, 'padding')
        box.prop(self, 'version')
        box.prop(self, 'em')
        box.prop(self, 'ec')
        
        # Mesh options
        box = layout.box()
        box.label(text='Mesh')
        box.prop(self, 'quads')
        box.prop(self, 'extrude')
        #box.prop(self, 'join')

    #******************************************************************************************
    # Execute
    #******************************************************************************************
    def execute(self, context):
        
        # Check if preview is enabled or not
        if not self.properties.construct: return ('FINISHED')
        
        # Create a QR Code mesh
        verts, faces = add_qrcode(self.content, self.module_size, self.padding, self.version, self.em, self.ec, self.quads, self.extrude, self.join)
        obj = create_mesh_object(context, verts, [], faces, "QRCode")
        
        # Automatically uncheck 'Construct'
        self.construct = False
        
        return {'FINISHED'}


#******************************************************************************************
# Add feature to the menu
#******************************************************************************************
def menu_func(self, context):
    self.layout.operator(AddQRCode.bl_idname, text="QR Code", icon='PLUGIN')


def register():
    bpy.utils.register_module(__name__)
    bpy.types.INFO_MT_mesh_add.append(menu_func)


def unregister():
    bpy.utils.unregister_module(__name__)
    bpy.types.INFO_MT_mesh_add.remove(menu_func)

if __name__ == "__main__":
    register()
