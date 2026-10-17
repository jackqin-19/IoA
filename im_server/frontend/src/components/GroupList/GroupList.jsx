import React, { useState } from "react";
import "./GroupList.css";
import getAvatar from "../../utils/avatar";

function AvatarGrid({ members }) {
  const getGridClass = () => {
    const count = members.length;
    if (count === 1) return "avatar-grid-one";
    if (count === 2) return "avatar-grid-two";
    if (count === 3) return "avatar-grid-three";
    return "avatar-grid-four";
  };

  return (
    <div className={`avatar-square ${getGridClass()}`}>
      {members.slice(0, 4).map((name, index) => (
        <img
          key={index}
          src={getAvatar(name)}
          alt={`Avatar of ${name}`}
          className={`avatar-group-list avatar-${index}`}
        />
      ))}
    </div>
  );
}

function GroupList({ groups, onGroupSelect }) {
  const [selectedId, setSelectedId] = useState(null);

  const handleChatClick = (chatId) => {
    setSelectedId(chatId);
    onGroupSelect(chatId);
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h1 className="chat-list-title">
          <span role="img" aria-label="robot">🤖</span>
          <span>Agent Teams</span>
        </h1>
        <p className="chat-list-subtitle">
          {groups.length === 0
            ? "No active teams"
            : `${groups.length} active ${groups.length === 1 ? 'team' : 'teams'}`}
        </p>
      </div>
      <div className="chat-list-scroll">
        {groups.length === 0 ? (
          <div className="chat-list-empty">
            <div className="chat-list-empty-icon" role="img" aria-label="chat">💬</div>
            <div className="chat-list-empty-text">
              Waiting for agent teams to connect...
              <br />
              Teams will appear here once they start collaborating.
            </div>
          </div>
        ) : (
          <ul>
            {groups.map((group) => (
              <li
                key={group.comm_id}
                onClick={() => handleChatClick(group.comm_id)}
                className={selectedId === group.comm_id ? "chat-item-selected" : "chat-item"}
              >
                <AvatarGrid members={group.agent_names} />
                <div className="group-info">
                  <div className="group-name">{group.team_name}</div>
                  <div className="group-description">
                    {group.latest_message || "No messages yet"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default GroupList;
