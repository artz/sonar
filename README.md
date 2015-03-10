# sonar

Sonar is JavaScript library that lets you detect and fire callbacks when an element scrolls vertically in and out of view in the browser.  Use cases include lazy loading, infinite scroll, sticky headers, etc.

## Usage

In its simplest form, Sonar takes an element and a callback. This will fire the callback every time the element scrolls into view.

```
var elem = document.querySelectorAll('.sonar');
Sonar(elem, function (elem) {
	console.log('Element is visible.', elem);
});
```

Options may be passed in, providing even greater control and flexibility over when and how the callbacks are fired.

Example:

```
Sonar(elem, {
	scrollin: function (elem) {
		console.log('Element is scrolled in.');
	},
	scrollout: function (elem) {
		console.log('Element is scrolled out.');
	},
	distance: 100,
	visibility: 1,
	delay: 200
});
```

The Sonar function returns the current visibility status of the element, making it possible to manually detect scroll status and write code that looks like this:

```
var isVisible = Sonar(elem);
```

Rarely, you may want to force Sonar to poll all bound elements and trigger callbacks outside the window scrolling. Calling `Sonar.poll()` forces Sonar to perform its polling operation that fires callbacks if their state (scrolled in or scrolled out) changed.

## Options

### scrollin

Function to be executed when the element scrolls into view, supplying the bound element as an argument.

### scrollout

Function to be executed when the element scrolls out of view, supplying the bound element as an argument.

### distance

The distance to add above and below the element to trigger the callback.  For example, a value of `200` will tell Sonar to fire the callback 200 pixels above the element when scrolling in, and 200 pixels below the element when scrolling out. A negative distance will work in the reverse, delaying the callback until the distance has passed.  Default: `0`

### visibility

A value from `0` to `1` indicating the percentage of the element to be visible before firing the callback.  The default value of `0` makes the callback fire as soon as the element scrolls in.  A value of `1` ensures the entire element is visible before firing the callback. `0.5` is half the element, etc. Default: `0`

### delay

The delay to poll the elements on the screen.  This may be desired for performance reasons to reduce the frequency of polling the queue of elements for position information. Default: `0`

### parent

If Sonar detects the element is a child of an element with the CSS `overflow` property set to `scroll` or `auto`, it will use this element as its parent offset for scroll detection instead of the browser window.  Should this not be desired, `parent` may be used to override with another element.

## Roadmap

* Support for horizontal scroll.
* `<iframe>` support.
