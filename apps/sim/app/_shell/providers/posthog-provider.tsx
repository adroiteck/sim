'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { getEnv, isTruthy } from '@/lib/core/config/env'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const posthogEnabled = getEnv('NEXT_PUBLIC_POSTHOG_ENABLED')
    const posthogKey = getEnv('NEXT_PUBLIC_POSTHOG_KEY')

    const posthogHost = getEnv('NEXT_PUBLIC_POSTHOG_HOST') || 'https://posthog.apps.ocp.aps.kim'

    if (isTruthy(posthogEnabled) && posthogKey && !posthog.__loaded) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'always',
        advanced_disable_decide: true,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          recordCrossOriginIframes: true,
        },
        persistence: 'localStorage+cookie',
      })
    }
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
