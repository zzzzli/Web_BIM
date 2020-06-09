// This extension is used to search and select a room
// with name

function findRoomExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

findRoomExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
findRoomExtension.prototype.constructor = findRoomExtension;

findRoomExtension.prototype.load = function() {
  var viewer = this.viewer;

  var findRoomBtn = document.getElementById("findRoom");

  console.log("findRoomExtension loaded!");

  findRoomBtn.addEventListener('click', function() {

    var userData = ["findRoom", document.getElementById("room").value];

    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, userData);
    thePromise.then(function(retValue) {
      if (!retValue) {
        console.log("Model doesn't contain property 'R0'.");
        return;
      }

      var red = new THREE.Vector4(1, 0, 0, 0.5);

      // clear all highlights first
      viewer.clearThemingColors();

      // hide all
      // for (var i = 0; i < retValue[0]; i++) {
      //   viewer.hide(i);
      // }

      var roomDbId = retValue[1];
      var roomAttr = retValue[2];

      viewer.fitToView();
      viewer.select(roomDbId);
      viewer.show(roomDbId);
      viewer.setThemingColor(roomDbId, red);

      console.log('The R0 of this room is ' + roomAttr);
    });
  });
  return true;
};

// userFunction is in highlightExtension.js

// function userFunction(pdb, userData) {
//     var attrIdR0 = -1;
//     var attrIdName = -1;
//
//     // Iterate over all attributes and find the index to the one we are interested in
//     pdb.enumAttributes(function(i, attrDef, attrRaw){
//         var attrName = attrDef.name;
//
//         if (attrName === 'name') {
//             attrIdName = i;
//         }
//         if (attrName === 'R0') {
//             attrIdR0 = i;
//             return true; // to stop iterating over the remaining attributes.
//         }
//     });
//
//     // Early return is the model doesn't contain data for "R0".
//     if (attrIdName == -1 || attrIdR0 === -1)
//       return null;
//
//     // Now iterate over all parts to find out which one is qualified.
//     var res = [];
//     var dbIdName, roomDbId;
//     pdb.enumObjects(function(dbId){
//         // For each part, iterate over their properties.
//         pdb.enumObjectProperties(dbId, function(attrId, valId){
//             if (attrId === attrIdName) {
//                 dbIdName = pdb.getAttrValue(attrId, valId);
//                 if (dbIdName.includes(userData[0])) {
//                   console.log(dbIdName);
//                   roomDbId = dbId;
//                   return true;
//                 }
//             }
//         });
//     });
//
//     pdb.enumObjectProperties(roomDbId, function(attrId, valId){
//       if (attrId === attrIdR0) {
//           var value = pdb.getAttrValue(attrId, valId);
//           res.push(roomDbId);
//           res.push(value);
//           return true;
//       }
//     });
//
//     // Return results
//     return res;
// }

findRoomExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('findRoomExtension', findRoomExtension);
