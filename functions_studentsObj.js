let studentsObj = null;

/**
* Gets the StudentsObj (see documentation.gs for type) by pulling information
* from the Teams sheet and from the responses.
*
* If a student doesn't have a asurite ID on the teams sheet, then they get a
* generic ID like so: `unknown1`.
*
* @returns {StudentsObj} the completed set of StudentObj objects
* */
function getStudentsObj() {
  if (studentsObj === null) {
    studentsObj = {};

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
    const asuRiteQuestionFormItem = formItems.find(
      (item) => item.getTitle() === questionTitles.asuId,
    );
    const formIdsMaps = getFormIdMaps(studentsObj);

    // Go through the responses for data. Each response corresponds to a completed survey
    const formResponses = getResponses();
    for (let i = 0; i < formResponses.length; i++) {
      // Get their ASU ID from the completed form
      const asuIdResponse = formResponses[i].getResponseForItem(asuRiteQuestionFormItem);
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
              studentsObj[studentIdBeingGraded].peerGrades.push(
                studentItemResponses[j].getResponse(),
              );

              // If the response is one of the comment responses
            } else if (formIdsMaps.commentFormItemIds[responseItemId] !== undefined) {
              const studentIdBeingGraded = formIdsMaps.commentFormItemIds[responseItemId];
              studentsObj[studentIdBeingGraded].peerComments.push(
                studentItemResponses[j].getResponse(),
              );
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

    // Log the result
    // Logger.log(JSON.stringify(studentsObj, null, 2));
  }
  return studentsObj;
}
