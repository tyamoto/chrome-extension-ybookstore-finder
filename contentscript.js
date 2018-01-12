jQuery(function($) {
    if (document.URL.match(/\/[dg]p\//) == null) return;

    chrome.extension.sendRequest(
        { name: "get" },
        function(response) {
            /*
             * systemid   = response.pref;
             * prefName   = response.prefName;
             * url_pc     = response.url_pc;
             * address    = response.address;
             * systemid02 = response.pref02;
             * prefName02 = response.prefName02;
             * url_pc02   = response.url_pc02;
             * address02  = response.address02;
             */

            var isEbook = $("li:contains('ISBN-13')").length == 0;
            // console.log(isEbook);
            var title   = isEbook ? $("#ebooksProductTitle").text() : $("#productTitle").text();
            if (! title) {
                return;
            }

            title = title.replace(/\u2015/g, ' ').replace(/\s+/, ' ');
            if (title.match(/^([^\s]+\s+[^\s]+)\s+.+/) || title.match(/^(.+)\s+\(\S+\)$/)) {
                title = RegExp.$1;
                console.log(title,);
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
        }
    );

    function searchBookstore(title) {
        $.ajax({
            type: "GET",
            url: "https://bookstore.yahoo.co.jp/search?keyword=%22" + encodeURIComponent(title) + "%22"
        }).done(function(data) {
            var anchor = $(data).find('#yjContentsBody > div.area-unitBC > div.mod-searchResult > div > div > table > tbody > tr:nth-child(3) > td:nth-child(1) > a');
            $('#bssLoader').fadeOut();
            if (anchor.length == 1) {
                // console.log(anchor.attr('href'));
                $('#bssResult').append('<a href="' + anchor.attr('href') + '" target="_blank" class="found">見つかりました</a>' );
            }
            else {
                $('#bssResult').append('見つかりませんでした');
            }
        });
    }

    function sleep(time, callback) {
        setTimeout(callback, time);
    }

    function Url() {
        //URLのパラメーター取得
        this.getUrlVars = function() {
            var vars = [],
                hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        }
        //URLをスラッシュ区切りで配列に
        this.getUrlArray = function() {
            var url = document.URL;
            url = url.split("http://").join(""); //http://を削除
            url = url.split('/');
            return url;
        }
    }

    function Cookie() {
        //プライベート
        var _deadtime = 24; //期限20時間
        //読み込み｜ex：http://blog.wonder-boys.net/?p=208
        this.get = function(value) {
            if (value) {
                var c_data = document.cookie + ";";
                c_data = unescape(c_data);
                var n_point = c_data.indexOf(value);
                var v_point = c_data.indexOf("=", n_point) + 1;
                var end_point = c_data.indexOf(";", n_point);
                if (n_point > -1) {
                    c_data = c_data.substring(v_point, end_point);
                    //alert("cookieは" + c_data + "です");
                    return c_data;
                }
            }
        }
        //書き込み
        this.set = function(cookie_name, value) {
            var ex = new Date();
            ex.setHours(ex.getHours() + _deadtime);
            ex = ex.toGMTString();
            var c = escape(cookie_name) + "=" + escape(value) + ";expires=" + ex;
            document.cookie = c;
        }
    }

    function unicodeEscape(str) {
        var code, pref = {1: '\\x0', 2: '\\x', 3: '\\u0', 4: '\\u'};
        return str.replace(/\W/g, function(c) {
            return pref[(code = c.charCodeAt(0).toString(16)).length] + code;
        });
    }
});
