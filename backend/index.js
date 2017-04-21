'use strict';

const Argv = require('minimist')(process.argv.slice(2));
const Helmet = require('helmet');
const Session = require('express-session');
const FileStore = require('session-file-store')(Session);
const Express = require('express');
const BodyParser = require('body-parser');
const Proxy = require('http-proxy-middleware');
const Axios = require('axios');
const Promise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));
const App = Express();
const Url = require('url');
const Fs = require('fs');
const _ = require('lodash');

const DEBUG = /--debug/.test(process.argv.toString());
const FAKE_DATA = false;
const FakeStore = require('./fake-store.js');

const Config = JSON.parse(Fs.readFileSync('config.json'));

const HOST = argv.host || process.env.HOST || '0.0.0.0';
const PORT = argv.port || process.env.PORT || 8002;
const TIMEOUT = argv.timeout || process.env.TIMEOUT || 300000;
const MS_SITE_BUILDER_URL = argv.builderUrl || process.env.MS_SITE_BUILDER_URL || 'http://localhost:8003';
const AUTH_URL = argv.authUrl || process.env.AUTH_URL || 'https://api.easywebhub.com';
const GITEA_WRAPPER_URL = argv.giteaWrapperUrl || process.env.GITEA_WRAPPER_URL || 'http://localhost:7000';

App.use(Helmet());
App.disable('x-powered-by');

App.use(Session({
    secret:            'bi mat',
    store:             new FileStore({
        retries: 0,
    }),
    resave:            false,
    saveUninitialized: true,
    cookie:            {secure: false},
    unset:             'destroy',
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
    // console.log('createProxyHandler proxy target', target);
    return Proxy({
        target:       target,
        changeOrigin: true,
        pathRewrite:  function (path, req) {
            // console.log('createProxyHandler path', path);
            // remove /proxy
            // var pathParts = path.split('/');
            // pathParts.shift(); // remove first /
            // pathParts.shift(); // remove 'proxy'
            // path = '/' + pathParts.join('/');
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


App.get('/check-token', (req, res, next) => {
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
App.use('/ide', staticHandler);

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
    return Axios.post(AUTH_URL + '/auth/signin', {
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
        req.session.user = transformUserInfo(userInfo);
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
            req.session.user = transformUserInfo(resp.data);
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
        Axios.get(`${AUTH_URL}/users/${req.session.user.id}/websites`)
            .then(function (resp) {
                let usernameUrl = genUsername(req.session.user.username);
                let ret = _.map(resp.data, data => {
                    return {
                        confirmed:      data.Confirmed,
                        createDate:     data.CreateDate,
                        displayName:    data.DisplayName,
                        name:           data.Name,
                        repositoryPath: usernameUrl + '/' + data.Name,
                        id:             data.WebsiteId,
                        websiteType:    data.WebsiteType,
                    }
                });
                ResponseSuccess(res, ret);
            })
            .catch(function (err) {
                console.error('websites failed', req.session.user, err);
                ResponseError(res, err.toString());
            });
    }
});

App.post('/api/check-repository-name', JsonBodyParser, (req, res, next) => {
    if (!req.body.repositoryName)
        return ResponseError(res, 'invalid repository name');
    let repositoryName = req.body.repositoryName;
    // console.log('check repo name exists', req.session.user, `${AUTH_URL}/users/${req.session.user.id}/websites`);
    Axios.get(`${AUTH_URL}/users/${req.session.user.id}/websites`)
        .then(function (resp) {
            let exists = _.find(resp.data, {Name: repositoryName});
            if (exists !== undefined) {
                ResponseError(res, `repository name ${repositoryName} already exists`);
            } else {
                ResponseSuccess(res, resp.data);
            }
        })
        .catch(function (err) {
            ResponseError(res, err.toString());
        });
});

const genRepoName = function (name) {
    let ret = name.replace(/[\s]+/g, '-');
    ret = ret.replace(/[^A-Za-z0-9\-_]/g, '');
    return ret;
};

function genUsername(email) {
    return email.replace(/[@.]/g, '-');
}

App.post('/api/websites', JsonBodyParser, (req, res, next) => {
    if (!req.session.user) {
        return ResponseError(res, 'session not valid');
    }

    let siteName = req.body.siteName;
    let templateName = req.body.templateName;
    let repoName = genRepoName(siteName);

    // call gitea wrapper migration repos
    // TODO tam thoi req.session.user.username chinh la email
    let postData = {
        email:          req.session.user.username,
        templateName:   templateName,
        repositoryName: repoName,
    };
    console.log('start call remote migration');
    Axios.post(`${GITEA_WRAPPER_URL}/migration`, postData).then(resp => {
        let newSiteInfo = resp.data;
        // gen url username
        let username = genUsername(req.session.user.username);
        let uri = Url.parse(newSiteInfo.url);
        uri.username = newSiteInfo.username;
        uri.password = newSiteInfo.password;
        let fullRepoUrl = `${uri.protocol}//${newSiteInfo.username}:${newSiteInfo.password}@${uri.host}${uri.path}`;

        console.log('migration resp', resp.data);
        Promise.all([
            // call server Thanh add new website
            Axios.post(`${AUTH_URL}/users/${req.session.user.id}/websites`, {
                'Name':          repoName,
                'DisplayName':   siteName, // site name
                'Url':           newSiteInfo.url,
                'WebTemplateId': templateName,
            }),

            // call tao cloudflare subdomain
            Axios.post(`${GITEA_WRAPPER_URL}/repos/create-cloudflare-subdomain`, {
                "username":       username,
                "repositoryName": repoName
            }),

            // call create nginx config
            Axios.post(`${GITEA_WRAPPER_URL}/repos/create-nginx-virtual-host`, {
                "username":       username,
                "repositoryName": repoName
            }),

            // call ms-builder init repos
            Axios.post(`${MS_SITE_BUILDER_URL}/init`, {repoUrl: fullRepoUrl}),
        ]).then(results => {
            let ret = _.map(results, result => result.data);
            console.log('ALL success', ret);
            ResponseSuccess(res, 'success');
        }).catch(err => {
            console.log('All failed', err);
            ResponseError(res, err.toString());
        });
    }).catch(err => {
        console.log('migration err', err);
        ResponseError(res, err.toString());
    });


});

App.get('/api/contents/:usernameUrl/:repositoryName', JsonBodyParser, (req, res, next) => {
    // TODO check if user own this repository;
    if (!req.session.user) {
        return ResponseError(res, 'session not valid');
    }

    let usernameUrl = genUsername(req.session.user.username);
    if (usernameUrl !== req.params.usernameUrl)
        return ResponseError(res, 'wrong owner repository');

    let contentUrl = MS_SITE_BUILDER_URL + '/read-dir/' + usernameUrl + '/' + req.params.repositoryName + '/content';
    console.log('contentUrl', contentUrl);
    Axios.get(contentUrl).then(resp => {
        return ResponseSuccess(res, resp.data);
    }).catch(err => {
        console.log('read-dir failed', err);
        return ResponseError(res, err);
    })
});

App.get('/api/file/:usernameUrl/:repositoryName', JsonBodyParser, (req, res, next) => {
    if (!req.body.repositoryName)
        return ResponseError(res, 'invalid repository name');
    let usernameUrl = genUsername(req.session.user.username);
    if (usernameUrl !== req.params.usernameUrl)
        return ResponseError(res, 'wrong owner repository');
    let contentFileUrl = MS_SITE_BUILDER_URL + '/read-file/' + usernameUrl + '/' + req.params.repositoryName + '/content/index.md';
    Axios.get(contentFileUrl).then(resp => {
        res.end(resp.data);
    }).catch(err => {
        console.log('read-dir failed', err);
        return ResponseError(res, err);
    })
});

// Axios.post('http://127.0.0.1:7000/migration', {}).then(resp => {
//     console.log('migration resp');
// }).catch(err => {
//     console.log('migration err', err);
// });

App.get('/api/sign-out', function (req, res, next) {
    delete req.session.user;
    res.status(200);
    res.end();
});

App.post('/api/build', JsonBodyParser, function (req, res, next) {
    Axios.post(MS_SITE_BUILDER_URL + '/build', {
        repoUrl: req.body.repoUrl,
        task:    req.body.task
    }).then(function (resp) {
        return ResponseSuccess(res, resp.data);
    }).catch(err => {
        console.log('build error', err);
        return ResponseError(res, err);
    });
});

let proxyGet = createProxyHandler(MS_SITE_BUILDER_URL + '/read-file/');
let proxyPost = createProxyHandler(MS_SITE_BUILDER_URL + '/write-file/');

// TODO add authentication chong write repos khong thuoc quyền
App.get('*', proxyGet);
App.post('*', proxyPost);

let listener = App.listen(PORT, HOST, function () {
    let address = listener.address();
    console.log(`app listening at ${address.address}:${address.port}`);
});
