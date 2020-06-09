// Content for 'my-awesome-extension.js'

function selectiveExplodeExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

selectiveExplodeExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
selectiveExplodeExtension.prototype.constructor = selectiveExplodeExtension;

selectiveExplodeExtension.prototype.load = function() {
  var viewer = this.viewer;

  var excludedFragIds = [
    6, 14, 18, 22, 24, 33, 35, 49, 53,
    63, 65, 67, 68, 69, 74, 79, 80, 81, 82
  ]

  selectiveExplode(viewer, 0.5, excludedFragIds, viewer.model);

  viewer.impl.sceneUpdated(true);

  return true;
};

selectiveExplodeExtension.prototype.unload = function() {
  alert('selectiveExplodeExtension is now unloaded!');
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('selectiveExplodeExtension', selectiveExplodeExtension);
