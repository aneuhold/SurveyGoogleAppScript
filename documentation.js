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
* */

/**
 * Backlog as of 11/9/2020:
 *
 * - Maybe ask the group before the name and then have the select of asurite in
 * the group section with only the group members to select from
 * - Include a thing that says “yes” you gotta evaluate yourself
 * - Switch the ABC grade to percentages, so let students choose ABC etc but
 * then map it to 100, 97 etc so the mean can be calculated easily and I can
 * use that easily in my grading sheets
 */
