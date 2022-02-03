$(function() {
  expandMenu();
  retractActivity();
});


function retractMenu() {
  $('.dynamic-sidebar').css('margin-left', '-25%');
  $('.dynamic-sidebar').css('margin-right', '0');
  $('.menu-toggle').html('<i class="fas fa-caret-right"></i>');
  if ($('#sidebar_activity')) {
    retractActivity();
  }
}

function expandMenu() {
  $('.dynamic-sidebar').css('margin-left', '0');
  $('.dynamic-sidebar').css('margin-right', '-30%');
  $('.menu-toggle').html('<i class="fas fa-caret-left"></i>');
}

function toggleMenu() {
  const menu = $('.dynamic-sidebar');
  if (menu.hasClass( 'active' )) {
    menu.removeClass('active');
    expandMenu();
  } else {
    menu.addClass('active');
    retractMenu();
    retractActivity();
  }
}

function toggleActivity() {
  const menu = $('#sidebar_activity');
  if (menu.hasClass( 'active' )) {
    expandActivity();
  } else {
    retractActivity();
  }
}

function retractActivity() {
  $('#sidebar_activity').css('margin-left', '-30%');
  $('#sidebar_activity').css('margin-right', '0');
  $('#sidebar_activity').addClass('active');
}

function expandActivity() {
  $('#sidebar_activity').css('margin-left', '30%');
  $('#sidebar_activity').css('margin-right', '-60%');
  $('.activity-toggle').html('<i class="fas fa-caret-left"></i>');
  $('#sidebar_activity').removeClass('active');
}
