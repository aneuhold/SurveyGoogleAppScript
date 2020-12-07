/**
* Gets the summary of each student and prints it to the sheet attached to this script
* under a new tab called "Grades - Date".
* */
function getSummaryOfEachStudent() {
  // Create the new sheet
  const date = new Date();
  const newSheetName = `Grades - ${date.toDateString()} ${date.getHours()}:${date.getMinutes()}`;
  const gradesSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newSheetName);

  buildSheetHeaders(gradesSheet);

  // Get all the student objects
  const allStudentsObj = getStudentsObj();
  const allStudents = Object.values(allStudentsObj);

  // For each student
  for (let i = 0; i < allStudents.length; i++) {
    const student = allStudents[i];
    const studentGrades = student.peerGrades;
    const currentStudentRow = i + 2;
    let currentCol = 1;

    // Put the student name in the new sheet on the first column
    gradesSheet.getRange(currentStudentRow, currentCol).setValue(student.fullName);
    currentCol++;

    // Put the team name in the next column
    gradesSheet.getRange(currentStudentRow, currentCol).setValue(student.groupName);
    currentCol++;

    // Take each grade from each response and average them among each other,
    // if the student has been graded.
    if (studentGrades.length > 0) {
      // For each thing being graded upon
      for (let j = 0; j < getConfig().peerQuestions.length; j++) {
        let totalGradePoints = 0;
        let totalGradesGiven = 0;

        // Add up their grade points from each student grading them
        for (let k = 0; k < studentGrades.length; k++) {
          const gradePointsForItem = getGradePointFromLetter(studentGrades[k][j]);

          // If it comes back as not a number, then don't count it towards the total.
          // This means that the current student didn't get graded by another
          // student on this particular topic
          if (typeof gradePointsForItem === 'number') {
            totalGradePoints += gradePointsForItem;
            totalGradesGiven++;
          }
        }

        // Get the average grade points
        const averageGradePoints = totalGradePoints / totalGradesGiven;

        // Convert the grade points into a letter grade
        const letterAverageGrade = getGradeLetterFromPoint(averageGradePoints);

        // Insert the grades data into the sheet
        gradesSheet.getRange(currentStudentRow, currentCol).setValue(letterAverageGrade);
        currentCol++;
      }
    } else {
      // Skip those columns
      currentCol += getConfig().peerQuestions.length;
    }

    // Add the number of students that graded this student to the next column
    gradesSheet.getRange(currentStudentRow, currentCol).setValue(studentGrades.length);
    currentCol++;

    // Add the comments from their peers
    gradesSheet.getRange(currentStudentRow, currentCol).setValue(student.peerComments.join('\n--------------\n'));
    currentCol++;

    // Indication if they completed the survey
    gradesSheet.getRange(currentStudentRow, currentCol).setValue(student.completedSurvey);
    currentCol++;

    // Other questions as enumerated in the config
    for (let answerNum = 0; answerNum < student.otherAnswers.length; answerNum++) {
      gradesSheet.getRange(currentStudentRow, currentCol).setValue(student.otherAnswers[answerNum]);
      currentCol++;
    }
  }
}

/**
 * Updates the form set in the config with the `formId` with the questions for
 * each student and group.
 */
function updateForm() {
  const form = getForm();
  form.setDescription('This form is to provide information about your team, '
  + 'yourself and each individual in the team. It will only be read by the '
  + 'instructor and grading team.');

  /**
   * @type {StudentObject}
   */
  const studentsObj = getStudentsObj();

  /**
   * @type {TeamsObject}
   */
  const teamsObj = getTeamsObj();

  // create multiple choice box which later on holds team names
  const teamMultiChoice = form.addMultipleChoiceItem();
  teamMultiChoice.setTitle(teamQuestionTitle)
    .setRequired(true);
  const teamSections = []; // array of sections
  const teamChoices = []; // array of team choices

  const grid = [];
  // Now create each team's section
  Object.values(teamsObj).forEach((teamObj, i) => {
    teamSections[i] = form.addPageBreakItem()
      .setTitle(`Peer review: ${teamObj.teamName}`)
      // set that at the end of section it should be submitted
      .setGoToPage(FormApp.PageNavigationType.SUBMIT);
    // sets that the choice in multiple choice box decides where to go
    teamChoices[i] = teamMultiChoice.createChoice(teamObj.teamName, teamSections[i]);

    // Add ASUrite question
    const studentDropDown = form.addListItem()
      .setTitle(getConfig().asuIdQuestionTitle)
      .setRequired(true);
    const studentChoices = [];
    const currentTeamAsuIds = teamObj.asuIDs;
    currentTeamAsuIds.forEach((asuId) => {
      studentChoices.push(studentDropDown.createChoice(asuId));
    });
    Logger.log(studentChoices);
    studentDropDown.setChoices(studentChoices);

    // Add group questions
    const { groupQuestions } = getConfig();
    groupQuestions.forEach((groupQuestion) => {
      form.addParagraphTextItem()
        .setTitle(groupQuestion);
    });

    // Add working with team again question
    form.addMultipleChoiceItem()
      .setTitle('If given the choice, would you choose to work with this team again??')
      .setChoiceValues(['yes', 'no']);

    // Add the additional info textbox
    form.addParagraphTextItem()
      .setTitle('Please provide an explanation for your response above.');

    // creating this awful grid thing
    const gridSection = [];
    currentTeamAsuIds.forEach((asuId) => {
      const newGridItem = form.addGridItem()
        .setRequired(true); // Create grid item

      newGridItem.setTitle(createTitleFromStudentName(studentsObj[asuId].fullName))
        .setRows(getConfig().peerQuestions)
        .setColumns(['A+', 'A', 'B', 'C', 'D']);

      // Add the additional info for each member
      form.addParagraphTextItem()
        .setTitle(`Please provide an explanation for your response above for ${
          studentsObj[asuId].fullName}`);

      gridSection.push(newGridItem);
    });

    // Save the grid for this team
    grid[i] = gridSection;
  });

  // populate the multiple choice with the array data
  teamMultiChoice.setChoices(teamChoices); // populates the multiple choice one correctly
}
