## Motivation
Handling **PUSH** events from Phoenix Channels can be trivial especially if you are using front-end state managers like Redux and a Side Effect model like Redux Saga that has a philosophy around **PULLING** the events. By event sourcing the official callbacks on Phoenix Channel client library. Fawkes ensures full control to `take` an event in the queue at any given time.

## Example

```js
import {call, fork} from 'redux-saga/effects'
import Fawkes from 'fawkes'

function * listenEvent$(event$) {
  while (true) {
    const message = yield call(event$.take)
    console.log(message)
  }
}

function * connectSocket(socket) {
  while (true) {
    if (!socket.isConnected()) {
      yield call([socket, socket.connect])
    }

    yield call(listenEvent$, Fawkes.createSocketEvent$(socket))
  }
}

export default function * (socket) {
  yield [
    fork(connectSocket, socket)
  ]
}
```
