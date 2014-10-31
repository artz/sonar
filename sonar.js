/* global console: true, document: true */
(function (window, document, undefined) {

	'use strict';

	function throttle(func, wait) {

		var timeout;

		return function () {

			function throttler() {
				timeout = undefined;
				func.call(this);
			}

			if (!timeout) {
				timeout = window.setTimeout(throttler, wait);
			}
		};
	}

	var queue = [];
	var bound;
	function sonar(elem, callback, options) {

		// Normalize arguments.
		if (typeof callback === 'object') {
			options = callback;
		} else if (typeof callback === 'function') {
			if (options) {
				options.scrollin = callback;
			} else {
				options = { scrollin: callback };
			}
		}

		var delay = options.delay || 0;
		if (!bound) {
			// Attach throttled poll function to window scroll event.
			if (window.addEventListener) {
				window.addEventListener('scroll', throttle(poll, delay), false);
				window.addEventListener('resize', throttle(poll, delay), false);
			} else if (window.attachEvent) {
				window.attachEvent('onscroll', throttle(poll, delay));
				window.attachEvent('onresize', throttle(poll, delay));
			}
			bound = true;
		}

		// If scrollin or scrollout is supplied,
		// push to our poll queue and poll them.
		if (options.scrollin || options.scrollout) {
			options.elem = elem;
			queue.push(options);
			poll();
		}

		// Return detection status.
		return detect(elem, options.distance, options.visibility);
	}

	// Determines if an element is visible in the
	// browser viewport within an optional distance.
	var body;
	function detect(elem, distance, visibility) {

		// Cache the body elem.
		if (!body) {
			body = document.body;
		}

		if (!visibility) {
			visibility = 0;
		}

		if (distance === undefined) {
			distance =  0;
		}

		var parentElem = elem, // Clone the elem for use in our loop.
			elemTop = 0, // The resets the calculated elem top to 0.

			// Used to recalculate elem.sonarElemTop if body height changes.
			bodyHeight = body.offsetHeight,

			// NCZ: I don't think you need innerHeight, I believe all major
			// browsers support clientHeight.
			screenHeight = window.innerHeight ||
				document.documentElement.clientHeight ||
				body.clientHeight || 0, // Height of the screen.

			// NCZ: I don't think you need pageYOffset, I believe all major
			// browsers support scrollTop.
			scrollTop = document.documentElement.scrollTop ||
				window.pageYOffset ||
				body.scrollTop || 0, // How far the user scrolled down.
				elemHeight = elem.offsetHeight || 0; // Height of the element.

			// If our custom "sonarTop" variable is undefined, or the document body
			// height has changed since the last time we ran sonar.detect()...
		if (!elem.sonarElemTop || elem.sonarBodyHeight !== bodyHeight) {

			// Loop through the offsetParents to calculate it.
			if (parentElem.offsetParent) {
				do {
					elemTop += parentElem.offsetTop;
				}
				while (parentElem = parentElem.offsetParent);
			}

			// Set the custom property (sonarTop) to avoid future attempts to calculate
			// the distance on this elem from the top of the page.
			elem.sonarElemTop = elemTop;

			// Along the same lines, store the body height when we calculated
			// the elem's top.
			elem.sonarBodyHeight = bodyHeight;
		}

/*
		// Dump all calculated variables.
		console.dir({
			elem: elem,
			sonarElemTop: elem.sonarElemTop,
			elemHeight: elemHeight,
			scrollTop: scrollTop,
			screenHeight: screenHeight,
			distance: distance,
			visibility: visibility
		});
*/

		// If elem bottom is above the screen top and
		// the elem top is below the screen bottom, it's false.
		// If visibility is specified, it is subtracted or added
		// as needed from the element's height.
		return (!(elem.sonarElemTop + (visibility ? 0 : elemHeight * visibility) < scrollTop - distance) &&
				!(elem.sonarElemTop + (visibility ? elemHeight * visibility : 0) > scrollTop + screenHeight + distance));
	}

	// Consider attaching an event listener for each
	// Sonar bind, vs. a single poll function.
	function poll() {

		var index,
			item,
			detected;

		for (index in queue) {
			if (queue.hasOwnProperty(index)) {
				item = queue[index];
				// If there's a callback for our events...
				if (item.scrollin || item.scrollout) {
					detected = detect(item.elem, item.distance, item.visibility);
					// If detected visibility is different than stored, fire callback.
					if (detected !== item.detected) {
						if (detected) {
							if (item.scrollin) {
								item.scrollin.call(item, item.elem);
							}
						} else {
							if (item.scrollout) {
								item.scrollout.call(item, item.elem);
							}
						}
						item.detected = detected;
					}
				}
			}
		}
	}

	// Expose!
	window.Sonar = sonar;

}(this, document));
