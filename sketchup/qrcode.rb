# QR Code Generator plug-in for SketchUp 8
# plug-in version: 1.0
# provided by Esponce team
# http://www.esponce.com/

# Install: copy .html and .rb files to your SketchUp plugins directory
# Use: open SketchUp and select in menu: Draw > QR Code

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

require 'sketchup.rb'

# Sketchup.version

def create_qrcode(points, size)

	#puts points
    pts = []
	
	i = 0
	z = 0
	
	model = Sketchup.active_model()
	model.start_operation("Create QR Code")
	entities = model.active_entities()
	
	base_group = entities.add_group()
	base_group.name = "QR Code"
	base_entities = base_group.entities()
	
	# For each point in the list...
	plist = points.split(";")
	for p in plist do
		xy = p.split(",")
		x = xy[0].to_i
		y = xy[1].to_i
		
		# Add point to the list
		pts.push([x, -y, z])
		
		# Point counter
		i = i + 1
		
		# When 4 points are collected create a quad
		if (i % 4 == 0)
			# Create friendly name
			name = get_cube_name(i / 4)
			
			# Create a group for cube
			group = base_entities.add_group()
			group.name = name
			entities = group.entities()
			
			# Create a cube
			face = entities.add_face(pts)
			face.material = "gray"
			face.pushpull(size)
			
			# Reset points for next loop
			pts = []
		end
	end
	
	model.commit_operation()
end

def get_cube_name(n)
	name = n.to_s
	if (n < 10)
		name = "000" + n.to_s
	elsif (n < 100)
		name = "00" + n.to_s
	elsif (n < 1000)
		name = "0" + n.to_s
	end
	name = "Cube " + name
end

def open_qrcode_dialog()
	# Create a WebDialog instance
	# Reference: http://sketchupapi.blogspot.com/2008/02/sharing-data-between-sketchup-ruby-and.html
	wd = UI::WebDialog.new("QR Code Generator", false, "QR Code Generator", 700, 370, 200, 200, true)

	# Attach action callback
	wd.add_action_callback("get_points") do |dialog, value|
		points = dialog.get_element_value(value.to_s) # value..hidden field id
		size = dialog.get_element_value("size").to_i
		create_qrcode(points, size)
		dialog.close()
	end

	# Find and show html file
	html_path = Sketchup.find_support_file("qrcode.html", "Plugins")
	wd.set_file(html_path)
	wd.show()
end


# Include to menu only once
if (not file_loaded?("qrcode.rb"))
    add_separator_to_menu("Draw")
    UI.menu("Draw").add_item("QR Code") { open_qrcode_dialog }
end

#-----------------------------------------------------------------------------
file_loaded("qrcode.rb")
