
/**
 * Explore Map
 * @class
 * @constructor
 */
function ExploreMap() {
  console.log('Init Explore Map');
  MapShotMap.call(this);
  console.log('Done with Mapshot constructor');
  this.initMenu();
}

ExploreMap.prototype = Object.create(MapShotMap.prototype);
ExploreMap.prototype.constructor = ExploreMap;


/**
  *Adds a marker based on pin information
  *@param {object} pin has pin information
  * @return {object} marker to go on map
  */
ExploreMap.prototype.addMarker = function(pin) {
  const pos = {
    lat: pin.pin_lat,
    lng: pin.pin_lng,
  };
  ExploreMapMarker.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function ExploreMapMarker(map, latlng, imageSrc) {
    this.latlng_ = latlng;
    this.imageSrc_ = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }


  ExploreMapMarker.prototype.onAdd = function() {
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

  ExploreMapMarker.prototype.draw = function() {
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x + 'px';
      this.div_.style.top = point.y + 'px';
    }
  };

  ExploreMapMarker.prototype.onRemove = function() {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  ExploreMapMarker.prototype.getPosition = function() {
    return this.latlng_;
  };

  const marker = new ExploreMapMarker(this.map, new google.maps.LatLng(pos.lat, pos.lng), pin.user_profilePic);
  return marker;
};

/**
  *Adds a infowindow to marker based on pin information
  *@param {object} pin holds pin information
  *@param {object} marker for infowindow to be attatched to
  */
ExploreMap.prototype.addInfoWindow = function(pin, marker) {
  const infowindow = new google.maps.InfoWindow({
    pixelOffset: new google.maps.Size(25, 10),
  });

  let img = './assets/images/userProfile.png';
  if (pin.pin_imgUrl) img = pin.pin_imgUrl;
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
  const self = this;
  marker.addListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo({lat: pin.pin_lat, lng: pin.pin_lng});
  });
};

/**
  *Adds a infowindow to marker based on place information
  *@param {object} place holds pin information
  *@param {object} marker for infowindow to be attatched to
  */
ExploreMap.prototype.addPlaceInfoWindow = function(place, marker) {
  let img = './assets/images/userProfile.png';
  if (place.photos) img = place.photos[0].getUrl();
  const infowindow = new google.maps.InfoWindow();
  const infowindowdiv = document.createElement('div');
  infowindowdiv.className = 'infowindow';

  const placeHeader = document.createElement('div');
  const placeName = document.createElement('h1');
  placeName.innerHTML = place.name;
  const placeAddress = document.createElement('h3');
  placeAddress.innerHTML = place.formatted_address;
  placeHeader.appendChild(placeName);
  placeHeader.appendChild(placeAddress);
  infowindowdiv.appendChild(placeHeader);

  const placeImages = document.createElement('div');

  const images = document.createElement('div');
  images.className = 'pin-img';
  images.setAttribute('style', 'background-image: url('+ img +')');
  const bucketButton = document.createElement('button');
  bucketButton.innerHTML = 'Bucket Location';
  bucketButton.addEventListener('click', function() {
    alert('BUCKETING ADDRESS: ' + place.formatted_address);
  });
  const pinButton = document.createElement('button');
  pinButton.innerHTML = 'Pin Location';
  pinButton.addEventListener('click', function() {
    alert('PINNING ADDRESS: ' + place.formatted_address);
  });

  placeImages.appendChild(images);
  placeImages.appendChild(bucketButton);
  placeImages.appendChild(pinButton);

  infowindowdiv.appendChild(placeImages);
  infowindow.setContent(infowindowdiv);
  const self = this;
  marker.addListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo(place.geometry.location);
    infowindow.open(self.map, marker);
  });
};

/**
  *Adds custom markers to the explore map
  *@param {map} pin Map from init map.
  */
ExploreMap.prototype.addPlacePin = function(place, marker) {
  const self = this;
  PinElement.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function PinElement(map, place) {
    this.latlng_ = place.geometry.location;
    this.place_ = place;
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

      // IMAGES
      const imageContainer = this.createImageContainer();
      if (imageContainer) div.appendChild(imageContainer);


      const buttonContainer = this.createButtonContainer();
      if (buttonContainer) div.appendChild(buttonContainer);


      // Then add the overlay to the DOM
      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
      this.div_.style.visibility = 'hidden';
    }
  };

  PinElement.prototype.createHeader = function() {
    const self = this;
    // Header


    // Header
    const headerElement = document.createElement('div');
    headerElement.className = 'pin pin-header';

    const closeButton = document.createElement('h4');
    closeButton.innerHTML = 'x';
    closeButton.style.float = 'right';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function() {
      self.hide();
    });
    headerElement.appendChild(closeButton);

    const titleElement = document.createElement('h2');
    titleElement.className = 'pin pin-title';
    titleElement.innerHTML = this.place_.name;
    headerElement.appendChild(titleElement);

    const locationElement = document.createElement('h3');
    locationElement.className = 'pin pin-location';
    locationElement.innerHTML = this.place_.formatted_address;
    headerElement.appendChild(locationElement);

    return headerElement;
  };


  PinElement.prototype.createButtonContainer = function() {
    const pinElementSelf = this;

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'pin-button';
    const bucketButton = document.createElement('button');
    bucketButton.className = 'btn pin-bucket-button';
    bucketButton.setAttribute('style', 'border-radius: 25px; color: white; background-color: #94B447;');
    bucketButton.innerHTML = '<b>Bucket it!</b>';
    google.maps.event.addDomListener(bucketButton, 'click', function(event) {
      self.bucketPlace(pinElementSelf.place_);
    });

    buttonContainer.appendChild(bucketButton);

    return buttonContainer;
  };

  PinElement.prototype.createImageContainer = function() {
    const self = this;
    if (!this.place_.photos || this.place_.photos.length == 0) return;

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'pin pin-image-carousel';
    carouselContainer.style.cursor = 'pointer';


    const photosElement = document.createElement('div');
    photosElement.setAttribute('id', 'controls' + this.place_.place_id);
    photosElement.className = 'carousel slide';
    photosElement.setAttribute('data-ride', 'carousel');


    const imageIndicators = document.createElement('ol');
    imageIndicators.className = 'carousel-indicators';
    photosElement.appendChild(imageIndicators);

    const photosContainer = document.createElement('div');
    photosContainer.className = 'carousel-inner';
    this.place_.photos.forEach((image, i) => {
      const imageContainer = document.createElement('div');
      if (i == 0) imageContainer.className = ' item carousel-item active';
      else imageContainer.className = 'item carousel-item';

      const imageElement = document.createElement('div');
      imageElement.className = 'pin-image';
      imageElement.setAttribute('style',
          'background-image: url("'+ image.getUrl() + '")');
      google.maps.event.addDomListener(imageElement, 'dblclick', function(event) {
        self.toggleImageFullscreen();
      });
      imageContainer.appendChild(imageElement);
      photosContainer.appendChild(imageContainer);

      if (self.place_.photos.length > 1) {
        const imgIndicator = document.createElement('li');
        imgIndicator.setAttribute('data-target', '#controls' + this.place_.place_id);
        imgIndicator.setAttribute('data-slide-to', i);
        if (i==0) imgIndicator.className = 'active';
        imageIndicators.appendChild(imgIndicator);
      }
    });
    photosElement.appendChild(photosContainer);

    carouselContainer.appendChild(photosElement);
    if (this.place_.photos.length > 1) {
      // CONTROLS
      const prevControl = document.createElement('a');
      prevControl.className = 'carousel-control-prev';
      prevControl.innerHTML = '<i class="fas fa-caret-left"></i>';
      prevControl.setAttribute('href', '#controls' + this.place_.place_id);
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
      nextControl.setAttribute('href', '#controls' + this.place_.place_id);
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
    console.log(carouselContainer);
    return carouselContainer;
  };


  PinElement.prototype.draw = function() {
    $('.carousel').carousel('pause');
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x + 'px';
      this.div_.style.top = point.y + 'px';
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
      self.map.panBy(.15*this.div_.offsetWidth, this.div_.offsetHeight/2);
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

  if (place) {
    const pinElement = new PinElement(this.map, place);
    this.map.addListener('zoom_changed', () => {
      if (this.map.getZoom() < 8) pinElement.hide();
    });
    pinElement.hide();
    marker.addListener('click', () => {
      pinElement.toggle();
    });
    return pinElement;
  }
};


/**
  *Initializes explore map menu
  */
ExploreMap.prototype.initMenu = function() {
  console.log('Initializing Menu');
  const searchbox = new google.maps.places.SearchBox($('#explore_textbox')[0]);
  this.map.addListener('bounds_changed', () => {
    searchbox.setBounds(this.map.getBounds());
  });

  let markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchbox.addListener('places_changed', () => {
    const places = searchbox.getPlaces();
    console.log(places);
    if (places.length == 0) {
      return;
    }
    // Clear out the old markers.
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    markers = [];
    document.getElementById('exploreImages').innerHTML = '';
    let columnCount = 0;
    let newRow;
    // For each place, get the icon, name and location.
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place, i) => {
      if (!place.geometry) {
        console.log('Returned place contains no geometry');
        return;
      }
      // ADD MARKER
      const icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25),
      };
      // Create a marker for each place
      const markerMap = this.map;
      const marker = new google.maps.Marker({
        map: markerMap,
        icon: icon,
        title: place.name,
        position: place.geometry.location,
      });
      markers.push(
          marker,
      );
      // ADD INFOWINDOW
      this.addPlacePin(place, marker);


      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }


      // ADD TO MENU
      console.log(place.photos);
      if (place.photos && place.photos.length>0) {
        place.photos.forEach((img) => {
          if (columnCount%3 == 0) {
          // add tr
            newRow = document.createElement('tr');
            const newCol = document.createElement('td');
            newCol.addEventListener('click', function() {
              google.maps.event.trigger(marker, 'click', {
                latLng: new google.maps.LatLng(0, 0),
              });
            });
            const newImg = document.createElement('img');
            newImg.className = 'table_pic';
            newImg.setAttribute('src', img.getUrl());
            newCol.appendChild(newImg);
            newRow.appendChild(newCol);
            columnCount++;
          } else if (columnCount%3 == 1) {
            const newCol = document.createElement('td');
            newCol.addEventListener('click', function() {
              google.maps.event.trigger(marker, 'click', {
                latLng: new google.maps.LatLng(0, 0),
              });
            });
            const newImg = document.createElement('img');
            newImg.className = 'table_pic';
            newImg.setAttribute('src', img.getUrl());
            newCol.appendChild(newImg);
            newRow.appendChild(newCol);
            columnCount++;
          } else {
            const newCol = document.createElement('td');
            newCol.addEventListener('click', function() {
              google.maps.event.trigger(marker, 'click', {
                latLng: new google.maps.LatLng(0, 0),
              });
            });
            const newImg = document.createElement('img');
            newImg.className = 'table_pic';
            newImg.setAttribute('src', img.getUrl());
            newCol.appendChild(newImg);
            newRow.appendChild(newCol);
            document.getElementById('exploreImages').appendChild(newRow);
            columnCount++;
          }
        });
      }
    });
    this.map.fitBounds(bounds);
  });
};
/** @global */
let map;
/**
  *Initializes the map when the window is loaded
  */
function initMap() {
  map = new ExploreMap();
}
