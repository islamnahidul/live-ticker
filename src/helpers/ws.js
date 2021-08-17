import _ from 'lodash';

const conf = {
  wshost: 'wss://api-pub.bitfinex.com/ws/2',
};

let orderBook = {};
let channels = {};
let connected = false;
let connecting = false;
let seq = null;
let cli;

function wsconnect({ saveOrderBook, setConnectionStatus, connectionStatus }) {
  if (!connecting && !connected)
    cli = new WebSocket(conf.wshost, 'protocolOne');
  if (!connectionStatus) {
    cli.close();
    return;
  }
  if (connecting || connected) return;
  connecting = true;

  cli.onopen = function open() {
    console.log('socket opened');
    connecting = false;
    connected = true;
    setConnectionStatus(true);
    orderBook.bids = {};
    orderBook.asks = {};
    orderBook.psnap = {};
    orderBook.mcount = 0;
    cli.send(
      JSON.stringify({
        event: 'subscribe',
        channel: 'book',
        symbol: 'tBTCUSD',
      }),
    );
  };

  cli.onclose = function open() {
    seq = null;
    console.log('socket closed');
    connecting = false;
    connected = false;
    setConnectionStatus(false);
  };

  cli.onmessage = function (me) {
    var message = me.data;
    message = JSON.parse(message);
    if (orderBook.mcount === 0) {
      _.each(message[1], function (pp) {
        if (pp) {
          pp = { price: pp[0], count: pp[1], amount: pp[2] };
          let side = pp.amount >= 0 ? 'bids' : 'asks';
          pp.amount = Math.abs(pp.amount);

          orderBook[side][pp.price] = pp;
        }
      });
    } else {
      const row = message[1];
      if (row) {
        let pp = {
          price: +row[0],
          count: +row[1],
          amount: +row[2],
        };

        if (!pp.count) {
          let found = true;

          if (pp.amount > 0) {
            if (orderBook['bids'][pp.price]) {
              delete orderBook['bids'][pp.price];
            } else {
              found = false;
            }
          } else if (pp.amount < 0) {
            if (orderBook['asks'][pp.price]) {
              delete orderBook['asks'][pp.price];
            } else {
              found = false;
            }
          }
        } else {
          let side = pp.amount >= 0 ? 'bids' : 'asks';
          pp.amount = Math.abs(pp.amount);
          orderBook[side][pp.price] = pp;
        }
      }
    }

    _.each(['bids', 'asks'], function (side) {
      let sorderBook = orderBook[side];
      let bprices = Object.keys(sorderBook);

      let prices = bprices.sort(function (a, b) {
        if (side === 'bids') {
          return +a >= +b ? -1 : 1;
        } else {
          return +a <= +b ? -1 : 1;
        }
      });

      orderBook.psnap[side] = prices;
    });

    orderBook.mcount++;
    saveOrderBook(orderBook);
  };
}

export { connected, wsconnect };
