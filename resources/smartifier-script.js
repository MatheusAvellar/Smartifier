console.errorToast = function(text) {
    if (!$("#toast").text()) {
        $("body").append(
            "<div id='toast'>"
            +   "<h4>Error</h4>"
            +   "<span id='word-errors'>"
            +       "Could not find synonyms for "
            +       "<a id='word-error'>" + text + "</a>"
            +   "</span>"
            +   "<div class='close' onclick='$(this).parent().remove();'>X</div>"
            +"</div>"
        );
    } else {
        var _h = $("#word-errors").html();
        $("#word-errors").html(
            _h + ", <a id='word-error'>" + text + "</a>"
        );
    }
}

console.writeline = function(text) {
    console.log(text);
    $("#console")
        .append("<span class='console-line'>&gt; " + text + "</span>")
        .scrollTop($("#console")[0].scrollHeight);
}

Array.prototype.clip = function() {
    this.shift();
    return this;
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var o = {
    ignoreList: [
        "the", "and", "for", "with", "you", "him", "her"
    ],
    KEY: "cebf0734eef56229a6091479230f735b",    // Acquired at "https://words.bighugelabs.com/login.php"
    xss: function(text) {
        return (text+"")
            .split('<').join("&lt;")
            .split('>').join("&gt;");
    },
    synObj: {},
    wordsStats: {
        toSend: 0,
        sent: 0
    }
};

o.queue = function(arr, str) {
    if (arr.length == 0) {
        if (str) {
            str = str.trim().capitalize();
            switch (str[str.length-1]) {
                case ".": case "!":
                case "?": case ";":
                    return str;
                default:
                    return str + ".";
            }
        } else {
            return "";
        }
    }

    var word = o.xss(arr[0]);
    var lword = word.toLowerCase();
    if (word == "") return o.queue(arr.clip(), (str ? str : "")); // Skips empty lines
    if (word == "."                                               // Appends and skips
     || word == ","                                               // any punctuation or
     || word == "!"                                               // or words with less
     || word == "?"                                               // than 3 letters
     || word == ";"
     || word == ":") {
        return o.queue(
            arr.clip(),
            str + word
        );
    }
    if (lword == "it's"
     || lword == "that's") return o.queue(arr.clip(), str + " " + word.replace("'s", " is"));
    if (lword.indexOf("'ll") > -1)
        return o.queue(arr.clip(), str + " " + word.replace("'ll", " will"));
    if (lword == "i'm"
     || lword == "im") return o.queue(arr.clip(), str + " " + word.replace("'m", " am"));
    if (lword == "i") return o.queue(arr.clip(), str + " " + word.toUpperCase());
    if (word.length <= 2) {
        return o.queue(
            arr.clip(),
            str + " "+ word
        );
    }
    for (var i = 0, l = o.ignoreList.length; i < l; i++) {
        if (lword == o.ignoreList[i]) {
            return o.queue(
                arr.clip(),
                str + " "+ word
            );
        }
    }

    o.wordsStats.toSend++;
    $.ajax({
        _ignore: word,
        dataType: "json",
        type: "GET",
        url: "http://words.bighugelabs.com/api/2/" + o.KEY + "/"
            + word.toLowerCase() + "/json",
        beforeSend: function() {
            var _word = o.xss(this._ignore).toLowerCase();                 // Writes to console that
            console.writeline("Sending request for \"" + _word + "\"");    // the word is being sent

            clearTimeout(o._t);
            $("#progress").removeClass("hidden error");                    // Initializes progress bar
        },
        complete: function(status, xhr) {
            var _word = o.xss(this._ignore).toLowerCase();                 // Writes to console that
            console.writeline("Completed request for \"" + _word + "\"");  // the request was sent
        },
        error: function(xhr, status, error) {
            var _word = o.xss(this._ignore).toLowerCase();
            console.writeline(
                "<a class='console-err'>"
                + "Request for \"" + _word + "\" received an error!<br/> | "
                + "Status: " + status + "<br/> | "
                + "Error: " + error
                +"</a>"
            );
            console.errorToast(_word);

            o.synObj[_word] = "Error";

            o.wordsStats.sent++;
            var prog = (o.wordsStats.sent / o.wordsStats.toSend) * 100;
            $("#progress").addClass("error").css({  width: prog + "%"  });

            o.checkProgress();
        },
        success: function(result, status, xhr) {
            var _word = o.xss(this._ignore).toLowerCase();
            console.writeline(
                "<a class='console-suc'>"
                + "Request for \"" + _word + "\" succeeded!<br/> | "
                + "Status: " + status
                +"</a>"
            );

            o.synObj[_word] = [_word];
            console.log(result);
            for (var i in result) {
                if (i == "noun" || i == "verb" || i == "adjective" || i == "adverb") {
                    if (result[i].syn) o.synObj[_word] = o.synObj[_word].concat(result[i].syn);
                    if (result[i].rel) o.synObj[_word] = o.synObj[_word].concat(result[i].rel);
                }
            }
            o.synObj[_word].sort();
            $("[data-word=\"" + _word + "\"]")
                .removeClass("disabled")
                .addClass("synonym");

            o.wordsStats.sent++;
            var prog = (o.wordsStats.sent / o.wordsStats.toSend) * 100;
            $("#progress").css({  width: prog + "%"  });

            o.checkProgress();
        }
    });

    return o.queue(
        arr.clip(),
        (str + " "
            + "<a "
            +   "class='disabled' "
            +   "data-word='" + lword + "' "
            +   "onclick='o.listSynonyms(\"" + lword + "\");'"
            + ">"
            +   word
            + "</a>")
    );
}

o.smartify = function() {
    o.wordsStats = {  toSend: 0, sent: 0  };                 // Resets word request status

    if ($("#sentence").val().trim() != "") {                 // Checks for empty input

        $("#synonyms").hide();                               // Hides synonyms table

        var _s = $("#sentence").val().trim()
                .split(".").join(" . ")
                .split(",").join(" , ")                      // Removes puctuation
                .split("!").join(" ! ")                      // from the input
                .split("?").join(" ? ")
                .split(";").join(" ; ")
                .split(":").join(" : ")
                .split("<").join("")
                .split(">").join("")
                .split(" ");                                 // Gets array from input
        
        console.writeline(
            "Received sentence of length " + _s.length
            +"<br/>| \"" + _s.join(",") + "\""
        );

        $("#dumb").text(o.xss($("#sentence").val().trim())); // Updates "source" output
        $("#smart").html(o.queue(_s, ""));                   // Clears output
    }
}

o.substituteWord = function(word, sub) {
    var _synword = o.synObj[word][sub];
    $("#syn-list li").removeClass("selected");
    $("#syn-list li[data-s-word=\"" + _synword + "\"]").addClass("selected");
    $("[data-word=\"" + word + "\"]").text(o.synObj[word][sub]);
}

o.listSynonyms = function(word) {
    $(".current-word").text(word.toLowerCase());           // Displays the current word

    var $word = $("[data-word=\"" + word + "\"]");         // Selects word in the smartified sentence

    if (o.synObj[word]
     && o.synObj[word] != "Error"
     && !$word.hasClass("disabled")) {                     // Checks if the word has synonyms

        $("#synonyms").show();                             // Enables the synonyms table
        $("#syn-list").html("");                           // Clears synonyms list

        for (var i = 0, l = o.synObj[word].length; i < l; i++) {
            var s = (o.synObj[word][i] == $word.text()) ? "selected" : "";
            var _synword = o.synObj[word][i];
            console.log(s);
            $("#syn-list").append(
                "<li "
                +  "data-s-word='" + _synword + "' "
                +  "class='" + s + "' "
                +  "onclick='o.substituteWord(\"" + word + "\", " + i + ");'>"
                +    _synword
                +"</li>"
            );
        }
    }
}

o.checkProgress = function() {
    if (o.wordsStats.sent == o.wordsStats.toSend) {
        o._t = setTimeout(function() {
            $("#progress").addClass("hidden");
        }, 750);
    }
}

o.init = function() {
    console.writeline("<a class='console-wlc'>Started SmartConsole v0.1</a><br/>");
}