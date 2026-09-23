// One-use in-memory handoff. Do not put the user's original words in a browser URL.
let pendingInput = ''
export function setAgentEntry(value: string) { pendingInput = value.trim().slice(0, 200) }
export function consumeAgentEntry() {
  const value = pendingInput
  pendingInput = ''
  return value
}
