/**
 * List of cohorts for which the date should not be displayed.
 * Any cohort name that appears in this array will be excluded from date display.
 */
const excludedCohortsForDateDisplay: string[] = ["à venir", "CLE 2025"];

/**
 * Determines whether the date should be displayed based on the cohort name.
 * If the cohort name is included in the `excludedCohortsForDateDisplay` list,
 * the function will return `false`, meaning the date should not be displayed.
 *
 * @param {string} cohortName - The name of the cohort for which to check the display rule.
 * @returns {boolean} - Returns `true` if the date should be displayed, otherwise `false`.
 */
const shouldDisplayDateByCohortName = (cohortName: string): boolean => {
  return !excludedCohortsForDateDisplay.includes(cohortName);
};

export { excludedCohortsForDateDisplay, shouldDisplayDateByCohortName };