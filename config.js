/**
*
* */
const formID = '1gpGdOSDp9FgDnRLOqujxlDkXa_CulhhTzEEe0dQboOY';

/**
 * The title of the section that is used to indicate the grading portion for the
 * individual student by their peers on their team.
 * This should be formatted so a `???` is placed where the student name should be.
 *
 * NOTE: If this is changed, then the form needs to be rebuilt, because the code
 * to extract responses won't know about the old grading section title. Code
 * could probably be written so that the form contains some kind of metadata
 * though indicating the original grading section title format.
 */
const studentGradingSectionTitle = 'Grade ??? on the tasks mentioned below';

/**
* An object that holds important titles that are used to pull information when
* the summary is built. This only impacts the analysis and not the Google Form
* building. Each title should match what is currently on the form.
* */
const questionTitles = {
  asuId: 'Select your asurite.',
};

/**
* Any extra questions to show for each student on the final grades output.
* Numbered starting from 0, and ending on the last one that should be included.
* So the `end` value is inclusive.
* */
const questionsToShowOnOutput = {
  start: 0,
  end: 0,
};

// Different sets of questions for different courses.
// These need to be declared before the place where they are used below.
const ser315Questions = [
  'Attended meetings',
  'Communicated professionally',
  'Participated in group discussions',
  'Good team member',
  'Work Quality is satisfactory',
  'Helper creating the diagrams',
  'Helped with documentation',
];
const ser316Questions = [
  'Exhibits consistent and sufficient code activity (Tasks, Commits, Code Commit Message)',
  'Proper agile management technique (Daily Scrum, Slack activity, retrospective, Sprint 3 planning, Overall process)',
  'Quality Practice (GitHub, Unit Tests, Reviews)',
  'Delivery of working software (screencast, master in GitHub works, business value delivered)',
  'Good team member who participates in team activities',
  'Helps with getting the documentation done',
  'Communicates professionally',
];

/**
* The array of things to have each peer grade each other on among their teams.
*
* NOTE: If the form has already been created, then this needs to match the
* questions the form had so the grading code works properly.
*/
const thingsToGradeStudentsOn = ser316Questions;
const title = 'SER 316 individual survey';
