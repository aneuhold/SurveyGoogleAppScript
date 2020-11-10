/**
* Documentation for the different types:
*
* Form: https://developers.google.com/apps-script/reference/forms/form
* FormResponse: https://developers.google.com/apps-script/reference/forms/form-response
* Range: https://developers.google.com/apps-script/reference/spreadsheet/range
* StudentsObj: {
*   asuRiteId: StudentObj,
*   asuRiteId2: StudentObj,
*   ... 
* }
* StudentObj: {
*   fullName: 'Full Name',
*   asuId: 'asuRiteID',
*   groupName: 'groupName',
*   completedSurvey: true,
*   peerGrades: string[][],
*   otherAnswers: string[],
* }
**/

/**
* Requirements:
* 1. Team name added to sheet for each student
* 2. Some kind of indication of the people that haven't filled out the sheet yet
* 3. Comments about individual students are joined into one location
*
* Requirements 1, 2, and 3 above likely will need some kind of data structure that matches the students
* completing the survey and the students on the original teams sheet. First objective would likely be
* pairing those two together somehow. Fuzzy matching names? 
**/
