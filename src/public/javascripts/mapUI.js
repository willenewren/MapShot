/**
 * Adds left control to map
* @param {html} controlDiv Map from init map.
 * @param {map} map Map from init map.
 */
function addLeftControl(controlDiv) {
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'leftControl';
  controlUI.style.width = '50px';
  controlUI.style.backgroundColor = 'none';
  controlUI.style.borderRadius = '3px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.margin = '30px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to see previous pin';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = 'white';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '100px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<i class="fas fa-caret-left"></i>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    // Previous Event
  });
}
/**
 * Adds right control to map
* @param {html} controlDiv Map from init map.
 * @param {map} map Map from init map.
 */
function addRightControl(controlDiv, map) {
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'rightControl';
  controlUI.style.width = '50px';
  controlUI.style.backgroundColor = 'none';
  controlUI.style.borderRadius = '3px';
  controlUI.style.cursor = 'pointer';
  controlUI.style.margin = '30px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to see next pin';
  controlDiv.appendChild(controlUI);
  // Set CSS for the control interior.
  const controlText = document.createElement('div');
  controlText.style.color = 'white';
  controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
  controlText.style.fontSize = '100px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  controlText.innerHTML = '<i class="fas fa-caret-right"></i>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    // next event
  });
}
/**
 * Adds add pin control to map
* @param {html} controlDiv Map from init map.
 * @param {map} map Map from init map.
 */
function addPinControl(controlDiv) {
  // Set CSS for the control border.
  const controlUI = document.createElement('div');
  controlUI.id = 'rightControl';
  controlUI.style.width = '75px';
  controlUI.style.height = '75px';
  controlUI.style.backgroundColor = '#fff';
  controlUI.style.border = '2px solid #fff';
  controlUI.style.borderRadius = '100%';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.margin = '30px';
  controlUI.style.textAlign = 'center';
  controlUI.title = 'Click to add a pin';
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
  controlText.innerHTML = '<i class="fas fa-map-pin"></i>';
  controlUI.appendChild(controlText);

  controlUI.addEventListener('click', () => {
    $('#overlay-back').fadeIn(500);
    $('#addNewPinContainer').slideDown(500);
  });
}
