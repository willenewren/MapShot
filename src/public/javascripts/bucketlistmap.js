
/**
 * Bucket List Map
 * @class
 * @constructor
 */
function BucketListMap() {
  console.log('Init Home Map');
  MapShotMap.call(this);
  this.initMenu();
  this.getBuckets();
  this.bucketObjects = [];
  console.log('Done with Mapshot constructor');
}

BucketListMap.prototype = Object.create(MapShotMap.prototype);
BucketListMap.prototype.constructor = BucketListMap;

/**
  *Gets pins from backend and starts process of putting them on the map
  */
BucketListMap.prototype.getBuckets = function() {
  if (this.bucketObjects && this.bucketObjects.length > 0) {
    this.bucketObjects.forEach((object) => {
      object.marker.setMap(null);
    });
  }
  const self = this;
  $.ajax({
    url: '/bucket',
    method: 'GET',
    success: function(buckets) {
      if (buckets && buckets.length > 0) {
        document.getElementById('bucketList').innerHTML = '';
        buckets.forEach(function(bucket) {
          const marker = self.addBuckettoMap(bucket);
          const bucketlistCheck = self.addBuckettoMenu(bucket, marker);
          self.bucketObjects.push({marker, bucketlistCheck, bucket});
        });
      } else {
        document.getElementById('bucketList').innerHTML = 'No Buckets :(';
      }
    },
    error: function(err) {
    },
  });
};

/**
  *Initializes explore map menu
  * @param bucket the bucket
  * @param marker marker associated with bucket
  */
BucketListMap.prototype.addBuckettoMenu = function(bucket, marker) {
  console.log(bucket);
  const bucketlistContainer = document.createElement('div');
  const bucketlistCheck = document.createElement('input');
  bucketlistCheck.setAttribute('type', 'checkbox');
  bucketlistCheck.className = 'bucket-checkbox';
  bucketlistCheck.addEventListener('change', function() {
    document.getElementById('bucketlistButton').disabled = $('input.bucket-checkbox:checked').length == 0;
  });

  const bucketItem = document.createElement('span');
  bucketItem.innerHTML = bucket.bucket_location;


  bucketlistContainer.appendChild(bucketlistCheck);
  bucketlistContainer.appendChild(bucketItem);

  $('#bucketList')[0].appendChild(bucketlistContainer);
  const self = this;
  bucketItem.addEventListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo(marker.position);
  });

  return bucketlistCheck;
};
/**
  *Adds a marker and infowindow for each pin on explore map
  *@param {array} bucket Map from init map.
  * @return marker that was put on the map
  */
BucketListMap.prototype.addBuckettoMap = function(bucket) {
  const self = this;
  marker = new google.maps.Marker({
    map: self.map,
    position: {lat: bucket.bucket_lat, lng: bucket.bucket_lng},
  });
  marker.addListener('click', function() {
    self.map.setZoom(17);
    self.map.panTo(marker.position);
  });
  return marker;
};

/**
  *Adds a marker based on information from pin
  *@param {object} pin Map from init map.
  *@return {object} marker to go on map
  */
BucketListMap.prototype.addMarker = function(pin) {
  const pos = {
    lat: pin.pin_lat,
    lng: pin.pin_lng,
  };
  BucketListMapMarker.prototype = new google.maps.OverlayView();
  /**
    *Adds custom markers to the explore map
    *@param {map} map Map from init map.
    *@param {object} latlng a lat lng object
    *@param {object} imageSrc image used for marker
    */
  function BucketListMapMarker(map, latlng, imageSrc) {
    this.latlng_ = latlng;
    this.imageSrc_ = imageSrc;
    // Once the LatLng and text are set, add the overlay to the map.  This will
    // trigger a call to panes_changed which should in turn call draw.
    this.setMap(map);
  }


  BucketListMapMarker.prototype.onAdd = function() {
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

  BucketListMapMarker.prototype.draw = function() {
    // Position the overlay
    const point = this.getProjection().fromLatLngToDivPixel(this.latlng_);
    if (point) {
      this.div_.style.left = point.x + 'px';
      this.div_.style.top = point.y + 'px';
    }
  };

  BucketListMapMarker.prototype.onRemove = function() {
    // Check if the overlay was on the map and needs to be removed.
    if (this.div_) {
      this.div_.parentNode.removeChild(this.div_);
      this.div_ = null;
    }
  };

  BucketListMapMarker.prototype.getPosition = function() {
    return this.latlng_;
  };

  const marker = new BucketListMapMarker(this.map, new google.maps.LatLng(pos.lat, pos.lng), pin.user_profilePic);
  return marker;
};

/**
  *Adds an infowindow based on information from the pin
  *@param {array} pin holds information about pin
  *@param {array} marker the marker that the infowindow will be attatched to
  */
BucketListMap.prototype.addInfoWindow = function(pin, marker) {
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
  *Initializes explore map menu
  */
BucketListMap.prototype.initMenu = function() {
  const self = this;
  $('#bucketlistButton')[0].addEventListener('click', async function() {
    self.map.setZoom();
    await Promise.all(self.bucketObjects.map(async (object) => {
      if (object.bucketlistCheck.checked) {
        await self.deleteBucket(object.bucket.bucket_id);
      }
    }));
    self.getBuckets();
    document.getElementById('bucketlistButton').disabled = true;
  });
};

BucketListMap.prototype.deleteBucket = function(bucketId) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: '/bucket/' + bucketId,
      type: 'DELETE',
      success: function(result) {
        resolve(result);
      },
    });
  });
};

/** @global */
let map;

/**
  *Initializes the map when the window is loaded
  */
function initMap() {
  map = new BucketListMap();
}
