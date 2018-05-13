(function() {

    (function () {
        if (document.URL.match(/\/[dg]p\//) == null) return;

        chrome.extension.sendRequest(
            { name: "get" },
            function(response) {
                var isEbook = $("li:contains('ISBN-13')").length == 0;
                var title   = isEbook ? $("#ebooksProductTitle").text() : $("#productTitle").text();
                if (! title) {
                    return;
                }
                title = title.replace(/\u2015/g, ' ').replace(/\s+/, ' ');
                console.log(title,);
                if (title.match(/^([^\s]+\s+[^\s]+)\s+.+/) || title.match(/^(.+)\s+\(\S+\)$/)) {
                    title = RegExp.$1;
                    // console.log(title,);
                    if (title.match(/^(.+)[(（]/) || title.match(/^(.+)\s+\d+巻/)) {
                        title = RegExp.$1;
                        console.log(title,);
                    }
                }
                var htmlToAppend = '<div id="bssOutput"><p class="lead1">この本がブックストアにあるか検索</p>'
                                 + '<div id="bssLoader"><img src="' + chrome.extension.getURL("images/ajax-loader.gif") + '" width="56" height="21" /></div>'
                                 + '<div id="bssResult"></div></div>';
                if ($("#olpDivId").length > 0) {
                    $("#olpDivId").after(htmlToAppend);
                } else {
                    $("#MediaMatrix").after(htmlToAppend);
                }

                /*
                 * console.log(
                 *     title,
                 *     encodeURI(title),
                 *     encodeURIComponent(title),
                 *     escape(title)
                 * );
                 */
                searchBookstore(title);
        });
    })();

    function searchBookstore(title) {
        $.ajax({
            type: "GET",
            url: "https://bookstore.yahoo.co.jp/search?keyword=%22" + encodeURIComponent(title) + "%22"
        }).done(function(data) {
            var anchor = $(data).find('#yjContentsBody > div.area-unitBC > div.mod-searchResult > div > div > table:nth-child(1) > tbody > tr:nth-child(3) > td:nth-child(1) > a');
            $('#bssLoader').fadeOut();
            if (anchor.length == 1) {
                // console.log(anchor.attr('href'));
                $('#bssResult').append('<a href="' + anchor.attr('href') + '" target="_blank" class="found">見つかりました</a>');
            }
            else {
                $('#bssResult').append('見つかりませんでした');
            }
        });
    }

}).call(this);
