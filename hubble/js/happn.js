Website = function () {

    this.options = undefined;

    var base = this;

    var pendingLogin = false;
    var pendingSynchronization = false;

    var minHeight = 700;

    var initSlidebar = function () {

        $('.main-container').click(function (event) {
            var zoom;
            var left;
            var mainContainer = $('.main-container');
            var header = $('header');
            var topBar = $('.top-bar');
            var phonesContainer = $('#phones-container');
            if (mainContainer.has('pull')) {
                if (phonesContainer.length > 0 && phonesContainer.is(':hidden')) {
                    phonesContainer.fadeIn(400);
                }
                mainContainer.removeClass('pull');
                header.removeClass('pull');
                topBar.removeClass('pull');
                dataLayer.push({event: "desktop.menu.burger.close"});
            }
            return true;
        });

        $('header .menu-btn').click(function () {
            var zoom;
            var left;
            var mainContainer = $('.main-container');
            var header = $('header');
            var topBar = $('.top-bar');
            var phonesContainer = $('#phones-container');
            if (mainContainer.hasClass('pull')) {
                if (phonesContainer.length > 0 && phonesContainer.is(':hidden')) {
                    phonesContainer.fadeIn(400);
                }
                mainContainer.removeClass('pull');
                header.removeClass('pull');
                topBar.removeClass('pull');
                dataLayer.push({event: "desktop.menu.burger.close"});
                console.log("close");
            } else {
                if (phonesContainer.length > 0 && phonesContainer.is(':visible')) {
                    phonesContainer.fadeOut(400)
                }
                mainContainer.addClass('pull');
                header.addClass('pull');
                topBar.addClass('pull');
                dataLayer.push({event: "desktop.menu.burger.open"});
            }
            return false;
        });

    };

    var initSlideBarLinkListener = function () {
        $('nav').find('a.text-menu').click(function () {
            if ($(this).attr('href').indexOf('#') > 0) {
                var mainContainer = $('.main-container');
                var phonesContainer = $('#phones-container');
                if (phonesContainer.length > 0 && phonesContainer.is(':hidden')) {
                    phonesContainer.fadeIn(400);
                }
                if (mainContainer.hasClass('pull')) {
                    mainContainer.removeClass('pull');
                    $('header').removeClass('pull');
                    $('.top-bar').removeClass('pull');
                }
            }
        });
    };

    var initPage = function () {
        minHeight = $(window).height() > 700 ? $(window).height() : 700;
        if ($('.page').attr('data-min-height')) {
            $('.page').css('min-height', minHeight);
        } else {
            $('.page').height(minHeight);
        }
        $('.page-container').css('min-height', minHeight + "px");
        $('nav').css({'min-height': minHeight + "px"});
    };


    var setSlideSize = function () {
        var minWidth = $(window).width() > 300 ? $(window).width() : 300;
        $('.slide').width(minWidth);
        $('.slide-container').each(function () {
            $(this).data('width', minWidth);
            $(this).find('.slider').width($(this).find('.slide').size() * minWidth);
        });
        updateSlidewhow();
    };

    var updateSlidewhow = function () {
        $('.slide-container').each(function () {
            var container = $(this);
            var position = container.data('position');
            var width = container.data('width');

            container.find('.slider').css({
                transform: 'translate(-' + position * width + 'px,0px)'
            });
        });
        $(this)
    };

    var initSlider = function () {
        setSlideSize();
        $('.slide-container').each(function () {
            var container = $(this);
            container.data('position', 0);
            container.find('.controls .slide-left').click(function () {
                var position = container.data('position') - 1;
                position = Math.max(0, position);
                container.data('position', position);
                updateSlidewhow();
                return false;

            });
            container.find('.controls .slide-right').click(function () {
                var position = container.data('position') + 1;
                var max = container.find('.slide').size() - 1;
                position = Math.min(position, max);
                container.data('position', position);
                updateSlidewhow();
                return false;
            });
        });
    };

    var initResizeEvent = function () {
        window.onresize = function () {
            initPage();
            setSlideSize();
        };
    };

    var initScrollEvent = function () {
        $(document).scroll(function () {
            var scrollTop = $(document).scrollTop();
            var mainContainer = $('.main-container');
            if (scrollTop <= 0) {
                $('nav').css({'position': 'absolute', 'top': 0});
            } else if (scrollTop >= mainContainer.height() - $(window).height() + $('.footer').height()) {
                var t = Math.max(700, $(window).height());
                $('nav').css({'position': 'absolute', 'top': mainContainer.height() - t});
            } else {
                $('nav').css({'position': 'fixed', 'top': 0});
            }
        });
    };


    var facebookSetup = function (options) {
        $.ajaxSetup({cache: false});
        $.getScript('https://connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: options.appId,
                version: 'v2.2'
            });
        });
    };

    var post = function (path, params, method) {
        method = method || "post"; // Set method to post by default if not specified.

        // The rest of this code assumes you are not using a library.
        // It can be made less wordy if you use one.
        var form = document.createElement("form");
        form.setAttribute("method", method);
        form.setAttribute("action", path);

        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", params[key]);

                form.appendChild(hiddenField);
            }
        }

        document.body.appendChild(form);
        form.submit();
    };

    var facebookLogin = function (button) {
        if (!pendingLogin) {
            pendingLogin = true;
            disableLoginButton(button);
            var data = {};
            var scope = 'user_birthday,email,user_likes,user_about_me,user_photos,user_work_history,user_friends';
            FB.login(function (response) {
                if (response.authResponse) {
                    var sponsorCode = $('#sponsorship_code').val();
                    data.assertion = response.authResponse.accessToken;

                    if (sponsorCode != undefined && sponsorCode != null) {
                        data.sponsorship = sponsorCode;
                    }

                    post(base.loginUrl, data);
                } else {
                    pendingLogin = false;
                }
            }, {scope: scope});
        }
    };

    var facebookSynchronize = function () {
        var scope = 'user_birthday';
        FB.login(function (response) {
            if (response.authResponse) {
                $.post('/front/account/synchronize', {facebook_access_token: response.authResponse.accessToken}, function (response) {
                    if (response.success) {
                        alert("Ok")
                    } else {
                        alert("Not ok");
                    }
                });
            }
        }, {scope: scope});
    };

    var disableLoginButton = function (button) {
        if (button.hasClass('button-signup')) {
            button.removeClass('button-signup');
            button.addClass('button-signup-grey');
        } else if (button.hasClass('button-blue')) {
            button.removeClass('button-blue');
            button.addClass('button-grey');
        }
    };

    var enableLoginButton = function (button) {
        if (button.hasClass('button-signup-grey')) {
            button.removeClass('button-signup-grey');
            button.addClass('button-signup');
        } else if (button.hasClass('button-grey')) {
            button.removeClass('button-grey');
            button.addClass('button-blue');
        }
    };

    var setLoginListener = function () {
        $('.button-signup,.button-blue.signup,.button-facebook-connect').click(function (event) {
            event.preventDefault();
            facebookLogin($(this));

            return false;
        });
    };

    var setSynchronizeListener = function () {
        var button = $('.button-synchronize-fb');
        if (button.length > 0) {
            button.click(function (event) {
                event.preventDefault();
                facebookSynchronize($(this));

                return false;
            });
        }
    };

    var setDownloadLinkListener = function () {
        var buttonDownloadGreen = $('.button-download-green');
        if (buttonDownloadGreen.length > 0) {
            buttonDownloadGreen.click(function (event) {
                event.preventDefault();
                buttonDownloadGreen.hide();
                $('.nav-buttons-download').show().css({
                    'opacity': '1',
                    'display': 'block'
                });
                return false;
            });
        }
    };

    var initMenu = function () {
        var update = function () {
            if ($(document).scrollTop() > 0) {
                $('.top-bar').css({
                    'background-color': 'rgba(0,135,180,0.95)',
                    'border-bottom': '0px solid rgba(255,255,255,0)'
                });
                $('.logo-btn').css({
                    'opacity': '0.95'
                });
            } else {
                $('.top-bar').css({
                    'background-color': 'rgba(0,135,180,0)',
                    'border-bottom': '1px solid rgba(255,255,255,0.35)'
                });
                $('.logo-btn').css({
                    'opacity': '0'
                });
            }
        };
        $(document).scroll(function () {
            update();
        });
        update();
    };

    var initForms = function () {
        $(document).ready(function () {
            var contactForm = $('#contact-form');
            contactForm.submit(function () {
                if ($('[name=service]').val() == "press") {
                    dataLayer.push({event: "desktop.contact.form.send", "to": "Press"});
                } else if ($('[name=service]').val() == "client") {
                    dataLayer.push({event: "desktop.contact.form.send", "to": "Customer Service"});
                } else if ($('[name=service]').val() == "management") {
                    dataLayer.push({event: "desktop.contact.form.send", "to": "Partnership"});
                } else if ($('[name=service]').val() == "marketing") {
                    dataLayer.push({event: "desktop.contact.form.send", "to": "Marketing"});
                }
                $.post('contact', {
                    'service': $('[name=service]').val(),
                    'email': $('[name=email]').val(),
                    'message': $('[name=message]').val(),
                    'captcha': $('#g-recaptcha-response').val()
                }, function (response) {
                    if (response.success == true && typeof response.data.message != "undefined") {
                        contactForm.children().remove();
                        contactForm.append($("<span>").text(response.data.message));
                    }
                }).fail(function (xhr) {
                    var response = JSON.parse(xhr.responseText);
                    if (contactForm.children('div').length > 0) {
                        contactForm.children('div').remove();
                    }
                    contactForm.prepend($("<div style='color: red;'>").html(response.data.message));
                });
                return false;
            });

            $('#ambassador-form').submit(function () {
                $.post('/front/ambassador/ambassador', {
                    'first_name': $('[name=first_name]').val(),
                    'last_name': $('[name=last_name]').val(),
                    'country': $('[name=country]').val(),
                    'city': $('[name=city]').val(),
                    'email': $('[name=email]').val(),
                    'facebook_url': $('[name=facebook_url]').val(),
                    'nb_friends': $('[name=nb_friends]').val()
                }, function (response) {
                    if (response.success == true && typeof response.data.message != "undefined") {
                        $('#ambassador-form').children().remove();
                        $('#ambassador-form').append($("<span>").text(response.data.message));
                    } else if (response.success == false && typeof response.data.message != "undefined") {
                        $('#ambassador-form').children().remove();
                        $('#ambassador-form').append($("<span style='color: red;'>").text(response.data.message));
                    }
                });
                return false;
            });
        });

    };

    var togglePopup = function () {
        if ($('.popin-app-choice').is(':visible')) {
            $('.popin-app-choice').fadeOut()
        } else {
            $('.popin-app-choice').fadeIn();
        }

    };

    var initChangeLanguage = function () {
        $('select#select-language').change(function () {
            var currentLocation = document.location.pathname.split("/");
            currentLocation[1] = $(this).val();
            document.location.pathname = currentLocation.join("/")
        });
    };

    var setShareListener = function (href, text) {
        $('.btn-fb-share').click(function (event) {
            event.preventDefault();
            FB.ui({
                method: 'share',
                href: href
            }, function (response) {
            });
            return false;
        });

        $('.btn-tw-share').click(function (event) {
            event.preventDefault();

            var title = $(this).prop('title');
            var shareString = 'http://twitter.com/share?text=' + text + '&url=' + href;
            if (title != undefined && title != null && title.trim().length > 0) {
                shareString += '&text=' + encodeURI(title);
            }
            window.open(shareString, 'twitterwindow', 'height=450, width=550, top=' + ($(window).height() / 2 - 225) + ', left=' + $(window).width() / 2 + ', toolbar=0, location=0, menubar=0, directories=0, scrollbars=0');

            return false;
        });
    };

    var initVideo = function () {
        if (typeof base.youtubeUrl != "undefined") {
            $('.button-play-intro').click(function () {
                $('.video-container').append(
                    '<iframe src="https://www.youtube.com/embed/' + base.youtubeUrl + '?rel=0&amp;controls=0&amp;showinfo=0&amp;autoplay=1" width="100%" height="100%" frameborder="0" webkitallowfullscreen="true" mozallowfullscreen="true" allowfullscreen="true"></iframe>'
                ).removeClass('hidden');
                $('.button-stop-spot').removeClass('hidden');
                $('body').css('overflow', 'hidden');
                dataLayer.push({event: "desktop.video.play"});
            });

            $('.button-stop-spot').click(function (event) {
                $('.video-container').addClass('hidden').find('iframe').remove();
                $('.button-stop-spot').addClass('hidden');
                $('body').css('overflow', '');
                dataLayer.push({event: "desktop.video.close"});
            });
        }
    };

    var goToNext = function () {
        var next = "";
        if (document.location.search.split('?').length > 1) {
            $.each(document.location.search.split('?')[1].split("&"), function (u, t) {
                var keyval = t.split('=');
                if (keyval[0] == "next") {
                    next = keyval[1];
                }
            });
        }
        if (next.length > 0) {
            document.location = next;
            return true;
        }

        return false;
    };

    var registered = false;

    var escapeHTML = function(text) {
        return text
            .replace(/javascript/g, "") //javascript: URL
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    var initRegistration = function () {
        var form = $('#register-form');
        $('.button-register').click(function () {
            dataLayer.push({event: "desktop.video.open"});
            $('#register-form').show();
            FB.login(function (response) {
                if (response.authResponse) {
                    $.post('/auth/login', {
                        fb_access_token: response.authResponse.accessToken,
                        sponsorship: $('#sponsorship_code').val()
                    }, function (happnResponse) {
                        if (happnResponse.is_new) {
                            dataLayer.push({event: "desktop.registration.new"});
                        }
                        registered = true;
                        WH.Auth.setAuthResponse(happnResponse, false);
                        WH.api('/users/me', 'GET', {'fields': 'first_name,birth_date.format(m/d/Y),gender,login,picture.width(160).height(160).mode(0),age'}, function (apiResponse) {
                            for (var property in apiResponse.data) {
                                if (apiResponse.data.hasOwnProperty(property) && typeof(apiResponse.data[property]) == "string") {
                                    apiResponse.data[property] = escapeHTML(apiResponse.data[property]);
                                }
                            }
                            $('.account-box .name').text(apiResponse.data.first_name);
                            $('.account-box img').attr('src', (apiResponse.data.picture.url));
                            $('.account-box').show();
                            $('.loader').hide();
                            $('.register-form').show();
                            $('body').css('overflow', 'hidden');
                            var data = apiResponse.data;
                            if (data.age == null || data.age > 60 || data.age == 30) {
                                form.find('#user-birthdate').show();
                            } else {
                                form.find('#user-birthdate').hide();
                            }
                            $('input[name=email]').css('border-color', '');
                            $('label#label-email').css('color', '');
                            $('#gender').hide();
                            if (data.login.search('facebook.com') < 0) {
                                form.find('#user-mail').val(data.login);
                            } else {
                                form.find('#user-mail').val("");
                            }
                            form.find('.user-pic img').attr('src', data.picture.url);
                            form.find('.first-name').text(data.first_name);
                            if (typeof(data.birth_date) != "undefined") {
                                var birthday = data.birth_date.split('/');
                                form.find('[name=day]').val(parseInt(birthday[1]));
                                form.find('[name=month]').val(parseInt(birthday[0]));
                                form.find('[name=year]').val(parseInt(birthday[2]));
                            }
                        });
                    });
                } else {
                    $('#register-form').hide();
                    $('.register-form').hide();
                    $('.loader').show();
                    $('body').css('overflow', 'auto');
                }
            }, {scope: 'email,user_likes'});
        });
        $('#register-form .bt-close').click(function () {
            $('#register-form').hide();
            $('body').css('overflow', 'auto');
            $('.nav-buttons-download').show().css({
                'opacity': '1',
                'display': 'block'
            });
            $('.button-register').hide();
            dataLayer.push({event: "desktop.registration.close"});
            goToNext();
        });
        $('body').keyup(function (e) {
            if (e.which == 27) {
                $('#register-form').hide();
                $('body').css('overflow', 'auto');
            }
            if (registered) {
                $('.nav-buttons-download').show().css({
                    'opacity': '1',
                    'display': 'block'
                });
                $('.button-register').hide();
                dataLayer.push({event: "desktop.registration.close"});
                goToNext();
            }
        });
        $('#register-form input[type=submit]').click(function () {
            function validateEmail(email) {
                var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
            }

            if (!validateEmail($('input[name=email]').val())) {
                $('input[name=email]').css('border-color', 'red');
                $('label#label-email').css('color', 'red');
                return false;
            } else {
                $('input[name=email]').css('border-color', '');
                $('label#label-email').css('color', '');
            }
            var params = {
                'email': $('input[name=email]').val()
            };
            if ($('#user-birthdate').is(':visible')) {
                params.birth_date = $('select[name=year]').val() + "-" + $('select[name=month]').val() + "-" + $('select[name=day]').val();
            }
            if ($('#gender').is(':visible')) {
                params.gender = $('select[name=gender]').val();
            }
            $.post('/front/account/edit-profile', params, function (response) {
                if (response.success == true) {
                    $('#register-form').hide();
                    $('.register-form').hide();
                    $('.loader').show();
                    $('body').css('overflow', 'auto');
                    $('.nav-buttons-download').show().css({
                        'opacity': '1',
                        'display': 'block'
                    });
                    $('.button-register').hide();
                    dataLayer.push({event: "desktop.registration.finalize"});
                    goToNext();
                } else {

                }
            });
            return false;
        });

    };

    var initScrollButon = function () {
        $('.anim-arrow').click(function () {
            var minHeight = $(window).height() > 700 ? $(window).height() : 700;
            $("html, body").animate({scrollTop: minHeight}, 1000);
            return false;
        });
    };

    var captchaCallback = function(){
        $("input[type=submit]").css("display", "inline");
    };

    var init = function (options) {
        base.appId = options.appId;
        base.synchronizeUrl = options.synchronizeUrl;
        base.fbLoginUrl = options.fbLoginUrl;
        base.youtubeUrl = options.youtubeUrl;
        initSlidebar();
        initSlideBarLinkListener();
        initPage();
        initRegistration();
        initResizeEvent();
        initSlider();
        initMenu();
        facebookSetup(options);
        setLoginListener();
        setSynchronizeListener();
        setDownloadLinkListener();
        initForms();
        initChangeLanguage();
        initScrollEvent();
        initScrollButon();
        setShareListener(options.nyShareHref, options.nyShareText);
        initVideo();
        window.captchaCallback = captchaCallback;
    };

    return {
        'init': init
    }
}();