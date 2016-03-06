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
    type: `${socket.endPoint}/STATUS`,
    payload: {
      status: 'OPEN',
      connected: socket.isConnected()
    }
  }))

  socket.onClose(() => socketEvent$.put({
    type: `${socket.endPoint}/STATUS`,
    payload: {
      status: 'CLOSED',
      connected: socket.isConnected()
    }
  }))

  if (listenError)
    socket.onError(() => socketEvent$.put({
      type: `${socket.endPoint}/STATUS`,
      payload: {
        status: 'ERROR',
        connected: socket.isConnected()
      }
    }))

  return socketEvent$
}

export const createPushEvent$ = (push) => {
  const pushEvent$ = createEvent$()

  push.receive('ok', response => pushEvent$.put({
    type: `${push.channel.topic}/${push.event}`,
    payload: {
      status: 'OK',
      response
    }
  }))

  push.receive('error', response => pushEvent$.put({
    type: `${push.channel.topic}/${push.event}`,
    payload: {
      status: 'ERROR',
      response
    }
  }))

  push.receive('timeout', () => pushEvent$.put({
    type: `${push.channel.topic}/${push.event}`,
    payload: {
      status: 'TIMEOUT',
      response: 'Networking issue. Still waiting...'
    }
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
    type: `${channel.topic}/STATUS`,
    payload: {
      status: 'ERROR',
      response
    }
  }))

  channel.onClose(() => channelEvent$.put({
    type: `${channel.topic}/STATUS`,
    payload: {
      status: 'CLOSE',
      response: 'The channel has gone away gracefully'
    }
  }))

  return channelEvent$
}

export default {
  createEvent$,
  createSocketEvent$,
  createPushEvent$,
  createChannelEvent$
}
