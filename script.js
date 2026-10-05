/* ================= LOGIN SYSTEM ================= */
/* Add more users below. Each entry: { username: 'xxx', password: 'yyy', displayName: 'Full Name' } */
const USERS = [
    { username: 'Rupesh', password: 'Rupesh@123', displayName: 'Rupesh Vaidya' },
];

/* ===== Access expiry — after this date/time, login is BLOCKED =====
   Change the date below to set a new expiry.
   Format: YYYY-MM-DDTHH:MM:SS  (ISO 8601, local time)               */
const ACCESS_EXPIRY = new Date('2026-11-07T23:59:59').getTime();

/* In-memory session flag — cleared on every page reload */
let sessionActive = false;

/* Check if current time is BEFORE expiry */
function isAccessAllowed() {
    return Date.now() < ACCESS_EXPIRY;
}

function handleLogin(e) {
    e.preventDefault();

    /* === Block login if expired === */
    if (!isAccessAllowed()) {
        document.getElementById('loginError').textContent =
            'Access expired on ' +
            new Date(ACCESS_EXPIRY).toLocaleString() +
            '. Please contact Rupesh Vaidya.';
        return false;
    }

    const user = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errEl = document.getElementById('loginError');
    errEl.textContent = '';

    const match = USERS.find(u => u.username === user && u.password === pass);
    if (match) {
        sessionActive = true;   /* only in memory — lost on reload */
        document.getElementById('loginOverlay').classList.add('hidden');

        const sel = document.getElementById('preparedBy');
        if (sel) {
            for (let i = 0; i < sel.options.length; i++) {
                if (sel.options[i].value === match.displayName) {
                    sel.selectedIndex = i;
                    break;
                }
            }
        }
        return false;
    } else {
        errEl.textContent = 'Invalid username or password. Please try again.';
        return false;
    }
}

function logout() {
    sessionActive = false;
    document.getElementById('loginOverlay').classList.remove('hidden');
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('loginUser').focus();
}

/* On page load — no auto-restore. User must always log in fresh. */
(function initialCheck() {
    if (!isAccessAllowed()) {
        /* Expired — lock the form entirely */
        const overlay = document.getElementById('loginOverlay');
        const loginForm = document.getElementById('loginForm');
        const errEl = document.getElementById('loginError');

        if (loginForm) loginForm.style.display = 'none';
        if (errEl) {
            errEl.style.fontSize = '1rem';
            errEl.style.padding = '20px';
            errEl.style.background = '#fee2e2';
            errEl.style.borderRadius = '10px';
            errEl.style.border = '1px solid #b91c1c';
            errEl.textContent =
                'This survey form has expired on ' +
                new Date(ACCESS_EXPIRY).toLocaleDateString() +
                '. Please contact Rupesh Vaidya for a new link.';
        }
        if (overlay) overlay.classList.remove('hidden');
    } else {
        document.getElementById('loginUser').focus();
    }
})();

/* ================= MAIN FORM ================= */
(function() {
    function generateEntryId() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 9000 + 1000);
        return `AD-${year}${month}${day}-${random}`;
    }

    let entryId = generateEntryId();
    document.getElementById('entryIdDisplay').textContent = entryId;
    document.getElementById('entryIdHidden').value = entryId;

    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSegZ96mhZBwlSW3zlFKGgo6ZT5HEjcZSo_YU-hC84eY4A7s6g/formResponse';

    const FIELD_MAPPING = {
        entryId:         'entry.275250873',
        projectName:     'entry.1535469195',
        projectDate:     'entry.164888573',
        clientName:      'entry.1449595220',
        preparedBy:      'entry.1419018725',
        projectLocation: 'entry.2086149404',
        contactNo:       'entry.135638359',
        architect:       'entry.1385938541',
        contractor:      'entry.673960460',
        d1_sheetEntry:   'entry.313765337',
        d2_sheetEntry:   'entry.1444211779',
        d3_sheetEntry:   'entry.408317472',
        commonRemarks:   'entry.269043285'
    };

    function val(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }

    function buildPdfTitle() {
        const project = (val('projectName') || '').trim();
        const client  = (val('clientName')  || '').trim();
        const parts = [];
        if (project) parts.push(project);
        if (client)  parts.push(client);
        let base = parts.join(' - ') || 'AryanDoors_Survey';
        base = base.replace(/[\\\/:*?"<>|\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        if (base.length > 120) base = base.substring(0, 120).trim();
        return base;
    }

    function getCheckedValues(className) {
        const checked = [];
        document.querySelectorAll(`.${className}:checked`).forEach(cb => checked.push(cb.value));
        const otherTextInput = document.querySelector(`.other-text[data-group="${className}"]`);
        if (otherTextInput) {
            const typed = otherTextInput.value.trim();
            if (typed) {
                const idx = checked.indexOf('Other');
                if (idx !== -1) checked[idx] = 'Other: ' + typed;
                else checked.push('Other: ' + typed);
            }
        }
        return checked;
    }

    const SHEET_ENTRY_FIELDS = [
        { id: 'shutterThickness', label: 'Shutter Thickness' },
        { id: 'shutterType', label: 'Shutter Type' },
        { id: 'coreMaterial', label: 'Core Material' },
        { id: 'framework', label: 'Framework' },
        { id: 'laminate', label: 'Laminate' },
        { id: 'laminateShade', label: 'Laminate Shade' },
        { id: 'surface', label: 'Surface Finish' },
        { id: 'design', label: 'Design' },
        { id: 'edgeBinding', label: 'Edge Binding' },
        { id: 'edgeTreatment', label: 'Edge Treatment' },
        { id: 'specialCoating', label: 'Special Coating' },
        { id: 'moistureProtection', label: 'Moisture Protection' },
        { id: 'colourCode', label: 'Colour / Code' },
        { id: 'openingHanding', label: 'Opening / Handing' },
        { id: 'performance', label: 'Performance' },
        { id: 'frameThickness', label: 'Frame Thickness' },
        { id: 'frameMaterial', label: 'Frame Material' },
        { id: 'frameWidthDepth', label: 'Frame Width / Depth' },
        { id: 'frameLaminate', label: 'Laminate on Frame' },
        { id: 'coverMoulding', label: 'Cover Moulding' },
        { id: 'rebate', label: 'Rebate' },
        { id: 'frameFinish', label: 'Frame Finish' },
        { id: 'jointFixing', label: 'Joint / Fixing' },
        { id: 'wallCondition', label: 'Wall Condition' },
        { id: 'baseFrame', label: 'Base Frame' },
        { id: 'graniteScope', label: 'Granite Base Frame Scope' },
        { id: 'frameCovering', label: 'Frame Covering Over Granite' },
        { id: 'doorSeal', label: 'Door Seal Rubber' },
        { id: 'edgeSealing', label: 'Edge Sealing' },
        { id: 'archMaterial', label: 'Architrave Material' },
        { id: 'archProfile', label: 'Architrave Profile' },
        { id: 'archThickness', label: 'Architrave Thickness' },
        { id: 'archWidth', label: 'Architrave Width' },
        { id: 'archFinish', label: 'Architrave Finish' },
        { id: 'hingeBrand', label: 'Hinge Brand' },
        { id: 'hingeSize', label: 'Hinge Size' },
        { id: 'hingeQty', label: 'Hinge Quantity' },
        { id: 'screwSize', label: 'Screw Size' },
        { id: 'pvcCatcher', label: 'PVC Catcher' }
    ];

    function buildSheetEntry(prefix) {
        const parts = [];
        const badgeEl = document.querySelector(`.door-type-block.${prefix} .badge`);
        const doorCode = badgeEl ? badgeEl.textContent.trim() : prefix.toUpperCase();
        const doorName = (val(prefix + '_doorTypeName') || '').trim();
        const doorLabel = doorName ? `${doorCode} - ${doorName}` : doorCode;
        parts.push(doorLabel);

        const desc  = (val(prefix + '_description') || '').trim();
        const size  = (val(prefix + '_size')        || '').trim();
        const unit  = (val(prefix + '_unit')        || '').trim();
        const rate  = (val(prefix + '_rate')        || '').trim();
        if (desc) parts.push(`Description - ${desc}`);
        if (size) parts.push(`Size - ${size}`);
        if (unit) parts.push(`Unit - ${unit}`);
        if (rate) parts.push(`Rate - ${rate}`);

        SHEET_ENTRY_FIELDS.forEach(f => {
            const value = (val(prefix + '_' + f.id) || '').trim();
            if (value && value !== '—' && value !== '-') {
                parts.push(`${f.label} - ${value}`);
            }
        });

        const clientLock = getCheckedValues(prefix + '_clientLock');
        if (clientLock.length) parts.push(`Client-Supplied Locks - ${clientLock.join(', ')}`);
        const contractorScope = getCheckedValues(prefix + '_contractorScope');
        if (contractorScope.length) parts.push(`Contractor Scope - ${contractorScope.join(', ')}`);

        return parts.join(', ');
    }

    function refreshSheetEntry(prefix) {
        const out = document.getElementById(prefix + '_sheetEntry');
        if (!out) return;
        const summary = buildSheetEntry(prefix);
        if (!out.dataset.manuallyEdited || out.value.trim() === '') {
            out.value = summary;
            out.dataset.autoValue = summary;
        }
    }

    function refreshAllSheetEntries() {
        ['d1','d2','d3'].forEach(prefix => refreshSheetEntry(prefix));
    }
    window.refreshAllSheetEntries = refreshAllSheetEntries;

    window.toggleSheetEntry = function(prefix) {
        const el = document.querySelector(`.sheet-entry-summary[data-door="${prefix}"]`);
        if (!el) return;
        el.classList.toggle('open');
        if (el.classList.contains('open')) {
            refreshSheetEntry(prefix);
        }
    };

    window.refreshSheetEntry = function(prefix) {
        const out = document.getElementById(prefix + '_sheetEntry');
        if (out) {
            out.dataset.manuallyEdited = '';
            out.value = buildSheetEntry(prefix);
            out.dataset.autoValue = out.value;
        }
    };

    window.copySheetEntry = function(prefix, btn) {
        const out = document.getElementById(prefix + '_sheetEntry');
        if (!out) return;
        const text = out.value;
        const finish = () => {
            const original = btn.innerHTML;
            btn.classList.add('copied');
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                btn.innerHTML = original;
            }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(finish).catch(() => {
                out.select();
                document.execCommand('copy');
                finish();
            });
        } else {
            out.select();
            document.execCommand('copy');
            finish();
        }
    };

    document.querySelectorAll('.sheet-entry-output').forEach(ta => {
        ta.addEventListener('input', function() {
            if (this.value !== this.dataset.autoValue) {
                this.dataset.manuallyEdited = 'true';
            } else {
                this.dataset.manuallyEdited = '';
            }
        });
    });

    function setupSheetEntryAutoUpdate() {
        document.querySelectorAll('textarea, input').forEach(el => {
            if (el.classList.contains('sheet-entry-output')) return;
            el.addEventListener('input', () => {
                clearTimeout(el._sheetTimer);
                el._sheetTimer = setTimeout(refreshAllSheetEntries, 200);
            });
            el.addEventListener('change', () => {
                clearTimeout(el._sheetTimer);
                el._sheetTimer = setTimeout(refreshAllSheetEntries, 100);
            });
        });
    }

    function collectFormData() {
        refreshAllSheetEntries();
        return {
            entryId:         val('entryIdHidden') || entryId,
            projectName:     val('projectName'),
            projectDate:     val('projectDate'),
            clientName:      val('clientName'),
            preparedBy:      val('preparedBy') || 'Rupesh Vaidya',
            projectLocation: val('projectLocation'),
            contactNo:       val('contactNo'),
            architect:       val('architect'),
            contractor:      val('contractor'),
            d1_sheetEntry:   val('d1_sheetEntry'),
            d2_sheetEntry:   val('d2_sheetEntry'),
            d3_sheetEntry:   val('d3_sheetEntry'),
            commonRemarks:   val('commonRemarks')
        };
    }

    function setupOtherToggles() {
        document.querySelectorAll('.other-toggle').forEach(toggle => {
            const group = toggle.getAttribute('data-group');
            const wrap = document.querySelector(`.other-input-wrap[data-group="${group}"]`);
            const textInput = wrap ? wrap.querySelector('.other-text') : null;
            const label = toggle.closest('label');
            toggle.addEventListener('change', function() {
                if (this.checked) {
                    if (wrap) wrap.classList.add('show');
                    if (label) label.classList.add('other-ticked');
                    if (textInput) textInput.focus();
                } else {
                    if (wrap) wrap.classList.remove('show');
                    if (label) label.classList.remove('other-ticked');
                    if (textInput) textInput.value = '';
                }
            });
        });
    }

    function setupAutoResize() {
        document.querySelectorAll('textarea').forEach(ta => {
            const resize = () => {
                ta.style.height = 'auto';
                ta.style.height = (ta.scrollHeight + 2) + 'px';
            };
            ta.addEventListener('input', resize);
            resize();
        });
    }

    window.addEventListener('resize', () => {
        document.querySelectorAll('textarea').forEach(ta => {
            ta.style.height = 'auto';
            ta.style.height = (ta.scrollHeight + 2) + 'px';
        });
    });

    setupOtherToggles();
    setupAutoResize();
    setupSheetEntryAutoUpdate();
    setTimeout(refreshAllSheetEntries, 100);

function forceSheetEntriesForPrint() {
    refreshAllSheetEntries();

    document.querySelectorAll('.sheet-entry-summary').forEach(el => {
        el.classList.add('open');
        el.style.cssText += ';display:block!important;height:auto!important;max-height:none!important;overflow:visible!important;';
    });

    document.querySelectorAll('.sheet-entry-summary .sheet-entry-body').forEach(body => {
        body.style.cssText += ';display:block!important;visibility:visible!important;height:auto!important;max-height:none!important;overflow:visible!important;';
    });

    document.querySelectorAll('.sheet-entry-output').forEach(out => {
        // Remove HTML width attributes so CSS takes full control
        out.removeAttribute('rows');
        out.removeAttribute('cols');
        out.setAttribute('cols', '120');

        // Reset inline styles that could clip content
        out.style.height = 'auto';
        out.style.minHeight = '0';
        out.style.maxHeight = 'none';
        out.style.overflow = 'visible';
        out.style.resize = 'none';
        out.style.width = '100%';
        out.style.boxSizing = 'border-box';
        out.style.whiteSpace = 'pre-wrap';
        out.style.wordBreak = 'break-word';
        out.style.overflowWrap = 'anywhere';
    });

    // Same treatment for common remarks
    const commonRemarks = document.getElementById('commonRemarks');
    if (commonRemarks) {
        commonRemarks.style.height = 'auto';
        commonRemarks.style.minHeight = '0';
        commonRemarks.style.maxHeight = 'none';
        commonRemarks.style.overflow = 'visible';
        commonRemarks.style.resize = 'none';
    }

    // Force reflow so the browser recalculates the auto-heights
    // BEFORE the print dialog opens
    void document.body.offsetHeight;
}

            const out = el.querySelector('.sheet-entry-output');
if (out) {
  out.removeAttribute('rows');
  out.removeAttribute('cols');          // <-- ADD THIS
  out.setAttribute('cols', '120');      // <-- ADD THIS
  out.style.width = '100%';             // <-- ADD THIS
  out.style.maxWidth = '100%';          // <-- ADD THIS
  out.style.boxSizing = 'border-box';   // <-- ADD THIS
  out.style.display = 'block';
  out.style.visibility = 'visible';
  out.style.height = 'auto';
  out.style.minHeight = '0';
  out.style.maxHeight = 'none';
  out.style.overflow = 'visible';
  out.style.resize = 'none';
  out.style.height = out.scrollHeight + 'px';
}
        });
        const commonRemarks = document.getElementById('commonRemarks');
        if (commonRemarks) {
            commonRemarks.style.height = 'auto';
            commonRemarks.style.maxHeight = 'none';
            commonRemarks.style.overflow = 'visible';
            commonRemarks.style.resize = 'none';
            commonRemarks.style.height = commonRemarks.scrollHeight + 'px';
        }
    }

    window.addEventListener('beforeprint', function() {
        forceSheetEntriesForPrint();
    });

    function showToast(message, isError, isInfo) {
        const toast = document.getElementById('statusToast');
        const msgEl = document.getElementById('statusMessage');
        msgEl.textContent = message;
        toast.classList.toggle('error', !!isError);
        toast.classList.toggle('info', !!isInfo);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    document.getElementById('printBtn').addEventListener('click', function() {
        forceSheetEntriesForPrint();
        const pdfName = buildPdfTitle();
        const originalTitle = document.title;
        const titleEl = document.getElementById('pageTitle');
        document.title = pdfName;
        if (titleEl) titleEl.textContent = pdfName;
        showToast('Opening print dialog... Choose "Save as PDF"', false, true);
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.title = originalTitle;
                if (titleEl) titleEl.textContent = originalTitle;
            }, 1000);
        }, 300);
    });

    document.getElementById('submitBtn').addEventListener('click', async function() {
        const btn = this;
        refreshAllSheetEntries();
        const formData = collectFormData();
        const params = new URLSearchParams();
        for (const key in FIELD_MAPPING) {
            const entryKey = FIELD_MAPPING[key];
            const value = formData[key];
            if (value === undefined) continue;
            if (Array.isArray(value)) value.forEach(v => params.append(entryKey, v));
            else params.append(entryKey, value || '');
        }
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        try {
            await fetch(GOOGLE_FORM_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });
            showToast('✓ Submitted successfully!', false);
            btn.innerHTML = '<i class="fas fa-check"></i> Submitted!';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit to Google Form';
            }, 2500);
        } catch (err) {
            console.error(err);
            showToast('⚠ Submission failed.', true);
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit to Google Form';
        }
    });

    document.getElementById('downloadBtn').addEventListener('click', function() {
        forceSheetEntriesForPrint();
        const clone = document.querySelector('.form-container').cloneNode(true);
        clone.querySelectorAll('.btn-group, .status-toast').forEach(el => el.remove());
        const pdfTitle = buildPdfTitle();
        const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${pdfTitle}</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
        <link rel="stylesheet" href="style.css">
        </head><body>${clone.outerHTML}</body></html>`;
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pdfTitle}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    document.getElementById('resetBtn').addEventListener('click', function() {
        if (confirm('Reset all fields? This will clear your entries.')) {
            location.reload();
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Logout? Unsaved changes will be lost.')) {
            logout();
        }
    });

    /* ================= SAVE DATA (.json) ================= */
    document.getElementById('saveDataBtn').addEventListener('click', function() {
        refreshAllSheetEntries();
        const fieldValues = {};
        document.querySelectorAll('input, textarea, select').forEach(el => {
            if (!el.id) return;
            if (el.type === 'file') return;
            if (el.type === 'checkbox') {
                fieldValues[el.id] = el.checked;
            } else if (el.type === 'radio') {
                if (el.checked) fieldValues[el.id] = el.value;
            } else {
                fieldValues[el.id] = el.value;
            }
        });

        const checkboxGroups = {};
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (!cb.checked) return;
            const classList = (cb.className || '').split(/\s+/).filter(c =>
                c && c !== 'other-toggle' && c !== 'other-label' && c !== 'other-text'
            );
            classList.forEach(cls => {
                if (!checkboxGroups[cls]) checkboxGroups[cls] = [];
                if (!checkboxGroups[cls].includes(cb.value)) {
                    checkboxGroups[cls].push(cb.value);
                }
            });
        });

        const payload = {
            _meta: {
                savedAt: new Date().toISOString(),
                app: 'AryanDoors Survey',
                version: '1.0'
            },
            entryId: val('entryIdHidden') || val('entryIdDisplay'),
            fieldValues: fieldValues,
            checkboxGroups: checkboxGroups
        };

        const json = JSON.stringify(payload, null, 2);
        const filename = buildPdfTitle() + '.json';
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('✓ Data saved as ' + filename, false);
    });

    /* ================= LOAD DATA (.json) ================= */
    document.getElementById('loadDataBtn').addEventListener('click', function() {
        document.getElementById('loadFileInput').click();
    });

    document.getElementById('loadFileInput').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const payload = JSON.parse(event.target.result);
                const fields = payload.fieldValues || payload._allFieldValues || payload;
                const groups = payload.checkboxGroups || payload._checkboxes || {};

                document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

                for (const id in fields) {
                    const el = document.getElementById(id);
                    if (!el) continue;
                    const v = fields[id];
                    if (el.type === 'checkbox') {
                        el.checked = !!v;
                    } else if (el.type === 'radio') {
                        if (el.value === v) el.checked = true;
                    } else if (el.type !== 'file') {
                        el.value = v == null ? '' : v;
                    }
                }

                const loadedEntryId = payload.entryId || fields.entryIdHidden;
                if (loadedEntryId) {
                    entryId = loadedEntryId;
                    document.getElementById('entryIdHidden').value = loadedEntryId;
                    document.getElementById('entryIdDisplay').textContent = loadedEntryId;
                }

                for (const cls in groups) {
                    const values = groups[cls] || [];
                    document.querySelectorAll('.' + cls).forEach(cb => {
                        if (values.includes(cb.value)) cb.checked = true;
                    });
                }

                document.querySelectorAll('.other-toggle').forEach(toggle => {
                    if (toggle.checked) {
                        const group = toggle.getAttribute('data-group');
                        const wrap = document.querySelector(`.other-input-wrap[data-group="${group}"]`);
                        const label = toggle.closest('label');
                        if (wrap) wrap.classList.add('show');
                        if (label) label.classList.add('other-ticked');
                    }
                });

                refreshAllSheetEntries();
                document.querySelectorAll('textarea').forEach(ta => {
                    ta.style.height = 'auto';
                    ta.style.height = (ta.scrollHeight + 2) + 'px';
                });

                showToast('✓ Data loaded successfully', false);
            } catch (err) {
                console.error('Load failed:', err);
                showToast('⚠ Failed to load file. Check it is a valid saved .json', true);
            } finally {
                e.target.value = '';
            }
        };
        reader.readAsText(file);
    });
})();
