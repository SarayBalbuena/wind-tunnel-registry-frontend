export const entryFieldStyles = {
  borderRadius: 'xl',
  bg: 'surface.card',
  borderColor: 'surface.border',
  _hover: {
    borderColor: 'blue.300',
  },
  _focusVisible: {
    borderColor: 'blue.500',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.22)',
  },
  _dark: {
    _hover: {
      borderColor: 'blue.400',
    },
    _focusVisible: {
      borderColor: 'blue.300',
      boxShadow: '0 0 0 3px rgba(96, 165, 250, 0.22)',
    },
  },
};

export const entrySelectContentStyles = {
  borderRadius: 'xl',
  bg: 'surface.card',
  border: '1px solid',
  borderColor: 'surface.border',
  boxShadow: 'lg',
};

export const entryDialogBackdropStyles = {
  bg: 'rgba(11, 13, 18, 0.6)',
  backdropFilter: 'blur(6px)',
};

export const entryDialogContentStyles = {
  maxW: 'lg',
  w: 'full',
  overflow: 'hidden',
  borderRadius: 'card',
  bg: 'surface.card',
  borderColor: 'surface.border',
  boxShadow: '0 24px 64px rgba(15, 23, 42, 0.22)',
  // Colored accent stripe along the top edge
  _before: {
    content: '""',
    display: 'block',
    h: '4px',
    bgGradient: 'to-r',
    gradientFrom: 'blue.500',
    gradientVia: 'purple.500',
    gradientTo: 'teal.400',
  },
  _dark: {
    bg: 'surface.card',
    borderColor: 'surface.border',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6)',
  },
};

export const entryDialogHeaderStyles = {
  borderColor: 'surface.border',
  _dark: { borderColor: 'surface.border' },
};

export const entryDialogFooterStyles = {
  borderColor: 'surface.border',
  _dark: { borderColor: 'surface.border' },
};

export const entryDialogCancelButtonStyles = {
  borderColor: 'surface.border',
  _hover: { bg: 'bg.muted', borderColor: 'blue.300' },
  _dark: {
    borderColor: 'surface.border',
    _hover: { bg: 'bg.muted', borderColor: 'blue.400' },
  },
};

export const entryDialogSubmitButtonStyles = {
  bg: 'blue.600',
  color: 'white',
  borderColor: 'blue.600',
  _hover: { bg: 'blue.700' },
  _active: { bg: 'blue.800' },
  _dark: {
    bg: 'blue.500',
    color: 'white',
    borderColor: 'blue.500',
    _hover: { bg: 'blue.400' },
    _active: { bg: 'blue.600' },
  },
};
