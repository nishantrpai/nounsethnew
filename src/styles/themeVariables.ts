import theme from "../../theme.json";


export const themeVariables = {
  ...theme,
  // Remove background image
};



export const hexToRgba = (hex: string, alpha: any) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};