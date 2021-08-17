

import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import reduxThunk from 'redux-thunk'
import rootReducer from './reducers/index.js';

const middleware = [ reduxThunk ];

const configureStore = () => {

  
  const store = createStore(
    rootReducer,
      {},
      compose(
        applyMiddleware(...middleware)
      )
  )

  return store
}

export default configureStore

