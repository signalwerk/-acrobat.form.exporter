// ----------------------------------------------------------
// definition of prefs
// ----------------------------------------------------------

var prefs = {
  // Fieldname: Text_alignment.right_textColor.black_1000
  grepTxtField: /Text_.*/i, // Name Pattern for all Formnames
  grepIDField: /Text_([0-9]+)/i, // 1. group gets the ID
  grepAlignField: /Text_(.*)alignment\.(right|left|center)(.*)/i, // 2. group gets the alignment
  grepStyleField: /Text_(.*)textStyle\.(normal|bold)(.*)/i, // 2. group gets the styling
  grepTextColorField: /Text_(.*)textColor\.(black|white|red)(.*)/i // 2. group gets the textColor
};

// console.println("prefs: " + prefs);

// ----------------------------------------------------------
// JSON
// ----------------------------------------------------------
// https://raw.github.com/douglascrockford/JSON-js/master/json2.js

// ----------------------------------------------------------
// create a deep copy
// ----------------------------------------------------------

function clone(obj) {
  if (obj === null || typeof obj != "object") {
    return obj;
  }

  var temp = obj.constructor(); // changed

  for (var key in obj) {
    temp[key] = clone(obj[key]);
  }
  return temp;
}

// ----------------------------------------------------------
// Check if array-items are unique
// http://stackoverflow.com/questions/1564700/fastest-way-to-detect-if-duplicate-entry-exists-in-javascript-array
// ----------------------------------------------------------
function hasDuplicate(arr) {
  var i = arr.length,
    j,
    val;

  while (i--) {
    val = arr[i];
    j = i;
    while (j--) {
      if (arr[j] === val) {
        return true;
      }
    }
  }
  return false;
}

// ----------------------------------------------------------
// set colors in a form
// ----------------------------------------------------------
function colorForm(fieldName) {
  // Get a Text field
  var oFld = this.getField(fieldName);
  // oFld.richText = true;     // Set Rich text
  // oFld.multiline = true;    // Set Multiline
  var rgSpez = /\([^\)]*\)/i; // match all values in parentheses

  // Custom format event for a rich text field.
  var spans = oFld.richValue;
  var newSpans = [];

  for (var i = 0; i < spans.length; i++) {
    // split by text and newline
    var texts = spans[i].text.split(/(?=[ \n])/);

    for (var ti = 0; ti < texts.length; ti++) {
      newSpans.push(clone(spans[i])); // same format as original

      newSpans[newSpans.length - 1].text = texts[ti]; // but new text

      if (rgSpez.test(texts[ti])) {
        newSpans[newSpans.length - 1].textColor = color.red;
      } else {
        newSpans[newSpans.length - 1].textColor = color.black;
      }
    }
  }
  oFld.richValue = newSpans;
}

// ----------------------------------------------------------
// set colors in a form
// ----------------------------------------------------------
function colorAllForm() {
  for (var fieldNumber = 0; fieldNumber < numFields; fieldNumber++) {
    if (prefs.grepTxtField.test(getNthFieldName(fieldNumber))) {
      colorForm(getNthFieldName(fieldNumber));
    }
  }
}

// ----------------------------------------------------------
// return the format obj of a given Form-Name
// ----------------------------------------------------------
function getFormFormat(fieldName) {
  // Get a Text field
  var oFld = this.getField(fieldName);
  var spans = oFld.richValue;

  return spans; // JSON.stringify(spans);
}

// ----------------------------------------------------------
// export all form fields by a given grep-pattern
// ----------------------------------------------------------
function exportForm() {
  var exportObj = {};
  exportObj.comment = "Export of Form-Data. ";
  exportObj.version = 1.0;
  exportObj.fields = [];

  for (var fieldNumber = 0; fieldNumber < numFields; fieldNumber++) {
    if (prefs.grepTxtField.test(getNthFieldName(fieldNumber))) {
      var FieldExport = {};
      FieldExport.name = getNthFieldName(fieldNumber);
      FieldExport.value = getFormFormat(FieldExport.name);
      exportObj.fields.push(FieldExport);
    }
  }

  return JSON.stringify(exportObj);
}

// ----------------------------------------------------------
// import the json and set the values to the field
// ----------------------------------------------------------
function importForm(strJSON) {
  var importObj = JSON.parse(strJSON);

  if (importObj.version === 1.0) {
    for (var i = 0; i < importObj.fields.length; i++) {
      // Get a Text field
      var oFld = this.getField(importObj.fields[i].name);
      if (oFld) {
        if (oFld.richText !== true) {
          oFld.richText = true;
        }

        if (oFld.multiline !== false) {
          oFld.multiline = false;
        }

        if (oFld.doNotScroll !== true) {
          oFld.doNotScroll = true;
        }

        if (oFld.doNotSpellCheck !== true) {
          oFld.doNotSpellCheck = true;
        }

        oFld.richValue = importObj.fields[i].value;
      }
    }
  } else {
    app.alert(
      "Diese Version des Formulars ist mit ihren Daten nicht kompatibel. Import wurde abgebrochen.",
      1
    );
  }
}

// ----------------------------------------------------------
// Dialog for Import
// ----------------------------------------------------------
function importGet() {
  // Code for adding Signature field not shown
  // In example document...
  /*
	var cRtn = app.response ({
		cQuestion:"Bitte hier die Daten einfügen",
		cTitle:"Daten import",
		bPassword: false,
		cDefault: "",
		cLabel:"Daten"
	});
	*/

  var cRtn = this.getField("copyBoard").value;
  if (cRtn && cRtn.length) {
    // start import if text is entered
    importForm(cRtn);
    this.getField("copyBoard").value = "Import abgeschlossen";
  } else {
    app.alert("Import wurde abgebrochen.");
  }
}

// ----------------------------------------------------------
// Dialog for Export
// ----------------------------------------------------------
function exportGet() {
  // Code for adding Signature field not shown
  // In example document...

  this.getField("copyBoard").value = exportForm();
  app.alert("Der Export wurde in das Daten-Feld geschrieben.");

  /*
	var cRtn = app.response ({
		cQuestion:"Bitte diese Daten kopieren",
		cTitle:"Daten export",
		bPassword: false,
		cDefault: exportForm(),
		cLabel:"Daten"
	});
	*/
}

// ----------------------------------------------------------
// Generate formfields for export
// ----------------------------------------------------------
function formGenerate() {
  if (checkID()) {
    app.alert(
      "Achtung! Feldnamen sind nicht eindeutig. Formular wurde nicht korrekt erzeugt."
    );
  }

  var convertCount = 0;

  for (var fieldNumber = 0; fieldNumber < numFields; fieldNumber++) {
    var fieldName = getNthFieldName(fieldNumber);

    if (prefs.grepTxtField.test(fieldName)) {
      convertCount++;

      var oFld = this.getField(fieldName);

      oFld.richText = true;
      oFld.multiline = false;
      oFld.doNotScroll = true;
      oFld.doNotSpellCheck = true;
      oFld.textSize = 6;
      oFld.textFont = font.Helv;

      var fieldFormat = oFld.userName;

      if (fieldFormat.match(prefs.grepAlignField)) {
        var textAlign = fieldFormat.match(prefs.grepAlignField)[2];

        switch (textAlign) {
          case "right":
            oFld.alignment = "right";
            break;
          case "center":
            oFld.alignment = "center";
            break;
          default:
            oFld.alignment = "left";
        }
      } else {
        oFld.alignment = "left";
      }

      if (fieldFormat.match(prefs.grepStyleField)) {
        var fontStyle = fieldFormat.match(prefs.grepStyleField)[2];

        switch (fontStyle) {
          case "bold":
            oFld.fontWeight = 700;
            oFld.textFont = font.HelvB;
            break;
          default:
            oFld.fontWeight = 400;
        }
      } else {
        oFld.fontWeight = 400;
      }

      if (fieldFormat.match(prefs.grepTextColorField)) {
        var textColor = fieldFormat.match(prefs.grepTextColorField)[2];

        switch (textColor) {
          case "white":
            oFld.textColor = ["RGB", 1, 1, 1];
            break;
          case "red":
            oFld.textColor = ["RGB", 1, 0, 0];
            break;
          default:
            oFld.textColor = ["RGB", 0, 0, 0];
        }
      } else {
        oFld.textColor = ["RGB", 0, 0, 0];
      }
    }
  }

  app.alert("" + convertCount + " Felder wurden umgewandelt.");
}

// ----------------------------------------------------------
// Check if all ID's of formfields are unique
// ----------------------------------------------------------
function checkID() {
  var IDs = [];

  for (var fieldNumber = 0; fieldNumber < numFields; fieldNumber++) {
    var fieldName = getNthFieldName(fieldNumber);

    if (prefs.grepTxtField.test(fieldName)) {
      if (prefs.grepIDField.test(fieldName)) {
        var m = fieldName.match(prefs.grepIDField);
        IDs.push(parseInt(m[1], 10)); // push id
      } else {
        return true;
      }
    }
  }

  var chkDupps = hasDuplicate(IDs);

  if (chkDupps) {
    console.println("Dupp IDs: " + IDs);
    return true;
  } else {
    return false;
  }
}
