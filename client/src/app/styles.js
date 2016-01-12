const COLORS = {
  FILE        : '#49DCB1',
  URL         : '#2FD1E2',
  TEXT_DARK   : '#3C3F42',
  TEXT_LIGHT  : '#EFF2EF',
}

const STYLES = {
  Main: {
    body: {
      margin: 0,
      fontFamily: 'Montserrat',
      lineHeight: '20px',
      fontSize: 13
    },
    a: {
      color: COLORS.TEXT_LIGHT,
      ':visited': {
        color: COLORS.TEXT_DARK
      }
    }
  }
}

export default { STYLES, COLORS }