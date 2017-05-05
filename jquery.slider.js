(function($) {
	$.fn.slider = function(args) {
		var defaults = {
			width: 615,
			speed: 5000,
			speedTransition: 500,
			classSlide: 'slide',
			nav: true,
			classContainerSlider: 'ctn-slider',
			classContainerNav: 'ctn-nav',
			idContainerGallery: 'gallery',
			idContainerGalleryNav: 'gallery-nav',
			addNav: false,
			posNav: 'children',
			addIDNav: '',
			addClassNav: '',
			clone: true,
			gallery: false,
			nbnavgallery: 5,
			validationRequired: false,
			validateForm: false,
			callback: function() {},
			beforeEvtClick: function() {}
		};
		var opts = $.extend(defaults, args);
		var ele = this;
		var numSlide;
		var i = 0;
		var inav = 0;
		var w = 0;
		var wgallery = 0;
		var last;
		var first;
		var timer = 0;
		var t;
		var idleTime = 0;
		var navGenerate = '';
		var selectEvt;
		var correctionMarginleftGallery = 6;
		var init = function() {
			w = $(ele).find('.' + opts.classSlide).first().outerWidth(true);
			numSlide = $(ele).find('.' + opts.classSlide).size();
			last = $(ele).find('.' + opts.classSlide).last();
			first = $(ele).find('.' + opts.classSlide).first();
			if (numSlide > 1) {
				if (opts.clone == true) {
					last.clone().prependTo($(ele).find('.' + opts.classContainerSlider));
					first.clone().appendTo($(ele).find('.' + opts.classContainerSlider));
				}
				if (opts.clone == true) {
					$(ele).find('.' + opts.classSlide).first().css('margin-left', '-' + w + 'px');
				}
				if (opts.speed) {
					timedCount();
					var idleInterval = setInterval(function() {
						idleTime++;
						if (idleTime >= 10) {
							ele.stopCount();
							timedCount();
						}
					}, 1500);
				}
				if (opts.addNav) {
					navGenerate += '<div id="' + opts.addIDNav + '" class="' + opts.classContainerNav + ' ' + opts.addClassNav + '"><a class="prev" href="javascript:;">Précédent</a><ul>';
					for (var x = 0; x < numSlide; x++) {
						if (x == 0)
							navGenerate += '<li class="active" rel="' + (x + 1) + '">' + (x + 1) + '</li>';
						else
							navGenerate += '<li rel="' + (x + 1) + '">' + (x + 1) + '</li>';
					}
					navGenerate += '</ul><a class="next" href="javascript:;">Suivant</a></div>';
					if (opts.posNav == 'parent')
						$(ele).find('.' + opts.classContainerSlider).parent().after(navGenerate);
					else
						$(ele).find('.' + opts.classContainerSlider).after(navGenerate);
					evtNav();
				} else if (opts.nav) {
					evtNav();
				}
			} else if (opts.nav) {
				$(ele).find('.' + opts.classContainerNav).find('.prev, .next').hide();
				if (opts.gallery)
					$('#' + opts.idContainerGalleryNav + ' .prev, #' + opts.idContainerGalleryNav + ' .next').hide();
			}
		};
		var evtNav = function() {
			selectEvt = $(ele).find('.' + opts.classContainerNav);
			if (opts.addNav) {
				if (opts.posNav == 'parent')
					selectEvt = $(ele).parent().find('.' + opts.classContainerNav);
				else
					selectEvt = $(ele).find('.' + opts.classContainerNav);
				selectEvt.find('li').click(function() {
					opts.beforeEvtClick.call(this);
					i = parseFloat($(this).attr('rel')) - 1;
					$(ele).find('.' + opts.classContainerSlider).animate({
						marginLeft: -(w * i)
					}, opts.speedTransition, function() {
						selectEvt.find('li').removeClass('active');
						selectEvt.find('li[rel="' + (i + 1) + '"]').addClass('active');
						opts.callback.call(this, i);
					});
				});
			}
			selectEvt.find('.prev').click(function() {
				opts.beforeEvtClick.call(this);
				if ((opts.validationRequired == true && opts.validateForm == true) || opts.validationRequired == false) {
					ele.stopCount();
					if (opts.clone == false && (i - 1) < 0) {} else {
						i--;
						if (opts.validationRequired == true) {
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + i + '] .hiddenblocktab').removeClass('hide').addClass('show');
						}
						$(ele).find('.' + opts.classContainerSlider).animate({
							marginLeft: -(w * i)
						}, opts.speedTransition, function() {
							if (i < 0) {
								i = numSlide - 1;
								$(ele).find('.' + opts.classContainerSlider).css('marginLeft', -(w * i) + 'px');
							}
							if (opts.addNav) {
								selectEvt.find('li').removeClass('active');
								selectEvt.find('li[rel="' + (i + 1) + '"]').addClass('active');
							} else if (opts.gallery) {
								$('#' + opts.idContainerGallery + ' img').removeClass('active');
								$('#' + opts.idContainerGallery + ' img[rel=' + (i + 1) + ']').addClass('active');
							}
							if (opts.clone == false && i == 0) {
								selectEvt.find('.prev').hide();
							} else {
								selectEvt.find('.next').show();
							}
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide).removeClass('active');
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + i + ']').addClass('active');
							if (opts.validationRequired == true) {
								$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + (i + 1) + '] .hiddenblocktab').removeClass('hide').addClass('show');
							}
							opts.callback.call(this, i);
						});
					}
				}
			});
			selectEvt.find('.next').click(function() {
				opts.beforeEvtClick.call(this);
				if ((opts.validationRequired == true && opts.validateForm == true) || opts.validationRequired == false) {
					ele.stopCount();
					if (opts.clone == false && (i + 2) > numSlide) {} else {
						i++;
						if (opts.validationRequired == true) {
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + i + '] .hiddenblocktab').removeClass('hide').addClass('show');
						}
						$(ele).find('.' + opts.classContainerSlider).animate({
							marginLeft: -(w * i)
						}, opts.speedTransition, function() {
							if (i > numSlide - 1 && opts.clone == true) {
								i = 0;
								$(ele).find('.' + opts.classContainerSlider).css('marginLeft', -(w * i) + 'px');
							}
							if (opts.addNav) {
								selectEvt.find('li').removeClass('active');
								selectEvt.find('li[rel="' + (i + 1) + '"]').addClass('active');
							} else if (opts.gallery) {
								$('#' + opts.idContainerGallery + ' img').removeClass('active');
								$('#' + opts.idContainerGallery + ' img[rel=' + (i + 1) + ']').addClass('active');
							}
							if (opts.clone == false && i + 1 == numSlide) {
								selectEvt.find('.next').hide();
							} else {
								selectEvt.find('.prev').show();
							}
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide).removeClass('active');
							$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + i + ']').addClass('active');
							if (opts.validationRequired == true) {
								$('.' + opts.classContainerSlider + ' .' + opts.classSlide + '[rel=' + (i - 1) + '] .hiddenblocktab').removeClass('hide').addClass('show');
							}
							opts.callback.call(this, i);
						});
					}
				}
			});
			if (opts.gallery) {
				wgallery = $('#' + opts.idContainerGallery + ' img').first().outerWidth() + correctionMarginleftGallery;
				nbgallery = $('#' + opts.idContainerGallery + ' img').size();
				$('#' + opts.idContainerGallery + ' img').click(function() {
					opts.beforeEvtClick.call(this);
					i = $(this).attr('rel') - 1;
					$(ele).find('.' + opts.classContainerSlider).animate({
						marginLeft: -(w * i)
					}, 500, function() {
						opts.callback.call(this, i);
					});
					$('#' + opts.idContainerGallery + ' img').removeClass('active');
					$('#' + opts.idContainerGallery + ' img[rel=' + (i + 1) + ']').addClass('active');
				});
				if (nbgallery > opts.nbnavgallery) {
					$('#' + opts.idContainerGalleryNav + ' .next').click(function() {
						opts.beforeEvtClick.call(this);
						if ((inav + 1) < nbgallery && (inav + 1) <= opts.nbnavgallery) {
							inav++;
							$('#' + opts.idContainerGallery).animate({
								marginLeft: -(wgallery * inav)
							}, 500, function() {
								opts.callback.call(this, i);
							});
						}
						if (inav > 0)
							$('#' + opts.idContainerGalleryNav + ' .prev').removeClass('off');
						if (inav == opts.nbnavgallery)
							$('#' + opts.idContainerGalleryNav + ' .next').addClass('off');
					});
					$('#' + opts.idContainerGalleryNav + ' .prev').click(function() {
						opts.beforeEvtClick.call(this);
						if ((inav - 1) >= 0) {
							inav--;
							$('#' + opts.idContainerGallery).animate({
								marginLeft: -(wgallery * inav)
							}, 500, function() {
								opts.callback.call(this, i);
							});
						}
						if (inav < opts.nbnavgallery)
							$('#' + opts.idContainerGalleryNav + ' .next').removeClass('off');
						if (inav == 0)
							$('#' + opts.idContainerGalleryNav + ' .prev').addClass('off');
					});
				} else {
					$('#' + opts.idContainerGalleryNav + ' .next, #' + opts.idContainerGalleryNav + ' .prev').hide();
				}
			}
		};
		var play = function() {
			i++;
			$(ele).find('.' + opts.classContainerSlider).animate({
				marginLeft: -(w * i)
			}, opts.speedTransition, function() {
				if (i > numSlide - 1) {
					i = 0;
					$(ele).find('.' + opts.classContainerSlider).css('marginLeft', -(w * i) + 'px');
				}
				if (opts.addNav || opts.nav) {
					if (opts.posNav == 'parent') {
						$(ele).parent().find('.' + opts.classContainerNav).find('li').removeClass('active');
						$(ele).parent().find('.' + opts.classContainerNav).find('li[rel="' + (i + 1) + '"]').addClass('active');
					} else {
						$(ele).find('.' + opts.classContainerNav).find('li').removeClass('active');
						$(ele).find('.' + opts.classContainerNav).find('li[rel="' + (i + 1) + '"]').addClass('active');
					}
				} else if (opts.gallery) {
					$('#' + opts.idContainerGallery + ' img').removeClass('active');
					$('#' + opts.idContainerGallery + ' img[rel=' + (i + 1) + ']').addClass('active');
				}
				opts.callback.call(this, i);
			});
		};
		this.setValidateForm = function(value) {
			opts.validateForm = value;
		};
		var timedCount = function() {
			if (timer)
				play();
			timer = 1;
			idleTime = 0;
			t = setTimeout(function() {
				timedCount();
			}, opts.speed);
		};
		this.stopCount = function() {
			clearTimeout(t);
			timer = 0;
		};
		this.initialize = function() {
			init();
			return this;
		};
		return this.initialize();
	};
})(jQuery);