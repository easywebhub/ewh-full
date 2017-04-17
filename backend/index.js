'use strict';

const Argv = require('minimist')(process.argv.slice(2));
const Helmet = require('helmet');
const Session = require('express-session');
const Express = require('express');
const BodyParser = require('body-parser');
const Proxy = require('http-proxy-middleware');
const Axios = require('axios');
const argv = require('minimist')(process.argv.slice(2));
const App = Express();
const Url = require('url');
const Fs = require('fs');


const DEBUG = /--debug/.test(process.argv.toString());
const FAKE_DATA = false;
const FakeStore = require('./fake-store.js');

const Config = JSON.parse(Fs.readFileSync('config.json'));

App.use(Helmet());
App.disable('x-powered-by');

App.use(Session({
    secret:            'bi mat',
    resave:            false,
    saveUninitialized: true,
    cookie:            {secure: false}
}));

process.on('uncaughtException', (err) => {
    console.warn('uncaughtException', err);
});

let lastRefererBasePath = '';
const JsonBodyParser = BodyParser.json();

const ResponseError = function (res, error, statusCode) {
    statusCode = statusCode || 503;
    if (typeof(error) === 'string') {
        res.status(statusCode).send({message: error});
    } else {
        res.status(statusCode).send({message: error.toString()});
    }
};

const ResponseSuccess = function (res, data) {
    res.status(200).json(data);
};

function createProxyHandler(target) {
    return Proxy({
        target:       target,
        changeOrigin: true,
        pathRewrite:  function (path, req) {
            // console.log('path', path);
            if (!req.headers['referer']) return path;
            let uri = Url.parse(req.headers['referer']);
            // console.log('');

            // detect root path (thuong it hon 4 /)
            // console.log('path.split.length', path.split('/').length);
            if (path.split('/').length > 4) return path;

            let parts = uri.pathname.split('/');
            parts.pop(); // remove filename

            // console.log('parts.length', parts.length);
            if (parts.length === 4 && parts[3] === 'build') {
                lastRefererBasePath = parts.join('/');
            }

            let newPath = lastRefererBasePath + path;
            // console.log(req.headers['referer']);
            // console.log('path', path, 'newPath', newPath);
            if (path.startsWith('/css/')
                || path.startsWith('/js/')
                || path.startsWith('/fonts/')
                || path.startsWith('/vendors/')
                || path.startsWith('/assets/')
                || path.startsWith('/img/')
            ) {
                // trim after /build/
                // var start = lastRefererBasePath.
                // path =
                // console.log('newPath', newPath);
                return newPath;
            } else {
                // console.log('newPath', newPath);
                return newPath;
            }
        }
    });
}

let proxyGet = createProxyHandler(Config.builderUrl + '/read-file/');
let proxyPost = createProxyHandler(Config.builderUrl + '/write-file/');

App.get('/proxy', proxyGet);
App.post('/proxy', proxyPost);

App.get('/check-token', (req, res, next) => {
    console.log('check user token', !!req.session.user);
    if (!req.session.user) {
        res.sendStatus(401);
    } else {
        res.json(req.session.user);
    }
});

App.get('/build/:website', (req, res, next) => {
    console.log('build', req.params.website);
    next();
});

App.get('/api/templates', (req, res, next) => {
    Fs.readFile('templates.json', (err, data) => {
        if (err) return ResponseError(res, err);
        ResponseSuccess(res, JSON.parse(data.toString()));
        next();
    });
});

let staticHandler = Express.static('web');

App.get('/:username/:repository', staticHandler);
App.use('/', staticHandler);

let transformUserInfo = function (user) {
    return {
        id:          user.AccountId,
        accountType: user.AccountType,
        username:    user.UserName,
        status:      user.Status,
        accessLevel: user.AccessLevels || [],
        info:        {
            address: user.Info.Address,
            age:     user.Info.Age,
            name:    user.Info.Name,
            phone:   user.Info.Phone,
            sex:     user.Info.Sex
        }
    }
};

App.post('/api/user/login', JsonBodyParser, (req, res, next) => {
    if (FAKE_DATA) {
        try {
            let acc = FakeStore.login(req.body.email, req.body.password);
            req.session.user = acc;
            return ResponseSuccess(res, acc);
        } catch (err) {
            return ResponseError(res, err);
        }
    }

    // TODO check email, password và keu server đổi đăng ký sang email
    return Axios.post(Config.authUrl + '/auth/signin', {
        Username: req.body.email,
        Password: req.body.password
    }).then(function (resp) {
        let acc = transformUserInfo(resp.data);
        req.session.user = acc;
        ResponseSuccess(res, acc);
        // TODO req.session.user = acc;
    }).catch(err => {
        try {
            console.error('auth server error', err.response.data);
            ResponseError(res, err.response.data.Message);
        } catch (_) {
            ResponseError(res, err.toString());
        }
    });
});

// Register
App.post('/api/user', JsonBodyParser, (req, res, next) => {
    if (FAKE_DATA) {
        let userInfo = FakeStore.register(req.body.email, req.body.password);
        req.session.user = userInfo;
        return ResponseSuccess(res, userInfo);
    }
    // call register
    return Axios.post(Config.authUrl + '/users', {
        Username:    req.body.email,
        Password:    req.body.password,
        AccountType: 'user',
        Status:      'unverified',
        Info:        {
            Name:    '',
            Email:   req.body.email,
            Sex:     '',
            Address: '',
            Age:     ''
        }
    }).then(function (resp) {
        var ret = transformUserInfo(resp.data);
        // sign in to get AccountId
        return Axios.post(Config.authUrl + '/auth/signin', {
            Username: req.body.email,
            Password: req.body.password
        }).then(function (resp) {
            // save Account info to session
            req.session.user = resp.data;
            ResponseSuccess(res, resp.data);
        });
    }).catch(function (err) {
        console.error('register failed', req.session.user, err);
        ResponseError(res, err.toString());
    });
});

App.get('/api/websites', (req, res, next) => {
    if (!req.session.user) {
        return ResponseError(res, 'session not valid');
    }
    if (FAKE_DATA) {
        ResponseSuccess(res, FakeStore.getSites(req.session.user.id));
    } else {
        Axios.get(`http://api.easywebhub.com/users/${req.session.user.id}/websites`)
            .then(function (resp) {
                ResponseSuccess(res, resp.data);
            })
            .catch(function (err) {
                console.error('websites failed', req.session.user, err);
                ResponseError(res, err.toString());
            });
    }
});

App.post('/api/websites', JsonBodyParser, (req, res, next) => {
    if (!req.session.user) {
        return ResponseError(res, 'session not valid');
    }
    let siteName = req.body.siteName;
    ResponseSuccess(res, FakeStore.getSite(req.session.user.id, siteName));
});


const PORT = Argv.PORT || Config.port || 8888;

let listener = App.listen(PORT, Config.host, function () {
    let address = listener.address();
    console.log(`app listening at ${address.address}:${address.port}`);
});
