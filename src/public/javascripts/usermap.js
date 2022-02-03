
/**
 * User Map
 * @class
 * @constructor
 */
function UserMap() {
  console.log('Init Home Map');
  MapShotMap.call(this);
  this.pinObjects = [];
  this.getPins();
  this.getTags();
  console.log('Done with Mapshot constructor');
}

UserMap.prototype = Object.create(MapShotMap.prototype);
UserMap.prototype.constructor = UserMap;

/**
  *Gets pins from backend and starts process of putting them on the map
  */
UserMap.prototype.getPins = function() {
  const self = this;
  $.ajax({
    url: '/pin/user',
    method: 'GET',
    success: function(pins) {
      pins.forEach(function(pin) {
        self.getPinImages(pin);
      });
    },
  });
};
/**
  *Gets pins images
  * @param pin
  */
UserMap.prototype.getPinImages = function(pin) {
  // to be removed
  const self = this;
  $.ajax({
    url: '/pin/images/?pinId=' + pin.pin_id,
    type: 'GET',
    contentType: 'application/json',
    success: function(images) {
      pin.images = images;
      self.getPinTags(pin);
    },
  });
};

/**
  *Gets pins tags
  * @param pin
  */
UserMap.prototype.getPinTags = function(pin) {
  // to be removed
  const self = this;
  $.ajax({
    url: '/pin/tags/?pinId=' + pin.pin_id,
    type: 'GET',
    contentType: 'application/json',
    success: function(tags) {
      pin.tags = tags;
      self.addPinToMap(pin);
    },
  });
};

/**
  *Gets pins
  */
UserMap.prototype.getTags = function() {
  const self = this;
  $.ajax({
    url: '/user/tags',
    method: 'GET',
    success: function(tags) {
      console.log(tags);
      self.addTagstoMenu(tags);
    },
  });
};

/**
  *Gets pins tags
  * @param tags
  */
UserMap.prototype.addTagstoMenu = function(tags) {
  const self = this;
  const tagContainer = $('#tags')[0];
  const allTagRow = document.createElement('tr');

  const allTagContainer = document.createElement('td');

  const allTag = document.createElement('span');
  allTag.className = 'tag';
  allTag.innerHTML = 'All';
  allTagContainer.appendChild(allTag);
  allTagRow.appendChild(allTagContainer);
  allTagContainer.addEventListener('click', function() {
    self.filterEventsByTag({tag_name: 'All'});
    const tagElements = document.querySelectorAll('.tag');
    tagElements.forEach((item) => {
      item.style.backgroundColor = '#94B447';
    });
    allTag.style.backgroundColor = '#3B5284';
  });

  tagContainer.appendChild(allTagRow);
  tags.forEach((tag, i) => {
    console.log(tag);
    if (i%2 == 1) return;

    const tagRow = document.createElement('tr');


    const firstTagContainer = document.createElement('td');
    const firstTag = document.createElement('span');
    firstTag.className = 'tag';
    firstTag.innerHTML = tag.tag_name;
    firstTagContainer.appendChild(firstTag);
    firstTagContainer.addEventListener('click', function() {
      self.filterEventsByTag(tag);
      const tagElements = document.querySelectorAll('.tag');
      tagElements.forEach((item) => {
        item.style.backgroundColor = '#94B447';
      });
      firstTag.style.backgroundColor = '#3B5284';
    });
    tagRow.appendChild(firstTagContainer);


    if (tags[i+1]) {
      const secondTagContainer = document.createElement('td');
      const secondTag = document.createElement('span');
      secondTag.className = 'tag';
      secondTag.innerHTML = tags[i + 1].tag_name;
      secondTagContainer.appendChild(secondTag);
      secondTagContainer.addEventListener('click', function() {
        self.filterEventsByTag(tags[i + 1]);
        const tagElements = document.querySelectorAll('.tag');
        tagElements.forEach((item) => {
          item.style.backgroundColor = '#94B447';
        });
        secondTag.style.backgroundColor = '#3B5284';
      });
      tagRow.appendChild(secondTagContainer);
    }


    tagContainer.appendChild(tagRow);
  });
};

/**
  *Gets pins tags
  * @param tag
  */
UserMap.prototype.filterEventsByTag = function(tag) {
  console.log(tag);
  const self = this;
  const bounds = new google.maps.LatLngBounds();
  this.pinObjects.forEach((pinObject) => {
    let hasTag = false;
    pinObject.pin.tags.forEach((t) => {
      console.log(tag.tag_name == 'All');
      if (t.tag_name == tag.tag_name || tag.tag_name == 'All') {
        hasTag = true;
      }
    });
    if (hasTag) {
      pinObject.marker.setMap(self.map);
      bounds.extend(pinObject.marker.latlng_);
    } else pinObject.marker.setMap(null);
  });
  this.map.fitBounds(bounds);
};


/**
  *Adds a marker and infowindow for each pin on explore map
  *@param {array} pin Map from init map.
  */
UserMap.prototype.addPinToMap = function(pin) {
  const self = this;
  const pinElement = this.addPin(pin);
  const pinMarker = this.addMarker(pin);
  pinMarker.addListener('click', () => {
    self.map.setZoom(17);
    self.map.panTo({lat: pin.pin_lat, lng: pin.pin_lng});
    pinElement.toggle();
  }); ;
  // const pinInfoWindow = this.addInfoWindow(pin, pinMarker);

  const pinElements = {
    pin: pin,
    marker: pinMarker,
  };
  this.pinObjects.push(pinElements);
};


/**
  *Adds custom markers to the explore map
  *@param {map} pin Map from init map.
  */
UserMap.prototype.addPin = function(pin) {
  const self = this;
  console.log(pin);
  PinElement.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function PinElement(map, pin) {
    this.latlng_ = new google.maps.LatLng(pin.pin_lat, pin.pin_lng);
    this.pin_ = pin;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }


  PinElement.prototype.onAdd = function() {
    // Check if the div has been created.
    let div = this.div_;
    if (!div) {
      // CONTAINER
      div = this.div_ = document.createElement('div');
      div.className = 'pin pin-container';


      const headerElement = this.createHeader();
      if (headerElement) div.appendChild(headerElement);

      // TAGS
      const tagContainer = this.createTagContainer();
      if (tagContainer) div.appendChild(tagContainer);

      // IMAGES
      const imageContainer = this.createImageContainer();
      if (imageContainer) div.appendChild(imageContainer);

      // descriptions
      const likeCommentContainer = this.createLikeCommentContainer();
      if (likeCommentContainer) div.appendChild(likeCommentContainer);

      // descriptions
      const descriptionContainer = this.createDescriptionContainer();
      if (descriptionContainer) div.appendChild(descriptionContainer);

      const buttonContainer = this.createButtonContainer();
      if (buttonContainer) div.appendChild(buttonContainer);


      // Then add the overlay to the DOM
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
      this.div_.style.visibility = 'hidden';
    }
  };

  PinElement.prototype.createHeader = function() {
    // Header
    const headerElement = document.createElement('div');
    headerElement.className = 'pin pin-header';

    const settingsElement = document.createElement('span');
    settingsElement.className = 'settings-element';
    settingsElement.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    headerElement.appendChild(settingsElement);
    console.log(settingsElement);

    const titleElement = document.createElement('h2');
    titleElement.className = 'pin pin-title';
    titleElement.innerHTML = this.pin_.pin_title;
    headerElement.appendChild(titleElement);

    const locationElement = document.createElement('h3');
    locationElement.className = 'pin pin-location';
    locationElement.innerHTML = this.pin_.pin_locationName;
    headerElement.appendChild(locationElement);


    return headerElement;
  };

  PinElement.prototype.createTagContainer = function() {
    // Header
    const tagContainer = document.createElement('div');
    tagContainer.className = 'pin pin-tag';
    this.pin_.tags.forEach((tag) => {
      const tagElement = document.createElement('h4');
      tagElement.className = 'pin';
      tagElement.innerHTML = tag.tag_name;
      tagElement.setAttribute('style', 'cursor: pointer; color: white;');
      google.maps.event.addDomListener(tagElement, 'click', function(event) {
        console.log('tag:' + tag);
      });
      tagContainer.appendChild(tagElement);
    });

    return tagContainer;
  };

  PinElement.prototype.createLikeCommentContainer = function() {
    // Header
    const likeCommentContainer = document.createElement('div');
    likeCommentContainer.className = 'pin-like-comment';

    const likeText = document.createElement('a');
    likeText.innerHTML = '48 Likes';
    likeText.setAttribute('style', 'cursor: pointer');


    const commentText = document.createElement('a');
    commentText.innerHTML = '8 Comments';
    commentText.setAttribute('style', 'cursor: pointer');

    likeCommentContainer.appendChild(likeText);
    likeCommentContainer.appendChild(commentText);

    return likeCommentContainer;
  };

  PinElement.prototype.createDescriptionContainer = function() {
    // Header
    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'pin pin-description-container';

    const descriptionElement = document.createElement('p');
    descriptionElement.className = 'pin';
    descriptionElement.innerHTML = '<a href="/profile"><b>@' + this.pin_.user_username + '</b></a> '+ this.pin_.pin_description;
    descriptionElement.setAttribute('style', 'color: black');
    descriptionContainer.appendChild(descriptionElement);

    return descriptionContainer;
  };

  PinElement.prototype.createButtonContainer = function() {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'pin-button';

    const likeButton = document.createElement('a');
    likeButton.innerHTML = '<i class="fas fa-heart"></i>';
    likeButton.style.cursor = 'pointer';
    likeButton.setAttribute('style', 'color: #a83f39; cursor: pointer');
    google.maps.event.addDomListener(likeButton, 'click', function(event) {
      // like pin
    });

    const commentButton = document.createElement('a');
    commentButton.innerHTML = '<i class="fas fa-comment"></i>';
    commentButton.style.cursor = 'pointer';
    commentButton.setAttribute('style', 'color: #3B5284; cursor: pointer');
    google.maps.event.addDomListener(commentButton, 'click', function(event) {

      // comment on pin
    });


    buttonContainer.appendChild(likeButton);
    buttonContainer.appendChild(commentButton);

    return buttonContainer;
  };

  PinElement.prototype.createImageContainer = function() {
    const self = this;
    if (this.pin_.images.length == 0) return;

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'pin pin-image-carousel';
    carouselContainer.style.cursor = 'pointer';


    const photosElement = document.createElement('div');
    photosElement.setAttribute('id', 'controls' + this.pin_.pin_id);
    photosElement.className = 'carousel slide';
    photosElement.setAttribute('data-ride', 'carousel');


    const imageIndicators = document.createElement('ol');
    imageIndicators.className = 'carousel-indicators';
    photosElement.appendChild(imageIndicators);

    const photosContainer = document.createElement('div');
    photosContainer.className = 'carousel-inner';
    this.pin_.images.forEach((image, i) => {
      const imageContainer = document.createElement('div');
      if (i == 0) imageContainer.className = ' item carousel-item active';
      else imageContainer.className = 'item carousel-item';

      const imageElement = document.createElement('div');
      imageElement.className = 'pin-image';
      imageElement.setAttribute('style',
          'background-image: url("'+ image.photo_path.replace(/\\/g, '/') + '")');
      google.maps.event.addDomListener(imageElement, 'dblclick', function(event) {
        self.toggleImageFullscreen();
      });
      imageContainer.appendChild(imageElement);
      photosContainer.appendChild(imageContainer);

      if (self.pin_.images.length > 1) {
        const imgIndicator = document.createElement('li');
        imgIndicator.setAttribute('data-target', '#controls' + this.pin_.pin_id);
        imgIndicator.setAttribute('data-slide-to', i);
        if (i==0) imgIndicator.className = 'active';
        imageIndicators.appendChild(imgIndicator);
      }
    });
    photosElement.appendChild(photosContainer);

    carouselContainer.appendChild(photosElement);
    if (this.pin_.images.length > 1) {
      // CONTROLS
      const prevControl = document.createElement('a');
      prevControl.className = 'carousel-control-prev';
      prevControl.innerHTML = '<i class="fas fa-caret-left"></i>';
      prevControl.setAttribute('href', '#controls' + this.pin_.pin_id);
      prevControl.setAttribute('role', 'button');
      prevControl.setAttribute('data-slide', 'prev');

      const prevIcon = document.createElement('span');
      prevIcon.className = 'carousel-control-prev-icon';

      const prevText = document.createElement('span');
      prevText.className = 'sr-only';
      prevText.innerHtml = 'Previous';

      prevControl.appendChild(prevIcon);
      prevControl.appendChild(prevText);

      const nextControl = document.createElement('a');
      nextControl.className = 'carousel-control-next';
      nextControl.innerHTML = '<i class="fas fa-caret-right"></i>';
      nextControl.setAttribute('href', '#controls' + this.pin_.pin_id);
      nextControl.setAttribute('role', 'button');
      nextControl.setAttribute('data-slide', 'next');

      const nextIcon = document.createElement('span');
      nextIcon.className = 'carousel-control-next-icon';

      const nextText = document.createElement('span');
      nextText.className = 'sr-only';
      nextText.innerHtml = 'Next';

      nextControl.appendChild(nextIcon);
      nextControl.appendChild(nextText);

      carouselContainer.appendChild(prevControl);
      carouselContainer.appendChild(nextControl);
    }

    return carouselContainer;
  };


  PinElement.prototype.draw = function() {
    $('.carousel').carousel('pause');
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x - 15 + 'px';
      this.div_.style.top = point.y - 15 + 'px';
    }
  };

  // Set the visibility to 'hidden' or 'visible'.
  PinElement.prototype.hide = function() {
    if (this.div_) {
      // The visibility property must be a string enclosed in quotes.
      this.div_.style.visibility = 'hidden';
    }
  };

  PinElement.prototype.show = function() {
    if (this.div_) {
      this.div_.style.visibility = 'visible';
      console.log(this.div_.offsetHeight/2);
      self.map.panBy(-25, .45*this.div_.offsetHeight);
    }
  };

  PinElement.prototype.toggle = function() {
    if (this.div_) {
      if (this.div_.style.visibility === 'hidden') {
        this.show();
      } else {
        this.hide();
      }
    }
  };


  // Set the visibility to 'hidden' or 'visible'.
  PinElement.prototype.enterImageFullscreen = function() {
    if (this.div_) {
    // The visibility property must be a string enclosed in quotes.
      this.div_.classList.add('fullscreen');
      this.map.panBy(250, this.div_.offsetHeight/12);
    }
  };

  PinElement.prototype.exitImageFullscreen = function() {
    if (this.div_) {
      this.div_.classList.remove('fullscreen');
      this.map.panBy(-250, -this.div_.offsetHeight/7.9);
    }
  };
  PinElement.prototype.toggleImageFullscreen = function() {
    if (this.div_) {
      if (this.div_.classList.contains('fullscreen')) {
        this.exitImageFullscreen();
      } else {
        this.enterImageFullscreen();
      }
    }
  };

  PinElement.prototype.onRemove = function() {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  PinElement.prototype.getPosition = function() {
    return this.latlng_;
  };

  if (pin) {
    const pinElement = new PinElement(this.map, pin);
    this.map.addListener('zoom_changed', () => {
      if (this.map.getZoom() < 8) pinElement.hide();
    });
    pinElement.hide();
    return pinElement;
  }
};


/**
  *Adds a marker based on information from pin
  *@param {object} pin Map from init map.
  * @return {object} marker for map
  */
UserMap.prototype.addMarker = function(pin) {
  const pos = {
    lat: pin.pin_lat,
    lng: pin.pin_lng,
  };
  UserMapMarker.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function UserMapMarker(map, latlng, imageSrc) {
    this.latlng_ = latlng;
    this.imageSrc_ = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }


  UserMapMarker.prototype.onAdd = function() {
    // Check if the div has been created.
    let div = this.div_;
    if (!div) {
      // Create a overlay text DIV
      div = this.div_ = document.createElement('div');
      // Create the DIV representing our CustomMarker
      div.className = 'customMarker';


      const imgDiv = document.createElement('div');
      imgDiv.setAttribute('style',
          'background-image: url("'+ this.imageSrc_+ '")');
      imgDiv.className = 'customMarkerImage';
      const maxColors = 3;
      const color = Math.floor(Math.random()*maxColors);
      if (color == 0) imgDiv.style.border = 'solid #94B447';
      if (color == 1) imgDiv.style.border = 'solid #3B5284';
      if (color == 2) imgDiv.style.border = 'solid #5BA8A0';
      div.appendChild(imgDiv);
      const me = this;
      google.maps.event.addDomListener(div, 'mouseover', function(event) {
        google.maps.event.trigger(me, 'mouseover');
      });
      google.maps.event.addDomListener(div, 'mouseout', function(event) {
        google.maps.event.trigger(me, 'mouseout');
      });
      google.maps.event.addDomListener(div, 'click', function(event) {
        google.maps.event.trigger(me, 'click');
      });

      // Then add the overlay to the DOM
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }
  };

  UserMapMarker.prototype.draw = function() {
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x + 'px';
      this.div_.style.top = point.y + 'px';
    }
  };

  UserMapMarker.prototype.onRemove = function() {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  UserMapMarker.prototype.getPosition = function() {
    return this.latlng_;
  };
  let img = './assets/images/userProfile.png';
  if (pin.user_profilePic) img = pin.user_profilePic;

  const marker = new UserMapMarker(this.map, new google.maps.LatLng(pos.lat, pos.lng), img);
  return marker;
};

/**
  *Adds an infowindow based on information from the pin
  *@param {array} pin holds information about pin
  *@param {array} marker the marker that the infowindow will be attatched to
  */
UserMap.prototype.addInfoWindow = function(pin, marker) {
  console.log(pin);
  const infowindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(25, 10),
  });
  const self = this;
  $.ajax({
    url: '/pin/images/?pinId=' + pin.pin_id,
    type: 'GET',
    contentType: 'application/json',
    success: function(images) {
      let img = '/assets/images/userProfile.png';
      if (images.length > 0) img = images[0].photo_path.replace(/\\/g, '/');
      const contentString =
      '<div class="infowindow">' +
        '<div>' +
          '<h1>'+ pin.pin_title + '</h1>' +
        '</div>'+

        '<div>'+
          '<div class="pin-img" style="background-image: url('+ img +'); "></div>'+
        '</div>' +
        '<div>'+
          '<p><b>'+ pin.user_username + ' </b>'+ pin.pin_description + '</p>' +
        '</div>'+
      '</div>';
      infowindow.setContent(contentString);

      marker.addListener('mouseover', function() {
        infowindow.open(map, marker);
      });
      marker.addListener('mouseout', function() {
        infowindow.close();
      });
      marker.addListener('click', function() {
        self.map.setZoom(17);
        self.map.panTo({lat: pin.pin_lat, lng: pin.pin_lng});
      });
    },
  });
  return infowindow;
};


/**
  *Initializes profile menu
  */
UserMap.prototype.initMenu = function() {
  $.get('/user/info', function( user ) {
    let img = './assets/images/userProfile.png';
    if (user.user_profilePic) img = user.user_profilePic;
    $('#profilePicture').css('background-image', 'url(' + img + ')');
    $('#username').html('@' + user.user_username);
    $('#user').html(user.user_name);
    if (user.user_bio) $('#profile_TextBox').html(user.user_bio);
    else $('#profile_TextBox').css('display', 'none');
  });
};


/** @global */
let map;

/**
  *Initializes the map when the window is loaded
  */
function initMap() {
  map = new UserMap();
}


function openSettings() {
  console.log('HERE');
  document.getElementById('myDropdown').classList.toggle('show');
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  console.log('REMOVING');
  console.log(e.target);
  if (!e.target.matches('.dropbtn, .fas')) {
    const myDropdown = document.getElementById('myDropdown');
    if (myDropdown.classList.contains('show')) {
      myDropdown.classList.remove('show');
    }
  }
};
