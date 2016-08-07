const FB = {
  base: { display: "flex" },
  direction: {
    row: { flexDirection: "row" },
    column: { flexDirection: "column" }
  },
  align: {
    center: { alignItems: 'center' },
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
