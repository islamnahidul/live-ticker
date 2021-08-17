import React, { useEffect, useState, useCallback } from 'react';
import { wsconnect } from '../helpers/ws';
import { connect } from 'react-redux';
import * as Actions from '../redux/actions/orderBookAction';
import { throttle } from 'lodash';
import formatNumber from '../helpers/formatter';
import './orderBook.scss';

const OrderBook = (props) => {
  const { book } = props;
  const { bids, asks } = book;

  const saveOrderBook = useCallback(
    throttle((b) => props.dispatch(Actions.saveBook(b)), 500),
  );

  const [connectionStatus, setConnectionStatus] = useState(true);

  useEffect(() => {
    wsconnect({ saveOrderBook, setConnectionStatus, connectionStatus });
  }, [connectionStatus]);

  const _asks =
    asks &&
    Object.keys(asks)
      .slice(0, 25)
      .reduce((acc, k, i) => {
        const total = Object.keys(asks)
          .slice(0, i + 1)
          .reduce((t, i) => {
            t = t + asks[i].amount;
            return t;
          }, 0);
        const item = asks[k];
        acc[k] = { ...item, total };
        return acc;
      }, {});
  const maxAsksTotal = Object.keys(_asks).reduce((t, i) => {
    if (t < _asks[i].total) {
      return _asks[i].total;
    } else {
      return t;
    }
  }, 0);
  const _bids =
    bids &&
    Object.keys(bids)
      .slice(0, 25)
      .reduce((acc, k, i) => {
        const total = Object.keys(bids)
          .slice(0, i + 1)
          .reduce((t, i) => {
            t = t + bids[i].amount;
            return t;
          }, 0);
        const item = bids[k];
        acc[k] = { ...item, total };
        return acc;
      }, {});
  const maxBidsTotal = Object.keys(_bids).reduce((t, i) => {
    if (t < _bids[i].total) {
      return _bids[i].total;
    } else {
      return t;
    }
  }, 0);

  return (
    <div>
      <div className="panel">
        <div className="bar">
          <h3>
            ORDER BOOK <span>BTC/USD</span>
          </h3>
        </div>
        <div className="sides">
          <table className="side">
            <thead>
              <tr className="row">
                <td className="col count">Count</td>
                <td className="col">Amount</td>
                <td className="col total">Total</td>
                <td className="col">Price</td>
              </tr>
            </thead>
            <tbody>
              {_bids &&
                Object.keys(_bids).map((k, i) => {
                  const item = _bids[k];
                  const { count, amount, price, total } = item;
                  const percentage = (total * 100) / maxBidsTotal;
                  return (
                    <tr
                      className="row"
                      key={`order-book-key-${count}${amount}${price}${total}`}
                      style={{
                        backgroundImage: `linear-gradient(to left, #163F3E ${percentage}%, #1B262D 0%)`,
                      }}
                    >
                      <td className="col count">{count}</td>
                      <td className="col">{amount.toFixed(4)}</td>
                      <td className="col total">{total.toFixed(4)}</td>
                      <td className="col">{formatNumber(price.toFixed(0))}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <table className="side">
            <thead>
              <tr className="row">
                <td className="col">Price</td>
                <td className="col total">Total</td>
                <td className="col">Amount</td>
                <td className="col count">Count</td>
              </tr>
            </thead>
            <tbody>
              {_asks &&
                Object.keys(_asks).map((k, i) => {
                  const item = _asks[k];
                  const { count, amount, price, total } = item;
                  const percentage = (total * 100) / maxAsksTotal;
                  return (
                    <tr
                      className="row"
                      key={`order-book-key2-${count}${amount}${price}${total}`}
                      style={{
                        backgroundImage: `linear-gradient(to right, #462F36 ${percentage}%, #1B262D 0%)`,
                      }}
                    >
                      <td className="col">{formatNumber(price.toFixed(0))}</td>
                      <td className="col total">{total.toFixed(4)}</td>
                      <td className="col">{amount.toFixed(4)}</td>
                      <td className="col count">{count}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default connect((s) => ({ book: s.orderBook }))(OrderBook);
