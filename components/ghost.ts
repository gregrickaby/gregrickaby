/**
 * The site's lost ghost, one string per row of pixels: `x` is its outline,
 * `#` its sheet, `o` its eyes, `b` its blush, and a space is empty. The 404
 * page and the gamepad post's demos draw it.
 */
export const GHOST = [
  '     xxxxxx     ',
  '   xx######xx   ',
  '  x##########x  ',
  ' x############x ',
  ' x############x ',
  'x###oo####oo###x',
  'x###oo####oo###x',
  'x##############x',
  'x#bb########bb#x',
  'x##############x',
  'x##############x',
  'x##############x',
  'x##############x',
  'x##xx##xx##xx##x',
  ' xx  xx  xx  xx ',
] as const
