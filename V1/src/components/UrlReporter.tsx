import { useEffect, useRef } from 'react';
import { reportUrl } from '../lib/reportUrl';

/**
 * Fires reportUrl() once when the component mounts.
 * Place inside <App /> to auto-report the deployed URL.
 */
export default function UrlReporter() {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    reportUrl();
  }, []);

  return null; // renders nothing
}
