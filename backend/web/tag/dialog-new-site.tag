<dialog-new-site class="ui small modal" tabindex="-1" role="dialog" data-backdrop="static" style="width: 460px; margin-top: 20vh; margin-left: -230px; display: none">
    <div class="ui header" style="">
        <div class="content" style="text-align: left">
            Creating new site from template {template.name}
        </div>
    </div>

    <div class="content">
        <div show="{migrating}" class="image">
            <img src="/img/ewh/hardcore-forking.gif">
        </div>
        <div show="{!migrating}" class="ui form error">
            <div class="field">
                <label>Choose name for your website</label>
                <input refs="siteNameField" type="text" class="form-control" placeholder="" onkeyup="{siteNameChange}" disabled="{migrating}">
            </div>
            <div show="{errorMsg != ''}" class="ui error message">
                <p>{errorMsg}</p>
            </div>
        </div>
    </div>

    <div class="actions">
        <div class="ui deny button">Cancel</div>
        <div class="ui primary right labeled icon button {cloning ? 'loading' : ''} {disabled: (siteName==='' || template==null || cloning)}" onclick="{createSite.bind(this, siteName)}">Create
            <i class="add icon"></i>
        </div>
    </div>

    <script>
        var me = this;
        me.migrating = false;
        me.errorMsg = '';
        me.siteName = '';
        me.template = {};
        var modal = null;

        me.siteNameChange = function (e) {
            if (e.keyCode === 13) { // ENTER key
                me.createSite(me.siteName);
            } else {
                me.siteName = e.target.value;
            }
        };

        me.createSite = function (e) {
            me.siteName = me.siteName.trim();
            if (me.siteName === '') {
                me.errorMsg = 'empty site name';
                me.update();
                return;
            }

            me.migrating = 1;
            me.errorMsg = '';
            me.update();
            return axios.post('/api/websites', {
                templateName: me.template.name,
                siteName:     me.siteName,
            }).then(function (siteFolderName) {
                me.migrating = 0;
                me.update();
                me.hide();
                console.log('start open site', siteFolderName);
                // open site using site folder name in disk not displayName
                return me.parent.openSite({
                    name: siteFolderName
                });
            }).catch(function (err) {
                console.log('create new site failed', err);
                // stop loading animation
                me.migrating = 0;
                me.errorMsg = err.message;
                me.update();
            });
        };

        me.on('mount', function () {
            modal = $(me.root).modal({
                closable:       true,
                observeChanges: true
            });
        });

        me.on('unmount', function () {
            me.hide();
        });

        me.show = function (template) {
            modal.modal('show');
            me.template = template;
        };

        me.hide = function () {
            modal.modal('hide');
        };
    </script>

    <style></style>
</dialog-new-site>
