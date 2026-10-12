/** Workflow conversation view registered by the Trajectory client plugin. */

import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
// Type-only imports load the current client Context and slot declarations.
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import { en, NS, zh } from './locales.ts'
import { WorkflowView, type WorkflowViewInjected } from './WorkflowView.tsx'

export { WorkflowJsonInspector } from './WorkflowJsonInspector.tsx'
export { WorkflowToolResult, WorkflowView } from './WorkflowView.tsx'
export type { WorkflowViewInjected } from './WorkflowView.tsx'
export { deriveWorkflowModel } from './workflow-model.ts'
export type {
  WorkflowCallModel, WorkflowCallUsage, WorkflowModel, WorkflowStatus,
  WorkflowTurnModel, WorkflowTurnTimings,
} from './workflow-model.ts'
export type { WorkflowKey } from './locales.ts'

/**
 * Register the Workflow view beside the Trajectory view.
 * @param ctx - Client context with the conversation, Session, and locale services.
 */
export function registerWorkflowView(ctx: Context): void {
  const sessions = ctx.sessions
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-workflow: dictionaries')
  const t = ctx.locale.bind(NS)
  const trajectoryT = ctx.locale.bind('trajectory')
  const loadOlder = (sessionId: SessionId): (() => Promise<boolean>) => {
    const binding = sessions.binding(sessionId)
    if (binding === undefined) {
      throw new Error(`ui-workflow: session "${sessionId}" is unavailable`)
    }
    return async () => {
      const before = binding.eventSource.getSnapshot().revision
      await binding.session.loadOlder()
      return binding.eventSource.getSnapshot().revision !== before
    }
  }
  ctx.slots.inject('conversation.view', () => ctx.slots.register({
    name: 'conversation.view',
    id: 'workflow',
    order: 15,
    locale: NS,
    label: () => t('view.workflow'),
    inject: (sessionId: SessionId): WorkflowViewInjected => ({
      loadOlder: loadOlder(sessionId),
      trajectoryT,
      eventWindow: () => {
        const binding = sessions.binding(sessionId)
        if (binding === undefined) {
          throw new Error(`ui-workflow: session "${sessionId}" is unavailable`)
        }
        return binding.eventSource.getSnapshot()
      },
    }),
  }, WorkflowView))
}
