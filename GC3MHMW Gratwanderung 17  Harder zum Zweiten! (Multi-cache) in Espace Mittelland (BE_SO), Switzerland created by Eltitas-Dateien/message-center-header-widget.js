/// <reference path="../typings/jquery/jquery.d.ts"/>
/// <reference path="../typings/google.analytics/ga.d.ts" />

(function ($) {
    /* Hidden Tab Method */
    $("a.message-center-icon").on("click", function (e) {
        e.preventDefault();

        var $self = $(this), hasFired = false;

        var hitCallback = function () {
            if (!hasFired) {
                hasFired = true;
                document.location.href = $self.attr('href');
            }
        };

        if ("_gaq" in window) {
            _gaq.push(['_trackEvent', 'Message Center', 'Click', 'Message Center Header Widget']);
            _gaq.push(function () {
                setTimeout(hitCallback, 250);
            });
        } else if ("ga" in window) {
            ga('send', 'event', 'Message Center', 'Click', 'Message Center Header Widget', { 'hitCallback': hitCallback });
        } else {
            hitCallback();
        }

        // just in case google analytics is having issues.
        window.setTimeout(hitCallback, 3000);

        return false;
    });

    $.fn.messageCenterHeaderWidget = function () {
        if (!this.length || !("withCredentials" in new XMLHttpRequest() || window.location.protocol == "https:"))
            return this;

        var $this = this;
        var getParamsPromise = $.ajax({ type: 'GET', dataType: "jsonp", crossDomain: true, url: "/account/messagecenter/headerwidget/params" });
        var getIfVisiblePromise = $.ajax({ "url": "/account/scripts/ifVisible.js", "dataType": "script", "cache": true });

        getIfVisiblePromise.done(function () {
            getParamsPromise.done(function (params) {
                var countElements = $([]);

                $this.each(function (index, element) {
                    var hyperlinkElement = $(element).find("a.message-center-icon");
                    var countElement = $("<span />").addClass("msg-unread-stamp").hide();
                    hyperlinkElement.prepend(countElement);
                    countElements = countElements.add(countElement);
                });

                var communicationServiceEndpoint = "withCredentials" in new XMLHttpRequest() ? params.communicationServiceEndpoint : params.communicationServiceEndpointNoCors;
                var getUnreadConversationCount = function () {
                    var getUnreadConversationsCountPromise = $.ajax(communicationServiceEndpoint + "participant/" + params.accountPublicGuid + "/summary", {
                        type: "GET",
                        dataType: "json",
                        headers: { 'Authorization': "bearer " + params.accessToken }
                    });

                    getUnreadConversationsCountPromise.then(function (participantSummary) {
                        countElements.text(participantSummary.unreadConversationCount);
                        if (participantSummary.unreadConversationCount > 0)
                            countElements.show();
                        else
                            countElements.hide();
                    });

                    return getUnreadConversationsCountPromise;
                };

                var ifvisible = window.ifvisible;

                ifvisible.setIdleDuration(params.idleDurationSeconds);

                var pollRepeater = function (interval) {
                    window.setTimeout(function () {
                        if (ifvisible.now()) {
                            getUnreadConversationCount().then(function () {
                                return pollRepeater(params.pollingIntervalSeconds * 1000.0);
                            });
                        } else {
                            pollRepeater(params.pollingIntervalSeconds * 1000.0);
                        }
                    }, interval);
                };

                var idlePollRepeater = function (interval) {
                    window.setTimeout(function () {
                        if (!ifvisible.now() && ifvisible.getIdleInfo().idleFor < params.idleDeactivationDurationHours * 60 * 60 * 1000.0) {
                            getUnreadConversationCount().then(function () {
                                return idlePollRepeater(params.idlePollingIntervalSeconds * 1000.0);
                            });
                        } else {
                            idlePollRepeater(params.idlePollingIntervalSeconds * 1000.0);
                        }
                    }, interval);
                };

                // Start the repeaters
                pollRepeater(0);
                idlePollRepeater(0);
            });
        });

        return this;
    };
})(jQuery);
//# sourceMappingURL=message-center-header-widget.js.map
