import React, { useState, useEffect } from "react";
import "./App.css";
import GroupList from "./components/GroupList/GroupList";
import ChatWindow from "./components/ChatWindow/ChatWindow";

function mergeMessageHistory(history, liveMessages) {
  // Keep messages received during the history request without duplicating its overlap.
  const messageKey = (message) =>
    JSON.stringify([
      message.comm_id,
      message.sender,
      message.type,
      message.content,
      message.task_id,
      message.goal,
    ]);
  const historyKeys = history.map(messageKey);
  const liveKeys = liveMessages.map(messageKey);
  let overlap = Math.min(history.length, liveMessages.length);
  while (overlap > 0) {
    if (historyKeys.slice(-overlap).every((key, index) => key === liveKeys[index])) {
      break;
    }
    overlap -= 1;
  }
  return [...history, ...liveMessages.slice(overlap)];
}

function App() {
  // Left panel
  const [groups, setGroups] = useState([
    // { comm_id: "1", agent_names: ["asdf", "dfdfdf"] },
    // { comm_id: "2", agent_names: ["Friends"] },
  ]);

  // All right panel data
  const [messages, setMessages] = useState({
    // comm_id: [{
    //   comm_id: "xx",
    //   sender: "xx",
    //   content: "xx",
    //   goal: "xx",
    //   next_speaker: ["xx"],
    //   state: 0,
    //   task_abstract: "",
    //   task_conclusion: "",
    //   task_desc: "",
    //   task_id: "",
    //   team_members: [""],
    //   team_up_depth: 1,
    //   triggers: [],
    // }],
  });
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [commID2Name, setCommID2Name] = useState({});

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let stopped = false;
    let reconnectAttempts = 0;

    function connectWebSocket() {
      if (stopped) return;
      socket = new WebSocket("ws://127.0.0.1:7788/chatlist_ws");
      const connection = socket;

      connection.onopen = () => {
        reconnectAttempts = 0;
      };

      connection.onmessage = (event) => {
        if (stopped) return;
        const message = JSON.parse(event.data);
        switch (message.frontend_type) {
          case "teamup":
            setGroups((prevGroups) => {
              const group = {
                comm_id: message.comm_id,
                agent_names: message.agent_names,
                team_name: message.team_name || message.agent_names.join(", "),
              };
              return prevGroups.some((item) => item.comm_id === message.comm_id)
                ? prevGroups.map((item) =>
                    item.comm_id === message.comm_id ? { ...item, ...group } : item
                  )
                : [group, ...prevGroups];
            });
            setCommID2Name((prev) => ({
              ...prev,
              [message.comm_id]: message.team_name || message.agent_names.join(", "),
            }));
            break;
          case "message":
            setMessages((prevMessages) => ({
              ...prevMessages,
              [message.comm_id]: [...(prevMessages[message.comm_id] || []), message],
            }));
            setGroups((prevGroups) =>
              prevGroups.map((group) =>
                group.comm_id === message.comm_id
                  ? { ...group, latest_message: `[${message.sender}]: ${message.content}` }
                  : group
              )
            );
            break;

          default:
            break;
        }
      };

      connection.onerror = (error) => {
        console.error("WebSocket error:", error);
        connection.close();
      };

      connection.onclose = () => {
        if (stopped) return;
        socket = null;
        const delay = Math.min(3000 * 2 ** reconnectAttempts, 30000);
        reconnectAttempts += 1;
        reconnectTimer = setTimeout(connectWebSocket, delay);
      };
    }

    connectWebSocket();

    return () => {
      stopped = true;
      clearTimeout(reconnectTimer);
      if (socket) {
        socket.close();
      }
    };
  }, []);

  // Fetch all the chat records from the server when initialized
  useEffect(() => {
    const controller = new AbortController();
    fetch("http://127.0.0.1:7788/fetch_chat_record", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        let newMessages = {};
        let newGroups = [];
        let newCommID2Name = {};
        for (const comm_id in data) {
          let chatRecord = data[comm_id]["chat_record"];
          let agentNames = data[comm_id]["agent_names"];
          let teamName = data[comm_id]["team_name"] || agentNames.join(", ");
          newCommID2Name[comm_id] = teamName;
          chatRecord.forEach((message) => {
            newMessages[comm_id] = newMessages[comm_id] || [];
            newMessages[comm_id].push(message);
          });

          let latestMessage = chatRecord[chatRecord.length - 1] || null;
          newGroups = [
            {
              comm_id: comm_id,
              agent_names: agentNames,
              latest_message: latestMessage
                ? `[${latestMessage.sender}]: ${latestMessage.content}`
                : "",
              team_name: teamName,
            },
            ...newGroups,
          ];
        }
        setMessages((prevMessages) => {
          const merged = { ...prevMessages };
          for (const commId in newMessages) {
            merged[commId] = mergeMessageHistory(newMessages[commId], prevMessages[commId] || []);
          }
          return merged;
        });
        setGroups((prevGroups) => {
          const fetchedIds = new Set(newGroups.map((group) => group.comm_id));
          const liveGroups = new Map(prevGroups.map((group) => [group.comm_id, group]));
          return [
            ...prevGroups.filter((group) => !fetchedIds.has(group.comm_id)),
            ...newGroups.map((group) => ({ ...group, ...liveGroups.get(group.comm_id) })),
          ];
        });
        setCommID2Name((prev) => ({ ...newCommID2Name, ...prev }));
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Error:", error);
      });
    return () => controller.abort();
  }, []);

  let selectedMessages = messages[selectedGroup] || [];

  return (
    <div className="app-container">
      <GroupList groups={groups} onGroupSelect={setSelectedGroup} />
      <ChatWindow
        messages={selectedMessages}
        teamName={selectedGroup ? commID2Name[selectedGroup] : "Select a group"}
      />
    </div>
  );
}

export default App;
