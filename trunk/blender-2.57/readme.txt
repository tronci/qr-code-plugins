== Install ==
* Copy this file in the directory with other scripts. In Windows:
    %appdata%\Blender Foundation\Blender\2.57\scripts\addons
* Open Blender > File > User Preferences (CTRL+ALT+U) > Add-Ons (tab) > Add Mesh (left)
* Check the add-on named "Add Mesh: QR Code". If the add-on does not get activated check System Console.

== Usage ==
* Press SHIFT+A and select Add Mesh > QR Code
* Enter some content and play with the parameters
* Check the 'Construct' checkbox to generate a mesh
* Go into Edit Mode, press P key and select 'By loose parts' if you want to separate blocks into new objects

== Debug ==
* Open Blender > Help > Toggle System Console to display log 

== Notes ==
* What is QR Code? See http://www.esponce.com/about-qr-codes
* Requires internet connection to generate a QR Code pattern.
* Set properties then check the 'Construct' checkbox. Cannot preview changes in real time
  due to internet connection (Blender may slow down or server may block IP on mass request).
* Tested on Windows 7, Blender 2.57.1, Python 3.2 (bundled), all 64-bit
* I haven't found a solution to separate mesh into cubes in Python. This can be done
  in GUI by going into Edit Mode, press P key and select 'By loose parts'.
* Also had some problems finding button element, so 'Construct' checkbox is used instead.
* QR Code is registered trademark of DENSO WAVE INCORPORATED
* Visit project website for more info: http://code.google.com/p/qr-code-plugins/