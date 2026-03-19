// 定义样式对象
const styles = {
  card: "card p-6 h-full flex flex-col transition-all duration-300 w-full",
  input: "search-input w-full",
  textArea: "w-full h-48 p-3 bg-block border border-purple-glow rounded-lg text-primary focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple resize-y",
  container: "min-h-screen flex flex-col max-w-[1440px] mx-auto p-4 md:p-6 pb-16",
  grid: "grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow",
  tabButton: (active: boolean) => `px-4 py-2 text-sm font-medium ${active ? 'text-purple border-b-2 border-purple' : 'text-tertiary hover:text-secondary'}`,
  methodButton: (active: boolean) => `px-3 py-1 text-xs rounded-md ${active ? 'bg-purple-glow/20 text-purple' : 'bg-block-strong text-secondary'}`,
  responseHeader: "flex items-center justify-between bg-block-strong p-3 rounded-t-lg",
  statusBadge: (status: number) => {
    if (status >= 200 && status < 300) return "px-2 py-1 bg-green-900/20 text-success text-xs rounded-md";
    if (status >= 300 && status < 400) return "px-2 py-1 bg-blue-900/20 text-blue-500 text-xs rounded-md";
    if (status >= 400 && status < 500) return "px-2 py-1 bg-yellow-900/20 text-warning text-xs rounded-md";
    return "px-2 py-1 bg-red-900/20 text-error text-xs rounded-md";
  },
  responseBox: "bg-block p-3 border border-purple-glow rounded-lg font-mono text-sm text-primary overflow-auto min-h-[400px] flex-grow whitespace-pre-wrap w-full",
  historyItem: "flex items-center justify-between p-2 hover:bg-block-hover rounded-md cursor-pointer",
  historyMethod: (method: string) => {
    const colors: Record<string, string> = {
      GET: "bg-green-900/20 text-success",
      POST: "bg-blue-900/20 text-blue-500",
      PUT: "bg-yellow-900/20 text-warning",
      DELETE: "bg-red-900/20 text-error",
      PATCH: "bg-purple-900/20 text-purple",
      default: "bg-block-strong text-secondary"
    };
    return `px-2 py-1 text-xs rounded-md ${colors[method] || colors.default}`;
  },
  formHeader: "mb-4 flex items-center justify-between",
  headerRow: "flex items-center gap-2 mb-2",
  errorBox: "p-3 bg-red-900/20 border border-red-700/30 text-error rounded-lg mb-4",
  iconButton: "p-1 text-secondary hover:text-primary",
  copyButton: "flex items-center gap-1 text-xs px-2 py-1 rounded bg-block-strong hover:bg-block-hover text-secondary transition-colors",
  statsText: "text-xs text-tertiary",
};

export default styles; 