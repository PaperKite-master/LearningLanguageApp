export function withRequestId(log, request) {
  const requestId = request.id ?? request.headers['x-request-id'];
  return requestId ? log.child({ requestId }) : log;
}

