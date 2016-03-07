export const createEvent$ = () => {
  const eventQueue = []
  const resolveQueue = []

  const put = (event) => {
    if (resolveQueue.length) {
      const next = resolveQueue.shift()
      next(event)
    } else {
      eventQueue.push(event)
    }
  }

  const take = () => {
    if (eventQueue.length) {
      return Promise.resolve(eventQueue.shift())
    } else {
      return new Promise(resolve => resolveQueue.push(resolve))
    }
  }

  return {take, put}
}

export const createSocketEvent$ = (socket, listenError=false) => {
  const socketEvent$ = createEvent$()

  socket.onOpen(() => socketEvent$.put({
    type: `${socket.endPoint}/OPEN`,
    connected: socket.isConnected(),
    payload: socket.endPoint
  }))

  socket.onClose(response => socketEvent$.put({
    type: `${socket.endPoint}/CLOSE`,
    connected: socket.isConnected(),
    payload: response
  }))

  if (listenError)
    socket.onError(response => socketEvent$.put({
      type: `${socket.endPoint}/ERROR`,
      connected: socket.isConnected(),
      payload: response
    }))

  return socketEvent$
}

export const createPushEvent$ = (push) => {
  const pushEvent$ = createEvent$()

  push.receive('ok', response => pushEvent$.put({
      type: `${push.channel.topic}/${push.event}`,
      payload: response
  })).receive('error', response => pushEvent$.put({
      type: `${push.channel.topic}/${push.event}`,
      payload: response
  })).receive('timeout', () => pushEvent$.put({
      type: `${push.channel.topic}/${push.event}`,
      payload: 'Networking issue. Still waiting...'
  }))

  return pushEvent$
}

export const createChannelEvent$ = (channel, event) => {
  const channelEvent$ = createEvent$()

  channel.on(event, response => channelEvent$.put({
    type: `${channel.topic}/${event}`,
    payload: response
  }))

  channel.onError(response => channelEvent$.put({
    type: `${channel.topic}/ERROR`,
    payload: response
  }))

  channel.onClose(() => channelEvent$.put({
    type: `${channel.topic}/CLOSE`,
    payload: 'The channel has gone away gracefully'
  }))

  return channelEvent$
}

export default {
  createEvent$,
  createSocketEvent$,
  createPushEvent$,
  createChannelEvent$
}
