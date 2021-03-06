// ----- GRADE MAPPING FUNCTIONS ----- //

function getGradePointFromLetter(letterGrade) {
  if (getConfig().grades[letterGrade] === undefined) {
    Logger.log(`Invalid letter grade provided, it was ${letterGrade}`);
    return 'Invalid letter grade, should be either A+, A, B, C, or D';
  }
  return getConfig().grades[letterGrade].value;
}

function getGradeLetterFromPoint(gradePoint) {
  if (typeof gradePoint !== 'number') {
    return `Invalid grade points, they were ${gradePoint}`;
  }

  // Get all the grade values
  const gradeEntries = Object.entries(getConfig().grades);

  let letterGradeFound = false;
  let letterGrade = '';
  let currentGradeIndex = 0;
  while (!letterGradeFound && currentGradeIndex < gradeEntries.length) {
    const currentLetterGrade = gradeEntries[currentGradeIndex][0];
    const { maxRange, minRange } = gradeEntries[currentGradeIndex][1];

    if (gradePoint > minRange && gradePoint <= maxRange) {
      letterGrade = currentLetterGrade;
      letterGradeFound = true;
    }

    currentGradeIndex++;
  }

  if (letterGradeFound) {
    return letterGrade;
  }
  return `Invalid grade points, they were ${gradePoint}`;
}

// ----- FormItem FUNCTIONS ----- //

/**
* Gets the FormItem for the given student name which represents the question
* that grades the student in various areas.
* */
function getFormItemForStudent(studentName) {
  if (studentsObj === null) {
    generateStudentIDToFormItemIDObj();
  }
  if (studentIDToFormItemID[studentName] == null) {
    Logger.log(`entry for ${studentName} in studentIDToFormItemID object is null.`);
    Logger.log('studentIDToFormItemID: ', studentIDToFormItemID);
    Logger.log('This might be because the student is not included in one of the questions on the form.');
  }
  return getForm().getItemById(studentIDToFormItemID[studentName]);
}

// ----- FormResponse FUNCTIONS ----- //

/**
 * Gets all of the responses from the form.
 *
 * @returns {GoogleAppsScript.Forms.FormResponse[]} the responses. One for each
 * submitter.
 */
function getResponses() {
  return getForm().getResponses();
}

function logResponses() {
  const responses = getForm().getResponses();

  // Loop through each FormResponse
  for (let i = 0; i < responses.length; i++) {
    const itemResponses = responses[i].getItemResponses();

    // Loop through each ItemResponse
    for (let j = 0; j < itemResponses.length; j++) {
      const userResponse = itemResponses[j].getResponse();
    }
  }
}

// ----- Sheet FUNCTIONS ----- //

/**
 * Gets the sheet where the teams and team members are, this should be the
 * spreadsheet that is associated with this script.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} the sheet labeled "Teams"
 */
function getTeamsSheet() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName('Teams'); // name of the sheet to read
}

/**
 * Gets the sheet where the config is, this should be the spreadsheet that is
 * associated with this script.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet} the sheet labeled "Config"
 */
function getConfigSheet() {
  const ss = SpreadsheetApp.getActive();
  return ss.getSheetByName('Config');
}

// ----- Item FUNCTIONS ----- //

/**
* Gets the items (questions) from the form.
*
* @returns {Item[]} the array of Items from the form which are the questions on the form
* */
function getFormItems() {
  return getForm().getItems();
}

// ----- string FUNCTIONS ----- //

/**
* Gets the column letter from the given index starting at 0 which corresponds to 'A'.
*
* @param {Number} index the index to convert to the Google Sheet letter for the column
* @returns {String} the letter representing the column corresponding to the index
* */
function getColCharFromIndex(index) {
  // 65 is the character code for A
  const utf16A = 65;
  return String.fromCharCode(utf16A + index);
}

/**
* Gets the grades of the student from the results of the form according to what
* their team members have given them.
*
* @param {string} studentName the name of the student to get grades for. This
* should be the exact name of the student from the "Teams" sheet.
* @returns {string[][]} The array of arrays of grades given to the particular student.
* */
function getStudentGrades(studentName) {
  const studentGrades = [];
  const studentFormItem = getFormItemForStudent(studentName);
  const formResponses = getResponses();

  // Get all of the responses that have to do with the student
  for (let i = 0; i < formResponses.length; i++) {
    const responseItemForStudent = formResponses[i].getResponseForItem(studentFormItem);

    // If there is a response for this student, then add their grades to the array
    if (responseItemForStudent !== null) {
      studentGrades.push(responseItemForStudent.getResponse());
    }
  }

  return studentGrades;
}

/**
* Creates a title or question by swapping the triple question marks with the provided student name.
* */
function createTitleFromStudentName(studentName) {
  const returnStr = getConfig().studentGradingSectionTitle.replace('???', studentName);
  return returnStr;
}

/**
* Gets the student name from a given form item title. This pulls the name if the
* studentGradingSectionTitle template was used.
*
* @returns {string} the name of the student within the provided title
* */
function getStudentNameFromTitle(title) {
  const templateTitleParts = getConfig().studentGradingSectionTitle.split('???');
  let temp = title;

  // Remove the parts surrounding the student's name
  temp = temp.replace(templateTitleParts[0], '');
  temp = temp.replace(templateTitleParts[1], '');

  return temp;
}

/**
* Gets the student names from the sheet attached to this script and returns it
* as a 2-dimensional array. Imagine this as 1 column where each row is a
* student name.
*
* @returns {string[][]} the range of cells containing the student names from the attached sheet
* */
function getStudentNamesFromSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1, 2, teamsSheet.getLastRow()).getValues(); // team members names
}

/**
* Gets the student asurites from the sheet attached to this script and returns
* it as a 2-dimensional array.
* Imagine this as 1 column where each row is a student name.
*
* @returns {string[][]} the range of cells containing the student asurite values
* from the attached sheet
* */
function getStudentASURITEFromSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1, 3, teamsSheet.getLastRow()).getValues(); // team members asurites
}

/**
* Gets the student names and returns it as an 1-dimensional array.
*
* @returns {string[]} the string array of student names
* */
function getStudentNames() {
  const studentNames2DArr = getStudentNamesFromSheet();
  const studentNames = [];
  for (let i = 0; i < studentNames2DArr.length; i++) {
    studentNames.push(studentNames2DArr[i][0]);
  }
  return studentNames;
}

function getTeamNamesFromSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1, 1, teamsSheet.getLastRow()).getValues(); // team names
}

/**
* Gets the 2d array of values representing all the values on the teams sheet.
* */
function getAllValuesFromTeamsSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1, 1, teamsSheet.getLastRow(), teamsSheet.getLastColumn()).getValues();
}

// ----- NO-RETURN FUNCTIONS ----- //

/**
* Builds the headers for the given sheet.
* */
function buildSheetHeaders(sheet) {
  let currentCol = 1;

  // Student Name
  sheet.getRange(1, currentCol).setValue('Student Name');
  currentCol++;

  // Team Name
  sheet.getRange(1, currentCol).setValue('Team Name');
  currentCol++;

  // Things to grade students on
  for (let i = 0; i < getConfig().peerQuestions.length; i++) {
    const titleRangeLocation = `${getColCharFromIndex(currentCol)}1`;
    sheet.getRange(1, currentCol).setValue(getConfig().peerQuestions[i]);
    currentCol++;
  }

  // Num students grading each student
  sheet.getRange(1, currentCol).setValue('Number of students that graded this student');
  currentCol++;

  // Comments from their peers
  sheet.getRange(1, currentCol).setValue('Comments from Peers separated by dashes');
  currentCol++;

  // Student completed the survey
  sheet.getRange(1, currentCol).setValue('Student completed the survey');
  currentCol++;

  // Add group questions
  getConfig().groupQuestions.forEach((question) => {
    sheet.getRange(1, currentCol).setValue(question);
    currentCol++;
  });

  // Other questions that should be displayed as indicated in config
  const formItems = getFormItems();
  for (let questionIndex = questionsToShowOnOutput.start;
    questionIndex < questionsToShowOnOutput.end;
    questionIndex++) {
    const formItem = formItems[questionIndex];
    const itemTitle = formItem.getTitle();
    const itemType = formItem.getType();

    // If it is a grid, then take all the questions out and use those for headers
    if (itemType === FormApp.ItemType.GRID) {
      const rowNames = formItem.asGridItem().getRows();
      for (let row = 0; row < rowNames.length; row++) {
        sheet.getRange(1, currentCol).setValue(rowNames[row]);
        currentCol++;
      }
    } else {
      sheet.getRange(1, currentCol).setValue(itemTitle);
      currentCol++;
    }
  }

  // Set the text wrapping for the title row
  const firstRowRange = sheet.getRange(1, 1, 1, currentCol + 1);
  firstRowRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);
}

/**
 * Maps the form IDs of the grading question and comment question to each student
 * ID given the properly filled studentsObj. The studentsObj must have the
 * fullName assigned for this to work properly.
 *
 * This has O(n) time complexity. It makes 2 passes, 1 for the form items and 1 for the studentsObj.
 *
 * @returns {{
 *  gradingFormItemIds: {
 *    [formItemId: string]: string
 *  },
 *  commentFormItemIds: {
 *    [formItemId: string]: string
 *  },
 *  asuIDQuestionItemIds: {
 *    [teamName: string]: string
 *  }
 * }} the completed mapped form IDs, where the values of each formID is the
 * student ASUrite ID, except where the asuIDQuestionItemIds are defined where
 * the value is the form item ID of the asurite question for that team
 */
function getFormIdMaps(studentsObj) {
  /**
  * This will be mapped like so:
  * studentRelatedFormIds = {
  *   studentName: {
  *     gradingFormItemId: id,
  *     commentFormItemId: id
  *   }
  * }
  *
  * Which after creation, can then be mapped onto the formIdsMaps.
  * */
  const studentRelatedFormIds = {};

  /**
   * Maps the form IDs to student IDs (so it reverses the relation, and adds in
   * the actual ASURite IDs)
   */
  const formIdsMaps = {
    gradingFormItemIds: {},
    commentFormItemIds: {},
    asuIDQuestionItemIds: {},
  };

  // Map the studentRelatedFormIds first and the team ASU ID questions
  const formItems = getFormItems();
  let currentTeamName = '';
  for (let i = 0; i < formItems.length; i++) {
    const currentFormTitle = formItems[i].getTitle();

    // Test if the title is the beginning of a team title
    if (currentFormTitle.includes('Peer review:')) {
      currentTeamName = currentFormTitle.replace('Peer review: ', '');

    // Test if the title is the asu rite question
    } else if (currentFormTitle.includes(getConfig().asuIdQuestionTitle)) {
      formIdsMaps.asuIDQuestionItemIds[currentTeamName] = formItems[i].getId();

    // Test if the title has the second part of the studentGradingSectionTitle.
    // This seemed like a good enough test for now.
    } else if (currentFormTitle.includes(getConfig().studentGradingSectionTitle.split('???')[1])) {
      const studentName = getStudentNameFromTitle(formItems[i].getTitle());

      studentRelatedFormIds[studentName] = {
        gradingFormItemId: formItems[i].getId(),
        commentFormItemId: formItems[i + 1].getId(),
      };
      // Skip the next form item
      i++;
    }
  }

  Object.entries(studentsObj).forEach(([key, value]) => {
    if (studentRelatedFormIds[value.fullName] !== undefined) {
      const gradingFormId = studentRelatedFormIds[value.fullName].gradingFormItemId;
      const commentFormId = studentRelatedFormIds[value.fullName].commentFormItemId;
      formIdsMaps.gradingFormItemIds[gradingFormId] = key;
      formIdsMaps.commentFormItemIds[commentFormId] = key;
    } else {
      Logger.log(`Student with name ${value.fullName} didnt have an entry in the studentsObj`);
    }
  });

  return formIdsMaps;
}
