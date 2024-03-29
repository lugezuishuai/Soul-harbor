const isLittleScreen = window.outerWidth <= 480;
const isSmallScreen = window.outerWidth > 480 && window.outerWidth <= 760;
const isMiddleScreen = window.outerWidth > 760 && window.outerWidth <= 1024;
const isBigScreen = window.outerWidth > 1024 && window.outerWidth <= 1200;
const isHugeScreen = window.outerWidth > 1200;
const isMobile = window.outerWidth < 1024;

export const screen = {
  isLittleScreen,
  isSmallScreen,
  isMiddleScreen,
  isBigScreen,
  isHugeScreen,
  isMobile,
};
