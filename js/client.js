var username;

$(document).ready(function(){
	$('#user').on('click','#userButton',function(){
		username = $('#username').val()
		
	});
})

var user = function(){
	return username;
}

