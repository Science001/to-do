function update() {
    console.log('Dayum')

    var x; var checked;
    if($(this).hasClass('done')) {
        $(this).removeClass('done')
        $(this).addClass('fire')
        x = done.splice(done.indexOf($(this).text()), 1)
        open.push($(this).text())
        checked=false;
    }
    else {
        $(this).addClass('done')
        x = open.splice(open.indexOf($(this).text()), 1)
        done.unshift($(this).text())
        checked=true;
    }


    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState === XMLHttpRequest.DONE) {
            if(request.status === 200) {
                if(checked){
                    $('.doneWrapper').prepend($("<p class=\"todo done\"></p>").html("<i class=\"fas fa-check grey\"></i>"+x+"<span><i id=\"deleteDone\" class=\"fas fa-trash\"></i></span>"))
                    $('.openWrapper .todo').remove(".done")
                }
                else{
                    $('.openWrapper').append($("<p class=\"todo\"></p>").html("<i class=\"far fa-square\"></i>"+x))
                    $('.doneWrapper .todo').remove(".fire")
                }
            }
        }
    }
    request.open('POST','/update', false);
    request.setRequestHeader('Content-Type','application/json');
    request.send(JSON.stringify({open: open, done: done}));
}

function main() {
    $('.doneWrapper').on('click', '#deleteDone', function(e){
        $(this).hide()
        var p = $(this).parent().parent()
        p.css('background-color','red')
        p.addClass('fire')
        done.splice(done.indexOf(p.text()), 1)

        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if(request.readyState === XMLHttpRequest.DONE) {
                if(request.status === 200) {
                    $('.doneWrapper .todo').remove(".fire")
                    e.stopImmediatePropagation()
                }
            }
        }
        request.open('POST','/update', false);
        request.setRequestHeader('Content-Type','application/json');
        request.send(JSON.stringify({open: open, done: done}));
    })
    $('#logout').hover(function(){
        $(this).text("Log out")
    }, function(){
        $(this).text(username)
    })
    $('#mainPanel').on('click', '.todo', update)
    $('#addTodo').on('keyup', function(e){
        var toAdd = $(this).val()
        if(e.keyCode==13 && toAdd) {
            open.push(toAdd)
            $(this).val("")
            
            var request = new XMLHttpRequest();
            request.onreadystatechange = function() {
                if(request.readyState === XMLHttpRequest.DONE) {
                    if(request.status === 200) {
                        $('.openWrapper').append($("<p class=\"todo\"></p>").html("<i class=\"far fa-square\"></i>"+toAdd))
                    }
                }
            }
            request.open('POST','/update', false);
            request.setRequestHeader('Content-Type','application/json');
            request.send(JSON.stringify({open: open, done: done}));
        }
    })
    $(".openWrapper").on({
        mouseenter: function() {
            $(this).children('i').removeClass()
            $(this).children('i').addClass("fas fa-check green")
        },
        mouseleave: function() {
            $(this).children('i').removeClass()
            $(this).children('i').addClass("far fa-square")
        }
    }, '.todo')
    $(".doneWrapper").on({
        mouseenter: function() {
            $(this).children('i').removeClass()
            $(this).children('i').addClass("fas fa-arrow-up orange")
            $(this).find("#deleteDone").show()
        },
        mouseleave: function() {
            $(this).children('i').removeClass()
            $(this).children('i').addClass("fas fa-check grey")
            $(this).find("#deleteDone").hide()
        }
    }, '.todo')
}

$(document).ready(main)