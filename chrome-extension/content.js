(function () {
    'use strict';

    const oldRoot = document.getElementById('aof-v3-root') || document.getElementById('aof-smart-assistant-root');
    if (oldRoot) oldRoot.remove();

    const DEFAULT_PERIOD_ID = 55;
    const STORAGE_KEY_V35 = 'aof_v35_state';

    // Dữ liệu chuẩn 18 lớp từ API của trường
    let allRawClasses = [
        { classId: 87315, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87316, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87317, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87318, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87305, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87306, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87319, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87320, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87309, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87310, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87307, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 89238, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.2_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, nhom_tu_chon: 0 },
        { classId: 87308, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 89239, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.2_LT", so_tin_chi: 3, slotsLeft: 37, stu_nhomlop_ids: 8014, nhom_tu_chon: 0 },
        { classId: 87311, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 2 },
        { classId: 87312, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 2 },
        { classId: 87313, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 2 },
        { classId: 87314, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 2 }
    ];

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #aof-v3-root {
            position: fixed; bottom: 14px; right: 14px; z-index: 999999;
            width: 470px; background: #ffffff;
            border: 1px solid #c8d1da; border-radius: 12px;
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12.5px; color: #1f2328; overflow: hidden;
        }
        #aof-v3-header {
            background: linear-gradient(135deg, #0969da, #0550ae); color: #fff;
            padding: 9px 14px; display: flex; justify-content: space-between;
            align-items: center; cursor: pointer; user-select: none;
        }
        #aof-v3-conn {
            padding: 6px 14px; background: #f6f8fa; border-bottom: 1px solid #d0d7de;
            display: flex; justify-content: space-between; align-items: center; font-size: 12px;
        }
        #aof-v3-body {
            padding: 12px 14px; display: flex; flex-direction: column; gap: 10px;
        }
        .aof-group-tabs {
            display: flex; gap: 6px; background: #f0f3f6; padding: 4px; border-radius: 8px;
        }
        .aof-group-tab {
            flex: 1; padding: 6px 10px; border-radius: 6px; border: none;
            font-weight: 700; font-size: 12px; cursor: pointer; background: transparent; color: #57606a;
            transition: all 0.15s;
        }
        .aof-group-tab.active {
            background: #0969da; color: #ffffff; box-shadow: 0 2px 5px rgba(9,105,218,0.25);
        }
        .aof-select-grid {
            display: grid; grid-template-columns: 145px 1fr; gap: 6px 8px;
            align-items: center; background: #f6f8fa; padding: 8px 10px;
            border-radius: 8px; border: 1px solid #d0d7de;
        }
        .aof-select-box {
            width: 100%; padding: 5px 8px; border-radius: 6px; border: 1px solid #0969da;
            background: #ffffff; font-size: 12px; font-weight: 600; color: #0969da; cursor: pointer;
        }
        .aof-table-wrap {
            border: 1px solid #d0d7de; border-radius: 8px; overflow: hidden; background: #fff;
        }
        .aof-subj-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 7px 10px; border-bottom: 1px solid #eaeef2; gap: 8px;
        }
        .aof-subj-row:last-child {
            border-bottom: none;
        }
        .aof-status-badge {
            padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap;
        }
        .aof-btn-main {
            padding: 8px 12px; border-radius: 7px; border: none; font-weight: 700;
            font-size: 12px; cursor: pointer; transition: opacity 0.15s;
        }
        .aof-btn-main:hover { opacity: 0.92; }
    `;
    document.head.appendChild(styleEl);

    const root = document.createElement('div');
    root.id = 'aof-v3-root';
    root.innerHTML = `
        <div id="aof-v3-header">
            <div style="font-weight: 700; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                <span>⚡ AOF Auto Register v3.5</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span id="aof-v3-clock" style="font-family: monospace; font-size: 13px; font-weight: 700; background: rgba(0,0,0,0.22); padding: 2px 8px; border-radius: 5px;">--:--:--</span>
                <span id="aof-v3-toggle" style="font-size: 13px; font-weight: bold;">▼</span>
            </div>
        </div>

        <div id="aof-v3-conn">
            <span id="aof-v3-conn-msg" style="font-weight: 600; color: #57606a;">🔌 Đang kiểm tra kết nối...</span>
            <button id="aof-v3-btn-check" style="padding: 3px 9px; border-radius: 5px; border: 1px solid #0969da; background: #fff; color: #0969da; font-weight: 600; font-size: 11px; cursor: pointer;">
                🔄 Kiểm tra kết nối
            </button>
        </div>

        <div id="aof-v3-body">
            <!-- Thông báo trạng thái rõ ràng -->
            <div id="aof-v3-banner" style="display: none; padding: 8px 10px; border-radius: 7px; font-weight: 600; font-size: 12px; justify-content: space-between; align-items: center; line-height: 1.4;"></div>

            <!-- 1. Chọn Nhóm Lớp -->
            <div>
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 5px; display: flex; justify-content: space-between;">
                    <span>1. Chọn Nhóm Lớp:</span>
                    <span id="aof-v3-tc-count" style="color: #0969da; font-weight: 700;">7 môn (18 TC)</span>
                </div>
                <div class="aof-group-tabs">
                    <button id="aof-tab-g1" class="aof-group-tab active">Nhóm 1 (CQ62.02.1_LT)</button>
                    <button id="aof-tab-g2" class="aof-group-tab">Nhóm 2 (CQ62.02.2_LT)</button>
                </div>
            </div>

            <!-- 2. Chọn lớp ưu tiên bằng Dropdown (Tiếng Anh & Tự chọn) -->
            <div class="aof-select-grid">
                <label style="font-weight: 600; font-size: 11.5px; color: #1f2328;">2. Ưu tiên Tiếng Anh:</label>
                <select id="aof-sel-eng" class="aof-select-box"></select>

                <label style="font-weight: 600; font-size: 11.5px; color: #1f2328;">3. Ưu tiên Tự chọn:</label>
                <select id="aof-sel-elec" class="aof-select-box"></select>
            </div>

            <!-- 3. Danh sách đầy đủ 7 môn hiển thị trọn vẹn (Không bị cắt, không thanh cuộn) -->
            <div id="aof-v3-list" class="aof-table-wrap"></div>

            <!-- 4. Cài đặt Giờ & Tự động lưu -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fff8c5; padding: 7px 12px; border-radius: 8px; border: 1px solid #eac54f;">
                <div>
                    <label style="font-weight: 700; font-size: 12px; color: #9a6700;">⏰ Giờ tự động bắn:</label>
                    <input id="aof-v3-time" type="text" value="08:00:00" style="width: 76px; padding: 3px 6px; font-family: monospace; font-weight: 700; border: 1px solid #9a6700; border-radius: 4px; margin-left: 4px; font-size: 12px;">
                </div>
                <label style="font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <input id="aof-v3-autosave" type="checkbox" checked style="width: 14px; height: 14px;"> Tự bấm "Lưu dữ liệu"
                </label>
            </div>

            <!-- 5. Nút điều khiển -->
            <div style="display: flex; gap: 6px;">
                <button id="aof-v3-arm" class="aof-btn-main" style="flex: 1.4; background: #1a7f37; color: #fff;">
                    🚀 Bật Canh Giờ (08:00:00)
                </button>
                <button id="aof-v3-fire" class="aof-btn-main" style="flex: 1; background: #0969da; color: #fff;">
                    ⚡ Đăng Ký Ngay
                </button>
                <button id="aof-v3-stop" class="aof-btn-main" style="background: #cf222e; color: #fff;">
                    Dừng
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // Đọc cấu hình đã lưu
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY_V35) || '{}'); } catch (e) {}

    let selectedGroupId = saved.selectedGroupId || 8013; // 8013 = Nhóm 1, 8014 = Nhóm 2
    let engFirstBranch = saved.engFirstBranch || '1'; // '1' = nhánh .1 trước (.2 dự phòng), '2' = nhánh .2 trước (.1 dự phòng)
    let elecFirstCode = saved.elecFirstCode || 'CAC0084'; // 'CAC0084' hoặc 'CVA0243'
    let disabledKeys = new Set(saved.disabledKeys || []);

    let subjectRows = [];
    let isArmed = false;
    let isRunning = false;
    let armTimer = null;

    const listEl = document.getElementById('aof-v3-list');
    const bannerEl = document.getElementById('aof-v3-banner');
    const connMsgEl = document.getElementById('aof-v3-conn-msg');
    const selEngEl = document.getElementById('aof-sel-eng');
    const selElecEl = document.getElementById('aof-sel-elec');

    function persistState() {
        localStorage.setItem(STORAGE_KEY_V35, JSON.stringify({
            selectedGroupId,
            engFirstBranch,
            elecFirstCode,
            disabledKeys: Array.from(disabledKeys)
        }));
    }

    // Đồng hồ thời gian thực
    setInterval(() => {
        const el = document.getElementById('aof-v3-clock');
        if (el) el.textContent = new Date().toLocaleTimeString('vi-VN');
    }, 250);

    // Thu gọn / Mở rộng
    document.getElementById('aof-v3-header').onclick = () => {
        const body = document.getElementById('aof-v3-body');
        const icon = document.getElementById('aof-v3-toggle');
        if (body.style.display === 'none') {
            body.style.display = 'flex';
            icon.textContent = '▼';
        } else {
            body.style.display = 'none';
            icon.textContent = '▲';
        }
    };

    function showBanner(text, type = 'info') {
        const styles = {
            success: { bg: '#dafbe1', border: '#1a7f37', color: '#1a7f37', icon: '✅' },
            error: { bg: '#ffebe9', border: '#cf222e', color: '#cf222e', icon: '❌' },
            warn: { bg: '#fff8c5', border: '#9a6700', color: '#9a6700', icon: '⚠️' },
            info: { bg: '#ddf4ff', border: '#0969da', color: '#0969da', icon: 'ℹ️' }
        }[type] || { bg: '#ddf4ff', border: '#0969da', color: '#0969da', icon: 'ℹ️' };

        bannerEl.style.display = 'flex';
        bannerEl.style.background = styles.bg;
        bannerEl.style.border = `1px solid ${styles.border}`;
        bannerEl.style.color = styles.color;
        bannerEl.innerHTML = `<span>${styles.icon} ${text}</span><span style="cursor:pointer;font-weight:bold;margin-left:8px;" onclick="this.parentElement.style.display='none'">✕</span>`;
    }

    // Cập nhật nội dung 2 ô Dropdown dựa theo Nhóm 1 hay Nhóm 2
    function renderDropdownOptions() {
        const gLabel = selectedGroupId === 8013 ? '02.1' : '02.2';
        selEngEl.innerHTML = `
            <option value="1">ƯT#1: SFL0115CQ62.${gLabel}.1_LT → ƯT#2: .${gLabel}.2_LT</option>
            <option value="2">ƯT#1: SFL0115CQ62.${gLabel}.2_LT → ƯT#2: .${gLabel}.1_LT</option>
        `;
        selEngEl.value = engFirstBranch;

        selElecEl.innerHTML = `
            <option value="CAC0084">ƯT#1: KT sau thông quan (CAC0084) → ƯT#2: Trị giá HQ</option>
            <option value="CVA0243">ƯT#1: Trị giá hải quan (CVA0243) → ƯT#2: KT sau TQ</option>
        `;
        selElecEl.value = elecFirstCode;
    }

    function buildGroupSubjects() {
        renderDropdownOptions();

        const groupClasses = allRawClasses.filter(c => c.stu_nhomlop_ids === selectedGroupId);
        const mandatoryMap = new Map();
        const electiveClasses = [];

        groupClasses.forEach(c => {
            if (c.nhom_tu_chon && c.nhom_tu_chon > 0) {
                electiveClasses.push(c);
            } else {
                if (!mandatoryMap.has(c.ky_hieu)) {
                    mandatoryMap.set(c.ky_hieu, {
                        key: c.ky_hieu,
                        ten_mon: c.ten_mon,
                        so_tin_chi: c.so_tin_chi,
                        isElective: false,
                        enabled: !disabledKeys.has(c.ky_hieu),
                        statusText: 'Chờ đăng ký',
                        statusType: 'idle',
                        classes: []
                    });
                }
                mandatoryMap.get(c.ky_hieu).classes.push(c);
            }
        });

        // Sắp xếp 2 lớp Tiếng Anh chuyên ngành 1 theo lựa chọn ở Dropdown
        const engRow = mandatoryMap.get('SFL0115');
        if (engRow && engRow.classes.length > 1) {
            engRow.classes.sort((a, b) => {
                const aIs1 = a.ten_lop_hp.includes('.1_LT');
                const bIs1 = b.ten_lop_hp.includes('.1_LT');
                if (engFirstBranch === '1') return (aIs1 ? -1 : 1) - (bIs1 ? -1 : 1);
                return (aIs1 ? 1 : -1) - (bIs1 ? 1 : -1);
            });
        }

        const rows = Array.from(mandatoryMap.values());

        // Sắp xếp môn Tự chọn theo lựa chọn ở Dropdown
        if (electiveClasses.length > 0) {
            electiveClasses.sort((a, b) => (a.ky_hieu === elecFirstCode ? -1 : 1) - (b.ky_hieu === elecFirstCode ? -1 : 1));
            const prio1Elec = electiveClasses[0];
            rows.push({
                key: 'ELECTIVE',
                ten_mon: `${prio1Elec.ten_mon} (Tự chọn)`,
                so_tin_chi: prio1Elec.so_tin_chi,
                isElective: true,
                enabled: !disabledKeys.has('ELECTIVE'),
                statusText: 'Chờ đăng ký',
                statusType: 'idle',
                classes: electiveClasses
            });
        }

        subjectRows = rows;
        renderList();
    }

    function renderList() {
        document.getElementById('aof-tab-g1').className = `aof-group-tab ${selectedGroupId === 8013 ? 'active' : ''}`;
        document.getElementById('aof-tab-g2').className = `aof-group-tab ${selectedGroupId === 8014 ? 'active' : ''}`;

        const enabledRows = subjectRows.filter(r => r.enabled);
        const totalTc = enabledRows.reduce((s, r) => s + r.so_tin_chi, 0);
        document.getElementById('aof-v3-tc-count').textContent = `${enabledRows.length} môn (${totalTc} TC)`;

        listEl.innerHTML = '';

        subjectRows.forEach((row) => {
            const c1 = row.classes[0];
            const c2 = row.classes[1];

            let badgeBg = '#f0f3f6', badgeColor = '#57606a';
            if (row.statusType === 'success') { badgeBg = '#dafbe1'; badgeColor = '#1a7f37'; }
            else if (row.statusType === 'error') { badgeBg = '#ffebe9'; badgeColor = '#cf222e'; }
            else if (row.statusType === 'pending') { badgeBg = '#ddf4ff'; badgeColor = '#0969da'; }

            // Hiển thị rõ ràng tên lớp ƯT#1, số chỗ trống và lớp ƯT#2 (nếu có)
            let classDetailHtml = '';
            if (c1 && c2) {
                classDetailHtml = `
                    <div style="font-size: 11px; color: #0969da; margin-top: 2px;">
                        ƯT#1: <b>${c1.ten_lop_hp}</b> <span style="color:#1a7f37;">(${c1.slotsLeft} chỗ)</span>
                        <span style="color:#57606a;"> → ƯT#2: <b>${c2.ten_lop_hp}</b> (${c2.slotsLeft} chỗ)</span>
                    </div>
                `;
            } else if (c1) {
                classDetailHtml = `
                    <div style="font-size: 11px; color: #57606a; margin-top: 2px;">
                        Lớp: <b style="color:#24292f;">${c1.ten_lop_hp}</b> <span style="color:#8c959f;">(#${c1.classId})</span> • <span style="color:#1a7f37;font-weight:600;">Còn ${c1.slotsLeft} chỗ</span>
                    </div>
                `;
            }

            const div = document.createElement('div');
            div.className = 'aof-subj-row';
            div.style.background = row.enabled ? '#ffffff' : '#f6f8fa';
            div.style.opacity = row.enabled ? '1' : '0.6';

            div.innerHTML = `
                <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; flex: 1;">
                    <input type="checkbox" class="aof-chk-item" ${row.enabled ? 'checked' : ''} style="margin-top: 3px; width: 14px; height: 14px; cursor: pointer;">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 12.5px; color: #1f2328;">
                            ${row.ten_mon} <span style="font-weight: 500; font-size: 11.5px; color: #57606a;">(${row.so_tin_chi} TC)</span>
                        </div>
                        ${classDetailHtml}
                    </div>
                </label>
                <span class="aof-status-badge" style="background: ${badgeBg}; color: ${badgeColor};">
                    ${row.statusText}
                </span>
            `;

            div.querySelector('.aof-chk-item').onchange = (e) => {
                row.enabled = e.target.checked;
                if (row.enabled) disabledKeys.delete(row.key);
                else disabledKeys.add(row.key);
                persistState();
                renderList();
            };

            listEl.appendChild(div);
        });
    }

    // Sự kiện chọn Nhóm 1 / Nhóm 2
    document.getElementById('aof-tab-g1').onclick = () => {
        selectedGroupId = 8013;
        persistState();
        buildGroupSubjects();
        showBanner('Đã chuyển sang Nhóm 1 (CQ62.02.1_LT)', 'info');
    };

    document.getElementById('aof-tab-g2').onclick = () => {
        selectedGroupId = 8014;
        persistState();
        buildGroupSubjects();
        showBanner('Đã chuyển sang Nhóm 2 (CQ62.02.2_LT)', 'info');
    };

    // Sự kiện chọn Dropdown Tiếng Anh & Tự chọn
    selEngEl.onchange = (e) => {
        engFirstBranch = e.target.value;
        persistState();
        buildGroupSubjects();
    };

    selElecEl.onchange = (e) => {
        elecFirstCode = e.target.value;
        persistState();
        buildGroupSubjects();
    };

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

    async function checkConnectionAndSync(showMsg = true) {
        const { headers, accessToken, periodId } = getAuthHeaders(false);
        let userInfo = null;
        try { userInfo = JSON.parse(localStorage.getItem('user_info') || 'null'); } catch (e) {}

        if (!accessToken) {
            connMsgEl.innerHTML = `<span style="color:#cf222e;">🔴 Chưa đăng nhập</span>`;
            if (showMsg) showBanner('Bạn chưa đăng nhập! Vui lòng đăng nhập vào web trước.', 'error');
            return;
        }

        try {
            const [qRes, cRes] = await Promise.all([
                fetch('/api/queue/status', { method: 'GET', headers }).then(r => r.json()).catch(() => null),
                fetch('/api/registration/classes', { method: 'GET', headers }).then(r => r.json()).catch(() => null)
            ]);

            if (qRes && qRes.is_success && qRes.data) {
                const q = qRes.data;
                if (q.token) {
                    const qMap = JSON.parse(sessionStorage.getItem('queue_token_map') || '{}');
                    qMap[String(periodId)] = q.token;
                    sessionStorage.setItem('queue_token_map', JSON.stringify(qMap));
                }
                const name = userInfo?.ho_ten || 'Sinh viên';
                connMsgEl.innerHTML = `<span style="color:#1a7f37;">🟢 Đã kết nối: <b>${name}</b> (Đợt ${periodId})</span>`;
                if (showMsg) showBanner(`Kết nối thành công! Cổng mở lúc ${q.openAt ? q.openAt.replace('T', ' ') : '08:00:00'}`, 'success');
            } else {
                connMsgEl.innerHTML = `<span style="color:#cf222e;">🔴 Lỗi kết nối (${qRes?.message || 'Hết phiên'})</span>`;
                if (showMsg) showBanner(`Không thể kết nối: ${qRes?.message || 'Vui lòng đăng nhập lại'}`, 'error');
            }

            if (cRes && cRes.is_success && Array.isArray(cRes.data) && cRes.data.length > 0) {
                allRawClasses = cRes.data;
                buildGroupSubjects();
            }
        } catch (err) {
            connMsgEl.innerHTML = `<span style="color:#cf222e;">🔴 Lỗi mạng</span>`;
        }
    }

    document.getElementById('aof-v3-btn-check').onclick = () => checkConnectionAndSync(true);

    buildGroupSubjects();
    setTimeout(() => checkConnectionAndSync(false), 500);

    // Xử lý bắn đăng ký cho từng môn (Khi ƯT#1 hết slot CLASS_FULL -> lập tức chuyển sang ƯT#2)
    async function registerSubjectWithFallback(row) {
        for (let i = 0; i < row.classes.length; i++) {
            if (!isRunning) return { done: false };
            const cls = row.classes[i];
            const prioLabel = row.classes.length > 1 ? ` (ƯT#${i + 1})` : '';

            row.statusType = 'pending';
            row.statusText = `⏳ Đang gửi${prioLabel}...`;
            renderList();

            const { headers } = getAuthHeaders(true);
            let httpStatus = 0;
            let body = {};
            try {
                const resp = await fetch('/api/registration', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ classId: Number(cls.classId) })
                });
                httpStatus = resp.status;
                body = await resp.json().catch(() => ({}));
            } catch (err) {
                body = { is_success: false, message: err.message };
            }

            const reasonCode = body?.data?.reasonCode || '';
            const msg = body?.message || reasonCode || `HTTP ${httpStatus}`;

            if (body && body.is_success) {
                row.statusType = 'success';
                row.statusText = `✅ Đỗ: ${cls.ten_lop_hp}`;
                renderList();
                return { done: true, success: true, cls };
            }

            if (reasonCode === 'ALREADY_REGISTERED' || reasonCode === 'ALREADY_REGISTERED_SAME_MON') {
                row.statusType = 'success';
                row.statusText = `✅ Đã ĐK: ${cls.ten_lop_hp}`;
                renderList();
                return { done: true, success: true, cls };
            }

            // HẾT SLOT (CLASS_FULL) -> Nhảy ngay sang lớp ƯT#2
            if (reasonCode === 'CLASS_FULL' || reasonCode === 'SCHEDULE_CONFLICT' || reasonCode === 'LOCKED_TO_OTHER_NHOM_LOP') {
                if (i + 1 < row.classes.length) {
                    row.statusText = `⚠️ ƯT#1 hết chỗ -> Sang ƯT#2...`;
                    renderList();
                    continue;
                } else {
                    row.statusType = 'error';
                    row.statusText = `❌ Thất bại (${reasonCode === 'CLASS_FULL' ? 'Hết chỗ' : reasonCode})`;
                    renderList();
                    return { done: true, success: false, reason: msg };
                }
            }

            if (reasonCode === 'NHOM_TU_CHON_FULL') {
                row.statusType = 'error';
                row.statusText = `⛔ Đã đủ TC tự chọn`;
                renderList();
                return { done: true, success: false, reason: msg };
            }

            // Lỗi tạm thời (chưa mở cổng / chờ lượt / 429) -> Giữ nguyên ƯT#1 để thử lại
            row.statusType = 'pending';
            row.statusText = `⏳ Chờ lượt (${reasonCode || httpStatus})`;
            renderList();
            return {
                done: false,
                hitRateLimit: httpStatus === 429,
                needQueue: reasonCode === 'NOT_YOUR_TURN' || httpStatus === 403,
                lastMsg: msg
            };
        }
        return { done: true, success: false };
    }

    async function runCampaign() {
        if (isRunning) return;
        isRunning = true;

        const targets = subjectRows.filter(r => r.enabled);
        if (targets.length === 0) {
            showBanner('Bạn chưa chọn môn học nào!', 'error');
            isRunning = false;
            return;
        }

        showBanner(`Đang gửi đăng ký ${targets.length} môn học...`, 'info');

        const { qToken } = getAuthHeaders(true);
        if (!qToken) await checkConnectionAndSync(false);

        const finished = new Map();

        for (let round = 1; round <= 12; round++) {
            if (!isRunning) break;
            const pending = targets.filter(r => !finished.has(r.key));
            if (pending.length === 0) break;

            let hit429 = false;
            let needQueue = false;

            await Promise.all(pending.map(async (row) => {
                const res = await registerSubjectWithFallback(row);
                if (res.done) {
                    finished.set(row.key, res);
                } else {
                    if (res.hitRateLimit) hit429 = true;
                    if (res.needQueue) needQueue = true;
                    if (round === 12) {
                        row.statusType = 'error';
                        row.statusText = `❌ ${res.lastMsg || 'Chưa mở cổng'}`;
                        renderList();
                        finished.set(row.key, { done: true, success: false, reason: res.lastMsg });
                    }
                }
            }));

            if (finished.size >= targets.length || !isRunning) break;
            if (needQueue) await checkConnectionAndSync(false);

            await new Promise(r => setTimeout(r, hit429 ? 3500 : 1500));
        }

        const okCount = Array.from(finished.values()).filter(v => v.success).length;

        if (document.getElementById('aof-v3-autosave').checked && okCount > 0 && isRunning) {
            showBanner(`Đã giữ chỗ ${okCount}/${targets.length} môn! Đang chờ DB xác nhận để Lưu dữ liệu...`, 'info');
            const { headers } = getAuthHeaders(true);
            for (let w = 0; w < 12; w++) {
                await new Promise(r => setTimeout(r, 1200));
                const myRes = await fetch('/api/registration/my', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
                if (myRes && myRes.is_success && Array.isArray(myRes.data)) {
                    if (myRes.data.filter(x => x.trang_thai === 1).length >= okCount) break;
                }
            }
            const chotRes = await fetch('/api/registration/chot-du-lieu', {
                method: 'POST',
                headers,
                body: JSON.stringify({})
            }).then(r => r.json()).catch(() => null);

            if (chotRes && chotRes.is_success) {
                showBanner(`HOÀN TẤT: Đã đăng ký và Lưu dữ liệu thành công ${okCount}/${targets.length} môn!`, 'success');
            } else {
                showBanner(`Đã đăng ký ${okCount}/${targets.length} môn! Hãy bấm nút "Lưu dữ liệu" trên web.`, 'warn');
            }
        } else {
            if (okCount === targets.length) {
                showBanner(`Đăng ký thành công toàn bộ ${okCount}/${targets.length} môn!`, 'success');
            } else if (okCount > 0) {
                showBanner(`Đăng ký thành công ${okCount}/${targets.length} môn.`, 'warn');
            } else {
                const sampleReason = Array.from(finished.values())[0]?.reason || 'Chưa tới giờ mở cổng';
                showBanner(`Chưa đăng ký được: ${sampleReason}`, 'error');
            }
        }

        isRunning = false;
    }

    document.getElementById('aof-v3-arm').onclick = () => {
        const targetTime = document.getElementById('aof-v3-time').value.trim();
        isArmed = true;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v3-arm');
        btn.textContent = `⏳ Đang canh ${targetTime}...`;
        btn.style.background = '#9a6700';
        showBanner(`Đã bật hẹn giờ tự động lúc ${targetTime}. Giữ nguyên tab này nhé!`, 'info');

        armTimer = setInterval(() => {
            if (!isArmed) return;
            const nowStr = new Date().toTimeString().split(' ')[0];
            if (nowStr >= targetTime) {
                clearInterval(armTimer);
                isArmed = false;
                btn.textContent = `🚀 Bật Canh Giờ (${targetTime})`;
                btn.style.background = '#1a7f37';
                setTimeout(() => runCampaign(), 100);
            }
        }, 100);
    };

    document.getElementById('aof-v3-fire').onclick = () => {
        isArmed = false;
        if (armTimer) clearInterval(armTimer);
        runCampaign();
    };

    document.getElementById('aof-v3-stop').onclick = () => {
        isArmed = false;
        isRunning = false;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v3-arm');
        btn.textContent = `🚀 Bật Canh Giờ (08:00:00)`;
        btn.style.background = '#1a7f37';
        showBanner('Đã dừng tác vụ đăng ký tự động.', 'warn');
    };
})();
