import { combineReducers } from 'redux';
import orderBookReducer from './orderBookReducer';

const rootReducer = combineReducers({
    orderBook: orderBookReducer,
});

export default rootReducer;