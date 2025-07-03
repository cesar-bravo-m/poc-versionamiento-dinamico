/**
 * Simulated “admin dashboard” state:
 * switch version by editing localStorage.remoteButtonVersion
 *   localStorage.remoteButtonVersion = 'v1' | 'v2';
 */
const MAP = {
  v1: 'http://localhost:3002/remoteEntry.js',
  v2: 'http://localhost:3003/remoteEntry.js'
};

export function getActiveRemoteUrl() {
  const key = localStorage.getItem('remoteButtonVersion') || 'v1';
  return MAP[key];
}
