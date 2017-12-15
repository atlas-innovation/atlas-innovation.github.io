WH = function() {
    var base = this;
    //domain
    var domain= 'whoozer.fr',
        apiHost = '',
        connectHost = '',
        cdnUrl = '',
        arbiterUrl = '',

    //Application ID
        app_id = null,

    //AccessToken
        ars = {},

    //options
        cookie = false,
        logging = true,
        status = true,

        debug= false,

        login_method='normal',

        settings = {
            api: {
                host : apiHost
            }
        };



    /* SDK STATE */
    this.applicationReady = false;
    this.loginReady = false;
    this.sdkReady = false;
    this.userReady = false;

    this.user = undefined;

    /* PARAMS */
    this.sdkOptions= {};
    this.queryOptions = {};
    this.appOptions = {};

    var pid_count = 0;
    var pid_callback = {};

    var logSdk = function(str) {
        if (debug && typeof console != "undefined" && typeof console.log == "function") {
            //console.log(str);
        }
    };

    var sdkIsReady = function() {
        if(base.loginReady && base.applicationReady && !base.sdkReady){
            var event = document.createEvent("CustomEvent");
            event.initCustomEvent("tu.sdk.ready", true, true, {});
            document.dispatchEvent(event);
            var message = "event#"+JSON.stringify({'name' : 'tu.sdk.ready'});
            base.sdkReady = true;
        }
        return base.sdkReady;
    };


    var setDomain = function(d){
        var p = window.location.protocol;
        domain = d;
        apiHost = p+'//api'+d+'/api';
        connectHost = p+'//connect.'+d;
        arbiterUrl = p+'//'+d+'/oauth/v2/xd_arbiter';
        cdnUrl =  p+'//cdn.'+d;
        settings.api.host = apiHost;
    };

    var getDomain = function() {
        return {
            domain : domain,
            apiHost : apiHost,
            connectHost : connectHost,
            cdnUrl : cdnUrl
        }
    };
    var setLoginMethod = function(loginMethod){
        if('facebook' == loginMethod || 'normal' == loginMethod) {
            login_method = loginMethod;
        } else {
            throw Error('specified login method is not supported');
        }
    };

    //Init function
    var init = function(options) {
        if(app_id !== null){
            logSdk("PB.init has already been called - this could indicate a problem");
        }
        if(typeof(options) == "string"){
            logSdk("PB.init called with invalid parameters");
        }
        for(var key in options){
            switch (key){
                case 'appId' : app_id = options[key];break;
                case 'cookie' : cookie = options[key];break;
                case 'logging' : logging = options[key];break;
                case 'status' : status = options[key];break;
                case 'debug' : debug = options[key];break;
                case 'xpbml' : break;
                case 'channelUrl': break;
                case 'authResponse' : break;
                case 'domain': setDomain(options[key]);break;
                case 'loginMethod': setLoginMethod(options['loginMethod']);break;
            }
        }
        if(app_id === null){
            logSdk('app_id must be provide');
        }

        base.sdkOptions = options;
        Auth.initAuth();
        Application.initParams();


        setDomain(domain);
    };

    function getUserID() {
        return ars ? ars.user_id : false;
    }

    //Api request
    var api = function(url, method, parameters, callback) {
        if(typeof(method) == "undefined" || typeof(method) != "string"){
            method = 'GET';
        }
        var methodReg = /^(GET|POST|DELETE|PUT)$/i;
        if(!methodReg.test(method)){
            logSdk("Invalid method passed to ApiClient: "+method);
            return;
        }
        if(typeof(parameters) != "object" && typeof(parameters) != "undefined"){
            logSdk('error : Invalid parameters type passed to ApiClient: ');
            return;
        }
        if(typeof(parameters) == "undefined"){
            parameters = {};
        }
        url = apiHost + url;
        _oauthRequest(url, method, parameters, callback);
    };

    var Event = {
        subscribe : function(eventName, listener) {
            window.addEventListener(eventName, listener, false);
        },
        unsubscribe : function(eventName, listener){
            window.removeEventListener(eventName, listener, false);
        }
    };

    var Application = function() {

        var params = {};

        var initParams = function() {
            base.applicationReady = true;
            sdkIsReady();
        };

        var getParams = function() {
            return {
                'sdkOptions' : base.sdkOptions
            };
        };

        var getParam = function(name) {
            var arrayRegexp = /(.+)\[(.+)\]/,
                extracted = arrayRegexp.exec(name),
                env='prod';
            if('env'!=name) {
                env = getParam('env');
            }

            if(extracted) {
                if('object' == typeof base.sdkOptions[extracted[1]] && 'undefined' != typeof base.sdkOptions[extracted[1]][extracted[2]]) {
                    return base.sdkOptions[extracted[1]][extracted[2]];
                } else if('object' == typeof base.queryOptions[extracted[1]] && 'undefined' != typeof base.queryOptions[extracted[1]][extracted[2]]) {
                    return decodeURIComponent(base.queryOptions[extracted[1]][extracted[2]]);
                } else if('object' == typeof base.appOptions['stylebook_options'][env][extracted[1]] && 'undefined' != typeof base.appOptions['stylebook_options'][env][extracted[1]][extracted[2]]) {
                    return base.appOptions['stylebook_options'][env][extracted[1]][extracted[2]];
                }
            }

            if('undefined' != typeof base.sdkOptions[name]) {
                return base.sdkOptions[name];
            } else if('undefined' != typeof base.queryOptions[name]) {
                return base.queryOptions[name];
            }  else if('undefined' != typeof base.appOptions['stylebook_options'][env][name]) {
                return base.appOptions['stylebook_options'][env][name];
            } else {
                return undefined;
            }
        };

        return {
            initParams: initParams,
            getParams : getParams,
            getParam : getParam
        }
    }();

    var Auth = function() {
        function setAuthResponseCookie(authResponse){
            var expDate = new Date();
            expDate.setTime(expDate.getTime() + authResponse.expires_in * 1000);
            document.cookie = "whars_"+app_id+"="+encodeURIComponent(utils.serialize(authResponse,undefined))+ ";expires=" + expDate.toUTCString()+";path=/";
        }

        function deleteAuthCookie() {
            document.cookie = "whars_"+app_id+'=;expires=Thu, 01-Jan-70 00:00:01 GMT;path=/';
        }

        function clearAuth() {
            var revoke=false;
            var form = document.createElement('form');
            form.setAttribute('target', 'pb_logout_frame_http');
            form.setAttribute('method', 'post');
            form.setAttribute('action', connectHost+'/oauth/v2/revoke');
            form.setAttribute('style','display:none;');

            if(ars && ars.access_token) {
                var inputA = document.createElement('input');
                inputA.setAttribute('name',"access_token");
                inputA.setAttribute('type',"hidden");
                inputA.setAttribute('value', ars.access_token);
                form.appendChild(inputA);

                revoke=true;
            }
            if(ars && ars.refresh_token) {
                var inputR = document.createElement('input');
                inputR.setAttribute('name',"refresh_token");
                inputR.setAttribute('type',"hidden");
                inputR.setAttribute('value', ars && ars.refresh_token);
                form.appendChild(inputR);

                revoke=true;
            }
            if(revoke) {
                deleteAuthCookie();
            }
        }

        function setAuthResponseFromHash(hash){
            var data = hash.split('#');
            var params = {};
            logSdk(data);
            if(data.length > 1){
                params = utils.QueryStringToJSON(decodeURI(data[1]));
            }

            var authResponse = {};
            for(var i in params){
                switch(i){
                    case "access_token" : authResponse.access_token = params[i];break;
                    case "refresh_token" : authResponse.refresh_token = params[i];break;
                    case "expires_in" : authResponse.expires_in = params[i];break;
                    case "user_id" : authResponse.user_id = params[i];break;
                    case "scope" : authResponse.scope = params[i].replace(/\+/g, ' ');break;
                }
            }
            Auth.setAuthResponse(authResponse, false);
        }

        function getAuthResponseCookie() {
            var cookies = document.cookie.split(';');
            for(var i in cookies){
                var cookiesKV = cookies[i].split('=');
                var cookieName = cookiesKV[0].trim();
                if(cookieName == "whars_"+app_id){
                    var cookieVal = decodeURIComponent(cookiesKV[1]);
                    if(cookieVal[0]=='"' && cookieVal[cookieVal.length-1]=='"') {
                        cookieVal= cookieVal.substr(1,cookieVal.length-2);
                    }
                    return utils.QueryStringToJSON(cookieVal);
                }
            }
            return null;
        }

        function initAuth() {
            var authResponse = getAuthResponseCookie();
            if(authResponse){
                try {
                    setAuthResponse(authResponse, true);
                } catch(err) {
                    deleteAuthCookie();
                }
            }else {
                var hash = window.location.hash;
                if(hash.length > 0){
                    try {
                        setAuthResponseFromHash(hash);
                    }catch(err){

                    }
                }
            }

            sdkIsReady();

        }

        function setAuthResponse(authResponse, fromCookie){
            if(!authResponse.access_token || !authResponse.refresh_token || !authResponse.expires_in || !authResponse.user_id || !authResponse.scope){
                throw Error('invalid authResponse')
            }

            authResponse.scope = authResponse.scope.replace(/\+/g, ' ');
            authResponse.scope = '';
            ars = authResponse;
            if(false === fromCookie) {
                setAuthResponseCookie(authResponse);
            }
        }

        function isLoggedIn(scope) {
            if(!ars || !ars.scope) {
                return false;
            }

            if('string' == typeof scope) {
                scope = scope.split(' ');
            }

            if(!(scope instanceof Array)) {
                throw Error('Can\'t interpret scope');
            }

            var actualScope = ars.scope.split(' ');

            for(var i in scope) {
                if(-1 == actualScope.indexOf(scope[i])) {
                    deleteAuthCookie();
                    return false;
                }
            }
            return true;
        }

        return {
            'initAuth' : initAuth,
            'clearAuth': clearAuth,
            'setAuthResponse' : setAuthResponse,
            'isLoggedIn' : isLoggedIn,
            'setAuthResponseFromHash' : setAuthResponseFromHash
        };
    }();

    var hasPerm = function(scope){

    };

    var getAccessToken = function(){
        return ars ? typeof(ars.access_token) == "string"?ars.access_token:"":"";
    };

    //Make Oauth Request with XDomainRequest
    var _oauthXDomainRequest = function(url, method, parameters, callback, async){
        if(typeof(async) == "undefined"){
            async = true; //TODO What to do ?
        }
        var xdr = new XDomainRequest();
        //Set client_id parameter for public method
        if(typeof(ars.access_token) != "string"){
            parameters.client_id = app_id;
        }
        //Set OauthToken in parameters
        if(typeof(PB) != "undefined"){
            if(PB.getAccessToken()){
                parameters.oauth_token = PB.getAccessToken();
            }
        }
        parameters = utils.serialize(parameters);
        xdr.open(options.type, options.url);//TODO options is not defined anywhere?
        xdr.send(parameters);
    };

    //Make Oauth Request
    var _oauthRequest = function(url, method, parameters, callback, async){
        if(typeof(async) == "undefined"){
            async = true;
        }
        var xmlhttp = new XMLHttpRequest();
        //Set client_id parameter for public method
        if(typeof(ars.access_token) != "string"){
            parameters.client_id = app_id;
        }
        parameters = utils.serialize(parameters);
        //Open httpRequest
        if(method == "GET"){
            xmlhttp.open(method,url+"?"+parameters,async);
        }else {
            xmlhttp.open(method,url,async);
        }
        //Set oauth HEADER
        if(typeof(ars.access_token) == "string"){
            xmlhttp.setRequestHeader('Authorization', 'OAuth="'+getAccessToken()+'"');
        }
        //Send
        if(method == "GET"){
            xmlhttp.send('');
        }else {
            xmlhttp.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
            xmlhttp.send(parameters);
        }

        xmlhttp.onreadystatechange = function() {
            if (this.readyState==4 && 'function' == typeof callback) {
                callback(JSON.parse(xmlhttp.responseText), xmlhttp.status);
            }
        };
    };

    var logout = function () {
        Auth.clearAuth();
    };

    var login = function(callback, options){
        pid_count++;
        pid_callback[pid_count] = function(){
            if(typeof callback == "function"){
                var response = {
                    'session' : Auth.isLoggedIn(options.scope),
                    'scope' : scope
                };
                callback(response);
            }
        };

        if(Auth.isLoggedIn(options.scope)) {
            pid_callback[pid_count]();
            delete(pid_callback[pid_count]);
            return;
        }

        if(app_id === null){
            logSdk('call PB.init() before PB.login()');
            return;
        }

        if(typeof options.login_method == 'undefined') {
            options.login_method = login_method;
        }

        var dialogUri,
            width,
            height,
            scope='',
            response_type = "token",
            redirect_uri = "http://"+domain+"/oauth/v2/dialog-callback";

        if('facebook' == options.login_method) {
            dialogUri = "/oauth/v2/facebook/dialog";
            width = 980 ;
            height = 600 ;
        } else if('normal' == options.login_method) {
            dialogUri = "/oauth/v2/dialog";
            width = 600;
            height = 450;
        } else {
            throw Error('Don\'t understand how to log in');
        }

        if('facebook' == options.login_method || 'normal' == options.login_method) {
            if(typeof(options) != "undefined" && typeof(options.redirect_uri) == "string"){
                redirect_uri = options.redirect_uri;
            }
            if(typeof(options) != "undefined" && typeof(options.scope) == "string") {
                scope = options.scope;
            }
            if(typeof(options) != "undefined" && typeof(options.scope) == "object") {
                scope = options.scope.join(' ');
            }

            var url = connectHost + dialogUri + "?scope="+scope+"&client_id="+app_id+"&response_type="+response_type+"&redirect_uri="+redirect_uri+"&pid="+pid_count;
            if(typeof(options) != "undefined" && typeof(options.type) == "string" && options.type == "window"){
                window.location = url;
            }else {
                window.open(url,"Connect", 'height='+height+', width='+width+', toolbar=no, menubar=no, scrollbars=no, resizable=no, location=no, directories=no, status=no');
            }
        }
    };

    var utils = (function(){
        //Serialize parameter for uri
        function serialize(obj, prefix) {
            var str = [];
            for(var p in obj) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?serialize(v, k) : encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        }

        function QueryStringToJSON(href) {
            var qStr = href.replace(/(.*?\?)/, ''); // remove prefix before question mark in query string
            var qArr = qStr.split('&');
            var stack = {};
            for (var i in qArr) {
                var a = qArr[i].split('=');
                var name = a[0],value = isNaN(a[1]) ? a[1] : parseFloat(a[1]);
                if (name.match(/(.*?)\[(.*?)]/)) {
                    name = RegExp.$1;
                    var name2 = RegExp.$2;
                    //alert(RegExp.$2)
                    if (name2) {
                        if (!(name in stack)) {
                            stack[name] = {};
                        }
                        stack[name][name2] = value;
                    } else {
                        if (!(name in stack)) {
                            stack[name] = [];
                        }
                        stack[name].push(value);
                    }
                } else {
                    stack[name] = decodeURIComponent(value);
                }
            }
            return stack;
        }

        return {
            'serialize' : serialize,
            'QueryStringToJSON' : QueryStringToJSON
        };
    })();


    var getUser =  function() {
        return base.user;
    };

    return {
        'Auth' : Auth,
        'Event' : Event,
        'Application' : Application,
        'init' : init,
        'api' : api,
        'login' : login,
        'logout' : logout,
        'getAccessToken' : getAccessToken,
        'settings' : settings,
        'getUserID': getUserID,
        'setDomain': setDomain,
        'getDomain' : getDomain,
        'sdkIsReady' : sdkIsReady,
        'hasPerm' : hasPerm,
        'getUser' : getUser
    };
}();
