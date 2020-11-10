/**
* Gets the summary of each student and prints it to the sheet attached to this script
* under a new tab called "Grades - Date".
**/
function getSummaryOfEachStudent() {
  
  // Create the new sheet
  const date = new Date();
  const newSheetName = 'Grades - ' + date.toDateString() + " " + date.getHours() + ":" + date.getMinutes();
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
    
    // Take each grade from each response and average them among each other, if the student has been graded.
    if (studentGrades.length > 0) {
      
      // For each thing being graded upon
      for (let j = 0; j < thingsToGradeStudentsOn.length; j++) {
        let totalGradePoints = 0;
        let totalGradesGiven = 0;
        
        // Add up their grade points from each student grading them
        for (let k = 0; k < studentGrades.length; k++) {
          const gradePointsForItem = getGradePointFromLetter(studentGrades[k][j]);
          
          // If it comes back as not a number, then don't count it towards the total.
          // This means that the current student didn't get graded by another student on this particular topic
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
      currentCol = currentCol + thingsToGradeStudentsOn.length;
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
* Updates the form with groups and team members from the sheet attached to this script.
**/
function updateForm(){
  // call your form and connect to the drop-down item
  var form = getForm();
  form.setDescription('This form is to provide information about your team, yourself and each individual in the team. It will only be read by the instructor and grading team.')

  // grab the values in the sheet
  var namesValues = getTeamNamesFromSheet();
  var studentNames = getStudentNamesFromSheet();
  var studentASU = getStudentASURITEFromSheet();
  var teams = []; // array with team names
  var members = {}; // teamname -> [Teammembers] -- probably could have been done better
  

  
  // go through all rows
  for(var i = 0; i < namesValues.length; i++){
    
    // if not empty
    if(namesValues[i][0] != ""){
      var included = false;
      for (var j = 0; j < teams.length; j++){ // actually I wanted to do teams.indexOf(namesValues[i][0]) == -1 but it never worked so I gave up and searched manually if the team is already tehre
        if (teams[j] == namesValues[i][0]){ 
          included = true;
          break;
        }
      }
      if (!included){ //not included add the team 
        members[namesValues[i][0]] = [studentNames[i][0]];
        teams[teams.length] = namesValues[i][0];
      }
      else { // team already there add the team member
        members[namesValues[i][0]][members[namesValues[i][0]].length] = studentNames[i][0];
      } 
      Logger.log(members);
    }
  }
  
  // Setup the ASUrite question
  Logger.log(studentASU);
  const studentDropDown = form.addListItem()
  .setTitle('Select your asurite.')
  .setRequired(true);
  let studentChoices = [];
  for(var i = 0; i < studentASU.length; i++){
    studentChoices[i] = studentDropDown.createChoice(studentASU[i][0]); 
  }
  Logger.log(studentChoices);
  studentDropDown.setChoices(studentChoices);
  
  // create multiple choice box which later on holds team names
  var item = form.addMultipleChoiceItem();
  item.setTitle('Please choose your team name');  
  var sectTeam = []; //array of sections
  var teamChoice = []; // array of team choices
  var details = []; // text box in every section for providing team details
  var detailsTeamWork = []; // text box in every section for providing team details
  
  var grid = [];
  // now create each section 
  for(var i = 0; i < teams.length; i++){    
    sectTeam[i] = form.addPageBreakItem().setTitle('Peer review: ' + teams[i]) // add the new section
      .setGoToPage(FormApp.PageNavigationType.SUBMIT);; // set that at the end of section it should be submitted
      teamChoice[i] = item.createChoice(teams[i], sectTeam[i]); // sets that the choice in multiple choice box decides where to go
    
      form.addMultipleChoiceItem()
         .setTitle('If given the choice, would you choose to work with this team again??')
         .setChoiceValues(['yes','no'])
      
      // Add the additional info textbox
      form.addParagraphTextItem()
         .setTitle('Please provide an explanation for your response above.');
    
      // creating this awful grid thing
      var gridSection = [];
      for (var j = 0; j < members[teams[i]].length; j++) { // go through all members of team 
        Logger.log(members[teams[i]]);
        gridSection[j] = form.addGridItem(); // create grid
        gridSection[j].setTitle(createTitleFromStudentName(members[teams[i]][j])) 
        .setRows(thingsToGradeStudentsOn)
        .setColumns(['A+', 'A','B','C','D']);
        
        // Add the additional info for each member
        form.addParagraphTextItem()
        .setTitle('Please provide an explanation for your response above for ' + members[teams[i]][j]);
      }
    grid[i] = gridSection; // save grid
    
    // Add the additional info textbox
    //details[i] = form.addParagraphTextItem(); 
    //details[i].setTitle('Add details about your grading, did something stand out in a positive or negative way? Be brief but let me know if something is important.');
  }
  
  // populate the multiple choice with the array data
  item.setChoices(teamChoice); // populates the multiple choice one correctly
  
}