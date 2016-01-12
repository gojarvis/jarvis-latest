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
    },
  },
  Card: {
    '.card': {
      fontFamily: 'Montserrat',
      fontWeight: 400,
      boxShadow: `1px 2px 9px rgba(0,0,0,0.5)`,
      opacity: `1`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      margin: 10
    },
    '.card.file': {
      backgroundColor: COLORS.FILE,
    },
    '.card.url': {
      backgroundColor: COLORS.URL,
    },
    '.title': {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      fontSize: 22,
      borderBottom: '1px solid black',
      maxWidth: '100%'
    },
    '.title-pad': {
      padding: 10
    },
    '.content': {
      overflow: 'hidden',
      width: '100%'
    },
    '.padded-table': {
      margin: 10
    }
  }
}

export default { STYLES, COLORS }
