import { WS_TIMEOUT, WS_URL } from './constants';

export default function connectWs(callback: (x: number, y: number) => void) {
  const ws = new WebSocket(WS_URL);
  const waitForStarted = setTimeout(() => ws.close(), WS_TIMEOUT);

  ws.onopen = () => {
    clearTimeout(waitForStarted);
    ws.send(JSON.stringify({
      type: 'join_channel',
      channel: 'paintboard',
    }));
  };

  ws.onmessage = ({ data }: any) => {
    const msg = JSON.parse(data);
    if (msg.type === 'paintboard_update') {
      const { x, y } = msg;
      callback(x, y);
    }
  };

  ws.onclose = () => {
    clearTimeout(waitForStarted);
    setTimeout(() => connectWs(callback), WS_TIMEOUT);
  };
}
