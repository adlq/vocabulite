(function () {
	var jQuery;
	var cssPath = 'http://vocabulite.googlecode.com/git/vocabulite.css';

	// Widget objects
	var widget = {};
	var statusButton = {};

	/*
	 * Our main Ajax request
	 */
	var apiKey = '0f191f643576c490532070f5c310f77af776e4d0abbe3e0c7';
	var apiUrl = 'http://api.wordnik.com//v4/word.json/';
	var apiOptions = '/definitions?limit=5&useCanonical=true&api_key=' + apiKey;

	var ajaxReq = {
		url: apiUrl,
		datatype: 'json',
		success: function( resp ) {
			fillWidget( resp );
		},
		error: printError
	};

	/* 
	 * This object will help us
	 * identify the highlighted text.
	 * It contains 2 functions:
	 * textHighlighter.mouseup()
	 * textHighlighter.getText()
	 */
	var textHighlighter = {};

	/*
	 * Load jQuery if it's not already present
	 * Code courtesy of Alex Maradon
	 * http://alexmarandon.com/articles/web_widget_jquery/
	 */
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

	/* 
	 * This is called one the jQuery and the
	 * CSS file have been successfully been
	 * loaded
	 */
	function scriptLoadHandler() {
		jQuery = window.jQuery.noConflict(true);
		main();
	}

	/*
	 * The main function
	 */
	function main() {
		jQuery( document ).ready( function() {

			// Select all BUT the widget (to bind the mouseup action)
			var s = jQuery( "body" ).children().not( "#vocabulite_widget" );
			
			// If the widget exists, then we clear it with the status button, and unbind the actions
			var existingWidget = jQuery( '#vocabulite_widget' );
			if ( existingWidget.length ) {
				s.off( "mouseup.vocabulite" );
				existingWidget.remove();
				jQuery( '#vocabulite_status' ).remove();
			} else {
				drawWidget();
				s.on( "mouseup.vocabulite", event, textHighlighter.mouseup );
			}
		});
	}

	/*
	 * This function will draw the widget
	 * then hide it
	 */
	var drawWidget = function() {

		// Draw the widget itself, if it doesn't exist yet
		jQuery( 'body' ).append( "<div id='vocabulite_widget'></div>" );
		widget.w = jQuery( '#vocabulite_widget' );

		/*
		 * Outer measures take into account the padding to correctly position the widget
		 * We currently have to do it this way because outerHeight() and outerWidth() on
		 * hidden elements is unstable
		 */
		if ( widget.w.length ) {
			// There are still some visual bug with this
			// that might come from the hidden status of 
			// the widget, we could have used jQuery functions
			// hide() and show() but we chose to implement them 
			// by changing CSS property "visibility" because 
			// apparently it causes less bug (?)
			widget.padding = parseInt( widget.w.css( 'padding-top' ).replace( 'px', '' ), 10 );
			console.log( "Padding = " + widget.padding );
			widget.outerHeight = widget.w.height() + widget.padding;
			widget.outerWidth = widget.w.width() + widget.padding;
			console.log( "Width = " + widget.w.width() + ", Height = " + widget.w.height() );
			widget.outerHeight = widget.w.outerHeight();
			widget.outerWidth = widget.w.outerWidth();
			console.log( "outerWidth = " + widget.w.outerWidth() + ", outerHeight = " + widget.w.outerHeight() );

			//hideWidget();
			widget.w.hide();
		}

		// Draw status button
		jQuery( 'body' ).append( "<div id='vocabulite_status'>V</div>" );
		statusButton.b = jQuery( '#vocabulite_status' );
	}

	/*
	 * Function to call when mouseup.vocabulite event
	 * is triggered. This basically positions the widget,
	 * fill it and shows it.
	 */
	textHighlighter.mouseup = function( event ) {
		var string = preprocessString( textHighlighter.getText().toString() );

		if ( relevantString( string ) ) {
			//console.log("Selected : " + string);
			/* Toggle definition widget */

			/*
			 * Position the widget, such as there's no
			 * unecessary scrolling to reveal it.
			 */
			var scrollTop = jQuery( document ).scrollTop();
			var scrollLeft = jQuery( document ).scrollLeft();

			/*
			console.log( "innerHeight = " + window.innerHeight );
			console.log( "scrollTop = " + scrollTop );
			console.log( "eventY = " + event.pageY );
			console.log( "wouterHeight = " + widget.outerHeight );
			console.log( "wouterWidth = " + widget.outerWidth );
			*/
			console.log( "innerWidth = " + window.innerWidth );
			console.log( "Padding = " + widget.padding );
			console.log( "Width = " + widget.w.width() + ", Height = " + widget.w.height() );
			console.log( "outerWidth = " + widget.w.outerWidth() + ", outerHeight = " + widget.w.outerHeight() );
			
			widget.x = ( window.innerWidth + scrollLeft - event.pageX - widget.outerWidth < 0 ?
					Math.max( event.pageX - widget.outerWidth, scrollLeft ) : event.pageX );
			widget.y = ( window.innerHeight + scrollTop - event.pageY - widget.outerHeight < 0 ? 
					Math.max( event.pageY - widget.outerHeight, scrollTop ) : event.pageY );
			/*
			console.log( "wx = " + widget.x );
			console.log( "wy = " + widget.y );
			*/
			
			widget.w.css( {
				'left': widget.x + 'px',
				'top': widget.y + 'px',
			} );

			// Get the content for the widget
			ajaxReq.url = generateReqURL( string );
			jQuery.ajax(ajaxReq);

			// Show the widget
			//showWidget();
			widget.w.show();
		} else {
			// Set the widget content to blank
			widget.w.empty();

			// Hide the widget
			//hideWidget();
			widget.w.hide();
		}
	}

	/*
	 * Hide widget
	 */
	var hideWidget = function() {
		if ( widget.w.length ) {
			widget.w.css( { 'visibility': 'hidden' } );
		}
	}

	/*
	 * Show widget
	 */
	var showWidget = function() {
		if ( widget.w.length ) {
			widget.w.css( { 'visibility': 'visible' } );
		}
	}


	/* 
	 * Preprocess highlighted string
	 */
	var preprocessString = function( string ) {

		// Process the highlighted string 
		string = string.replace( /[^\w\s]|_/g, "").replace( /\s+/g, " "); // Remove punctuation marks
		string = jQuery.trim( string );
		string = string.toLowerCase();

		//console.log( "Used in ajax request: " + string );

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

		/*
		 * Global object containing the widget's content
		 * widget.content = {
		 * 	partOfSpeech1 : [
		 * 		{ def1, src1 }
		 * 		{ def2, src2 }
		 * 		{ def3, src3 }
		 * 	]
		 * 	partOfSpeech2 : [
		 * 		{ def1, src1 }
		 * 	]...
		 * }
		 */
		widget.content = {};

		// If the response is not empty
		if ( resp.length ) {
			// Print the word as a title!
			widget.w.append( "<h1 class='vocab_title'>" + resp[0].word + "</h1>" );

			/*
			 * We store each result with respect to
			 * the part of speech (noun, adjective, ...)
			 * in order to have a somewhat better layout
			 */
			for ( var i = 0; i < resp.length; i++) {
				
				/*
				 * For each part of speech, insert it as 
				 * object property if not already present.
				 * Otherwise, store definition and sourceDictionary
				 * in it
				 */
				if ( typeof resp[i].partOfSpeech !== 'undefined' ) {
					var POS = resp[i].partOfSpeech.toString();
					if ( !( POS in widget.content ) ) {
						widget.content[POS] = [];
					}
					widget.content[POS].push( { 
						def: resp[i].text, 
						src: resp[i].sourceDictionary 
					} );
				} else {
					/*
					 * If there's no part of speech,
					 * that means that it's a historical
					 * figure 
					 */
					widget.content['Person'] = [];
					widget.content['Person'].push( {
						def: resp[i].text,
						src: resp[i].sourceDictionary
					} );
				}
			}

			/*
			 * Finally, call the formatContent()
			 * function to render the appropriate 
			 * HTML code
			 */
			widget.w.append( formatContent() );
		} else {
			widget.w.html( "No definition found!" );
		}
	}

	/*
	 * Render the appropriate HTML code
	 * given that widget.content has been filled
	 */
	var formatContent = function() {
		var content = '';

		/*
		 * Iterate through all of widget.content's 
		 * properties, which are parts of speech
		 */
		for ( var POS in widget.content ) {
			content += '<h2>' + POS + '</h2>';
			content += '<ul>';
			// Iterate through each definition
			for ( var i = 0; i < widget.content[POS].length; i++ ) {
				content += '<li class="vocab_def">' + jQuery.trim(widget.content[POS][i]['def'])
					+ '</li>';
			}
			content += '</ul>';
		}

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

})();
