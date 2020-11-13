/**
 * Used for the config variable.
 *
 * @typedef Config
 * @type {{
 *  asuIdQuestionTitle: string,
 *  peerQuestions: string[],
 *  title: string,
 *  formId: string,
 *  studentGradingSectionTitle: string
 * } | null}
 */

/**
 * Clears the "Config" sheet of set values.
 */
function clearConfig() {
  const configSheet = getConfigSheet();
  const namedRanges = configSheet.getNamedRanges();
  namedRanges.forEach((namedRange) => {
    if (namedRange.getName() === 'peerQuestions') {
      const peerQuestionsRange = namedRange.getRange();

      // Loop through each range and collect the ones that don't have nothing,
      // or the last separator statement.
      const numRows = peerQuestionsRange.getHeight();
      let currentRow = 1;
      let endFound = false;
      while (!endFound && currentRow <= numRows) {
        const currentCell = peerQuestionsRange.getCell(currentRow, 1);
        if (currentCell.getValue() === ''
        || currentCell.getValue() === 'Please keep this text here to identify the end of the questions') {
          endFound = true;
        } else {
          currentCell.clearContent();
          currentRow++;
        }
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

function populateConfigFromSheet() {
  const configSheet = getConfigSheet();
  const namedRanges = configSheet.getNamedRanges();
  config = {};
  namedRanges.forEach((namedRange) => {
    if (namedRange.getName() === 'peerQuestions') {
      const peerQuestionsRange = namedRange.getRange();

      // Loop through each range and collect the ones that don't have nothing,
      // or the last separator statement.
      const numRows = peerQuestionsRange.getHeight();
      let currentRow = 1;
      let endFound = false;
      config.peerQuestions = [];
      while (!endFound && currentRow <= numRows) {
        const currentCellValue = peerQuestionsRange.getCell(currentRow, 1).getValue();
        if (currentCellValue === ''
        || currentCellValue === 'Please keep this text here to identify the end of the questions') {
          endFound = true;
        } else {
          config.peerQuestions.push(currentCellValue);
          currentRow++;
        }
      }
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
      case 'formId':
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
