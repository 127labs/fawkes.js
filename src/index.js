/* eslint no-console: 0 */
import _ from 'lodash'
import * as mappers from './mappers'

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
    let result

    if (eventQueue.length) {
      result = Promise.resolve(eventQueue.shift())
    } else {
      result = new Promise(resolve => resolveQueue.push(resolve))
    }

    return result
  }

  return { take, put }
}

export const bindHandlers = (handlers, fn) =>
  Object.keys(handlers).reduce((acc, cur) => ({
    ...acc,
    [cur]: _.flow(handlers[cur], fn),
  }), {})

export const createSocketEvent$ = (socket, mapSocketHandlers) => {
  const source = createEvent$()
  const mapper = _.isEmpty(mapSocketHandlers) ? mappers.mapSocketHandlers : mapSocketHandlers
  const boundHandlers = bindHandlers(mapper(socket), source.put)

  Object.keys(boundHandlers).forEach(key => {
    if (key in socket) {
      socket[key](boundHandlers[key])
    } else {
      console.error('Invalid event handler passed for socket:', key)
    }
  })

  return source
}

export const createPushEvent$ = (push, mapPushHandlers) => {
  const source = createEvent$()
  const mapper = _.isEmpty(mapPushHandlers) ? mappers.mapPushHandlers : mapPushHandlers
  const boundHandlers = bindHandlers(mapper(push), source.put)

  Object.keys(boundHandlers).forEach(key => {
    if (['ok', 'error', 'timeout'].some(k => k === key)) {
      push.receive(key, boundHandlers[key])
    } else {
      console.error('Invalid event handler passed for push:', key)
    }
  })

  return source
}

export const createChannelEvent$ = (channel, event, mapChannelHandlers) => {
  const source = createEvent$()
  const mapper = _.isEmpty(mapChannelHandlers) ? mappers.mapChannelHandlers : mapChannelHandlers
  const boundHandlers = bindHandlers(mapper(channel, event), source.put)

  Object.keys(boundHandlers).forEach(key => {
    if (key === 'on') {
      channel[key](event, boundHandlers[key])
    } else if (key in channel) {
      channel[key](boundHandlers[key])
    } else {
      console.error('Invalid event handler passed for channel:', event)
    }
  })

  return source
}

export default {
  createEvent$,
  createSocketEvent$,
  createPushEvent$,
  createChannelEvent$,
}
