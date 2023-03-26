// TODO: versions
(function() {
    var text = window.localStorage.getItem("kamoos");
    if (text) {
        window.dict = text.split('\n');
        updateResult();
    } else {
        fetch("https://raw.githubusercontent.com/mie00/cn-kamoos/main/kamoos.csv").then(resp => {
            if (resp.status != 200) {
                alert("خطأ أثناء تحنيل القاموس");
                throw "Error getting the dictionary";
            }
            return resp.text()
        }).then(text => {
            window.localStorage.setItem("kamoos", text);
            window.dict = text.split('\n');
            updateResult();
        });
    }
})();

var notificationRemover = null;

function updateResult() {
    var search = document.getElementById("search").value;
    var result = document.getElementById("result");
    var reached = document.getElementById("reached");
    if (window.dict === undefined) {
        result.innerHTML = "جار التحميل..."
    }
    var matching = [];
    var limitReached = false;
    for (var i = 0; i < window.dict.length; i++) {
        var line = window.dict[i];
        var ind = 0;
        var matches = true;
        for (var c = 0; c < search.length; c++) {
            var next = line.substring(ind).indexOf(search.charAt(c));
            if (next == -1) {
                matches = false;
                break;
            }
            ind = next;
        }
        if (matches) {
            matching.push(line);
            if (matching.length > 100) {
                limitReached = true;
                break;
            }
        }
    }
    matching.sort((a, b) => a.length - b.length);
    var content = matching.map(match => {
        var [cn, ar] = match.split('\t');
        return `<tr class="row"><td class="data cn">${cn}</td><td class="data ar">${ar}</td></tr>`;
    }).join('')
    if (limitReached) {
        reached.classList.remove("hidden");
    } else {
        reached.classList.add("hidden");
    }
    result.innerHTML = `<table><tbody>${content}</tbody></table>`;
    Array.from(document.getElementsByClassName("data")).map(elem => elem.addEventListener("click", (e) => {
        navigator.clipboard.writeText(e.target.innerHTML);
        var nb = document.getElementById("notification-box");
        nb.innerHTML = `تم نسخ ${e.target.innerHTML}`;
        if (notificationRemover != null) {
            clearTimeout(notificationRemover);
            notificationRemover = null;
        }
        nb.classList.add("notification-show");
        notificationRemover = setTimeout(() => {
            nb.classList.remove("notification-show");
            notificationRemover = null;
        }, 3000);
    }));
}

document.getElementById("search").addEventListener("keyup", updateResult);
