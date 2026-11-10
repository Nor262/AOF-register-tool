// ==UserScript==
// @name         AOF Smart Register Assistant v2.5 (HVTC)
// @namespace    http://tampermonkey.net/
// @version      2.5.0
// @description  Bảng điều khiển đăng ký tín chỉ HVTC trực quan: Bắn API chuẩn, Smart Retry chống 429, Tự động nhảy lớp dự phòng & Lưu dữ liệu.
// @author       Antigravity
// @match        https://congdangky.hvtc.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (document.getElementById('aof-smart-assistant-root')) return;

    const DEFAULT_PERIOD_ID = 55;

    // Danh mục 18 lớp của bạn kèm Backup tự động trong cùng Nhóm lớp
    const CATALOG = {
        group1: {
            name: "Nhóm 1 (CQ62.02.1_LT - ID 8013)",
            items: [
                { id: 87315, backupId: null, code: "INS0001", name: "Bảo hiểm", cls: "INS0001CQ62.02.1_LT", tc: 2, type: "Bắt buộc" },
                { id: 87317, backupId: null, code: "IFI0190", name: "Tài chính quốc tế", cls: "IFI0190CQ62.02.1_LT", tc: 3, type: "Bắt buộc" },
                { id: 87305, backupId: null, code: "ELA0142", name: "Pháp luật kinh tế", cls: "ELA0142CQ62.02.1_LT", tc: 3, type: "Bắt buộc" },
                { id: 87319, backupId: null, code: "ITA0501", name: "Thuế thu nhập", cls: "ITA0501CQ62.02.1_LT", tc: 3, type: "Bắt buộc" },
                { id: 87309, backupId: null, code: "ATA0216", name: "Thuế tài sản và thu khác", cls: "ATA0216CQ62.02.1_LT", tc: 2, type: "Bắt buộc" },
                { id: 87307, backupId: 89238, code: "SFL0115", name: "Tiếng Anh CN 1 (.1.1 -> Dự phòng .1.2)", cls: "SFL0115CQ62.02.1.1_LT", tc: 3, type: "38 chỗ (Có Backup)" },
                { id: 87311, backupId: 87313, code: "CAC0084", name: "KT sau thông quan (-> Dự phòng Trị giá HQ)", cls: "CAC0084CQ62.02.1_LT", tc: 2, type: "Tự chọn (2 TC)" }
            ]
        },
        group2: {
            name: "Nhóm 2 (CQ62.02.2_LT - ID 8014)",
            items: [
                { id: 87316, backupId: null, code: "INS0001", name: "Bảo hiểm", cls: "INS0001CQ62.02.2_LT", tc: 2, type: "Bắt buộc" },
                { id: 87318, backupId: null, code: "IFI0190", name: "Tài chính quốc tế", cls: "IFI0190CQ62.02.2_LT", tc: 3, type: "Bắt buộc" },
                { id: 87306, backupId: null, code: "ELA0142", name: "Pháp luật kinh tế", cls: "ELA0142CQ62.02.2_LT", tc: 3, type: "Bắt buộc" },
                { id: 87320, backupId: null, code: "ITA0501", name: "Thuế thu nhập", cls: "ITA0501CQ62.02.2_LT", tc: 3, type: "Bắt buộc" },
                { id: 87310, backupId: null, code: "ATA0216", name: "Thuế tài sản và thu khác", cls: "ATA0216CQ62.02.2_LT", tc: 2, type: "Bắt buộc" },
                { id: 87308, backupId: 89239, code: "SFL0115", name: "Tiếng Anh CN 1 (.2.1 -> Dự phòng .2.2)", cls: "SFL0115CQ62.02.2.1_LT", tc: 3, type: "38 chỗ (Có Backup)" },
                { id: 87312, backupId: 87314, code: "CAC0084", name: "KT sau thông quan (-> Dự phòng Trị giá HQ)", cls: "CAC0084CQ62.02.2_LT", tc: 2, type: "Tự chọn (2 TC)" }
            ]
        }
    };

    // Khởi tạo giao diện nổi
    const root = document.createElement('div');
    root.id = 'aof-smart-assistant-root';
    root.style.cssText = `
        position: fixed; bottom: 15px; right: 15px; z-index: 999999;
        width: 410px; background: #ffffff; border: 2px solid #0969da;
        border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.28);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 12.5px; color: #1f2328; overflow: hidden;
    `;

    root.innerHTML = `
        <div id="aof-header" style="background: linear-gradient(135deg, #0969da, #0550ae); color: #fff; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
            <div style="font-weight: 700; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                <span>⚡ AOF Smart Assistant v2.5</span>
                <span style="background: rgba(255,255,255,0.2); padding: 1px 6px; border-radius: 10px; font-size: 10.5px;">Safe Mode</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span id="aof-live-clock" style="font-family: monospace; font-size: 13px; font-weight: 700;">--:--:--</span>
                <span id="aof-toggle-icon" style="font-size: 14px; font-weight: bold;">▼</span>
            </div>
        </div>

        <div id="aof-body" style="padding: 12px;">
            <!-- Chọn Nhóm Lớp -->
            <div style="margin-bottom: 10px;">
                <div style="font-weight: 600; margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <span>1. Chọn Bộ Nhóm Lớp (Tự động khoá đồng bộ):</span>
                    <span id="aof-tc-badge" style="color: #0969da; font-weight: 700;">7 môn (18 TC)</span>
                </div>
                <div style="display: flex; gap: 6px;">
                    <button id="aof-btn-g1" style="flex: 1; padding: 6px; border-radius: 6px; border: 2px solid #0969da; background: #ddf4ff; color: #0969da; font-weight: 700; cursor: pointer; font-size: 12px;">
                        Nhóm 1 (CQ62.02.1)
                    </button>
                    <button id="aof-btn-g2" style="flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #d0d7de; background: #f6f8fa; color: #57606a; font-weight: 600; cursor: pointer; font-size: 12px;">
                        Nhóm 2 (CQ62.02.2)
                    </button>
                </div>
            </div>

            <!-- Tuỳ chỉnh lớp Tiếng Anh & Tự chọn -->
            <div style="display: flex; gap: 6px; margin-bottom: 8px; background: #f6f8fa; padding: 7px; border-radius: 6px; border: 1px solid #d0d7de;">
                <div style="flex: 1;">
                    <label style="font-size: 11px; font-weight: 600; color: #57606a;">Ưu tiên Tiếng Anh CN 1:</label>
                    <select id="aof-sel-eng" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 11.5px; margin-top: 2px;">
                        <option value="primary">Nhánh .1 (Dự phòng .2)</option>
                        <option value="backup">Nhánh .2 (Dự phòng .1)</option>
                    </select>
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 11px; font-weight: 600; color: #57606a;">Ưu tiên Môn Tự Chọn (2TC):</label>
                    <select id="aof-sel-elec" style="width: 100%; padding: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 11.5px; margin-top: 2px;">
                        <option value="cac">KT sau thông quan (DP: Trị giá HQ)</option>
                        <option value="cva">Trị giá hải quan (DP: KT sau TQ)</option>
                    </select>
                </div>
            </div>

            <!-- Danh sách 7 môn trực quan -->
            <div id="aof-class-table" style="max-height: 185px; overflow-y: auto; border: 1px solid #d0d7de; border-radius: 6px; margin-bottom: 10px;">
            </div>

            <!-- Cài đặt Giờ & Tùy chọn -->
            <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 10px; background: #fff8c5; padding: 6px 8px; border-radius: 6px; border: 1px solid #eac54f;">
                <div style="flex: 1;">
                    <label style="font-weight: 700; font-size: 11.5px; color: #9a6700;">⏰ Giờ bắn tự động:</label>
                    <input id="aof-input-time" type="text" value="08:00:00" style="width: 85px; padding: 3px 6px; border: 1px solid #9a6700; border-radius: 4px; font-family: monospace; font-weight: 700; margin-left: 4px;">
                </div>
                <label style="cursor: pointer; font-weight: 600; font-size: 11.5px; display: flex; align-items: center; gap: 4px;">
                    <input id="aof-chk-chot" type="checkbox" checked> Tự Lưu dữ liệu
                </label>
            </div>

            <!-- Các nút điều khiển -->
            <div style="display: flex; gap: 6px; margin-bottom: 8px;">
                <button id="aof-btn-test" style="padding: 7px 10px; background: #f6f8fa; color: #24292f; border: 1px solid #d0d7de; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 11.5px;" title="Kiểm tra kết nối API và xem trạng thái thật từ máy chủ ngay bây giờ">
                    🧪 Test Kết Nối
                </button>
                <button id="aof-btn-arm" style="flex: 1; padding: 7px; background: #1a7f37; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px;">
                    🚀 Bật Canh Giờ (08:00:00)
                </button>
                <button id="aof-btn-fire" style="padding: 7px 10px; background: #0969da; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 11.5px;">
                    ⚡ Bắn Ngay
                </button>
                <button id="aof-btn-stop" style="padding: 7px 8px; background: #cf222e; color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 11.5px;">
                    Dừng
                </button>
            </div>

            <!-- Nhật ký hoạt động -->
            <div id="aof-log-box" style="height: 95px; overflow-y: auto; background: #0d1117; color: #58a6ff; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 11px; line-height: 1.45;">
                <div style="color: #3fb950;">[Ready] Bảng điều khiển trực quan đã sẵn sàng! Hãy bấm "🧪 Test Kết Nối" để kiểm chứng.</div>
            </div>
        </div>
    `;

    document.body.appendChild(root);

    // State quản lý
    let currentGroup = localStorage.getItem('aof_ext_group') || 'group1';
    let engPref = localStorage.getItem('aof_ext_eng') || 'primary';
    let elecPref = localStorage.getItem('aof_ext_elec') || 'cac';
    let activePlan = []; // [{ id, backupId, code, name, tc, enabled, statusText, statusColor }]
    let isArmed = false;
    let isExecuting = false;
    let timerId = null;

    const logBox = document.getElementById('aof-log-box');
    const tableBox = document.getElementById('aof-class-table');

    function log(msg, color = '#58a6ff') {
        const now = new Date();
        const t = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const div = document.createElement('div');
        div.style.color = color;
        div.textContent = `[${t}] ${msg}`;
        logBox.prepend(div);
    }

    // Đồng hồ thời gian thực
    setInterval(() => {
        const el = document.getElementById('aof-live-clock');
        if (el) el.textContent = new Date().toLocaleTimeString('vi-VN');
    }, 250);

    // Thu gọn / Mở rộng bảng
    document.getElementById('aof-header').onclick = () => {
        const body = document.getElementById('aof-body');
        const icon = document.getElementById('aof-toggle-icon');
        if (body.style.display === 'none') {
            body.style.display = 'block';
            icon.textContent = '▼';
        } else {
            body.style.display = 'none';
            icon.textContent = '▲';
        }
    };

    function buildPlan() {
        const isG1 = currentGroup === 'group1';
        const base = JSON.parse(JSON.stringify(CATALOG[currentGroup].items));

        // Điều chỉnh Tiếng Anh theo tuỳ chọn ưu tiên
        const engItem = base.find(x => x.code === 'SFL0115');
        if (engItem) {
            if (isG1) {
                engItem.id = engPref === 'primary' ? 87307 : 89238;
                engItem.backupId = engPref === 'primary' ? 89238 : 87307;
                engItem.name = engPref === 'primary' ? "Tiếng Anh CN 1 (.1.1 -> DP .1.2)" : "Tiếng Anh CN 1 (.1.2 -> DP .1.1)";
            } else {
                engItem.id = engPref === 'primary' ? 87308 : 89239;
                engItem.backupId = engPref === 'primary' ? 89239 : 87308;
                engItem.name = engPref === 'primary' ? "Tiếng Anh CN 1 (.2.1 -> DP .2.2)" : "Tiếng Anh CN 1 (.2.2 -> DP .2.1)";
            }
        }

        // Điều chỉnh Môn Tự chọn (CAC0084 vs CVA0243)
        const elecItem = base.find(x => x.code === 'CAC0084');
        if (elecItem) {
            if (isG1) {
                elecItem.id = elecPref === 'cac' ? 87311 : 87313;
                elecItem.backupId = elecPref === 'cac' ? 87313 : 87311;
                elecItem.code = elecPref === 'cac' ? 'CAC0084' : 'CVA0243';
                elecItem.name = elecPref === 'cac' ? "KT sau thông quan (DP: Trị giá HQ)" : "Trị giá hải quan (DP: KT sau TQ)";
            } else {
                elecItem.id = elecPref === 'cac' ? 87312 : 87314;
                elecItem.backupId = elecPref === 'cac' ? 87314 : 87312;
                elecItem.code = elecPref === 'cac' ? 'CAC0084' : 'CVA0243';
                elecItem.name = elecPref === 'cac' ? "KT sau thông quan (DP: Trị giá HQ)" : "Trị giá hải quan (DP: KT sau TQ)";
            }
        }

        activePlan = base.map(item => ({
            ...item,
            enabled: true,
            statusText: 'Chờ lệnh',
            statusColor: '#57606a'
        }));
        renderTable();
    }

    function renderTable() {
        const g1Btn = document.getElementById('aof-btn-g1');
        const g2Btn = document.getElementById('aof-btn-g2');
        if (currentGroup === 'group1') {
            g1Btn.style.cssText = 'flex: 1; padding: 6px; border-radius: 6px; border: 2px solid #0969da; background: #ddf4ff; color: #0969da; font-weight: 700; cursor: pointer; font-size: 12px;';
            g2Btn.style.cssText = 'flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #d0d7de; background: #f6f8fa; color: #57606a; font-weight: 600; cursor: pointer; font-size: 12px;';
        } else {
            g2Btn.style.cssText = 'flex: 1; padding: 6px; border-radius: 6px; border: 2px solid #0969da; background: #ddf4ff; color: #0969da; font-weight: 700; cursor: pointer; font-size: 12px;';
            g1Btn.style.cssText = 'flex: 1; padding: 6px; border-radius: 6px; border: 1px solid #d0d7de; background: #f6f8fa; color: #57606a; font-weight: 600; cursor: pointer; font-size: 12px;';
        }

        const enabledItems = activePlan.filter(x => x.enabled);
        const totalTc = enabledItems.reduce((s, x) => s + x.tc, 0);
        document.getElementById('aof-tc-badge').textContent = `${enabledItems.length} môn (${totalTc} TC)`;

        tableBox.innerHTML = activePlan.map((item, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; border-bottom: 1px solid #eef1f4; background: ${item.enabled ? '#fff' : '#f6f8fa'};">
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; flex: 1;">
                    <input type="checkbox" data-idx="${idx}" class="aof-row-chk" ${item.enabled ? 'checked' : ''}>
                    <div>
                        <div style="font-weight: 600; font-size: 11.5px; color: #1f2328;">
                            <span style="font-family: monospace; color: #0969da;">#${item.id}</span>
                            ${item.backupId ? `<span style="font-size:10px; color:#9a6700;">(DP:#${item.backupId})</span>` : ''}
                            - ${item.name}
                        </div>
                    </div>
                </label>
                <span style="font-size: 10.5px; font-weight: 700; color: ${item.statusColor}; padding: 2px 6px; border-radius: 4px; background: #f6f8fa; white-space: nowrap;">
                    ${item.statusText}
                </span>
            </div>
        `).join('');

        tableBox.querySelectorAll('.aof-row-chk').forEach(chk => {
            chk.onchange = (e) => {
                const i = Number(e.target.getAttribute('data-idx'));
                activePlan[i].enabled = e.target.checked;
                renderTable();
            };
        });
    }

    document.getElementById('aof-btn-g1').onclick = () => {
        currentGroup = 'group1';
        localStorage.setItem('aof_ext_group', currentGroup);
        buildPlan();
        log('Đã chuyển sang Trọn bộ 7 môn Nhóm 1 (CQ62.02.1).');
    };

    document.getElementById('aof-btn-g2').onclick = () => {
        currentGroup = 'group2';
        localStorage.setItem('aof_ext_group', currentGroup);
        buildPlan();
        log('Đã chuyển sang Trọn bộ 7 môn Nhóm 2 (CQ62.02.2).');
    };

    document.getElementById('aof-sel-eng').value = engPref;
    document.getElementById('aof-sel-eng').onchange = (e) => {
        engPref = e.target.value;
        localStorage.setItem('aof_ext_eng', engPref);
        buildPlan();
    };

    document.getElementById('aof-sel-elec').value = elecPref;
    document.getElementById('aof-sel-elec').onchange = (e) => {
        elecPref = e.target.value;
        localStorage.setItem('aof_ext_elec', elecPref);
        buildPlan();
    };

    buildPlan();

    // API Helpers
    function getAuthHeaders(includeQueueToken = true) {
        const accessToken = localStorage.getItem('access_token');
        const periodId = localStorage.getItem('active_period_id') || String(DEFAULT_PERIOD_ID);
        let qToken = '';
        try {
            const qMap = JSON.parse(sessionStorage.getItem('queue_token_map') || '{}');
            qToken = qMap[String(periodId)] || '';
        } catch (e) {}

        const headers = {
            'Content-Type': 'application/json',
            'X-Period-Id': String(periodId)
        };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        if (includeQueueToken && qToken) headers['X-Queue-Token'] = qToken;
        return { headers, periodId, qToken, accessToken };
    }

    async function apiGetQueueStatus() {
        const { headers, periodId } = getAuthHeaders(false);
        const r = await fetch('/api/queue/status', { method: 'GET', headers });
        const data = await r.json();
        if (data.is_success && data.data && data.data.token) {
            const qMap = JSON.parse(sessionStorage.getItem('queue_token_map') || '{}');
            qMap[String(periodId)] = data.data.token;
            sessionStorage.setItem('queue_token_map', JSON.stringify(qMap));
        }
        return data;
    }

    async function apiRegisterClass(classId) {
        const { headers } = getAuthHeaders(true);
        const r = await fetch('/api/registration', {
            method: 'POST',
            headers,
            body: JSON.stringify({ classId: Number(classId) })
        });
        const body = await r.json().catch(() => ({}));
        return { httpStatus: r.status, body };
    }

    // Nút 1: 🧪 TEST KẾT NỐI (Dry Run an toàn tuyệt đối)
    document.getElementById('aof-btn-test').onclick = async () => {
        const { accessToken, periodId, qToken } = getAuthHeaders(true);
        if (!accessToken) {
            log('❌ Chưa tìm thấy access_token! Bạn hãy đăng nhập vào web trước.', '#f85149');
            return;
        }
        log(`🔍 Đang kiểm tra kết nối (Period ID: ${periodId})...`, '#d29922');

        try {
            const qRes = await apiGetQueueStatus();
            if (qRes.is_success && qRes.data) {
                const d = qRes.data;
                log(`✅ Kết nối Queue OK! Giờ mở cổng: ${d.openAt} | inQueue=${d.inQueue} | hasAccess=${d.hasAccess}`, '#3fb950');
            } else {
                log(`⚠️ Phản hồi Queue: ${qRes.message || 'Lỗi'}`, '#f85149');
            }

            // Kiểm tra danh sách lớp từ /api/registration/classes
            const { headers } = getAuthHeaders(false);
            const cResp = await fetch('/api/registration/classes', { method: 'GET', headers });
            const cJson = await cResp.json();
            if (cJson.is_success && Array.isArray(cJson.data)) {
                const map = new Map(cJson.data.map(c => [c.classId, c]));
                activePlan.forEach(item => {
                    const found = map.get(item.id);
                    if (found) {
                        item.statusText = `Còn ${found.slotsLeft} chỗ`;
                        item.statusColor = found.slotsLeft > 0 ? '#1a7f37' : '#cf222e';
                    } else {
                        item.statusText = 'Không tìm thấy';
                        item.statusColor = '#cf222e';
                    }
                });
                renderTable();
                log(`✅ Đã đồng bộ số chỗ trống của ${activePlan.length} môn! Mọi API đều hoạt động hoàn hảo 100%!`, '#3fb950');
            }
        } catch (err) {
            log(`❌ Lỗi kiểm tra: ${err.message}`, '#f85149');
        }
    };

    // Chiến dịch Bắn Đăng Ký Thông Minh (Smart Retry + Auto Backup + Chốt Dữ Liệu)
    async function runSmartRegistration() {
        if (isExecuting) return;
        isExecuting = true;

        const targets = activePlan.filter(x => x.enabled);
        if (targets.length === 0) {
            log('⚠️ Bạn chưa tick chọn môn nào!', '#f85149');
            isExecuting = false;
            return;
        }

        log(`⚡ BẮT ĐẦU CHIẾN DỊCH ĐĂNG KÝ ${targets.length} MÔN!`, '#d29922');

        // Bước 1: Đảm bảo có X-Queue-Token (hoặc hasAccess) trước khi bắn để không tốn Rate Limit
        for (let w = 0; w < 40; w++) {
            if (!isExecuting) return;
            const { qToken } = getAuthHeaders(true);
            if (qToken) break;

            const qRes = await apiGetQueueStatus().catch(() => null);
            if (qRes && qRes.data && (qRes.data.token || qRes.data.hasAccess)) {
                log(`✅ Đã nhận quyền vào cổng (hasAccess=${qRes.data.hasAccess})!`, '#3fb950');
                break;
            }
            const pos = qRes?.data?.position ?? '?';
            log(`⏳ Đang đợi hàng chờ cấp lượt (Vị trí: ${pos})...`, '#d29922');
            await new Promise(r => setTimeout(r, 1000));
        }

        // Bước 2: Bắn song song các môn đã chọn với Smart Retry (Chống 429 tuyệt đối)
        const completedIndices = new Set();

        for (let round = 1; round <= 12; round++) {
            if (!isExecuting) return;
            const pendingTargets = targets.filter((_, idx) => !completedIndices.has(idx));
            if (pendingTargets.length === 0) break;

            log(`🚀 Đợt bắn #${round} cho ${pendingTargets.length} môn...`);

            let hitRateLimit = false;
            let needQueueRefresh = false;

            await Promise.all(targets.map(async (item, idx) => {
                if (completedIndices.has(idx) || !isExecuting) return;

                item.statusText = `Đang gửi #${item.id}...`;
                item.statusColor = '#0969da';
                renderTable();

                const { httpStatus, body } = await apiRegisterClass(item.id);
                const reasonCode = body?.data?.reasonCode || '';

                if (body && body.is_success) {
                    completedIndices.add(idx);
                    item.statusText = `✅ Đã giữ #${item.id}`;
                    item.statusColor = '#1a7f37';
                    log(`✅ [${item.code}] Giữ chỗ thành công lớp #${item.id}!`, '#3fb950');
                } else if (reasonCode === 'ALREADY_REGISTERED' || reasonCode === 'ALREADY_REGISTERED_SAME_MON') {
                    completedIndices.add(idx);
                    item.statusText = `✅ Đã ĐK`;
                    item.statusColor = '#1a7f37';
                } else if (reasonCode === 'CLASS_FULL' && item.backupId) {
                    // TỰ ĐỘNG NHẢY SANG LỚP DỰ PHÒNG (BACKUP PLAN)!
                    log(`⚠️ Lớp #${item.id} HẾT CHỖ! Lập tức chuyển sang Lớp Dự Phòng #${item.backupId}!`, '#d29922');
                    item.id = item.backupId;
                    item.backupId = null;
                    const backupRes = await apiRegisterClass(item.id);
                    if (backupRes.body && backupRes.body.is_success) {
                        completedIndices.add(idx);
                        item.statusText = `✅ Đã giữ DP #${item.id}`;
                        item.statusColor = '#1a7f37';
                        log(`🎉 [${item.code}] Đăng ký thành công Lớp Dự Phòng #${item.id}!`, '#3fb950');
                    } else {
                        item.statusText = `❌ DP lỗi`;
                        item.statusColor = '#cf222e';
                    }
                } else if (httpStatus === 429) {
                    hitRateLimit = true;
                    item.statusText = `⏳ Đợi 429...`;
                    item.statusColor = '#9a6700';
                } else if (reasonCode === 'NOT_YOUR_TURN' || httpStatus === 403) {
                    needQueueRefresh = true;
                    item.statusText = `⏳ Chờ lượt...`;
                    item.statusColor = '#9a6700';
                } else if (reasonCode === 'SCHEDULE_CONFLICT' || reasonCode === 'LOCKED_TO_OTHER_NHOM_LOP' || reasonCode === 'NHOM_TU_CHON_FULL') {
                    // Lỗi quy tắc cố định -> Dừng môn này ngay để không retry vô ích
                    completedIndices.add(idx);
                    item.statusText = `⛔ ${reasonCode}`;
                    item.statusColor = '#cf222e';
                    log(`⛔ [${item.code}] Bị chặn bởi quy tắc: ${body?.message || reasonCode}`, '#f85149');
                } else {
                    item.statusText = `Thử lại (${httpStatus})`;
                    item.statusColor = '#cf222e';
                    log(`⚠️ [${item.code}] #${item.id}: ${body?.message || reasonCode || httpStatus}`, '#f85149');
                }
                renderTable();
            }));

            if (completedIndices.size >= targets.length) break;

            if (needQueueRefresh) {
                await apiGetQueueStatus().catch(() => null);
            }

            // Nhịp nghỉ thông minh: 3.5s nếu gặp 429, 1.5s cho trường hợp bình thường
            const waitMs = hitRateLimit ? 3500 : 1500;
            if (hitRateLimit) log(`🛡️ Phát hiện Rate Limit 429, tạm nghỉ 3.5s để bảo vệ tài khoản...`, '#d29922');
            await new Promise(r => setTimeout(r, waitMs));
        }

        // Bước 3: Chờ Worker ghi vào DB (trang_thai === 1) rồi tự động bấm "Lưu dữ liệu" (chot-du-lieu)
        if (document.getElementById('aof-chk-chot').checked && completedIndices.size > 0 && isExecuting) {
            log(`⏳ Đang đợi Worker ghi vào SQL Database trước khi Lưu dữ liệu...`, '#d29922');
            const { headers } = getAuthHeaders(true);

            for (let w = 0; w < 15; w++) {
                await new Promise(r => setTimeout(r, 1200));
                const myResp = await fetch('/api/registration/my', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
                if (myResp && myResp.is_success && Array.isArray(myResp.data)) {
                    const confirmedCount = myResp.data.filter(x => x.trang_thai === 1).length;
                    log(`📊 Database đã xác nhận: ${confirmedCount} môn.`);
                    if (confirmedCount >= completedIndices.size) break;
                }
            }

            const chotResp = await fetch('/api/registration/chot-du-lieu', {
                method: 'POST',
                headers,
                body: JSON.stringify({})
            }).then(r => r.json()).catch(() => null);

            if (chotResp && chotResp.is_success) {
                log(`🎉 LƯU DỮ LIỆU THÀNH CÔNG! Toàn bộ tín chỉ đã được khóa sổ an toàn!`, '#3fb950');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                log(`⚠️ Chưa tự chốt được (${chotResp?.message || 'Lỗi'}). Bạn hãy bấm nút "Lưu dữ liệu đăng ký" màu xanh trên giao diện web nhé!`, '#d29922');
            }
        }

        isExecuting = false;
    }

    // Nút 2: 🚀 BẬT CANH GIỜ (Đúng 08:00:00.100 tự bắn)
    document.getElementById('aof-btn-arm').onclick = () => {
        const targetTime = document.getElementById('aof-input-time').value.trim();
        isArmed = true;
        if (timerId) clearInterval(timerId);
        const armBtn = document.getElementById('aof-btn-arm');
        armBtn.textContent = `⏳ Đang canh ${targetTime}...`;
        armBtn.style.background = '#9a6700';
        log(`🚀 Đã bật chế độ canh giờ tự động lúc ${targetTime}. Giữ nguyên tab này nhé!`, '#3fb950');

        timerId = setInterval(() => {
            if (!isArmed) return;
            const now = new Date();
            const nowStr = now.toTimeString().split(' ')[0];
            if (nowStr >= targetTime) {
                clearInterval(timerId);
                isArmed = false;
                armBtn.textContent = `🚀 Đang thực thi...`;
                armBtn.style.background = '#1a7f37';
                // Đợi thêm 100ms sau mốc 08:00:00 để chắc chắn đồng hồ server đã mở cổng
                setTimeout(() => runSmartRegistration(), 100);
            }
        }, 100);
    };

    // Nút 3: ⚡ BẮN NGAY
    document.getElementById('aof-btn-fire').onclick = () => {
        isArmed = false;
        if (timerId) clearInterval(timerId);
        runSmartRegistration();
    };

    // Nút 4: DỪNG
    document.getElementById('aof-btn-stop').onclick = () => {
        isArmed = false;
        isExecuting = false;
        if (timerId) clearInterval(timerId);
        const armBtn = document.getElementById('aof-btn-arm');
        armBtn.textContent = `🚀 Bật Canh Giờ (08:00:00)`;
        armBtn.style.background = '#1a7f37';
        log('🛑 Đã dừng mọi tác vụ.', '#f85149');
    };
})();
