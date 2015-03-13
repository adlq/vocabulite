# Vocabulite #

## What is it? ##
Simple JavaScript bookmarklet to get word definitions. It uses [Wordnik's API](http://developer.wordnik.com/) to find word definitions and the [jQuery library](http://www.jQuery.com).

## How do I use it? ##
Simply bookmark this cute innocent piece of code (Google Code apparently doesn't allow JavaScript links)

javascript:(function(){s=document.createElement('script');s.setAttribute('type','text/javascript');s.setAttribute('src', 'http://vocabulite.googlecode.com/git/vocabulite.js');document.body.appendChild(s);})();

Then, each time a web page contains a word you don't understand, click on the Vocabulite bookmark you just made. If the script has successfully loaded, you'll see a "V" icon on the top-right corner of your page. Then simply select the word and there will (hopefully) be a little popup with some definitions of the words.

If you don't need the popup anymore, simply click elsewhere on the page.

To "quit" using Vocabulite, you only have to click on the bookmark again.

## Limitations ##
  * This bookmarklet won't work on sites that don't allow loading of external script, which is perfectly reasonnable, for instance [Facebook](http://www.facebook.com) or [Google](http://www.google.com).

  * I am currently trying to fix some bugs that prevent Vocabulite from loading on sites like [reddit](http://www.reddit.com).

  * You might also stumble on some graphical bugs where the popup is stuck on the left side of the page. I'm looking into it. A temporary solution is to reload the bookmarklet (click twice on the bookmark).

  * Vocabulize currently doesn't understand when you select multiple words. This feature will soon be implemented.

  * As of right now, Vocabulize only works for English words (i.e., accents are not available yet).

  * If you browse the source, you might find a plaintext API key. That is because I have not found a way to hide it yet in Javascript, so please leave it alone :)

## Notes ##
I would love to hear feedback on this project, especially on its speed performance and on possible improvements (there's still a lot of work to be done!). Feel free to drop me a line at dtnghia90(at)gmail(dot)com :)