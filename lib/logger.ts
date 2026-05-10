type LogLevel = "debug" | "info";

function formatLogMessage(actionName: string, sessionId: string | undefined, description: string): string {
  return `[${actionName} / ${sessionId ?? "no-session"}] - ${description}`;
}

function writeLog(logLevel: LogLevel, actionName: string, sessionId: string | undefined, description: string): void {
  const formattedMessage = formatLogMessage(actionName, sessionId, description);

  if (logLevel === "debug") {
    console.debug(formattedMessage);
    return;
  }

  console.info(formattedMessage);
}

export const logger = {
  debug(actionName: string, sessionId: string | undefined, description: string): void {
    writeLog("debug", actionName, sessionId, description);
  },
  info(actionName: string, sessionId: string | undefined, description: string): void {
    writeLog("info", actionName, sessionId, description);
  },
};
