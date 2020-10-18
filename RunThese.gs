/**
* Gets the grades of each student and prints the average to the sheet attached to this script
* under a new tab called "Grades - Date"
**/
function getGradesOfEachStudent() {
  const students = getStudentNames();
  
  // Create the new sheet
  const date = new Date();
  const newSheetName = 'Grades - ' + date.toDateString() + " " + date.getHours() + ":" + date.getMinutes();
  const gradesSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(newSheetName);
  
  buildSheetHeaders(gradesSheet);
  
  for (let i = 0; i < students.length; i++) {
    const studentGrades = getStudentGrades(students[i]);
    
    // Put the student name in the new sheet
    gradesSheet.getRange('A' + (i + 2)).setValue(students[i]);
    
    // Take each grade from each response and average them among each other, if the student has been graded.
    if (studentGrades.length > 0) {
      
      // For each thing being graded upon
      for (let j = 0; j < thingsToGradeStudentsOn.length; j++) {
        let totalGradePoints = 0;
        
        // Add up their grade points from each student grading them
        for (let k = 0; k < studentGrades.length; k++) {
          const gradePointsForItem = getGradePointFromLetter(studentGrades[k][j]);
          totalGradePoints += gradePointsForItem;
        }
        
        // Get the average grade points
        const averageGradePoints = totalGradePoints / studentGrades.length;
        
        // Convert the grade points into a letter grade
        const letterAverageGrade = getGradeLetterFromPoint(averageGradePoints);
        
        // Insert the data into the sheet
        const utf16A = 65;
        const gradeRangeLocation = String.fromCharCode(utf16A + 1 + j) + (i + 2);
        gradesSheet.getRange(gradeRangeLocation).setValue(letterAverageGrade);
      }
    }
  }
}

/**
* Updates the form with groups and team members from the sheet attached to this script.
**/
function updateForm(){
  // call your form and connect to the drop-down item
  var form = getForm();

  // grab the values in the first column of the sheet - use 2 to skip header row
  var namesValues = getTeamNamesFromSheet();
  var studentNames = getStudentNamesFromSheet();
  var teams = []; // array with team names
  var members = {}; // teamname -> [Teammembers] -- probably could have been done better
  
  // fo through all rows
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
  
  // create multiple choice box which later on holds team names
  var item = form.addMultipleChoiceItem();
  item.setTitle('Please choose your team name');  
  var sectTeam = []; //array of sections
  var teamChoice = []; // array of team choices
  var details = []; // text box in every section for providing team details
  
  var grid = [];
  // now create each section 
  for(var i = 0; i < teams.length; i++){
    sectTeam[i] = form.addPageBreakItem().setTitle('Peer review: ' + teams[i]) // add the new section
      .setGoToPage(FormApp.PageNavigationType.SUBMIT);; // set that at the end of section it should be submitted
      teamChoice[i] = item.createChoice(teams[i], sectTeam[i]); // sets that the choice in multiple choice box decides where to go
    
      // creating this awful grid thing
      var gridSection = [];
      for (var j = 0; j < members[teams[i]].length; j++) { // go through all members of team 
        Logger.log(members[teams[i]]);
        gridSection[j] = form.addGridItem(); // create grid
        gridSection[j].setTitle('Grade ' + members[teams[i]][j] + ' on the tasks mentioned below') 
        .setRows(thingsToGradeStudentsOn)
        .setColumns(['A+', 'A','B','C','D']);
      }
    grid[i] = gridSection; // save grid
    
    // Add the additional info textbox
    details[i] = form.addParagraphTextItem(); 
    details[i].setTitle('Add details about your grading, did something stand out in a positive or negative way? Be brief but let me know if something is important.');
  }
  
  // populate the multiple choice with the array data
  item.setChoices(teamChoice); // populates the multiple choice one correctly
  
}