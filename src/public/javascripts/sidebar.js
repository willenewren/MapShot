$(document).ready(function() {
  $('#sidebarToggle').on('click', function() {
    $('.sidebar').toggleClass('active');
  });
});

$('#logoutButton').on('click', function(e) {
  e.preventDefault();
  $.ajax({
    type: 'POST',
    url: 'user/logout',
    success: function() {
      window.location.replace('/');
    },
  });
});
