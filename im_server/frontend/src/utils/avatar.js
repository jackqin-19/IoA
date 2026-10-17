function stringToColor(text) {
  // Generate a consistent color based on the name
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a hex color
  const colors = ['6366f1', '8b5cf6', '3b82f6', '06b6d4', '10b981', 'f59e0b', 'ef4444', 'ec4899'];
  return colors[Math.abs(hash) % colors.length];
}

function getAvatar(name) {
  // Use DiceBear API for robot/bot avatars
  const seed = encodeURIComponent(name);
  const bgColor = stringToColor(name);

  // Use bottts-neutral style for professional robot avatars
  return `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=${bgColor}`;
}

export default getAvatar;
