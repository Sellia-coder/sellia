import { redactSecrets } from "./redact";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sentryBeforeSend(event: any): any {
  if (!event) return event;

  if (event.request) {
    if (event.request.headers) {
      event.request.headers = redactSecrets(event.request.headers);
    }
    if (event.request.data) {
      event.request.data = redactSecrets(event.request.data);
    }
    if (event.request.query_string) {
      event.request.query_string = "[FILTERED]";
    }
  }

  if (event.extra) event.extra = redactSecrets(event.extra);

  if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event.breadcrumbs = event.breadcrumbs.map((bc: any) => ({
      ...bc,
      data: bc.data ? redactSecrets(bc.data) : bc.data,
    }));
  }

  if (event.contexts) event.contexts = redactSecrets(event.contexts);

  return event;
}
