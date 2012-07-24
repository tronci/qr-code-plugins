/**************************************************************************************//**
 * QR Code Generator plug-in for Photoshop CS3
 * plug-in version: 1.0
 * provided by Esponce team
 * http://www.esponce.com/
 ******************************************************************************************/
 
/***** BEGIN MIT LICENSE BLOCK *****
 *
 * Copyright (C) 2012 Esponce d.o.o.
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

//#target photoshop //Also for Illustrator and InDesign?
$.localize = true;

/**************************************************************************************//**
 * Global variables
 ******************************************************************************************/
 
//Script info
SCRIPT_NAME = "QR Code Generator";
SCRIPT_FILE = "QR Code.jsx";
SCRIPT_VERSION = "1.0";
SCRIPT_AUTHOR = "Esponce.com";
SCRIPT_DATE = "2012-01-30";

//Buttons
BUTTON_CREATE = 1;
BUTTON_CLOSE = 2;

//Frequently used helper
helper = new Helper();
apptype = helper.getApplicationType();

//Remember the dialog modes
if (apptype == "photoshop")
{
	gSaveDialogMode = app.displayDialogs;
	app.displayDialogs = DialogModes.NO; //NOTE: Not in CS4
}

gScriptResult = '';

/**************************************************************************************//**
 * Main logic
 ******************************************************************************************/
try
{ 
	var dialog = new QRCodeDialog();
	dialog.createDialog();
	
	if (apptype == "illustrator")
	{
		alert("Sorry, Adobe Illustrator does not support HTTP connections. Try with Photoshop or InDesign or generate a vector QR Code image at http://www.esponce.com/ .");
	}
	else if (apptype == "photoshop" || apptype == "indesign")
	{
		var button = dialog.openDialog();
		if (button == BUTTON_CREATE)
		{
			dialog.make();
		}
		else //if (button == BUTTON_CLOSE)
		{
			//Notify 'Actions' no to record the script
			gScriptResult = 'cancel';
		}
	}
	else
	{
		alert("Sorry, this script works only with Photoshop and InDesign.");
	}
	
	//Just in case
	$.gc();
}
catch (ex)
{
	if (ex.number != 8007)
	{
		//Report error
		alert(ex + " (" + SCRIPT_FILE + ":" + ex.line + ")");
	}
   	gScriptResult = 'cancel';
}

//Restore the dialog modes
if (apptype == "photoshop")
{
	app.displayDialogs = gSaveDialogMode;
}

//Must be the last thing
gScriptResult; 


/**************************************************************************************//**
 * QR Code Generator
 ******************************************************************************************/
function QRCodeDialog()
{
	//Initialize
	this.params = new QRCodeParameters();

	/**************************************************************************************//**
	 * Creates a dialog window with input elements.
	 ******************************************************************************************/
	this.createDialog = function()
	{
		//Create a new dialog window
		var d = new Window("dialog", SCRIPT_NAME + " " + SCRIPT_VERSION);
		d.orientation = "row";
		d.alignChildren = "fill";
		d.marginLeft = 15;
		
		//Stack panel with horizontal orientation
		d.grpLeft = d.add("group");
		d.grpLeft.orientation = "row";
		d.grpLeft.alignChildren = "fill";
		d.grpLeft.spacing = 3;
		
		d.grpRight = d.add("group");
		d.grpRight.orientation = "row";
		d.grpRight.alignChildren = "fill";
		d.grpRight.spacing = 3;
		
		/**************************************************************************************/
		
		//Stack panel with vertical orientation
		var pnlContent = d.grpLeft.add("group");
		pnlContent.orientation = "column";
		pnlContent.alignChildren = "fill";
		pnlContent.spacing = 3;
		
		//Label + TextBox
		pnlContent.add("statictext", undefined, "Content");
		d.txtContent = pnlContent.add("edittext", undefined, undefined, {multiline:true, readonly:false});
		d.txtContent.preferredSize.width = 300;
		d.txtContent.preferredSize.height = 210;
		d.txtContent.visible = true;
		d.txtContent.helpTip = "Enter content to be encoded into QR Code image.";
		d.txtContent.alignment = "fill";
		
		pnlContent.add("statictext", undefined, "Generating QR Code takes some time. Please, be patient...");
		pnlContent.add("statictext", undefined, "More info on http://www.esponce.com/about-qr-codes");
		
		//Test
		//alert(helper.dump(d.txtContent));
		
		/**************************************************************************************/
		
		//Stack panel with vertical orientation
		var pnlProperties = d.grpRight.add("group");
		pnlProperties.orientation = "column";
		pnlProperties.alignChildren = "fill";
		pnlProperties.spacing = 3;
		
		//Label + TextBox
		pnlProperties.add("statictext", undefined, "Module Size");
		d.txtSize = pnlProperties.add("edittext");
		d.txtSize.preferredSize.width = 200;
		d.txtSize.visible = true;
		d.txtSize.helpTip = "Enter size of a block.";
		d.txtSize.alignment = "fill";
		
		//Label + TextBox
		pnlProperties.add("statictext", undefined, "Padding");
		d.txtPadding = pnlProperties.add("edittext");
		d.txtPadding.preferredSize.width = 200;
		d.txtPadding.visible = true;
		d.txtPadding.helpTip = "Enter padding, value represents number of blocks.";
		d.txtPadding.alignment = "fill";
		
		//ComboBox
		pnlProperties.add("statictext", undefined, "Version");
		d.cmbVersion = pnlProperties.add("dropdownlist");
		d.cmbVersion.preferredSize.width = 200;
		d.cmbVersion.visible = true;
		
		d.cmbVersion.add("item", "Auto");
		for (var i = 1; i <= 40; i++)
		{
			d.cmbVersion.add("item", "" + i);
		}
		d.cmbVersion.items[0].selected = true; //Auto
		
		//ComboBox
		pnlProperties.add("statictext", undefined, "Encode Mode");
		d.cmbEncodeMode = pnlProperties.add("dropdownlist");
		d.cmbEncodeMode.preferredSize.width = 200;
		d.cmbEncodeMode.visible = true;
		
		d.cmbEncodeMode.add("item", "Byte");
		d.cmbEncodeMode.add("item", "Alphanumeric");
		d.cmbEncodeMode.add("item", "Numeric");
		d.cmbEncodeMode.items[0].selected = true;
		
		//ComboBox
		pnlProperties.add("statictext", undefined, "Error Correction");
		d.cmbErrorCorrection = pnlProperties.add("dropdownlist");
		d.cmbErrorCorrection.preferredSize.width = 200;
		d.cmbErrorCorrection.visible = true;
		
		d.cmbErrorCorrection.add("item", "L");
		d.cmbErrorCorrection.add("item", "M");
		d.cmbErrorCorrection.add("item", "H");
		d.cmbErrorCorrection.add("item", "Q");
		d.cmbErrorCorrection.items[1].selected = true;
		
		/**************************************************************************************/
		
		//Buttons on the right side of the dialog
		var pnlButtons = pnlProperties.add("group");
		pnlButtons.orientation = "row";
		pnlButtons.alignment = "right";
		pnlButtons.alignChildren = "bottom";
		//pnlButtons.marginTop = 30; //Does not work in Photoshop
		
		//Work-around for spacing
		pnlButtons.add("statictext", undefined, "\n\n\n", {multiline: true});

		//Buttons
		d.btnCreate = pnlButtons.add("button", undefined, "Create");
		d.btnClose = pnlButtons.add("button", undefined, "Close");
		
		d.defaultElement = d.btnCreate;
		d.cancelElement = d.btnClose;
		
		this.dialog = d;
		this.setParameters(this.params);
	}

	/**************************************************************************************//**
	 * Copy stored parameters to input controls on the form.
	 ******************************************************************************************/
	this.setParameters = function(p)
	{
		var d = this.dialog;
		d.txtContent.text = p.content;
		d.txtSize.text = p.size;
		d.txtPadding.text = p.padding;
		
		helper.selectComboBoxItem(d.cmbVersion, p.version);
		helper.selectComboBoxItem(d.cmbEncodeMode, p.em);
		helper.selectComboBoxItem(d.cmbErrorCorrection, p.ec);
		
		this.params = p;
	}
	
	/**************************************************************************************//**
	 * Copy from input controls to QRCodeParameters object.
	 ******************************************************************************************/
	this.getParameters = function()
	{
		var p = this.params;
		var d = this.dialog;
		p.content = d.txtContent.text;
		p.size = d.txtSize.text;
		p.padding = d.txtPadding.text;
		p.version = d.cmbVersion.selection.text;
		p.em = d.cmbEncodeMode.selection.text.toLowerCase();
		p.ec = d.cmbErrorCorrection.selection.text.toLowerCase();
		return p;
	}
	
	/**************************************************************************************//**
	 * Open the dialog.
	 ******************************************************************************************/
	this.openDialog = function ()
	{
		this.dialog.onShow = function()
		{
		}
		
		this.dialog.btnClose.onClick = function()
		{
			dialog.close(BUTTON_CLOSE);
		}

		this.dialog.btnCreate.onClick = function ()
		{
			dialog.getParameters();
			dialog.close(BUTTON_CREATE);
		}
		
		if (apptype == "photoshop")
		{
			app.bringToFront();
		}
		
		this.dialog.center();
		return this.dialog.show();
	}
	
	/**************************************************************************************//**
	 * Make a QR Code
	 ******************************************************************************************/
	this.make = function()
	{
		var format = "svg"; //or "ascii"
		var api = new QRCodeAPI();
		var p = this.getParameters();
		
		//Just for test
		//var qrcode = api.generate("hello world", "svg", 8, 4, undefined, "byte", "M");
		
		//Call web service to generate QR Code matrix
		var qrcode = api.generate(p.content, format, p.size, p.padding, p.version, p.em, p.ec);
		
		//Get total width and height
		var width = 500;
		var height = 500;
		if (format == "ascii")
		{
			//Calculate rows and columns
			var length = qrcode.length;
			var rs = Math.floor(Math.sqrt(length)); //Number of modules in a row
			var s = p.size; //Size of one module in pixels
			width = height = rs * s;
		}
		else
		{
			//Parse SVG content
			var parser = new SimpleXmlParser();
			var params = parser.parse(qrcode);
			width = parser.width;
			height = parser.height;
		}
		
		//Create a new document if there is none
		if (app.documents.length == 0)
		{
			if (width == 0 || height == 0)
			{
				width = 500;
				height = 500;
			}
			switch (apptype)
			{
				default:
				case "photoshop":
					app.documents.add(width, height, 72, "QR Code - " + p.content, NewDocumentMode.RGB);
					break;
					
				case "indesign":
					app.documents.add();
					break;
			}
		}
		
		//Get active document
		var doc = app.activeDocument;
		
		//Add a new layer
		var page = undefined;
		var newLayer = undefined;
		switch (apptype)
		{
			default:
			case "photoshop":
				newLayer = doc.artLayers.add();
				newLayer.name = "QR Code - " + p.content;
				
				//Make sure nothing is selected
				doc.selection.deselect();
				break;
				
			case "indesign":
				newLayer = doc.layers.add({ name: "QR Code - " + p.content });
				
				//Select first page
				page = doc.pages.item(0);
				break;
		}
		
		//Make selections
		if (format == "ascii")
		{
			//Calculate rows and columns
			var length = qrcode.length;
			var rs = Math.floor(Math.sqrt(length)); //Number of modules in a row
			var s = 10; //Size of one module in pixels
			
			//For each row...
			for (var iy = 0; iy < rs; iy++)
			{
				//For each column...
				for (var ix = 0; ix < rs; ix++)
				{
					//Calculate array index
					//+1 for new line, note that Adobe JS reads \r\n as one character
					var i = iy * (rs + 1) + ix;
					
					//If marked to be selected
					if (qrcode[i] == "x")
					{
						var x = ix * s;
						var y = iy * s;
						
						//Selection rectangle
						selectedRegion =
						[
							[x + 0, y + 0],
							[x + 0, y + s],
							[x + s, y + s],
							[x + s, y + 0]
						];
						
						//Add to selection
						doc.selection.select(selectedRegion, SelectionType.EXTEND);
					}
				}
			}
		}
		else
		{
			//Parse SVG content
			var parser = new SimpleXmlParser();
			var params = parser.parse(qrcode);
			var length = params.length;
			
			//Note: starts from 1 to ignore background rectangle
			for (var i = 1; i < length; i++)
			{
				var p = params[i];
				var x = p[0];
				var y = p[1];
				var w = p[2];
				var h = p[3];
				
				if (apptype == "photoshop")
				{
					//Selection rectangle
					selectedRegion =
					[
						[x + 0, y + 0],
						[x + 0, y + h],
						[x + w, y + h],
						[x + w, y + 0]
					];
					
					//Add to selection
					doc.selection.select(selectedRegion, SelectionType.EXTEND);
				}
				else if (apptype == "indesign")
				{
					var f = 0.03; //Factor
					var fx = x * f;
					var fy = y * f;
					var fw = w * f;
					var fh = h * f;
					page.rectangles.add(newLayer, undefined, undefined,
					{
						geometricBounds: [fy, fx, fy + fh, fx + fw],
						strokeWeight: 0,
						strokeColor: doc.swatches.item("None"),
						fillColor: doc.swatches.item("Black")
					});
				}
			}
		}
		
		if (apptype == "photoshop")
		{
			//Fill selection with solid color
			var squareColor = new RGBColor;
			squareColor.hexValue = "000000";
			doc.selection.fill(squareColor);
		}
	}
}

/**************************************************************************************//**
 * QR Code parameters
 ******************************************************************************************/
function QRCodeParameters()
{
	//Default values
	this.content = "Lorem Ipsum";
	this.size = 8;
	this.padding = 4;
	this.version = "auto";
	this.em = "byte";
	this.ec = "M";
}

/**************************************************************************************//**
 * Generates a QR Code using web service.
 ******************************************************************************************/
function QRCodeAPI()
{
	this.generate = function(content, format, size, padding, version, em, ec)
	{
		var ver = "";
		if (typeof version != "undefined" && version > 0)
		{
			ver = "&version=" + version;
		}
	
		//Build URL to generate QR Code matrix
		var url = "http://www.esponce.com/api/v3/generate";
		url += "?content=" + escape(content);
		url += "&format=" + format;
		url += "&size=" + size;
		url += "&padding=" + padding;
		url += ver;
		url += "&em=" + em;
		url += "&ec=" + ec;
		url += "&source=" + apptype;
		//alert(url);
		
		//Make a request
		var http = new HttpRequest();
		var result = http.request(url);
		return result;
	}
}

/**************************************************************************************//**
 * Very basic implementation of XML parser. Works only for specific QR Code SVG images.
 ******************************************************************************************/
function SimpleXmlParser()
{
	this.width = 0;
	this.height = 0;

	this.parse = function(xml)
	{
		//Goal is to fill 'result' with array of [x,y,width,height]
		var result = [];
		
		//Read line by line
		var lines = xml.split("\n");
		var length = lines.length;
		for (var i = 0; i < length; i++)
		{
			var line = lines[i];
			
			//Must be a 'rect' tag
			if (line.indexOf("<rect") == 0)
			{
				//Collect numbers from the string
				//line = "<rect x="32" y="32" width="8" height="8"..."
				var x = line;
				x = x.replace("<rect x=\"", "");
				x = x.replace("\" y=\"", ",");
				x = x.replace("\" y=\"", ",");
				x = x.replace("\" width=\"", ",");
				x = x.replace("\" height=\"", ",");
				x = x.substring(0, x.indexOf("\"", ""));
				
				//Parameters as strings
				var list = x.split(",");
				
				//Parameters as int
				//params = [32,32,8,8]
				var params =
				[
					parseInt(list[0]),
					parseInt(list[1]),
					parseInt(list[2]),
					parseInt(list[3]),
				];
				
				//First rectangle is for background fill - size is the same as overall image size
				if (this.width == 0 || this.height == 0)
				{
					this.width = params[2];
					this.height = params[3];
				}
				
				//Add to result array
				result.push(params);
			}
		}
		
		return result;
	}
	
	this.openDialog = function()
	{
		//Show dialog
		var file = File.openDialog("QR Code as SVG", "*.svg");
		
		//Check if file has been selected
		if (!file.exists)
		{
			return;
		}
		
		//Open file for reading
		file.open("r");
		
		//Read full file content
		var content = file.read(file.length);
		
		//Close file handle
		file.close();
		
		//Parse XML content
		return parse(content);
	}
}

/**************************************************************************************//**
 * Very basic implementation of HTTP protocol.
 ******************************************************************************************/
function HttpRequest()
{
	/**************************************************************************************//**
	 * Makes a HTTP request.
	 * @param url     URL to request
	 * @param method  HTTP method: GET or POST
	 * @param data    Data to be sent in HTTP body
	 ******************************************************************************************/
	this.request = function(url, method, data)
	{
		var result = "";
		
		if (typeof method == "undefined") method = "GET";
		if (typeof data == "undefined") data = "";
	
		//Parse url
		var https = (url.indexOf("https://") >= 0);
		var prefix = (https ? "https://" : "http://");
		var start = url.indexOf("/", prefix.length);
		var host = url.substring(prefix.length, start);
		var path = url.substring(start);
		var port = 80;
		
		//Open a TCP socket
		var socket = new Socket();
		var server = host + ":" + port;
		if (socket.open(server, "UTF-8"))
		{
			//Build HTTP head
			var request = method + " " + path + " HTTP/1.1\r\n";
			request += "Host: " + host + "\r\n";
			request += "User-Agent: QRCode/3.0 (" + helper.getPlatformInfo() + "; " + helper.getApplicationInfo() + "; U; en)\r\n"; //User-Agent: QRCode/3.0 (Windows 7; Adobe Photoshop 11.0; U; en)
			request += "Accept: application/json\r\n";
			request += "Keep-Alive: 115\r\n";
			request += "Connection: keep-alive\r\n";
			
			//Content length when content is present
			if (typeof data == "string" && data != "")
			{
				request += "Content-Length: " + data.length + "\r\n";
			}
			
			//Empty line is separator between HTTP head and body
			request += "\r\n";
			
			//Build HTTP body
			if (typeof data == "string" && data != "")
			{
				request += data;
			}
			
			//Send a request
			socket.write(request);
			
			//Get response message
			var completed = false;
			var parts = [];
			while (socket.connected && !socket.eof)
			{
				var part = socket.read();
				parts.push(part);
			}
			var response = parts.join('');
			socket.close()
			
			//Parse response
			var space = response.indexOf("\r\n\r\n");
			result = response.substring(space + 4); //HTTP body
		}
		
		return result;
	}
}

/**************************************************************************************//**
 * Frequently used methods.
 ******************************************************************************************/
function Helper()
{
	/**************************************************************************************//**
	 * Gets application name and version, e.g. "Adobe Photoshop 11.0.0"
	 ******************************************************************************************/
	this.getApplicationInfo = function()
	{
		return app.name + " " + app.version;
	}
	
	/**************************************************************************************//**
	 * Gets application type, e.g. "photoshop"
	 ******************************************************************************************/
	this.getApplicationType = function()
	{
		var name = app.name;
		if (name.search(/photoshop/i) >= 0)
		{
			return "photoshop";
		}
		if (name.search(/illustrator/i) >= 0)
		{
			return "illustrator";
		}
		if (name.search(/indesign/i) >= 0)
		{
			return "indesign";
		}
		return "";
	}
	
	/**************************************************************************************//**
	 * Gets platform name and version, e.g. "Windows 7"
	 ******************************************************************************************/
	this.getPlatformInfo = function()
	{
		return $.os;
	}
	
	/**************************************************************************************//**
	 * Gets platform type, e.g. "win" or "mac"
	 ******************************************************************************************/
	this.getPlatformType = function()
	{
		var name = $.os;
		if (name.search(/windows/i) >= 0)
		{
			return "win";
		}
		if (name.search(/macintosh/i) >= 0)
		{
			return "mac";
		}
		return "";
	}
	
	/**************************************************************************************//**
	 * Select an item from ComboBox by value.
	 ******************************************************************************************/
	this.selectComboBoxItem = function(combobox, value)
	{
		var length = combobox.items.length;
		for (var i = 0; i < length; i++)
		{
			var item = combobox.items[i];
			if (item.toString() == value)
			{
				item.selected = true;
				break;
			}
		}
	}
	
	/**************************************************************************************//**
	 * Gets properties and values from object.
	 ******************************************************************************************/
	this.dump = function(object)
	{
		var result = "";
		for (var property in object)
		{
			result += property + ': ' + object[property] + '\r\n';
		}
		return result;
	}
}
