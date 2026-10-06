export const styles = `
:root {
  color-scheme: light;
  font-family: Pretendard, "Pretendard Variable", "Noto Sans KR", "Malgun Gothic", system-ui, -apple-system, sans-serif;
  color: #14213d;
  background: #f3f6fb;
  font-size: 16px;
}
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; background: #f3f6fb; }
a { color: inherit; }
button, input { font: inherit; }
button, .button {
  min-height: 44px;
  border: 0;
  border-radius: 10px;
  padding: 0.7rem 1rem;
  background: #1e5eff;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}
button.secondary, .button.secondary { background: #e8efff; color: #173b83; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #f2b84b; outline-offset: 2px; }
input {
  min-height: 44px;
  width: 100%;
  border: 1px solid #b8c5dc;
  border-radius: 10px;
  padding: 0.7rem 0.8rem;
  background: #fff;
}
label { display: block; margin: 0.9rem 0 0.35rem; font-size: 0.9rem; font-weight: 700; }
.shell { width: min(1160px, calc(100% - 32px)); margin: 0 auto; }
.topbar { background: #10264f; color: #fff; }
.topbar-inner { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.brand { font-weight: 800; text-decoration: none; letter-spacing: -0.02em; }
.account { display: flex; align-items: center; gap: 0.75rem; }
.account form { margin: 0; }
.account button { background: #fff; color: #173b83; }
main.shell { padding: 2rem 0 3rem; }
.eyebrow { margin: 0 0 0.35rem; color: #42618e; font-size: 0.85rem; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
h1 { margin: 0; font-size: clamp(1.7rem, 4vw, 2.5rem); letter-spacing: -0.04em; }
.lead { margin: 0.65rem 0 0; color: #50627d; line-height: 1.6; }
.workspace-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin-top: 1.6rem; }
.home-shortcuts { display: grid; grid-template-columns: minmax(260px, 430px); margin-top: 1.1rem; }
.asset-shortcut { display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; gap: 0.75rem; align-items: center; padding: 0.85rem 1rem; border: 1px solid #bfcde0; border-radius: 12px; background: #edf4fb; color: #183d6d; text-decoration: none; }
.asset-shortcut:hover { border-color: #5d83b1; background: #e3eef9; }
.shortcut-icon { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 8px; background: #376b9b; color: #fff; font-size: 1.1rem; }
.asset-shortcut > span:nth-child(2) { display: grid; gap: 0.14rem; }
.asset-shortcut small { color: #63748a; font-size: 0.72rem; }
.asset-shell { width: min(1120px, calc(100% - 32px)); }
.asset-page-heading { margin-top: 0.5rem; }
.asset-coming-soon { margin-top: 1.5rem; padding: 1.2rem; border: 1px solid #cfd8e5; border-radius: 14px; background: #fff; }
.asset-coming-soon p { margin: 0.45rem 0 0; color: #617086; line-height: 1.6; }
.workspace-card { display: block; min-width: 0; padding: 1.25rem; border: 1px solid #d6deeb; border-radius: 16px; background: #fff; box-shadow: 0 8px 24px rgba(24, 52, 96, 0.06); text-decoration: none; }
.workspace-card:hover { border-color: #6f94e8; transform: translateY(-1px); }
.card-heading { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; }
.card-heading h2 { margin: 0; font-size: 1.25rem; }
.counts { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
.count { padding: 0.35rem 0.55rem; border-radius: 999px; background: #edf2fc; color: #274b84; font-size: 0.85rem; }
.count.incomplete { background: #fff1d6; color: #76500b; }
.recent { margin: 0; padding-left: 1.1rem; color: #4c5d75; line-height: 1.7; }
.status { display: inline-flex; align-items: center; min-height: 30px; border-radius: 999px; padding: 0.25rem 0.65rem; background: #e8efff; color: #173b83; font-size: 0.82rem; font-weight: 800; }
.status.readonly { background: #eef1f5; color: #546274; }
.panel { margin-top: 1.5rem; padding: 1.25rem; border: 1px solid #d6deeb; border-radius: 16px; background: #fff; }
.panel h2 { margin: 0 0 0.8rem; font-size: 1.15rem; }
.work-list { list-style: none; padding: 0; margin: 0; }
.work-item { display: grid; grid-template-columns: 105px 1fr auto; gap: 1rem; align-items: center; padding: 0.95rem 0; border-bottom: 1px solid #e5eaf2; }
.work-item:last-child { border-bottom: 0; }
.work-date { color: #62728a; font-size: 0.9rem; }
.work-content { min-width: 0; overflow-wrap: anywhere; }
.done { color: #367056; font-weight: 700; }
.pending { color: #8a5a08; font-weight: 700; }
.unlock-form { max-width: 420px; }
.notice { padding: 0.85rem 1rem; border-radius: 10px; background: #eef4ff; color: #274b84; line-height: 1.55; }
.back { display: inline-block; margin-bottom: 1.2rem; color: #315d9f; font-weight: 700; }
.footer { padding: 1.5rem 0 2.5rem; color: #7b8798; font-size: 0.78rem; }
.footer span { opacity: 0.85; }
.login-wrap { width: min(440px, calc(100% - 32px)); margin: 8vh auto; padding: 1.8rem; border: 1px solid #d6deeb; border-radius: 18px; background: #fff; box-shadow: 0 16px 45px rgba(24, 52, 96, 0.1); }
.login-wrap form button { width: 100%; margin-top: 1.2rem; }
[role="alert"] { padding: 0.75rem; border-radius: 10px; background: #fff0ee; color: #8c2e21; }
.create-form { display: flex; gap: 0.75rem; align-items: end; }
.create-form .grow { flex: 1; }
.create-form button { flex: 0 0 auto; }
.work-item.editable { grid-template-columns: 105px minmax(180px, 1fr) auto; }
.entry-actions { grid-column: 1 / -1; display: flex; gap: 0.75rem; align-items: start; flex-wrap: wrap; }
.entry-actions form { margin: 0; }
details { flex: 1; min-width: min(100%, 340px); }
summary { min-height: 44px; display: flex; align-items: center; color: #315d9f; font-weight: 700; cursor: pointer; }
.edit-form { display: grid; grid-template-columns: 150px minmax(180px, 1fr) auto; gap: 0.65rem; align-items: end; padding: 0.8rem; border-radius: 12px; background: #f3f6fb; }
.edit-form label { margin-top: 0; }
.list-heading { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.list-heading h2 { margin-bottom: 0; }
.list-heading > span { color: #62728a; font-size: 0.9rem; }
.work-filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0; }
.filter-link { min-height: 40px; display: inline-flex; align-items: center; border: 1px solid #cbd6e8; border-radius: 999px; padding: 0.45rem 0.8rem; color: #315d9f; font-weight: 700; text-decoration: none; }
.filter-link.active { border-color: #1e5eff; background: #1e5eff; color: #fff; }
.work-period { display: grid; gap: 0.25rem; }
.cadence { color: #315d9f; font-size: 0.78rem; font-weight: 800; }
.work-main { min-width: 0; display: grid; gap: 0.35rem; }
.entry-meta { display: flex; gap: 0.45rem; flex-wrap: wrap; color: #62728a; font-size: 0.78rem; }
.entry-meta span { padding: 0.2rem 0.45rem; border-radius: 999px; background: #eef1f5; }
.entry-meta .review-badge { background: #fff1d6; color: #76500b; font-weight: 800; }
.edit-note { align-self: center; color: #62728a; font-size: 0.82rem; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 1rem; margin-top: 1.2rem; }
.pagination .button { display: inline-flex; align-items: center; text-decoration: none; }
@media (max-width: 720px) {
  .workspace-grid { grid-template-columns: 1fr; }
  .topbar-inner { min-height: 64px; }
  .account > span { display: none; }
  main.shell { padding-top: 1.4rem; }
  .work-item, .work-item.editable { grid-template-columns: 1fr; gap: 0.35rem; }
  .create-form, .edit-form { display: grid; grid-template-columns: 1fr; }
  .create-form button, .edit-form button { width: 100%; }
}

/* 업무공간: 스프레드시트처럼 조용하고 빠르게 훑는 배치 */
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
.workspace-shell { width: min(1320px, calc(100% - 32px)); }
.workspace-title { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }
.workspace-title .back { margin-bottom: 0.45rem; font-size: 0.86rem; text-decoration: none; }
.unlock-strip, .create-strip { margin: 1rem 0; padding: 0.9rem 1rem; border: 1px solid #d8dfeb; border-radius: 12px; background: #fff; }
.unlock-strip { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.unlock-strip > div { display: grid; gap: 0.2rem; }
.unlock-strip > div span { color: #6a7688; font-size: 0.82rem; }
.unlock-strip form { display: flex; gap: 0.5rem; width: min(440px, 100%); }
.unlock-strip input { min-width: 0; }
.create-strip form { display: flex; align-items: end; gap: 0.65rem; }
.create-strip .grow { flex: 1; }
.create-strip label { margin-top: 0; }
.planning-board { display: block; margin-top: 1rem; border: 1px solid #cfd7e4; border-radius: 14px; background: #fff; overflow: hidden; }
.planning-board article { min-width: 0; padding: 1rem 1.1rem; }
.monthly-plan { background: #fbfaf5; }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 0.65rem; }
.section-heading h2 { margin: 0; font-size: 1rem; letter-spacing: -0.02em; }
.section-heading > span { color: #788396; font-size: 0.76rem; }
.plan-more { color: #526b8b; font-size: 0.76rem; font-weight: 700; text-decoration: none; }
.plan-more:hover { text-decoration: underline; }
.plan-list { list-style: none; margin: 0; padding: 0; }
.plan-table { border: 1px solid #cfd6df; background: #fff; overflow-x: auto; }
.workspace-month-nav { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; margin-bottom: 0.65rem; }
.workspace-month-nav h2 { margin: 0; font-size: 1.65rem; font-weight: 900; color: #183d6d; }
.workspace-month-nav a { color: #526b8b; font-size: 0.76rem; font-weight: 800; text-decoration: none; }
.workspace-month-nav a:last-child { justify-self: end; }
.workspace-month-tabs { display: grid; grid-template-columns: repeat(12, minmax(54px, 1fr)); margin-bottom: 0.8rem; border: 1px solid #c7d0db; background: #f7f9fc; overflow-x: auto; }
.workspace-month-tab { padding: 0.48rem 0.2rem; border-right: 1px solid #c7d0db; color: #51647a; font-size: 0.72rem; font-weight: 800; text-align: center; text-decoration: none; }
.workspace-month-tab:last-child { border-right: 0; }
.workspace-month-tab:hover { background: #e9f0f7; }
.workspace-month-tab.active { background: #376b9b; color: #fff; }
.plan-table-head, .plan-list li { min-width: 620px; display: grid; grid-template-columns: 150px minmax(460px, 1fr); align-items: stretch; gap: 0; }
.plan-table-head { background: #fff1c9; color: #25384f; font-size: 0.72rem; font-weight: 900; text-align: center; }
.plan-table-head span { padding: 0.4rem; border-right: 1px solid #c3ccd7; }
.plan-table-head span:last-child { border-right: 0; }
.plan-list li { min-height: 42px; padding: 0; border-top: 1px solid #e0e5eb; }
.plan-category, .plan-copy { min-width: 0; padding: 0.42rem; border-right: 1px solid #d5dbe3; }
.plan-category { color: #234f82; font-size: 0.74rem; font-weight: 800; text-align: center; overflow-wrap: anywhere; }
.plan-period { color: #6b7687; font-size: 0.78rem; font-variant-numeric: tabular-nums; }
.plan-copy { min-width: 0; display: grid; gap: 0.18rem; line-height: 1.4; }
.plan-copy { border-right: 0; }
.category-label { width: fit-content; color: #234f82; font-size: 0.72rem; font-weight: 800; }
.empty-plan { margin: 0; padding: 1rem 0; color: #7b8798; font-size: 0.88rem; }
.completion-icon, .completion-toggle { width: 28px; height: 28px; display: inline-grid; place-items: center; border-radius: 50%; border: 1px solid #aeb8c7; background: #fff; color: #8a95a5; font-size: 0.9rem; font-weight: 900; }
.completion-icon.is-done, .completion-toggle.is-done { border-color: #4b8068; background: #e8f3ed; color: #2f6b52; }
.completion-toggle { min-height: 28px; padding: 0; cursor: pointer; }
.completion-form { margin: 0; display: grid; place-items: center; }
.work-section { margin-top: 1rem; padding: 1rem 1.1rem; border: 1px solid #cfd7e4; border-radius: 14px; background: #fff; }
.work-filters { margin: 0 0 0.65rem; gap: 0.35rem; }
.filter-link { min-height: 34px; padding: 0.34rem 0.68rem; border: 0; border-radius: 8px; background: #f0f3f7; color: #52657f; font-size: 0.8rem; }
.filter-link.active { background: #183d6d; color: #fff; }
.work-table { width: 100%; overflow-x: auto; border: 1px solid #aeb8c5; background: #fff; }
.work-table-head, .work-item, .work-item.editable { min-width: 940px; display: grid; grid-template-columns: 82px 150px minmax(420px, 1fr) 105px 42px; gap: 0; }
.work-table-head { border-bottom: 2px solid #53687f; background: #fff1c9; color: #25384f; font-size: 0.75rem; font-weight: 900; text-align: center; }
.work-table-head span { padding: 0.48rem 0.4rem; border-right: 1px solid #aeb8c5; }
.work-table-head span:last-child { border-right: 0; }
.work-list { list-style: none; margin: 0; padding: 0; }
.work-item, .work-item.editable { align-items: stretch; min-height: 44px; padding: 0; border-bottom: 1px solid #cfd6df; }
.work-item.week-boundary { border-bottom: 3px solid #53687f; }
.work-item.completed .work-content { color: #7a8492; text-decoration: line-through; text-decoration-color: #bbc2cc; }
.work-category-cell, .work-date, .work-main, .work-deadline-cell, .work-item > .completion-form, .work-item > .completion-icon { min-width: 0; padding: 0.42rem; border-right: 1px solid #cfd6df; }
.work-category-cell { display: grid; align-items: center; background: #f8fafc; }
.category-cell-label { color: #234f82; font-size: 0.75rem; font-weight: 800; text-align: center; overflow-wrap: anywhere; }
.inline-category-form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.25rem; align-items: center; }
.inline-category-form select { width: 100%; min-height: 32px; padding: 0.25rem 1.5rem 0.25rem 0.35rem; border-radius: 4px; font-size: 0.72rem; font-weight: 700; }
.inline-category-form button { min-height: 30px; padding: 0.25rem 0.4rem; border-radius: 4px; font-size: 0.68rem; }
.work-date { display: grid; place-content: center; gap: 0.1rem; color: #44566d; font-size: 0.78rem; font-variant-numeric: tabular-nums; font-weight: 800; text-align: center; }
.work-date small { color: #7b8797; font-size: 0.67rem; font-weight: 700; }
.work-main { min-width: 0; display: grid; align-content: center; gap: 0.2rem; }
.work-labels { min-height: 1rem; display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap; }
.review-badge { color: #8b5b04; font-size: 0.7rem; font-weight: 800; }
.work-content { line-height: 1.45; }
.work-deadline-cell { display: grid; place-items: center; text-align: center; }
.work-item > .completion-form, .work-item > .completion-icon { display: grid; place-items: center; border-right: 0; }
.entry-edit { min-width: 0; width: fit-content; }
.entry-edit summary { min-height: 24px; color: #64758c; font-size: 0.75rem; font-weight: 700; }
.entry-edit .edit-form { min-width: min(720px, calc(100vw - 80px)); margin-top: 0.35rem; }
.pagination { margin-top: 0.9rem; }

@media (max-width: 820px) {
  .planning-board { grid-template-columns: 1fr; }
  .monthly-plan { border-left: 0; border-top: 1px solid #cfd7e4; }
  .unlock-strip { align-items: stretch; flex-direction: column; }
  .unlock-strip form { width: 100%; }
  .create-strip form { display: grid; grid-template-columns: 1fr; }
  .plan-list li { grid-template-columns: 74px minmax(0, 1fr) 28px; }
}
@media (max-width: 560px) {
  .workspace-shell { width: min(100% - 20px, 1320px); }
  .workspace-title { align-items: center; }
  .unlock-strip form { display: grid; }
  .work-section, .planning-board article { padding: 0.85rem; }
  .work-table-head, .work-item, .work-item.editable { grid-template-columns: 76px 140px minmax(420px, 1fr) 96px 38px; gap: 0; }
  .plan-list li { grid-template-columns: 1fr 28px; }
  .plan-period { grid-column: 1; }
  .plan-copy { grid-column: 1; }
  .plan-list .completion-icon { grid-column: 2; grid-row: 1 / span 2; }
}
/* 마감일·총무비용·미완료 이동 */
button, input, select { font: inherit; }
select {
  min-height: 44px;
  width: 100%;
  border: 1px solid #b8c5dc;
  border-radius: 10px;
  padding: 0.65rem 0.75rem;
  background: #fff;
  color: #14213d;
}
button:focus-visible, input:focus-visible, select:focus-visible, a:focus-visible { outline: 3px solid #f2b84b; outline-offset: 2px; }
.create-strip form { align-items: start; }
.create-strip button { align-self: end; }
.create-strip label small { color: #7a8696; font-weight: 500; }
.field-help { display: block; margin-top: 0.3rem; color: #708095; font-size: 0.72rem; line-height: 1.35; }
.completion-icon:not(.is-done), .completion-toggle:not(.is-done) { color: #b06b16; border-color: #d9ad72; background: #fffaf1; }
.deadline-badge { color: #7b4f09; font-size: 0.7rem; font-weight: 800; }
.deadline-badge.overdue { color: #a33224; }
.move-entry { min-width: 0; width: fit-content; }
.move-entry summary { min-height: 24px; color: #64758c; font-size: 0.75rem; font-weight: 700; }
.move-entry form { display: flex; gap: 0.4rem; align-items: center; margin-top: 0.3rem; }
.move-entry select { width: auto; min-height: 34px; padding: 0.35rem 2rem 0.35rem 0.55rem; border-radius: 7px; }
.move-entry button { min-height: 34px; padding: 0.35rem 0.65rem; border-radius: 7px; font-size: 0.78rem; }
.expense-note { margin: 0 0 0.7rem; padding: 0.55rem 0.7rem; border-left: 3px solid #d3a74d; background: #fffaf0; color: #675020; font-size: 0.8rem; line-height: 1.45; }
.entry-edit .edit-form { grid-template-columns: 130px 130px 150px minmax(220px, 1fr) auto; }
.entry-edit .edit-form > div label { margin-top: 0; }
@media (max-width: 980px) {
  .create-strip form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .create-strip .grow { grid-column: 1 / -1; }
  .create-strip button { width: 100%; }
  .entry-edit .edit-form { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .entry-edit .edit-form .grow { grid-column: 1 / -1; }
  .entry-edit .edit-form button { width: 100%; }
}
@media (max-width: 560px) {
  .create-strip form, .entry-edit .edit-form { grid-template-columns: 1fr; }
  .create-strip .grow, .entry-edit .edit-form .grow { grid-column: auto; }
  .move-entry form { align-items: stretch; flex-direction: column; }
  .move-entry select { width: 100%; }
}
/* 총무비용 월간 달력: 스프레드시트식 음영 */
.expense-calendar { margin-top: 0.8rem; border: 1px solid #9da9b8; background: #fff; overflow-x: auto; }
.expense-calendar-toolbar { min-width: 1080px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0.75rem 0.9rem; border-bottom: 1px solid #9da9b8; background: #fff1c9; }
.expense-calendar-toolbar h3 { margin: 0; font-size: 1rem; }
.expense-calendar-toolbar a { color: #365879; font-size: 0.8rem; font-weight: 800; text-decoration: none; }
.expense-calendar-toolbar a:last-child { justify-self: end; }
.expense-month-tabs { min-width: 1080px; display: grid; grid-template-columns: repeat(12, minmax(70px, 1fr)); border-bottom: 1px solid #9da9b8; background: #f7f9fc; }
.expense-month-tab { padding: 0.58rem 0.3rem; border-right: 1px solid #c7d0db; color: #51647a; font-size: 0.76rem; font-weight: 800; text-align: center; text-decoration: none; }
.expense-month-tab:last-child { border-right: 0; }
.expense-month-tab:hover { background: #e9f0f7; }
.expense-month-tab.active { background: #376b9b; color: #fff; }
.expense-legend { min-width: 1080px; display: flex; justify-content: end; gap: 1rem; padding: 0.45rem 0.8rem; border-bottom: 1px solid #c2cad5; color: #667487; font-size: 0.72rem; }
.expense-legend span::before { content: ''; display: inline-block; width: 12px; height: 12px; margin-right: 0.3rem; vertical-align: -2px; border: 1px solid #c8c0a7; }
.expense-legend .legend-pending::before { background: #fff; }
.expense-legend .legend-complete::before { background: #d8d8d8; }
.expense-calendar-table { min-width: max(1080px, var(--expense-min-width)); }
.expense-week-row { display: grid; grid-template-columns: var(--expense-columns); align-items: stretch; min-width: max(1080px, var(--expense-min-width)); }
.expense-week-label { display: grid; place-items: center; padding: 0.4rem; border-right: 1px solid #8f9dad; border-bottom: 1px solid #8f9dad; background: #f7f8fa; font-size: 0.7rem; font-weight: 800; text-align: center; }
.expense-day { min-width: 0; min-height: 150px; padding: 0; border-right: 1px solid #aeb9c8; border-bottom: 1px solid #8f9dad; background: #fff; overflow: visible; }
.expense-day.is-empty { background: #fafbfc; }
.expense-week-row .expense-day:last-child { border-right: 0; }
.expense-day.outside { background: #f4f5f7; }
.expense-day > strong { display: block; padding: 0.28rem 0.4rem; border-bottom: 1px solid #aeb9c8; background: #dbe9f5; color: #1f2d3d; font-size: 0.78rem; text-align: right; }
.expense-calendar-item { display: grid; grid-template-columns: minmax(0, 1fr) 24px; gap: 0.2rem; align-items: center; min-height: 28px; padding: 0.2rem 0.3rem; border-bottom: 1px solid #d8dde4; background: #fff; }
.expense-calendar-item.completed { background: #d8d8d8; }
.expense-calendar-copy { min-width: 0; display: flex; gap: 0.25rem; align-items: center; }
.expense-calendar-copy > span:last-child { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.72rem; line-height: 1.3; }
.expense-calendar-item .completion-icon, .expense-calendar-item .completion-toggle { width: 20px; height: 20px; min-height: 20px; padding: 0; border: 0; border-radius: 0; background: transparent; font-size: 0.72rem; }
@media (max-width: 820px) {
  .expense-calendar { margin-left: -0.35rem; margin-right: -0.35rem; }
}
/* 홈 하단 팀 공용 총무비용 캘린더 */
.team-home { width: min(1320px, calc(100% - 32px)); }
.team-expense-section { margin-top: 1.2rem; padding: 1rem 1.1rem; border: 1px solid #cfd7e4; border-radius: 14px; background: #fff; }
.team-expense-section .section-heading > div { display: grid; gap: 0.2rem; }
.team-expense-section .section-heading p { margin: 0; color: #6d798a; font-size: 0.8rem; }
.team-expense-create { display: grid; grid-template-columns: 150px minmax(280px, 1fr) auto; gap: 0.65rem; align-items: end; margin: 0.8rem 0; padding: 0.8rem; border: 1px solid #d9e0e9; background: #f7f9fb; }
.team-expense-create label { margin-top: 0; }
.team-expense-create button { align-self: end; }
.expense-edit-note { margin: 0.7rem 0; padding: 0.6rem 0.75rem; border-left: 3px solid #8fa3bd; background: #f3f6fa; color: #59697e; font-size: 0.8rem; }
@media (max-width: 820px) {
  .team-home { width: min(100% - 20px, 1320px); }
  .team-expense-section { padding: 0.8rem; }
  .team-expense-create { grid-template-columns: 1fr; }
  .team-expense-create button { width: 100%; }
}

/* 전 화면 공통 포털 UI */
:root {
  --navy: #17324d; --navy-mid: #28577d; --ink: #172536;
  --muted: #718096; --line: #dce3ea; --soft: #f6f8fa;
  --green: #2e7d62; --green-soft: #e9f5ef;
  --amber: #a76518; --amber-soft: #fff6e8;
  color: var(--ink); background: #f2f5f8; font-synthesis: none;
}
body { background: #f2f5f8; color: var(--ink); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.topbar { background: var(--navy); box-shadow: 0 1px 0 rgba(9,26,43,.14); }
.topbar-inner { min-height: 64px; }
.topbar-inner > span { color: #d8e4ee; font-size: .78rem; font-weight: 600; }
.brand { font-size: .9rem; letter-spacing: .035em; }
h1 { color: var(--ink); font-weight: 800; }
.eyebrow { color: var(--navy-mid); font-size: .72rem; letter-spacing: .12em; }
.lead { color: var(--muted); font-size: .9rem; }
button, .button { border-radius: 8px; background: var(--navy); box-shadow: none; font-weight: 700; }
button:hover, .button:hover { background: #21496b; }
button.secondary, .button.secondary { background: #eef3f7; color: var(--navy-mid); }
input, select { border-color: #cbd5df; border-radius: 8px; color: var(--ink); }
.workspace-card, .panel, .planning-board, .work-section, .team-expense-section {
  border-color: var(--line); border-radius: 12px; box-shadow: 0 7px 24px rgba(25,49,72,.045);
}
.workspace-card:hover { border-color: #9eb2c5; box-shadow: 0 9px 28px rgba(25,49,72,.08); }
.filter-link { background: #edf2f6; color: #52677a; font-weight: 650; }
.filter-link.active, .workspace-month-tab.active, .expense-month-tab.active { background: var(--navy); color: #fff; }
.plan-table, .work-table { border-color: #aebbc8; }
.plan-table-head, .work-table-head, .expense-calendar-toolbar {
  border-color: #aebbc8; background: #edf2f6; color: #33495e; font-weight: 750;
}
.plan-table-head span, .work-table-head span, .plan-list li, .work-item, .work-item.editable { border-color: var(--line); }
.work-item, .work-item.editable { min-height: 50px; }
.work-item.week-boundary { border-bottom: 2px solid #6f8295; }
.work-category-cell, .work-date, .work-main, .work-deadline-cell,
.work-item > .completion-form, .work-item > .completion-icon { border-color: var(--line); }
.work-category-cell { background: #fafbfd; }
.category-cell-label, .plan-category { color: var(--navy-mid); font-weight: 700; }
.work-date { color: #334e68; font-weight: 750; }
.work-content { color: #26394d; font-size: .88rem; }
.work-item.completed .work-content { color: #778595; text-decoration-color: #c8d0d8; }
.completion-icon, .completion-toggle {
  width: 25px; height: 25px; border-radius: 7px; border-color: #d8b984;
  background: var(--amber-soft); color: var(--amber); font-size: .78rem;
}
.completion-icon.is-done, .completion-toggle.is-done {
  border-color: #a8cfbe; background: var(--green-soft); color: var(--green);
}
.expense-calendar-item.completed { background: #e9eeec; }
.expense-calendar-actions { display: inline-flex; align-items: center; gap: .25rem; flex: 0 0 auto; }
.expense-edit { position: relative; }
.expense-edit summary { display: inline-grid; place-items: center; width: 25px; height: 25px; border: 1px solid #cbd4dc; border-radius: 7px; background: #fff; color: #557087; cursor: pointer; font-size: .78rem; font-weight: 800; list-style: none; }
.expense-edit summary::-webkit-details-marker { display: none; }
.expense-edit form { position: absolute; z-index: 8; right: 0; bottom: 2rem; display: grid; gap: .45rem; width: min(280px, 76vw); padding: .65rem; border: 1px solid #cbd5dc; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgba(25,49,72,.18); }
.expense-edit label { display: grid; gap: .2rem; color: #40566c; font-size: .7rem; font-weight: 700; }
.expense-edit input { min-height: 32px; padding: .3rem .4rem; border: 1px solid #bcc8d1; border-radius: 5px; font: .76rem inherit; }
.expense-edit button { justify-self: end; min-height: 30px; padding: .25rem .6rem; }
.asset-shortcut { border-color: #cbd9e3; border-radius: 10px; background: #f8fbfd; color: var(--navy); }
.asset-shortcut:hover { border-color: #97afc2; background: #f1f6f9; }
.shortcut-icon { border-radius: 8px; background: var(--navy); }
.asset-shell { width: min(1320px, calc(100% - 32px)); }
.asset-search { display: grid; grid-template-columns: minmax(240px,560px) auto auto; gap: .55rem; align-items: center; margin-top: 1.4rem; }
.asset-search .button { min-height: 44px; display: inline-flex; align-items: center; text-decoration: none; }
.asset-tabs { display: flex; gap: .45rem; margin: 1rem 0 .75rem; overflow-x: auto; }
.asset-tab {
  min-width: max-content; display: inline-flex; gap: .45rem; align-items: center;
  padding: .55rem .78rem; border-radius: 8px; background: #e9eef3; color: #506478;
  font-size: .8rem; font-weight: 700; text-decoration: none;
}
.asset-tab span { color: #7d8b99; font-size: .7rem; }
.asset-tab.active { background: var(--navy); color: #fff; }
.asset-tab.active span { color: #cfdae4; }
.asset-list-panel { border: 1px solid var(--line); border-radius: 12px; background: #fff; box-shadow: 0 7px 24px rgba(25,49,72,.045); overflow: hidden; }
.asset-list-heading { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .9rem 1rem; border-bottom: 1px solid var(--line); }
.asset-list-heading h2 { margin: 0; font-size: .96rem; }
.asset-list-heading span { color: var(--muted); font-size: .76rem; }
.asset-due-panel { margin: 1rem 0; border: 1px solid #e6c37a; border-radius: 12px; background: #fffaf0; overflow: hidden; }
.asset-due-panel .asset-list-heading { border-bottom-color: #f0dfb8; }
.asset-due-panel .asset-list-heading h2 { color: #744d16; }
.asset-due-panel .asset-list-heading p { margin: .3rem 0 0; color: #886b3e; font-size: .78rem; }
.asset-due-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .6rem; margin: 0; padding: .8rem 1rem; list-style: none; }
.asset-due-item { display: flex; justify-content: space-between; gap: .8rem; padding: .65rem .75rem; border: 1px solid #eddcb8; border-radius: 9px; background: rgba(255,255,255,.72); font-size: .78rem; }
.asset-due-item > div { display: grid; gap: .18rem; min-width: 0; }
.asset-due-item > div:last-child { justify-items: end; text-align: right; }
.asset-due-item span, .asset-due-item small { overflow: hidden; color: #657486; text-overflow: ellipsis; white-space: nowrap; }
.asset-due-item strong { color: #2d4e6e; }
.asset-due-item small { color: #9b6a1c; font-weight: 700; }
.asset-due-item.is-overdue { border-color: #e2aaa4; background: #fff1ef; }
.asset-due-item.is-overdue small { color: #aa3d32; }
.asset-sms { margin-top: .35rem; }
.asset-sms summary { color: #375b80; cursor: pointer; font-size: .72rem; font-weight: 800; white-space: nowrap; }
.asset-sms-editor { display: grid; gap: .35rem; min-width: 260px; margin-top: .35rem; padding: .55rem; border: 1px solid #d9e0e9; border-radius: 7px; background: #fff; }
.asset-sms-editor textarea { width: 100%; min-height: 78px; padding: .45rem; border: 1px solid #cbd5df; font: .72rem/1.45 inherit; resize: vertical; }
.asset-sms-editor > div { display: flex; align-items: center; justify-content: space-between; gap: .45rem; }
.asset-sms-editor button { min-height: 30px; padding: .25rem .5rem; white-space: nowrap; }
.asset-sms-editor small { color: #6b7888; font-size: .68rem; font-weight: 500; }
.asset-table-wrap { overflow-x: auto; }
.asset-table { width: 100%; min-width: 980px; border-collapse: collapse; font-size: .82rem; }
.asset-table th { padding: .62rem .72rem; border-bottom: 1px solid #aebbc8; background: #edf2f6; color: #41566b; font-size: .73rem; font-weight: 750; text-align: left; }
.asset-table td { padding: .7rem .72rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
.asset-table tbody tr.asset-row { position: relative; cursor: pointer; transition: background-color .12s ease; }
.asset-table tbody tr.asset-row:hover { background: #eaf1f6; }
.asset-table tbody tr.asset-row:focus-within { outline: 2px solid #6b91b1; outline-offset: -2px; }
.asset-history-link { color: inherit; text-decoration: none; }
.asset-history-link::after { content: ""; position: absolute; inset: 0; }
.asset-row-actions { position: relative; z-index: 1; width: 1%; white-space: nowrap; }
.asset-edit-link { position: relative; z-index: 1; min-height: 34px; padding: .35rem .6rem; text-decoration: none; }
.asset-table tbody tr:last-child td { border-bottom: 0; }
.asset-table td:first-child { color: #234f73; font-variant-numeric: tabular-nums; }
.asset-type { display: inline-flex; padding: .22rem .48rem; border-radius: 6px; background: #edf3f7; color: #3f607b; font-size: .72rem; font-weight: 700; }
.asset-empty { padding: 2rem !important; color: var(--muted); text-align: center; }
.asset-pagination { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; padding: .8rem 1rem; border-top: 1px solid var(--line); color: var(--muted); font-size: .78rem; }
.asset-pagination > :last-child { justify-self: end; }
.asset-pagination .button { min-height: 36px; padding: .45rem .7rem; text-decoration: none; }
.asset-history-panel { margin-top: 1rem; border: 1px solid var(--line); border-radius: 12px; background: #fff; box-shadow: 0 7px 24px rgba(25,49,72,.045); overflow: hidden; }
.asset-history-panel .asset-list-heading p { margin: .3rem 0 0; color: var(--muted); font-size: .78rem; }
.asset-history-table { min-width: 760px; }
.asset-current-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .7rem; margin: 1rem 0; }
.asset-current-details > div { padding: .8rem 1rem; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.76); }
.asset-current-details dt { color: var(--muted); font-size: .74rem; }
.asset-current-details dd { margin: .3rem 0 0; font-weight: 700; }
@media (max-width: 640px) {
  .asset-shell { width: min(100% - 20px, 1320px); }
  .asset-search { grid-template-columns: 1fr auto; }
  .asset-search .button { grid-column: 1 / -1; justify-content: center; }
  .asset-current-details { grid-template-columns: 1fr; }
}

/* 포털형 홈과 개인 업무공간의 시각적 리듬 */
body {
  background:
    radial-gradient(circle at 8% 5%, rgba(65,145,176,.10), transparent 26rem),
    radial-gradient(circle at 92% 4%, rgba(226,153,87,.10), transparent 23rem),
    #f2f5f8;
}
.topbar { background: linear-gradient(105deg, #152f4a 0%, #1d425d 68%, #276879 100%); }
.brand { display: inline-flex; align-items: center; gap: .62rem; }
.brand::before {
  content: ''; width: 26px; height: 26px; border-radius: 8px;
  background:
    linear-gradient(#fff,#fff) 6px 6px/6px 6px no-repeat,
    linear-gradient(#8fd3c7,#8fd3c7) 14px 6px/6px 6px no-repeat,
    linear-gradient(#f6b66e,#f6b66e) 6px 14px/6px 6px no-repeat,
    linear-gradient(#fff,#fff) 14px 14px/6px 6px no-repeat,
    rgba(255,255,255,.13);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.18);
}
.home-hero {
  position: relative; display: flex; justify-content: space-between; align-items: center;
  min-height: 170px; padding: 1.8rem 2rem; border: 1px solid #d6e1e9; border-radius: 18px;
  background: linear-gradient(120deg, rgba(255,255,255,.98), rgba(235,246,248,.96) 62%, rgba(255,242,225,.88));
  box-shadow: 0 14px 38px rgba(33,63,86,.08); overflow: hidden;
}
.home-hero::after {
  content: ''; position: absolute; right: -65px; bottom: -95px; width: 230px; height: 230px;
  border: 42px solid rgba(43,121,137,.08); border-radius: 50%;
}
.home-hero h1 { font-size: clamp(2rem,4.2vw,3rem); }
.hero-decoration { position: relative; z-index: 1; width: 150px; height: 86px; display: block; }
.hero-decoration i { position: absolute; display: block; border-radius: 50%; box-shadow: 0 10px 24px rgba(38,69,87,.12); }
.hero-decoration i:nth-child(1) { width: 74px; height: 74px; right: 8px; top: 4px; background: #4b9aa7; }
.hero-decoration i:nth-child(2) { width: 45px; height: 45px; right: 78px; top: 32px; background: #f1a866; }
.hero-decoration i:nth-child(3) { width: 28px; height: 28px; right: 66px; top: 3px; background: #7c91c9; }
.home-shortcuts { grid-template-columns: repeat(3,minmax(0,1fr)); gap: .8rem; margin-top: 1.15rem; }
.portal-shortcut {
  position: relative; display: grid; grid-template-columns: 42px minmax(0,1fr) auto; gap: .75rem;
  align-items: center; min-height: 82px; padding: .85rem 1rem; border: 1px solid var(--line);
  border-radius: 13px; background: rgba(255,255,255,.92); color: var(--ink);
  box-shadow: 0 6px 20px rgba(25,49,72,.05); text-decoration: none; overflow: hidden;
  transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
}
.portal-shortcut::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--module-color); }
.portal-shortcut:hover { transform: translateY(-2px); border-color: #b6c5d1; box-shadow: 0 10px 25px rgba(25,49,72,.10); }
.portal-shortcut > span:nth-child(2) { display: grid; gap: .18rem; }
.portal-shortcut strong { font-size: .88rem; }
.portal-shortcut small { color: var(--muted); font-size: .72rem; }
.portal-shortcut > span:last-child { color: #8292a1; }
.portal-shortcut .shortcut-icon {
  width: 40px; height: 40px; border-radius: 12px; background: var(--module-soft);
  color: var(--module-color); font-size: 1rem; box-shadow: none;
}
.shortcut-work { --module-color: #34798b; --module-soft: #e4f3f4; }
.shortcut-asset { --module-color: #6172b9; --module-soft: #eceefb; }
.shortcut-expense { --module-color: #cf7b36; --module-soft: #fff0e2; }
.portal-section-heading {
  display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin: 2rem 0 .75rem;
}
.portal-section-heading > div { display: grid; gap: .1rem; }
.portal-section-heading span { color: #3d8391; font-size: .68rem; font-weight: 850; letter-spacing: .12em; }
.portal-section-heading h2 { margin: 0; font-size: 1.12rem; }
.portal-section-heading small { color: var(--muted); font-size: .75rem; }
.workspace-grid { margin-top: 0; }
.workspace-card { position: relative; border-top: 4px solid var(--card-color); overflow: hidden; }
.workspace-card::after {
  content: ''; position: absolute; width: 88px; height: 88px; right: -46px; top: -48px;
  border-radius: 50%; background: var(--card-soft);
}
.workspace-card-1 { --card-color: #428b99; --card-soft: #dff0f1; }
.workspace-card-2 { --card-color: #6b76b9; --card-soft: #e6e8f8; }
.workspace-card-3 { --card-color: #d08343; --card-soft: #fbe9d9; }
.workspace-card-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; margin-bottom: .65rem; }
.workspace-avatar {
  display: grid; place-items: center; width: 38px; height: 38px; border-radius: 12px;
  background: var(--card-soft); color: var(--card-color); font-weight: 850;
}
.card-arrow { color: #7e8d9c; font-size: 1rem; }
.workspace-card .counts { margin: .8rem 0; }
.workspace-card .count { border-radius: 7px; background: #edf3f7; }
.workspace-card .count.incomplete { background: #fff0df; color: #9a5e23; }
.workspace-hero {
  display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 1rem;
  margin-bottom: 1rem; padding: 1.15rem 1.3rem; border: 1px solid #d7e2e8; border-radius: 16px;
  background: linear-gradient(120deg,#fff 0%,#eff7f8 72%,#fff0df 130%);
  box-shadow: 0 10px 28px rgba(32,63,85,.07);
}
.workspace-hero-avatar {
  display: grid; place-items: center; width: 58px; height: 58px; border-radius: 18px;
  background: linear-gradient(145deg,#2f7182,#4c93a0); color: #fff; font-size: 1.25rem;
  font-weight: 850; box-shadow: 0 8px 20px rgba(47,113,130,.20);
}
.workspace-hero .back { margin: 0 0 .22rem; font-size: .72rem; text-decoration: none; }
.workspace-hero .eyebrow { margin-bottom: .15rem; font-size: .62rem; }
.workspace-hero h1 { font-size: clamp(1.45rem,3vw,2rem); }
.status { border: 1px solid #a8cfbe; background: var(--green-soft); color: var(--green); }
.status.readonly { border-color: #d2dbe3; background: #f3f6f8; color: #657689; }
.planning-board { position: relative; border: 0; box-shadow: 0 8px 25px rgba(25,49,72,.06); }
.planning-board::before { content: ''; position: absolute; inset: 0 auto 0 0; z-index: 1; width: 5px; background: linear-gradient(#5e78b8,#8e77b5); }
.monthly-plan { background: linear-gradient(135deg,#fbfbff,#f7f5fb); }
.monthly-plan .month-title { color: #5e5790; }
.workspace-month-tab.active { background: #615c91; }
.work-section { position: relative; overflow: visible; }
.work-section::before { content: ''; position: absolute; inset: 0 0 auto; height: 3px; background: linear-gradient(90deg,#3c8493,#6a79b7,#dc8b48); }
.team-expense-section { border-top: 4px solid #d08343; }
.asset-page-heading {
  position: relative; padding: 1.35rem 1.5rem; border: 1px solid #d9e0ee; border-radius: 16px;
  background: linear-gradient(125deg,#fff 0%,#f0f1fb 70%,#e8f5f2 120%); overflow: hidden;
}
.asset-page-heading::after { content: '▦'; position: absolute; right: 1.5rem; top: .55rem; color: rgba(97,114,185,.14); font-size: 6rem; line-height: 1; }
@media (max-width: 820px) {
  .home-shortcuts { grid-template-columns: 1fr; }
  .home-hero { min-height: 150px; padding: 1.35rem; }
  .hero-decoration { width: 105px; transform: scale(.75); transform-origin: right center; }
  .workspace-hero { grid-template-columns: auto 1fr; }
  .workspace-hero .status { grid-column: 1 / -1; width: fit-content; }
}
@media (max-width: 520px) {
  .home-hero { min-height: auto; }
  .hero-decoration { display: none; }
  .portal-section-heading { align-items: start; flex-direction: column; }
  .workspace-hero { grid-template-columns: 1fr; }
  .workspace-hero-avatar { width: 48px; height: 48px; border-radius: 14px; }
}

/* 크리에이티브 포털 방향: 에디토리얼 타이포·컬러 블록·벤토 구성 */
:root {
  --creative-purple: #6c4cf5;
  --creative-violet: #9a7bff;
  --creative-coral: #ff6b5f;
  --creative-mint: #40c9a2;
  --creative-yellow: #ffd166;
  --creative-black: #17181d;
}
body {
  background:
    radial-gradient(circle at 12% 8%, rgba(108,76,245,.12), transparent 24rem),
    radial-gradient(circle at 88% 10%, rgba(255,107,95,.10), transparent 22rem),
    radial-gradient(#d9d6e3 0.7px, transparent 0.7px) 0 0/20px 20px,
    #f7f6f3;
}
.topbar {
  margin: 12px auto 0; width: min(1320px, calc(100% - 24px)); border: 1px solid rgba(23,24,29,.09);
  border-radius: 15px; background: rgba(255,255,255,.88); color: var(--creative-black);
  box-shadow: 0 12px 35px rgba(42,36,66,.08); backdrop-filter: blur(14px);
}
.topbar-inner { width: calc(100% - 28px); min-height: 58px; }
.topbar-inner > span { color: #777280; }
.brand { color: var(--creative-black); font-weight: 900; letter-spacing: -.01em; }
.brand::before {
  background:
    linear-gradient(var(--creative-purple),var(--creative-purple)) 5px 5px/7px 7px no-repeat,
    linear-gradient(var(--creative-coral),var(--creative-coral)) 14px 5px/7px 7px no-repeat,
    linear-gradient(var(--creative-mint),var(--creative-mint)) 5px 14px/7px 7px no-repeat,
    linear-gradient(var(--creative-yellow),var(--creative-yellow)) 14px 14px/7px 7px no-repeat,
    #17181d;
  border-radius: 9px; transform: rotate(-4deg); box-shadow: none;
}
main.shell { padding-top: 1.45rem; }
.home-hero {
  min-height: 230px; padding: 2.3rem 2.5rem; border: 0; border-radius: 26px;
  background: var(--creative-black); color: #fff; box-shadow: 0 24px 60px rgba(30,25,48,.18);
}
.home-hero::before {
  content: 'WORK / FLOW'; position: absolute; right: 2.5rem; bottom: 1.3rem;
  color: rgba(255,255,255,.08); font-size: clamp(2rem,6vw,5.5rem); font-weight: 950;
  letter-spacing: -.07em; white-space: nowrap;
}
.home-hero::after {
  right: -72px; bottom: -115px; width: 310px; height: 310px; border: 60px solid rgba(108,76,245,.68);
}
.home-hero h1 { color: #fff; font-size: clamp(2.7rem,6vw,5rem); line-height: .98; letter-spacing: -.065em; }
.home-hero .eyebrow { color: var(--creative-yellow); }
.home-hero .lead { color: rgba(255,255,255,.7); font-size: .95rem; }
.hero-decoration { width: 210px; height: 130px; transform: rotate(-5deg); }
.hero-decoration i { border: 4px solid rgba(255,255,255,.08); box-shadow: 0 18px 40px rgba(0,0,0,.28); }
.hero-decoration i:nth-child(1) { width: 105px; height: 105px; right: 8px; top: 8px; background: var(--creative-purple); }
.hero-decoration i:nth-child(2) { width: 66px; height: 66px; right: 105px; top: 57px; background: var(--creative-coral); }
.hero-decoration i:nth-child(3) { width: 42px; height: 42px; right: 92px; top: 3px; background: var(--creative-mint); }
.home-shortcuts { gap: .9rem; margin-top: .95rem; }
.portal-shortcut {
  min-height: 112px; padding: 1.2rem; border: 0; border-radius: 20px;
  background: var(--module-soft); box-shadow: none;
}
.portal-shortcut::before { width: 0; }
.portal-shortcut:hover { transform: translateY(-4px) rotate(-.25deg); border-color: transparent; box-shadow: 0 15px 34px rgba(35,29,58,.12); }
.portal-shortcut strong { color: var(--creative-black); font-size: 1rem; font-weight: 850; }
.portal-shortcut small { color: rgba(23,24,29,.62); font-size: .75rem; }
.portal-shortcut .shortcut-icon {
  width: 48px; height: 48px; border-radius: 15px; background: var(--module-color);
  color: #fff; font-size: 1.08rem; box-shadow: 0 10px 20px color-mix(in srgb,var(--module-color) 28%,transparent);
}
.portal-shortcut > span:last-child { color: rgba(23,24,29,.55); font-size: 1.15rem; }
.shortcut-work { --module-color: #197d71; --module-soft: #ccefe7; }
.shortcut-asset { --module-color: var(--creative-purple); --module-soft: #e5ddff; }
.shortcut-expense { --module-color: #d9574e; --module-soft: #ffd9d1; }
.portal-section-heading { margin-top: 2.5rem; }
.portal-section-heading span { color: var(--creative-purple); }
.portal-section-heading h2 { font-size: 1.35rem; letter-spacing: -.035em; }
.workspace-grid { gap: .9rem; }
.workspace-card {
  min-height: 225px; padding: 1.35rem; border: 0; border-top: 0; border-radius: 21px;
  background: var(--card-bg); box-shadow: none; transition: transform .16s ease, box-shadow .16s ease;
}
.workspace-card:hover { transform: translateY(-4px); border-color: transparent; box-shadow: 0 16px 38px rgba(38,31,61,.12); }
.workspace-card::after { width: 130px; height: 130px; right: -62px; top: -68px; background: var(--card-color); opacity: .13; }
.workspace-card-1 { --card-color: #18796f; --card-soft: #b9e6dc; --card-bg: #eefaf6; }
.workspace-card-2 { --card-color: #6949dd; --card-soft: #d9d0fb; --card-bg: #f5f1ff; }
.workspace-card-3 { --card-color: #d25d4f; --card-soft: #ffd2ca; --card-bg: #fff3ef; }
.workspace-avatar { width: 44px; height: 44px; border-radius: 14px; background: var(--card-color); color: #fff; }
.workspace-card .card-heading h2 { font-size: 1.35rem; letter-spacing: -.03em; }
.workspace-card .count { background: rgba(255,255,255,.70); color: var(--card-color); }
.workspace-card .count.incomplete { background: rgba(255,255,255,.78); color: #9b453c; }
.workspace-card .recent { color: #62606a; font-size: .84rem; }
.workspace-hero {
  min-height: 142px; padding: 1.5rem 1.7rem; border: 0; border-radius: 23px;
  background: linear-gradient(115deg,#5939dd 0%,#7c5cf5 56%,#a989ff 100%);
  box-shadow: 0 20px 45px rgba(82,58,177,.20); overflow: hidden;
}
.workspace-hero::after {
  content: ''; position: absolute; right: 10%; top: -85px; width: 190px; height: 190px;
  border: 36px solid rgba(255,209,102,.34); border-radius: 50%;
}
.workspace-hero { position: relative; }
.workspace-hero > * { position: relative; z-index: 1; }
.workspace-hero-avatar { background: #fff; color: var(--creative-purple); box-shadow: 0 12px 28px rgba(39,23,105,.22); }
.workspace-hero h1, .workspace-hero .back { color: #fff; }
.workspace-hero .eyebrow { color: #e5dcff; }
.workspace-hero .status { border-color: rgba(255,255,255,.30); background: rgba(255,255,255,.18); color: #fff; backdrop-filter: blur(8px); }
.workspace-hero .status.readonly { border-color: rgba(255,255,255,.25); background: rgba(24,16,63,.18); color: #fff; }
.unlock-strip, .create-strip { border: 0; border-radius: 15px; box-shadow: 0 8px 24px rgba(35,29,58,.07); }
button, .button { background: var(--creative-black); }
button:hover, .button:hover { background: var(--creative-purple); }
.filter-link.active { background: var(--creative-black); }
.planning-board { border-radius: 19px; }
.planning-board::before { width: 7px; background: linear-gradient(var(--creative-purple),var(--creative-coral)); }
.monthly-plan { background: linear-gradient(135deg,#faf8ff,#f1edff); }
.monthly-plan .month-title { color: var(--creative-purple); font-size: 1.9rem; }
.workspace-month-tab.active { background: var(--creative-purple); }
.work-section { border: 0; border-radius: 19px; box-shadow: 0 12px 34px rgba(35,29,58,.08); }
.work-section::before { height: 5px; background: linear-gradient(90deg,var(--creative-purple),var(--creative-coral),var(--creative-yellow),var(--creative-mint)); }
.work-table { border-color: #d3d0d9; border-radius: 10px; }
.work-table-head, .plan-table-head { background: #f1eff5; color: #383541; }
.work-item:hover { background: #faf8ff; }
.completion-icon:not(.is-done), .completion-toggle:not(.is-done) { border-color: #ffc2ba; background: #fff0ed; color: #db554a; }
.completion-icon.is-done, .completion-toggle.is-done { border-color: #9edbc8; background: #e6f8f2; color: #18796f; }
.team-expense-section { border: 0; border-radius: 21px; border-top: 0; box-shadow: 0 12px 34px rgba(35,29,58,.08); }
.team-expense-section > .section-heading { padding-left: .75rem; border-left: 5px solid var(--creative-coral); }
.expense-calendar-toolbar { background: #f3edff; }
.expense-month-tab.active { background: var(--creative-purple); }
.asset-page-heading {
  min-height: 165px; display: grid; align-content: center; padding: 1.7rem 1.9rem; border: 0; border-radius: 23px;
  background: linear-gradient(120deg,#2b2048 0%,#5939aa 68%,#7d60da 100%); box-shadow: 0 20px 45px rgba(61,42,114,.18);
}
.asset-page-heading h1 { color: #fff; font-size: clamp(2.3rem,5vw,4rem); }
.asset-page-heading .eyebrow { color: var(--creative-yellow); }
.asset-page-heading .lead { color: rgba(255,255,255,.72); }
.asset-page-heading::after { right: 2rem; top: .45rem; color: rgba(255,255,255,.12); font-size: 8rem; transform: rotate(8deg); }
.asset-tab.active { background: var(--creative-purple); }
.asset-list-panel { border: 0; border-radius: 19px; box-shadow: 0 12px 34px rgba(35,29,58,.08); }
@media (max-width: 820px) {
  .topbar { margin-top: 6px; width: min(100% - 12px,1320px); }
  .home-hero { min-height: 190px; padding: 1.7rem; }
  .home-hero h1 { font-size: clamp(2.4rem,12vw,4rem); }
  .portal-shortcut { min-height: 92px; }
}

/* 스모키 글라스 포털: 저채도 색감·반투명 레이어·절제된 입체감 */
:root {
  --glass-ink: #20212b;
  --glass-indigo: #68658f;
  --glass-blue: #70889a;
  --glass-mauve: #93848e;
  --glass-line: rgba(255,255,255,.72);
  --glass-shadow: 0 22px 55px rgba(54,52,72,.12);
}
body {
  position: relative; isolation: isolate;
  background:
    linear-gradient(rgba(255,255,255,.38),rgba(255,255,255,.38)),
    repeating-linear-gradient(90deg,transparent 0 79px,rgba(91,92,117,.045) 80px),
    repeating-linear-gradient(0deg,transparent 0 79px,rgba(91,92,117,.045) 80px),
    #e9e9ee;
}
body::before, body::after {
  content: ''; position: fixed; z-index: -1; pointer-events: none;
  border: 1px solid rgba(255,255,255,.62); box-shadow: inset 0 1px 0 rgba(255,255,255,.55);
  backdrop-filter: blur(2px);
}
body::before {
  width: min(48vw,650px); height: min(42vw,520px); left: -11vw; top: 7vh;
  border-radius: 110px; background: linear-gradient(135deg,rgba(120,143,164,.30),rgba(120,113,151,.16));
  transform: rotate(-12deg);
}
body::after {
  width: min(40vw,540px); height: min(36vw,470px); right: -10vw; bottom: -5vh;
  border-radius: 50% 32% 44% 38%; background: linear-gradient(145deg,rgba(157,142,151,.22),rgba(112,136,154,.14));
  transform: rotate(18deg);
}
.topbar {
  border-color: var(--glass-line); background: rgba(248,248,251,.70); color: var(--glass-ink);
  box-shadow: 0 14px 40px rgba(48,47,62,.09), inset 0 1px 0 #fff;
  backdrop-filter: blur(22px) saturate(125%);
}
.brand::before {
  background:
    linear-gradient(#e8e7ef,#e8e7ef) 5px 5px/7px 7px no-repeat,
    linear-gradient(#a9a6bd,#a9a6bd) 14px 5px/7px 7px no-repeat,
    linear-gradient(#77738f,#77738f) 5px 14px/7px 7px no-repeat,
    linear-gradient(#f7f6f9,#f7f6f9) 14px 14px/7px 7px no-repeat,
    #343440;
}
.home-hero {
  border: 1px solid rgba(255,255,255,.34);
  background:
    linear-gradient(118deg,rgba(30,31,42,.93),rgba(54,54,72,.86)),
    rgba(31,32,43,.88);
  box-shadow: 0 28px 70px rgba(43,42,58,.20), inset 0 1px 0 rgba(255,255,255,.14);
  backdrop-filter: blur(24px);
}
.home-hero::before { color: rgba(255,255,255,.055); }
.home-hero::after {
  right: -85px; bottom: -130px; width: 330px; height: 330px;
  border-color: rgba(147,141,185,.27); background: transparent;
}
.home-hero .eyebrow { color: #c6c2d8; }
.hero-decoration { transform: rotate(-5deg); }
.hero-decoration i { border-color: rgba(255,255,255,.23); box-shadow: 0 20px 46px rgba(5,6,12,.30), inset 0 1px 0 rgba(255,255,255,.28); backdrop-filter: blur(12px); }
.hero-decoration i:nth-child(1) { background: linear-gradient(145deg,rgba(126,121,165,.92),rgba(79,79,105,.80)); }
.hero-decoration i:nth-child(2) { background: linear-gradient(145deg,rgba(151,137,146,.88),rgba(101,91,106,.78)); }
.hero-decoration i:nth-child(3) { background: linear-gradient(145deg,rgba(128,151,166,.90),rgba(83,105,121,.78)); }
.portal-shortcut {
  border: 1px solid var(--glass-line); background: rgba(255,255,255,.56);
  box-shadow: 0 16px 40px rgba(59,57,75,.08), inset 0 1px 0 rgba(255,255,255,.90);
  backdrop-filter: blur(20px) saturate(118%);
}
.portal-shortcut:hover { background: rgba(255,255,255,.73); box-shadow: 0 22px 48px rgba(54,52,72,.14), inset 0 1px 0 #fff; }
.shortcut-work, .shortcut-asset, .shortcut-expense { --module-soft: rgba(255,255,255,.56); }
.shortcut-work { --module-color: #667f86; }
.shortcut-asset { --module-color: #6d698f; }
.shortcut-expense { --module-color: #8c747d; }
.portal-shortcut .shortcut-icon {
  background: linear-gradient(145deg,color-mix(in srgb,var(--module-color) 84%,white),var(--module-color));
  box-shadow: 0 10px 24px color-mix(in srgb,var(--module-color) 22%,transparent), inset 0 1px 0 rgba(255,255,255,.30);
}
.portal-section-heading span { color: var(--glass-indigo); }
.workspace-card {
  border: 1px solid var(--glass-line); background: rgba(255,255,255,.55);
  box-shadow: 0 18px 44px rgba(58,56,73,.085), inset 0 1px 0 rgba(255,255,255,.92);
  backdrop-filter: blur(20px) saturate(112%);
}
.workspace-card:hover { background: rgba(255,255,255,.74); box-shadow: 0 25px 55px rgba(52,50,68,.14), inset 0 1px 0 #fff; }
.workspace-card-1, .workspace-card-2, .workspace-card-3 {
  --card-color: #6e6b8f; --card-soft: rgba(112,107,145,.14); --card-bg: rgba(255,255,255,.55);
}
.workspace-card::after { background: linear-gradient(145deg,rgba(111,108,143,.34),rgba(137,153,166,.12)); opacity: 1; filter: blur(2px); }
.workspace-avatar { background: linear-gradient(145deg,#8884aa,#5f5d7c); box-shadow: 0 10px 24px rgba(70,67,96,.18); }
.workspace-card .count, .workspace-card .count.incomplete { background: rgba(255,255,255,.68); color: #68667e; }
.workspace-hero {
  border: 1px solid rgba(255,255,255,.36);
  background: linear-gradient(120deg,rgba(63,62,83,.94),rgba(91,88,119,.84));
  box-shadow: 0 25px 60px rgba(55,53,76,.18), inset 0 1px 0 rgba(255,255,255,.16);
  backdrop-filter: blur(22px);
}
.workspace-hero::after { border-color: rgba(194,190,217,.20); }
.workspace-hero-avatar { color: #5e5a7c; box-shadow: 0 12px 30px rgba(26,25,38,.22); }
.unlock-strip, .create-strip, .planning-board, .work-section, .team-expense-section, .asset-list-panel {
  border: 1px solid var(--glass-line); background-color: rgba(255,255,255,.62);
  box-shadow: var(--glass-shadow), inset 0 1px 0 rgba(255,255,255,.90);
  backdrop-filter: blur(22px) saturate(112%);
}
.planning-board::before { background: linear-gradient(#777294,#8c8490); }
.monthly-plan { background: linear-gradient(135deg,rgba(248,247,252,.78),rgba(236,235,244,.70)); }
.monthly-plan .month-title { color: #666181; }
.workspace-month-tab.active, .filter-link.active, .expense-month-tab.active, .asset-tab.active { background: #5e5b73; }
.work-section::before { height: 4px; background: linear-gradient(90deg,#66627f,#8696a2); }
.team-expense-section > .section-heading { border-left-color: #8a7780; }
.asset-page-heading {
  border: 1px solid rgba(255,255,255,.36);
  background: linear-gradient(120deg,rgba(52,52,69,.94),rgba(86,83,111,.84));
  box-shadow: 0 25px 60px rgba(55,53,76,.18), inset 0 1px 0 rgba(255,255,255,.16);
  backdrop-filter: blur(22px);
}
.asset-page-heading .eyebrow { color: #cbc7da; }
.asset-page-heading::after { color: rgba(255,255,255,.09); }
.asset-tab { border: 1px solid rgba(255,255,255,.65); background: rgba(255,255,255,.46); backdrop-filter: blur(14px); }
.asset-search input { background: rgba(255,255,255,.72); backdrop-filter: blur(14px); }
button, .button { background: #3d3c49; }
button:hover, .button:hover { background: #5f5b7d; }
@media (prefers-reduced-motion: no-preference) {
  .portal-shortcut, .workspace-card { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
}

/* 에디토리얼 포털: 크림 여백·코발트 포스터·겹치는 정보판 */
:root {
  --editorial-paper: #f2efe9;
  --editorial-panel: #e4dfd5;
  --editorial-blue: #2454c6;
  --editorial-blue-dark: #173b98;
  --editorial-ink: #151515;
  --editorial-lilac: #d7cee8;
}
body {
  background: var(--editorial-paper);
  color: var(--editorial-ink);
}
body::before {
  width: 310px; height: 430px; left: -155px; top: 22vh; border: 1px solid rgba(36,84,198,.13);
  border-radius: 0; background: rgba(215,206,232,.24); transform: rotate(8deg); backdrop-filter: blur(8px);
}
body::after {
  width: 360px; height: 360px; right: -190px; bottom: 4vh; border: 56px solid rgba(36,84,198,.07);
  border-radius: 50%; background: transparent; transform: none; backdrop-filter: none;
}
.topbar {
  margin-top: 0; width: 100%; border: 0; border-radius: 0; background: rgba(242,239,233,.88);
  box-shadow: none; backdrop-filter: blur(16px);
}
.topbar::after { content: ''; display: block; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: rgba(21,21,21,.10); }
.topbar { position: relative; }
.topbar-inner { width: min(1320px,calc(100% - 32px)); min-height: 76px; }
.brand { font-size: .88rem; letter-spacing: -.015em; }
.brand::before {
  width: 20px; height: 20px; border-radius: 2px; transform: rotate(45deg);
  background: linear-gradient(135deg,var(--editorial-ink) 0 45%,transparent 45% 56%,var(--editorial-ink) 56%);
}
.topbar-inner > span { color: #6f6c67; font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; }
main.shell { padding-top: 2.1rem; }
.home-hero {
  min-height: 310px; display: grid; grid-template-columns: minmax(0,1fr) 240px; align-items: end;
  padding: 2.5rem 2.8rem 4.8rem; border: 0; border-radius: 4px;
  background:
    linear-gradient(115deg,rgba(36,84,198,.98),rgba(31,72,176,.95)),
    var(--editorial-blue);
  box-shadow: 0 22px 42px rgba(36,49,83,.18); overflow: hidden;
}
.home-hero::before {
  content: 'TEAM\A WORKSPACE'; right: 2.4rem; bottom: 1.8rem; color: rgba(255,255,255,.12);
  font-size: clamp(3.3rem,8vw,7.8rem); font-weight: 900; line-height: .78; letter-spacing: -.08em;
  white-space: pre; text-align: right;
}
.home-hero::after {
  width: 260px; height: 260px; right: 88px; bottom: -145px; border: 1px solid rgba(255,255,255,.45);
  background: rgba(255,255,255,.06);
}
.home-hero h1 { font-size: clamp(3rem,7vw,6.5rem); font-weight: 800; letter-spacing: -.075em; }
.home-hero .eyebrow { color: #fff; font-size: .68rem; letter-spacing: .28em; }
.home-hero .lead { max-width: 440px; color: rgba(255,255,255,.77); }
.hero-decoration { width: 210px; height: 160px; margin-bottom: 1.5rem; transform: none; }
.hero-decoration i { border: 0; border-radius: 2px; box-shadow: 14px 18px 0 rgba(16,35,88,.18); backdrop-filter: blur(6px); }
.hero-decoration i:nth-child(1) { width: 125px; height: 125px; right: 0; top: 10px; background: rgba(234,228,217,.92); }
.hero-decoration i:nth-child(2) { width: 72px; height: 72px; right: 112px; top: 76px; background: rgba(215,206,232,.92); }
.hero-decoration i:nth-child(3) { width: 42px; height: 42px; right: 98px; top: 6px; border-radius: 50%; background: rgba(255,255,255,.68); }
.home-shortcuts {
  position: relative; z-index: 2; width: calc(100% - 88px); margin: -44px auto 0;
  gap: 0; border: 1px solid rgba(21,21,21,.08); background: rgba(229,224,214,.88);
  box-shadow: 0 22px 42px rgba(42,39,35,.13); backdrop-filter: blur(18px);
}
.portal-shortcut {
  min-height: 112px; padding: 1.1rem 1.25rem; border: 0; border-right: 1px solid rgba(21,21,21,.11);
  border-radius: 0; background: transparent; box-shadow: none; backdrop-filter: none;
}
.portal-shortcut:last-child { border-right: 0; }
.portal-shortcut:hover { transform: none; background: rgba(255,255,255,.46); box-shadow: none; }
.portal-shortcut .shortcut-icon {
  width: 42px; height: 42px; border-radius: 50%; background: var(--editorial-ink); color: #fff;
  box-shadow: none;
}
.shortcut-work, .shortcut-asset, .shortcut-expense { --module-color: var(--editorial-ink); --module-soft: transparent; }
.portal-shortcut strong { font-size: .94rem; }
.portal-shortcut small { color: #6e6a63; }
.portal-section-heading { margin-top: 3.1rem; padding: 0 .25rem; border-bottom: 1px solid rgba(21,21,21,.15); padding-bottom: .75rem; }
.portal-section-heading span { color: var(--editorial-blue); letter-spacing: .25em; }
.portal-section-heading h2 { font-size: 1.2rem; }
.workspace-grid { counter-reset: workspace-card; gap: 1rem; }
.workspace-card {
  counter-increment: workspace-card; min-height: 230px; padding: 1.3rem; border: 1px solid rgba(21,21,21,.08);
  border-radius: 3px; background: rgba(255,255,255,.74); box-shadow: 0 15px 30px rgba(45,42,38,.08);
  backdrop-filter: blur(10px);
}
.workspace-card:hover { transform: translateY(-3px); background: #fff; box-shadow: 0 20px 38px rgba(45,42,38,.13); }
.workspace-card::before {
  content: '0' counter(workspace-card); position: absolute; right: 1.2rem; bottom: .8rem;
  color: rgba(36,84,198,.11); font-size: 4.5rem; font-weight: 900; line-height: 1;
}
.workspace-card::after { width: 5px; height: 58px; right: auto; left: 0; top: 25px; border-radius: 0; background: var(--editorial-blue); opacity: 1; filter: none; }
.workspace-card-1, .workspace-card-2, .workspace-card-3 {
  --card-color: var(--editorial-blue); --card-soft: #e5e2dc; --card-bg: rgba(255,255,255,.74);
}
.workspace-avatar { border-radius: 50%; background: var(--editorial-blue); box-shadow: 0 8px 16px rgba(36,84,198,.18); }
.workspace-card .count, .workspace-card .count.incomplete {
  border: 1px solid rgba(21,21,21,.08); border-radius: 2px; background: #efebe4; color: #4f4b45;
}
.workspace-hero {
  min-height: 180px; padding: 1.7rem 2rem; border: 0; border-radius: 4px;
  background: var(--editorial-blue); box-shadow: 0 20px 40px rgba(36,49,83,.17);
}
.workspace-hero::before {
  content: 'WORK LOG'; position: absolute; right: 1.8rem; bottom: -.25rem;
  color: rgba(255,255,255,.13); font-size: clamp(3.6rem,8vw,7rem); font-weight: 900; letter-spacing: -.08em;
}
.workspace-hero::after { width: 170px; height: 170px; right: 12%; top: -90px; border: 1px solid rgba(255,255,255,.42); background: rgba(255,255,255,.05); }
.workspace-hero-avatar { border-radius: 50%; color: var(--editorial-blue); }
.unlock-strip, .create-strip, .planning-board, .work-section, .team-expense-section, .asset-list-panel {
  border: 1px solid rgba(21,21,21,.08); border-radius: 3px; background: rgba(255,255,255,.76);
  box-shadow: 0 14px 30px rgba(45,42,38,.08); backdrop-filter: blur(12px);
}
.planning-board::before { width: 5px; background: var(--editorial-blue); }
.monthly-plan { background: rgba(228,223,213,.58); }
.monthly-plan .month-title { color: var(--editorial-blue); }
.workspace-month-tab.active, .filter-link.active, .expense-month-tab.active, .asset-tab.active { background: var(--editorial-blue); }
.work-section::before { height: 3px; background: var(--editorial-blue); }
.work-table, .plan-table { border-color: #c9c3b9; border-radius: 0; }
.work-table-head, .plan-table-head, .expense-calendar-toolbar { background: #e8e3da; color: #2e2c29; }
.work-item:hover { background: #f5f2ed; }
.team-expense-section > .section-heading { border-left-color: var(--editorial-blue); }
.asset-page-heading {
  min-height: 210px; padding: 2rem 2.3rem; border: 0; border-radius: 4px;
  background: var(--editorial-blue); box-shadow: 0 20px 40px rgba(36,49,83,.17);
}
.asset-page-heading::before {
  content: 'ASSET / REGISTER'; position: absolute; right: 2rem; bottom: 1rem;
  color: rgba(255,255,255,.13); font-size: clamp(2.7rem,6vw,6rem); font-weight: 900; letter-spacing: -.07em;
}
.asset-page-heading::after { display: none; }
.asset-page-heading .eyebrow { color: #fff; }
.asset-tab { border-radius: 2px; background: rgba(228,223,213,.72); }
button, .button { border-radius: 2px; background: var(--editorial-ink); }
button:hover, .button:hover { background: var(--editorial-blue); }
input, select { border-radius: 2px; }
@media (max-width: 820px) {
  .topbar { width: 100%; margin: 0; }
  .home-hero { min-height: 250px; grid-template-columns: 1fr; padding: 1.8rem 1.5rem 4rem; }
  .home-hero h1 { font-size: clamp(2.8rem,14vw,4.8rem); }
  .hero-decoration { display: none; }
  .home-shortcuts { width: calc(100% - 28px); margin-top: -30px; grid-template-columns: 1fr; }
  .portal-shortcut { min-height: 82px; border-right: 0; border-bottom: 1px solid rgba(21,21,21,.11); }
  .portal-shortcut:last-child { border-bottom: 0; }
  .workspace-hero { min-height: 155px; }
}

/* 확정 C안 홈 — 세부 화면에는 영향을 주지 않는다. */
body:has(.team-home) { background: #b9d8c4; }
.home-topbar {
  width: min(1720px,calc(100% - 48px)); margin: 20px auto 0; border: 0; border-radius: 18px 18px 0 0;
  background: #fff; color: #152b46; box-shadow: 0 20px 55px rgba(50,91,65,.14); backdrop-filter: none;
}
.home-topbar::after { display: none; }
.home-header-inner { min-height: 74px; display: flex; align-items: center; justify-content: space-between; padding: 0 42px; }
.home-brand { display: inline-flex; align-items: center; gap: .65rem; color: #102c4c; font-weight: 900; text-decoration: none; }
.home-brand-mark { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 10px; background: #ff6d79; color: #fff; font-size: .72rem; }
.home-actions { display: flex; align-items: center; gap: .8rem; color: #829184; font-size: .75rem; }
.home-actions b { display: grid; place-items: center; width: 35px; height: 35px; border-radius: 50%; background: #638faf; color: #fff; }
main.team-home {
  width: min(1720px,calc(100% - 48px)); margin: 0 auto 24px; padding: 0 40px 60px;
  border-radius: 0 0 18px 18px; background: #fffaf4; box-shadow: 0 20px 55px rgba(50,91,65,.14); overflow: hidden;
}
.c-home-hero {
  position: relative; min-height: 330px; margin: 0 -54px; padding: 62px 48px; overflow: hidden;
  background: #fff1a8 url('/home-hero-office.png') center center/cover no-repeat; text-align: center;
}
.c-home-hero-copy { position: relative; z-index: 1; max-width: 620px; margin: 0 auto; }
.c-home-hero h1 { margin: 0; color: #243853; font-size: clamp(2.5rem,4.3vw,3.65rem); font-weight: 900; letter-spacing: -.055em; text-shadow: 0 2px 0 rgba(255,255,255,.42); }
.c-home-hero p { max-width: 470px; margin: 14px auto 0; color: #40556a; font-size: .82rem; font-weight: 650; line-height: 1.65; }
.c-home-shortcuts {
  position: relative; z-index: 2; display: grid; grid-template-columns: repeat(4,1fr); max-width: 1240px;
  margin: -27px auto 0; padding: 8px; border: 1px solid rgba(37,89,58,.10); border-radius: 18px;
  background: rgba(255,255,255,.9); box-shadow: 0 12px 28px rgba(63,105,74,.12); backdrop-filter: blur(12px);
}
.c-home-shortcuts a, .c-home-shortcuts span {
  min-height: 46px; display: grid; place-items: center; padding: .7rem 1rem; border-right: 1px solid #eae9e1;
  color: #14253a; font-size: .78rem; font-weight: 850; text-align: center; text-decoration: none;
}
.c-home-shortcuts > :last-child { border-right: 0; }
.c-home-shortcuts .active { border-radius: 12px; background: #5e8dab; color: #fff; }
.c-home-shortcuts span[aria-disabled='true'] { color: #9a9f9a; cursor: default; }
.c-home-content { display: grid; grid-template-columns: minmax(0,1fr) 260px; gap: 32px; padding-top: 52px; }
.c-home-content .portal-section-heading { margin: 0 0 22px; padding: 0; border: 0; }
.c-home-content .portal-section-heading span { color: #5e8dab; }
.c-home-content .workspace-grid { margin: 0; gap: 18px; }
.c-home-content .workspace-card {
  min-height: 225px; padding: 1.25rem; border: 1px solid #e5e1da; border-radius: 17px; background: #fff;
  box-shadow: none; backdrop-filter: none;
}
.c-home-content .workspace-card:hover { transform: translateY(-2px); border-color: #bfd1dc; box-shadow: 0 12px 28px rgba(63,105,74,.10); }
.c-home-content .workspace-card::before { display: none; }
.c-home-content .workspace-card::after { opacity: .11; }
.c-home-aside { align-self: start; padding: 24px; border: 1px solid #e5e1da; border-radius: 17px; background: #fff; }
.c-home-aside h2 { margin: 0 0 18px; font-size: 1.1rem; }
.c-home-aside > .home-monthly-meta { display: block; padding: 0 0 12px; border-bottom: 1px solid #eeeae3; }
.home-monthly-meta h2 { margin-bottom: .25rem !important; }
.home-monthly-meta small, .home-monthly-item small { color: #8b958e; font-size: .72rem; }
.c-home-aside > div { display: flex; align-items: center; gap: .8rem; padding: 15px 0; border-bottom: 1px solid #eeeae3; }
.c-home-aside > .home-monthly-items { display: block; padding: 0; border-bottom: 0; }
.home-monthly-items .home-monthly-item { display: flex; width: 100%; align-items: flex-start; gap: .8rem; padding: 12px 0; border-bottom: 1px solid #eeeae3; }
.home-monthly-items .home-monthly-item { scroll-margin-top: 16px; }
.home-monthly-items .home-monthly-item:last-child { border-bottom: 0; }
.home-monthly-items .home-monthly-item.is-completed { background: rgba(110,110,110,.08); }
.home-monthly-item.is-completed strong, .home-monthly-item.is-completed small { color: #858585; }
.home-monthly-toggle { margin: 0 0 0 auto; }
.home-monthly-toggle-button { display: grid; place-items: center; width: 24px; min-height: 24px; padding: 0; border: 1px solid #b9b9b4; border-radius: 4px; background: #fff; color: #777; font-size: .78rem; line-height: 1; }
.home-monthly-toggle-button:hover, .home-monthly-toggle-button:focus-visible { background: #eeeeeb; color: #555; }
.c-home-aside > div:last-child { border-bottom: 0; }
.c-home-aside i { flex: 0 0 auto; width: 8px; height: 8px; border-radius: 50%; background: #ff6d79; }
.c-home-aside > div:nth-child(3) i { background: #4fba91; }
.c-home-aside > div:nth-child(4) i { background: #7b69d9; }
.c-home-aside span { display: grid; gap: .2rem; }
.c-home-aside strong { font-size: .82rem; }
.c-home-aside small { color: #8b958e; font-size: .72rem; }
.home-monthly-item i { background: #4fba91; }
.home-monthly-item span { min-width: 0; }
.home-monthly-item strong, .home-monthly-item small { overflow-wrap: anywhere; }
.home-monthly-empty { margin: 1rem 0 0; color: #8b958e; font-size: .82rem; }
body:has(.team-home) .footer { color: #50665a; }
@media (max-width: 900px) {
  .home-topbar, main.team-home { width: calc(100% - 24px); }
  .home-header-inner { padding: 0 22px; }
  main.team-home { padding: 0 24px 40px; }
  .c-home-hero { min-height: 300px; margin: 0 -24px; padding: 48px 20px; background-position: center center; }
  .c-home-shortcuts { grid-template-columns: repeat(2,1fr); }
  .c-home-shortcuts > :nth-child(2) { border-right: 0; }
  .c-home-shortcuts > :nth-child(-n+2) { border-bottom: 1px solid #eae9e1; }
  .c-home-content { grid-template-columns: 1fr; }
  .c-home-aside { order: -1; }
}
@media (max-width: 560px) {
  .home-actions > span { display: none; }
  .c-home-hero { min-height: 260px; background-position: center center; }
  .c-home-hero h1 { font-size: 2.25rem; }
  .c-home-hero p { max-width: 310px; }
  .c-home-shortcuts { grid-template-columns: 1fr; margin-top: -18px; }
  .c-home-shortcuts a, .c-home-shortcuts span { border-right: 0; border-bottom: 1px solid #eae9e1; }
  .c-home-shortcuts > :last-child { border-bottom: 0; }
}
.detail-topbar { margin: 0; width: 100%; border: 0; border-radius: 0; background: #fff; color: #152b46; box-shadow: 0 1px 0 #e6e9e5; backdrop-filter: none; }
.detail-topbar::after { display: none; }
.detail-header-inner { min-height: 72px; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 2rem; }
.detail-nav { display: flex; justify-content: center; gap: 2rem; }
.detail-nav a, .detail-nav span { position: relative; padding: 1.65rem 0 1.45rem; color: #34465a; font-size: .8rem; font-weight: 800; text-decoration: none; }
.detail-nav a.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: 1rem; height: 2px; background: #243853; }
.detail-nav span[aria-disabled='true'] { color: #a4aaa6; }
body:has(.register-shell) { background: var(--editorial-paper); }
.register-shell { width: min(1320px,calc(100% - 32px)); }
.tool-page-heading {
  position: relative; min-height: 180px; display: grid; align-content: center; margin-bottom: 1rem;
  padding: 2rem 2.3rem; border: 0; border-radius: 4px; background: var(--editorial-blue);
  box-shadow: 0 20px 40px rgba(36,49,83,.17); overflow: hidden;
}
.tool-page-heading::after {
  content: ''; position: absolute; width: 190px; height: 190px; right: 6%; top: -108px;
  border: 1px solid rgba(255,255,255,.35); border-radius: 50%;
}
.tool-page-heading > * { position: relative; z-index: 1; }
.tool-page-heading .eyebrow { color: #fff; }
.tool-page-heading h1 { color: #fff; }
.tool-page-heading .lead { color: rgba(255,255,255,.76); }
.tool-summary { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .8rem; margin-bottom: 1rem; }
.tool-summary > div { display: grid; gap: .25rem; padding: 1rem 1.1rem; border: 1px solid rgba(21,21,21,.08); border-radius: 3px; background: #fff; }
.tool-summary small { color: #77847c; font-size: .72rem; }
.tool-summary strong { color: #243853; font-size: 1.3rem; }
.tool-search { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: .6rem; margin-bottom: .75rem; }
.tool-tabs { display: flex; gap: .4rem; margin-bottom: .75rem; overflow-x: auto; }
.tool-tab { min-width: max-content; padding: .5rem .75rem; border-radius: 2px; background: rgba(228,223,213,.72); color: #53645a; font-size: .78rem; font-weight: 800; text-decoration: none; }
.tool-tab.active { background: var(--editorial-blue); color: #fff; }
.tool-table-panel { border: 1px solid rgba(21,21,21,.08); border-radius: 3px; background: #fff; overflow: hidden; }
.tool-table-wrap { overflow-x: auto; }
.tool-table { width: 100%; border-collapse: collapse; font-size: .78rem; }
.patent-table { min-width: 1180px; }
.visitor-table { min-width: 1520px; }
.tool-table th { padding: .7rem; border-bottom: 1px solid rgba(21,21,21,.13); background: #e8e3da; color: #2e2c29; text-align: left; white-space: nowrap; }
.tool-table td { padding: .72rem; border-bottom: 1px solid #e5e9e5; vertical-align: top; line-height: 1.45; }
.tool-table tr:last-child td { border-bottom: 0; }
.tool-table td small { display: block; margin-top: .25rem; color: #8a928d; }
.tool-table .money { font-variant-numeric: tabular-nums; white-space: nowrap; }
.patent-status-form { display: flex; align-items: center; gap: .4rem; }
.patent-status-form select { min-width: 6.6rem; }
.patent-status-form button { min-height: 32px; padding: .35rem .55rem; white-space: nowrap; }
.payment-status, .return-status { display: inline-flex; min-width: max-content; padding: .24rem .48rem; border-radius: 999px; background: #edf1ee; color: #5b6860; font-size: .7rem; font-weight: 850; }
.payment-status.paid, .payment-status.prepaid, .return-status.returned { background: #e4f3ec; color: #2f7457; }
.payment-status.unpaid, .return-status.out { background: #fff0df; color: #9a5e23; }
.payment-status.unknown { background: #f1edf8; color: #69568e; }
.tool-empty { padding: 2rem !important; color: #7b857f; text-align: center; }
.visitor-table td { white-space: normal; }
.visitor-applicant { min-width: 4.5rem; white-space: nowrap !important; overflow-wrap: normal; word-break: keep-all; }
.visitor-wrap { max-width: 190px; overflow-wrap: anywhere; word-break: break-word; }
.visitor-period { min-width: 150px; white-space: nowrap !important; }
.visitor-date, .visitor-table .return-status { min-width: 5.5rem; white-space: nowrap !important; }
.visitor-approval { display: inline-grid; width: 1.7rem; height: 1.7rem; place-items: center; border-radius: 50%; font-weight: 850; }
.visitor-approval.yes { background: #e4f3ec; color: #2f7457; }
.visitor-approval.no { background: #f1edf8; color: #69568e; }
.visitor-actions { min-width: 70px; }
.visitor-actions summary { color: #375b80; cursor: pointer; font-weight: 800; white-space: nowrap; }
.visitor-actions details[open] { min-width: 700px; }
.visitor-entry-panel { margin-bottom: 1rem; padding: 1.2rem; border: 1px solid rgba(21,21,21,.08); border-radius: 3px; background: #fff; }
.visitor-entry-panel h2 { margin: 0 0 .25rem; color: #243853; font-size: 1.1rem; }
.form-help { margin: 0 0 .85rem; color: #77847c; font-size: .78rem; }
.visitor-form { margin-top: .85rem; margin-bottom: 0; }
.visitor-access-field { display: flex; grid-column: 1 / -1; align-items: center; gap: .75rem; min-height: 2rem; color: #40566b; font-size: .82rem; font-weight: 700; }
.visitor-access-options { display: flex; flex-wrap: wrap; gap: .8rem; }
.visitor-access-option { display: inline-flex; align-items: center; gap: .35rem; color: #40566b; font-weight: 700; }
.visitor-access-option input { width: auto !important; min-height: auto !important; }
.visitor-actions .visitor-form { margin-top: .75rem; }
.visitor-actions .asset-form-grid label { color: #40566b; }
.visitor-actions .asset-form-actions { justify-content: flex-start; }
@media (max-width: 760px) {
  .visitor-actions details[open] { min-width: min(700px, calc(100vw - 64px)); }
  .visitor-access-field { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 760px) {
  .detail-header-inner { grid-template-columns: 1fr auto; gap: 1rem; }
  .detail-nav { grid-column: 1 / -1; grid-row: 2; justify-content: start; gap: 1.25rem; overflow-x: auto; }
  .detail-nav a, .detail-nav span { min-width: max-content; padding: .7rem 0 1rem; }
  .detail-nav a.active::after { bottom: .55rem; }
  .tool-summary { grid-template-columns: 1fr; }
  .tool-page-heading { padding: 1.5rem; }
}

/* 업무공간 입력 보완 */
.work-section { overflow: visible; backdrop-filter: none; }
.unlock-strip button { flex: 0 0 auto; min-width: 96px; white-space: nowrap; }
.work-item > .completion-form, .work-item > .completion-icon { width: 100%; height: 100%; align-self: stretch; justify-self: stretch; place-items: center; }
.work-item > .completion-form .completion-toggle { margin: auto; }
.entry-memo, .entry-edit, .move-entry { display: inline-block; margin-right: .65rem; vertical-align: top; }
.entry-memo summary, .category-manager summary { min-height: 24px; color: #64758c; font-size: .75rem; font-weight: 700; cursor: pointer; }
.entry-memo p { margin: .35rem 0 0; color: #596a7e; font-size: .8rem; white-space: pre-wrap; }
.move-entry input[type='month'] { width: 145px; min-height: 34px; padding: .35rem .45rem; }

/* 업무표 밀도와 메모·관리 열 */
.work-table-head, .work-item, .work-item.editable {
  min-width: 1160px;
  grid-template-columns: 112px 200px minmax(420px, 2fr) minmax(180px, 1fr) 108px 52px 52px 40px;
}
.work-item, .work-item.editable { min-height: 42px; }
.work-main {
  width: 100%;
  justify-self: stretch;
  grid-template-columns: minmax(0, 1fr) 22px;
  align-items: center;
  gap: .1rem .45rem;
  padding-block: .32rem;
}
.work-tools {
  min-width: 0;
  display: flex;
  align-items: center;
  align-content: center;
  gap: .55rem;
  flex-wrap: wrap;
  padding: .32rem .5rem;
  border-right: 1px solid var(--line);
}
.work-tools .entry-memo, .work-tools .entry-edit, .work-tools .move-entry { margin: 0; }
.memo-line { width: 100%; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 22px; align-items: center; gap: .45rem; }
.memo-text { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.workspace-shell .work-table-head { font-size: .9rem; }
.workspace-shell .work-content { font-size: 1rem; }
.workspace-shell .category-cell-label, .workspace-shell .work-date { font-size: .92rem; }
.workspace-shell .work-date small { font-size: .8rem; }
.workspace-shell .review-badge,
.workspace-shell .deadline-badge,
.workspace-shell .entry-memo summary,
.workspace-shell .entry-edit summary,
.workspace-shell .move-entry summary { font-size: .86rem; }
.work-date {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22px;
  align-items: center;
  gap: .3rem;
  padding-inline: .45rem;
}
.work-date:not(:has(.date-entry-edit)) { grid-template-columns: 1fr; }
.work-date time { min-width: max-content; justify-self: center; white-space: nowrap; overflow: visible; }
.work-main > .work-content { grid-column: 1; display: block; width: 100%; min-width: 0; white-space: normal; overflow: visible; text-overflow: clip; overflow-wrap: anywhere; line-height: 1.45; }
.work-main > .content-entry-edit { grid-column: 2; grid-row: 1; justify-self: end; margin: 0; }
.work-main > .work-labels { grid-column: 1 / -1; }
.inline-entry-edit, .entry-memo, .move-entry { position: relative; flex: 0 0 auto; }
.inline-entry-edit summary, .entry-memo summary, .move-entry summary {
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  min-height: 0;
  list-style: none;
  border: 1px solid #cbd5df;
  border-radius: 5px;
  background: #fff;
  color: #53677e;
  font-size: .82rem;
  font-weight: 900;
  cursor: pointer;
}
.inline-entry-edit summary::-webkit-details-marker, .entry-memo summary::-webkit-details-marker, .move-entry summary::-webkit-details-marker { display: none; }
.inline-entry-edit form, .entry-memo form, .move-entry form {
  position: absolute;
  z-index: 20;
  top: calc(100% + 5px);
  display: flex;
  gap: .4rem;
  align-items: center;
  margin: 0;
  padding: .5rem;
  border: 1px solid #cbd5df;
  border-radius: 7px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(24, 61, 109, .16);
}
.date-entry-edit form { left: 0; }
.content-entry-edit form, .entry-memo form {
  position: fixed; z-index: 100; top: 50%; left: 50%; right: auto; transform: translate(-50%, -50%);
  width: min(720px, calc(100vw - 32px)); min-width: 0; max-height: calc(100vh - 32px);
  overflow-y: auto; display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: stretch;
}
.content-entry-edit textarea, .entry-memo textarea {
  width: 100%; min-width: 0; min-height: 180px; padding: .75rem;
  border: 1px solid #b8c4d2; border-radius: 5px; font: inherit; line-height: 1.5; resize: vertical;
}
.content-entry-edit button, .entry-memo button, .inline-entry-edit button { min-width: 72px; white-space: nowrap; }
.work-deadline-cell { position: relative; grid-template-columns: minmax(0, 1fr) 22px; gap: .35rem; }
.deadline-entry-edit form { right: 0; left: auto; }
.work-move-cell { position: relative; display: grid; place-items: center; min-width: 0; padding: .32rem; }
.work-move-cell .move-entry { margin: 0; }
.work-move-cell .move-entry form { right: 0; }
.work-delete-cell { display: grid; place-items: center; padding: .25rem; }
.work-delete-cell form { margin: 0; }
.icon-button { display: grid; place-items: center; width: 30px; height: 30px; padding: 0; border: 1px solid #e2c5c1; border-radius: 6px; background: #fff7f5; color: #a33f35; cursor: pointer; }
.icon-button:hover { background: #fee9e5; }
.expense-entry-composer { min-width: 0; flex: 1; display: grid; grid-template-columns: minmax(0, 1fr); gap: .55rem; align-items: end; }
.expense-entry-composer.has-expense-picker { grid-template-columns: minmax(0, 1fr) minmax(260px, .8fr); align-items: start; }
.expense-entry-composer.has-expense-picker > .expense-entry-picker { margin-top: 1.25rem; }
.expense-entry-picker { width: 100%; min-width: 0; margin-top: 0; }
.expense-entry-picker { position: relative; z-index: 1; }
.expense-entry-picker[open] { z-index: 30; }
.expense-entry-picker > summary { width: 100%; height: 44px; min-height: 44px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: .75rem; padding: .5rem .7rem; border: 1px solid #b8c5dc; border-radius: 7px; background: #fff; color: #26374b; font-size: .9rem; font-weight: 650; cursor: pointer; list-style: none; }
.expense-entry-picker > summary::-webkit-details-marker { display: none; }
.expense-entry-picker > summary::after { content: '▾'; color: #65758a; }
.expense-entry-picker[open] > summary::after { content: '▴'; }
.expense-entry-options { position: absolute; top: calc(100% + .35rem); right: 0; left: auto; z-index: 30; display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); align-content: start; gap: .25rem .45rem; width: min(760px, max(100%, calc(100vw - 32px))); max-height: min(68vh, 520px); overflow-y: auto; overscroll-behavior: contain; margin-top: 0; padding: .45rem; border: 1px solid #c8d2df; border-radius: 7px; background: #fff; box-shadow: 0 6px 16px rgba(24, 42, 67, .10); }
.expense-entry-options button { display: block; width: 100%; min-height: 34px; padding: .4rem .55rem; border: 0; border-radius: 4px; background: #fff; color: #26374b; text-align: left; white-space: normal; overflow-wrap: anywhere; cursor: pointer; }
.expense-entry-options > .expense-entry-direct { grid-column: 1 / -1; }
.expense-entry-group { min-width: 0; }
.expense-entry-options button:hover, .expense-entry-options button:focus-visible { background: #edf4fb; }
.expense-entry-options .expense-entry-direct { position: sticky; top: 0; z-index: 1; border-bottom: 1px solid #dce3ec; background: #f7f9fc; color: #244f78; font-weight: 800; }
.expense-entry-group h3 { margin: .45rem .5rem .15rem; color: #52677f; font-size: .78rem; font-weight: 850; }
.content-entry-edit textarea, .content-entry-edit .expense-entry-picker { grid-column: 1 / -1; }
.content-entry-edit button { grid-column: 2; }
.create-strip:has(.expense-entry-picker[open]) { position: relative; z-index: 30; }
.monthly-category-form { width: 100%; }
.monthly-category-form select { min-height: 36px; padding: .35rem 1.5rem .35rem .4rem; border-color: #bdcde0; border-radius: 6px; background: #f8fbff; color: #244f78; font-size: .95rem; font-weight: 850; text-align: center; text-align-last: center; }
.work-item > .completion-form, .work-item > .completion-icon { border-right: 1px solid var(--line); }
.monthly-entry-create { display: grid; grid-template-columns: 150px minmax(260px,1fr) auto; gap: .5rem; align-items: center; margin: .8rem 0; padding: .7rem; border: 1px solid #cbc5bb; background: rgba(255,255,255,.78); }
.monthly-entry-create select, .monthly-entry-create input, .monthly-entry-create button { min-height: 38px; }
.monthly-entry-create button { white-space: nowrap; }
.work-item:not(.completed) { background: #fff9e9; }
.work-item:not(.completed) .work-category-cell { background: #fff3cc; }
.work-item:not(.completed) .work-content { font-weight: 750; }
.work-item:not(.completed):hover { background: #fff2d2; }
.work-item.completed { background: #f2f5f3; }
.work-item.completed .work-category-cell { background: #eaf0ed; }
.work-item.completed:hover { background: #e9eeec; }
.planning-board::before { content: none; }
.monthly-plan {
  border: 1px solid #ead99a;
  border-left: 5px solid #d7ba50;
  border-radius: 12px;
  background: linear-gradient(135deg, #fff8d9 0%, #fffdf2 62%, #fff9e5 100%);
  box-shadow: 0 4px 14px rgba(126, 102, 26, .08);
}
.monthly-plan .plan-table { border-color: #dfd29e; }
.monthly-plan .plan-category {
  display: grid;
  place-items: center;
  min-height: 44px;
  padding: .55rem;
  background: transparent;
  color: #725a16;
  font-size: .95rem;
  font-weight: 850;
  text-align: center;
  overflow-wrap: anywhere;
}
.monthly-plan .plan-copy { grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: .65rem; }
.monthly-plan .plan-copy > span { min-width: 0; overflow-wrap: anywhere; }
.monthly-entry-actions { display: flex; align-items: center; justify-content: end; gap: .35rem; }
.monthly-entry-actions form { margin: 0; }
.monthly-entry-edit { position: relative; }
.monthly-entry-edit > summary {
  display: grid; place-items: center; width: 30px; height: 30px; list-style: none;
  border: 1px solid #bdcde0; border-radius: 6px; background: #fff; color: #315d83; cursor: pointer;
}
.monthly-entry-edit > summary::-webkit-details-marker { display: none; }
.monthly-entry-edit > form {
  position: fixed; z-index: 100; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: min(760px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow-y: auto;
  display: grid; grid-template-columns: 150px minmax(0, 1fr) auto; align-items: end; gap: .65rem;
  margin: 0; padding: .9rem; border: 1px solid #bdcde0; border-radius: 10px;
  background: #fff; box-shadow: 0 16px 48px rgba(24, 52, 96, .22);
}
.monthly-entry-edit label { display: grid; gap: .35rem; min-width: 0; margin: 0; }
.monthly-entry-edit select, .monthly-entry-edit textarea { width: 100%; min-width: 0; }
.monthly-entry-edit textarea { min-height: 150px; padding: .65rem; resize: vertical; }
.monthly-entry-edit-actions { display: grid; gap: .4rem; }
.monthly-entry-edit-actions button { min-width: 70px; white-space: nowrap; }
.monthly-entry-delete { min-height: 30px; }
.category-manager { margin-top: .75rem; width: fit-content; }
.category-manager form { display: flex; gap: .4rem; margin-top: .35rem; }
.category-manager input { min-height: 36px; padding: .45rem .55rem; }
.category-manager button { min-height: 36px; padding: .4rem .7rem; white-space: nowrap; }
.annual-schedule { margin: 1rem 0; border: 1px solid rgba(21,21,21,.10); border-radius: 3px; background: rgba(255,255,255,.78); box-shadow: 0 14px 30px rgba(45,42,38,.06); }
.annual-schedule > summary { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.1rem; cursor: pointer; list-style-position: inside; }
.annual-schedule > summary strong { color: var(--editorial-blue); }
.annual-schedule > summary span { color: #73706a; font-size: .78rem; }
.annual-schedule-wrap { overflow-x: auto; border-top: 1px solid #d6d0c7; }
.annual-schedule table { min-width: 1800px; width: 100%; border-collapse: collapse; font-size: .73rem; }
.annual-schedule th, .annual-schedule td { padding: .5rem; border-right: 1px solid #ded9d0; border-bottom: 1px solid #ded9d0; vertical-align: top; line-height: 1.45; }
.annual-schedule thead th { background: #e8e3da; color: #2e2c29; text-align: center; }
.annual-schedule tbody th { min-width: 150px; background: #f6f3ee; text-align: left; }
.annual-schedule td:nth-child(2) { min-width: 230px; font-weight: 700; }
.annual-schedule td:not(:nth-child(2)) { min-width: 110px; }
@media (max-width: 980px) {
  .create-strip form .expense-entry-composer.has-expense-picker { grid-column: 1 / -1; }
  .expense-entry-composer.has-expense-picker > .grow { grid-column: 1; }
}
@media (max-width: 760px) {
  .expense-entry-composer.has-expense-picker { grid-template-columns: minmax(0, 1fr); }
  .expense-entry-composer.has-expense-picker > .expense-entry-picker { grid-column: 1; margin-top: 0; }
  .monthly-entry-create { grid-template-columns: 1fr; }
  .content-entry-edit form, .entry-memo form { grid-template-columns: 1fr; }
  .monthly-plan .plan-copy { grid-template-columns: minmax(0, 1fr); }
  .monthly-entry-actions { justify-content: start; }
  .monthly-category-form select { text-align: left; text-align-last: left; }
  .monthly-entry-edit > form { grid-template-columns: 1fr; }
  .monthly-entry-edit-actions { grid-template-columns: 1fr 1fr; }
  .annual-schedule > summary { align-items: flex-start; flex-direction: column; }
}

.workspace-hero .status.readonly {
  border: 2px solid #ffcc73; background: #7b3e12; color: #fff;
  font-size: .85rem; font-weight: 900; box-shadow: 0 4px 14px rgba(54,25,8,.22);
}
.unlock-strip {
  margin: 1rem 0 .75rem; padding: 1rem 1.1rem; border: 2px solid #d49b25;
  border-left-width: 8px; border-radius: 10px; background: #fff3d3;
  box-shadow: 0 8px 22px rgba(124,83,11,.12);
}
.unlock-strip > div strong { color: #714000; font-size: 1rem; }
.unlock-strip > div span { color: #715b32; line-height: 1.45; }
.unlock-strip form { width: min(520px, 100%); }
.unlock-strip button { min-width: max-content; }
.asset-search { grid-template-columns: minmax(240px,1fr) auto auto; }
.asset-search-controls, .asset-actions, .asset-manage-nav { display: flex; align-items: center; gap: .55rem; }
.asset-actions { justify-content: end; }
.asset-search-controls .button, .asset-actions .button, .asset-manage-nav .button { min-height: 44px; white-space: nowrap; }
.asset-actions a, .asset-manage-nav a { display: inline-flex; align-items: center; text-decoration: none; }
.asset-manage-nav { margin: .9rem 0; }
.asset-management-form { margin: 1rem 0; padding: 1rem; border: 1px solid var(--line); border-radius: 10px; background: rgba(255,255,255,.88); }
.asset-management-form fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
.asset-management-form legend { margin-bottom: .85rem; color: #2f4f6b; font-size: 1rem; font-weight: 800; }
.asset-form-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .8rem; margin-bottom: .85rem; }
.asset-form-grid label { display: grid; gap: .35rem; min-width: 0; color: #40566b; font-size: .82rem; font-weight: 700; }
.asset-form-grid label.wide { grid-column: 1 / -1; }
.asset-form-grid input, .asset-form-grid select, .asset-form-grid textarea { width: 100%; min-width: 0; }
.asset-form-error { margin: 1rem 0; padding: .75rem 1rem; border: 1px solid #e2aaa4; border-radius: 8px; background: #fff0ee; color: #9c352b; }
.asset-empty-note { color: var(--muted); font-size: .78rem; }
.asset-custody-panel { margin-top: 1rem; }
.asset-custody-table { min-width: 1300px; }
.asset-custody-table td small { display: block; margin-top: .2rem; color: var(--muted); font-size: .73rem; }
.asset-form-field { display: grid; gap: .35rem; min-width: 0; color: #40566b; font-size: .82rem; font-weight: 700; }
.asset-picker { min-width: 0; }
.asset-picker > input[type="search"] { width: 100%; }
.asset-picker-results { display: grid; max-height: 260px; overflow-y: auto; margin-top: .35rem; border: 1px solid #bdcde0; border-radius: 7px; background: #fff; }
.asset-picker-results[hidden], .asset-picker-results [hidden] { display: none !important; }
.asset-picker-results button { display: flex; justify-content: space-between; align-items: center; gap: .8rem; width: 100%; min-height: 38px; padding: .45rem .65rem; border: 0; border-bottom: 1px solid #e5ebf1; border-radius: 0; background: #fff; color: #25384f; text-align: left; }
.asset-picker-results button:hover, .asset-picker-results button:focus-visible { background: #eef5fa; color: #234f73; }
.asset-picker-results button strong { flex: 0 0 auto; }
.asset-picker-results button span { min-width: 0; overflow: hidden; color: #586b7e; text-overflow: ellipsis; white-space: nowrap; }
.asset-picker-status { margin: .3rem 0 0; color: var(--muted); font-size: .75rem; font-weight: 500; }
.asset-proposal-field { display: flex; grid-column: 1 / -1; align-items: center; gap: .75rem; min-height: 2rem; }
.asset-proposal-field > span { color: #40566b; font-size: .82rem; font-weight: 700; }
.asset-proposal-check { display: flex !important; align-items: center; gap: .55rem !important; }
.asset-form-grid .asset-proposal-check input { width: auto; min-height: auto; }
.asset-return-form { display: flex; align-items: center; gap: .4rem; }
.asset-return-form input { width: 140px; min-height: 38px; }
.asset-return-form button { min-height: 38px; padding: .4rem .65rem; white-space: nowrap; }
@media (max-width: 760px) {
  .asset-search { grid-template-columns: 1fr; }
  .asset-search-controls, .asset-actions { grid-column: 1; justify-content: stretch; }
  .asset-search-controls > *, .asset-actions > * { flex: 1; justify-content: center; }
  .asset-form-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .asset-manage-nav { flex-wrap: wrap; }
  .asset-due-list { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .asset-form-grid { grid-template-columns: 1fr; }
  .asset-form-grid label.wide { grid-column: auto; }
  .asset-return-form { align-items: stretch; flex-direction: column; }
  .asset-return-form input { width: 100%; }
}

.manual-shell, .recruitment-shell { padding-bottom: 4rem; }
.manual-hero { margin: 2.2rem 0 1rem; }
.manual-hero h1 { margin: 0; font-size: clamp(1.7rem, 4vw, 2.6rem); letter-spacing: -.05em; }
.manual-search { display: flex; gap: .55rem; align-items: center; margin: 1.2rem 0 .75rem; }
.manual-search input { flex: 1; min-width: 0; min-height: 44px; }
.manual-search button, .paste-panel button { min-height: 44px; white-space: nowrap; }
.manual-categories, .recruitment-tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin: .75rem 0 1.5rem; }
.manual-category, .recruitment-tab { display: inline-flex; align-items: center; min-height: 36px; padding: .35rem .75rem; border: 1px solid #d3d8dc; border-radius: 999px; color: #53616c; text-decoration: none; font-size: .8rem; font-weight: 700; }
.manual-category.active, .recruitment-tab.active { border-color: #5e8dab; background: #5e8dab; color: #fff; }
.manual-results-heading { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin: 1rem 0 .65rem; }
.manual-results-heading h2 { margin: 0; font-size: 1.05rem; }
.manual-results-heading > span { color: var(--muted); font-size: .78rem; }
.manual-results { display: grid; gap: .75rem; }
.manual-card { padding: 1.05rem 1.1rem; border: 1px solid #d7d1c8; border-radius: 8px; background: rgba(255,255,255,.82); }
.manual-card-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: start; margin-bottom: .7rem; }
.manual-card-heading h2 { margin: .2rem 0 0; font-size: 1rem; }
.manual-card-heading small { color: var(--muted); font-size: .72rem; white-space: nowrap; }
.manual-category-label { color: #5e8dab; font-size: .72rem; font-weight: 800; }
.manual-body { white-space: pre-wrap; overflow-wrap: anywhere; color: #45433f; font-size: .84rem; line-height: 1.65; }
.manual-redacted { margin: .75rem 0 0; color: #846b49; font-size: .72rem; }
.manual-empty { padding: 1.5rem; border: 1px dashed #c8c2b8; color: var(--muted); text-align: center; }
.manual-subcategories { display: flex; flex-wrap: wrap; align-items: center; gap: .35rem; margin: .9rem 0 1.2rem; padding: .75rem; border-left: 3px solid #9fb8c7; background: rgba(255,255,255,.55); }
.manual-subcategory-label { margin-right: .25rem; color: #526d7e; font-size: .78rem; font-weight: 800; }
.manual-subcategory { padding: .3rem .6rem; border-radius: 5px; color: #59656b; font-size: .76rem; text-decoration: none; }
.manual-subcategory.active, .manual-subcategory:hover { background: #e1ebf0; color: #315d77; }
.manual-sheet { overflow: hidden; border: 1px solid #d7d1c8; border-radius: 8px; background: rgba(255,255,255,.82); }
.manual-sheet-heading { display: flex; justify-content: space-between; gap: 1rem; align-items: start; padding: 1rem 1.1rem .75rem; }
.manual-sheet-heading h2 { margin: .2rem 0 0; font-size: 1rem; }
.manual-sheet-heading small { color: var(--muted); font-size: .72rem; white-space: nowrap; }
.manual-grid-wrap { overflow: auto; border-top: 1px solid #ded9d0; }
.manual-grid { min-width: 900px; border-collapse: collapse; font-size: .74rem; }
.manual-grid th, .manual-grid td { min-width: 130px; max-width: 360px; padding: .45rem .55rem; border-right: 1px solid #ded9d0; border-bottom: 1px solid #ded9d0; vertical-align: top; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.45; }
.manual-grid thead th { position: sticky; top: 0; background: #e8e3da; color: #2e2c29; text-align: left; }
.manual-grid th:first-child, .manual-grid td:first-child { position: sticky; left: 0; z-index: 1; min-width: 50px; width: 50px; background: #f6f3ee; text-align: center; }
.manual-grid thead th:first-child { z-index: 2; }
.manual-grid .manual-grid-header td { background: #f1eee8; font-weight: 750; }
.manual-row-action { min-width: 64px !important; width: 64px; background: #faf9f6; }
.manual-edit { position: relative; }
.manual-edit > summary { display: inline-flex; align-items: center; justify-content: center; min-height: 30px; padding: .25rem .45rem; border: 1px solid #bdcde0; border-radius: 5px; background: #fff; color: #315d83; cursor: pointer; font-size: .72rem; font-weight: 700; list-style: none; }
.manual-edit > summary::-webkit-details-marker { display: none; }
.manual-edit > form { position: fixed; z-index: 100; top: 50%; left: 50%; display: grid; width: min(780px, calc(100vw - 32px)); gap: .65rem; transform: translate(-50%, -50%); padding: 1rem; border: 1px solid #bdcde0; border-radius: 9px; background: #fff; box-shadow: 0 18px 52px rgba(24,52,96,.24); }
.manual-edit label { display: grid; gap: .35rem; color: #40566b; font-size: .8rem; font-weight: 700; }
.manual-edit textarea { width: 100%; min-height: 160px; padding: .65rem; font: .82rem/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; resize: vertical; }
.manual-edit button { justify-self: end; min-width: 80px; }
  .detail-nav { align-items: center; }
.detail-nav > a[href="/manual"] { display: none; }
.detail-nav > a { display: inline-flex; align-items: center; justify-content: center; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.detail-nav-group { min-width: 0; }
.detail-nav-group > summary { justify-content: center; width: 100%; }
.home-manual-shortcut { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.85rem; padding: 0.55rem 0.85rem; border: 1px solid rgba(94, 141, 171, 0.35); border-radius: 999px; background: rgba(255, 255, 255, 0.82); color: #315d77; font-size: 0.82rem; font-weight: 750; text-decoration: none; }
.home-manual-shortcut:hover { background: #e5edf1; }
.detail-nav-group, .home-menu-group { position: relative; }
.detail-nav-group > summary, .home-menu-group > summary { display: inline-flex; align-items: center; min-height: 34px; padding: .35rem .65rem; border-radius: 6px; color: #4d4a45; cursor: pointer; font-size: .78rem; font-weight: 750; list-style: none; white-space: nowrap; }
.detail-nav-group > summary::-webkit-details-marker, .home-menu-group > summary::-webkit-details-marker { display: none; }
.detail-nav-group > summary::after, .home-menu-group > summary::after { content: '⌄'; margin-left: .35rem; font-size: .72rem; }
.detail-nav-group > summary:hover, .detail-nav-group[open] > summary, .home-menu-group > summary:hover, .home-menu-group[open] > summary { background: #e5edf1; color: #315d77; }
.detail-nav-group > summary.active { background: #5e8dab; color: #fff; }
.detail-nav-group > div, .home-menu-group > div { position: absolute; z-index: 30; top: calc(100% + .3rem); left: 0; display: grid; min-width: 180px; padding: .35rem; border: 1px solid #c9d3d9; border-radius: 7px; background: rgba(255,255,255,.98); box-shadow: 0 12px 28px rgba(45,42,38,.15); }
.detail-nav-group > div a, .home-menu-group > div a { display: block; padding: .48rem .6rem; border-radius: 4px; color: #4d4a45; font-size: .76rem; text-decoration: none; white-space: nowrap; }
.detail-nav-group > div a:hover, .home-menu-group > div a:hover { background: #edf3f5; color: #315d77; }
.home-menu-group > div { top: calc(100% + .5rem); }
@media (max-width: 820px) {
  .detail-nav { flex-wrap: wrap; justify-content: end; }
  .detail-nav-group > div { position: fixed; top: 80px; right: 1rem; left: auto; }
}
.paste-panel { display: grid; grid-template-columns: minmax(220px, .8fr) minmax(360px, 1.2fr); gap: 1rem; align-items: start; margin: 1rem 0 1.4rem; padding: 1rem; border: 1px solid #d7d1c8; border-radius: 8px; background: rgba(255,255,255,.82); }
.paste-panel h2 { margin: 0; font-size: 1rem; }
.paste-panel p { margin: .35rem 0 0; color: var(--muted); font-size: .78rem; line-height: 1.5; }
.paste-panel form { display: grid; gap: .55rem; }
.paste-panel textarea { width: 100%; min-width: 0; padding: .65rem; border: 1px solid #bfc9d1; border-radius: 6px; font: inherit; resize: vertical; }
.recruitment-table-wrap { overflow: auto; border: 1px solid #c9c3b9; background: #fff; }
.recruitment-table { min-width: 1000px; border-collapse: collapse; font-size: .73rem; }
.recruitment-table th, .recruitment-table td { min-width: 100px; max-width: 260px; padding: .45rem .55rem; border-right: 1px solid #ded9d0; border-bottom: 1px solid #ded9d0; vertical-align: top; white-space: pre-wrap; overflow-wrap: anywhere; }
.recruitment-table th { position: sticky; top: 0; background: #e8e3da; color: #2e2c29; text-align: left; }
.recruitment-table th:first-child, .recruitment-table td:first-child { position: sticky; left: 0; z-index: 1; min-width: 54px; width: 54px; background: #f6f3ee; text-align: center; }
.recruitment-table th:first-child { z-index: 2; }
.recruitment-table tr.is-done td:not(:first-child) { background: #f0efed; color: #91908c; text-decoration: line-through; }
.recruitment-table form { margin: 0; }
.recruitment-toolbar { display: flex; align-items: center; justify-content: space-between; gap: .75rem; margin: 1rem 0 .75rem; }
.recruitment-toolbar h1 { margin: 0; font-size: clamp(1.55rem, 3vw, 2.25rem); letter-spacing: -.04em; }
.recruitment-toolbar-actions { display: flex; flex-wrap: wrap; gap: .45rem; align-items: center; }
.recruitment-toolbar-actions a, .recruitment-toolbar-actions button { min-height: 36px; padding: .45rem .7rem; border: 1px solid #bfcbd5; border-radius: 6px; background: #fff; color: #315d77; font: inherit; font-size: .78rem; font-weight: 750; text-decoration: none; cursor: pointer; }
.recruitment-toolbar-actions a:hover, .recruitment-toolbar-actions button:hover { background: #edf3f5; }
.recruitment-form-panel { margin: 0 0 1rem; padding: 1rem; border: 1px solid #d7d1c8; border-radius: 9px; background: rgba(255,255,255,.88); }
.recruitment-form-panel h2 { margin: 0 0 .75rem; font-size: 1rem; }
.recruitment-form-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem; }
.recruitment-form-grid label { display: grid; gap: .28rem; color: #40566b; font-size: .75rem; font-weight: 750; }
.recruitment-form-grid label.wide { grid-column: span 2; }
.recruitment-form-grid input, .recruitment-form-grid select, .recruitment-form-grid textarea { width: 100%; min-width: 0; min-height: 36px; padding: .42rem .5rem; border: 1px solid #bcc8d1; border-radius: 5px; background: #fff; font: inherit; font-size: .8rem; }
.recruitment-form-grid textarea { min-height: 70px; resize: vertical; }
.recruitment-availability { grid-column: 1 / -1; min-width: 0; margin: 0; padding: .7rem; border: 1px solid #d5dfe5; border-radius: 6px; background: #f7fafb; }
.recruitment-availability legend { padding: 0 .3rem; color: #315d77; font-size: .74rem; font-weight: 800; }
.recruitment-availability-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .6rem; }
.recruitment-resume-helper { grid-column: 1 / -1; min-width: 0; padding: .7rem; border: 1px dashed #c7d3da; border-radius: 6px; background: #fbfcfc; }
.recruitment-resume-helper label { max-width: 24rem; }
.recruitment-resume-helper p { margin: .45rem 0 0; color: var(--muted); font-size: .7rem; line-height: 1.45; }
.recruitment-form-actions { display: flex; justify-content: flex-end; gap: .45rem; margin-top: .75rem; }
.recruitment-form-actions button { min-height: 36px; padding: .42rem .75rem; border: 0; border-radius: 5px; background: #5e8dab; color: #fff; font: inherit; font-size: .78rem; font-weight: 750; cursor: pointer; }
.recruitment-work-table { min-width: 1180px; width: 100%; border-collapse: collapse; table-layout: auto; font-size: .76rem; }
.recruitment-work-table th, .recruitment-work-table td { min-width: 6.5rem; padding: .58rem .62rem; border-right: 1px solid #ded9d0; border-bottom: 1px solid #ded9d0; vertical-align: top; text-align: left; white-space: normal; overflow-wrap: anywhere; word-break: break-word; }
.recruitment-work-table th { background: #e8e3da; color: #2e2c29; font-size: .72rem; }
.recruitment-work-table td small { display: block; margin-top: .2rem; color: var(--muted); font-size: .7rem; }
.recruitment-table-wrap { max-width: 100%; overflow-x: auto; overflow-y: visible; }
.recruitment-work-table .recruitment-cell-date { min-width: 5.5rem; white-space: nowrap; overflow-wrap: normal; word-break: normal; }
.recruitment-work-table .recruitment-cell-person { min-width: 11rem; }
.recruitment-work-table .recruitment-cell-long { min-width: 12rem; }
.recruitment-work-table .recruitment-cell-person strong { display: block; min-width: 5rem; overflow-wrap: anywhere; }
.recruitment-card-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
.recruitment-card { min-width: 0; padding: 1rem; border: 1px solid #d7d1c8; border-radius: 9px; background: rgba(255,255,255,.88); overflow: visible; }
.recruitment-card > header { display: flex; align-items: start; justify-content: space-between; gap: .75rem; }
.recruitment-card h3 { margin: 0; font-size: 1rem; }
.recruitment-card p { margin: .25rem 0 0; color: var(--muted); font-size: .75rem; }
.recruitment-card dl { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; margin: 1rem 0 .75rem; }
.recruitment-card dl div { padding: .55rem; border-radius: 6px; background: #f5f7f7; }
.recruitment-card dt { color: var(--muted); font-size: .68rem; }
.recruitment-card dd { margin: .2rem 0 0; color: #273f50; font-size: .78rem; font-weight: 750; overflow-wrap: anywhere; }
.recruitment-status-badge { display: inline-flex; align-items: center; min-height: 24px; padding: .18rem .45rem; border-radius: 999px; background: #e8f0f3; color: #315d77; font-size: .68rem; font-weight: 800; white-space: nowrap; }
.recruitment-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.recruitment-task-panel, .recruitment-edit { position: relative; }
.recruitment-task-panel > summary, .recruitment-edit > summary { display: inline-flex; align-items: center; min-height: 30px; padding: .25rem .5rem; border: 1px solid #bdcbd5; border-radius: 5px; background: #fff; color: #315d77; cursor: pointer; font-size: .72rem; font-weight: 750; list-style: none; }
.recruitment-task-panel > summary::-webkit-details-marker, .recruitment-edit > summary::-webkit-details-marker { display: none; }
.recruitment-task-panel ul { position: absolute; z-index: 7; left: 0; bottom: 2.2rem; display: grid; width: min(360px, 78vw); gap: .35rem; margin: 0; padding: .65rem; border: 1px solid #cbd5dc; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgba(25,49,72,.18); list-style: none; }
.recruitment-task-panel li { display: flex; align-items: center; gap: .4rem; color: #40566b; font-size: .74rem; }
.recruitment-task-panel li.is-completed { color: #8a969b; text-decoration: line-through; }
.recruitment-task-panel li button { display: inline-grid; place-items: center; width: 24px; height: 24px; flex: 0 0 auto; border: 1px solid #c3d0d8; border-radius: 50%; background: #fff; color: #5e8dab; font-weight: 800; cursor: pointer; }
.recruitment-edit > form { position: fixed; z-index: 100; top: 50%; left: 50%; display: grid; width: min(760px, calc(100vw - 32px)); gap: .65rem; transform: translate(-50%, -50%); padding: 1rem; border: 1px solid #bdcde0; border-radius: 9px; background: #fff; box-shadow: 0 18px 52px rgba(24,52,96,.24); }
.recruitment-legacy-note { margin: 1rem 0; padding: .7rem .85rem; border-left: 3px solid #d3a85f; background: #fffaf0; color: #6f5c3d; font-size: .75rem; line-height: 1.5; }
.recruitment-view-switch { display: inline-flex; gap: .3rem; margin: 0 0 .65rem; padding: .25rem; border: 1px solid #d3dce2; border-radius: 7px; background: #f6f8f8; }
.recruitment-view-switch button { min-height: 30px; padding: .3rem .65rem; border: 0; border-radius: 5px; background: transparent; color: #53616c; font: inherit; font-size: .72rem; font-weight: 800; cursor: pointer; }
.recruitment-view-switch button.active { background: #5e8dab; color: #fff; }
.recruitment-calendar { overflow-x: auto; border: 1px solid #c9c3b9; background: #fff; }
.recruitment-calendar-toolbar { display: grid; grid-template-columns: 34px 1fr 34px; align-items: center; min-width: 720px; padding: .65rem; border-bottom: 1px solid #ded9d0; background: #e8e3da; }
.recruitment-calendar-toolbar h3 { margin: 0; text-align: center; font-size: .95rem; }
.recruitment-calendar-toolbar button { width: 30px; height: 30px; border: 1px solid #bac8d0; border-radius: 50%; background: #fff; color: #315d77; font-size: 1.1rem; cursor: pointer; }
.recruitment-calendar-weekdays, .recruitment-calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(100px, 1fr)); min-width: 720px; }
.recruitment-calendar-weekdays { border-bottom: 1px solid #ded9d0; background: #f7f5f1; }
.recruitment-calendar-weekdays span { padding: .45rem; color: #6f7478; font-size: .7rem; font-weight: 800; text-align: center; }
.recruitment-calendar-day { min-height: 112px; padding: .45rem; border-right: 1px solid #e3e0da; border-bottom: 1px solid #e3e0da; }
.recruitment-calendar-day > strong { color: #425766; font-size: .74rem; }
.recruitment-calendar-event { margin-top: .35rem; padding: .3rem; border-left: 3px solid #5e8dab; border-radius: 3px; background: #edf4f6; color: #315d77; font-size: .68rem; line-height: 1.35; overflow-wrap: anywhere; }
@media (max-width: 820px) { .recruitment-toolbar { align-items: stretch; flex-direction: column; } .recruitment-form-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } .recruitment-card-list { grid-template-columns: 1fr; } }
@media (max-width: 820px) { .recruitment-availability-grid { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .recruitment-form-grid { grid-template-columns: 1fr; } .recruitment-form-grid label.wide { grid-column: auto; } .recruitment-card dl { grid-template-columns: 1fr; } }
.recruitment-status { display: inline-grid; place-items: center; width: 28px; height: 28px; padding: 0; border: 1px solid #c6d2da; border-radius: 50%; background: #fff; color: #5e8dab; font-weight: 800; }
.recruitment-table th:last-child, .recruitment-table td:last-child { min-width: 72px; width: 72px; white-space: nowrap; }
.recruitment-table tr.is-done td:last-child { color: inherit; text-decoration: none; }
.grid-row-edit { position: relative; }
.grid-row-edit summary { display: inline-flex; align-items: center; justify-content: center; min-height: 30px; padding: .25rem .5rem; border: 1px solid #bfcbd5; border-radius: 5px; background: #f6f9fb; color: #315d77; cursor: pointer; font-size: .72rem; font-weight: 750; }
.grid-row-edit form { position: absolute; z-index: 5; top: 2.2rem; right: 0; display: grid; gap: .4rem; width: min(420px, 80vw); padding: .7rem; border: 1px solid #cbd5dc; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgba(25,49,72,.18); text-align: left; }
.grid-row-edit label { color: #40566c; font-size: .72rem; font-weight: 700; }
.grid-row-edit label small { color: var(--muted); font-weight: 500; }
.grid-row-edit textarea { width: 100%; min-height: 90px; padding: .45rem; border: 1px solid #bcc8d1; border-radius: 5px; font: .74rem/1.45 inherit; resize: vertical; }
.grid-row-edit button { justify-self: end; min-height: 32px; padding: .3rem .65rem; }
@media (max-width: 720px) {
  .manual-search { display: grid; grid-template-columns: 1fr auto; }
  .manual-search input { grid-column: 1 / -1; }
  .paste-panel { grid-template-columns: 1fr; }
  .manual-card-heading { flex-direction: column; gap: .35rem; }
}

`
