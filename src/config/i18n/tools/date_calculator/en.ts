export const dateCalculatorEn = {
  title: 'Date Calculator',
  description: 'Calculate the difference between two dates or add/subtract time from a date',
  mode: {
    diff: 'Date Difference',
    add: 'Date Addition/Subtraction'
  },
  diff_calculator: {
    title: 'Calculate the difference between two dates',
    start_date: 'Start Date:',
    end_date: 'End Date:',
    current: 'Current',
    swap_dates: 'Swap Dates',
    result_title: 'Calculation Result:',
    years: 'Years:',
    months: 'Months:',
    weeks: 'Weeks:',
    days: 'Days:',
    hours: 'Hours:',
    minutes: 'Minutes:',
    seconds: 'Seconds:',
    year_unit: 'years',
    month_unit: 'months',
    week_unit: 'weeks',
    day_unit: 'days',
    hour_unit: 'hours',
    minute_unit: 'minutes',
    second_unit: 'seconds',
    no_valid_dates: 'Please select valid start and end dates'
  },
  add_calculator: {
    title: 'Date Addition/Subtraction',
    base_date: 'Base Date:',
    operation: 'Select Operation:',
    add: 'Add',
    subtract: 'Subtract',
    time_amount: 'Time Amount:',
    time_unit: 'Time Unit:',
    result_title: 'Calculation Result:',
    add_result: 'Date after adding {amount} {unit}:',
    subtract_result: 'Date after subtracting {amount} {unit}:',
    copied: 'Copied',
    copy_result: 'Copy Result',
    no_valid_input: 'Please select a valid base date and time amount',
    notes_title: 'Notes:',
    note1: 'Adding/subtracting months and years may be affected by different month lengths',
    note2: 'Calculations automatically handle leap years and leap months',
    note3: 'Results account for daylight saving time (if applicable)'
  },
  error: {
    calculation_error: 'Date calculation error',
    copy_failed: 'Copy failed'
  }
};

export default dateCalculatorEn; 