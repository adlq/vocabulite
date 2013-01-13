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
	var cssPath = 'vocabulite.css';

	// Widget object
	var widget = {};

	if ( window.jQuery === undefined || window.jQuery.fn.jquery !== '1.7.2' ) {
		var scriptTag = document.createElement('script');
		scriptTag.setAttribute("type", "text/javascript");
		scriptTag.setAttribute("src", 
			"http://code.jquery.com/jquery-latest.js");

		var cssTag = document.createElement( 'link' );
		cssTag.setAttribute( 'rel' , 'stylesheet' );
		cssTag.setAttribute( 'type', 'text/css' );
		cssTag.setAttribute( 'media', 'screen' );
		cssTag.setAttribute( 'href' , cssPath );

		if ( scriptTag.readyState && cssTag.readyState ) {
			scriptTag.onreadystatechange = function () {
				if ( this.readyState == 'complete' || this.readyState == 'loaded' ) {
					scriptLoadHandler();
				}
			};
		} else {
			scriptTag.onload = scriptLoadHandler;
		}

		( document.getElementsByTagName("head")[0] || document.documentElement ).appendChild(scriptTag);
		( document.getElementsByTagName("head")[0] || document.documentElement ).appendChild(cssTag);

	} else {
		jQuery = window.jQuery;
		main();
	}

	function scriptLoadHandler() {
		jQuery = window.jQuery.noConflict(true);
		main();
	}

	function main() {
		jQuery( document ).ready( function() {

			var s = jQuery( "body" ).children().not( "#vocabulite_widget" );
			
			// If the widget exists, then we clear it
			var selection = jQuery( '#vocabulite_widget' );
			if ( selection.length ) {
				s.off( "mouseup.vocabulite" );
			} else {
				drawWidget();
			}

			console.log('Ready!');
			s.on( "mouseup.vocabulite", event, textHighlighter.mouseup );
		});
	}

	var drawWidget = function() {

		// Draw the widget itself, if it doesn't exist yet
		jQuery( 'body' ).append( "<div id='vocabulite_widget'></div>" );
		widget.w = jQuery( '#vocabulite_widget' );
		widget.w.hide();

		// Outer measures take into account the padding to correctly position the widget
		widget.realHeight = widget.w.outerHeight();
		widget.realWidth = widget.w.outerWidth();
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

		if ( relevantString( string ) ) {
			console.log("Selected : " + string);
			/* Toggle definition widget */

			/*
			 * Position the widget, such as there's no
			 * unecessary scrolling to reveal it.
			 */
			
			var scrollTop = jQuery( document ).scrollTop();
			var scrollLeft = jQuery( document ).scrollLeft();
			widget.x = ( window.innerWidth + scrollLeft - event.pageX - widget.realWidth < 0 ?
					Math.max( event.pageX - widget.realWidth, scrollLeft ) : event.pageX );
			widget.y = ( window.innerHeight + scrollTop - event.pageY - widget.realHeight < 0 ? 
					Math.max( event.pageY - widget.realHeight, scrollTop ) : event.pageY );
			widget.w.css( {
				'left': widget.x + 'px',
				'top': widget.y + 'px',
			} );

			// Get the content for the widget
			ajaxReq.url = generateReqURL( string );
			jQuery.ajax(ajaxReq);

			// Show the widget
			widget.w.show();
		} else {
			// Set the widget content to blank
			widget.w.empty();

			// Hide the widget
			widget.w.hide();
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
		string = jQuery.trim( string );
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

		if ( resp.length ) {
			for ( var i = 0; i < resp.length; i++) {
				widget.w.html( formatContent( resp[i] ) );
			}
		} else {
			widget.w.html( "No definition found" );
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
