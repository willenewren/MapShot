
/**
 * MapShot Map Base Class
 * @class
 * @constructor
 */

function MapShotMap() {
  console.log('Init MapShot Map');
  const mapProp = {
    center: new google.maps.LatLng(44.9727, -93.23540000000003),
    zoom: 3,
    gestureHandling: 'greedy',
    minZoom: 2,
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    clickableIcons: false,
    mapTypeControl: true,
    fullscreenControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    backgroundColor: '#3B5284',
  };
  this.map = new google.maps.Map(document.getElementById('map'), mapProp);
  google.maps.event.clearListeners(this.map, 'dblclick');
  this.addButtons();
  this.addStyles();
  this.initMenu();
  this.initAddPinUI();
}


/**
  * initializes form to add new events
  */
MapShotMap.prototype.initAddPinUI = function() {
  const self = this;
  $('#addNewPinContainer').slideUp(500);

  //  closes new pin window when you click the x
  $('#closeAddPin').on('click', () => {
    self.closeAddPin();
  });

  //  closes new pin window when you click the x
  $('#imagePreview').on('click', () => {
    $('#imageInput')[0].click();
  });
  const searchbox = new google.maps.places.SearchBox($('#location_searchbox')[0]);
  $('#submitButton').click(async function(e) {
    e.preventDefault();
    const formData = new FormData($('#newPinForm')[0]);
    const validatedForm = self.validateForm(formData, searchbox);
    console.log(validatedForm);
    if (validatedForm) {
      const newPin = await self.postPin(validatedForm);
      console.log(newPin);
      self.map.setZoom(17);
      self.map.panTo({lat: parseFloat(newPin.lat), lng: parseFloat(newPin.lng)});
      self.getPins();
    }
  });
  const inpFile = $('input[name=images]');
  const previewImg = $('.image-preview-img');
  const previewText = $('.image-preview-text');
  inpFile[0].addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      previewText[0].style.display = 'none';
      previewImg[0].style.display = 'block';

      reader.addEventListener('load', function() {
        previewImg[0].setAttribute('src', this.result);
      });

      reader.readAsDataURL(file);
    } else {
      previewText[0].style.display = 'block';
      previewImg[0].style.display = 'none';
    }
  });
};


MapShotMap.prototype.postPin = function(form) {
  const self = this;
  return new Promise((resolve, reject) => {
    $.ajax({
      type: 'POST',
      url: '/pin',
      data: form,
      processData: false,
      contentType: false,
      success: function(result) {
        self.closeAddPin();
        resolve(result);
      },
    });
  });
};


MapShotMap.prototype.bucketPin = function(pin) {
  const data = {
    lat: pin.pin_lat,
    lng: pin.pin_lng,
    location: pin.pin_locationName,
  };
  console.log(data);
  $.ajax({
    type: 'POST',
    url: '/bucket',
    data: data,
    success: function(result) {
      const notificationBubble = document.createElement('span');
      notificationBubble.className = 'notification-bubble';
      notificationBubble.innerHTML = '<i class="fas fa-circle"></i>';
      $('#bucketListLink')[0].appendChild(notificationBubble);
    },
    error: function(err) {
      console.log(err);
    },
  });
};

MapShotMap.prototype.bucketPlace = function(place) {
  const data = {
    lat: place.geometry.location.lat(),
    lng: place.geometry.location.lng(),
    location: place.name,
  };
  console.log(data);
  $.ajax({
    beforeSend: function(xhrObj) {
      xhrObj.setRequestHeader('Content-Type', 'application/json');
      xhrObj.setRequestHeader('Accept', 'application/json');
    },
    type: 'POST',
    url: '/bucket',
    data: JSON.stringify(data),
    success: function(result) {
      console.log(result);
      const notificationBubble = document.createElement('span');
      notificationBubble.className = 'notification-bubble';
      notificationBubble.innerHTML = '<i class="fas fa-circle"></i>';
      $('#bucketListLink')[0].appendChild(notificationBubble);
    },
    error: function(err) {
      console.log(err.responseJSON.msg);
    },
  });
};

MapShotMap.prototype.likePin = function(pin) {

};

MapShotMap.prototype.pinLocation = function(locationName, lat, lng) {

};


MapShotMap.prototype.validateForm = function(formData, searchbox) {
  const places = searchbox.getPlaces();
  console.log(searchbox);
  let pos;
  if (places && places[0] && places[0].geometry) {
    pos = {
      lat: places[0].geometry.location.lat(),
      lng: places[0].geometry.location.lng(),
    };
  } else if (places) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode( {'address': places.formatted_address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        pos = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
      } else {
        // address doesnt Exists
        alert('ADDRESS DOESNT EXIST');
        return;
      }
    });
  } else {
    // invalid location, input not entered
    alert('PLEASE INPUT VALID LOCATION');
    return;
  }

  if (pos) {
    formData.append('lat', pos.lat);
    formData.append('lng', pos.lng);
    return formData;
  }
};


MapShotMap.prototype.closeAddPin = function() {
  $('#addNewPinContainer').slideUp(500);
  $('#overlay-back').fadeOut(500);
  $('#newPinForm').trigger('reset');
  $('.image-preview-text')[0].style.display = 'block';
  $('.image-preview-img')[0].style.display = 'none';
  $('.image-preview-img')[0].setAttribute('src', '');
};

MapShotMap.prototype.openAddPin = function() {
  $('#addNewPinContainer').slideUp(500);
  $('#overlay-back').fadeOut(500);
  $('#newPinForm').trigger('reset');
  $('.image-preview-text')[0].style.display = 'block';
  $('.image-preview-img')[0].style.display = 'none';
  $('.image-preview-img')[0].setAttribute('src', '');
};


/**
  *Adds buttons to bucketlist map
  */
MapShotMap.prototype.addButtons = function() {
  console.log('Adding Buttons');
  const titleDiv = document.createElement('div');
  this.addTitle(titleDiv);
  this.map.controls[google.maps.ControlPosition.TOP_CENTER].push(titleDiv);
  // button for adding pin
  const zoomOutControlDiv = document.createElement('div');
  this.addZoomOut(zoomOutControlDiv);
  this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(zoomOutControlDiv);
  // button for adding pin
  const zoomInControlDiv = document.createElement('div');
  this.addZoomIn(zoomInControlDiv);
  this.map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(zoomInControlDiv);


  if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    const sidebarToggleControlDiv = document.createElement('div');
    this.addSidebarToggle(sidebarToggleControlDiv);
    this.map.controls[google.maps.ControlPosition.LEFT_TOP].push(sidebarToggleControlDiv);
    this.map.fullscreenControl = false;
    this.map.mapTypeControl = false;
  }
  return;
};
/**
  *Gets style from backend and applies it to map
  */
/**
  *Gets style from backend and applies it to map
  */
MapShotMap.prototype.addStyles = function() {
  console.log('Adding styles');
  const self = this;
  $.get('/user/style', function(mapStyle, status) {
    const style = JSON.parse('[' + mapStyle.mapStyle_template + ']');
    self.setMapStyle(style[0]);
  });
};

/**
  *Intitialize base menu
  */
MapShotMap.prototype.initMenu = function() {
  return;
};

/**
  *set map style based array of objects
  * @param {array} mapStyle Map from init map.
  */
MapShotMap.prototype.setMapStyle = function(mapStyle) {
  this.map.setOptions({
    styles: mapStyle,
  });
};

/**
  *Adds title
  * @param {html} controlDiv Map from init map.
  *@param {map} map Map from init map.
  */
MapShotMap.prototype.addTitle = function(controlDiv) {
  console.log('Adding Title');
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'title';
  controlUI.classList.add('map');
  controlUI.style.width = '100%';
  controlUI.style.height = '100px';
  controlUI.style.backgroundColor = 'none';
  controlUI.style.textShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'MapShot';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = '#fff';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<h1>MapShot</h1>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    // add event
  });

  return;
};

/**
  *Adds zoom control
  * @param {html} controlDiv Map from init map.
  *@param {map} map Map from init map.
  */
MapShotMap.prototype.addZoomIn = function(controlDiv) {
  console.log('Adding zoom');
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'zoomControl';
  controlUI.class = 'map';
  controlUI.style.width = '75px';
  controlUI.style.height = '75px';
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '100%';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginBottom = '15px';
  controlUI.style.marginLeft = '30px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to zoom out';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '30px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.style.paddingTop = '16px';
  controlText.innerHTML = '<i class="fa fa-search-plus" aria-hidden="true"></i>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    this.map.setZoom(this.map.getZoom() + 1);
  });

  return;
};

/**
  *Adds zoom control
  * @param {html} controlDiv Map from init map.
  *@param {map} map Map from init map.
  */
MapShotMap.prototype.addZoomOut = function(controlDiv) {
  console.log('Adding zoom');
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'zoomControl';
  controlUI.class = 'map';
  controlUI.style.width = '75px';
  controlUI.style.height = '75px';
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '100%';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.marginLeft = '30px';
  controlUI.style.marginBottom = '15px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to zoom out';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '30px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.style.paddingTop = '16px';
  controlText.innerHTML = '<i class="fa fa-search-minus" aria-hidden="true"></i>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    this.map.setZoom(this.map.getZoom() - 4);
  });

  return;
};
/**
  *Adds sidebar toggle for mobile
  * @param {html} controlDiv Map from init map.
  *@param {map} map Map from init map.
  */
MapShotMap.prototype.addSidebarToggle = function(controlDiv) {
  console.log('Adding Sidebar Toggle');
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.margin = '30px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to recenter the map';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = 'rgb(25,25,25)';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '16px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<i class="fas fa-bars"></i>';
  controlUI.appendChild(controlText);
  // Setup the click event listeners: simply set the map to Chicago.
  controlUI.addEventListener('click', () => {
    $('#sidebar').toggleClass('active');
  });
  return;
};
