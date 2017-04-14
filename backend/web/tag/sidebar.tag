<sidebar style="display: inline-block; padding:0; width: 200px;">
    <div class="ui attached segment" style="height: 100vh; padding: 0;">
        <div class="ui top attached label"><h4 class="ui header">Content</h4></div>
        <div class="" style="overflow-x: hidden; padding: 0; height: calc(100vh - 40px); overflow-y: auto; margin: 35px 0 0 !important;">
            <div class="ui celled link list">
                <a each="{files}" class="item" data-file-path="{path}" click="{selectFile}">{name}</a>
            </div>
        </div>
    </div>

    <script>
        var me = this;
        me.files = [];

        me.loadFiles = function (files) {
            me.files = _.filter(files, function (file) {
                if (file.name.endsWith('.json'))
                    return false;
                return true;
            });
            me.update();
        };

        me.selectFile = function (e) {
            $(me.root).find('.link>.item').removeClass('active');
            $(e.target).addClass('active');
            var selectedFile = e.item;
            me.parent.trigger('selectFile', selectedFile.name, selectedFile.path);
        };

        me.on('mount', function () {

        });

        me.on('unmount', function () {

        });
    </script>

    <style></style>
</sidebar>
