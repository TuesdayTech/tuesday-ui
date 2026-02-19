export const fontFamily = {
  sans: ['GeistSans'],
  mono: ['GeistMono'],
} as const;

export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const fontSize = {
  caption: ['12px', { lineHeight: '16px' }],
  footnote: ['13px', { lineHeight: '18px' }],
  subheadline: ['14px', { lineHeight: '20px' }],
  body: ['16px', { lineHeight: '24px' }],
  callout: ['18px', { lineHeight: '26px' }],
  title3: ['20px', { lineHeight: '28px' }],
  title2: ['24px', { lineHeight: '32px' }],
  title1: ['28px', { lineHeight: '36px' }],
  largeTitle: ['34px', { lineHeight: '42px' }],
  display: ['48px', { lineHeight: '56px' }],
} as const;
