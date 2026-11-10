// ==UserScript==
// @name         AOF Smart Register Assistant v3.2 (HVTC)
// @namespace    http://tampermonkey.net/
// @version      3.2.0
// @description  Giao diện đăng ký tín chỉ HVTC gọn đẹp: Chọn Nhóm 1/Nhóm 2, sắp xếp lớp ưu tiên cho môn có nhiều lớp, thông báo trạng thái rõ ràng.
// @author       Antigravity
// @match        https://congdangky.hvtc.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const oldRoot = document.getElementById('aof-v3-root') || document.getElementById('aof-smart-assistant-root');
    if (oldRoot) oldRoot.remove();

    const DEFAULT_PERIOD_ID = 55;
    const STORAGE_KEY_V32 = 'aof_v32_state';

    // Dữ liệu 18 lớp từ API của trường
    let allRawClasses = [
        { classId: 87315, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 3, phong: "408-LVH" }, { thu: 1, tiet: 0, so_tiet: 2, phong: "408-LVH" }] },
        { classId: 87316, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 2, so_tiet: 3, phong: "405-LVH" }, { thu: 4, tiet: 0, so_tiet: 2, phong: "405-LVH" }] },
        { classId: 87317, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 2, tiet: 2, so_tiet: 3, phong: "408-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 4, tiet: 0, so_tiet: 2, phong: "408-LVH" }] },
        { classId: 87318, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 4, tiet: 2, so_tiet: 2, phong: "405-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87305, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 5, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 3, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87306, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 3, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 5, tiet: 2, so_tiet: 2, phong: "405-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87319, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 5, tiet: 2, so_tiet: 2, phong: "408-LVH" }, { thu: 3, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87320, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 5, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 1, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 3, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87309, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87310, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 4, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87307, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 2, phong: "408-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 89238, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.2_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 2, phong: "107-CL-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "302-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "305A-LVH" }] },
        { classId: 87308, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 2, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 89239, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.2_LT", so_tin_chi: 3, slotsLeft: 37, stu_nhomlop_ids: 8014, nhom_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "401-LVH" }, { thu: 2, tiet: 0, so_tiet: 2, phong: "504-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "504-LVH" }] },
        { classId: 87311, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 2, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "" }] },
        { classId: 87312, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 2, thoiKhoaBieus: [{ thu: 0, tiet: 0, so_tiet: 2, phong: "" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "" }] },
        { classId: 87313, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, nhom_tu_chon: 2, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87314, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, nhom_tu_chon: 2, thoiKhoaBieus: [{ thu: 0, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "405-LVH" }] }
    ];

    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #aof-v3-root {
            position: fixed; bottom: 16px; right: 16px; z-index: 999999;
            width: 420px; background: #ffffff;
            border: 1px solid #d0d7de; border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12.5px; color: #1f2328; overflow: hidden;
        }
        #aof-v3-header {
            background: #0969da; color: #fff; padding: 10px 14px;
            display: flex; justify-content: space-between; align-items: center;
            cursor: pointer; user-select: none;
        }
        #aof-v3-conn {
            padding: 7px 12px; background: #f6f8fa; border-bottom: 1px solid #e1e4e8;
            display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;
        }
        #aof-v3-body {
            padding: 12px; display: flex; flex-direction: column; gap: 10px;
        }
        .aof-group-tabs {
            display: flex; gap: 6px; background: #f6f8fa; padding: 4px; border-radius: 8px; border: 1px solid #d0d7de;
        }
        .aof-group-tab {
            flex: 1; padding: 6px 8px; border-radius: 6px; border: none;
            font-weight: 700; font-size: 12px; cursor: pointer; background: transparent; color: #57606a;
            transition: all 0.15s;
        }
        .aof-group-tab.active {
            background: #0969da; color: #ffffff; box-shadow: 0 2px 5px rgba(9,105,218,0.25);
        }
        .aof-row-item {
            border: 1px solid #e1e4e8; border-radius: 8px; background: #fff; overflow: hidden;
        }
        .aof-row-main {
            padding: 7px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
        }
        .aof-row-multi {
            cursor: pointer; background: #f8fbff;
        }
        .aof-row-multi:hover {
            background: #eef6ff;
        }
        .aof-sub-drawer {
            padding: 8px 10px; background: #f6f8fa; border-top: 1px solid #e1e4e8;
            display: none; flex-direction: column; gap: 5px;
        }
        .aof-sub-drawer.open {
            display: flex;
        }
        .aof-sub-cls {
            display: flex; align-items: center; justify-content: space-between;
            padding: 5px 8px; background: #fff; border: 1px solid #d0d7de; border-radius: 6px;
            cursor: grab;
        }
        .aof-sub-cls.dragging {
            opacity: 0.5; border: 1px dashed #0969da; background: #ddf4ff;
        }
        .aof-prio-num {
            width: 30px; padding: 2px; text-align: center; font-weight: 700;
            border: 1px solid #0969da; border-radius: 4px; color: #0969da; font-size: 11px;
        }
        .aof-status-pill {
            padding: 2px 7px; border-radius: 10px; font-size: 10.5px; font-weight: 700; white-space: nowrap;
        }
        .aof-action-btn {
            padding: 8px 10px; border-radius: 7px; border: none; font-weight: 700;
            font-size: 12px; cursor: pointer; transition: opacity 0.15s;
        }
        .aof-action-btn:hover { opacity: 0.92; }
    `;
    document.head.appendChild(styleEl);

    const root = document.createElement('div');
    root.id = 'aof-v3-root';
    root.innerHTML = `
        <div id="aof-v3-header">
            <div style="font-weight: 700; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                <span>⚡ AOF Auto Register</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span id="aof-v3-clock" style="font-family: monospace; font-size: 13px; font-weight: 700; background: rgba(0,0,0,0.2); padding: 2px 7px; border-radius: 5px;">--:--:--</span>
                <span id="aof-v3-toggle" style="font-size: 13px; font-weight: bold;">▼</span>
            </div>
        </div>

        <div id="aof-v3-conn">
            <span id="aof-v3-conn-msg" style="font-weight: 600; color: #57606a;">🔌 Đang kiểm tra kết nối...</span>
            <button id="aof-v3-btn-check" style="padding: 2px 8px; border-radius: 4px; border: 1px solid #0969da; background: #fff; color: #0969da; font-weight: 600; font-size: 11px; cursor: pointer;">
                🔄 Kiểm tra kết nối
            </button>
        </div>

        <div id="aof-v3-body">
            <!-- Thông báo trạng thái rõ ràng -->
            <div id="aof-v3-banner" style="display: none; padding: 7px 10px; border-radius: 7px; font-weight: 600; font-size: 11.5px; justify-content: space-between; align-items: center;"></div>

            <!-- 1. Chọn Nhóm Lớp (Nhóm 1 vs Nhóm 2) -->
            <div>
                <div style="font-weight: 600; font-size: 11.5px; margin-bottom: 4px; display: flex; justify-content: space-between;">
                    <span>1. Chọn Nhóm Lớp:</span>
                    <span id="aof-v3-tc-count" style="color: #0969da; font-weight: 700;">7 môn (18 TC)</span>
                </div>
                <div class="aof-group-tabs">
                    <button id="aof-tab-g1" class="aof-group-tab active">Nhóm 1 (CQ62.02.1)</button>
                    <button id="aof-tab-g2" class="aof-group-tab">Nhóm 2 (CQ62.02.2)</button>
                </div>
            </div>

            <!-- 2. Chọn Môn Tự Chọn Ưu Tiên (2 TC) -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f6f8fa; padding: 6px 10px; border-radius: 8px; border: 1px solid #d0d7de;">
                <span style="font-weight: 600; font-size: 11.5px;">2. Môn tự chọn ưu tiên:</span>
                <select id="aof-sel-elective" style="padding: 4px 6px; border-radius: 5px; border: 1px solid #d0d7de; font-size: 11.5px; font-weight: 600; color: #1f2328;">
                    <option value="CAC0084">KT sau thông quan (DP: Trị giá HQ)</option>
                    <option value="CVA0243">Trị giá hải quan (DP: KT sau TQ)</option>
                </select>
            </div>

            <!-- 3. Danh sách 7 môn trong nhóm (Chỉ môn có >1 lớp như Tiếng Anh mới mở rộng để xếp ưu tiên) -->
            <div id="aof-v3-list" style="display: flex; flex-direction: column; gap: 5px; max-height: 250px; overflow-y: auto;"></div>

            <!-- 4. Cài đặt Giờ & Tự động lưu -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fff8c5; padding: 6px 10px; border-radius: 8px; border: 1px solid #eac54f;">
                <div>
                    <label style="font-weight: 700; font-size: 11.5px; color: #9a6700;">⏰ Giờ bắn:</label>
                    <input id="aof-v3-time" type="text" value="08:00:00" style="width: 72px; padding: 2px 5px; font-family: monospace; font-weight: 700; border: 1px solid #9a6700; border-radius: 4px; margin-left: 4px;">
                </div>
                <label style="font-weight: 600; font-size: 11.5px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <input id="aof-v3-autosave" type="checkbox" checked> Tự bấm "Lưu dữ liệu"
                </label>
            </div>

            <!-- 5. Nút điều khiển -->
            <div style="display: flex; gap: 6px;">
                <button id="aof-v3-arm" class="aof-action-btn" style="flex: 1.3; background: #1a7f37; color: #fff;">
                    🚀 Bật Canh Giờ (08:00:00)
                </button>
                <button id="aof-v3-fire" class="aof-action-btn" style="flex: 1; background: #0969da; color: #fff;">
                    ⚡ Đăng Ký Ngay
                </button>
                <button id="aof-v3-stop" class="aof-action-btn" style="background: #cf222e; color: #fff;">
                    Dừng
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // State lưu trữ
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY_V32) || '{}'); } catch (e) {}

    let selectedGroupId = saved.selectedGroupId || 8013; // 8013 = Nhóm 1, 8014 = Nhóm 2
    let primaryElectiveCode = saved.primaryElectiveCode || 'CAC0084'; // CAC0084 hoặc CVA0243
    let multiClassOrder = saved.multiClassOrder || {}; // { "772_8013": [87307, 89238], "772_8014": [87308, 89239] }
    let disabledSubjects = new Set(saved.disabledSubjects || []);
    let expandedMultiKey = 'SFL0115'; // Mặc định mở sẵn môn nhiều lớp (Tiếng Anh) để người dùng thấy ngay

    let subjectRows = []; // Danh sách 7 dòng môn đang hiển thị
    let isArmed = false;
    let isRunning = false;
    let armTimer = null;

    const listEl = document.getElementById('aof-v3-list');
    const bannerEl = document.getElementById('aof-v3-banner');
    const connMsgEl = document.getElementById('aof-v3-conn-msg');

    function persistState() {
        localStorage.setItem(STORAGE_KEY_V32, JSON.stringify({
            selectedGroupId,
            primaryElectiveCode,
            multiClassOrder,
            disabledSubjects: Array.from(disabledSubjects)
        }));
    }

    // Đồng hồ
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
        bannerEl.innerHTML = `<span>${styles.icon} ${text}</span><span style="cursor:pointer;font-weight:bold;margin-left:6px;" onclick="this.parentElement.style.display='none'">✕</span>`;
    }

    // Xây dựng danh sách 7 môn theo Nhóm Lớp đã chọn (8013 hoặc 8014)
    function buildGroupSubjects() {
        const groupClasses = allRawClasses.filter(c => c.stu_nhomlop_ids === selectedGroupId);

        // Gom các môn bắt buộc (nhom_tu_chon === 0) theo ky_hieu
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
                        enabled: !disabledSubjects.has(c.ky_hieu),
                        statusText: 'Chờ đăng ký',
                        statusType: 'idle',
                        classes: []
                    });
                }
                mandatoryMap.get(c.ky_hieu).classes.push(c);
            }
        });

        const rows = Array.from(mandatoryMap.values());

        // Áp dụng thứ tự ưu tiên đã lưu cho môn có > 1 lớp (ví dụ SFL0115 có 2 lớp trong cùng nhóm)
        rows.forEach(r => {
            if (r.classes.length > 1) {
                const orderKey = `${r.key}_${selectedGroupId}`;
                const savedOrder = multiClassOrder[orderKey];
                if (Array.isArray(savedOrder)) {
                    r.classes.sort((a, b) => {
                        const ia = savedOrder.indexOf(a.classId);
                        const ib = savedOrder.indexOf(b.classId);
                        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
                    });
                }
            }
        });

        // Thêm 1 dòng cho Môn Tự Chọn (Ưu tiên #1 là môn đã chọn ở dropdown, Ưu tiên #2 dự phòng là môn tự chọn còn lại trong cùng nhóm)
        if (electiveClasses.length > 0) {
            electiveClasses.sort((a, b) => (a.ky_hieu === primaryElectiveCode ? -1 : 1) - (b.ky_hieu === primaryElectiveCode ? -1 : 1));
            const primaryElec = electiveClasses[0];
            rows.push({
                key: 'ELECTIVE_GROUP',
                ten_mon: `${primaryElec.ten_mon} (Tự chọn)`,
                so_tin_chi: primaryElec.so_tin_chi,
                isElective: true,
                enabled: !disabledSubjects.has('ELECTIVE_GROUP'),
                statusText: 'Chờ đăng ký',
                statusType: 'idle',
                classes: electiveClasses
            });
        }

        subjectRows = rows;
        renderList();
    }

    function renderList() {
        // Cập nhật trạng thái nút Tab Nhóm 1 / Nhóm 2
        document.getElementById('aof-tab-g1').className = `aof-group-tab ${selectedGroupId === 8013 ? 'active' : ''}`;
        document.getElementById('aof-tab-g2').className = `aof-group-tab ${selectedGroupId === 8014 ? 'active' : ''}`;
        document.getElementById('aof-sel-elective').value = primaryElectiveCode;

        const enabledRows = subjectRows.filter(r => r.enabled);
        const totalTc = enabledRows.reduce((s, r) => s + r.so_tin_chi, 0);
        document.getElementById('aof-v3-tc-count').textContent = `${enabledRows.length} môn (${totalTc} TC)`;

        listEl.innerHTML = '';

        subjectRows.forEach((row) => {
            const isMulti = !row.isElective && row.classes.length > 1;
            const isExpanded = isMulti && expandedMultiKey === row.key;
            const prio1 = row.classes[0];
            const prio2 = row.classes[1];

            let pillBg = '#f6f8fa', pillColor = '#57606a';
            if (row.statusType === 'success') { pillBg = '#dafbe1'; pillColor = '#1a7f37'; }
            else if (row.statusType === 'error') { pillBg = '#ffebe9'; pillColor = '#cf222e'; }
            else if (row.statusType === 'pending') { pillBg = '#ddf4ff'; pillColor = '#0969da'; }

            const itemDiv = document.createElement('div');
            itemDiv.className = 'aof-row-item';

            let subtitleHtml = '';
            if (isMulti) {
                subtitleHtml = `<div style="font-size: 11px; color: #0969da; font-weight: 600; margin-top: 2px;">
                    ƯT#1: ${prio1.ten_lop_hp} (${prio1.slotsLeft} chỗ) → ƯT#2: ${prio2.ten_lop_hp}
                </div>`;
            } else if (row.isElective && prio2) {
                subtitleHtml = `<div style="font-size: 10.5px; color: #57606a; margin-top: 1px;">
                    Lớp: <b>${prio1.ten_lop_hp}</b> (${prio1.slotsLeft} chỗ) • Dự phòng: ${prio2.ten_lop_hp}
                </div>`;
            } else if (prio1) {
                subtitleHtml = `<div style="font-size: 10.5px; color: #57606a; margin-top: 1px;">
                    Lớp: <b>${prio1.ten_lop_hp}</b> (#${prio1.classId} • Còn ${prio1.slotsLeft} chỗ)
                </div>`;
            }

            itemDiv.innerHTML = `
                <div class="aof-row-main ${isMulti ? 'aof-row-multi' : ''}">
                    <div style="display: flex; align-items: center; gap: 7px; flex: 1; overflow: hidden;">
                        <input type="checkbox" class="aof-row-chk" ${row.enabled ? 'checked' : ''} style="cursor: pointer; width: 14px; height: 14px;">
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <div style="font-weight: 700; font-size: 12px; color: #1f2328; display: flex; align-items: center; gap: 5px;">
                                <span>${row.ten_mon}</span>
                                <span style="font-weight: 500; font-size: 11px; color: #57606a;">(${row.so_tin_chi} TC)</span>
                                ${isMulti ? `<span style="background:#ddf4ff;color:#0969da;font-size:10px;padding:1px 5px;border-radius:4px;">${row.classes.length} lớp - Bấm để xếp ƯT ${isExpanded ? '▲' : '▼'}</span>` : ''}
                            </div>
                            ${subtitleHtml}
                        </div>
                    </div>
                    <span class="aof-status-pill" style="background: ${pillBg}; color: ${pillColor};">
                        ${row.statusText}
                    </span>
                </div>
                ${isMulti ? `<div class="aof-sub-drawer ${isExpanded ? 'open' : ''}">
                    <div style="font-size: 10.5px; color: #57606a;">💡 Kéo thả hoặc nhập số thứ tự ưu tiên (Khi ƯT#1 hết chỗ sẽ tự nhảy sang ƯT#2):</div>
                    <div class="aof-sub-list" style="display: flex; flex-direction: column; gap: 4px;"></div>
                </div>` : ''}
            `;

            const chk = itemDiv.querySelector('.aof-row-chk');
            chk.onclick = (e) => e.stopPropagation();
            chk.onchange = (e) => {
                row.enabled = e.target.checked;
                if (row.enabled) disabledSubjects.delete(row.key);
                else disabledSubjects.add(row.key);
                persistState();
                renderList();
            };

            if (isMulti) {
                itemDiv.querySelector('.aof-row-main').onclick = () => {
                    expandedMultiKey = expandedMultiKey === row.key ? null : row.key;
                    renderList();
                };

                const subList = itemDiv.querySelector('.aof-sub-list');
                let dragIdx = null;

                row.classes.forEach((cls, idx) => {
                    const clsDiv = document.createElement('div');
                    clsDiv.className = 'aof-sub-cls';
                    clsDiv.draggable = true;
                    clsDiv.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="color: #8c959f; cursor: grab;">☰</span>
                            <input type="number" min="1" max="${row.classes.length}" value="${idx + 1}" class="aof-prio-num" title="Thứ tự ưu tiên">
                            <div>
                                <div style="font-weight: 700; font-size: 11.5px; color: #1f2328;">
                                    Ưu tiên #${idx + 1}: <span style="color:#0969da;">${cls.ten_lop_hp}</span> (#${cls.classId})
                                </div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="font-size: 11px; font-weight: 600; color: #1a7f37;">Còn ${cls.slotsLeft} chỗ</span>
                            <button class="aof-swap-btn" style="padding: 2px 6px; font-size: 10px; border: 1px solid #d0d7de; background: #f6f8fa; border-radius: 4px; cursor: pointer;" title="Đảo vị trí ưu tiên">⇅ Đổi</button>
                        </div>
                    `;

                    const saveMultiOrder = () => {
                        multiClassOrder[`${row.key}_${selectedGroupId}`] = row.classes.map(c => c.classId);
                        persistState();
                        renderList();
                    };

                    clsDiv.addEventListener('dragstart', (e) => {
                        dragIdx = idx;
                        clsDiv.classList.add('dragging');
                        e.dataTransfer.effectAllowed = 'move';
                    });
                    clsDiv.addEventListener('dragend', () => clsDiv.classList.remove('dragging'));
                    clsDiv.addEventListener('dragover', (e) => e.preventDefault());
                    clsDiv.addEventListener('drop', (e) => {
                        e.preventDefault();
                        if (dragIdx === null || dragIdx === idx) return;
                        const moved = row.classes.splice(dragIdx, 1)[0];
                        row.classes.splice(idx, 0, moved);
                        saveMultiOrder();
                    });

                    clsDiv.querySelector('.aof-prio-num').onchange = (e) => {
                        let newPos = parseInt(e.target.value, 10) - 1;
                        if (isNaN(newPos)) return;
                        newPos = Math.max(0, Math.min(row.classes.length - 1, newPos));
                        if (newPos === idx) return;
                        const moved = row.classes.splice(idx, 1)[0];
                        row.classes.splice(newPos, 0, moved);
                        saveMultiOrder();
                    };

                    clsDiv.querySelector('.aof-swap-btn').onclick = () => {
                        const targetIdx = idx === 0 ? 1 : 0;
                        if (!row.classes[targetIdx]) return;
                        const tmp = row.classes[idx];
                        row.classes[idx] = row.classes[targetIdx];
                        row.classes[targetIdx] = tmp;
                        saveMultiOrder();
                    };

                    subList.appendChild(clsDiv);
                });
            }

            listEl.appendChild(itemDiv);
        });
    }

    // Sự kiện chọn Nhóm 1 / Nhóm 2
    document.getElementById('aof-tab-g1').onclick = () => {
        selectedGroupId = 8013;
        persistState();
        buildGroupSubjects();
        showBanner('Đã chọn bộ môn Nhóm 1 (CQ62.02.1_LT)', 'info');
    };

    document.getElementById('aof-tab-g2').onclick = () => {
        selectedGroupId = 8014;
        persistState();
        buildGroupSubjects();
        showBanner('Đã chọn bộ môn Nhóm 2 (CQ62.02.2_LT)', 'info');
    };

    // Sự kiện chọn môn tự chọn ưu tiên
    document.getElementById('aof-sel-elective').onchange = (e) => {
        primaryElectiveCode = e.target.value;
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
            if (showMsg) showBanner('Bạn chưa đăng nhập! Hãy đăng nhập vào cổng trước.', 'error');
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

    // Xử lý bắn đăng ký cho 1 môn (Nếu lớp ƯT#1 hết slot CLASS_FULL -> lập tức chuyển sang lớp ƯT#2)
    async function registerSubjectWithFallback(row) {
        for (let i = 0; i < row.classes.length; i++) {
            if (!isRunning) return { done: false };
            const cls = row.classes[i];
            const prioTag = row.classes.length > 1 ? ` (ƯT#${i + 1})` : '';

            row.statusType = 'pending';
            row.statusText = `⏳ Đang gửi ${cls.ten_lop_hp}${prioTag}...`;
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
                row.statusText = `✅ Thành công: ${cls.ten_lop_hp}`;
                renderList();
                return { done: true, success: true, cls };
            }

            if (reasonCode === 'ALREADY_REGISTERED' || reasonCode === 'ALREADY_REGISTERED_SAME_MON') {
                row.statusType = 'success';
                row.statusText = `✅ Đã ĐK: ${cls.ten_lop_hp}`;
                renderList();
                return { done: true, success: true, cls };
            }

            // Chỉ khi lớp ƯT#1 HẾT SLOT (CLASS_FULL) hoặc xung đột mới nhảy sang lớp ƯT#2
            if (reasonCode === 'CLASS_FULL' || reasonCode === 'SCHEDULE_CONFLICT' || reasonCode === 'LOCKED_TO_OTHER_NHOM_LOP') {
                if (i + 1 < row.classes.length) {
                    row.statusText = `⚠️ #${cls.classId} hết chỗ -> Chuyển ƯT#${i + 2}...`;
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

            // Lỗi tạm thời (chưa mở cổng / chờ lượt / 429) -> Giữ nguyên ƯT#1 để đợt sau bắn lại
            row.statusType = 'pending';
            row.statusText = `⏳ Chờ thử lại (${reasonCode || httpStatus})`;
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
                        row.statusText = `❌ Thất bại (${res.lastMsg || 'Chưa mở'})`;
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

        // Tự động Lưu dữ liệu nếu có môn thành công
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
                showBanner(`Đăng ký thành công ${okCount}/${targets.length} môn (Xem trạng thái trên từng môn).`, 'warn');
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
