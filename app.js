function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function timeago(date) {
    var seconds = Math.floor((new Date() - date) / 1000);
    var interval = Math.floor(seconds / 31536000);
    if (interval > 1) {
      return interval + " n?m tr??c";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " th?ng tr??c";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " ng?y tr??c";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " gi? tr??c";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " ph?t tr??c";
    }
    return "v?i gi?y tr??c";
  }