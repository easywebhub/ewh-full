<website-editor style="display: none;">
    <sidebar></sidebar>
    <iframe-inline-editor></iframe-inline-editor>

    <script>
        var me = this;
        var sideBar, editor;
        me.siteInfo = {};

        me.loadContents = function () {
            console.log('loadContents url', '/api/contents/' + me.siteInfo.repositoryPath);
            axios.get('/api/contents/' + me.siteInfo.repositoryPath).then(function (resp) {
                var files = resp.data.result;
                console.log('loadContents', files);
                sideBar.loadFiles(files);
            });
        };

        me.on('startBuild', function () {
            console.log('startBuild', 'http://dummy.com/' + me.siteInfo.repositoryPath);
            axios.post('/api/build', {
                repoUrl: 'http://dummy.com/' + me.siteInfo.repositoryPath,
                task:    'metalsmith'
            }).then(function (resp) {
                console.log('build success', resp);
                editor.trigger('endBuild', true);
            }).catch(function (error) {
                console.log('error');
                editor.trigger('endBuild', false);
            });
        });

        me.event.on('openSite', function (siteInfo) {
            me.siteInfo = siteInfo.site;
            console.log('website-editor openSite', me.siteInfo);
            me.show();
            var reviewUrl = 'http://' + me.siteInfo.repositoryPath.split('/').reverse().join('.') + '.easywebhub.me';
            console.log('reviewUrl', reviewUrl);
            me.loadContents();

//            me.sitePath = sitePath;
//
//            var fileListUrl = me.opts.siteBuilderUrl + '/read-dir/' + sitePath + '/content';
//            console.log('fileListPath', fileListUrl);
//
            var reviewIndexUrl = reviewUrl + '/index.html';
            console.log('reviewIndexUrl', reviewIndexUrl);
            editor.setReviewUrl(reviewIndexUrl); // preview btn url when click

            editor.setUrl('/' + me.siteInfo.repositoryPath + '/build/index.html'); // iframe src
//

//
            Split([sideBar.root, editor.root], {
                direction:  'horizontal',
                snapOffset: 0,
                sizes:      [20, 80],
                minSize:    [200, 300],
                gutterSize: 6
            });
        });

        me.on('mount', function () {
            sideBar = me.tags['sidebar'];
            editor = me.tags['iframe-inline-editor'];
        });

        me.on('unmount', function () {

        });

        me.show = function () {
            $(this.root).show().css('display', 'flex');
        };

        me.hide = function () {
            $(this.root).hide();
        };
    </script>

    <style>

    </style>
</website-editor>
