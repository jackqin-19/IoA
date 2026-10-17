import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("react-markdown", () => {
  const React = require("react");
  return {
    __esModule: true,
    default: ({ children }) => React.createElement("div", null, children),
  };
});

const sockets = [];
let finishHistory;

class MockWebSocket {
  constructor() {
    sockets.push(this);
  }

  close() {
    this.onclose?.();
  }

  receive(message) {
    this.onmessage({ data: JSON.stringify(message) });
  }
}

beforeEach(() => {
  sockets.length = 0;
  global.WebSocket = MockWebSocket;
  global.fetch = jest.fn(() => new Promise((resolve) => {
    finishHistory = resolve;
  }));
});

afterEach(() => {
  jest.useRealTimers();
  delete global.fetch;
  delete global.WebSocket;
});

test("keeps history and live messages when they arrive together", async () => {
  render(<App />);
  expect(sockets).toHaveLength(1);

  const liveMessage = {
    frontend_type: "message",
    comm_id: "team-1",
    sender: "AutoGPT",
    type: 4,
    content: "live result",
  };
  act(() => {
    sockets[0].receive({
      frontend_type: "teamup",
      comm_id: "team-1",
      agent_names: ["AutoGPT", "Open Interpreter"],
    });
    sockets[0].receive(liveMessage);
  });

  const historicalMessage = {
    comm_id: "team-1",
    sender: "Open Interpreter",
    type: 4,
    content: "earlier result",
  };
  await act(async () => {
    finishHistory({
      json: async () => ({
        "team-1": {
          agent_names: ["AutoGPT", "Open Interpreter"],
          chat_record: [historicalMessage, { ...liveMessage, frontend_type: undefined }],
        },
      }),
    });
  });

  fireEvent.click(screen.getByText("AutoGPT, Open Interpreter"));
  expect(screen.getByText("earlier result")).toBeInTheDocument();
  expect(screen.getAllByText("live result")).toHaveLength(1);

  act(() => {
    sockets[0].receive({ ...liveMessage, content: "new result" });
  });
  expect(screen.getByText("new result")).toBeInTheDocument();
  expect(screen.getByText("[AutoGPT]: new result")).toBeInTheDocument();
});

test("reconnects once after a socket closes", () => {
  jest.useFakeTimers();
  const { unmount } = render(<App />);
  expect(sockets).toHaveLength(1);

  act(() => sockets[0].onclose());
  act(() => jest.advanceTimersByTime(3000));
  expect(sockets).toHaveLength(2);

  unmount();
  act(() => jest.advanceTimersByTime(30000));
  expect(sockets).toHaveLength(2);
});
