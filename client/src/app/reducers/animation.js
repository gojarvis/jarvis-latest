// change this
import { INIT, MOVE_LEFT, MOVE_RIGHT } from '../actions/animation'

const SHOW = {
  opacity: 1
};

const HIDE = {
  opacity: 0
};

const DEFAULT_STATE = {
  listStyles: {
    social: {...HIDE},
    files: {...SHOW},
    urls: {...HIDE},
  },
  selectedIndex: 1,
}

export default function animation(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case INIT:
      return DEFAULT_STATE
    case MOVE_LEFT:
      return {
        ...state,
        selectedIndex: Math.abs((state.selectedIndex - 1) % 3),
      }
    case MOVE_RIGHT:
      return {
        ...state,
        selectedIndex: Math.abs((state.selectedIndex + 1) % 3),
      }
    default:
      return state
  }
}
