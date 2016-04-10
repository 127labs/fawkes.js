import _ from 'lodash'

export const mapSocketHandlers = () => ({
  onOpen: (payload) => _.omitBy({
    type: 'SOCKET/OPEN',
    payload,
  }, _.isEmpty),
  onClose: (payload) => _.omitBy({
    type: 'SOCKET/CLOSE',
    payload,
  }, _.isEmpty),
  onError: (payload) => _.omitBy({
    type: 'SOCKET/ERROR',
    payload,
  }, _.isEmpty),
  onMessage: ({ topic, event, payload, ref }) => _.omitBy({
    type: `SOCKET/MESSAGE/${topic}/${event}`,
    payload,
    ref,
  }, _.isEmpty),
})

export const mapPushHandlers = (push) => ({
  ok: (payload) => _.omitBy({
    type: `PUSH/${push.channel.topic}/${push.event}/OK`,
    payload,
  }, _.isEmpty),
  error: (payload) => _.omitBy({
    type: `PUSH/${push.channel.topic}/${push.event}/ERROR`,
    payload,
  }, _.isEmpty),
  timeout: (payload) => _.omitBy({
    type: `PUSH/${push.channel.topic}/${push.event}/TIMEOUT`,
    payload,
  }, _.isEmpty),
})

export const mapChannelHandlers = (channel, event) => ({
  on: (payload) => _.omitBy({
    type: `CHANNEL/${channel.topic}/${event}`,
    payload,
  }, _.isEmpty),
  onError: (payload) => _.omitBy({
    type: `CHANNEL/${channel.topic}/ERROR`,
    payload,
  }, _.isEmpty),
  onClose: (payload) => _.omitBy({
    type: `CHANNEL/${channel.topic}/CLOSE`,
    payload,
  }, _.isEmpty),
})

export default { mapSocketHandlers, mapChannelHandlers, mapPushHandlers }
