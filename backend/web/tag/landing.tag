<landing>
    <dialog-login-signup ref="dialogLoginSignUp"></dialog-login-signup>
    <home ref="home"></home>
    <website-editor ref="websiteEditor"></website-editor>
    <script>
        var me = this;
        me.store.isLoggedIn = false;

        me.checkToken = function () {
            axios.get('/check-token').then(function (resp) {
                me.store.isLoggedIn = true;
                me.refs.dialogLoginSignUp.hide();

                me.refs.home.show();
                me.refs.home.loadUser(resp.data);
            }).catch(function (err) {
                console.log('check token failed', err);
                me.store.isLoggedIn = false;
                me.refs.home.hide();
                me.refs.dialogLoginSignUp.show();
            })
        };

        me.event.on('checkToken', me.checkToken);

        me.on('mount', function () {
            me.checkToken();
        });

        me.on('unmount', function () {

        });
    </script>

    <style></style>
</landing>
