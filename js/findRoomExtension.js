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
        document.getElementById("room-data").innerHTML = "The model does not contain viruses' R0 data";
        return;
      }

      // the return just has one element, clear all the highlight and selection
      // show "no search result" to the user
      if (retValue.length === 1) {
        viewer.clearThemingColors();
        viewer.clearSelection();
        document.getElementById("room-data").innerHTML = "No Search Result";
        return;
      }

      // four colors
      var red = new THREE.Vector4(1, 0, 0, 0.5);
      var yellow = new THREE.Vector4(1, 1, 0, 0.5);
      var green = new THREE.Vector4(0, 0.5, 0, 0.5);
      var blue = new THREE.Vector4(0, 0, 0.5, 0.5);

      // clear all highlights first
      viewer.clearThemingColors();

      // hide all parts
      // for (var i = 0; i < retValue[0]; i++) {
      //   viewer.hide(i);
      // }

      viewer.fitToView();

      var roomDbIds = [];
      var outputData = "";

      for (var i = 1; i < retValue.length; i++) {
        var roomDbId = retValue[i].id;
        var roomAttr = retValue[i].R0COVID19;

        // push all found rooms' roomDbId into this array, and select them all later
        roomDbIds.push(roomDbId);

        viewer.show(roomDbId);                      // show this part

        // highlight rooms with different colors based on the value of their attribute
        if (roomAttr >= 2) {
          viewer.setThemingColor(roomDbId, red);
        } else if (roomAttr >= 1.5) {
          viewer.setThemingColor(roomDbId, yellow);
        } else if (roomAttr >= 1) {
          viewer.setThemingColor(roomDbId, blue);
        } else {
          viewer.setThemingColor(roomDbId, green);
        }

        outputData += retValue[i].name + ': ' + 'R0_COVID19: ' + retValue[i].R0COVID19 + ', ' + 'R0_Influenza: ' + retValue[i].R0Influenza
        + ', ' + 'R0_Norovirus: ' + retValue[i].R0Norovirus + ', ' + 'R0_Rhinovirus: ' + retValue[i].R0Rhinovirus + '.' + '\n';
        // console.log(outputData);
      }

      document.getElementById("room-data").innerHTML = outputData;      // show the output to user
      viewer.select(roomDbIds);                                         // select all found rooms

    });
  });
  return true;
};

findRoomExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('findRoomExtension', findRoomExtension);
