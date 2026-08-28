const input = document.getElementById('input');
const overlay = document.getElementById('overlay');
const btnCheck = document.getElementById('btn-check');
const status = document.getElementById('status');
const issuesSection = document.getElementById('issues-section');
const issuesList = document.getElementById('issues-list');
const issueCount = document.getElementById('issue-count');
const rewriteSection = document.getElementById('rewrite-section');
const rewriteDisabled = document.getElementById('rewrite-disabled');
const rewriteControls = document.getElementById('rewrite-controls');
const rewriteStatus = document.getElementById('rewrite-status');
const diffSection = document.getElementById('diff-section');
const diffOutput = document.getElementById('diff-output');
const btnAccept = document.getElementById('btn-accept');
const btnReject = document.getElementById('btn-reject');

let currentIssues = [];
let originalText = '';
let rewrittenText = '';

function syncOverlay() {
  overlay.scrollTop = input.scrollTop;
  overlay.scrollLeft = input.scrollLeft;
}

input.addEventListener('scroll', syncOverlay);
input.addEventListener('input', () => {
  overlay.textContent = input.value;
  issuesSection.hidden = true;
  diffSection.hidden = true;
  currentIssues = [];
});

function renderOverlay(text, issues) {
  if (issues.length === 0) {
    overlay.textContent = text;
    return;
  }

  const sorted = [...issues].sort((a, b) => a.offset - b.offset);
  const frag = document.createDocumentFragment();
  let cursor = 0;

  for (const issue of sorted) {
    if (issue.offset > cursor) {
      frag.appendChild(document.createTextNode(text.slice(cursor, issue.offset)));
    }

    const span = document.createElement('span');
    span.className = 'issue';

    const issueText = text.slice(issue.offset, issue.offset + issue.length);
    span.textContent = issueText;

    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = issue.message;

    if (issue.replacements.length > 0) {
      const repDiv = document.createElement('div');
      repDiv.className = 'replacements';
      for (const rep of issue.replacements) {
        const repSpan = document.createElement('span');
        repSpan.className = 'replacement';
        repSpan.textContent = rep;
        repSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          applyReplacement(issue, rep);
        });
        repDiv.appendChild(repSpan);
      }
      tooltip.appendChild(repDiv);
    }

    span.appendChild(tooltip);
    frag.appendChild(span);
    cursor = issue.offset + issue.length;
  }

  if (cursor < text.length) {
    frag.appendChild(document.createTextNode(text.slice(cursor)));
  }

  overlay.textContent = '';
  overlay.appendChild(frag);
}

function applyReplacement(issue, replacement) {
  const text = input.value;
  const before = text.slice(0, issue.offset);
  const after = text.slice(issue.offset + issue.length);
  input.value = before + replacement + after;
  overlay.textContent = input.value;
  currentIssues = currentIssues.filter((i) => i !== issue);
  for (const other of currentIssues) {
    if (other.offset > issue.offset) {
      other.offset += replacement.length - issue.length;
    }
  }
  renderOverlay(input.value, currentIssues);
  renderIssuesList(input.value, currentIssues);
}

function renderIssuesList(text, issues) {
  issuesList.innerHTML = '';
  issueCount.textContent = issues.length;
  issuesSection.hidden = issues.length === 0;

  for (const issue of issues) {
    const li = document.createElement('li');
    const line = text.slice(0, issue.offset).split('\n').length;
    const snippet = text.slice(issue.offset, issue.offset + issue.length);

    const loc = document.createElement('span');
    loc.className = 'issue-loc';
    loc.textContent = `L${line}`;

    const msg = document.createElement('span');
    msg.className = 'issue-msg';
    msg.textContent = `${issue.message} [${snippet}]`;
    if (issue.replacements.length > 0) {
      msg.textContent += ` → ${issue.replacements[0]}`;
    }

    li.appendChild(loc);
    li.appendChild(msg);
    issuesList.appendChild(li);
  }
}

async function checkGrammar() {
  const text = input.value.trim();
  if (!text) {
    status.textContent = 'Nothing to check.';
    status.className = 'status';
    return;
  }

  btnCheck.disabled = true;
  status.textContent = 'Checking…';
  status.className = 'status';

  try {
    const res = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error);

    currentIssues = data.issues;
    renderOverlay(input.value, currentIssues);
    renderIssuesList(input.value, currentIssues);

    if (currentIssues.length === 0) {
      status.textContent = 'No issues found!';
      status.className = 'status success';
    } else {
      status.textContent = `${currentIssues.length} issue(s) found.`;
      status.className = 'status error';
    }
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
    status.className = 'status error';
  } finally {
    btnCheck.disabled = false;
  }
}

btnCheck.addEventListener('click', checkGrammar);

function renderDiff(original, rewritten) {
  diffOutput.innerHTML = '';
  const origLines = original.split('\n');
  const newLines = rewritten.split('\n');

  const maxLen = Math.max(origLines.length, newLines.length);
  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i] ?? '';
    const n = newLines[i] ?? '';

    if (o === n) {
      const div = document.createElement('div');
      div.className = 'diff-line diff-context';
      div.textContent = `  ${o}`;
      diffOutput.appendChild(div);
    } else {
      if (o) {
        const div = document.createElement('div');
        div.className = 'diff-line diff-remove';
        div.textContent = `- ${o}`;
        diffOutput.appendChild(div);
      }
      if (n) {
        const div = document.createElement('div');
        div.className = 'diff-line diff-add';
        div.textContent = `+ ${n}`;
        diffOutput.appendChild(div);
      }
    }
  }
}

async function requestRewrite(mode) {
  const text = input.value.trim();
  if (!text) {
    rewriteStatus.textContent = 'Nothing to rewrite.';
    rewriteStatus.className = 'status';
    return;
  }

  const buttons = rewriteControls.querySelectorAll('button');
  buttons.forEach((b) => (b.disabled = true));
  rewriteStatus.textContent = `Rewriting (${mode})…`;
  rewriteStatus.className = 'status';

  try {
    const res = await fetch('/api/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, mode }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    originalText = text;
    rewrittenText = data.result;
    renderDiff(originalText, rewrittenText);
    diffSection.hidden = false;
    rewriteStatus.textContent = 'Review the diff below.';
    rewriteStatus.className = 'status success';
  } catch (err) {
    rewriteStatus.textContent = `Error: ${err.message}`;
    rewriteStatus.className = 'status error';
  } finally {
    buttons.forEach((b) => (b.disabled = false));
  }
}

rewriteControls.querySelectorAll('button[data-mode]').forEach((btn) => {
  btn.addEventListener('click', () => requestRewrite(btn.dataset.mode));
});

btnAccept.addEventListener('click', () => {
  input.value = rewrittenText;
  overlay.textContent = input.value;
  diffSection.hidden = true;
  currentIssues = [];
  issuesSection.hidden = true;
  rewriteStatus.textContent = 'Rewrite applied.';
  rewriteStatus.className = 'status success';
});

btnReject.addEventListener('click', () => {
  diffSection.hidden = true;
  rewriteStatus.textContent = 'Rewrite discarded.';
  rewriteStatus.className = 'status';
});

async function init() {
  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (!config.llmEnabled) {
      rewriteDisabled.hidden = false;
      rewriteControls.hidden = true;
    }
  } catch {
    rewriteDisabled.hidden = false;
    rewriteControls.hidden = true;
  }
}

init();
