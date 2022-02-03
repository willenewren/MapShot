/**
 * Customize Map
 * @class
 * @constructor
 */
function CustomizeMap() {
  console.log('Init Home Map');
  MapShotMap.call(this);
  this.template = [];
  console.log('Done with Mapshot constructor');
}

CustomizeMap.prototype = Object.create(MapShotMap.prototype);
CustomizeMap.prototype.constructor = CustomizeMap;

/**
  *Adds buttons to bucketlist map
  */
CustomizeMap.prototype.addButtons = function() {
  MapShotMap.prototype.addButtons.call(this);
};


MapShotMap.prototype.initAddPinUI = function() {

};


/**
  * Changes map style based on values from menu
  */
CustomizeMap.prototype.changeMapStyles = function() {
  //  get colors from selects
  this.template = mapStyles[$('#styleTemplate').val()];
  const roadLabel = $('#roadVisible').val();
  const labels = $('#labels').val();
  const landmarks = $('#landmarks').val();


  if (landmarks == 'on') {
    this.template = changeFeatureStyle(this.template,
        'administrative', 'geometry', 'visibility', 'on');
    this.template = changeFeatureStyle(this.template,
        'poi', 'all', 'visibility', 'on');
    this.template = changeFeatureStyle(this.template,
        'road', 'labels.icon', 'visibility', 'on');
    this.template = changeFeatureStyle(this.template,
        'transit', 'all', 'visibility', 'on');
  } else if (landmarks == 'simplified') {
    this.template = changeFeatureStyle(this.template,
        'administrative', 'geometry', 'visibility', 'on');
    this.template = changeFeatureStyle(this.template,
        'poi', 'all', 'visibility', 'off');
    this.template = changeFeatureStyle(this.template,
        'transit', 'all', 'visibility', 'off');
  } else {
    this.template = changeFeatureStyle(this.template,
        'administrative', 'geometry', 'visibility', 'off');
    this.template = changeFeatureStyle(this.template,
        'poi', 'all', 'visibility', 'off');
    this.template = changeFeatureStyle(this.template,
        'transit', 'all', 'visibility', 'off');
  }

  this.template = changeFeatureStyle(this.template,
      'road', null, 'visibility', roadLabel);
  this.template = changeFeatureStyle(this.template,
      null, 'labels', 'visibility', labels);

  //  set map options with new style
  this.map.setOptions({
    styles: this.template,
  });
};
/**
  * Save current style to backend
  */
CustomizeMap.prototype.saveStyle = function() {
  const self = this;
  $.ajax({
    type: 'PUT',
    url: '/user/style',
    data: {userStyle: JSON.stringify(self.template)},
    dataType: 'json',
    contentType: 'application/x-www-form-urlencoded',
    success: function(data, status) {
      window.location = '/profile';
    },
  });
};

CustomizeMap.prototype.addStyles = function() {
  this.setMapStyle([]);
};
/** @global */
let map;

/**
  *Initializes the map when the window is loaded
  */
function initMap() {
  map = new CustomizeMap();
}

/**
  * Changes map styles, called by htmlelements
  */
function changeMapStyles() {
  map.changeMapStyles();
}
/**
  * saves map style, called by htmlelements
  */
function saveStyle() {
  map.saveStyle();
}


/**
  * Changes any given google style template to add or change a given style
  * @param {json} template - Map style template
  * @param {String} featureType - Map feature being edited
  * @param {String} elementType - Map element being edited
  * @param {String} attr - the style attribute being edited
  * @param {String} val - the value of the style attr
  * @return {json} Edited template
  */
function changeFeatureStyle(template, featureType, elementType, attr, val) {
  let elementExists = false;
  let propertyExists = false;
  template.forEach(function(element) {
    // if the feature and element is in the template
    if (featureType == element.featureType &&
        elementType == element.elementType) {
      elementExists = true;
      element.stylers.forEach(function(style) {
        propertyExists = true;
        if (style.hasOwnProperty(attr)) {
          style[attr] = val;
        }
      });
      if (!propertyExists) {
        const newStyle = {};
        newStyle[attr] = val;
        element.stylers.push(newStyle);
      }
    }
  });
  if (!elementExists) {
    // if the element is not in the tempalte
    const newElement = {
      'stylers': [
        {},
      ],
    };
    newElement.stylers[0][attr] = val;
    if (featureType) {
      newElement['featureType'] = featureType;
    }
    if (elementType) {
      newElement['elementType'] = elementType;
    }
    template.push(newElement);
  }
  return template;
}
