Tuto = function () {


    var base = this;

    var minHeight = 700;

    var iphoneSelector;
    var androidSelector;
    var windowHeight;
    var phonesContainer;
    var phonesTop;
    var slider;
    var zoomRatio;
    var is_firefox;

    var handleScrollEvent = function () {
        $(document).scroll(function () {
            var scrollTop = $(document).scrollTop();
            step1(scrollTop);
            step2(scrollTop);
            step3(scrollTop);
            step4(scrollTop);
            step5(scrollTop);
            step6(scrollTop);
            step7(scrollTop);
            step8(scrollTop);
            step9(scrollTop);
            step10(scrollTop);
        });
    };

    var handleResizeEvent = function () {
        $(window).resize(function () {
            setLayoutSize();
            var scrollTop = $(document).scrollTop();
            step1(scrollTop);
            step2(scrollTop);
            step3(scrollTop);
            step4(scrollTop);
            step5(scrollTop);
            step6(scrollTop);
            step7(scrollTop);
            step8(scrollTop);
            step9(scrollTop);
            step10(scrollTop);
        });
    };

    var step1 = function (scrollTop) { // Fix Phones
        var top = 0;
        if (scrollTop > windowHeight) {
            phonesContainer.css('position', 'fixed');
            phonesContainer.css({
                top: 200
            });
        } else {
            phonesContainer.css('position', 'absolute');
            top = Math.max(0, phonesTop);
            top += 200;
            phonesContainer.css({
                top: top
            });
        }
    };

    var step2 = function (scrollTop) { // Gather Phone
        var ratio = 75 / 300;
        var translate = (scrollTop - ((2 * windowHeight) - windowHeight / 2)) * ratio;
        translate = Math.max(0, Math.min(70, translate));

        androidSelector.css('left', 150 - translate);
        iphoneSelector.css('left', translate);
        
    };

    var step3 = function (scrollTop) { // Add picto
        /*var picto1 = iphoneSelector.find('.picto-1');
        var picto2 = iphoneSelector.find('.picto-2');
        var picto3 = iphoneSelector.find('.picto-3');
        var picto4 = iphoneSelector.find('.picto-4');
        var picto5 = iphoneSelector.find('.picto-5');

        if (scrollTop > (windowHeight * 2)) {
            
            picto1.css({'left': '176px', 'top': '104px', 'width': '160px'});
            picto2.css({'left': '8px', 'top': '361px', 'width': '160px'});
            picto3.css({'left': '176px', 'top': '432px', 'width': '160px'});
            picto4.css({'left': '176px', 'top': '432px', 'width': '160px', 'opacity': 0});
            picto5.css({'left': '8px', 'top': '104px', 'width': '160px', 'opacity': 0});
        } else {
            picto1.css({'left': '8px', 'top': '104px', 'width': '160px'});
            picto2.css({'left': '176px', 'top': '104px', 'width': '160px'});
            picto3.css({'left': '8px', 'top': '432px', 'width': '160px'});
            picto4.css({'left': '176px', 'top': '412px', 'width': '160px', 'opacity': 0});
            picto5.css({'left': '8px', 'top': '104px', 'width': '160px', 'opacity': 0});

        }*//*
        var my_bg = iphoneSelector.find('.my_bg');
        if (scrollTop > (windowHeight * 2)) {
            my_bg.addClass('zoom');
            console.log("PASSOU AQUI!!!");
        } else {
            my_bg.removeClass('zoom');
        }
        */
        if (scrollTop > (windowHeight * 1.8)) {
            var my_bg = iphoneSelector.find('.my_bg');
            my_bg.css({'opacity': '0'});
            console.log("PASSOU AQUI!!!");
        } else {
            var my_bg = iphoneSelector.find('.my_bg');
            my_bg.css({'opacity': '1'});
            console.log("OK OK OK OK!!!");
        }
    };

    var step4 = function (scrollTop) { // Press picto
        /*var picto5 = iphoneSelector.find('.picto-5');
        if (scrollTop > ((3 * windowHeight) - windowHeight / 2) - 80) {
            picto5.addClass('zoom');
        } else {
            picto5.removeClass('zoom');
        }*/
    };

    var step5 = function (scrollTop) { // Slide To profile
        var ratio = 344 / 300;
        var translate = (scrollTop - ((3 * windowHeight) - windowHeight / 2)) * ratio;
        translate = Math.max(0, Math.min(344, translate));

        var picto5 = iphoneSelector.find('.picto-5');

        if(scrollTop < (3 * windowHeight)){
            if (!is_firefox && picto5.css('zoom') == "1") {
                slider.css('left', -translate);
            }else if(is_firefox && picto5.css('-moz-transform') == "none"){
                slider.css('left', -translate);
            }
        }

    };

    var step6 = function (scrollTop) { //Scroll on profile
        var img = $('.iphone-layout-profile.iphone-layout img.profile-content');
        if (scrollTop > windowHeight * 3.2) {
            img.addClass('top');
        } else {
            img.removeClass('top');
        }
    };

    var step7 = function (scrollTop) { // Press like
        var btnLike = $('.btn-like').find('img').first();
        if (scrollTop > (windowHeight * 3) + 300) {
            btnLike.addClass('zoom');
        } else {
            btnLike.removeClass('zoom');
        }
    };

    var step8 = function (scrollTop) { // Scroll to Converation
        if(scrollTop < (3.75 * windowHeight)){
            return;
        }
        var ratio = 326 / 300;
        var translate = (scrollTop - ((3 * windowHeight) - windowHeight / 2)) * ratio;
        translate = Math.max(326, Math.min(688, translate));

        var img = $('.btn-like').find('img').first();

        if (!is_firefox && img.css('zoom') == "1") {
            slider.css('left', -translate);
        }else if(is_firefox && img.css('-moz-transform') == "none"){
            slider.css('left', -translate);
        }

    };

    var step9 = function (scrollTop) {
        var img = $('.iphone-layout-conversation.iphone-layout .conversation-content');
        if (scrollTop > windowHeight * 3.75) {
            img.addClass('top');
        } else {
            img.removeClass('top');
        }
    };

    var step10 = function (scrollTop) {
        if (scrollTop > (windowHeight * 4)) {
            phonesContainer.css('position', 'absolute');
            var pos_top = 0;
            if(is_firefox){
                pos_top = ((windowHeight * 4)) + windowHeight - (phonesContainer.height() * zoomRatio);
            }else {
                pos_top = ((windowHeight * 4 + windowHeight - (phonesContainer.height() * zoomRatio)))  * (1/ zoomRatio);
            }
            phonesContainer.css('top', pos_top);
        }
    };

    var setLayoutSize = function () {
        phonesContainer = $('#phones-container');
        windowHeight = Math.max(700, $(window).height());

        var slide = $('#app-concept').find('.table-cell');
        var firstSlide = slide.first();

        zoomRatio = (firstSlide.height() / (iphoneSelector.height() + 100));

        is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
        var pos_left = 0;
        var pos_top = 0;
        if(is_firefox){
            pos_left = ((firstSlide.offset().left + firstSlide.width())) + 70;
            pos_top = (firstSlide.offset().top);
        }else {
            pos_left = ((firstSlide.offset().left + firstSlide.width())) * (1 / zoomRatio) + 70;
            pos_top = (firstSlide.offset().top) * (1 / zoomRatio);
        }

        phonesContainer.css({
            'left': parseInt(pos_left),
            'top': parseInt(pos_top),
            'zoom': zoomRatio,
            '-ms-zoom': zoomRatio,
            '-webkit-zoom': zoomRatio,
            '-moz-transform': 'scale(' + zoomRatio + ',' + zoomRatio + ')',
            '-moz-transform-origin': 'left top'
        });

        phonesContainer.height(windowHeight);
        phonesContainer.width(slide.width());
        phonesTop = parseInt(phonesContainer.css('top'));
    };

    var init = function () {
        iphoneSelector = $('.iphone-container');
        androidSelector = $('.android-container');
        setLayoutSize();
        slider = $('.scroll-container');

        handleScrollEvent();
        handleResizeEvent();
    };


    return {
        'init': init
    }
}();