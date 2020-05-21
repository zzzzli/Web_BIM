function ToolbarExtension(viewer, options) {
  Autodesk.Viewing.Extension.call(this, viewer, options);
}

ToolbarExtension.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
ToolbarExtension.prototype.constructor = ToolbarExtension;

ToolbarExtension.prototype.load = function() {
  if (this.viewer.toolbar) {
    this.createUI();
  } else {
    this.onToolbarCreatedBinded = this.onToolbarCreated.bind(this);
    this.viewer.addEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  }

  return true;
};

ToolbarExtension.prototype.onToolbarCreated = function() {
  this.viewer.removeEventListener(Autodesk.Viewing.TOOLBAR_CREATED_EVENT, this.onToolbarCreatedBinded);
  this.onToolbarCreatedBinded = null;
  this.createUI();
}

ToolbarExtension.prototype.createUI = function() {

  viewer = this.viewer;

  var button1 = new Autodesk.Viewing.UI.Button('show-env-bg-button');
  button1.onClick = function(e) {

    var attr = document.getElementById("attr").value;
    var thres = parseInt(document.getElementById("threshold").value);
    // console.log(attr);
    // console.log(thres);
    // console.log(typeof(attr));
    // console.log(typeof(thres));
    var userData = [attr, thres];

    var thePromise = viewer.model.getPropertyDb().executeUserFunction(userFunction, userData);
    thePromise.then(function(retValue){
      if (!retValue) {
        console.log("Model doesn't contain property 'R0'.");
        return;
      }

      var red = new THREE.Vector4(1, 0, 0, 0.5);
      var green = new THREE.Vector4(0, 0.5, 0, 0.5);
      var blue = new THREE.Vector4(0, 0, 0.5, 0.5);
      
      viewer.clearThemingColors();

      for (var i = 0; i < retValue.length; i++) {
        var R0Id = retValue[i].id;
        var roomName = retValue[i].name;

        // viewer.select(R0Id);
        // viewer.toggleVisibility(R0Id);
        // viewer.fitToView(R0Id);
        viewer.setThemingColor(R0Id, red);

        console.log('The room with R0 larger than 30 is ' + roomName + '(dbId: ' + R0Id + ')' + ' with R0:', retValue[i].R0);
      }
    });
  }
  button1.addClass('show-env-bg-button');
  button1.setToolTip('Show R0');

  // Button 2
  // var button2 = new Autodesk.Viewing.UI.Button('hide-env-bg-button');
  // button2.onClick = function(e) {
  //     viewer.setEnvMapBackground(false);
  //     viewer.impl.visibilityManager.show(0);
  //     var blue = new THREE.Vector4(0, 0, 0.5, 0.5);
  //     viewer.setThemingColor(0, blue);
  // };
  // button2.addClass('hide-env-bg-button');
  // button2.setToolTip('Hide Environment');

  // SubToolbar
  this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
  this.subToolbar.addControl(button1);
  // this.subToolbar.addControl(button2);

  viewer.toolbar.addControl(this.subToolbar);
};

function userFunction(pdb, userData) {
    var attrIdR0 = -1;
    var attrIdName = -1;

    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function(i, attrDef, attrRaw){
        var attrName = attrDef.name;

        // Print all ids and names of all the attributes
        // console.log(i);
        // console.log(attrName);
        // console.log(document.getElementById("attr").value);
        // console.log(document.getElementById("threshold").value);
        if (attrName === 'name') {
            attrIdName = i;
        }
        if (attrName === userData[0]) {
            attrIdR0 = i;
            return true; // to stop iterating over the remaining attributes.
        }
    });

    // Early return is the model doesn't contain data for "R0".
    if (attrIdName == -1 || attrIdR0 === -1)
      return null;

    // Now iterate over all parts to find out which one is qualified.
    var res = [];
    var dbName;
    pdb.enumObjects(function(dbId){
        // if (dbId == 10075) {
        // For each part, iterate over their properties.
        pdb.enumObjectProperties(dbId, function(attrId, valId){
            // if (attrId > 0) {
            //   var test = pdb.getAttrValue(attrId, valId);
            //   console.log(attrId + " " + test);
            // }

            if (attrId === attrIdName) {
                dbName = pdb.getAttrValue(attrId, valId);
            }
            // Only process 'name' and 'R0' property.
            // The word "Property" and "Attribute" are used interchangeably.
            if (attrId === attrIdR0) {
                var value = pdb.getAttrValue(attrId, valId);
                // R0 larger than 30
                if (value > userData[1]) {
                    res.push({
                      id: dbId,
                      name: dbName,
                      R0: value
                    });
                }
                // Stop iterating over additional properties when "R0" is found.
                return true;
            }
        });
      // }
    });

    // Return results
    return res;
}

// function userFunction1(pdb) {
//   var res = [];
//   pdb.enumObjects(function(dbId){
//     res.push(dbId);
//   });
//   return res;
// }

ToolbarExtension.prototype.unload = function() {
  // nothing yet
  this.viewer.toolbar.removeControl(this.subToolbar);
  return true;
};

Autodesk.Viewing.theExtensionManager.registerExtension('ToolbarExtension', ToolbarExtension);
