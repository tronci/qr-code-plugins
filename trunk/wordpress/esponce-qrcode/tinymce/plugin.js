/**************************************************************************************//**
 * Generates a [qrcode] tag sample.
 ******************************************************************************************/
function inject_esponce_qrcode()
{
	return '[qrcode content="Hello World" size="8" padding="4" foreground="#000000"]';
}

(function ()
{
	/**************************************************************************************//**
	 * Register button in the TinyMCE editor.
	 ******************************************************************************************/
	tinymce.create("tinymce.plugins.inject_esponce_qrcode",
	{
		init: function (editor, url)
		{
			editor.addButton("inject_esponce_qrcode",
			{
				title: "Insert QR Code",
				image: url + "/icon.png",
				onclick: function ()
				{
					editor.execCommand("mceInsertContent", false, inject_esponce_qrcode());
				}
			});
		}
	});

	tinymce.PluginManager.add("inject_esponce_qrcode", tinymce.plugins.inject_esponce_qrcode);
})();