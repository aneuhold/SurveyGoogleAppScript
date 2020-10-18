/**
* Documentation for the different types:
* Form: https://developers.google.com/apps-script/reference/forms/form
* FormResponse: https://developers.google.com/apps-script/reference/forms/form-response
* Range: https://developers.google.com/apps-script/reference/spreadsheet/range
**/

// ----- GRADE MAPPING FUNCTIONS ----- //

function getGradePointFromLetter(letterGrade) {
  switch (letterGrade) {
    case 'A+':
      return 5;
      break;
    case 'A':
      return 4;
      break;
    case 'B':
      return 3;
      break;
    case 'C':
      return 2;
      break;
    case 'D':
      return 1;
      break;
    default: 
      return 'Invalid letter grade, should be either A+, A, B, C, or D';
      break;
  }
}

function getGradeLetterFromPoint(gradePoint) {
  const roundedPoint = Math.round(gradePoint);
  switch (roundedPoint) {
    case 5:
      return 'A+';
      break;
    case 4:
      return 'A';
      break;
    case 3:
      return 'B';
      break;
    case 2:
      return 'C';
      break;
    case 1:
      return 'D';
      break;
    default:
      return 'Invalid grade points';
      break;
  }
}

// ----- FormItem FUNCTIONS ----- //

/**
* Gets the FormItem for the given student name which represents the question that grades the student in various areas.
**/
function getFormItemForStudent(studentName) {
  if (studentIDToFormItemID === null) {
    generateStudentIDToFormItemIDObj();
  }
  return getForm().getItemById(studentIDToFormItemID[studentName]);
}

// ----- FormResponse FUNCTIONS ----- //

/**
* Gets all of the respones from the form.
*
* @returns {FormResponse[]} the responses. One for each submitter.
**/
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
      Logger.log(userResponse);
    }
  }
  
}

// ----- Form FUNCTIONS ----- //

/**
* Gets the form that should be used to update and collect data from once responses are submitted.
*
* @returns {Form} the form with the ID specified at the beginning of the script.
**/
function getForm() {
  return FormApp.openById(formID); // ID for the survey
}

// ----- Sheet FUNCTIONS ----- //

/** 
* Gets the sheet where the teams and team members are, this should be the sheet that is associated with this script.
**/
function getTeamsSheet() {
  var ss = SpreadsheetApp.getActive();
  return ss.getSheetByName("Teams"); // name of the sheet to read 
}

// ----- Item FUNCTIONS ----- //

/**
* Gets the items (questions) from the form.
*
* @returns {Item[]} the array of Items from the form which are the questions on the form
**/
function getFormItems() {
  return getForm().getItems(); 
}

// ----- string FUNCTIONS ----- //

/**
* Gets the grades of the student from the results of the form according to what their team members have given them.
*
* @returns {string[][]} The array of arrays of grades given to the particular student. 
**/
function getStudentGrades(studentName) {
  let studentGrades = [];
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
* Gets the student name from a given form item title. This pulls the name if the studentGradingSectionTitle template
* was used.
*
* @returns {string} the name of the student within the provided title
**/
function getStudentNameFromTitle(title) {
  const templateTitleParts = studentGradingSectionTitle.split('?');
  let temp = title;
  
  // Remove the parts surrounding the student's name
  temp = temp.replace(templateTitleParts[0], '');
  temp = temp.replace(templateTitleParts[1], ''); 
  
  return temp;
}

/**
* Gets the student names from the sheet attached to this script and returns it as a 2-dimensional array.
*
* @returns {string[][]} the range of cells containing the student names from the attached sheet
**/
function getStudentNamesFromSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1,2, teamsSheet.getLastRow() - 1).getValues(); // team members names
}

/**
* Gets the student names and returns it as an 1-dimensional array.
*
* @returns {string[]} the string array of student names
**/
function getStudentNames() {
  const studentNames2DArr = getStudentNamesFromSheet();
  let studentNames = [];
  for (let i = 0; i < studentNames2DArr.length; i++) {
    studentNames.push(studentNames2DArr[i][0]);
  }
  return studentNames;
}

function getTeamNamesFromSheet() {
  const teamsSheet = getTeamsSheet();
  return teamsSheet.getRange(1,1, teamsSheet.getLastRow() - 1).getValues(); // team names
}

// ----- NO-RETURN FUNCTIONS ----- //

/**
* Builds the headers for the given sheet. This will consist of "Student Name" then each of the things
* to be graded upon.
**/
function buildSheetHeaders(sheet) {
  sheet.getRange('A1').setValue('Student Name');
  
  // The starting value of capital letters in UTF-16
  const utf16A = 65;
  for (let i = 0; i < thingsToGradeStudentsOn.length; i++) {
    const titleRangeLocation = String.fromCharCode(utf16A + 1 + i) + '1';
    sheet.getRange(titleRangeLocation).setValue(thingsToGradeStudentsOn[i]);
  }
}

/**
* Holds a JSON object which has a key of a student name and a form item ID as the value. This helps
* create a map between the two values.
**/
let studentIDToFormItemID = null;

function generateStudentIDToFormItemIDObj() {
  studentIDToFormItemID = {};
    
  // Create the map between the form IDs and student names
  const formItems = getFormItems();
  for (let i = 0; i < formItems.length; i++) {
    
    // Test if the title has the second part of the studentGradingSectionTitle. This seemed like a good enough test for now.
    if (formItems[i].getTitle().includes(studentGradingSectionTitle.split('?')[1])) {
      const studentName = getStudentNameFromTitle(formItems[i].getTitle());
      studentIDToFormItemID[studentName] = formItems[i].getId();
    }
    
  }
}