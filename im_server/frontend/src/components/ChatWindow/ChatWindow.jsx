import React, { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import "./ChatWindow.css";
import ReactMarkdown from 'react-markdown';

function ChatWindow({ messages, teamName }) {
  const [displayMessages, setDisplayMessages] = useState([]);
  const [shouldScroll, setShouldScroll] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    console.log(messages);
    const isAtBottom = (() => {
      if (!scrollRef.current) return false;

      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const threshold = 5;
      return scrollTop >= scrollHeight - clientHeight - threshold;
    });
    setShouldScroll(isAtBottom());
    if (messages) {
      setDisplayMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    const scrollToBottom = (() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });

    if (shouldScroll) {
      scrollToBottom();
    }
  }, [displayMessages]);

  // Show empty state when no team is selected
  if (!teamName || teamName === "Select a group") {
    return (
      <div className="chat-window">
        <div className="chat-window-empty">
          <div className="chat-window-empty-icon" role="img" aria-label="chat">💬</div>
          <div className="chat-window-empty-title">No Team Selected</div>
          <div className="chat-window-empty-description">
            Select an agent team from the left sidebar to view their conversation and collaboration progress.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2 className="chat-header-title">{teamName}</h2>
      </div>
      <div className="chat-messages" ref={scrollRef}>
        {displayMessages.length > 0 && displayMessages[0].goal && (
          <div className="chat-goal">
            <span className="chat-goal-title">🎯 Team Goal</span>
            <ReactMarkdown className="chat-goal-content">
              {displayMessages[0].goal}
            </ReactMarkdown>
          </div>
        )}
        {displayMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">No messages yet</div>
            <div className="empty-state-description">
              This team hasn't started communicating yet. Messages will appear here once agents begin their collaboration.
            </div>
          </div>
        ) : (
          displayMessages.map((message, index) => (
            <Message key={message.comm_id + "-" + index} message={message} />
          ))
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
