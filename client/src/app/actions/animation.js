export const INCREMENT_COUNTER = 'INCREMENT_COUNTER'
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER'
export const INIT = 'INIT'
export const MOVE_LEFT = 'MOVE_LEFT'
export const MOVE_RIGHT = 'MOVE_RIGHT'

export function init() {
  return {
    type: INIT
  }
}
export function increment() {
  return {
    type: INCREMENT_COUNTER
  }
}

export function decrement() {
  return {
    type: DECREMENT_COUNTER
  }
}

export function moveLeft() {
  return {
    type: MOVE_LEFT
  }
}

export function moveRight() {
  return {
    type: MOVE_RIGHT
  }
}

export function incrementIfOdd() {
  return (dispatch, getState) => {
    const { counter } = getState()

    if (counter % 2 === 0) {
      return
    }

    dispatch(increment())
  }
}

export function incrementAsync(delay = 1000) {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment())
    }, delay)
  }
}
