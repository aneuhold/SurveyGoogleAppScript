/**
 * Gets the form that should be used to update and collect data from once
 * responses are submitted.
 * @returns {GoogleAppsScript.Forms.Form} the form with the ID specified at
 * the beginning of the script.
 */
function getForm() {
  return FormApp.openById(config.formID); // ID for the survey
}

/**
 * Creates a new form and assigns the form ID to the appropriate location in the
 * config.
 */
function createForm() {
  const { formTitle } = getConfig();
  const { formId } = getConfig();

  // If a form ID is already specified, do not create a new form.
  if (formId !== '' && formId !== undefined) {
    Logger.log('Form ID is already specified so the new form wasnt created');
    return;
  }

  const newForm = FormApp.create(formTitle);
  Logger.log('New form was created');
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  newForm.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  Logger.log('The new destination for the form was set');
  editConfigValue('formID', newForm.getId());
  Logger.log('The formID range was set to the new form ID');
}
