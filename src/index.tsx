import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { csrf } from 'hono/csrf'
import { secureHeaders } from 'hono/secure-headers'

import { loadSession, type AppContext, unlockWorkspace } from './auth'
import { requireWorkspaceEdit } from './authorization'
import {
  addWorkspaceCategoryEntry,
  createAssetRegistration,
  createAssetOutbound,
  createVisitorCard,
  assignTeamGeneralExpenseEntry,
  createTeamGeneralExpense,
  createMonthlyWorkEntry,
  createWorkEntry,
  deleteWorkEntry,
  deleteMonthlyWorkEntry,
  moveWorkEntry,
  showAssets,
  showAssetRegistration,
  showAssetOutbound,
  showAssetHistory,
  updateAssetDetails,
  showPatents,
  updatePatentStatus,
  showHome,
  showWorkspace,
  showVisitorCards,
  showManual,
  updateManual,
  showRecruitment,
  exportRecruitment,
  createRecruitmentWorkspaceRecord,
  updateRecruitmentWorkspaceRecord,
  toggleRecruitmentWorkspaceTask,
  extractRecruitmentResume,
  importRecruitmentRows,
  toggleRecruitment,
  updateRecruitment,
  showInterviewCoordination,
  importInterviewCoordinationRows,
  toggleInterviewCoordination,
  updateInterviewCoordination,
  stylesheet,
  toggleTeamGeneralExpenseEntry,
  updateTeamGeneralExpenseEntry,
  toggleAnnualScheduleCompletion,
  toggleWorkEntry,
  updateMonthlyWorkEntry,
  updateWorkEntry,
  updateWorkEntryMemo,
  updateVisitorCard,
  returnAssetOutbound,
} from './workspaces'

const app = new Hono<AppContext>()

app.use('*', secureHeaders())
app.use('*', csrf())
app.use('*', loadSession)

app.get('/styles.css', stylesheet)
app.get('/', showHome)
app.get('/assets', showAssets)
app.get('/assets/register', showAssetRegistration)
app.get('/assets/outbound', showAssetOutbound)
app.get('/assets/:assetId', showAssetHistory)
app.post('/assets/register', createAssetRegistration)
app.post('/assets/:assetId', updateAssetDetails)
app.post('/assets/outbound', createAssetOutbound)
app.post('/assets/outbound/:recordId/return', returnAssetOutbound)
app.get('/patents', showPatents)
app.post('/patents/:patentId/:feeYear/status', updatePatentStatus)
app.get('/visitor-cards', showVisitorCards)
app.post('/visitor-cards', createVisitorCard)
app.post('/visitor-cards/:recordId', updateVisitorCard)
app.get('/manual', showManual)
app.post('/manual/:entryId', updateManual)
app.get('/recruitment', showRecruitment)
app.get('/recruitment/export', exportRecruitment)
app.post('/recruitment/records', createRecruitmentWorkspaceRecord)
app.post('/recruitment/records/:recordId', updateRecruitmentWorkspaceRecord)
app.post('/recruitment/tasks/:taskId/toggle', toggleRecruitmentWorkspaceTask)
app.post(
  '/recruitment/resume-extract',
  bodyLimit({ maxSize: 5 * 1024 * 1024, onError: (c) => c.json({ error: '파일은 5MB 이하로 올려 주세요.' }, 413) }),
  extractRecruitmentResume,
)
app.post(
  '/recruitment/import',
  bodyLimit({ maxSize: 512 * 1024, onError: (c) => c.redirect('/recruitment?error=invalid', 303) }),
  importRecruitmentRows,
)
app.post('/recruitment/:rowId/toggle', toggleRecruitment)
app.post('/recruitment/:rowId', updateRecruitment)
app.get('/interview-coordination', showInterviewCoordination)
app.post(
  '/interview-coordination/import',
  bodyLimit({ maxSize: 512 * 1024, onError: (c) => c.redirect('/interview-coordination?error=invalid', 303) }),
  importInterviewCoordinationRows,
)
app.post('/interview-coordination/:rowId/toggle', toggleInterviewCoordination)
app.post('/interview-coordination/:rowId', updateInterviewCoordination)
app.get('/workspace/:ownerId', showWorkspace)
app.post('/general-expenses', createTeamGeneralExpense)
app.post('/general-expenses/:entryId/toggle', toggleTeamGeneralExpenseEntry)
app.post('/general-expenses/:entryId', updateTeamGeneralExpenseEntry)
app.post('/general-expenses/:entryId/assign', assignTeamGeneralExpenseEntry)
app.post('/annual-schedule/:itemId/toggle', toggleAnnualScheduleCompletion)
app.post('/workspace/:ownerId/unlock', unlockWorkspace)
app.post(
  '/workspace/:ownerId/entries',
  bodyLimit({
    maxSize: 8 * 1024,
    onError: (c) => c.text('입력 내용이 너무 깁니다.', 413),
  }),
  requireWorkspaceEdit,
  createWorkEntry,
)
app.post('/workspace/:ownerId/entries/:entryId', requireWorkspaceEdit, updateWorkEntry)
app.post('/workspace/:ownerId/entries/:entryId/delete', requireWorkspaceEdit, deleteWorkEntry)
app.post('/workspace/:ownerId/entries/:entryId/memo', requireWorkspaceEdit, updateWorkEntryMemo)
app.post('/workspace/:ownerId/entries/:entryId/toggle', requireWorkspaceEdit, toggleWorkEntry)
app.post('/workspace/:ownerId/entries/:entryId/move', requireWorkspaceEdit, moveWorkEntry)
app.post('/workspace/:ownerId/monthly-entries', requireWorkspaceEdit, createMonthlyWorkEntry)
app.post('/workspace/:ownerId/monthly-entries/:entryId', requireWorkspaceEdit, updateMonthlyWorkEntry)
app.post('/workspace/:ownerId/monthly-entries/:entryId/delete', requireWorkspaceEdit, deleteMonthlyWorkEntry)
app.post('/workspace/:ownerId/categories', requireWorkspaceEdit, addWorkspaceCategoryEntry)

app.onError((error, c) => {
  console.error('request failed', error.name)
  return c.text('처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 500)
})

export default app


