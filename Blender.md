# Introduction #

Plug-in for Blender 2.57+ can generate QR Code blocks in 3D or just flat 2D shapes on the workspace.

# Install #
  * Copy .py file to the directory with other scripts. In Windows: **%appdata%\Blender Foundation\Blender\2.57\scripts\addons** or **your-blender-directory\2.63\scripts\addons**
  * Open **Blender > File > User Preferences (CTRL+ALT+U) > Add-Ons (tab) > Add Mesh (left)**
  * Check the add-on named **Add Mesh: QR Code**. If the add-on does not get activated check the System Console.

# Usage #
  * Press SHIFT+A and select **Add Mesh > QR Code**
  * Enter some content and play with the parameters
  * Check the **Construct** checkbox to generate a mesh
  * Optionally, go into **Edit Mode**, press P key and select **By loose parts** if you want to separate blocks into new objects

# Notes #
  * What is a QR Code? See http://www.esponce.com/about-qr-codes
  * Requires internet connection to generate a QR Code pattern.
  * Set properties then check the 'Construct' checkbox. Cannot preview changes in real time due to internet connection (Blender may slow down or the server may block IP on mass request).
  * Tested on Windows 7, Blender 2.57.1 and 2.63a, Python 3.2 (bundled), all 64-bit
  * I haven't found a solution to separate mesh into cubes in Python. This can be done in GUI by going into Edit Mode, press P key and select 'By loose parts'.
  * Also had some problems finding button element, so 'Construct' checkbox is used instead.
  * [Blender wiki](http://wiki.blender.org/index.php/Extensions:2.6/Py/Scripts/Add_Mesh/QR_Code_Generator)

# Screenshots #
![http://www.esponce.com/Uploaded/Blog/blender-enable.png](http://www.esponce.com/Uploaded/Blog/blender-enable.png)

![http://www.esponce.com/Uploaded/Blog/blender-mesh.png](http://www.esponce.com/Uploaded/Blog/blender-mesh.png)