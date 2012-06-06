if ( typeof include == 'undefined' ) {
    var include = function(url, callback) {
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = "text/javascript";
        script.src = url;
        head.appendChild(script);
        
        if (undefined != callback) {
            if (script.attachEvent){
                script.attachEvent('onreadystatechange', function() {
                    callback(event.srcElement);
                });
            } else {
                script.addEventListener('load', callback, false);
            }
        }
    }
}

var _currentDir = function() {
    var root;
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
        var match = scripts[i].src.match(/(^|.*\/)init.js$/);
        if (match) {
            root = match[1].replace(/\/$/, '');
            break;
        }
    }
    return root;
};

var isLoadedScript = function(url) {
    var scripts = document.getElementsByTagName('script');
    
    for (var i = 0; i < scripts.length; i++) {
        if (scripts[i].src == url) {
            return true;
        }
    }
    
    return false;
}

var DS = '/';
var __DIR__ = _currentDir();

window.onload = function() {
    if ( typeof $ == 'undefined' && typeof jQuery == 'undefined' ) {
        include(__DIR__ + DS + 'jquery.1.7.2.js', function(e) {
            if (false == isLoadedScript(__DIR__ + DS + 'jquery.assist.js') ) {
                if ( (undefined != e.readyState && 'loaded' == e.readyState) || (e.type == 'load') ) {
                    include(__DIR__ + DS + 'jquery.assist.js');
                }
            }
        });
    } else {
        include(__DIR__ + DS + 'jquery.assist.js');
    }
}