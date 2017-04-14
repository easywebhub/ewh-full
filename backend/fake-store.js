'use strict';

let _ = require('lodash');
let store = {};
let idCount = 0;

module.exports = {
    login: function (email, pass) {
        let acc = _.find(store, {email: email, pass: pass});
        if (!acc) throw new Error('account not found');
        return acc;
    },

    register: function (email, pass) {
        let acc = _.find(store, {email: email});
        if (acc) throw new Error('account already exists');

        let id = ++idCount;
        store[id] = {
            accountId:    id,
            accountType:  'dev',
            accessLevels: ['dev'],
            pass:         pass,
            userName:     email,
            status:       'active',
            email:        email,
            info:         {
                address: '321 13 friday street',
                age:     69,
                name:    'F L Name',
                sex:     'male'
            },
            sites:        {}
        };
        return store[id];
    },

    getSites: function (userId) {
        let acc = store[userId];
        if (!acc) throw new Error('account not found');
        return acc.sites;
    },

    getSite: function (userId, siteName) {
        let acc = store[userId];
        if (!acc) throw new Error('account not found');
        let site = _.find(acc.sites, {name: `${userId}/${siteName}`});
        if (!site) throw new Error('site not found');
        return site;
    },

    addSite: function (userId, siteName, repositoryUrl) {
        let acc = store[userId];
        if (!acc) throw new Error('account not found');
        let site = _.find(acc.sites, {name: `${userId}/${siteName}`});
        if (site)
            throw new Error('site already exists');

        site = {
            displayName:   siteName,
            name:          userId + '/' + siteName,
            webSiteId:     '',
            webTemplateId: '',
            websiteType:   '',
            repositoryUrl: repositoryUrl,
        };

        acc.sites.push(site);
        return site;
    },

    delSite: function (userId, siteName) {
        let acc = store[userId];
        if (!acc) throw new Error('account not found');

        let siteIndex = _.findIndex(acc.sites, {name: `${userId}/${siteName}`});
        if (siteIndex === -1)
            throw new Error('site not found');

        return _.pullAt(siteIndex);
    },


};
