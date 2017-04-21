<dialog-login-signup class="ui small modal" tabindex="-1" role="dialog" data-backdrop="static" style="width: 460px; margin-top: 20vh; margin-left: -230px; display: none">
    <!--<div class="header" style="border-bottom: 0">-->
    <!--Account Settings-->
    <!--<div class="sub header">Manage your account settings and set e-mail preferences.</div>-->
    <!--</div>-->
    <div class="ui header" style="">
        <i class="{isLogin ? 'sign in' : 'signup'} icon" style=""></i>
        <div class="content" style="text-align: left">
            {isLogin ? 'Login to EasyWeb' : 'Register EasyWeb account'}
            <!--<div class="sub header">Manage your account settings and set e-mail preferences.</div>-->
            <!--<div class="sub header"></div>-->
        </div>
    </div>
    <div class="content">
        <form class="ui form error {loading : isRequesting}">
            <div class="required field">
                <div class="ui left icon input">
                    <i class="mail icon"></i>
                    <input ref="emailField" type="text" placeholder="Email" onkeyup="{onEdit('email')}">
                </div>
            </div>

            <div class="required field">
                <div class="ui left icon input">
                    <i class="lock icon"></i>
                    <input ref="passwordField" type="password" placeholder="Password" onkeyup="{onEdit('password')}">
                </div>
            </div>
            <div show="{!isLogin}" class="required field" id="confirmPasswordField">
                <div class="ui left icon input">
                    <i class="lock icon"></i>
                    <input ref="confirmPasswordField" type="password" placeholder="Confirm Password" onkeyup="{onEdit('confirmPassword')}">
                </div>
            </div>
            <div show="{errorMsg != ''}" class="ui error message">
                <!--<div class="header">{isLogin ? 'Login to EasyWeb' : 'Sign Up EasyWeb account'} Error</div>-->
                <p>{errorMsg}</p>
            </div>
            <div class="ui fluid button blue" onclick="{submit}">{isLogin ? 'Sign In' : 'Sign Up'}</div>
            <div show="{isLogin}" class="ui message" style="text-align: center;">
                New to us? <a href="#" onclick="{changeMode}">Sign Up</a>
            </div>
            <div show="{!isLogin}" class="ui message" style="text-align: center;">
                Already have an account? <a href="#" onclick="{changeMode}">Sign In</a>
            </div>
        </form>
    </div>

    <script>
        var me = this;

        console.log('me.api', me.api);

        console.log('check store', me.store === store);
        console.log('check api', me.api === api);
        console.log('check event', me.event === event);

        window.me = me;
        me.isRequesting = false;
        me.isLogin = true;
        me.errorMsg = '';
        me.email = '';
        me.password = '';
        me.confirmPassword = '';

        var modal = null;

        me.onEdit = function (key) {
            return function (e) {
                // enter key
                if (e.keyCode === 13) {
                    return me.submit();
                }

                me[key] = e.target.value;
            }
        };

        me.changeMode = function () {
            me.isLogin = !me.isLogin;
            me.errorMsg = '';

            me.refs.emailField.value = '';
            me.refs.passwordField.value = '';
            me.refs.confirmPasswordField.value = '';

            me.update();

            $(me.refs.emailField).focus();
        };

        me.on('mount', function () {
            modal = $(me.root).modal({
                closable:       false,
                observeChanges: true
            });
        });

        me.on('unmount', function () {
            me.hide();
        });

        me.show = function () {
            if (modal)
                modal.modal('show');
        };

        me.hide = function () {
            if(modal)
                modal.modal('hide');
        };

        me.submit = function () {
            console.log('submit');
            if (me.isLogin) {
                me.login();
            } else {
                me.register();
            }
        };

        me.login = function () {
            console.log('start login');
            me.isRequesting = true;

            try {
                validateLoginForm();
                me.api.login(me.email, me.password).then(function (resp) {
                    console.log('login success, trigger loginSuccess, result', resp);
                    me.isRequesting = false;
                    me.hide();
                    me.event.trigger('checkToken');
                }).catch(function (err) {
                    console.log('login fail', JSON.stringify(err, null, 4));
                    me.errorMsg = err.response.data.message;
                    me.isRequesting = false;
                    me.update();
                });
            } catch (ex) {
                me.errorMsg = ex.message;
                me.isRequesting = false;
            }
        };


        me.register = function () {
            console.log('REGISTER');
            me.isRequesting = true;

            try {
                validateRegisterForm();
                return me.api.register(me.email, me.password).then(function () {
                    me.event.trigger('checkToken');
                }).catch(function (err) {
                    console.log('register fail', JSON.stringify(err, null, 4));
                    me.errorMsg = err.response.data.message;
                    me.isRequesting = false;
                    me.update();
                });
            } catch (err) {
                console.log('register fail', err);
                me.errorMsg = err.message;
                me.isRequesting = false;
            }
        };

        var validateLoginForm = function () {
            if (me.email === undefined || ((me.email = me.email.trim()) === '')) {
                throw new Error('email is empty');
            }

            if (me.password === undefined || ((me.password = me.password.trim()) === '')) {
                throw new Error('password is empty');
            }
        };

        var validateRegisterForm = function () {
            validateLoginForm();
            var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            me.email = me.email.trim();
            if (me.email && !emailRegex.test(me.email))
                throw new Error('email is invalid');

            if (me.password !== me.confirmPassword) {
                throw new Error('password not match');
            }
        };
    </script>
</dialog-login-signup>
