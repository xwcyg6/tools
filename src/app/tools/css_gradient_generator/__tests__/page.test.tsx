import { render, screen, fireEvent } from '@testing-library/react';
import CssGradientGenerator from '../page';

// 模拟 FontAwesomeIcon 组件，因为它可能在测试环境中无法正确加载
jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />
}));

describe('CSS渐变生成器', () => {
  test('渲染所有主要组件', () => {
    render(<CssGradientGenerator />);
    
    // 检查标题是否正确显示
    expect(screen.getByText('CSS渐变生成器')).toBeInTheDocument();
    
    // 检查所有主要控制按钮是否存在
    expect(screen.getByText('线性渐变')).toBeInTheDocument();
    expect(screen.getByText('径向渐变')).toBeInTheDocument();
    
    // 检查渐变预览是否存在
    expect(screen.getByText('渐变预览')).toBeInTheDocument();
    
    // 检查颜色停止点编辑区是否存在
    expect(screen.getByText('颜色停止点')).toBeInTheDocument();
    expect(screen.getByText('添加色标')).toBeInTheDocument();
    
    // 检查CSS代码区是否存在
    expect(screen.getByText('CSS代码')).toBeInTheDocument();
    expect(screen.getByText('复制')).toBeInTheDocument();
  });
  
  test('切换渐变类型', () => {
    render(<CssGradientGenerator />);
    
    // 初始应该是线性渐变
    expect(screen.getByText('渐变方向')).toBeInTheDocument();
    
    // 切换到径向渐变
    fireEvent.click(screen.getByText('径向渐变'));
    
    // 应该显示径向渐变的选项
    expect(screen.getByText('渐变形状与位置')).toBeInTheDocument();
    expect(screen.getByText('形状:')).toBeInTheDocument();
    expect(screen.getByText('圆形')).toBeInTheDocument();
    expect(screen.getByText('椭圆')).toBeInTheDocument();
    expect(screen.getByText('位置:')).toBeInTheDocument();
  });
  
  test('添加和删除颜色停止点', () => {
    render(<CssGradientGenerator />);
    
    // 初始应该有2个颜色输入
    const initialColorInputs = screen.getAllByRole('textbox');
    expect(initialColorInputs.length).toBe(2);
    
    // 添加一个新的颜色停止点
    fireEvent.click(screen.getByText('添加色标'));
    
    // 现在应该有3个颜色输入
    const updatedColorInputs = screen.getAllByRole('textbox');
    expect(updatedColorInputs.length).toBe(3);
  });
}); 