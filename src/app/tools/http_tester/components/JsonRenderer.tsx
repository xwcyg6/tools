import React from 'react';

interface JsonRendererProps {
  data: unknown;
}

/**
 * JSON格式化和语法高亮组件
 */
const JsonRenderer: React.FC<JsonRendererProps> = ({ data }) => {
  // 递归渲染JSON对象
  const renderJsonValue = (value: unknown, depth = 0, isLast = true): React.ReactNode => {
    const indent = Array(depth * 2).fill(' ').join('');
    
    // 处理不同类型的值
    if (value === null) return <span className="text-error">null</span>;
    if (value === undefined) return <span className="text-tertiary">undefined</span>;
    
    if (typeof value === 'boolean') {
      return <span className="text-warning">{value.toString()}</span>;
    }
    
    if (typeof value === 'number') {
      return <span className="text-success">{value}</span>;
    }
    
    if (typeof value === 'string') {
      return <span className="text-primary-light">&quot;{value}&quot;</span>;
    }
    
    // 处理数组
    if (Array.isArray(value)) {
      if (value.length === 0) return <span>[]</span>;
      
      return (
        <span>
          <span>[</span>
          <div style={{ paddingLeft: '20px' }}>
            {value.map((item, index) => (
              <div key={index}>
                {renderJsonValue(item, depth + 1, index === value.length - 1)}
                {index !== value.length - 1 && <span className="text-tertiary">,</span>}
              </div>
            ))}
          </div>
          <span>{indent}]</span>
          {!isLast && <span className="text-tertiary">,</span>}
        </span>
      );
    }
    
    // 处理对象
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return <span>{'{}'}</span>;
      
      return (
        <span>
          <span>{'{'}</span>
          <div style={{ paddingLeft: '20px' }}>
            {entries.map(([key, val], index) => (
              <div key={key}>
                <span className="text-purple">&quot;{key}&quot;</span>
                <span className="text-tertiary">: </span>
                {renderJsonValue(val, depth + 1, index === entries.length - 1)}
                {index !== entries.length - 1 && <span className="text-tertiary">,</span>}
              </div>
            ))}
          </div>
          <span>{indent}{'}'}</span>
          {!isLast && <span className="text-tertiary">,</span>}
        </span>
      );
    }
    
    return <span>{String(value)}</span>;
  };
  
  // 解析JSON字符串 (如果传入的是字符串)
  const parseAndRender = () => {
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        return renderJsonValue(parsedData);
      }
      return renderJsonValue(data);
    } catch {
      return <span className="text-error">无效的JSON: {String(data)}</span>;
    }
  };
  
  return (
    <div className="font-mono text-sm overflow-x-auto">
      {parseAndRender()}
    </div>
  );
};

export default JsonRenderer; 