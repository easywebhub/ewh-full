<dialog-new-site class="ui small modal" tabindex="-1" role="dialog" data-backdrop="static" style="width: 460px; margin-top: 20vh; margin-left: -230px; display: none">
    <div class="ui header" style="">
        <div class="content" style="text-align: left">
            Creating new site from template {template.name}
        </div>
    </div>

    <div class="content">
        <div class="ui form error">
            <div class="field">
                <label>Choose name for your website</label>
                <div ref="siteNamePopup" class="ui icon input" data-variation="wide">
                    <input ref="siteNameField" type="text" class="form-control" placeholder="" onkeydown="{siteNameChange}" onblur="{hidePopup}" disabled="{migrating}">
                    <i class="{siteNameClass()} link icon"></i>
                </div>
                <div class="ui popup">
                    Your repository name will be <strong>{repositoryName}</strong>
                </div>
            </div>

            <div show="{errorMsg != ''}" class="ui error message">
                <p>{errorMsg}</p>
            </div>
        </div>
    </div>

    <div class="actions">
        <div class="ui deny button">Cancel</div>
        <div class="ui primary right labeled icon button {migrating ? 'loading' : ''} {disabled: (siteName==='' || migrating || siteNameStatus != 1)}" onclick="{createSite.bind(this, siteName)}">Create
            <i class="add icon"></i>
        </div>
    </div>

    <script>
        var me = this;
        me.migrating = false;
        me.siteNameStatus = 0;
        me.errorMsg = '';
        me.siteName = '';
        me.repositoryName = '';
        me.template = {};

        me.siteNameAvailable = false;


        var popup = null;
        var popupElm = null;
        var modal = null;

        var genRepoName = function (name) {
            var ret = name.replace(/[\s]+/g, '-');
            ret = ret.replace(/[^A-Za-z0-9\-_]/g, '');
            return ret;
        };

        me.hidePopup = function () {
            popup.popup('hide');
        };

        me.siteNameClass = function () {
            console.log('siteNameClass changed');
            switch (me.siteNameStatus) {
                case -1:
                    return 'red remove';
                case 0:
                    return '';
                case 1:
                    return 'green check';
            }
        };

        me.siteNameChange = _.debounce(function (e) {
            if (e.ctrlKey || e.altKey) return;
            if (e.keyCode === 13) { // ENTER key
                me.createSite(me.siteName);
                return;
            }

            me.siteName = e.target.value;
            me.siteNameValid = false;
            me.repositoryName = genRepoName(me.siteName);

            popupElm.removeClass('error');

            if (me.siteName === '') {
                me.siteNameStatus = 0;
                me.update();
                return;
            }

            popupElm.addClass('loading');
            me.update();


            if (me.repositoryName !== me.siteName) {
                popup.popup('show');
            }

            axios.post('/api/check-repository-name', {repositoryName: me.repositoryName})
                .then(function (resp) {
                    console.log('repo name available');
                    popupElm.removeClass('loading');
                    me.siteNameStatus = 1;
                    me.update();
                })
                .catch(function (err) {
                    console.log('repo name unavailable');
                    popupElm.removeClass('loading');
                    me.siteNameStatus = -1;
                    me.update();
                });
        }, 300);

        me.createSite = function (e) {
            me.errorMsg = '';
            me.migrating = true;
            me.update();

//            setTimeout(function () {
//                me.errorMsg = 'test error';
//                me.siteNameStatus = -1;
//                me.migrating = false;
//                me.update();
//            }, 1000);

            return axios.post('/api/websites', {
                templateName: me.template.name,
                siteName:     me.siteName,
            }).then(function (resp) {
                console.log('new site success', resp.data);
                me.migrating = false;
                me.update();
                me.hide();
//                me.hide();
//                console.log('start open site', siteFolderName);
//                // open site using site folder name in disk not displayName
//                return me.parent.openSite({
//                    name: siteFolderName
//                });
            }).catch(function (err) {
                console.log('create new site failed', err.response.data);
                me.migrating = false;
                me.errorMsg = err.message;
                me.update();
            });
        };

        me.on('mount', function () {
            modal = $(me.root).modal({
                closable:       true,
                observeChanges: true,
                inline:         true,
                preserve:       true,
            });

            popupElm = $(me.refs.siteNamePopup);

            popup = popupElm.popup({
                closable: false,
                on:       'manual,'
            });
        });

        me.on('unmount', function () {
            me.hide();
        });

        me.show = function (template) {
            modal.modal('show');
            me.siteName = '';
            me.siteNameStatus = 0;
            me.migrating = false;
            $(me.refs.siteNameField).val('');

            me.template = template;
        };

        me.hide = function () {
            modal.modal('hide');
        };
    </script>

    <style></style>
</dialog-new-site>
