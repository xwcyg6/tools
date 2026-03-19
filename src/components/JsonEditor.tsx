'use client';

import { useEffect, useRef } from 'react';
import { createJSONEditor } from 'vanilla-jsoneditor';
import type { JSONEditorPropsOptional } from 'vanilla-jsoneditor';

interface JsonEditorProps extends JSONEditorPropsOptional {
  className?: string;
}

const JsonEditor = (props: JsonEditorProps) => {
  const { className, ...editorProps } = props;
  const refContainer = useRef<HTMLDivElement>(null);
  const refEditor = useRef<ReturnType<typeof createJSONEditor> | null>(null);

  useEffect(() => {
    // 确保只在客户端渲染
    if (typeof window !== 'undefined' && refContainer.current && !refEditor.current) {
      // 创建编辑器
      refEditor.current = createJSONEditor({
        target: refContainer.current,
        props: editorProps
      });
    }

    return () => {
      // 销毁编辑器
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  // 更新props
  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(editorProps);
    }
  }, [editorProps]);

  return <div ref={refContainer} className={className}></div>;
};

export default JsonEditor; 