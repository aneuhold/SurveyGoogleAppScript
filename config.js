/**
* Any extra questions to show for each student on the final grades output.
* Numbered starting from 0, and ending on the last one that should be included.
* So the `end` value is inclusive.
* */
const questionsToShowOnOutput = {
  start: 0,
  end: 0,
};

const teamQuestionTitle = 'Please choose your team name';

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
