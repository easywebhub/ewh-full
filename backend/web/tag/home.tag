<home style="display: none">
    <!--<div ref="main" class="ui grid" style="margin: 0; display: none">-->
    <!--<div class="sixteen wide column" style="padding: 0; display: flex;">-->
    <!--<div data-is="sidebar" site-builder-url="{opts.siteBuilderUrl}"></div>-->
    <!--<div data-is="iframe-inline-editor" site-builder-url="{opts.siteBuilderUrl}"></div>-->
    <!--</div>-->
    <!--</div>-->
    <div class="des-hero">
        <div class="ui grid container ">
            <div class="eight wide column">
                <a href="http://easywebhub.com" target="_blank">
                    <img src="/img/ewh/logo-easyweb-white.png" class="ui image" width="150" alt="">
                </a>
            </div>

            <div class="eight wide column" style="text-align: right">
                <div ref="userDropDownMenu" class="ui dropdown top right pointing">
                    <input type="hidden" name="gender">
                    <img class="ui avatar image" src="/img/ewh/jenny-user.jpg">
                    <span>{username}</span>
                    <i class="dropdown icon"></i>

                    <div class="menu">
                        <a class="item disabled" data-value="changeUserData"><i class="edit icon"></i> Edit profile</a>
                        <a class="item disabled" data-value="changeUserPassword"><i class="lock icon"></i> Change password</a>
                        <div class="divider"></div>
                        <a class="item" onclick="{signOut}"><i class="sign out icon"></i> Log out</a>
                    </div>
                </div>
            </div>
        </div>


        <div class="ui grid container ">
            <div class="wide column">
                <h1 class="ui header huge">Present your website, easily</h1>
                <h3>An open framework lets you build awesome websites with only HTML, CSS skills</h3>
                <div><i class="angle down icon large"></i></div>
            </div>
        </div>
    </div>

    <div class="marketplace">
        <div class="ui grid container ">
            <div class="sixteen wide column">
                <!--<h1 class="ui header weight-300 orange">Website Marketplace</h1>-->
                <div class="ui three stackable doubling cards">
                    <a each="{template, index in templateList}" class="ui card" href="#" onclick="{showCreateSite}">
                        <div class="image">
                            <!--<img src="{marketPlaceTemplateImageList[(index + 3) %4]}">-->
                        </div>
                        <div class="content">
                            <div class="header">{template.name}</div>
                            <div class="description">
                                <p>{template.description}</p>
                            </div>
                        </div>

                        <div class="extra content">
                            <i>by</i> <b style="color:black">{ template.author || 'EasyWeb' }</b>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <div class="user-project">
        <div class="ui grid container">
            <div class="sixteen wide column">
                <h2 class="ui header blue weight-300">
                    Your websites:
                    <div class="sub header">Choose a website to continue your work</div>
                </h2>

                <div class="ui four stackable doubling cards">
                    <a each="{site, index in sites}" class="ui card" href="#" onclick="{openSite}">
                        <div class="image">
                            <img src="{marketPlaceTemplateImageList[index % 4]}">
                        </div>
                        <div class="content">
                            <div class="header">{site.name}</div>
                            <div class="description">
                                <p>{site.description}</p>
                            </div>
                        </div>
                        <div class="extra content">
                            <i class="edit icon"></i>
                            {moment("2016-10-20T08:54:54.924Z").fromNow()}
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>

    <dialog-new-site ref="dialogNewSite"></dialog-new-site>

    <script>
        var me = this;
        me.marketPlaceTemplateImageList = [];
        me.templateList = [];
        me.sites = [];

        me.loadUser = function (user) {
            console.log('home - loadUser', user);
            axios.get('/api/templates').then(function (resp) {
                console.log('api/templates resp', resp);
                me.templateList = resp.data.templates;
                me.update();
            }).catch(function (err) {
                console.log('api/templates error', err);
            });

            axios.get('/api/websites').then(function (resp) {
                console.log('api/websites resp', resp);
                me.sites = resp.data;
                me.update();
            }).catch(function (err) {
                console.log('api/websites error', err);
            })
        };

        me.signOut = function () {
            axios.get('/api/sign-out').then(function () {
                // console.log('TODO unmount');
            });
        };

        me.show = function () {
            $(this.root).show();
        };

        me.hide = function () {
            $(this.root).hide();
        };

        me.openSite = function (e) {
            console.log('openSite', e.item);
        };

        me.showCreateSite = function (e) {
            console.log('showCreateSite', e.item);
            me.refs.dialogNewSite.show(e.item.template);
        };

        //        var sideBar, editor, sitePath;
        //
        //        me.on('selectFile', function (fileName, filePath) {
        //            console.log('select file', fileName, filePath);
        //            // remove 'repository' from filePath
        //            var parts = filePath.split('.');
        //            parts.pop(); // remove file extension '.md'
        //            var slug = parts.join('.').split('/').pop();
        //
        //            var pageUrl = me.sitePath
        //                + '/build/'
        //                + slug;
        //
        //            if (pageUrl.endsWith('/index'))
        //                pageUrl += '.html';
        //
        //            if (!pageUrl.endsWith('/index.html'))
        //                pageUrl += '/index.html';
        //
        //            console.log('pageUrl', pageUrl);
        //            editor.setUrl(pageUrl);
        //        });
        //
        //        me.on('chooseSite', function (sitePath) {
        //            console.log('chooseSite', sitePath);
        //            me.sitePath = sitePath;
        //            me.tags['dialog-choose-site'].hide();
        //
        //            $(me.refs['main']).show();
        //
        //            var fileListUrl = me.opts.siteBuilderUrl + '/read-dir/' + sitePath + '/content';
        //            console.log('fileListPath', fileListUrl);
        //
        //            var indexUrl = sitePath + '/build/index.html';
        //            if (!indexUrl.startsWith('/')) indexUrl = '/' + indexUrl;
        //            console.log('indexUrl', indexUrl);
        //            editor.setUrl(indexUrl);
        //
        //            axios.get(fileListUrl).then(function (resp) {
        //                var files = resp.data.result;
        //                sideBar.loadFiles(files);
        //            });
        //
        //            Split([sideBar.root, editor.root], {
        //                direction:  'horizontal',
        //                snapOffset: 0,
        //                sizes:      [20, 80],
        //                minSize:    [200, 300],
        //                gutterSize: 6
        //            });
        //        });
        //
        //        me.on('startBuild', function () {
        //            console.log('startBuild', 'http://dummy.com/' + me.sitePath);
        //            axios.post(me.opts.siteBuilderUrl + '/build', {
        //                repoUrl: 'http://dummy.com' + me.sitePath,
        //                task:    'metalsmith'
        //            }).then(function (resp) {
        //                console.log('build success', resp);
        //                editor.trigger('endBuild', true);
        //            }).catch(function (error) {
        //                console.log('error');
        //                editor.trigger('endBuild', false);
        //            });
        //        });

        me.on('mount', function () {
            $(me.refs.userDropDownMenu).dropdown();

//            sideBar = me.tags['sidebar'];
//            editor = me.tags['iframe-inline-editor'];
//
//
//            // handle if url have username and repository info
//            var parts = document.location.pathname.split('/');
//            if (parts.length >= 4) {
//                var username = parts[2];
//                var repository = parts[3];
//                sitePath = username + '/' + repository;
//                if (!sitePath.startsWith('/')) sitePath = '/' + sitePath;
//                setTimeout(function () {
//                    me.trigger('chooseSite', sitePath);
//                });
//            } else {
//                // wait for dialog-choose-site mount
//                setTimeout(function () {
//                    me.tags['dialog-choose-site'].show();
//                });
//            }

//            setTimeout(function () {
//                me.trigger('chooseSite', '/qq/demo-deploy-github');
//            });
        });

        me.on('unmount', function () {

        });
    </script>

    <style>
        app {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
        }

        .gutter {
            background-color: #eee;
            display: inline-block;

            background-repeat: no-repeat;
            background-position: 50%;
            height: 100vh;
        }

        .gutter.gutter-horizontal {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
            cursor: ew-resize;
        }

        .gutter.gutter-vertical {
            background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
            cursor: ns-resize;
        }
    </style>
</home>
