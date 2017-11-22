// Based on https://github.com/stevenwanderski/bxslider-4

(function ($) {
	const defaults = {
		className: 'c-slider',
		speed: 500,
		easing: 'swing',
		startSlide: 0,
		pager: true,
		controls: true,
		infiniteLoop: true,
		autoPlay: true,
		pause: 5000
	}
	$.fn.slider = function (options) {
		if (this.length === 0) {
			return this
		}

		// support multiple elements
		if (this.length > 1) {
			this.each(function () {
				$(this).slider(options)
			})
			return this
		}

		const slider = {}

		// set a reference to our slider element
		const el = this

		let windowHeight = $(window).height()
		let windowWidth = $(window).width()

		// Return if slider is already initialized
		if ($(el).data('slider')) {
			return
		}

		function init() {
			// Return if slider is already initialized
			if ($(el).data('slider')) {
				return
			}
			// merge user-supplied options with the defaults
			slider.settings = $.extend({}, defaults, options)
			// store the original children
			slider.children = el.children()

			// activate plugin if we have multiple slide else it's not useful to use slider
			if (slider.children.length > 1) {
				// store active slide information
				slider.active = {index: slider.settings.startSlide}
				// store the current state of the slider (if currently animating, working is true)
				slider.working = false
				// initialize the controls object
				slider.navigation = {}
				slider.controls = {}
				slider.pager = {}
				// initialize an auto interval
				slider.interval = null

				// perform all DOM / CSS modifications
				setup()
			}
		}

		function setup() {
			// wrap el in a wrapper
			el.wrapInner(`<div class="${slider.settings.className}__wrapper"></div>`)

			slider.wrapper = el.find('> div')

			// create an element to contain controls
			slider.navigation.el = $(`<div class="${slider.settings.className}__nav"></div>`)
			// check if startSlide is last slide
			slider.active.last = slider.settings.startSlide === slider.children.length - 1
			// if controls are requested, add them
			if (slider.settings.controls) {
				appendControls()
			}
			// if pager is requested, add it
			if (slider.settings.pager) {
				appendPager()
			}
			// if any control option is requested, add the controls wrapper
			if (slider.settings.controls || slider.settings.pager) {
				slider.wrapper.after(slider.navigation.el)
			}

			start()
		}

		function start() {
			const widthWrapperPercent = 100

			// if infinite loop, prepare additional slides
			if (slider.settings.infiniteLoop) {
				const slice = 1
				const sliceAppend = slider.children.slice(0, slice).clone(true).addClass(`${slider.settings.className}__clone js-clone-append`)
				const slicePrepend = slider.children.slice(-slice).clone(true).addClass(`${slider.settings.className}__clone js-clone-prepend`)
				slider.wrapper.append(sliceAppend).prepend(slicePrepend)
				slider.children.clone = el.find(`.${slider.settings.className}__item`)
				slider.children.clone.css({width: `${widthWrapperPercent / slider.children.clone.length}%`})
				slider.wrapper.css({width: `${widthWrapperPercent * slider.children.clone.length}%`})
			} else {
				slider.children.css({width: `${widthWrapperPercent / slider.children.length}%`})
				slider.wrapper.css({width: `${widthWrapperPercent * slider.children.length}%`})
			}

			// set the left / top position of "el"
			setSlidePosition()
			// set the wrapper height
			slider.wrapper.height(getWrapperHeight())
			// slider has been fully initialized
			slider.initialized = true
			// bind the resize call to the window
			$(window).off('resize.slider').on('resize.slider', resizeWindow)
			// if auto is true and has more than 1 page, start the show
			if (slider.settings.autoPlay && slider.children.length > 1) {
				initAuto()
			}
			// if pager is requested, make the appropriate pager link active
			if (slider.settings.pager) {
				updatePagerActive(slider.settings.startSlide)
			}
			// check for any updates to the controls (like hideControlOnEnd updates)
			if (slider.settings.controls) {
				updateControls()
			}
		}

		/**
		 * Returns the calculated height of the wrapper, used to determine either adaptiveHeight or the maxHeight value
		 * @return {int} height - Height of wrapper
		 */
		function getWrapperHeight() {
			let height = 0
			// first determine which children (slides) should be used in our height calculation
			const children = slider.children

			height = Math.max.apply(Math, children.map(function () {
				return $(this).outerHeight(false)
			}).get())

			return height
		}

		/**
		 * Sets the slider's wrapper left position
		 * @return {void}
		 */
		function setSlidePosition() {
			let position
			// if last slide, not infinite loop
			if (slider.active.last && !slider.settings.infiniteLoop) {
				// get the last child's position
				const lastChild = slider.children.last()
				position = lastChild.position()
				// if not last slide
			} else {
				// get the position of the first showing slide
				position = slider.children.eq(slider.active.index).position()
				// check for last slide
				if (slider.active.index === slider.children.length - 1) {
					slider.active.last = true
				}
			}
			if (typeof position !== 'undefined') {
				setPositionProperty(-position.left, 'reset', 0)
			}
		}

		/**
		 * Sets the el's animating property position (which in turn will sometimes animate el).
		 * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
		 * @param {int} value - the animating property's value
		 * @param {string} type 'slide', 'reset', 'ticker' b- the type of instance for which the function is being
		 * @param {int} duration - the amount of time (in ms) the transition should occupy
		 * @return {void}
		 */
		function setPositionProperty(value, type, duration) {
			const animateObj = {left: value}
			if (type === 'slide') {
				slider.wrapper.animate(animateObj, duration, slider.settings.easing, () => {
					setSlidePosition()
				})
			} else {
				slider.wrapper.css({left: value})
			}
		}

		/**
		 * Populates the pager with proper amount of pages
		 * @return {void}
		 */
		function populatePager() {
			const pagerQty = slider.children.length
			let pagerHtml = ''
			let linkContent = ''
			// loop through each pager item
			for (let i = 0; i < pagerQty; i++) {
				linkContent = i + 1
				// add the markup to the string
				pagerHtml += `<a href="#" class="${slider.settings.className}__pager-item" data-slide-index="${i}">${linkContent}</a>`
			}
			// populate the pager element with pager links
			slider.pager.el.html(pagerHtml)
		}

		/**
		 * Appends the pager to the controls element
		 * @return {void}
		 */
		function appendPager() {
			// create the pager DOM element
			slider.pager.el = $(`<div class="${slider.settings.className}__pager" />`)
			// add the pager elements
			slider.navigation.el.addClass('has-pager').append(slider.pager.el)
			// populate the pager
			populatePager()
			// assign the pager click binding
			slider.pager.el.off('click.slider touchend.slider', 'a').on('click.slider touchend.slider', 'a', handlerClickPager)
		}

		/**
		 * Appends prev / next controls to the controls element
		 * @return {void}
		 */
		function appendControls() {
			slider.controls.next = $(`<a class="${slider.settings.className}__next" href="#"><svg class="o-svg"><use xlink:href="#arrow"/></svg></a>`)
			slider.controls.prev = $(`<a class="${slider.settings.className}__prev" href="#"><svg class="o-svg"><use xlink:href="#arrow"/></svg></a>`)
			// bind click actions to the controls
			slider.controls.next.off('click.slider touchend.slider').on('click.slider touchend.slider', handlerClickNext)
			slider.controls.prev.off('click.slider touchend.slider').on('click.slider touchend.slider', handlerClickPrev)
			// add the controls to the DOM
			slider.controls.el = $(`<div class="${slider.settings.className}__controls" />`)
			// add the control elements
			slider.controls.el.append(slider.controls.prev).append(slider.controls.next)
			slider.navigation.el.addClass('has-controls').append(slider.controls.el)
		}

		/**
		 * Click next binding
		 * @param {event} e - DOM event object
		 * @return {void}
		 */
		function handlerClickNext(e) {
			e.preventDefault()
			if (slider.controls.el.hasClass('disabled')) {
				return
			}
			// if auto show is running, stop it
			if (slider.settings.auto) {
				el.stopAuto()
			}
			el.goToNextSlide()
		}

		/**
		 * Click prev binding
		 * @param {event} e - DOM event object
		 * @return {void}
		 */
		function handlerClickPrev(e) {
			e.preventDefault()
			if (slider.controls.el.hasClass('disabled')) {
				return
			}
			// if auto show is running, stop it
			if (slider.settings.auto) {
				el.stopAuto()
			}
			el.goToPrevSlide()
		}

		/**
		 * Click pager binding
		 * @param {event} e - DOM event object
		 * @return {void}
		 */
		function handlerClickPager(e) {
			const pagerLink = $(e.currentTarget)
			e.preventDefault()
			if (slider.pager.el.hasClass('disabled')) {
				return
			}
			// if auto show is running, stop it
			if (slider.settings.auto) {
				el.stopAuto()
			}
			if (typeof pagerLink.attr('data-slide-index') !== 'undefined') {
				const pagerIndex = parseInt(pagerLink.attr('data-slide-index'), 10)
				// if clicked pager link is not active, continue with the goToSlide call
				if (pagerIndex !== slider.active.index) {
					el.goToSlide(pagerIndex)
				}
			}
		}

		/**
		 * Updates the pager links with an active class
		 * @param {int} slideIndex - index of slide to make active
		 * @return {void}
		 */
		function updatePagerActive(slideIndex) {
			// remove all pager active classes
			slider.pager.el.find('.active').removeClass('active')
			// apply the active class for all pagers
			slider.pager.el.each((i, el) => {
				$(el).find('a').eq(slideIndex).addClass('active')
			})
		}

		/**
		 * Updates the direction controls (checks if either should be hidden)
		 * @return {void}
		 */
		function updateControls() {
			if (slider.children.length === 1) {
				slider.controls.prev.addClass('disabled')
				slider.controls.next.addClass('disabled')
			} else if (!slider.settings.infiniteLoop) {
				// if first slide
				if (slider.active.index === 0) {
					slider.controls.prev.addClass('disabled')
					slider.controls.next.removeClass('disabled')
					// if last slide
				} else if (slider.active.index === slider.children.length - 1) {
					slider.controls.next.addClass('disabled')
					slider.controls.prev.removeClass('disabled')
					// if any slide in the middle
				} else {
					slider.controls.prev.removeClass('disabled')
					slider.controls.next.removeClass('disabled')
				}
			}
		}

		/**
		 * Initializes the auto process
		 * @return {void}
		 */
		function initAuto() {
			el.startAuto()

			// on el hover
			el.hover(() => {
				// if the auto show is currently playing (has an active interval)
				if (slider.interval) {
					// stop the auto show and pass true argument which will prevent control update
					el.stopAuto(true)
					// create a new autoPaused value which will be used by the relative "mouseout" event
					slider.autoPaused = true
				}
			}, () => {
				// if the autoPaused value was created be the prior "mouseover" event
				if (slider.autoPaused) {
					// start the auto show and pass true argument which will prevent control update
					el.startAuto(true)
					// reset the autoPaused value
					slider.autoPaused = null
				}
			})
		}

		/**
		 * Window resize event callback
		 * @return {void}
		 */
		function resizeWindow() {
			// don't do anything if slider isn't initialized.
			if (!slider.initialized) {
				return
			}
			// Delay if slider working.
			if (slider.working) {
				const timerResize = 10
				window.setTimeout(resizeWindow, timerResize)
			} else {
				// get the new window dimensions
				const windowHeightNew = $(window).height()
				const windowWidthNew = $(window).width()
				// make sure that it is a true window resize
				if (windowHeight !== windowHeightNew || windowWidth !== windowWidthNew) {
					// set the new window dimensions
					windowHeight = windowHeightNew
					windowWidth = windowWidthNew
					// update all dynamic elements
					el.reloadSlider()
				}
			}
		}

		/**
		 * Returns index according to present page range
		 * @param {int} slideIndex - the desired slide index
		 * @return {int} slideIndex - the new slide index
		 */
		function setSlideIndex(slideIndex) {
			if (slideIndex < 0) {
				if (slider.settings.infiniteLoop) {
					return slider.children.length - 1
				}
				// we don't go to undefined slides
				return slider.active.index
			} else if (slideIndex >= slider.children.length) {
				// if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
				if (slider.settings.infiniteLoop) {
					return 0
				}
				// we don't move to undefined pages
				return slider.active.index
			}
			// set active index to requested slide
			return slideIndex
		}

		/**
		 * Performs slide transition to the specified slide
		 * @param {int} slideIndex - the destination slide's index (zero-based)
		 * @param {string} direction - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
		 * @return {void}
		 */
		el.goToSlide = function (slideIndex, direction) {
			// onSlideBefore, onSlideNext, onSlidePrev callbacks
			// Allow transition canceling based on returned value
			let position = {left: 0, top: 0}
			let lastChild = null
			let value
			// store the old index
			slider.oldIndex = slider.active.index
			// set new index
			slider.active.index = setSlideIndex(slideIndex)

			// if plugin is currently in motion, ignore request
			if (slider.working || slider.active.index === slider.oldIndex) {
				return
			}
			// declare that plugin is in motion
			slider.working = true

			// check if last slide
			slider.active.last = slider.active.index >= slider.children.length - 1
			// update the pager with active class
			if (slider.settings.pager) {
				updatePagerActive(slider.active.index)
			}
			// check for direction control update
			if (slider.settings.controls) {
				updateControls()
			}
			if (!slider.settings.infiniteLoop && slider.active.last) {
				// get the last child position
				lastChild = slider.children.eq(slider.children.length - 1)
				position = lastChild.position()
				// horizontal carousel, going previous while on first slide (infiniteLoop mode)
			} else if (slider.active.last && direction === 'prev') {
				// get the last child position
				position = slider.wrapper.children(`.${slider.settings.className}__item`).eq(0).position()
				// if infinite loop and "Next" is clicked on the last slide
			} else if (slider.active.index === 0 && direction === 'next') {
				// get the last clone position
				position = slider.wrapper.find(`> .${slider.settings.className}__item`).eq(slider.children.length + 1).position()
				slider.active.last = false
				// normal non-zero requests
			} else if (slideIndex >= 0) {
				position = slider.children.eq(slideIndex).position()
			}
			if (typeof position !== 'undefined') {
				value = -position.left
				// plugin values to be animated
				setPositionProperty(value, 'slide', slider.settings.speed)
			}
			slider.working = false
		}

		/**
		 * Transitions to the next slide
		 * @return {void}
		 */
		el.goToNextSlide = function () {
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.last || slider.working === true) {
				return
			}
			const newSlideIndex = parseInt(slider.active.index, 10) + 1
			el.goToSlide(newSlideIndex, 'next')
		}

		/**
		 * Transitions to the prev slide
		 * @return {void}
		 */
		el.goToPrevSlide = function () {
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.index === 0 || slider.working === true) {
				return
			}
			const newSlideIndex = parseInt(slider.active.index, 10) - 1
			el.goToSlide(newSlideIndex, 'prev')
		}

		/**
		 * Starts auto play
		 * @return {void}
		 */
		el.startAuto = function () {
			// if an interval already exists, disregard call
			if (slider.interval) {
				return
			}
			// create an interval
			slider.interval = setInterval(() => {
				el.goToNextSlide()
			}, slider.settings.pause)
		}

		/**
		 * Stops auto play
		 * @return {void}
		 */
		el.stopAuto = function () {
			// if no interval exists, disregard call
			if (!slider.interval) {
				return
			}
			// clear the interval
			clearInterval(slider.interval)
			slider.interval = null
		}

		/**
		 * Returns current slide index (zero-based)
		 * @return {int} slider.active.index
		 */
		el.getCurrentSlide = function () {
			return slider.active.index
		}

		/**
		 * Returns current slide element
		 * @return {Object} slider.children.eq()
		 */
		el.getCurrentSlideElement = function () {
			return slider.children.eq(slider.active.index)
		}

		/**
		 * Returns a slide element
		 * @param {int} index - The index (zero-based) of the element you want returned.
		 * @return {Object} slider.children.eq()
		 */
		el.getSlideElement = function (index) {
			return slider.children.eq(index)
		}

		/**
		 * Returns number of slides in show
		 * @return {int} slider.children.length
		 */
		el.getSlideCount = function () {
			return slider.children.length
		}

		/**
		 * Return slider.working variable
		 * @return {boolean} slider.working
		 */
		el.isWorking = function () {
			return slider.working
		}

		/**
		 * Destroy the current instance of the slider (revert everything back to original state)
		 * @return {void}
		 */
		el.destroySlider = function () {
			// don't do anything if slider has already been destroyed
			if (!slider.initialized) {
				return
			}
			slider.initialized = false
			$(`.${slider.settings.className}__clone`, this).remove()
			slider.children.css({width: ''})

			slider.children.unwrap()

			if (slider.controls.next) {
				slider.controls.next.remove()
			}
			if (slider.controls.prev) {
				slider.controls.prev.remove()
			}
			if (slider.controls.el) {
				slider.controls.el.remove()
			}
			if (slider.pager.el) {
				slider.pager.el.remove()
			}
			if (slider.navigation.el) {
				slider.navigation.el.remove()
			}
			clearInterval(slider.interval)
			$(this).removeData('slider')
		}

		/**
		 * Reload the slider (revert all DOM changes, and re-initialize)
		 * @param {object} settings - Slider settings
		 * @return {void}
		 */
		el.reloadSlider = function (settings) {
			if (typeof settings !== 'undefined') {
				options = settings
			}
			el.destroySlider()
			init()
			// store reference to self in order to access public functions later
			$(el).data('slider', this)
		}

		init()

		$(el).data('slider', this)

		// returns the current jQuery object
		return this
	}
})(jQuery)
