var tapgage_click_url = '';
var tapgage_fire = 0;

function tapgage_init() {
	if (tapgage_interval < 0) {
		tapgage_interval = 0;
	}
	if (0 == tapgage_interval) {
		tapgage_load_popup_ads();
	} else {
		tapgage_timer();
	}
}

function tapgage_after_click_popup(is_error, url) {
	if (is_error == 1) {
		/* There is an error. Error message is passed on url var */
		jQuery('#id_tapgage_popup').html('There is an error : '+url);
	} else {
		/* redirect to URL */
		if (0 == tapgage_new_tab) {
			document.location = url;
		} else {
			window.open(url, '_blank');
			window.focus();
		}
	}
}

function tapgage_click_json(tapgage_json) {
	/* alert(JSON.stringify(tapgage_json)); */
	if (tapgage_json.is_error == 1) {
		tapgage_after_click_popup(1, tapgage_json.message);
	} else {
		tapgage_after_click_popup(0, tapgage_json.message);
	}
}

function tapgage_click_popup() {
	post_data = 'client_js=1';
	jQuery.ajax({
		url: tapgage_last_click_url(),
		data : post_data,
		cache: false,
		type: 'POST',
		dataType: 'jsonp',
		jsonpCallback: 'tapgage_click_json',
		success: function(tapgage_json) {
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
			if (!textStatus) {
				tapgage_error = textStatus;
			} else if (!errorThrown) {
				tapgage_error = errorThrown;
			} else {
				tapgage_error = 'There is an error.';
			}
			tapgage_after_click_popup(1, tapgage_error);
		}
	});
}

function tapgage_close_popup() {
	jQuery.fancybox.close(true);
}

function tapgage_display_popup(icon, title, error_message, height, width) {
  console.log('displaying popup');
	if (1 == tapgage_fire) {
		return false;
	}
	test_string = '';
	if (0 == height) {
		height = 250;
	}
	if (0 == width) {
		width = 250;
	}

	if (error_message != '') {/* There is an error */ 
    console.log('is error: ' + error_message);
		test_string = '<div style="padding:1em 0.5em">'+error_message+'</div>';
	} else {
		if ('' == icon) {
			test_string += 'Please try again';
		} else {
			//if (tapgage_new_tab == 1) {
			//	test_string += ' target="_blank"';
			//}
			height_ratio = 1;
			width_ratio = 1;
			use_ratio = 1;
			if (tapgage_viewportheight != window.screen.height) {
				height_ratio = (tapgage_viewportheight / window.screen.height).toFixed(2);
			}
			if (tapgage_viewportwidth != window.screen.width) {
				width_ratio = (tapgage_viewportwidth / window.screen.width).toFixed(2);
			}
			if (height_ratio > width_ratio) {
				use_ratio = height_ratio;
			} else {
				use_ratio = width_ratio;
			}
			height = Math.ceil(height * use_ratio);
			width = Math.ceil(width * use_ratio);
			test_string += '<img onclick="tapgage_click_popup()" alt="'+title+'" title="'+title+'" src="'+icon+'" border="0" width="'+width+'" height="'+height+'" style="cursor:pointer" />';
			//test_string += 'width = '+width+', height = '+height+' <img onclick="tapgage_click_popup()" alt="'+title+'" title="'+title+'" src="'+icon+'" border="0" style="cursor:pointer" />';
		}
	}
	jQuery('#id_tapgage_popup').html(test_string);
	jQuery('#id_tapgage_popup_link').trigger('click');
	tapgage_fire = 1;
}

function tapgage_display_popup_json(tapgage_json) {
  console.log(tapgage_json);
	if (1 == tapgage_fire) {
		return false;
	}
	/* alert(JSON.stringify(tapgage_json)); */
	if (tapgage_json.is_error == 1) {
    console.log('error');
		if (tapgage_json.message.indexOf('skip') < 0) {
			 tapgage_display_popup('', '', tapgage_json.message, 0, 0); 
		}
	} else {
		tapgage_click_url = tapgage_json.offer_data[0].x_click_url;
		tapgage_display_popup(tapgage_json.offer_data[0].x_app_icon, tapgage_json.offer_data[0].title, tapgage_json.message, tapgage_json.offer_data[0].height, tapgage_json.offer_data[0].width);
	}
}

function tapgage_last_click_url() {
	return tapgage_click_url;
}

function tapgage_load_popup_ads() {
  console.log('loading popup ads');
	if (!tapgage_app_id) {
		tapgage_error = 'App ID is empty';
		return 1;
	}
  console.log('setting post data');
	post_data = 'app_id='+tapgage_app_id+'&sdk_version='+tapgage_sdk_version+'&screen_width='+tapgage_viewportwidth+'&screen_height='+tapgage_viewportheight+'&screen_width_2='+window.screen.width+'&screen_height_2='+window.screen.height+'&position=manual&client_js=1';
	jQuery.ajax({
		url: tapgage_server + 'index.php/c_mobile_library_json/get_banner/?callback=tapgage_display_popup_json',
		data : post_data,
		cache: false,
		type: 'POST',
		dataType: 'jsonp',
		jsonpCallback: 'tapgage_display_popup_json',
		success: function(tapgage_json) {
      console.log('success');
		},
		error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log('dsad');
      console.log('text status: ' + textStatus);
      console.log('text error: ' + errorThrown);

			if (!textStatus) {
				tapgage_error = textStatus;
			} else if (!errorThrown) {
				tapgage_error = errorThrown;
			} else {
				tapgage_error = 'There is a HTTP error.';
			}
			tapgage_display_popup('', '', tapgage_error, 0, 0);
		}
	});
}

function tapgage_timer() {
	if (0 == tapgage_interval) {
		tapgage_load_popup_ads();
	} else {
		tapgage_interval--;
		window.setTimeout("tapgage_timer();", 1000);
	}
}

jQuery(document).ready(function() {
	jQuery('body').scrollTop(1);
	jQuery('.tapgage_popup_link').fancybox({
		modal: false,
		autoSize: true,
		autoCenter: true,
		centerOnScroll: true,
		padding:0,
		titleShow: false,
		margin:0,
		helpers:  {
			overlay : {
				closeClick: false
			}
		}
	});
	tapgage_init();
});

window.addEventListener("load",function() {
  // Set a timeout...
  setTimeout(function(){
    // Hide the address bar!
    window.scrollTo(0, 1);
  }, 0);
});
