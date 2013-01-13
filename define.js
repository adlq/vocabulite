(function () {
	/*
	 * Load jQuery if it's not already present
	 * Code courtesy of Alex Maradon
	 * http://alexmarandon.com/articles/web_widget_jquery/
	 */
	var jQuery;
	var apiKey = '0f191f643576c490532070f5c310f77af776e4d0abbe3e0c7';
	var apiUrl = 'http://api.wordnik.com//v4/word.json/';
	var apiOptions = '/definitions?limit=5&api_key=' + apiKey;

	var wHeight = 200;
	var wWidth = 200;

	if ( window.jQuery === undefined || window.jQuery.fn.jquery !== '1.7.2' ) {
		var script_tag = document.createElement('script');
		script_tag.setAttribute("type", "text/javascript");
		script_tag.setAttribute("src", 
			"http://code.jquery.com/jquery-latest.js");
		if ( script_tag.readyState ) {
			script_tag.onreadystatechange = function () {
				if ( this.readyState == 'complete' || this.readyState == 'loaded' ) {
					scriptLoadHandler();
				}
			};
		} else {
			script_tag.onload = scriptLoadHandler;
		}

		( document.getElementsByTagName("head")[0] || document.documentElement ).appendChild(script_tag);

	} else {
		jQuery = window.jQuery;
		main();
	}

	function scriptLoadHandler() {
		$myjq = window.jQuery.noConflict();
		main();
	}

	function main() {
		$myjq( document ).ready( function() {
			drawWidget();
			console.log('Ready!');
			var s = $myjq( "body" ).children().not( "#widget" );
			s.on( "mouseup.define", event, textHighlighter.mouseup );
		});
	}

	var drawWidget = function() {
		// Draw the widget itself
		$myjq( 'body' ).append("<div id='widget'></div>");
		var w = $myjq( '#widget' );
		w.css( {
			'border': '1px solid #000',
			'z-index': '9999',
			'width': wWidth + 'px', 
			'height': wHeight + 'px',
			'position': 'absolute',
			'background': '#fff',
			'padding': '10px',
			'font-family': 'serif, Georgia'
		} );
		w.hide();

		// Draw the on/off button
	}

	var textHighlighter = {};

	/* 
	 * Get value of highlighted text
	 * Code courtesy of Jeff Anderson
	 * http://www.codetoad.com/javascript_get_selected_text.asp
	 */
	textHighlighter.getText = function() {
		var text = '';

		if( window.getSelection ) {
			text = window.getSelection();
		} else if ( document.getSelection ) {
			text = document.getSelection();
		} else if ( document.selection ) {
			text = document.selection.createRange().text;
		}
		return text;
	}

	textHighlighter.mouseup = function( event ) {
		var string = preprocessString( textHighlighter.getText().toString() );
		var w = $myjq( '#widget' );

		if ( relevantString( string ) ) {
			console.log("Selected : " + string);
			/* Toggle definition widget */

			/*
			 * Position the widget, such as there's no
			 * unecessary scrolling to reveal it.
			 */
			console.log("Innerheight: " + window.innerHeight );
			console.log("eventY: " + event.pageY );
			wX = ( window.innerWidth - event.pageX - wWidth < 0 ?
					Math.max( event.pageX - wWidth, 0 ) : event.pageX );
			wY = ( window.innerHeight - event.pageY - wHeight < 0 ? 
					Math.max( event.pageY - wHeight, 0 ) : event.pageY );
			w.css( {
				'left': wX + 'px',
				'top': wY + 'px',
			} );

			// Get the content for the widget
			ajaxReq.url = generateReqURL( string );
			$myjq.ajax(ajaxReq);

			// Show the widget
			w.show();
		} else {
			// Set the widget content to blank
			w.empty();

			// Hide the widget
			w.hide();
		}
	}

	/*
	 * Our main Ajax request
	 */
	var ajaxReq = {
		url: apiUrl,
		datatype: 'json',
		success: function( resp ) {
			fillWidget( resp );
		},
		error: printError
	};

	/* 
	 * Preprocess highlighted string
	 */
	var preprocessString = function( string ) {

		// Process the highlighted string 
		string = string.replace( /[^\w\s]|_/g, "").replace( /\s+/g, " "); // Remove punctuation marks
		string = $myjq.trim( string );
		string = string.toLowerCase();

		console.log( "Used in ajax request: " + string );

		return string;

	}

	/*
	 * Generate the appropriate API URL
	 */
	var generateReqURL = function( string ) {
		// Set url to the API Url
		url = apiUrl;

		// Append the string
		url += string;

		// Append some options
		url += apiOptions;
		return url;
	}

	/*
	 * Fill the necessary information, definition
	 * on the highlighted word in the widget
	 */
	var fillWidget = function( resp ) {
		var w = $myjq( "#widget");

		if ( resp.length ) {
			for ( var i = 0; i < resp.length; i++) {
				w.html( formatContent( resp[i] ) );
			}
		} else {
			w.html( "No definition found" );
		}
	}

	/*
	 * Takes a JSON object and return some 
	 * HTML to fill into the widget
	 */
	var formatContent = function( resp ) {
		var content = '';

		content += "<h1>" + resp.word + "</h1>";
		content += "<p>" + resp.text + "</p>";

		return content;
	}

	/*
	 * Error message is Ajax request fails
	 */
	var printError = function( req, status, err ) {
		console.log( "Ajax request failed", status, err );
	}

	/*
	 * Returns true if the string is relevant
	 * aka not empty and actually contains words,
	 * not punctuation signs for instance, and false
	 * otherwise.
	 */
	var relevantString = function( string ) {
		return ( string != '' && string.match( "[\w]*" ) );
	}
	
})();
