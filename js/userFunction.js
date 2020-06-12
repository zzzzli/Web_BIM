// Author: Zhouyang Li
// Date 6/9/2020
// Description: userFunction gets into the PropertyDatabase of
// the model and do some stuff. this function is used by both highlight
// extension and find room extension

function userFunction(pdb, userData) {
  var attrIdR0 = -1;                      // the attr id of R0 attribute
  var attrIdR0COVID19 = -1;               // the attr id of R0 attribute
  var attrIdR0Influenza = -1;             // the attr id of R0 attribute
  var attrIdR0Norovirus = -1;             // the attr id of R0 attribute
  var attrIdR0Rhinovirus = -1;            // the attr id of R0 attribute
  var attrIdName = -1;                    // the attr id of name attribute
  var res = [];                           // return array

  // the first element of return array is the number of objects in the model
  res.push(pdb.getObjectCount());

  // the first element of userData is used to specify we want to highlight
  // rooms or find room

  // the first element of userData is "highlight"

  if (userData[0] == "highlight") {
    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function(i, attrDef, attrRaw) {

      // name of the attribute
      var attrName = attrDef.name;

      // find the attr id with name "name"
      if (attrName === 'name') {
        attrIdName = i;
      }

      // find the attr id with name "userData[1]"
      if (attrName === userData[1]) {
        attrIdR0 = i;
        return true;      // to stop iterating over the remaining attributes.
      }
    });

    // Early return is the model doesn't contain data for "R0".
    if (attrIdName === -1 || attrIdR0 === -1) {
      return null;
    }


    // Now iterate over all parts to find out thoes qualified.
    var dbIdName;
    pdb.enumObjects(function(dbId) {

      // For each part, iterate over their properties.
      // The word "Property" and "Attribute" are used interchangeably.
      pdb.enumObjectProperties(dbId, function(attrId, valId) {

        // Only process 'name' and 'R0' property.
        if (attrId === attrIdName) {
          dbIdName = pdb.getAttrValue(attrId, valId);
        }

        if (attrId === attrIdR0) {
          var value = pdb.getAttrValue(attrId, valId);

          // value larger than threshold, put the id, name, attribute value of
          // the part into return array
          if (value >= userData[2] && value < userData[3]) {
            res.push({
              id: dbId,
              name: dbIdName,
              R0: value
            });
          }

          // Stop iterating over additional properties when "R0" is found.
          return true;
        }
      });
    });
  }

  // the first element of userData is "findRoom"

  else {
    // Iterate over all attributes and find the index to the one we are interested in
    pdb.enumAttributes(function(i, attrDef, attrRaw) {
      var attrName = attrDef.name;

      // find the attr id with name "name"
      if (attrName === 'name') {
        attrIdName = i;
      }

      // find the attr id with name "R0_COVID19"
      if (attrName === 'R0_COVID19') {
        attrIdR0COVID19 = i;
      }

      // find the attr id with name "R0_Influenza"
      if (attrName === 'R0_Influenza') {
        attrIdR0Influenza = i;
      }

      // find the attr id with name "R0_Norovirus"
      if (attrName === 'R0_Norovirus') {
        attrIdR0Norovirus = i;
      }

      // find the attr id with name "R0_Rhinovirus"
      if (attrName === 'R0_Rhinovirus') {
        attrIdR0Rhinovirus = i;
      }
    });

    // Early return is the model doesn't contain data for "R0".
    if (attrIdName === -1 || attrIdR0COVID19 === -1 || attrIdR0Influenza === -1 || attrIdR0Norovirus === -1 || attrIdR0Rhinovirus === -1)
      return null;

    // Now iterate over all parts to find out which one is qualified.
    var dbIdName, roomDbId = [];
    pdb.enumObjects(function(dbId) {

      // For each part, iterate over their properties.
      pdb.enumObjectProperties(dbId, function(attrId, valId) {

        // find parts with name containing user's input
        if (attrId === attrIdName) {
          dbIdName = pdb.getAttrValue(attrId, valId);

          // remove contents in "[]"
          var squareBracketIndex = dbIdName.indexOf("[");
          if (squareBracketIndex != -1) dbIdName = dbIdName.substring(0, squareBracketIndex);

          // to lower case
          var lowerCaseDbIdName = dbIdName.toLowerCase();

          // if the part's name includes user's input
          if (lowerCaseDbIdName.includes(userData[1].toLowerCase())) {
            // console.log(dbIdName);
            roomDbId.push({id: dbId, name: dbIdName});
            return true;
          }
        }
      });
    });

    // For the found parts, iterate over their properties. If the part has
    // R0 attribute, push it into return array
    for (var i = 0; i < roomDbId.length; i++) {

      // initial R0 of four viruses
      var R0COVID19 = -1;
      var R0Influenza = -1;
      var R0Norovirus = -1;
      var R0Rhinovirus = -1;

      pdb.enumObjectProperties(roomDbId[i].id, function(attrId, valId) {

        // get the R0 of four viruses
        if (attrId === attrIdR0COVID19) {
          R0COVID19 = pdb.getAttrValue(attrId, valId);
        } else if (attrId === attrIdR0Influenza) {
          R0Influenza = pdb.getAttrValue(attrId, valId);
        } else if (attrId === attrIdR0Norovirus) {
          R0Norovirus = pdb.getAttrValue(attrId, valId);
        } else if (attrId === attrIdR0Rhinovirus) {
          R0Rhinovirus = pdb.getAttrValue(attrId, valId);
        } else {}

      });

      // if all the R0 of viruses are found, push into the result array
      if (R0COVID19 !== -1 && R0Influenza !== -1 && R0Norovirus !== -1 && R0Rhinovirus !== -1) {
        res.push({
          id: roomDbId[i].id,
          name: roomDbId[i].name,
          R0COVID19: R0COVID19,
          R0Influenza: R0Influenza,
          R0Norovirus: R0Norovirus,
          R0Rhinovirus: R0Rhinovirus
        });
      }
    }
  }

  // Return results
  return res;
}
