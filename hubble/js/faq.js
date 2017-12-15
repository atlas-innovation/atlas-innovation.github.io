var FAQ = function () {
    var self = this;

    self.zendeskToken = "9e0c3dfde6821a885aaf0d3d25d6dd08f3620035fad87ade98e999594849b783";

    self.form = null;
    self.fbButton = null;
    self.fbConnectForm = null;
    self.emailInput = null;
    self.reasonSelect = null;
    self.messageTextarea = null;
    self.contactButton = null;
    self.message = null;
    self.facebookId = null;
    self.locale = null;
    self.contactSubject = null;

    self.path = {
        locale: "fr",
        faq: "faq",
        articles: "articles",
        categories: "categories"
    };


    self.setLocale = function (locale) {
        var translatedLocale = self.translateLocaleToZendeskCodes(locale);

        if (self.zendeskLocales.indexOf(translatedLocale) > -1) {
            self.locale = translatedLocale;
        } else {
            self.locale = "en-us";
        }

        self.currentLanguage.html(self.translateZendDeskCodeToName(self.locale));
    };

    self.translateLocaleToZendeskCodes = function (locale) {
        locale = locale.toLowerCase().replace("_", "-");

        if (locale == "en") {
            locale = "en-us";
        }

        if (locale == "zh") {
            locale = "zh-tw";
        }

        return locale
    };

    self.translateZendDeskCodeToLocale = function (zendeskCode) {
        if (zendeskCode == "pt-br") {
            return "pt_BR"
        }
        return zendeskCode.split("-")[0];
    };

    self.translateZendDeskCodeToName = function (zendeskCode) {
        switch (zendeskCode) {
            case "en-us":
                return "English";
            case "de":
                return "Deutsch";
            case "el":
                return "Ελληνικά";
            case "es":
                return "Español";
            case "fr":
                return "Français";
            case "it":
                return "Italiano";
            case "hu":
                return "Magyar";
            case "pl":
                return "Polski";
            case "pt-br":
                return "Português do Brasil";
            case "pt":
                return "Português";
            case "tr":
                return "Türkçe";
            case "ru":
                return "Русский";
            case "th":
                return "ไทย";
            case "zh-tw":
                return "繁體中文";
            case "ja":
                return "日本語";
            default:
                return zendeskCode;
        }


    };

    self.onClickFB = function () {
        FB.login(function (response) {
            if (response.authResponse) {
                FB.api('/me?fields=id,name,locale', function (response) {
                    self.facebookId = response.id;
                    self.facebookName = response.name;
                    self.localeFB = response.locale;

                    self.fbConnectForm.addClass("hidden");
                    self.form.removeClass("hidden");
                    self.showMessage("connected-text");
                });
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        });
    };

    self.onChange = function () {
        if (self.emailInput.val().length &&
            self.reasonSelect.val().length &&
            self.contactTextarea.val().length) {
            self.contactButton.attr("disabled", false)
        }
        else if (!self.contactButton.attr("disabled")) {
            self.contactButton.attr("disabled", true)
        }
    };

    self.detectOS = function getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;

        // Windows Phone must come first because its UA also contains "Android"
        if (/windows phone/i.test(userAgent)) {
            return "Windows Phone";
        }

        if (/android/i.test(userAgent)) {
            return "Android";
        }

        // iOS detection from: http://stackoverflow.com/a/9039885/177710
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return "iOS";
        }

        return "Desktop";
    };

    self.sendContact = function () {
        event.preventDefault();
        var mail = self.emailInput.val();
        var reason = self.reasonSelect.val();
        var customerMessage = self.contactTextarea.val();

        var tags = self.localeFB.split("_");
        tags[1] += "-";
        tags.push(reason);

        $.ajax("/fr/faq/tickets", {
            type: "POST",
            data: {
                ticket: {
                    "requester": {
                        "name": self.facebookName,
                        "email": mail
                    },
                    subject: self.contactSubject,
                    group_id: 24923465, //FAQ_Contact_Form Group Id
                    comment: {
                        body: customerMessage
                    },
                    custom_fields: [
                        {
                            id: "27430185", //Facebook Link
                            value: "https://www.facebook.com/" + self.facebookId + "/"
                        },
                        {
                            id: "25707955", //Locale
                            value: tags[0]
                        },
                        {
                            id: "25622589", //Country
                            value: tags[1]
                        },
                        {
                            id: "25707945", //OS
                            value: self.detectOS()
                        },
                        {
                            id: "25695005", //Reason
                            value: reason
                        },
                        {
                            id: "25881335", //Mail
                            value: mail
                        }
                    ],
                    tags: tags
                }
            }
        });


        self.form[0].reset();
        self.showMessage("send-text")
    };

    self.showMessage = function (messageClass) {
        if (messageClass == "connected-text") {
            self.message.removeClass("send-text");
        } else {
            self.message.removeClass("connected-text");
        }
        self.message.addClass(messageClass);
        self.message.removeClass("hidden");
    };

    self.generateBreadCrumb = function (category, section, search) {
        var breadCrumbList = $("#breadcrumb").find("ul");


        if (category) {
            var categoryRoute = "/" + self.path.locale +
                "/" + self.path.faq +
                "/" + self.path.categories +
                "/" + category.id;


            breadCrumbList
                .append(
                    $(document.createElement("li")).append(
                        $(document.createElement("a"))
                            .attr("href", categoryRoute)
                            .text(category.name ? category.name : category.title)
                    )
                );
        }

        if (section) {
            breadCrumbList
                .append(
                    $(document.createElement("li")).append(
                        $(document.createElement("a"))
                            .attr("href", categoryRoute + "#" + section.id)
                            .text(section.name)
                    ))
        }


        if (search) {
            breadCrumbList
                .append(
                    $(document.createElement("li")).append(
                        $(document.createElement("a"))
                            .attr("href", window.location)
                            .text(search)
                    ))
        }


    };

    self.getCategories = function () {
        self.categories = $("#faq-categories");

        var url = "https://happnapp.zendesk.com/api/v2/help_center/" + self.locale + "/categories.json";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                var htmlString = "";

                for (var i = 0; i < 4 && i < result.categories.length; i++) {
                    var category = result.categories[i];

                    var link = "/" + self.path.locale +
                        "/" + self.path.faq +
                        "/" + self.path.categories +
                        "/" + category.id;


                    htmlString += "" +
                        "<a class='category' href='" + link + "'>" +
                        "<div class='category-icon-wrapper'>" +
                        "<div class='category-icon'>" +
                        "<img src='/images/" + category.description + "'>" +
                        "</div>" +
                        "</div>" +
                        "<h2>" + category.name + "</h2>" +
                        "</a>"

                }

                self.categories.html(htmlString);
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getPromotedArticles = function () {
        self.promotedArticles = $("#promoted-articles").find("ul");

        var url = "https://happnapp.zendesk.com/api/v2/help_center/" + self.locale + "/articles.json?per_page=100";
        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                var count = 0;
                var htmlString = "";
                for (var i = 0; count < 6 && i < result.articles.length; i++) {
                    var article = result.articles[i];
                    if (article.promoted) {
                        count++;
                        htmlString += "" +
                            "<li>" +
                            "<a href='/" + self.path.locale + "/"
                            + self.path.faq + "/"
                            + self.path.articles + "/"
                            + article.id + "'>" +
                            "<img src='/images/faq-icon-question.png'>" +
                            "<p>" + article.title + "</p>" +
                            "</a>" +
                            "</li>"
                    }
                }

                self.promotedArticles.html(htmlString);
                self.removeLoader();
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.upvoteArticle = function (id) {
        self.helpfulMessageYes = $("#helpful-message-yes");
        self.helpfulMessageYes.removeClass("hidden");
        self.helpfulButtons.addClass("hidden");
    };

    self.downvoteArticle = function (id) {
        self.helpfulMessageNo = $("#helpful-message-no");
        self.helpfulMessageNo.removeClass("hidden");
        self.helpfulButtons.addClass("hidden");
    };

    self.getArticle = function (id) {
        var title = $("#article-title");
        var body = $("#article-body");

        var url = "https://happnapp.zendesk.com/api/v2/help_center/" + self.locale + "/articles/" + id +
            ".json?include=categories,sections";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                title.text(result.article.name);
                body.html(result.article.body);

                self.generateBreadCrumb(result.categories[0], result.sections[0]);

                self.getRelatedArticles(result.sections[0].id, id)
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getLocales = function (callback) {
        var url = "https://happnapp.zendesk.com/api/v2/help_center/locales.json";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                var htmlString = "";

                self.zendeskLocales = result.locales;

                self.zendeskLocales.forEach(function (localeCode) {
                    htmlString += "<li data-locale='" + localeCode + "'>" + self.translateZendDeskCodeToName(localeCode) + "</li>";
                });

                self.availableLanguages.html(htmlString);

                self.availableLanguages.find("li").click(function () {
                    var newLocation = window.location.pathname.split("/");
                    newLocation[1] = self.translateZendDeskCodeToLocale($(this).data("locale"));

                    window.location = newLocation.join("/");
                });

                callback();
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getCategory = function (id) {
        var url = "https://happnapp.zendesk.com/api/v2/help_center/" +
            self.locale + "/categories/" + id + ".json";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                self.generateBreadCrumb(result.category);
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getCategoryArticles = function (id) {
        var menu = $("#menu-section").find("ul");
        var sectionsList = $("#sections-list");

        var url = "https://happnapp.zendesk.com/api/v2/help_center/" +
            self.locale + "/categories/" + id + "/articles.json" +
            "?include=sections&per_page=100&sort_by=position&sort_order=desc";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                console.log(result);
                var menuHmtl = "";
                var sectionHtml = "";

                result.sections.sort(function (a, b) {
                    return a.position - b.position;
                });

                result.sections.forEach(function (section) {

                    menuHmtl += "<li>" +
                        "<a class='section-link " + section.id + "'>" +
                        section.name +
                        "</a>" +
                        "</li>";

                    sectionHtml += "" +
                        "<div class='content'>" +
                        "<a id='" + section.id + "' class='anchor'></a>" +
                        "<div class='top-articles'>" +
                        "<h1 class='help-center-title section-title'>" +
                        section.name +
                        "</h1>" +
                        "<ul class='articles-list'>";

                    for (var i = result.articles.length - 1; i >= 0; i--) {
                        var article = result.articles[i];

                        if (article.section_id === section.id && !article.draft) {

                            sectionHtml += "<li>" +
                                "<a href='/" + self.path.locale + "/"
                                + self.path.faq + "/"
                                + self.path.articles + "/"
                                + article.id + "'>" +
                                "<img src='/images/faq-icon-question.png'>" +
                                "<p>" + article.title + "</p>" +
                                "</a>" +
                                "</li>";

                            result.articles.splice(i, 1);
                        }
                    }

                    sectionHtml += "</ul></div></div>"

                });

                menu.html(menuHmtl);
                sectionsList.html(sectionHtml);

                self.menu = menu;
                self.sectionLinks = $(".section-link");
                self.sectionLinks.click(function () {
                    self.scrollTo($(this)[0].classList[1]);
                });

                var windowHeight = $(window).height() - 74 - 60;
                var lastSection = sectionsList.find(".content").last();

                if (lastSection.height() < windowHeight) {
                    lastSection.height(windowHeight);
                }

                $(document).on("scroll", self.onScroll);
                self.removeLoader();

                if (location.hash) {
                    self.scrollTo(location.hash.substring(1));
                }
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getRelatedArticles = function (sectionId, articleId) {
        var url = "https://happnapp.zendesk.com/api/v2/help_center/" + self.locale + "/sections/" + sectionId +
            "/articles.json";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                var htmlString = "";

                var count = 0;

                while (count < 6 && result.articles.length) {
                    var index = Math.floor(Math.random() * result.articles.length);
                    var article = result.articles[index];
                    if (article.id != articleId && !article.draft) {

                        htmlString += "" +
                            "<li>" +
                            "<a href='/" + self.path.locale + "/"
                            + self.path.faq + "/"
                            + self.path.articles + "/"
                            + article.id + "'>" +
                            "<img src='/images/faq-icon-question.png'>" +
                            "<p>" + article.title + "</p>" +
                            "</a>" +
                            "</li>";

                        count++;
                    }
                    result.articles.splice(index, 1);
                }

                if (count) {
                    self.relatedArticles.html(htmlString);
                }
                else {
                    $(".top-articles-wrapper").remove();
                }
                self.removeLoader();
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.getSections = function (callback) {
        var url = "https://happnapp.zendesk.com/api/v2/help_center/" + self.locale + "/sections.json";

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {
                callback(result.sections);
            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.scrollTo = function (elementId) {
        var element = $("#" + elementId);
        self.deactivateMenu = true;
        $('html, body').animate({
            scrollTop: element.offset().top
        }, 800, "swing", function () {
            self.deactivateMenu = false;
            self.onScroll();
        });

    };

    self.onScroll = function () {
        var scrollPos = $(document).scrollTop();

        var marginAffix = 90;
        if (!self.menu.hasClass("affix")) {

            if (self.menu.position().top <= (scrollPos + marginAffix)) {
                self.originalPosition = self.menu.position().top;
                self.menu.addClass("affix");
            }

        }
        else {

            if (self.originalPosition > (scrollPos + marginAffix)) {
                self.menu.removeClass("affix");
            }
        }

        if (!self.deactivateMenu) {
            var scrollPosForMenu = scrollPos + 90;

            self.sectionLinks.each(function () {
                var currLink = $(this);
                var refElement = $("#" + currLink[0].classList[1]).parent();
                if (refElement.position().top <= (scrollPosForMenu)
                    && refElement.position().top + refElement.height() > (scrollPosForMenu)) {
                    self.sectionLinks.removeClass("active");
                    currLink.addClass("active");
                }
                else {
                    currLink.removeClass("active");
                }
            });
        }
    };

    self.removeLoader = function () {
        $("body").removeClass("loading");
    };

    self.stripHTML = function (html) {
        var tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    self.findSection = function (sectionList, sectionId) {
        for (var i = 0; i < sectionList.length; i++) {
            if (sectionList[i].id == sectionId) {
                return sectionList[i];
            }
        }
    };

    self.getSearchedArticle = function (query, titleNoResults, titleOneResult, titleMultResults, noResultMessage) {
        var url = "https://happnapp.zendesk.com/api/v2/help_center/articles/search.json" +
            "?query=" + query +
            "&locale=" + self.locale;
        self.searchInput.val(query);

        $.ajax(url, {
            type: "GET",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + self.zendeskToken);
            },
            success: function (result) {

                if (result.results.length) {
                    self.getSections(function (sectionsList) {
                        var htmlString = "";

                        for (var i = 0; i < result.results.length; i++) {
                            var article = result.results[i];
                            if (!article.draft) {
                                var link = "/" +
                                    self.path.locale +
                                    "/" + self.path.faq +
                                    "/" + self.path.articles +
                                    "/" + article.id;

                                htmlString += "" +
                                    "<li class='single-result'>" +
                                    "<div class='single-result-title'>" +
                                    "<img src='/images/faq-icon-question.png'>" +
                                    "<a href='" + link + "'>" + article.name + "</a>" +
                                    "</div>" +
                                    "<p class='single-result-text' style='opacity:0'>" +
                                    self.stripHTML(article.body) +
                                    "</p>" +
                                    "<div class='single-result-category'>" +
                                    self.findSection(sectionsList, article.section_id).name +
                                    "</div>" +
                                    "</li>"
                            }
                        }

                        if (result.results.length > 1) {
                            $("#search-result").find("ul").html(htmlString);
                            $("#result-header").text(
                                titleMultResults
                                    .replace("xxxxxxxx", query)
                                    .replace("X", result.results.length)
                            );
                        }
                        else {
                            $("#search-result").find("ul").html(htmlString);
                            $("#result-header").text(
                                titleOneResult
                                    .replace("xxxxxxxx", query)
                            );
                        }


                        $(".single-result-text").each(function () {
                            $clamp($(this)[0], {clamp: 2});
                            $(this).css("opacity", 1);
                        });
                        self.removeLoader();
                    });
                } else {
                    $("#result-header").text(
                        titleNoResults
                            .replace("xxxxxxxx", query)
                    );
                    $("#no-result-message").text(
                        noResultMessage
                            .replace("xxxxxxxx", query)
                    );
                    $("#search-result").addClass("show-no-results");
                }

            },
            error: function (result) {
                console.error(result);
            }
        })
    };

    self.htmlEntities = function (str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    };

    self.search = function () {
        window.location =
            "/" + self.path.locale +
            "/" + self.path.faq +
            "/" + self.path.search + "?query=" + self.htmlEntities(self.searchInput.val());
    };

    self.openLanguageSelector = function (e) {
        $("html, body").toggleClass("language-selector-is-open");
        self.languageSelector.toggleClass("open");
        $(document).off().click(function () {
            self.languageSelector.removeClass("open");
            $("body").toggleClass("language-selector-is-open");
            $(document).off();
        });
        e.stopPropagation();
    };

    self.init = function (fbAppId, zendeskToken, callback) {
        $("body").addClass("loading");
        $(".top-bar-download-btn.mobile-view").css("display", "none"); //Remove DL button on faq

        //FB
        $.ajaxSetup({cache: true});
        $.getScript('//connect.facebook.net/en_US/sdk.js', function () {
            FB.init({
                appId: fbAppId,
                version: 'v2.2'
            });

            self.FB = FB;

            //Dom elements storing
            self.form = $("#faq-contact-form");
            self.fbButton = $("#btn-fb");
            self.fbConnectForm = $("#fb-connect");
            self.emailInput = $("#input-email");
            self.reasonSelect = $("#select-reason").find("select");
            self.contactTextarea = $("#textarea-contact");
            self.contactButton = $("#btn-contact");
            self.message = $("#message");
            self.searchButton = $("#search-button");
            self.searchInput = $("#search-input");
            self.languageSelector = $("#faq-language-selector");
            self.currentLanguage = $("#faq-current-language");
            self.currentLanguageWrapper = $("#faq-current-language-wrapper");
            self.availableLanguages = $("#faq-available-languages");


            //Event Handler initialization
            if (self.fbButton) {
                self.fbButton.click(self.onClickFB);
                self.emailInput.keyup(self.onChange);
                self.reasonSelect.change(self.onChange);
                self.contactTextarea.keyup(self.onChange);
                self.contactButton.click(self.sendContact);
            }

            self.searchButton.click(self.search);
            self.searchInput.keypress(function (e) {
                if (e.which == 13 && self.searchInput.val().length) {
                    self.search();
                }
            });

            self.currentLanguageWrapper.click(self.openLanguageSelector);

            self.getLocales(function () {
                callback.apply(self);
            });
        });
    };

    return self;
}();

window.FAQ = FAQ;

