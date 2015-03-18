/* global console: true, document: true */
(function (window, document, undefined) {

	'use strict';

	var documentElement = document.documentElement;

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

	function getStyle(elem, prop) {
		if (window.getComputedStyle) {
			return window.getComputedStyle(elem).getPropertyValue(prop);
		} else if (elem.currentStyle) {
			return elem.currentStyle[prop];
		}
	}

	var queue = [];
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
		var parent = options.parent;
		if (!parent) {
			// Determine if element is inside an element with overflow set.
			var parentNode = elem;
			var overflow;
			while ((parentNode = parentNode.parentNode) && parentNode.nodeType === 1) {
				overflow = getStyle(parentNode, 'overflow');
				if (overflow === 'auto' || overflow === 'scroll') {
					parent = parentNode;
					break;
				}
			}
			parent = parent || window;
		}

		if (parent === window) {
			options.parent = documentElement;
		} else {
			options.parent = parent;
		}

		// If scrollin or scrollout is supplied,
		// push to our poll queue and poll them.
		if (options.scrollin || options.scrollout) {

			options.elem = elem;
			queue.push(options);
			poll();

			var delay = options.delay || 13;
			if (!parent.sonarBound) {
				// Attach throttled poll function to window scroll event.
				if (parent.addEventListener) {
					parent.addEventListener('scroll', throttle(poll, delay), false);
					parent.addEventListener('resize', throttle(poll, delay), false);
				} else if (window.attachEvent) {
					parent.attachEvent('onscroll', throttle(poll, delay));
					parent.attachEvent('onresize', throttle(poll, delay));
				}
				parent.sonarBound = true;
			}
		}

		// Return detection status.
		return detect(elem, options.distance, options.visibility, options.parent);
	}

	// Determines if an element is visible in the
	// browser viewport within an optional distance.
	var body;
	function detect(elem, distance, visibility, parent) {

		// Cache the body elem.
		if (!body) {
			body = document.body;
		}

		if (!visibility) {
			visibility = 0;
		}

		if (distance === undefined) {
			distance = 0;
		}

		var parentElem = elem; // Clone the elem for use in our loop.
		var elemTop = 0; // The resets the calculated elem top to 0.

		// Used to recalculate elem.sonarElemTop if body height changes.
		var bodyHeight = body.offsetHeight;

		// Height of the screen.
		var screenHeight = parent.clientHeight || 0;

		// How far the user scrolled down.
		var scrollTop = (parent === documentElement ? body.scrollTop : parent.scrollTop);

		// Height of the element.
		var elemHeight = elem.offsetHeight || 0;

		// If our custom "sonarElemTop" variable is undefined, or the document body
		// height has changed since the last time we ran sonar.detect()...
		if (!elem.sonarElemTop || elem.sonarBodyHeight !== bodyHeight) {

			// Loop through the offsetParents to calculate it.
			while (parentElem !== parent && parentElem.offsetParent) {
				elemTop += parentElem.offsetTop;
				parentElem = parentElem.offsetParent;
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
			parent: parent,
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
		return elem.sonarElemTop + elemHeight - visibility * elemHeight > scrollTop - distance &&
			elem.sonarElemTop + visibility * elemHeight < scrollTop + screenHeight + distance;
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
					detected = detect(item.elem, item.distance, item.visibility, item.parent);
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

	sonar.poll = poll;

	// Expose!
	window.Sonar = sonar;

}(window, document));
