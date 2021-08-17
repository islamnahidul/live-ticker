import React from 'react';
import { Provider } from 'react-redux';
import configureStore from './redux/store';
import OrderBook from './components/orderBook';
import './App.scss';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <div className="container">
        <OrderBook />
      </div>
    </Provider>
  );
}

export default App;
