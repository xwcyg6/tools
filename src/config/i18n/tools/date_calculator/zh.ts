export const dateCalculatorZh = {
  title: '日期计算器',
  description: '计算两个日期之间的差值或给日期添加/减去指定时间',
  mode: {
    diff: '日期差值计算',
    add: '日期加减计算'
  },
  diff_calculator: {
    title: '计算两个日期之间的差值',
    start_date: '开始日期:',
    end_date: '结束日期:',
    current: '当前',
    swap_dates: '交换日期',
    result_title: '计算结果:',
    years: '年份:',
    months: '月份:',
    weeks: '周数:',
    days: '天数:',
    hours: '小时:',
    minutes: '分钟:',
    seconds: '秒数:',
    year_unit: '年',
    month_unit: '月',
    week_unit: '周',
    day_unit: '天',
    hour_unit: '小时',
    minute_unit: '分钟',
    second_unit: '秒',
    no_valid_dates: '请选择有效的开始和结束日期'
  },
  add_calculator: {
    title: '日期加减计算',
    base_date: '基准日期:',
    operation: '选择操作:',
    add: '添加',
    subtract: '减去',
    time_amount: '时间量:',
    time_unit: '时间单位:',
    result_title: '计算结果:',
    add_result: '添加 {amount} {unit} 后的日期是:',
    subtract_result: '减去 {amount} {unit} 后的日期是:',
    copied: '已复制',
    copy_result: '复制结果',
    no_valid_input: '请选择有效的基准日期和时间量',
    notes_title: '注意事项:',
    note1: '月份和年份的加减可能受到不同月份天数的影响',
    note2: '计算会自动处理闰年和闰月',
    note3: '结果已考虑夏令时影响（如果适用）'
  },
  error: {
    calculation_error: '日期计算错误',
    copy_failed: '复制失败'
  }
};

export default dateCalculatorZh; 