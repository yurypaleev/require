var require = function(cache, modules) {
    function dependence(parent) {
        function require(id) {
            while(typeof cache[id] === 'string') {
                id = cache[id];
            }

            var module = new Module(id, parent);

            if(!cache[module.filename]) {
                var req = new (window.XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0');

                req.open('GET', module.filename, false);
                req.send();

                if(req.status && req.status !== 200) {
                    throw new Error(req.statusText);
                }

                modules[module.filename] = new Function('module', 'require', 'exports', '__filename', '__dirname', '//# sourceURL=' + module.filename + '\n' + req.responseText);
            }
            if(!cache[module.filename] && modules[module.filename] instanceof Function) {
                modules[module.filename].call(module.exports, module, dependence(module), module.exports, module.filename, module.dirname);
                module.loaded = true;

                cache[module.filename] = module;
            }

            return cache[module.filename].exports;
        }
        require.cache = cache;
        return require;
    }

    function Module(id, parent) {
        var pathArray = [];

        this.id = id;

        if(parent) {
            parent.children.push(this);
        }

        if(id[0] !== '/') {
            id = (parent && parent.dirname || '') + '/' + id;
        }
        if(!/^(f|ht)tps?\:\/\//.test(id)) {
            id = location.origin + id;
        }
        if(id.slice(-3) !== '.js') {
            id += '.js';
        }
        if(dataset && dataset.build) {
            id += '?build=' + dataset.build;
        }

        id.split('/')
            .forEach(function(token) {
                if(token === '..') {
                    pathArray.splice(pathArray.length - 1, 1);
                }
                if(token !== '.' && token !== '..') {
                    pathArray.push(token);
                }
            });

        this.filename = pathArray.join('/');
        this.dirname = pathArray.slice(0, -1).join('/');
        this.exports = this.filename in cache ? cache[this.filename].exports : {};
        this.parent = parent;
        this.children = [];
        this.loaded = false;
    }

    var parent = dependence(null);
    var dataset = document.currentScript && document.currentScript.dataset;

    if(dataset && dataset.main) {
        setTimeout(function() {
            parent(dataset && dataset.main);
        }, 1);
    }

    parent.modules = modules;

    return parent;
}({}, {});