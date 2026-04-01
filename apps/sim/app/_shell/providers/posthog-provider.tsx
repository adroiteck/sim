'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { getEnv, isTruthy } from '@/lib/core/config/env'

const SENSITIVE_PARAMS = new Set([
  'token', 'access_token', 'id_token', 'refresh_token',
  'code', 'state', 'nonce', 'session_state', 'client_secret',
])

function redactSensitiveParams(event: Record<string, any>) {
  const urlProps = ['$current_url', '$referrer']
  for (const prop of urlProps) {
    const raw = event.properties?.[prop]
    if (!raw || !raw.includes('?')) continue
    try {
      const u = new URL(raw)
      for (const key of [...u.searchParams.keys()]) {
        if (SENSITIVE_PARAMS.has(key.toLowerCase())) u.searchParams.delete(key)
      }
      event.properties[prop] = u.toString()
    } catch { /* not a valid URL, leave as-is */ }
  }
  return event
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogEnabled = getEnv('NEXT_PUBLIC_POSTHOG_ENABLED')
    const posthogKey = getEnv('NEXT_PUBLIC_POSTHOG_KEY')
    const posthogHost = getEnv('NEXT_PUBLIC_POSTHOG_HOST') || 'https://posthog.apps.ocp.aps.kim'

    if (isTruthy(posthogEnabled) && posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        ui_host: 'https://posthog.apps.ocp.aps.kim',
        person_profiles: 'always',
        capture_pageview: true,
        capture_pageleave: 'if_capture_pageview',
        autocapture: true,
        disable_session_recording: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: '.ph-mask',
          recordCrossOriginIframes: true,
        },
        capture_performance: true,
        capture_heatmaps: true,
        capture_dead_clicks: true,
        persistence: 'localStorage+cookie',
        before_send: redactSensitiveParams,
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
