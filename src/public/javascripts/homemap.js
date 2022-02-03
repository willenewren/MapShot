class PinNode {
  constructor(pinObject) {
    this.pinObject = pinObject;
    this.next = null;
    this.prev = null;
  }
}

class LinkedList {
  constructor(head = null) {
    this.head = head;
    this.size = 0;
  }
  push(pinObject) {
    // creates a new node
    // creates a new node
    const node = new PinNode(pinObject);

    // to store current node
    let current;

    // if list is Empty add the
    // element and make it head
    if (this.head == null) {
      this.head = node;
    } else {
      current = this.head;

      // iterate to the end of the
      // list
      while (current.next) {
        current = current.next;
      }

      // add node
      current.next = node;
      current.next.prev = current;
      console.log(current.next);
    }
    this.size++;
  }

  clear() {
    this.head = null;
  }
  getFirst() {
    return this.head;
  }
}

/**
 * Bucket List Map
 * @class
 * @constructor
 */
function HomeMap() {
  MapShotMap.call(this);

  this.pinObjects = new LinkedList;
  this.getPins();
}

HomeMap.prototype = Object.create(MapShotMap.prototype);
HomeMap.prototype.constructor = HomeMap;


/**
  *Gets pins from backend and starts process of putting them on the map
  */
HomeMap.prototype.focusNextPin = function() {
  if (this.pinObjects.size > 0) {
    if (this.currentPin && this.currentPin.next) {
      this.currentPin.pinObject.pinElement.hide();
      this.currentPin = this.currentPin.next;
    } else if (this.currentPin) {
      console.log('HERE');
      this.currentPin.pinObject.pinElement.hide();
      this.currentPin = this.pinObjects.head;
    } else {
      if (this.pinObjects) {
        this.currentPin = this.pinObjects.head;
      }
    }
    google.maps.event.trigger(this.currentPin.pinObject.marker, 'click');
  }
};

HomeMap.prototype.focusPrevPin = function() {
  if (this.pinObjects.size > 0) {
    if (this.currentPin && this.currentPin.prev) {
      this.currentPin.pinObject.pinElement.hide();
      this.currentPin = this.currentPin.prev;
      google.maps.event.trigger(this.currentPin.pinObject.marker, 'click');
    } else {
      google.maps.event.trigger(this.currentPin.pinObject.marker, 'click');
    }
  }
};

/**
  *Gets pins from backend and starts process of putting them on the map
  */
HomeMap.prototype.getPins = function() {
  const self = this;

  $.ajax({
    url: '/pin/feed',
    method: 'GET',
    success: function(pins) {
      pins.forEach(function(pin) {
        self.getPinImages(pin);
      });
    },
    error: function(err) {
    },
  });
};

/**
  *Gets pins images
  * @param pin
  */
HomeMap.prototype.getPinImages = function(pin) {
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
HomeMap.prototype.getPinTags = function(pin) {
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
  *Adds a marker, infowindow, and pinElement for each pin on home map
  *@param  pin Map from init map.
  */
HomeMap.prototype.addPinToMap = function(pin) {
  const pinElement = this.addPin(pin);
  const pinMarker = this.addMarker(pin);
  const pinInfoWindow = this.addInfoWindow(pin, pinMarker, pinElement);
  const pinElements = {
    pin: pin,
    marker: pinMarker,
    infowindow: pinInfoWindow,
    pinElement: pinElement,
  };
  console.log('PUSHED TO PINOBJECTS');
  this.pinObjects.push(pinElements);
};


/**
  *Adds a marker based on information from pin
  *@param  pin Map from init map.
  */

HomeMap.prototype.addMarker = function(pin) {
  HomeMapMarker.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function HomeMapMarker(map, latlng, imageSrc) {
    this.latlng_ = latlng;
    this.imageSrc_ = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }


  HomeMapMarker.prototype.onAdd = function() {
    // Check if the div has been created.
    let div = this.div_;
    if (!div) {
      // Create a overlay text DIV
      div = this.div_ = document.createElement('div');
      // Create the DIV representing our CustomMarker
      div.className = 'customMarker';
      div.setAttribute('style', 'cursor: pointer; color: white;');


      const imgDiv = document.createElement('div');
      let image = '/assets/images/userProfile.png';
      if (this.imageSrc_) image = this.imageSrc_;
      imgDiv.setAttribute('style',
          'background-image: url("'+ image + '")');
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
      google.maps.event.addDomListener(div, 'dblclick', function(event) {
        google.maps.event.trigger(me, 'dblclick');
      });


      // Then add the overlay to the DOM
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }
  };

  HomeMapMarker.prototype.draw = function() {
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x + 'px';
      this.div_.style.top = point.y + 'px';
    }
  };

  HomeMapMarker.prototype.onRemove = function() {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  HomeMapMarker.prototype.getPosition = function() {
    return this.latlng_;
  };
  console.log(pin);
  if (pin) {
    const marker = new HomeMapMarker(this.map, new google.maps.LatLng(pin.pin_lat, pin.pin_lng), pin.user_profilePic);
    return marker;
  }
};

/**
  *Adds an infowindow based on information from the pin
  *@param {array} pin holds information about pin
  *@param {array} marker the marker that the infowindow will be attatched to
  * @param {array} pinElement the marker that the infowindow will be attatched to
  */
HomeMap.prototype.addInfoWindow = function(pin, marker, pinElement) {
  const infowindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(25, 10),
  });

  let img = '/assets/images/userProfile.png';
  let tag = '';
  if (pin && pin.images && pin.images.length > 0) img = pin.images[0].photo_path.replace(/\\/g, '/');
  if (pin && pin.tags && pin.tags.length > 0) tag = pin.tags[0].tag_name;
  const contentString =
  '<div class="infowindow">' +
    '<div>' +
      '<h1>'+ pin.pin_title + '</h1>' +
      '<h3>' + tag + '</h3>' +
    '</div>'+

    '<div>'+
      '<div class="pin-img" style="background-image: url('+ img +');></div>'+
    '</div>' +
    '<div>'+
      '<p><b>'+ pin.user_username + ' </b>'+ pin.pin_description + '</p>' +
    '</div>'+
  '</div>';
  infowindow.setContent(contentString);

  marker.addListener('mouseover', function() {
    // infowindow.open(map, marker);
  });
  marker.addListener('mouseout', function() {
    // infowindow.close();
  });
  const self = this;
  marker.addListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo({lat: pin.pin_lat, lng: pin.pin_lng});
  });
  marker.addListener('click', function() {
    pinElement.toggle();
  });

  return infowindow;
};

/**
  *Adds custom markers to the explore map
  *@param {map} pin Map from init map.
  */
HomeMap.prototype.addPin = function(pin) {
  const self = this;
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
    const pinElementSelf = this;

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

    const bucketButton = document.createElement('button');
    bucketButton.className = 'btn pin-bucket-button';
    bucketButton.setAttribute('style', 'border-radius: 25px; color: white; background-color: #94B447;');
    bucketButton.innerHTML = '<b>Bucket it!</b>';
    google.maps.event.addDomListener(bucketButton, 'click', function(event) {
      self.bucketPin(pinElementSelf.pin_);
    });


    buttonContainer.appendChild(likeButton);
    buttonContainer.appendChild(commentButton);
    buttonContainer.appendChild(bucketButton);

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
      self.map.panBy(this.div_.offsetWidth/2, this.div_.offsetHeight/2);
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
  *Adds a infowindow to marker based on place information
  *@param {array} pin holds pin information
  *@param {array} marker for infowindow to be attatched to
  */
HomeMap.prototype.addPlaceInfoWIndow = function() {
  let img = './assets/images/userProfile.png';
  if (place.photos) img = place.photos[0].getUrl();
  const infowindow = new google.maps.InfoWindow();
  const contentString =
  '<div class="infowindow">' +
    '<div>' +
      '<h1>'+ place.name + '</h1>' +
      '<h3>'+ place.formatted_address + '</h3>' +
    '</div>'+

    '<div>'+
      '<div class="pin-img" style="background-image: url('+ img +'); "></div>'+
      '<button>Use Location for New Event';
  '</div>' +
  '</div>';
  infowindow.setContent(contentString);
  const self = this;
  marker.addListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo(place.geometry.location);
    infowindow.open(self.map, marker);
  });
};


/**
  *Adds buttons to bucketlist map
  */
HomeMap.prototype.addButtons = function() {
  MapShotMap.prototype.addButtons.call(this);

  const self = this;
  // button for seeing pervious pin
  const leftControlDiv = document.createElement('div');
  addLeftControl(leftControlDiv);
  google.maps.event.addDomListener(leftControlDiv, 'click', function(event) {
    self.focusPrevPin();
  });
  this.map.controls[google.maps.ControlPosition.LEFT_CENTER].push(leftControlDiv);

  // button for seeing next pin
  const rightControlDiv = document.createElement('div');
  addRightControl(rightControlDiv);
  google.maps.event.addDomListener(rightControlDiv, 'click', function(event) {
    self.focusNextPin();
  });
  this.map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(rightControlDiv);

  // button for adding pin
  const addPinControlDiv = document.createElement('div');
  addPinControl(addPinControlDiv);
  this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(addPinControlDiv);
};

/** @global */
let map;

/**
  *Initializes the map when the window is loaded
  */
function initMap() {
  map = new HomeMap();
}
