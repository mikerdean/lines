(function(document) {

	// make an XHR request for the contents of the icons.svg
	// #########################

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'icons/icons.svg');

	xhr.addEventListener('readystatechange', function(e) {

		var result = e.target;
		if (result.readyState !== 4 || result.status !== 200) {
			return;
		}

		if (result.responseXML) {
			var svg = result.responseXML.documentElement;
			svg.setAttribute('class', 'd-none');
			svg.setAttribute('aria-hidden', 'true');
			document.body.insertBefore(svg, document.body.firstChild);
		}

	});

	xhr.addEventListener('error', function(e) {
		console.log('SVG: Could not complete a request for SVG icons.');
	});

	xhr.send();

})(document);