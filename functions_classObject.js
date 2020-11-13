/**
 * @typedef StudentObj
 * @type {{
 *  fullName: string,
 *  asuId: string,
 *  groupName: string,
 *  completedSurvey: boolean,
 *  peerGrades: string[][],
 *  otherAnswers: string[]
 * }}
 */

/**
 * @typedef StudentsObj
 * @type {{
 *  [asuriteId: string]: StudentObj
 * }}
 */

/**
 * @typedef TeamObject
 * @type {{
 *  teamName: string,
 *  asuIDs: string[],
 * }}
 */

/**
 * @typedef TeamsObject
 * @type {{
 *  [teamName: string]: TeamObject
 * }}
 */

/**
 * @typedef ClassObject
 * @type {{
 *  teamsObj: TeamsObject,
 *  studentsObj: StudentsObj,
 * }}
 */

/**
 * @type {ClassObject}
 */
let _classObject = null;

/**
 * Gets the StudentsObj by pulling information from the Teams sheet and from
 * the responses.
 *
 * If a student doesn't have a asurite ID on the teams sheet, then they get a
 * generic ID like so: `unknown1`.
 *
 * @returns {StudentsObj} the completed set of StudentObj objects
 */
function getStudentsObj() {
  if (_classObject === null) {
    _classObject = getClassObject();
  }
  if (_classObject.studentsObj !== undefined) {
    return _classObject.studentsObj;
  }
  throw new Error('studentsObj was undefined even though classObject was ',
    'generated');
}

/**
 * Gets the teamsObj by pulling information from the Teams sheet.
 *
 * @returns {TeamsObject}
 */
function getTeamsObj() {
  if (_classObject === null) {
    _classObject = getClassObject();
  }
  if (_classObject.teamsObj !== undefined) {
    return _classObject.teamsObj;
  }
  throw new Error('teamsObj was undefined even though classObject was ',
    'generated');
}

/**
 * If the `_classObject` is not setup yet, then this function creates it by
 * going over all of the details for the students and teams and creates the
 * overall class object.
 *
 * @returns {ClassObject} the completed class object
 */
function getClassObject() {
  if (_classObject !== null) {
    return _classObject;
  }

  const studentsObj = {};

  /**
   * @type {TeamsObject}
   */
  const teamsObj = {};

  // Go through the teams sheet for data
  let numUnknownIds = 0;
  const allTeamsSheetValues = getAllValuesFromTeamsSheet();
  for (let row = 0; row < allTeamsSheetValues.length; row++) {
    const currentRow = allTeamsSheetValues[row];
    let asuId = currentRow[2].trim().toLowerCase(); // Third column has ASURite ID
    const fullName = currentRow[1]; // Second column has the student's name
    const groupName = currentRow[0]; // First column has the group name

    // If the ID is empty
    if (asuId === '') {
      Logger.log(`ID for ${fullName} was empty.`);
      numUnknownIds++;
      asuId = `unknown${numUnknownIds}`;
    }

    // If the group has not been created
    if (teamsObj[groupName] === undefined) {
      teamsObj[groupName] = {
        teamName: groupName,
        asuIDs: [
          asuId,
        ],
      };
    } else {
      teamsObj[groupName].asuIDs.push(asuId);
    }

    // If the ID has already been entered into the objects
    if (studentsObj[asuId] !== undefined) {
      Logger.log(`ERROR (getStudentsObj): Asu ID of ${asuId} has already been entered into studentsObj.`,
        `Currently this is row ${row + 1} being processed`);
    }

    studentsObj[asuId] = {
      asuId,
      fullName,
      groupName,
      completedSurvey: false,
      peerGrades: [],
      peerComments: [],
      otherAnswers: [],
    };
  }

  const formItems = getFormItems();
  const form = getForm();

  // Get the team question item
  const teamQuestionItem = formItems
    .find((item) => item.getTitle() === teamQuestionTitle);

  // Go through the responses for data. Each response corresponds to a completed survey
  const formResponses = getResponses();

  // If the form responses haven't been made yet, then skip getting the maps
  let formIdsMaps = null;
  if (formResponses.length !== 0) {
    formIdsMaps = getFormIdMaps(studentsObj);
  }

  for (let i = 0; i < formResponses.length; i++) {
    // Find out which team they are on
    const teamName = formResponses[i].getResponseForItem(teamQuestionItem)
      .getResponse();

    // Get their ASU ID from the completed form
    const asuIdQuestionItemId = formIdsMaps.asuIDQuestionItemIds[teamName];
    const asuIdQuestionItem = form.getItemById(asuIdQuestionItemId);
    const asuIdResponse = formResponses[i].getResponseForItem(asuIdQuestionItem);
    const asuId = asuIdResponse.getResponse().trim().toLowerCase();

    // If their ASU ID matches one that is in the Teams sheet
    if (studentsObj[asuId] !== undefined) {
      studentsObj[asuId].completedSurvey = true;

      const studentItemResponses = formResponses[i].getItemResponses();
      for (let j = 0; j < studentItemResponses.length; j++) {
        // If the response is not empty
        if (studentItemResponses[j].getResponse() !== null) {
          const responseItemId = studentItemResponses[j].getItem().getId();

          // If the response is one of the grading responses
          if (formIdsMaps.gradingFormItemIds[responseItemId] !== undefined) {
            const studentIdBeingGraded = formIdsMaps.gradingFormItemIds[responseItemId];
            if (studentsObj[studentIdBeingGraded].peerGrades === undefined) {
              Logger.log(`studentsObj with Id: ${studentIdBeingGraded} doesnt exist`);
            }

            // If the student is grading themself but it shouldn't count
            if (studentIdBeingGraded === asuId && !studentsSelfGradeCounts) {
              Logger.log(`Student with ASU ID ${asuId} self-grade does not count`);
            } else {
              studentsObj[studentIdBeingGraded].peerGrades
                .push(studentItemResponses[j].getResponse());
            }

          // If the response is one of the comment responses
          } else if (formIdsMaps.commentFormItemIds[responseItemId] !== undefined) {
            const studentIdBeingGraded = formIdsMaps.commentFormItemIds[responseItemId];
            studentsObj[studentIdBeingGraded].peerComments
              .push(studentItemResponses[j].getResponse());
          }
        }
      }
      for (let questionIndex = questionsToShowOnOutput.start;
        questionIndex <= questionsToShowOnOutput.end;
        questionIndex++) {
        const response = studentItemResponses[questionIndex].getResponse();
        if (Array.isArray(response)) {
          studentsObj[asuId].otherAnswers.push(...response);
        } else {
          studentsObj[asuId].otherAnswers.push(response);
        }
      }
    }
  }

  _classObject = {
    studentsObj,
    teamsObj,
  };

  // Log the result
  // Logger.log(JSON.stringify(studentsObj, null, 2));

  return _classObject;
}
