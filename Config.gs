/**
* The ID of the form to be used as the individual survey form.
**/
const formID = "1Glc2SyLihKocQDPcrpAS7pewBaz2P-3GwacpvREwN0E"

/**
* The title of the section that is used to indicate the grading portion for the individual student by their peers on their team.
* This should be formatted so a `?` is placed where the student name should be.
*
* NOTE: If this is changed, then the form needs to be rebuilt, because the code to extract responses won't know about the
* old grading section title. Code could probably be written so that the form contains some kind of metadata though indicating
* the original grading section title format.
**/
const studentGradingSectionTitle = 'Grade ? on the tasks mentioned below'

/**
* The array of things to have each peer grade each other on among their teams.
**/
const thingsToGradeStudentsOn = [
  'Attended meetings', 
  'Communicated professionally', 
  'Participated in group discussions', 
  'Good team member', 
  'Work Quality is satisfactory', 
  'Helper creating the diagrams', 
  'Helped with documentation'
];
