'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createEvent$ = exports.createEvent$ = function createEvent$() {
  var eventQueue = [];
  var resolveQueue = [];

  var put = function put(event) {
    if (resolveQueue.length) {
      var next = resolveQueue.shift();
      next(event);
    } else {
      eventQueue.push(event);
    }
  };

  var take = function take() {
    if (eventQueue.length) {
      return Promise.resolve(eventQueue.shift());
    } else {
      return new Promise(function (resolve) {
        return resolveQueue.push(resolve);
      });
    }
  };

  return { take: take, put: put };
};

var createSocketEvent$ = exports.createSocketEvent$ = function createSocketEvent$(socket) {
  var listenError = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var socketEvent$ = createEvent$();

  socket.onOpen(function () {
    return socketEvent$.put({
      type: socket.endPoint + '/STATUS',
      payload: {
        status: 'OPEN',
        connected: socket.isConnected()
      }
    });
  });

  socket.onClose(function () {
    return socketEvent$.put({
      type: socket.endPoint + '/STATUS',
      payload: {
        status: 'CLOSED',
        connected: socket.isConnected()
      }
    });
  });

  if (listenError) socket.onError(function () {
    return socketEvent$.put({
      type: socket.endPoint + '/STATUS',
      payload: {
        status: 'ERROR',
        connected: socket.isConnected()
      }
    });
  });

  return socketEvent$;
};

var createPushEvent$ = exports.createPushEvent$ = function createPushEvent$(push) {
  var pushEvent$ = createEvent$();

  push.receive('ok', function (response) {
    return pushEvent$.put({
      type: push.channel.topic + '/' + push.event,
      payload: {
        status: 'OK',
        response: response
      }
    });
  });

  push.receive('error', function (response) {
    return pushEvent$.put({
      type: push.channel.topic + '/' + push.event,
      payload: {
        status: 'ERROR',
        response: response
      }
    });
  });

  push.receive('timeout', function () {
    return pushEvent$.put({
      type: push.channel.topic + '/' + push.event,
      payload: {
        status: 'TIMEOUT',
        response: 'Networking issue. Still waiting...'
      }
    });
  });

  return pushEvent$;
};

var createChannelEvent$ = exports.createChannelEvent$ = function createChannelEvent$(channel, event) {
  var channelEvent$ = createEvent$();

  channel.on(event, function (response) {
    return channelEvent$.put({
      type: channel.topic + '/' + event,
      payload: response
    });
  });

  channel.onError(function (response) {
    return channelEvent$.put({
      type: channel.topic + '/STATUS',
      payload: {
        status: 'ERROR',
        response: response
      }
    });
  });

  channel.onClose(function () {
    return channelEvent$.put({
      type: channel.topic + '/STATUS',
      payload: {
        status: 'CLOSE',
        response: 'The channel has gone away gracefully'
      }
    });
  });

  return channelEvent$;
};

exports.default = {
  createEvent$: createEvent$,
  createSocketEvent$: createSocketEvent$,
  createPushEvent$: createPushEvent$,
  createChannelEvent$: createChannelEvent$
};
