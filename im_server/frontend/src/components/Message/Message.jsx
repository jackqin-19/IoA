import React from 'react';
import './Message.css';
import getAvatar from '../../utils/avatar';
import ReactMarkdown from 'react-markdown';

function Message({ message }) {
  const type2string = {
    0: "default",
    1: "proposal",
    2: "vote",
    3: "voting result",
    4: "discussion",
    5: "sync task assignment",
    6: "async task assignment",
    7: "inform task result",
    8: "inform task progress",
    9: "pause",
    10: "conclude group discussion",
    11: "conclusion",
  };

  const type = type2string[message.type] || "default";

  // Get badge class based on message type
  const getBadgeClass = (type) => {
    if (type.includes("proposal")) return "type-proposal";
    if (type.includes("vote")) return "type-vote";
    if (type.includes("discussion")) return "type-discussion";
    if (type.includes("conclusion")) return "type-conclusion";
    return "";
  };

  let nextSpeaker = message.next_speaker;
  if (Array.isArray(nextSpeaker) && nextSpeaker.length !== 0) {
    nextSpeaker = message.next_speaker;
  } else {
    nextSpeaker = [];
  }

  return (
    <div className="message">
      <div className="message-header">
        <img
          src={getAvatar(message.sender)}
          alt={`${message.sender}'s avatar`}
          className="avatar"
        />
        <span className="username">{message.sender}</span>
        {type && (
          <span className={`message-badge ${getBadgeClass(type)}`}>
            {type}
          </span>
        )}
      </div>
      <div className="message-bubble">
        <ReactMarkdown className="message-content">
          {message.content}
        </ReactMarkdown>

        <div className="message-metadata">
          {nextSpeaker && nextSpeaker.length > 0 && (
            <div className="message-meta-row">
              <span className="message-key">Next Speaker:</span>
              <div className="message-next-speaker">
                {Array.isArray(nextSpeaker) ? (
                  nextSpeaker.map((speaker, idx) => (
                    <span key={idx} className="speaker-tag">{speaker}</span>
                  ))
                ) : (
                  <span className="speaker-tag">{nextSpeaker}</span>
                )}
              </div>
            </div>
          )}

          {message.updated_plan && (
            <div className="message-meta-row">
              <span className="message-key">Updated Plan:</span>
              <span className="message-value">{message.updated_plan}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
