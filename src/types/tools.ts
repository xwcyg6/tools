import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * 工具类型接口
 */
export interface Tool {
  /** 工具唯一代码 */
  code: string;
  /** 工具图标 */
  icon: IconDefinition;
  /** 工具标题 - 可选，现在使用多语言文件 */
  title?: string;
  /** 工具所属分类 */
  category: string[];
  /** 工具描述 - 可选，现在使用多语言文件 */
  description?: string;
  /** 搜索关键词，包括各种可能的中英文搜索词 */
  keywords: string[];
}

/**
 * 分类类型接口
 */
export interface Category {
  /** 分类唯一代码 */
  code: string;
  /** 分类名称 - 可选，现在使用多语言文件 */
  name?: string;
  /** 是否激活 */
  active?: boolean;
} 