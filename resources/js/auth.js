function main() {
    $('.authWrapper').slideDown(500)
    $('#authBtn').on('click', function(){
        $('#loader').css('display', 'inline-block')
        $('#authBtn').hide()
        console.log('AuthBtn')
        var url = '/'+type
        var username = $('[name=username]').val()
        var password = $('[name=password]').val()
        if(username.length===0) {
            $('[name=username]').css('border-color','red')
            if(password.length===0) {
                $('[name=password]').css('border-color','red')
                $('[name=cnfpassword]').css('border-color','red')
            }
            $('#loader').hide()
            $('#authBtn').show();
            return;
        }
        if(password.length===0) {
            $('[name=password]').css('border-color','red')
            $('[name=cnfpassword]').css('border-color','red')
            $('#loader').hide()
            $('#authBtn').show();
            return;
        }
        if(type=='signup') {
            console.log('Sign up')
            if(password.length<8) {
                $('#authPanel h1').text('Too short!')
                $('#authPanel .subtitle').text('Password should have a minimum of 8 characters')
                $('#loader').hide()
                $('#authBtn').show();
                return;
            }
            $('#authPanel h1').text('Hah, you!')
            $('#authPanel .subtitle').text('Signing you up')
            var cnfpassword = $('[name=cnfpassword]').val()
            if(password !== cnfpassword) {
                $('#authPanel h1').text('Passwords Mismatch')
                $('#authPanel .subtitle').text('Try retyping without typos')
                $('#loader').hide()
                $('#authBtn').show();
            }
            else {
                console.log('Before request')
                var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if(request.readyState === XMLHttpRequest.DONE) {
                        console.log("Response")
                        $('#loader').hide()
                        $('#authBtn').show();
                        $('#authPanel h1').text(JSON.parse(request.responseText).message)
                        $('#authPanel .subtitle').text(JSON.parse(request.responseText).subtext)
                        if(request.status === 200) {
                            console.log("200")
                            $('#authBtn').hide();
                            $('#check').show();
                            setTimeout(function(){
                                window.location = baseURL + '/login'
                            }, 2000)
                        }
                    }
                }
                request.open('POST', url, true);
                request.setRequestHeader('Content-Type','application/json');
                request.send(JSON.stringify({username: username, password: password}));
            }
        }
        else {
            console.log("Login")
            $('#authPanel h1').text('Hah, you!')
            $('#authPanel .subtitle').text('Recollecting who you are')
            var request = new XMLHttpRequest();
                request.onreadystatechange = function() {
                    if(request.readyState === XMLHttpRequest.DONE) {
                        console.log("Response")
                        $('#loader').hide()
                        $('#authBtn').show();
                        $('#authPanel h1').text(JSON.parse(request.responseText).message)
                        $('#authPanel .subtitle').text(JSON.parse(request.responseText).subtext)
                        if(request.status === 200) {
                            console.log("200")
                            $('#authBtn').hide();
                            $('#check').show();
                            setTimeout(function(){
                                window.location = baseURL + '/'
                            }, 1000)
                        }
                    }
                }
                request.open('POST', url, true);
                request.setRequestHeader('Content-Type','application/json');
                request.send(JSON.stringify({username: username, password: password}));
        }
    })
}
$(document).ready(main)