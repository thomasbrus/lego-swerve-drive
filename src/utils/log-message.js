function logMessage({ label, color }, ...args) {
  console.log(`%c${label}`, `color: white; background: ${color}; padding-inline: 4px; font-weight: 700; border-radius: 4px;`, ...args);
}

export function logIncomingSocketMessage(message) {
  logMessage({ label: `Server → Socket → Control Panel`, color: '#ca8a04' }, message.type, message.payload);
}

export function logOutgoingSocketMessage(message) {
  logMessage({ label: `Server ← Socket ← Control Panel`, color: '#7c3aed' }, message.type, message.payload);
}

export function logIncomingHubMessage(message) {
  logMessage({ label: `Hub → Bluetooth → Control Panel`, color: '#16a34a' }, message.type, message.payload);
}

export function logOutgoingHubMessage(message) {
  logMessage({ label: `Hub ← Bluetooth ← Control Panel`, color: '#1d4ed8' }, message.type, message.payload);
}
