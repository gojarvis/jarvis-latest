const FB = {
  base: { display: "flex" },
  direction: {
    row: { flexDirection: "row" },
    column: { flexDirection: "column" }
  },
  align: {
    center: { alignItems: 'center' },
    start: { alignItems: 'flex-start' },
    end: { alignItems: 'flex-end' },
    stretch: { alignItems: 'stretch' },
  },
  justify: {
    start: { justifyContent: "flex-start" },
    end: { justifyContent: "flex-end" },
    center: { justifyContent: "center" },
    between: { justifyContent: "space-between" },
    around: { justifyContent: "space-around" },
  },
  flex: {
    equal: { flex: '1' },
  }
}

export default FB;
