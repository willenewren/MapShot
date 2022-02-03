// add google maps script to html page
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelectorAll('#map').length > 0) {
    if (document.querySelector('html').lang) {
      lang = document.querySelector('html').lang;
    } else {
      lang = 'en';
    }

    const js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?key=XXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places&callback=initMap&language=' + lang;
    js_file.setAttribute('async', '');
    js_file.setAttribute('defer', '');
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});
