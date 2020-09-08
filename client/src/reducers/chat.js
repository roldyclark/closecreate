import { GET_CHAT, CHAT_ERROR } from '../actions/types'

const initialState = {
  chat: {
    users: [],
    messages: []
  },
  loading: true,
  error: {}
}

export default function (state = initialState, action) {
  const { type, payload } = action

  switch (type) {
    case GET_CHAT:
      return {
        ...state,
        chat: payload,
        loading: false
      }
    case CHAT_ERROR:
      return {
        ...state,
        error: payload,
        loading: false,
        chat: {
          users: [],
          messages: []
        }
      }
    default:
      return state
  }
}
