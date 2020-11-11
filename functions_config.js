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
        if (currentCell.getValue() !== ''
        || currentCell.getValue() !== 'Please keep this text here to identify the end of the questions') {
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
