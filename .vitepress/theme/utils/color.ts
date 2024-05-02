import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb
} from '@material/material-color-utilities'
import { mixBlack, mixWhite } from '@wojtekmaj/color-utils'
import type { ThemeInstance } from 'vuetify'
import { useTheme } from 'vuetify'

export const generateColors = (
  _color: string,
  mode: 'light' | 'dark',
  theme: ThemeInstance
) => {
  const { schemes } = themeFromSourceColor(argbFromHex(_color))

  const isDark = mode === 'dark'

  const color = schemes[mode]

  const naivte: { [key: string]: string } = Object.entries(
    color.toJSON()
  ).reduce<{ [key: string]: string }>((accumulator, [key, value]) => {
    accumulator[key] = hexFromArgb(value)

    return accumulator
  }, {})

  const vuetify = {
    background: hexFromArgb(color.background),
    surface: hexFromArgb(color.surface),
    primary: hexFromArgb(color.primary),
    secondary: hexFromArgb(color.secondary),
    success: theme.themes.value[mode].colors.success,
    warning: theme.themes.value[mode].colors.warning,
    error: hexFromArgb(color.error),
    info: theme.themes.value[mode].colors.info,
    'on-background': hexFromArgb(color.onBackground),
    'on-surface': hexFromArgb(color.onSurface),
    'on-primary': hexFromArgb(color.onPrimary),
    'on-secondary': hexFromArgb(color.onSecondary),
    'on-success': theme.themes.value[mode].colors['on-success'],
    'on-warning': theme.themes.value[mode].colors['on-warning'],
    'on-error': hexFromArgb(color.onError),
    'on-info': theme.themes.value[mode].colors['on-info']
  }

  const custom = {
    MDYBackground: isDark
      ? mixBlack(naivte.primary, 0.25)
      : mixWhite(naivte.primary, 0.1)
  }

  return {
    ...vuetify,
    ...naivte,
    ...custom
  }
}

export const applyTheme = (color: string, theme: ThemeInstance) => {
  theme.themes.value.light.colors = generateColors(color, 'light', theme)
  theme.themes.value.dark.colors = generateColors(color, 'dark', theme)
}
