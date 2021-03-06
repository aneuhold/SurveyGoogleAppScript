/**
 * Used for the config variable.
 *
 * @typedef Config
 * @type {{
 *  asuIdQuestionTitle: string,
 *  peerQuestions: string[],
 *  groupQuestions: string[],
 *  title: string,
 *  formId: string,
 *  studentGradingSectionTitle: string,
 *  grades: {
 *    [letterGrade: string]: {
 *      maxRange: Number,
 *      minRange: Number,
 *      value: Number
 *    }
 *  }
 * } | null}
 */

/**
 * Clears the "Config" sheet of set values.
 */
function clearConfig() {
  const configSheet = getConfigSheet();
  const namedRanges = configSheet.getNamedRanges();
  namedRanges.forEach((namedRange) => {
    if (namedRange.getName() === 'gradeValues'
    || namedRange.getName() === 'gradeRanges') {
      const gradeRange = namedRange.getRange();
      for (let i = 0; i < gradeRange.getNumRows(); i++) {
        gradeRange.getCell(i + 1, 2).clearContent();
      }
    } else {
      // Only clear the content, not the formatting
      namedRange.getRange().clearContent();
    }
  });
}

/**
 * The object holding the different configuration variables for the scripts
 * on this spreadsheet.
 *
 * @type {Config}
 */
let config = null;

/**
 * Gets the config object by either retriveing values from the "Config" sheet,
 * or using the values already generated from that in this run.
 */
function getConfig() {
  if (config === null) {
    populateConfigFromSheet();
  }
  return config;
}

/**
 * Populates the config variable held locally in the script with what is on the
 * sheet attached to this script.
 */
function populateConfigFromSheet() {
  const configSheet = getConfigSheet();
  const namedRanges = configSheet.getNamedRanges();
  config = {};
  namedRanges.forEach((namedRange) => {
    if (namedRange.getName() === 'peerQuestions') {
      const peerQuestionsRange = namedRange.getRange();

      // Loop through each range and collect the ones that don't have nothing
      const numRows = peerQuestionsRange.getHeight();
      config.peerQuestions = [];
      for (let currentRow = 1; currentRow <= numRows; currentRow++) {
        const currentCellValue = peerQuestionsRange.getCell(currentRow, 1).getValue();
        if (currentCellValue !== '') {
          config.peerQuestions.push(currentCellValue);
        }
      }
      return;
    }

    if (namedRange.getName() === 'groupQuestions') {
      const groupQuestionsRange = namedRange.getRange();

      // Loop through each range and collect the ones that don't have nothing
      const numRows = groupQuestionsRange.getHeight();
      config.groupQuestions = [];
      for (let currentRow = 1; currentRow <= numRows; currentRow++) {
        const currentCellValue = groupQuestionsRange.getCell(currentRow, 1).getValue();
        if (currentCellValue !== '') {
          config.groupQuestions.push(currentCellValue);
        }
      }
      Logger.log(config.groupQuestions);
      return;
    }

    if (namedRange.getName() === 'gradeValues') {
      Logger.log('grade values reached');
      const gradeValuesRange = namedRange.getRange();
      const gradeValues = gradeValuesRange.getValues();
      if (config.grades === undefined) {
        config.grades = {};
      }

      // Loop through each grade and assign the value
      gradeValues.forEach((gradeValueRow) => {
        // Col 0 is the letter grade, Col 1 is the value
        const parsedNumber = Number.parseInt(gradeValueRow[1], 10);
        if (Number.isNaN(parsedNumber)) {
          throw new Error(`Value for ${gradeValueRow[0]} in gradeValues is not`
          + ' a number.');
        }
        if (config.grades[gradeValueRow[0]] === undefined) {
          config.grades[gradeValueRow[0]] = {
            value: parsedNumber,
          };
        } else {
          config.grades[gradeValueRow[0]].value = parsedNumber;
        }
      });
      return;
    }

    if (namedRange.getName() === 'gradeRanges') {
      const gradeRangesRange = namedRange.getRange();
      const gradeRanges = gradeRangesRange.getValues();
      if (config.grades === undefined) {
        config.grades = {};
      }

      // Loop through each grade and assign the range
      gradeRanges.forEach((gradeRangeRow) => {
        // Col 0 is the letter grade, Col 1 is the range
        const rangeArr = gradeRangeRow[1].split('-');
        const parsedMinRange = Number.parseFloat(rangeArr[0]);
        const parsedMaxRange = Number.parseFloat(rangeArr[1]);
        if (Number.isNaN(parsedMinRange) || Number.isNaN(parsedMaxRange)) {
          throw new Error(`Value for ${gradeRangeRow[0]} in gradeRanges is not`
          + ' a number or incorrectly formatted.');
        }
        if (config.grades[gradeRangeRow[0]] === undefined) {
          config.grades[gradeRangeRow[0]] = {
            minRange: parsedMinRange,
            maxRange: parsedMaxRange,
          };
        } else {
          config.grades[gradeRangeRow[0]].minRange = parsedMinRange;
          config.grades[gradeRangeRow[0]].maxRange = parsedMaxRange;
        }
      });
      return;
    }

    // For all other cases
    const cellValue = namedRange.getRange().getValue();
    switch (namedRange.getName()) {
      case 'asuIdQuestionTitle':
        config.asuIdQuestionTitle = cellValue;
        break;
      case 'title':
        config.formTitle = cellValue;
        break;
      case 'formID':
        config.formId = cellValue;
        break;
      case 'studentGradingSectionTitle':
        config.studentGradingSectionTitle = cellValue;
        break;
      default:
    }
  });
}

/**
 * Replaces a config value in the "Config" sheet with the given value.
 *
 * @param {string} namedRangeName the name of the Named Range on the "Config"
 * sheet
 * @param {string} newValue the new value to replace the current config value
 * in the named range
 */
function editConfigValue(namedRangeName, newValue) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const configRange = spreadSheet.getRangeByName(namedRangeName);
  configRange.setValue(newValue);
}

/**
 * Adds a single row to the given named range.
 *
 * @param {string} namedRangeName the name of the named range to add a row after
 */
function addRowToNamedRange(namedRangeName) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const namedRange = spreadSheet.getRangeByName(namedRangeName);
  const sheet = namedRange.getSheet();

  // Add a row after the last row in the named range
  const lastRow = namedRange.getLastRow();
  sheet.insertRowAfter(lastRow);

  // Update the range so it includes the new row
  const newRange = sheet.getRange(namedRange.getRow(), namedRange.getColumn(),
    namedRange.getNumRows() + 1, namedRange.getNumColumns());

  // Set the updated range to the named range
  spreadSheet.setNamedRange(namedRangeName, newRange);
}

function addRowToPeerQuestions() {
  addRowToNamedRange('peerQuestions');
}

function addRowToGroupQuestions() {
  addRowToNamedRange('groupQuestions');
}

/**
 * Removes a row from the given named range.
 *
 * @param {string} namedRangeName the name of the range to remove a row from.
 */
function removeRowFromNamedRange(namedRangeName) {
  const spreadSheet = SpreadsheetApp.getActiveSpreadsheet();
  const namedRange = spreadSheet.getRangeByName(namedRangeName);
  const sheet = namedRange.getSheet();

  // Remove the row
  const lastRow = namedRange.getLastRow();
  sheet.deleteRow(lastRow);
}

function removeRowFromPeerQuestions() {
  removeRowFromNamedRange('peerQuestions');
}

function removeRowFromGroupQuestions() {
  removeRowFromNamedRange('groupQuestions');
}
