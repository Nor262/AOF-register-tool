// ==UserScript==
// @name         AOF Smart Register Assistant v3.0 (HVTC)
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @description  Giao diện trực quan đăng ký tín chỉ HVTC: Kéo thả & đánh số thứ tự ưu tiên lớp theo từng môn, thông báo chi tiết, tự nhảy lớp khi hết slot.
// @author       Antigravity
// @match        https://congdangky.hvtc.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (document.getElementById('aof-v3-root')) return;

    const DEFAULT_PERIOD_ID = 55;
    const STORAGE_KEY_CONFIG = 'aof_v3_priority_config';

    // Danh sách fallback 18 lớp chuẩn từ API của cổng (phòng trường hợp mở tool trước khi web tải xong)
    const FALLBACK_CLASSES = [
        { classId: 87315, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 3, phong: "408-LVH" }, { thu: 1, tiet: 0, so_tiet: 2, phong: "408-LVH" }] },
        { classId: 87316, id_mon: 776, ky_hieu: "INS0001", ten_mon: "Bảo hiểm", ten_lop_hp: "INS0001CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 2, so_tiet: 3, phong: "405-LVH" }, { thu: 4, tiet: 0, so_tiet: 2, phong: "405-LVH" }] },
        { classId: 87317, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 2, tiet: 2, so_tiet: 3, phong: "408-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 4, tiet: 0, so_tiet: 2, phong: "408-LVH" }] },
        { classId: 87318, id_mon: 777, ky_hieu: "IFI0190", ten_mon: "Tài chính quốc tế", ten_lop_hp: "IFI0190CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 4, tiet: 2, so_tiet: 2, phong: "405-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87305, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 5, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 3, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87306, id_mon: 771, ky_hieu: "ELA0142", ten_mon: "Pháp luật kinh tế", ten_lop_hp: "ELA0142CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 3, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 5, tiet: 2, so_tiet: 2, phong: "405-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87319, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.1_LT", so_tin_chi: 3, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 5, tiet: 2, so_tiet: 2, phong: "408-LVH" }, { thu: 3, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87320, id_mon: 778, ky_hieu: "ITA0501", ten_mon: "Thuế thu nhập", ten_lop_hp: "ITA0501CQ62.02.2_LT", so_tin_chi: 3, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 5, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 1, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 3, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87309, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 1, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87310, id_mon: 773, ky_hieu: "ATA0216", ten_mon: "Thuế tài sản và thu khác", ten_lop_hp: "ATA0216CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 1, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 4, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 87307, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 2, phong: "408-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 89238, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.1.2_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 2, so_tiet: 2, phong: "107-CL-LVH" }, { thu: 0, tiet: 0, so_tiet: 2, phong: "302-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "305A-LVH" }] },
        { classId: 87308, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.1_LT", so_tin_chi: 3, slotsLeft: 38, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 2, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "405-LVH" }] },
        { classId: 89239, id_mon: 772, ky_hieu: "SFL0115", ten_mon: "Tiếng Anh chuyên ngành 1", ten_lop_hp: "SFL0115CQ62.02.2.2_LT", so_tin_chi: 3, slotsLeft: 37, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 0, so_tin_chi_tu_chon: 0, thoiKhoaBieus: [{ thu: 4, tiet: 0, so_tiet: 2, phong: "401-LVH" }, { thu: 2, tiet: 0, so_tiet: 2, phong: "504-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "504-LVH" }] },
        { classId: 87311, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 2, so_tin_chi_tu_chon: 2.0, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "" }] },
        { classId: 87312, id_mon: 774, ky_hieu: "CAC0084", ten_mon: "Kiểm tra sau thông quan", ten_lop_hp: "CAC0084CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 2, so_tin_chi_tu_chon: 2.0, thoiKhoaBieus: [{ thu: 0, tiet: 0, so_tiet: 2, phong: "" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "" }] },
        { classId: 87313, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.1_LT", so_tin_chi: 2, slotsLeft: 76, stu_nhomlop_ids: 8013, is_lock_nhom_lop: true, nhom_tu_chon: 2, so_tin_chi_tu_chon: 2.0, thoiKhoaBieus: [{ thu: 2, tiet: 0, so_tiet: 2, phong: "408-LVH" }, { thu: 0, tiet: 2, so_tiet: 3, phong: "408-LVH" }] },
        { classId: 87314, id_mon: 775, ky_hieu: "CVA0243", ten_mon: "Trị giá hải quan", ten_lop_hp: "CVA0243CQ62.02.2_LT", so_tin_chi: 2, slotsLeft: 75, stu_nhomlop_ids: 8014, is_lock_nhom_lop: true, nhom_tu_chon: 2, so_tin_chi_tu_chon: 2.0, thoiKhoaBieus: [{ thu: 0, tiet: 0, so_tiet: 2, phong: "405-LVH" }, { thu: 2, tiet: 2, so_tiet: 3, phong: "405-LVH" }] }
    ];

    // CSS Styles cho toàn bộ Dashboard & Drag-and-Drop
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        #aof-v3-root {
            position: fixed; bottom: 14px; right: 14px; z-index: 999999;
            width: 485px; max-height: 92vh; background: #ffffff;
            border: 2px solid #0969da; border-radius: 14px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.28);
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 12.5px; color: #1f2328; display: flex; flex-direction: column; overflow: hidden;
        }
        #aof-v3-header {
            background: linear-gradient(135deg, #0969da 0%, #0550ae 100%);
            color: #ffffff; padding: 10px 14px; display: flex;
            justify-content: space-between; align-items: center; cursor: pointer; user-select: none;
        }
        #aof-v3-conn-bar {
            padding: 6px 12px; font-size: 11.5px; font-weight: 600;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #d0d7de; background: #f6f8fa;
        }
        #aof-v3-body {
            padding: 10px 12px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px;
        }
        .aof-subj-card {
            border: 1px solid #d0d7de; border-radius: 8px; background: #ffffff; overflow: hidden;
            transition: border-color 0.15s, box-shadow 0.15s;
        }
        .aof-subj-card.active-card {
            border-color: #0969da;
        }
        .aof-subj-header {
            padding: 7px 10px; display: flex; justify-content: space-between; align-items: center;
            background: #f6f8fa; cursor: pointer; user-select: none;
        }
        .aof-subj-header:hover {
            background: #eef2f6;
        }
        .aof-class-list {
            padding: 6px 8px; background: #ffffff; border-top: 1px solid #e1e4e8;
            display: none; flex-direction: column; gap: 5px;
        }
        .aof-class-list.open {
            display: flex;
        }
        .aof-class-item {
            display: flex; align-items: center; justify-content: space-between; gap: 6px;
            padding: 6px 8px; border: 1px solid #d0d7de; border-radius: 6px;
            background: #ffffff; cursor: grab; transition: transform 0.1s, background 0.15s;
        }
        .aof-class-item.dragging {
            opacity: 0.5; background: #ddf4ff; border: 1px dashed #0969da;
        }
        .aof-class-item.disabled-cls {
            opacity: 0.55; background: #f6f8fa;
        }
        .aof-prio-input {
            width: 34px; padding: 2px 4px; text-align: center; font-weight: 700;
            border: 1px solid #0969da; border-radius: 4px; color: #0969da; font-size: 11.5px;
        }
        .aof-badge {
            padding: 2px 6px; border-radius: 4px; font-size: 10.5px; font-weight: 700; white-space: nowrap;
        }
        .aof-toast-banner {
            padding: 8px 10px; border-radius: 8px; font-weight: 600; font-size: 12px;
            display: none; align-items: center; justify-content: space-between; gap: 8px;
        }
        .aof-btn {
            padding: 7px 10px; border-radius: 6px; font-weight: 700; font-size: 11.5px;
            cursor: pointer; border: none; transition: opacity 0.15s;
        }
        .aof-btn:hover { opacity: 0.92; }
    `;
    document.head.appendChild(styleEl);

    const root = document.createElement('div');
    root.id = 'aof-v3-root';
    root.innerHTML = `
        <div id="aof-v3-header">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 15px;">⚡</span>
                <div>
                    <div style="font-weight: 700; font-size: 13.5px;">AOF Smart Register v3.0</div>
                    <div style="font-size: 10.5px; opacity: 0.9;">Click vào môn để Kéo thả / Điền số thứ tự ưu tiên lớp</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <span id="aof-v3-clock" style="font-family: monospace; font-size: 13.5px; font-weight: 700; background: rgba(0,0,0,0.2); padding: 2px 7px; border-radius: 6px;">--:--:--</span>
                <span id="aof-v3-collapse-btn" style="font-size: 14px; font-weight: bold;">▼</span>
            </div>
        </div>

        <!-- Thanh trạng thái kết nối -->
        <div id="aof-v3-conn-bar">
            <span id="aof-v3-conn-text" style="color: #57606a;">🔌 Đang kiểm tra kết nối máy chủ...</span>
            <button id="aof-v3-sync-btn" style="padding: 2px 8px; font-size: 11px; font-weight: 600; border: 1px solid #0969da; background: #ddf4ff; color: #0969da; border-radius: 4px; cursor: pointer;">
                🔄 Tải lại Lớp & Kiểm tra kết nối
            </button>
        </div>

        <div id="aof-v3-body">
            <!-- Thông báo nổi (Toast Banner) -->
            <div id="aof-v3-toast" class="aof-toast-banner"></div>

            <!-- Thanh chọn nhanh Nhóm 1 / Nhóm 2 -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #f6f8fa; padding: 6px 8px; border-radius: 6px; border: 1px solid #d0d7de;">
                <div style="font-size: 11.5px; font-weight: 600;">
                    Chọn nhanh Ưu tiên #1 theo Nhóm:
                </div>
                <div style="display: flex; gap: 5px;">
                    <button id="aof-v3-preset-g1" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #0969da; background: #ddf4ff; color: #0969da; font-weight: 700; font-size: 11px; cursor: pointer;">
                        Ưu tiên #1: Nhóm 1 (.02.1)
                    </button>
                    <button id="aof-v3-preset-g2" style="padding: 4px 8px; border-radius: 5px; border: 1px solid #9a6700; background: #fff8c5; color: #9a6700; font-weight: 700; font-size: 11px; cursor: pointer;">
                        Ưu tiên #1: Nhóm 2 (.02.2)
                    </button>
                </div>
            </div>

            <!-- Cảnh báo xung đột quy tắc (nếu có) -->
            <div id="aof-v3-warning" style="display: none; padding: 6px 8px; border-radius: 6px; background: #ffebe9; border: 1px solid #ff818266; color: #cf222e; font-size: 11.5px; font-weight: 600;"></div>

            <!-- Danh sách Môn học & Thứ tự ưu tiên lớp -->
            <div id="aof-v3-subjects-container" style="display: flex; flex-direction: column; gap: 6px; max-height: 290px; overflow-y: auto; padding-right: 2px;"></div>

            <!-- Bảng Tổng kết Kết quả Đăng ký -->
            <div id="aof-v3-summary-box" style="display: none; padding: 8px 10px; border-radius: 8px; border: 2px solid #1a7f37; background: #dafbe1; font-size: 11.5px;"></div>

            <!-- Cài đặt hẹn giờ & Tự động lưu -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #fff8c5; padding: 6px 10px; border-radius: 6px; border: 1px solid #eac54f;">
                <div>
                    <label style="font-weight: 700; font-size: 11.5px; color: #9a6700;">⏰ Giờ tự động bắn:</label>
                    <input id="aof-v3-time-input" type="text" value="08:00:00" style="width: 78px; padding: 2px 6px; font-family: monospace; font-weight: 700; border: 1px solid #9a6700; border-radius: 4px; margin-left: 4px;">
                </div>
                <label style="font-weight: 600; font-size: 11.5px; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <input id="aof-v3-auto-save" type="checkbox" checked> Tự bấm "Lưu dữ liệu"
                </label>
            </div>

            <!-- Cụm nút hành động chính -->
            <div style="display: flex; gap: 6px;">
                <button id="aof-v3-btn-arm" class="aof-btn" style="flex: 1.3; background: #1a7f37; color: #fff;">
                    🚀 Bật Canh Giờ (08:00:00)
                </button>
                <button id="aof-v3-btn-fire" class="aof-btn" style="flex: 1; background: #0969da; color: #fff;">
                    ⚡ Đăng Ký Ngay
                </button>
                <button id="aof-v3-btn-stop" class="aof-btn" style="background: #cf222e; color: #fff;">
                    🛑 Dừng
                </button>
            </div>

            <!-- Nhật ký chi tiết -->
            <div id="aof-v3-log" style="height: 85px; overflow-y: auto; background: #0d1117; color: #58a6ff; border-radius: 6px; padding: 6px 8px; font-family: monospace; font-size: 11px; line-height: 1.45;">
                <div style="color: #3fb950;">[System] AOF v3.0 sẵn sàng! Hãy bấm vào từng môn để xem hoặc kéo thả thứ tự ưu tiên lớp.</div>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // Biến trạng thái
    let subjectsState = []; // [{ subjectKey, id_mon, ky_hieu, ten_mon, so_tin_chi, nhom_tu_chon, enabled, expanded, statusType, statusMessage, classes: [{ classId, ten_lop_hp, stu_nhomlop_ids, slotsLeft, tkbStr, enabled, tryStatus }] }]
    let isArmed = false;
    let isRunning = false;
    let armInterval = null;

    const logEl = document.getElementById('aof-v3-log');
    const toastEl = document.getElementById('aof-v3-toast');
    const connTextEl = document.getElementById('aof-v3-conn-text');
    const subjectsContainer = document.getElementById('aof-v3-subjects-container');
    const warningEl = document.getElementById('aof-v3-warning');
    const summaryBox = document.getElementById('aof-v3-summary-box');

    // Đồng hồ realtime
    setInterval(() => {
        const cl = document.getElementById('aof-v3-clock');
        if (cl) cl.textContent = new Date().toLocaleTimeString('vi-VN');
    }, 250);

    // Thu gọn / Mở rộng
    document.getElementById('aof-v3-header').onclick = () => {
        const body = document.getElementById('aof-v3-body');
        const btn = document.getElementById('aof-v3-collapse-btn');
        if (body.style.display === 'none') {
            body.style.display = 'flex';
            btn.textContent = '▼';
        } else {
            body.style.display = 'none';
            btn.textContent = '▲';
        }
    };

    function showToast(msg, type = 'info') {
        const styles = {
            success: { bg: '#dafbe1', border: '#1a7f37', color: '#1a7f37', icon: '✅' },
            error: { bg: '#ffebe9', border: '#cf222e', color: '#cf222e', icon: '❌' },
            warn: { bg: '#fff8c5', border: '#9a6700', color: '#9a6700', icon: '⚠️' },
            info: { bg: '#ddf4ff', border: '#0969da', color: '#0969da', icon: 'ℹ️' }
        }[type] || { bg: '#ddf4ff', border: '#0969da', color: '#0969da', icon: 'ℹ️' };

        toastEl.style.display = 'flex';
        toastEl.style.background = styles.bg;
        toastEl.style.border = `1px solid ${styles.border}`;
        toastEl.style.color = styles.color;
        toastEl.innerHTML = `<span>${styles.icon} ${msg}</span><span style="cursor:pointer;font-weight:bold;" onclick="this.parentElement.style.display='none'">✕</span>`;
    }

    function log(msg, color = '#58a6ff') {
        const now = new Date();
        const ts = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
        const div = document.createElement('div');
        div.style.color = color;
        div.textContent = `[${ts}] ${msg}`;
        logEl.prepend(div);
    }

    function formatTkb(tkbs) {
        if (!Array.isArray(tkbs) || tkbs.length === 0) return 'Chưa có TKB';
        return tkbs.map(t => {
            const thu = t.thu === 8 ? 'CN' : `T${(t.thu ?? 0) + 2}`;
            const tietBD = (t.tiet ?? 0) + 1;
            const tietKT = (t.tiet ?? 0) + (t.so_tiet || 1);
            return `${thu}(${tietBD}-${tietKT})`;
        }).join(', ');
    }

    function saveUserConfig() {
        const cfg = {};
        subjectsState.forEach(s => {
            cfg[s.subjectKey] = {
                enabled: s.enabled,
                classOrder: s.classes.map(c => ({ classId: c.classId, enabled: c.enabled }))
            };
        });
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(cfg));
    }

    function buildSubjectsFromClasses(rawClasses) {
        let savedCfg = {};
        try {
            savedCfg = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIG) || '{}');
        } catch (e) {}

        const map = new Map();
        rawClasses.forEach(c => {
            const key = `${c.id_mon}|${c.so_tin_chi}`;
            if (!map.has(key)) {
                // Mặc định nếu là môn tự chọn CVA0243 thì để uncheck để nhường cho CAC0084 (tránh vượt 2 TC tự chọn)
                const defaultSubjEnabled = c.ky_hieu !== 'CVA0243';
                map.set(key, {
                    subjectKey: key,
                    id_mon: c.id_mon,
                    ky_hieu: c.ky_hieu,
                    ten_mon: c.ten_mon,
                    so_tin_chi: c.so_tin_chi,
                    nhom_tu_chon: c.nhom_tu_chon || 0,
                    so_tin_chi_tu_chon: c.so_tin_chi_tu_chon || 0,
                    enabled: defaultSubjEnabled,
                    expanded: false,
                    statusType: 'idle', // idle | pending | success | error
                    statusMessage: 'Chờ đăng ký',
                    classes: []
                });
            }
            map.get(key).classes.push({
                classId: c.classId,
                ten_lop_hp: c.ten_lop_hp,
                stu_nhomlop_ids: c.stu_nhomlop_ids,
                is_lock_nhom_lop: c.is_lock_nhom_lop,
                slotsLeft: c.slotsLeft ?? 0,
                tkbStr: formatTkb(c.thoiKhoaBieus),
                enabled: true,
                tryStatus: ''
            });
        });

        const result = Array.from(map.values());

        // Áp dụng lại cấu hình thứ tự ưu tiên đã lưu của người dùng
        result.forEach(subj => {
            const saved = savedCfg[subj.subjectKey];
            if (saved) {
                subj.enabled = saved.enabled;
                if (Array.isArray(saved.classOrder)) {
                    const orderMap = new Map(saved.classOrder.map((o, idx) => [o.classId, { idx, enabled: o.enabled }]));
                    subj.classes.sort((a, b) => {
                        const ia = orderMap.has(a.classId) ? orderMap.get(a.classId).idx : 999;
                        const ib = orderMap.has(b.classId) ? orderMap.get(b.classId).idx : 999;
                        return ia - ib;
                    });
                    subj.classes.forEach(c => {
                        if (orderMap.has(c.classId)) {
                            c.enabled = orderMap.get(c.classId).enabled;
                        }
                    });
                }
            }
        });

        subjectsState = result;
        validateRules();
        renderSubjects();
    }

    // Kiểm tra xung đột Nhóm lớp (8013 vs 8014) và Giới hạn 2 TC tự chọn
    function validateRules() {
        const warnings = [];
        const activeSubjs = subjectsState.filter(s => s.enabled);

        // 1. Kiểm tra Nhóm lớp của các Lớp Ưu tiên #1
        const groupsOfPrio1 = new Set();
        activeSubjs.forEach(s => {
            const firstEnabledCls = s.classes.find(c => c.enabled);
            if (firstEnabledCls && firstEnabledCls.stu_nhomlop_ids) {
                groupsOfPrio1.add(firstEnabledCls.stu_nhomlop_ids);
            }
        });
        if (groupsOfPrio1.size > 1) {
            warnings.push('⚠️ CẢNH BÁO: Các lớp Ưu tiên #1 đang bị trộn lẫn giữa Nhóm 1 (.02.1) và Nhóm 2 (.02.2)! Đợt này khoá cứng nhóm lớp, bạn hãy xếp cùng 1 nhóm lên Ưu tiên #1.');
        }

        // 2. Kiểm tra tín chỉ tự chọn
        let elecTc = 0;
        activeSubjs.forEach(s => {
            if (s.nhom_tu_chon > 0) elecTc += s.so_tin_chi;
        });
        if (elecTc > 2) {
            warnings.push(`⚠️ CẢNH BÁO: Bạn đang tick chọn ${elecTc} TC môn Tự chọn (Giới hạn tối đa là 2 TC — chỉ được chọn Kiểm tra sau thông quan HOẶC Trị giá hải quan)!`);
        }

        if (warnings.length > 0) {
            warningEl.style.display = 'block';
            warningEl.innerHTML = warnings.join('<br>');
        } else {
            warningEl.style.display = 'none';
        }
    }

    function renderSubjects() {
        subjectsContainer.innerHTML = '';

        subjectsState.forEach((subj, sIdx) => {
            const activeClasses = subj.classes.filter(c => c.enabled);
            const prio1 = activeClasses[0];
            const prio2 = activeClasses[1];

            let badgeBg = '#f6f8fa', badgeColor = '#57606a';
            if (subj.statusType === 'success') { badgeBg = '#dafbe1'; badgeColor = '#1a7f37'; }
            else if (subj.statusType === 'error') { badgeBg = '#ffebe9'; badgeColor = '#cf222e'; }
            else if (subj.statusType === 'pending') { badgeBg = '#ddf4ff'; badgeColor = '#0969da'; }

            const card = document.createElement('div');
            card.className = `aof-subj-card ${subj.enabled ? 'active-card' : ''}`;

            const prioSummary = prio1
                ? `ƯT#1: <b>${prio1.ten_lop_hp.replace(subj.ky_hieu, '')}</b> (${prio1.slotsLeft} chỗ)` +
                  (prio2 ? ` → ƯT#2: <b>${prio2.ten_lop_hp.replace(subj.ky_hieu, '')}</b>` : '')
                : `<span style="color:#cf222e;">Chưa chọn lớp nào!</span>`;

            card.innerHTML = `
                <div class="aof-subj-header">
                    <div style="display: flex; align-items: center; gap: 7px; flex: 1; overflow: hidden;">
                        <input type="checkbox" class="aof-subj-chk" ${subj.enabled ? 'checked' : ''} style="cursor: pointer; width: 14px; height: 14px;">
                        <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <div style="font-weight: 700; font-size: 12px; color: #1f2328;">
                                [${subj.ky_hieu}] ${subj.ten_mon}
                                <span style="font-weight: 500; color: #57606a; font-size: 11px;">(${subj.so_tin_chi} TC${subj.nhom_tu_chon ? ' - Tự chọn' : ''})</span>
                            </div>
                            <div style="font-size: 11px; color: #0969da; margin-top: 1px;">
                                ${prioSummary}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span class="aof-badge" style="background: ${badgeBg}; color: ${badgeColor};">
                            ${subj.statusMessage}
                        </span>
                        <span style="font-size: 11px; color: #57606a; font-weight: bold;">${subj.expanded ? '▲' : '▼'}</span>
                    </div>
                </div>
                <div class="aof-class-list ${subj.expanded ? 'open' : ''}">
                    <div style="font-size: 11px; color: #57606a; margin-bottom: 2px; display: flex; justify-content: space-between;">
                        <span>💡 <i>Kéo thả dòng hoặc nhập số (1, 2, 3...) để đổi thứ tự ưu tiên khi hết chỗ:</i></span>
                    </div>
                    <div class="aof-cls-items-wrap" style="display: flex; flex-direction: column; gap: 4px;"></div>
                </div>
            `;

            // Sự kiện tick bật/tắt môn
            const subjChk = card.querySelector('.aof-subj-chk');
            subjChk.onclick = (e) => e.stopPropagation();
            subjChk.onchange = (e) => {
                subj.enabled = e.target.checked;
                saveUserConfig();
                validateRules();
                renderSubjects();
            };

            // Sự kiện bấm vào tiêu đề môn để mở/đóng danh sách lớp
            card.querySelector('.aof-subj-header').onclick = () => {
                subj.expanded = !subj.expanded;
                renderSubjects();
            };

            // Render từng lớp bên trong môn
            const wrap = card.querySelector('.aof-cls-items-wrap');
            let dragSrcIdx = null;

            subj.classes.forEach((cls, cIdx) => {
                const nhomBadge = cls.stu_nhomlop_ids === 8013
                    ? `<span style="background:#ddf4ff;color:#0969da;padding:1px 5px;border-radius:4px;font-weight:700;font-size:10px;">Nhóm 1</span>`
                    : `<span style="background:#fff8c5;color:#9a6700;padding:1px 5px;border-radius:4px;font-weight:700;font-size:10px;">Nhóm 2</span>`;

                const slotColor = cls.slotsLeft > 10 ? '#1a7f37' : (cls.slotsLeft > 0 ? '#9a6700' : '#cf222e');

                const row = document.createElement('div');
                row.className = `aof-class-item ${cls.enabled ? '' : 'disabled-cls'}`;
                row.draggable = true;

                row.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 6px; flex: 1;">
                        <span style="cursor: grab; color: #8c959f; font-size: 13px;" title="Kéo thả để sắp xếp">☰</span>
                        <input type="checkbox" class="aof-cls-chk" ${cls.enabled ? 'checked' : ''} title="Bật/tắt sử dụng lớp này trong chuỗi dự phòng">
                        <input type="number" min="1" max="${subj.classes.length}" value="${cIdx + 1}" class="aof-prio-input" title="Nhập số thứ tự ưu tiên (1 = Cao nhất)">
                        <div>
                            <div style="font-weight: 700; font-size: 11.5px; color: #1f2328; display: flex; align-items: center; gap: 5px;">
                                <span>${cls.ten_lop_hp}</span>
                                <span style="font-family: monospace; color: #57606a; font-size: 10.5px;">(#${cls.classId})</span>
                                ${nhomBadge}
                            </div>
                            <div style="font-size: 10.5px; color: #57606a;">
                                🗓️ ${cls.tkbStr}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span style="font-size: 11px; font-weight: 700; color: ${slotColor};">
                            ${cls.tryStatus || `Còn ${cls.slotsLeft} chỗ`}
                        </span>
                        <div style="display: flex; flex-direction: column; gap: 1px;">
                            <button class="aof-up-btn" style="font-size: 9px; padding: 0 4px; cursor: pointer; border: 1px solid #ccc; background: #f6f8fa; border-radius: 2px;" ${cIdx === 0 ? 'disabled' : ''}>▲</button>
                            <button class="aof-dn-btn" style="font-size: 9px; padding: 0 4px; cursor: pointer; border: 1px solid #ccc; background: #f6f8fa; border-radius: 2px;" ${cIdx === subj.classes.length - 1 ? 'disabled' : ''}>▼</button>
                        </div>
                    </div>
                `;

                // Drag & Drop events
                row.addEventListener('dragstart', (e) => {
                    dragSrcIdx = cIdx;
                    row.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                row.addEventListener('dragend', () => {
                    row.classList.remove('dragging');
                });
                row.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                });
                row.addEventListener('drop', (e) => {
                    e.preventDefault();
                    if (dragSrcIdx === null || dragSrcIdx === cIdx) return;
                    const moved = subj.classes.splice(dragSrcIdx, 1)[0];
                    subj.classes.splice(cIdx, 0, moved);
                    saveUserConfig();
                    validateRules();
                    renderSubjects();
                });

                // Checkbox bật/tắt lớp
                row.querySelector('.aof-cls-chk').onchange = (e) => {
                    cls.enabled = e.target.checked;
                    saveUserConfig();
                    validateRules();
                    renderSubjects();
                };

                // Nhập số thứ tự ưu tiên trực tiếp (1, 2, 3...)
                row.querySelector('.aof-prio-input').onchange = (e) => {
                    let newPos = parseInt(e.target.value, 10) - 1;
                    if (isNaN(newPos)) return;
                    newPos = Math.max(0, Math.min(subj.classes.length - 1, newPos));
                    if (newPos === cIdx) return;
                    const moved = subj.classes.splice(cIdx, 1)[0];
                    subj.classes.splice(newPos, 0, moved);
                    saveUserConfig();
                    validateRules();
                    renderSubjects();
                };

                // Nút Lên / Xuống
                row.querySelector('.aof-up-btn').onclick = () => {
                    if (cIdx <= 0) return;
                    const tmp = subj.classes[cIdx - 1];
                    subj.classes[cIdx - 1] = subj.classes[cIdx];
                    subj.classes[cIdx] = tmp;
                    saveUserConfig();
                    validateRules();
                    renderSubjects();
                };
                row.querySelector('.aof-dn-btn').onclick = () => {
                    if (cIdx >= subj.classes.length - 1) return;
                    const tmp = subj.classes[cIdx + 1];
                    subj.classes[cIdx + 1] = subj.classes[cIdx];
                    subj.classes[cIdx] = tmp;
                    saveUserConfig();
                    validateRules();
                    renderSubjects();
                };

                wrap.appendChild(row);
            });

            subjectsContainer.appendChild(card);
        });
    }

    // Nút xếp nhanh Nhóm 1 lên Ưu tiên #1 cho tất cả các môn
    document.getElementById('aof-v3-preset-g1').onclick = () => {
        subjectsState.forEach(s => {
            s.classes.sort((a, b) => (a.stu_nhomlop_ids === 8013 ? -1 : 1) - (b.stu_nhomlop_ids === 8013 ? -1 : 1));
        });
        saveUserConfig();
        validateRules();
        renderSubjects();
        showToast('Đã xếp toàn bộ lớp Nhóm 1 (CQ62.02.1) lên Ưu tiên #1 và Nhóm 2 làm dự phòng!', 'success');
        log('✅ Đã xếp Nhóm 1 (.02.1) lên Ưu tiên #1 cho tất cả các môn.', '#3fb950');
    };

    // Nút xếp nhanh Nhóm 2 lên Ưu tiên #1 cho tất cả các môn
    document.getElementById('aof-v3-preset-g2').onclick = () => {
        subjectsState.forEach(s => {
            s.classes.sort((a, b) => (a.stu_nhomlop_ids === 8014 ? -1 : 1) - (b.stu_nhomlop_ids === 8014 ? -1 : 1));
        });
        saveUserConfig();
        validateRules();
        renderSubjects();
        showToast('Đã xếp toàn bộ lớp Nhóm 2 (CQ62.02.2) lên Ưu tiên #1 và Nhóm 1 làm dự phòng!', 'success');
        log('✅ Đã xếp Nhóm 2 (.02.2) lên Ưu tiên #1 cho tất cả các môn.', '#3fb950');
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

    async function syncAndTestConnection(showBanner = true) {
        const { headers, accessToken, periodId } = getAuthHeaders(false);
        let userInfo = null;
        try {
            userInfo = JSON.parse(localStorage.getItem('user_info') || 'null');
        } catch (e) {}

        if (!accessToken) {
            connTextEl.innerHTML = `<span style="color:#cf222e;">🔴 Chưa đăng nhập (Hãy đăng nhập vào cổng trước)</span>`;
            if (showBanner) showToast('Bạn chưa đăng nhập! Vui lòng đăng nhập vào trang web trước.', 'error');
            return;
        }

        connTextEl.innerHTML = `<span style="color:#9a6700;">⏳ Đang kiểm tra kết nối máy chủ...</span>`;
        try {
            const [qResp, cResp] = await Promise.all([
                fetch('/api/queue/status', { method: 'GET', headers }).then(r => r.json()).catch(() => null),
                fetch('/api/registration/classes', { method: 'GET', headers }).then(r => r.json()).catch(() => null)
            ]);

            if (qResp && qResp.is_success && qResp.data) {
                const q = qResp.data;
                if (q.token) {
                    const qMap = JSON.parse(sessionStorage.getItem('queue_token_map') || '{}');
                    qMap[String(periodId)] = q.token;
                    sessionStorage.setItem('queue_token_map', JSON.stringify(qMap));
                }
                const studentName = userInfo?.ho_ten || 'Sinh viên';
                connTextEl.innerHTML = `<span style="color:#1a7f37;">🟢 Đã kết nối: <b>${studentName}</b> (Đợt ${periodId} - Mở: ${q.openAt ? q.openAt.replace('T', ' ') : '8h00'})</span>`;
                if (showBanner) {
                    showToast(`Kết nối máy chủ HVTC thành công! Cổng mở lúc ${q.openAt ? q.openAt.replace('T', ' ') : '08:00:00'}.`, 'success');
                }
                log(`🟢 Kết nối thành công! Sinh viên: ${studentName} | inQueue=${q.inQueue} | hasAccess=${q.hasAccess}`, '#3fb950');
            } else {
                connTextEl.innerHTML = `<span style="color:#cf222e;">🔴 Lỗi kết nối (${qResp?.message || 'Phiên hết hạn'})</span>`;
                if (showBanner) showToast(`Lỗi kết nối: ${qResp?.message || 'Vui lòng đăng nhập lại'}`, 'error');
            }

            if (cResp && cResp.is_success && Array.isArray(cResp.data) && cResp.data.length > 0) {
                buildSubjectsFromClasses(cResp.data);
                log(`📦 Đã đồng bộ trực tiếp ${cResp.data.length} lớp học phần từ máy chủ HVTC!`, '#58a6ff');
            }
        } catch (err) {
            connTextEl.innerHTML = `<span style="color:#cf222e;">🔴 Lỗi mạng: ${err.message}</span>`;
        }
    }

    document.getElementById('aof-v3-sync-btn').onclick = () => syncAndTestConnection(true);

    // Khởi tạo danh sách từ Fallback trước, sau đó tự động đồng bộ từ API thật
    buildSubjectsFromClasses(FALLBACK_CLASSES);
    setTimeout(() => syncAndTestConnection(false), 600);

    // HÀM XỬ LÝ ĐĂNG KÝ CHO 1 MÔN HỌC THEO CHUỖI ƯU TIÊN (PRIORITY FALLBACK CHAIN)
    async function processSubjectChain(subj) {
        const enabledClasses = subj.classes.filter(c => c.enabled);
        if (enabledClasses.length === 0) {
            subj.statusType = 'error';
            subj.statusMessage = '❌ Không có lớp được bật';
            renderSubjects();
            return { done: true, success: false, reason: 'Không có lớp nào được chọn' };
        }

        // Duyệt lần lượt từ Ưu tiên #1 -> #2 -> #3...
        for (let i = 0; i < enabledClasses.length; i++) {
            if (!isRunning) return { done: false };
            const candidate = enabledClasses[i];
            const prioLabel = `ƯT#${i + 1}`;

            subj.statusType = 'pending';
            subj.statusMessage = `⏳ Đang gửi ${prioLabel} (#${candidate.classId})...`;
            candidate.tryStatus = `🚀 Đang bắn...`;
            renderSubjects();

            const { headers } = getAuthHeaders(true);
            let httpStatus = 0;
            let body = {};
            try {
                const resp = await fetch('/api/registration', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ classId: Number(candidate.classId) })
                });
                httpStatus = resp.status;
                body = await resp.json().catch(() => ({}));
            } catch (err) {
                body = { is_success: false, message: err.message };
            }

            const reasonCode = body?.data?.reasonCode || '';
            const serverMsg = body?.message || reasonCode || `HTTP ${httpStatus}`;

            // TRƯỜNG HỢP 1: ĐĂNG KÝ THÀNH CÔNG!
            if (body && body.is_success) {
                subj.statusType = 'success';
                subj.statusMessage = `✅ Đỗ ${prioLabel}: ${candidate.ten_lop_hp}`;
                candidate.tryStatus = `✅ Đã giữ chỗ!`;
                renderSubjects();
                log(`🎉 [${subj.ten_mon}] ĐĂNG KÝ THÀNH CÔNG vào lớp ${candidate.ten_lop_hp} (#${candidate.classId} - ${prioLabel})!`, '#3fb950');
                return { done: true, success: true, chosenClass: candidate, prioIndex: i + 1 };
            }

            // TRƯỜNG HỢP 2: ĐÃ ĐĂNG KÝ RỒI
            if (reasonCode === 'ALREADY_REGISTERED' || reasonCode === 'ALREADY_REGISTERED_SAME_MON') {
                subj.statusType = 'success';
                subj.statusMessage = `✅ Đã ĐK: ${candidate.ten_lop_hp}`;
                candidate.tryStatus = `✅ Đã ĐK`;
                renderSubjects();
                log(`✅ [${subj.ten_mon}] Đã được đăng ký từ trước (#${candidate.classId}).`, '#3fb950');
                return { done: true, success: true, chosenClass: candidate, prioIndex: i + 1 };
            }

            // TRƯỜNG HỢP 3: HẾT SLOT (CLASS_FULL) HOẶC XUNG ĐỘT LỚP NÀY -> LẬP TỨC CHUYỂN SANG LỚP ƯU TIÊN TIẾP THEO!
            if (reasonCode === 'CLASS_FULL' || reasonCode === 'SCHEDULE_CONFLICT' || reasonCode === 'LOCKED_TO_OTHER_NHOM_LOP' || reasonCode === 'OUT_OF_PHAM_VI') {
                candidate.tryStatus = `❌ ${reasonCode === 'CLASS_FULL' ? 'Hết chỗ' : reasonCode}`;
                const nextCandidate = enabledClasses[i + 1];
                if (nextCandidate) {
                    log(`⚠️ [${subj.ten_mon}] Lớp ${prioLabel} (#${candidate.classId}) thất bại (${serverMsg}) -> Tự động nhảy sang ƯT#${i + 2}: ${nextCandidate.ten_lop_hp} (#${nextCandidate.classId})!`, '#d29922');
                    continue; // Chuyển ngay sang lớp ưu tiên tiếp theo trong vòng lặp for!
                } else {
                    subj.statusType = 'error';
                    subj.statusMessage = `❌ Thất bại (${reasonCode})`;
                    renderSubjects();
                    log(`❌ [${subj.ten_mon}] Cả ${enabledClasses.length} lớp ưu tiên đều không đăng ký được (${serverMsg}).`, '#f85149');
                    return { done: true, success: false, reason: `${serverMsg} (Đã thử hết ${enabledClasses.length} lớp)` };
                }
            }

            // TRƯỜNG HỢP 4: ĐỦ NHÓM TỰ CHỌN
            if (reasonCode === 'NHOM_TU_CHON_FULL') {
                subj.statusType = 'error';
                subj.statusMessage = `⛔ Đã đủ TC tự chọn`;
                candidate.tryStatus = `⛔ Đủ TC tự chọn`;
                renderSubjects();
                return { done: true, success: false, reason: 'Đã đủ số tín chỉ nhóm tự chọn' };
            }

            // TRƯỜNG HỢP 5: LỖI TẠM THỜI (CHƯA MỞ CỔNG / CHƯA TỚI LƯỢT / 429 / NGHẼN MẠNG)
            // -> KHÔNG nhảy sang lớp ưu tiên 2 (vì lớp ưu tiên 1 vẫn còn chỗ!), trả về done=false để đợt retry sau bắn lại đúng lớp Ưu tiên #1!
            subj.statusType = 'pending';
            subj.statusMessage = `⏳ Chờ thử lại ${prioLabel} (${reasonCode || httpStatus})`;
            candidate.tryStatus = `⏳ ${reasonCode || httpStatus}`;
            renderSubjects();
            log(`⏳ [${subj.ten_mon}] Lớp ${prioLabel} (#${candidate.classId}) tạm chờ: ${serverMsg}`, '#d29922');
            return {
                done: false,
                hitRateLimit: httpStatus === 429,
                needQueueToken: reasonCode === 'NOT_YOUR_TURN' || httpStatus === 403,
                lastReason: serverMsg
            };
        }

        return { done: true, success: false, reason: 'Không còn lớp khả dụng' };
    }

    // CHIẾN DỊCH ĐĂNG KÝ TOÀN BỘ CÁC MÔN ĐÃ CHỌN
    async function startRegistrationCampaign() {
        if (isRunning) return;
        isRunning = true;
        summaryBox.style.display = 'none';

        const activeSubjs = subjectsState.filter(s => s.enabled);
        if (activeSubjs.length === 0) {
            showToast('Bạn chưa tick chọn môn học nào!', 'error');
            isRunning = false;
            return;
        }

        showToast(`Đang thực thi đăng ký tự động cho ${activeSubjs.length} môn học...`, 'info');
        log(`🚀 BẮT ĐẦU CHIẾN DỊCH ĐĂNG KÝ ${activeSubjs.length} MÔN HỌC!`, '#3fb950');

        // Bước 1: Kiểm tra nhanh Queue Token
        const { qToken } = getAuthHeaders(true);
        if (!qToken) {
            await syncAndTestConnection(false);
        }

        const resultsMap = new Map(); // subjectKey -> { success, chosenClass, prioIndex, reason }

        // Bước 2: Vòng lặp Smart Retry (Tối đa 12 đợt, cách nhau 1.5s an toàn tuyệt đối)
        for (let round = 1; round <= 12; round++) {
            if (!isRunning) break;
            const pendingSubjs = activeSubjs.filter(s => !resultsMap.has(s.subjectKey));
            if (pendingSubjs.length === 0) break;

            log(`⚡ Đợt bắn #${round}: Đang xử lý ${pendingSubjs.length} môn...`, '#58a6ff');

            let anyRateLimit = false;
            let anyNeedQueue = false;

            await Promise.all(pendingSubjs.map(async (subj) => {
                const outcome = await processSubjectChain(subj);
                if (outcome.done) {
                    resultsMap.set(subj.subjectKey, outcome);
                } else {
                    if (outcome.hitRateLimit) anyRateLimit = true;
                    if (outcome.needQueueToken) anyNeedQueue = true;
                    // Nếu hết sạch 12 vòng mà vẫn chưa xong thì lưu lý do cuối
                    if (round === 12) {
                        subj.statusType = 'error';
                        subj.statusMessage = `❌ Tạm dừng (${outcome.lastReason || 'Chưa mở'})`;
                        renderSubjects();
                        resultsMap.set(subj.subjectKey, {
                            done: true,
                            success: false,
                            reason: outcome.lastReason || 'Hết số lần thử lại'
                        });
                    }
                }
            }));

            if (resultsMap.size >= activeSubjs.length || !isRunning) break;

            if (anyNeedQueue) {
                await syncAndTestConnection(false);
            }

            const delayMs = anyRateLimit ? 3500 : 1500;
            if (anyRateLimit) log(`🛡️ Tạm nghỉ 3.5s để tránh Rate Limit 429...`, '#d29922');
            await new Promise(r => setTimeout(r, delayMs));
        }

        // Bước 3: Tổng hợp kết quả & Tự động Chốt dữ liệu (Lưu DB)
        const successList = [];
        const failList = [];
        activeSubjs.forEach(s => {
            const res = resultsMap.get(s.subjectKey);
            if (res && res.success) {
                successList.push(`<li>✅ <b>${s.ten_mon}</b>: Đỗ lớp <b>${res.chosenClass.ten_lop_hp}</b> (#${res.chosenClass.classId} - Ưu tiên #${res.prioIndex})</li>`);
            } else {
                failList.push(`<li>❌ <b>${s.ten_mon}</b>: Thất bại — <i>${res?.reason || 'Đã dừng'}</i></li>`);
            }
        });

        let chotStatusHtml = '';
        if (document.getElementById('aof-v3-auto-save').checked && successList.length > 0 && isRunning) {
            log(`⏳ Đang đợi Background Worker ghi vào SQL Database trước khi Lưu dữ liệu...`, '#d29922');
            const { headers } = getAuthHeaders(true);
            for (let w = 0; w < 12; w++) {
                await new Promise(r => setTimeout(r, 1200));
                const myRes = await fetch('/api/registration/my', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
                if (myRes && myRes.is_success && Array.isArray(myRes.data)) {
                    const dbCount = myRes.data.filter(x => x.trang_thai === 1).length;
                    log(`📊 Database đã ghi nhận: ${dbCount} môn.`);
                    if (dbCount >= successList.length) break;
                }
            }

            const chotRes = await fetch('/api/registration/chot-du-lieu', {
                method: 'POST',
                headers,
                body: JSON.stringify({})
            }).then(r => r.json()).catch(() => null);

            if (chotRes && chotRes.is_success) {
                chotStatusHtml = `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #1a7f37;font-weight:700;color:#1a7f37;">🔒 ĐÃ LƯU DỮ LIỆU ĐĂNG KÝ (CHỐT DB) THÀNH CÔNG!</div>`;
                log(`🎉 ĐÃ CHỐT DỮ LIỆU ĐĂNG KÝ THÀNH CÔNG!`, '#3fb950');
            } else {
                chotStatusHtml = `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #9a6700;font-weight:700;color:#9a6700;">⚠️ Chưa tự chốt được (${chotRes?.message || 'Lỗi'}). Hãy bấm nút "Lưu dữ liệu đăng ký" trên web!</div>`;
            }
        }

        // Hiển thị Bảng Báo Cáo Kết Quả Rõ Ràng
        summaryBox.style.display = 'block';
        summaryBox.style.borderColor = successList.length > 0 ? '#1a7f37' : '#cf222e';
        summaryBox.style.background = successList.length > 0 ? '#dafbe1' : '#ffebe9';
        summaryBox.innerHTML = `
            <div style="font-weight: 700; font-size: 12.5px; margin-bottom: 4px; color: #1f2328;">
                📋 BÁO CÁO KẾT QUẢ ĐĂNG KÝ (${successList.length}/${activeSubjs.length} môn thành công):
            </div>
            <ul style="margin: 0; padding-left: 18px; line-height: 1.5;">
                ${successList.join('')}
                ${failList.join('')}
            </ul>
            ${chotStatusHtml}
        `;

        if (successList.length === activeSubjs.length) {
            showToast(`Hoàn tất xuất sắc! Cả ${successList.length}/${activeSubjs.length} môn đã đăng ký thành công!`, 'success');
        } else if (successList.length > 0) {
            showToast(`Đã đăng ký thành công ${successList.length}/${activeSubjs.length} môn! Xem chi tiết bên dưới.`, 'warn');
        } else {
            showToast(`Chưa đăng ký được môn nào (Kiểm tra lý do ở bảng báo cáo bên dưới).`, 'error');
        }

        isRunning = false;
    }

    // Nút Bật Canh Giờ (08:00:00)
    document.getElementById('aof-v3-btn-arm').onclick = () => {
        const targetTime = document.getElementById('aof-v3-time-input').value.trim();
        isArmed = true;
        if (armInterval) clearInterval(armInterval);

        const btn = document.getElementById('aof-v3-btn-arm');
        btn.textContent = `⏳ Đang canh ${targetTime}...`;
        btn.style.background = '#9a6700';

        showToast(`Đã bật chế độ canh giờ tự động lúc ${targetTime}. Giữ tab trình duyệt này mở nhé!`, 'info');
        log(`⏰ Đã bật hẹn giờ tự động bắn lúc ${targetTime}.`, '#3fb950');

        armInterval = setInterval(() => {
            if (!isArmed) return;
            const nowStr = new Date().toTimeString().split(' ')[0];
            if (nowStr >= targetTime) {
                clearInterval(armInterval);
                isArmed = false;
                btn.textContent = `🚀 Bật Canh Giờ (${targetTime})`;
                btn.style.background = '#1a7f37';
                setTimeout(() => startRegistrationCampaign(), 100);
            }
        }, 100);
    };

    // Nút Đăng Ký Ngay
    document.getElementById('aof-v3-btn-fire').onclick = () => {
        isArmed = false;
        if (armInterval) clearInterval(armInterval);
        startRegistrationCampaign();
    };

    // Nút Dừng
    document.getElementById('aof-v3-btn-stop').onclick = () => {
        isArmed = false;
        isRunning = false;
        if (armInterval) clearInterval(armInterval);
        const btn = document.getElementById('aof-v3-btn-arm');
        btn.textContent = `🚀 Bật Canh Giờ (08:00:00)`;
        btn.style.background = '#1a7f37';
        showToast('Đã dừng mọi tác vụ đăng ký tự động.', 'warn');
        log('🛑 Người dùng đã bấm dừng.', '#f85149');
    };
})();
