const isLittleScreen = window.outerWidth <= 480;
const isSmallScreen = window.outerWidth > 480 && window.outerWidth <= 800;
const isMiddleScreen = window.outerWidth > 800 && window.outerWidth <= 1024;
const isBigScreen = window.outerWidth > 1024 && window.outerWidth <= 1200;
const isHugeScreen = window.outerWidth > 1200;

export const screen = {
  isLittleScreen,
  isSmallScreen,
  isMiddleScreen,
  isBigScreen,
  isHugeScreen,
};
