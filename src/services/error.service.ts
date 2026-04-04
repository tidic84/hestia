import { Platform } from 'react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = 'https://630ceea3a478ad67e937ddc6b0dc9698@o4511158951346176.ingest.de.sentry.io/4511158953246800';

function parseDsn(dsn: string) {
  const match = dsn.match(/^https:\/\/(.+)@(.+)\/(.+)$/);
  if (!match) return null;
  return { key: match[1], host: match[2], projectId: match[3] };
}

export function reportError(error: unknown): void {
  if (__DEV__) {
    console.error('[Hestia]', error);
    return;
  }

  try {
    const parsed = parseDsn(SENTRY_DSN);
    if (!parsed) return;

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    const payload = {
      event_id: Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      timestamp: new Date().toISOString(),
      platform: 'javascript',
      level: 'error',
      logger: 'hestia',
      message: { formatted: message },
      exception: {
        values: [{
          type: error instanceof Error ? error.constructor.name : 'Error',
          value: message,
          stacktrace: stack ? { frames: [{ filename: 'app', function: stack.split('\n')[1]?.trim() ?? 'unknown' }] } : undefined,
        }],
      },
      contexts: {
        os: { name: Platform.OS, version: Platform.Version?.toString() },
        app: { app_version: Constants.expoConfig?.version ?? '1.0.0' },
      },
    };

    fetch(`https://${parsed.host}/api/${parsed.projectId}/store/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${parsed.key}, sentry_client=hestia/1.0`,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // Error reporting itself failed — silently ignore
  }
}
