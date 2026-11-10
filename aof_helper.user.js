// ==UserScript==
// @name         AOF Smart Register Assistant v4.1 (HVTC)
// @namespace    http://tampermonkey.net/
// @version      4.1.0
// @description  Bảng điều khiển đăng ký tín chỉ HVTC v4.1: Giao diện Emerald OKLCH gọn không tràn màn hình, bắn liên tục đến khi đỗ, tự động khóa sổ & đồng bộ Redux không F5.
// @author       Antigravity
// @match        https://congdangky.hvtc.edu.vn/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // Xóa các bản cũ nếu có
    ['aof-v4-root', 'aof-v3-root', 'aof-smart-assistant-root', 'aof-toast-container', 'aof-v4-styles'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });

    const DEFAULT_PERIOD_ID = 55;
    const STORAGE_KEY_CONFIG = 'aof_v40_config';
    const SESSION_KEY_STATUS = 'aof_v40_session_status';

    // Nhúng Google Font Outfit cho đúng chuẩn --font-sans: Outfit, sans-serif
    if (!document.getElementById('aof-outfit-font')) {
        const fontLink = document.createElement('link');
        fontLink.id = 'aof-outfit-font';
        fontLink.rel = 'stylesheet';
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap';
        document.head.appendChild(fontLink);
    }

    // Dữ liệu chuẩn 18 lớp học phần từ API trường
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

    // CSS theo đúng bộ biến Light Mode (:root) Outfit + OKLCH Emerald
    // Đảm bảo max-height: calc(100vh - 20px) để KHÔNG BAO GIỜ tràn khỏi màn hình!
    const styleEl = document.createElement('style');
    styleEl.id = 'aof-v4-styles';
    styleEl.textContent = `
        #aof-v4-root, #aof-toast-container {
            --background: oklch(0.9911 0 0);
            --foreground: oklch(0.2046 0 0);
            --card: oklch(0.9911 0 0);
            --card-foreground: oklch(0.2046 0 0);
            --popover: oklch(0.9911 0 0);
            --popover-foreground: oklch(0.4386 0 0);
            --primary: oklch(0.8348 0.1302 160.9080);
            --primary-foreground: oklch(0.2626 0.0147 166.4589);
            --secondary: oklch(0.9940 0 0);
            --secondary-foreground: oklch(0.2046 0 0);
            --muted: oklch(0.9461 0 0);
            --muted-foreground: oklch(0.2435 0 0);
            --accent: oklch(0.9461 0 0);
            --accent-foreground: oklch(0.2435 0 0);
            --destructive: oklch(0.5523 0.1927 32.7272);
            --destructive-foreground: oklch(0.9934 0.0032 17.2118);
            --border: oklch(0.9037 0 0);
            --input: oklch(0.9731 0 0);
            --ring: oklch(0.8348 0.1302 160.9080);
            --chart-1: oklch(0.8348 0.1302 160.9080);
            --chart-2: oklch(0.6231 0.1880 259.8145);
            --chart-3: oklch(0.6056 0.2189 292.7172);
            --chart-4: oklch(0.7686 0.1647 70.0804);
            --chart-5: oklch(0.6959 0.1491 162.4796);
            --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            --radius: 0.5rem;
            --radius-sm: calc(var(--radius) - 4px);
            --radius-md: calc(var(--radius) - 2px);
            --radius-lg: var(--radius);
            --radius-xl: calc(var(--radius) + 4px);
            --shadow-2xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
            --shadow-xs: 0px 1px 3px 0px hsl(0 0% 0% / 0.09);
            --shadow-sm: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
            --shadow: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 1px 2px -1px hsl(0 0% 0% / 0.17);
            --shadow-md: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 2px 4px -1px hsl(0 0% 0% / 0.17);
            --shadow-lg: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 4px 6px -1px hsl(0 0% 0% / 0.17);
            --shadow-xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.17), 0px 8px 10px -1px hsl(0 0% 0% / 0.17);
            --shadow-2xl: 0px 1px 3px 0px hsl(0 0% 0% / 0.43);
            --tracking-normal: 0.025em;
            font-family: var(--font-sans);
            letter-spacing: var(--tracking-normal);
            color: var(--foreground);
            box-sizing: border-box;
        }

        #aof-v4-root *, #aof-toast-container * {
            box-sizing: border-box;
            font-family: inherit;
        }

        #aof-v4-root {
            position: fixed;
            bottom: 10px;
            right: 12px;
            z-index: 999998;
            width: 480px;
            max-height: calc(100vh - 20px);
            display: flex;
            flex-direction: column;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-2xl);
            font-size: 12px;
            overflow: hidden;
        }

        #aof-v4-header {
            flex-shrink: 0;
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
            border-bottom: 1px solid var(--border);
        }

        #aof-v4-conn {
            flex-shrink: 0;
            padding: 6px 12px;
            background: var(--muted);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 11.5px;
        }

        #aof-v4-body {
            padding: 9px 12px;
            display: flex;
            flex-direction: column;
            gap: 7px;
            background: var(--background);
            overflow-y: auto;
        }

        /* Bảng tổng kết gọn gàng ngay trên đầu */
        #aof-v4-summary {
            border-radius: var(--radius-lg);
            border: 1.5px solid var(--chart-5);
            background: oklch(0.975 0.03 160.9);
            padding: 7px 10px;
            box-shadow: var(--shadow-2xs);
            display: none;
            flex-direction: column;
            gap: 4px;
            flex-shrink: 0;
        }
        #aof-v4-summary.show {
            display: flex;
        }
        #aof-v4-summary.state-pending {
            border-color: var(--chart-4);
            background: oklch(0.98 0.035 80);
        }
        #aof-v4-summary.state-error {
            border-color: var(--destructive);
            background: oklch(0.975 0.025 32);
        }

        .aof-progress-track {
            width: 100%;
            height: 5px;
            background: var(--muted);
            border-radius: 999px;
            overflow: hidden;
        }
        .aof-progress-bar {
            height: 100%;
            background: var(--chart-5);
            border-radius: 999px;
            transition: width 0.25s ease;
        }

        .aof-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
        }
        .aof-chip-ok {
            display: inline-flex;
            align-items: center;
            gap: 3px;
            padding: 1px 6px;
            border-radius: var(--radius-sm);
            background: var(--primary);
            color: var(--primary-foreground);
            font-size: 10.5px;
            font-weight: 700;
            border: 1px solid var(--chart-5);
        }

        /* Tabs Chọn Nhóm Lớp */
        .aof-group-tabs {
            display: flex;
            gap: 5px;
            background: var(--muted);
            padding: 3px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }
        .aof-group-tab {
            flex: 1;
            padding: 5px 8px;
            border-radius: var(--radius-md);
            border: none;
            font-weight: 700;
            font-size: 11.5px;
            cursor: pointer;
            background: transparent;
            color: var(--popover-foreground);
            transition: all 0.15s ease;
        }
        .aof-group-tab.active {
            background: var(--primary);
            color: var(--primary-foreground);
            box-shadow: var(--shadow-sm);
        }

        /* Khung Dropdown chọn ưu tiên */
        .aof-select-grid {
            display: grid;
            grid-template-columns: 130px 1fr;
            gap: 5px 8px;
            align-items: center;
            background: var(--muted);
            padding: 6px 9px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }
        .aof-select-box {
            width: 100%;
            padding: 4px 7px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
            background: var(--card);
            font-size: 11px;
            font-weight: 600;
            color: var(--foreground);
            cursor: pointer;
            box-shadow: var(--shadow-2xs);
            outline: none;
        }
        .aof-select-box:focus {
            border-color: var(--chart-5);
            box-shadow: 0 0 0 2px oklch(0.8348 0.1302 160.9080 / 0.35);
        }

        /* Danh sách 7 môn học - Cố định 2 dòng gọn gàng để không bao giờ bị giãn chiều cao */
        .aof-table-wrap {
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            overflow: hidden;
            background: var(--card);
            box-shadow: var(--shadow-2xs);
        }
        .aof-subj-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5.5px 9px;
            border-bottom: 1px solid var(--border);
            border-left: 4px solid transparent;
            gap: 6px;
            transition: background 0.15s ease, border-color 0.15s ease;
        }
        .aof-subj-row:last-child {
            border-bottom: none;
        }

        /* Đổi màu toàn bộ dòng theo trạng thái */
        .aof-subj-row.row-idle {
            background: var(--card);
            border-left-color: transparent;
        }
        .aof-subj-row.row-pending {
            background: oklch(0.972 0.045 82);
            border-left-color: var(--chart-4);
        }
        .aof-subj-row.row-success {
            background: oklch(0.948 0.06 160.9);
            border-left-color: var(--chart-5);
        }
        .aof-subj-row.row-error {
            background: oklch(0.962 0.035 32);
            border-left-color: var(--destructive);
        }

        .aof-status-badge {
            padding: 3px 7px;
            border-radius: var(--radius-md);
            font-size: 10.5px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: var(--shadow-2xs);
        }
        .badge-idle {
            background: var(--muted);
            color: var(--popover-foreground);
            border: 1px solid var(--border);
        }
        .badge-pending {
            background: oklch(0.91 0.10 80);
            color: oklch(0.30 0.08 60);
            border: 1px solid var(--chart-4);
        }
        .badge-success {
            background: var(--primary);
            color: var(--primary-foreground);
            border: 1px solid var(--chart-5);
        }
        .badge-error {
            background: var(--destructive);
            color: var(--destructive-foreground);
            border: 1px solid var(--destructive);
        }

        /* Nút bấm chính */
        .aof-btn-main {
            padding: 7px 10px;
            border-radius: var(--radius-md);
            border: 1px solid transparent;
            font-weight: 700;
            font-size: 12px;
            cursor: pointer;
            box-shadow: var(--shadow-sm);
            transition: transform 0.1s ease, filter 0.15s ease;
        }
        .aof-btn-main:hover {
            filter: brightness(0.97);
        }
        .aof-btn-main:active {
            transform: translateY(1px);
        }
        .aof-btn-primary {
            background: var(--primary);
            color: var(--primary-foreground);
            border-color: var(--chart-5);
        }
        .aof-btn-fire {
            background: var(--foreground);
            color: var(--background);
        }
        .aof-btn-stop {
            background: var(--destructive);
            color: var(--destructive-foreground);
        }
        .aof-btn-sm {
            padding: 3px 8px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border);
            background: var(--card);
            color: var(--foreground);
            font-weight: 600;
            font-size: 11px;
            cursor: pointer;
            box-shadow: var(--shadow-2xs);
        }
        .aof-btn-sm:hover {
            background: var(--accent);
        }

        /* Toast góc trên bên phải màn hình */
        #aof-toast-container {
            position: fixed;
            top: 14px;
            right: 14px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 370px;
            pointer-events: none;
        }
        .aof-toast {
            pointer-events: auto;
            background: var(--card);
            color: var(--foreground);
            border: 1px solid var(--border);
            border-left: 5px solid var(--chart-5);
            border-radius: var(--radius-lg);
            padding: 9px 12px;
            box-shadow: var(--shadow-xl);
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            animation: aofSlideIn 0.2s ease-out;
        }
        .aof-toast.toast-warn {
            border-left-color: var(--chart-4);
            background: oklch(0.985 0.025 82);
        }
        .aof-toast.toast-error {
            border-left-color: var(--destructive);
            background: oklch(0.985 0.02 32);
        }
        .aof-toast.toast-success {
            border-left-color: var(--chart-5);
            background: oklch(0.975 0.035 160.9);
        }
        @keyframes aofSlideIn {
            from { opacity: 0; transform: translateX(24px); }
            to { opacity: 1; transform: translateX(0); }
        }
    `;
    document.head.appendChild(styleEl);

    // Khung chứa Toast thông báo nổi góc màn hình
    const toastContainer = document.createElement('div');
    toastContainer.id = 'aof-toast-container';
    document.body.appendChild(toastContainer);

    // Khung chính của Extension
    const root = document.createElement('div');
    root.id = 'aof-v4-root';
    root.innerHTML = `
        <div id="aof-v4-header">
            <div style="font-weight: 800; font-size: 13px; display: flex; align-items: center; gap: 6px;">
                <span>⚡ AOF Auto Register v4.1</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="aof-v4-clock" style="font-family: var(--font-mono); font-size: 12px; font-weight: 700; background: oklch(0.2626 0.0147 166.4589 / 0.12); color: var(--primary-foreground); padding: 2px 7px; border-radius: var(--radius-sm);">--:--:--</span>
                <span id="aof-v4-toggle" style="font-size: 12px; font-weight: bold;">▼</span>
            </div>
        </div>

        <div id="aof-v4-conn">
            <span id="aof-v4-conn-msg" style="font-weight: 600; color: var(--muted-foreground);">🔌 Đang kiểm tra kết nối...</span>
            <div style="display: flex; gap: 4px;">
                <button id="aof-v4-btn-refresh-web" class="aof-btn-sm" title="Cập nhật bảng Lớp đã đăng ký của web (Không F5)">🔄 Làm mới bảng web</button>
                <button id="aof-v4-btn-reset" class="aof-btn-sm" title="Đặt lại trạng thái các môn về mặc định">↺ Đặt lại</button>
            </div>
        </div>

        <div id="aof-v4-body">
            <!-- BẢNG TỔNG KẾT NỔI BẬT GỌN GÀNG TRÊN ĐẦU -->
            <div id="aof-v4-summary">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                    <span id="aof-sum-title" style="font-weight: 800; font-size: 11.5px; color: var(--foreground);">🎯 KẾT QUẢ ĐĂNG KÝ</span>
                    <span id="aof-sum-counter" style="font-weight: 800; font-size: 11px; padding: 1.5px 7px; border-radius: var(--radius-sm); background: var(--primary); color: var(--primary-foreground);">Đã đỗ: 0/7 môn (0/18 TC)</span>
                </div>
                <div class="aof-progress-track">
                    <div id="aof-sum-bar" class="aof-progress-bar" style="width: 0%;"></div>
                </div>
                <div id="aof-sum-detail" style="font-size: 11px; color: var(--muted-foreground); line-height: 1.35;"></div>
                <div id="aof-sum-chips" class="aof-chip-list"></div>
            </div>

            <!-- 1. Chọn Nhóm Lớp -->
            <div>
                <div style="font-weight: 700; font-size: 11.5px; margin-bottom: 4px; display: flex; justify-content: space-between; align-items: center;">
                    <span>1. Chọn Nhóm Lớp Đồng Bộ:</span>
                    <span id="aof-v4-tc-count" style="background: var(--primary); color: var(--primary-foreground); padding: 1px 7px; border-radius: var(--radius-sm); font-weight: 700; font-size: 11px;">7 môn (18 TC)</span>
                </div>
                <div class="aof-group-tabs">
                    <button id="aof-tab-g1" class="aof-group-tab active">Nhóm 1 (CQ62.02.1_LT)</button>
                    <button id="aof-tab-g2" class="aof-group-tab">Nhóm 2 (CQ62.02.2_LT)</button>
                </div>
            </div>

            <!-- 2. Chọn lớp ưu tiên bằng Dropdown (Tiếng Anh & Tự chọn) -->
            <div class="aof-select-grid">
                <label style="font-weight: 600; font-size: 11px; color: var(--foreground);">2. Ưu tiên Tiếng Anh:</label>
                <select id="aof-sel-eng" class="aof-select-box"></select>

                <label style="font-weight: 600; font-size: 11px; color: var(--foreground);">3. Ưu tiên Tự chọn:</label>
                <select id="aof-sel-elec" class="aof-select-box"></select>
            </div>

            <!-- 3. Danh sách đầy đủ 7 môn (Giữ cố định 2 dòng/môn, không bao giờ làm tràn màn hình) -->
            <div id="aof-v4-list" class="aof-table-wrap"></div>

            <!-- 4. Cài đặt Giờ & Tự động chốt sổ -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--muted); padding: 6px 10px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <label style="font-weight: 700; font-size: 11.5px; color: var(--foreground);">⏰ Hẹn giờ bắn:</label>
                    <input id="aof-v4-time" type="text" value="08:00:00" style="width: 74px; padding: 2px 5px; font-family: var(--font-mono); font-weight: 700; background: var(--card); color: var(--foreground); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 11.5px; text-align: center;">
                </div>
                <span style="font-size: 11px; font-weight: 600; color: oklch(0.35 0.11 160);" title="Hệ thống trường sẽ tự hủy môn sau 15 phút nếu không chốt. Tool sẽ tự động chốt ngay khi đỗ!">
                    🔒 Tự động khóa sổ khi đỗ
                </span>
            </div>

            <!-- 5. Nút điều khiển -->
            <div style="display: flex; gap: 6px;">
                <button id="aof-v4-arm" class="aof-btn-main aof-btn-primary" style="flex: 1.35;">
                    🚀 Bật Canh Giờ (08:00:00)
                </button>
                <button id="aof-v4-fire" class="aof-btn-main aof-btn-fire" style="flex: 1;">
                    ⚡ Đăng Ký Ngay
                </button>
                <button id="aof-v4-stop" class="aof-btn-main aof-btn-stop">
                    Dừng
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(root);

    // ==================== ÂM THANH THÔNG BÁO (WEB AUDIO API) ====================
    let audioCtx = null;
    function playChime(type = 'subject_ok') {
        try {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            if (!audioCtx) audioCtx = new Ctx();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const now = audioCtx.currentTime;
            const playNote = (freq, startOffset, duration, gainVal = 0.14) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + startOffset);
                gain.gain.setValueAtTime(0.001, now + startOffset);
                gain.gain.exponentialRampToValueAtTime(gainVal, now + startOffset + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(now + startOffset);
                osc.stop(now + startOffset + duration);
            };

            if (type === 'subject_ok') {
                playNote(880, 0, 0.16, 0.14);
                playNote(1318.5, 0.09, 0.28, 0.16);
            } else if (type === 'all_done') {
                playNote(587.33, 0, 0.16, 0.15);
                playNote(880, 0.11, 0.18, 0.16);
                playNote(1174.66, 0.22, 0.42, 0.18);
            } else if (type === 'error') {
                playNote(340, 0, 0.14, 0.10);
                playNote(260, 0.12, 0.22, 0.10);
            }
        } catch (e) {}
    }

    // ==================== TOAST GÓC MÀN HÌNH & BROWSER NOTIFICATION ====================
    function showToast(title, message, type = 'success', durationMs = 4500) {
        const toast = document.createElement('div');
        toast.className = `aof-toast toast-${type}`;
        const iconMap = { success: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 800; font-size: 12px; color: var(--foreground); margin-bottom: 2px;">
                    ${iconMap[type] || '🔔'} ${title}
                </div>
                <div style="font-size: 11px; color: var(--muted-foreground); line-height: 1.35;">
                    ${message}
                </div>
            </div>
            <span style="cursor: pointer; font-weight: bold; font-size: 13px; color: var(--popover-foreground);" onclick="this.parentElement.remove()">✕</span>
        `;
        toastContainer.appendChild(toast);
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, durationMs);
    }

    function requestNotificationPermission() {
        try {
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().catch(() => {});
            }
        } catch (e) {}
    }

    function sendBrowserNotification(title, body) {
        try {
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(title, {
                    body,
                    icon: 'https://main.hvtc.edu.vn/images/logo.png'
                });
            }
        } catch (e) {}
    }

    // ==================== QUẢN LÝ TRẠNG THÁI ====================
    let savedConfig = {};
    try { savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIG) || '{}'); } catch (e) {}

    let selectedGroupId = savedConfig.selectedGroupId || 8013;
    let engFirstBranch = savedConfig.engFirstBranch || '1';
    let elecFirstCode = savedConfig.elecFirstCode || 'CAC0084';
    let disabledKeys = new Set(savedConfig.disabledKeys || []);

    const statusMap = new Map();
    let summaryState = {
        visible: false,
        mode: 'idle',
        title: '🎯 KẾT QUẢ ĐĂNG KÝ',
        detail: '',
        isSaved: false
    };

    try {
        const savedSession = JSON.parse(sessionStorage.getItem(SESSION_KEY_STATUS) || 'null');
        if (savedSession) {
            if (savedSession.entries) {
                savedSession.entries.forEach(([k, v]) => statusMap.set(k, v));
            }
            if (savedSession.summaryState) {
                summaryState = { ...summaryState, ...savedSession.summaryState };
            }
        }
    } catch (e) {}

    function persistConfig() {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({
            selectedGroupId,
            engFirstBranch,
            elecFirstCode,
            disabledKeys: Array.from(disabledKeys)
        }));
    }

    function persistSessionStatus() {
        try {
            sessionStorage.setItem(SESSION_KEY_STATUS, JSON.stringify({
                entries: Array.from(statusMap.entries()),
                summaryState
            }));
        } catch (e) {}
    }

    let subjectRows = [];
    let isArmed = false;
    let isRunning = false;
    let armTimer = null;

    const listEl = document.getElementById('aof-v4-list');
    const summaryEl = document.getElementById('aof-v4-summary');
    const connMsgEl = document.getElementById('aof-v4-conn-msg');
    const selEngEl = document.getElementById('aof-sel-eng');
    const selElecEl = document.getElementById('aof-sel-elec');

    // Đồng hồ thời gian thực
    setInterval(() => {
        const el = document.getElementById('aof-v4-clock');
        if (el) el.textContent = new Date().toLocaleTimeString('vi-VN');
    }, 250);

    // Thu gọn / Mở rộng
    document.getElementById('aof-v4-header').onclick = () => {
        const body = document.getElementById('aof-v4-body');
        const icon = document.getElementById('aof-v4-toggle');
        if (body.style.display === 'none') {
            body.style.display = 'flex';
            icon.textContent = '▼';
        } else {
            body.style.display = 'none';
            icon.textContent = '▲';
        }
    };

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

    function getRowState(key) {
        if (!statusMap.has(key)) {
            statusMap.set(key, {
                statusType: 'idle',
                statusText: 'Chờ đăng ký',
                registeredClass: null,
                registeredClassId: null,
                errorReason: ''
            });
        }
        return statusMap.get(key);
    }

    function setRowState(key, patch) {
        const prev = getRowState(key);
        const next = { ...prev, ...patch };
        statusMap.set(key, next);
        persistSessionStatus();
        return next;
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
                        classes: []
                    });
                }
                mandatoryMap.get(c.ky_hieu).classes.push(c);
            }
        });

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

        if (electiveClasses.length > 0) {
            electiveClasses.sort((a, b) => (a.ky_hieu === elecFirstCode ? -1 : 1) - (b.ky_hieu === elecFirstCode ? -1 : 1));
            const prio1Elec = electiveClasses[0];
            rows.push({
                key: 'ELECTIVE',
                ten_mon: `${prio1Elec.ten_mon} (Tự chọn)`,
                so_tin_chi: prio1Elec.so_tin_chi,
                isElective: true,
                enabled: !disabledKeys.has('ELECTIVE'),
                classes: electiveClasses
            });
        }

        subjectRows = rows;
        renderAll();
    }

    function renderSummary() {
        const enabledRows = subjectRows.filter(r => r.enabled);
        const totalSubj = enabledRows.length;
        const totalTc = enabledRows.reduce((s, r) => s + r.so_tin_chi, 0);

        const okRows = enabledRows.filter(r => getRowState(r.key).statusType === 'success');
        const okCount = okRows.length;
        const okTc = okRows.reduce((s, r) => s + r.so_tin_chi, 0);

        if (!summaryState.visible && okCount === 0) {
            summaryEl.className = '';
            return;
        }

        summaryEl.className = `show state-${summaryState.mode || 'idle'}`;
        document.getElementById('aof-sum-title').textContent = summaryState.title || '🎯 KẾT QUẢ ĐĂNG KÝ';
        document.getElementById('aof-sum-counter').textContent = `Đã đỗ: ${okCount}/${totalSubj} môn (${okTc}/${totalTc} TC)`;

        const pct = totalSubj > 0 ? Math.round((okCount / totalSubj) * 100) : 0;
        const barEl = document.getElementById('aof-sum-bar');
        barEl.style.width = `${pct}%`;
        barEl.style.background = summaryState.mode === 'error' && okCount === 0
            ? 'var(--destructive)'
            : (summaryState.mode === 'pending' && okCount === 0 ? 'var(--chart-4)' : 'var(--chart-5)');

        const detailEl = document.getElementById('aof-sum-detail');
        detailEl.innerHTML = summaryState.detail || '';
        detailEl.style.display = summaryState.detail ? 'block' : 'none';

        const chipsEl = document.getElementById('aof-sum-chips');
        chipsEl.innerHTML = '';
        okRows.forEach(r => {
            const st = getRowState(r.key);
            const chip = document.createElement('span');
            chip.className = 'aof-chip-ok';
            chip.innerHTML = `✅ ${r.ten_mon.replace(' (Tự chọn)', '')}: <b>${st.registeredClass || r.classes[0]?.ten_lop_hp}</b>`;
            chipsEl.appendChild(chip);
        });
        chipsEl.style.display = okRows.length > 0 ? 'flex' : 'none';
    }

    function renderAll() {
        document.getElementById('aof-tab-g1').className = `aof-group-tab ${selectedGroupId === 8013 ? 'active' : ''}`;
        document.getElementById('aof-tab-g2').className = `aof-group-tab ${selectedGroupId === 8014 ? 'active' : ''}`;

        const enabledRows = subjectRows.filter(r => r.enabled);
        const totalTc = enabledRows.reduce((s, r) => s + r.so_tin_chi, 0);
        document.getElementById('aof-v4-tc-count').textContent = `${enabledRows.length} môn (${totalTc} TC)`;

        renderSummary();

        listEl.innerHTML = '';

        subjectRows.forEach((row) => {
            const st = getRowState(row.key);
            const c1 = row.classes[0];
            const c2 = row.classes[1];

            const rowClass = `aof-subj-row row-${st.statusType || 'idle'}`;
            const badgeClass = `aof-status-badge badge-${st.statusType || 'idle'}`;

            const statusIcon = st.statusType === 'success'
                ? '✅ '
                : (st.statusType === 'pending' ? '⏳ ' : (st.statusType === 'error' ? '❌ ' : ''));

            // Luôn giữ đúng 1 dòng thông tin phụ bên dưới tên môn để bảng KHÔNG BAO GIỜ bị giãn chiều cao!
            let line2Html = '';
            if (st.statusType === 'success' && st.registeredClass) {
                line2Html = `
                    <div style="font-size: 11px; color: oklch(0.30 0.09 160); font-weight: 700; margin-top: 1px;">
                        🎯 ĐÃ ĐỖ LỚP: <span style="text-decoration: underline;">${st.registeredClass}</span> ${st.registeredClassId ? `(#${st.registeredClassId})` : ''}
                    </div>
                `;
            } else if (st.statusType === 'error' && st.errorReason) {
                line2Html = `
                    <div style="font-size: 11px; color: var(--destructive); font-weight: 600; margin-top: 1px;">
                        ⛔ ${st.errorReason}
                    </div>
                `;
            } else if (c1 && c2) {
                line2Html = `
                    <div style="font-size: 10.5px; color: var(--muted-foreground); margin-top: 1px;">
                        ƯT#1: <b style="color:var(--foreground);">${c1.ten_lop_hp}</b> <span style="color:oklch(0.45 0.12 160); font-weight:600;">(${c1.slotsLeft} chỗ)</span>
                        <span> → ƯT#2: <b>${c2.ten_lop_hp}</b> (${c2.slotsLeft} chỗ)</span>
                    </div>
                `;
            } else if (c1) {
                line2Html = `
                    <div style="font-size: 10.5px; color: var(--muted-foreground); margin-top: 1px;">
                        Lớp: <b style="color:var(--foreground);">${c1.ten_lop_hp}</b> <span>(#${c1.classId})</span> • <span style="color:oklch(0.45 0.12 160); font-weight:700;">Còn ${c1.slotsLeft} chỗ</span>
                    </div>
                `;
            }

            const div = document.createElement('div');
            div.className = rowClass;
            if (!row.enabled) {
                div.style.opacity = '0.55';
            }

            div.innerHTML = `
                <label style="display: flex; align-items: flex-start; gap: 7px; cursor: pointer; flex: 1; min-width: 0;">
                    <input type="checkbox" class="aof-chk-item" ${row.enabled ? 'checked' : ''} style="margin-top: 2px; width: 13.5px; height: 13.5px; cursor: pointer; accent-color: oklch(0.55 0.14 160);">
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-weight: 700; font-size: 12px; color: var(--foreground);">
                            ${statusIcon}${row.ten_mon} <span style="font-weight: 500; font-size: 11px; color: var(--popover-foreground);">(${row.so_tin_chi} TC)</span>
                        </div>
                        ${line2Html}
                    </div>
                </label>
                <span class="${badgeClass}">
                    ${st.statusText}
                </span>
            `;

            div.querySelector('.aof-chk-item').onchange = (e) => {
                row.enabled = e.target.checked;
                if (row.enabled) disabledKeys.delete(row.key);
                else disabledKeys.add(row.key);
                persistConfig();
                renderAll();
            };

            listEl.appendChild(div);
        });
    }

    // Sự kiện chọn Nhóm 1 / Nhóm 2
    document.getElementById('aof-tab-g1').onclick = () => {
        selectedGroupId = 8013;
        persistConfig();
        buildGroupSubjects();
        showToast('Đã chọn Nhóm 1', 'Đồng bộ bộ 7 môn của Nhóm 1 (CQ62.02.1_LT)', 'info', 2500);
    };

    document.getElementById('aof-tab-g2').onclick = () => {
        selectedGroupId = 8014;
        persistConfig();
        buildGroupSubjects();
        showToast('Đã chọn Nhóm 2', 'Đồng bộ bộ 7 môn của Nhóm 2 (CQ62.02.2_LT)', 'info', 2500);
    };

    selEngEl.onchange = (e) => {
        engFirstBranch = e.target.value;
        persistConfig();
        buildGroupSubjects();
    };

    selElecEl.onchange = (e) => {
        elecFirstCode = e.target.value;
        persistConfig();
        buildGroupSubjects();
    };

    // Nút đặt lại trạng thái
    document.getElementById('aof-v4-btn-reset').onclick = () => {
        statusMap.clear();
        summaryState = {
            visible: false,
            mode: 'idle',
            title: '🎯 KẾT QUẢ ĐĂNG KÝ',
            detail: '',
            isSaved: false
        };
        persistSessionStatus();
        renderAll();
        showToast('Đã đặt lại trạng thái', 'Tất cả các môn đã về trạng thái Chờ đăng ký.', 'info', 2500);
    };

    // ==================== API HELPERS ====================
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

    async function refreshQueueTokenOnly() {
        const { headers, accessToken, periodId } = getAuthHeaders(false);
        if (!accessToken) return null;
        try {
            const qRes = await fetch('/api/queue/status', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
            if (qRes && qRes.is_success && qRes.data) {
                const q = qRes.data;
                if (q.token) {
                    const qMap = JSON.parse(sessionStorage.getItem('queue_token_map') || '{}');
                    qMap[String(periodId)] = q.token;
                    sessionStorage.setItem('queue_token_map', JSON.stringify(qMap));
                }
                return q;
            }
        } catch (e) {}
        return null;
    }

    // Tìm trực tiếp Redux Store của trang web gốc từ cây React 18 Fiber (#root)
    let cachedReduxStore = null;
    function getHostReduxStore() {
        if (cachedReduxStore && typeof cachedReduxStore.dispatch === 'function') {
            return cachedReduxStore;
        }
        try {
            const rootEl = document.getElementById('root');
            if (!rootEl) return null;
            const reactKey = Object.keys(rootEl).find(k => k.startsWith('__reactContainer$') || k.startsWith('_reactRootContainer'));
            if (!reactKey) return null;

            const startNode = rootEl[reactKey]?.current || rootEl[reactKey];
            const queue = [startNode];
            const visited = new Set();

            while (queue.length > 0 && visited.size < 400) {
                const fiber = queue.shift();
                if (!fiber || visited.has(fiber)) continue;
                visited.add(fiber);

                const props = fiber.memoizedProps || fiber.pendingProps;
                if (props && props.store && typeof props.store.dispatch === 'function' && typeof props.store.getState === 'function') {
                    cachedReduxStore = props.store;
                    return cachedReduxStore;
                }
                const stateVal = fiber.memoizedState?.memoizedState?.store || fiber.stateNode?.store;
                if (stateVal && typeof stateVal.dispatch === 'function') {
                    cachedReduxStore = stateVal;
                    return cachedReduxStore;
                }

                if (fiber.child) queue.push(fiber.child);
                if (fiber.sibling) queue.push(fiber.sibling);
            }
        } catch (e) {}
        return null;
    }

    // Tự động làm mới bảng "Danh sách các lớp tín chỉ đã đăng ký" của trang web gốc qua Redux (0ms, không F5)
    function refreshHostWebTable(myListOptional = null, chotDataOptional = null) {
        try {
            const store = getHostReduxStore();
            if (store) {
                if (Array.isArray(myListOptional)) {
                    store.dispatch({ type: 'REG_LOAD_MY_SUCCESS', payload: myListOptional });
                }
                if (chotDataOptional) {
                    store.dispatch({
                        type: 'REG_CHOT_DU_LIEU_SUCCESS',
                        payload: {
                            ngayChotDuLieu: chotDataOptional.ngayChotDuLieu || new Date().toISOString(),
                            classIds: chotDataOptional.classIds || []
                        }
                    });
                }
                store.dispatch({ type: 'REG_LOAD_MY_START', payload: undefined });
                store.dispatch({ type: 'FINANCIAL_LOAD_START', payload: undefined });
            }
        } catch (e) {}
    }

    async function syncMyRegisteredClasses() {
        const { headers, accessToken } = getAuthHeaders(true);
        if (!accessToken) return [];
        try {
            const myRes = await fetch('/api/registration/my', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
            if (myRes && myRes.is_success && Array.isArray(myRes.data)) {
                const myList = myRes.data;
                refreshHostWebTable(myList);

                if (myList.length > 0) {
                    const classById = new Map(allRawClasses.map(c => [Number(c.classId), c]));
                    let matchedAny = false;

                    myList.forEach(item => {
                        const cid = Number(item.id_lop_tc || item.classId || item.id);
                        const rawCls = classById.get(cid);
                        const tenLop = item.ten_lop_hp || item.ten_lop || rawCls?.ten_lop_hp || `Lớp #${cid}`;
                        const kyHieu = item.ma_hoc_phan || item.ky_hieu || rawCls?.ky_hieu || '';

                        let rowKey = kyHieu;
                        if (kyHieu === 'CAC0084' || kyHieu === 'CVA0243' || (rawCls && rawCls.nhom_tu_chon > 0)) {
                            rowKey = 'ELECTIVE';
                        }

                        if (rowKey) {
                            matchedAny = true;
                            setRowState(rowKey, {
                                statusType: 'success',
                                statusText: `✅ ĐÃ ĐỖ`,
                                registeredClass: tenLop,
                                registeredClassId: cid,
                                errorReason: ''
                            });
                        }
                    });

                    if (matchedAny) {
                        const confirmedCount = myList.filter(x => x.trang_thai === 1).length;
                        summaryState.visible = true;
                        summaryState.mode = 'success';
                        summaryState.title = '🎯 CÁC MÔN ĐÃ ĐĂNG KÝ TRÊN HỆ THỐNG';
                        summaryState.detail = `Hệ thống ghi nhận <b>${myList.length} môn</b> (${confirmedCount} môn đã vào DB).`;
                        persistSessionStatus();
                        renderAll();
                    }
                }
                return myList;
            }
        } catch (e) {}
        return [];
    }

    async function checkConnectionAndSync(showMsg = true) {
        const { headers, accessToken, periodId } = getAuthHeaders(false);
        let userInfo = null;
        try { userInfo = JSON.parse(localStorage.getItem('user_info') || 'null'); } catch (e) {}

        if (!accessToken) {
            connMsgEl.innerHTML = `<span style="color:var(--destructive);">🔴 Chưa đăng nhập</span>`;
            if (showMsg) showToast('Chưa đăng nhập', 'Vui lòng đăng nhập vào cổng HVTC trước.', 'error');
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
                connMsgEl.innerHTML = `<span style="color:oklch(0.35 0.11 160);">🟢 <b>${name}</b> (Đợt ${periodId})</span>`;
                if (showMsg) {
                    showToast('Đã đồng bộ bảng web & kết nối!', `Sinh viên: ${name} • Bảng đăng ký đã được làm mới ngầm (Không F5).`, 'success', 3000);
                }
            } else {
                connMsgEl.innerHTML = `<span style="color:var(--destructive);">🔴 Lỗi kết nối (${qRes?.message || 'Hết phiên'})</span>`;
                if (showMsg) showToast('Lỗi kết nối', qRes?.message || 'Phiên đăng nhập đã hết hạn, vui lòng tải lại trang.', 'error');
            }

            if (cRes && cRes.is_success && Array.isArray(cRes.data) && cRes.data.length > 0) {
                allRawClasses = cRes.data;
                if (!isRunning) {
                    buildGroupSubjects();
                }
            }

            await syncMyRegisteredClasses();
            refreshHostWebTable();
        } catch (err) {
            connMsgEl.innerHTML = `<span style="color:var(--destructive);">🔴 Lỗi mạng</span>`;
        }
    }

    // Nút "🔄 Làm mới bảng web" nằm gọn ngay trên thanh kết nối
    document.getElementById('aof-v4-btn-refresh-web').onclick = () => checkConnectionAndSync(true);

    // ==================== THUẬT TOÁN BẮN ĐĂNG KÝ LIÊN TỤC ĐẾN KHI THÀNH CÔNG ====================
    function translateReason(reasonCode, rawMsg, httpStatus) {
        if (rawMsg && rawMsg.length > 0 && rawMsg !== reasonCode) return rawMsg;
        const map = {
            'PERIOD_NOT_OPEN': 'Chưa đến giờ mở cổng đăng ký',
            'NOT_OPEN': 'Chưa đến thời gian đăng ký',
            'NOT_YOUR_TURN': 'Đang trong hàng chờ (chưa tới lượt)',
            'CLASS_FULL': 'Lớp đã hết chỗ trống',
            'SCHEDULE_CONFLICT': 'Trùng lịch học với lớp khác',
            'LOCKED_TO_OTHER_NHOM_LOP': 'Bị khóa vào nhóm lớp khác',
            'NHOM_TU_CHON_FULL': 'Đã đủ số tín chỉ tự chọn',
            'ALREADY_REGISTERED': 'Đã đăng ký lớp này rồi',
            'ALREADY_REGISTERED_SAME_MON': 'Đã đăng ký học phần này rồi'
        };
        if (map[reasonCode]) return map[reasonCode];
        if (httpStatus === 403) return 'Cổng chưa mở hoặc đang chờ lượt (HTTP 403)';
        if (httpStatus === 400) return rawMsg || 'Chưa đến thời gian đăng ký (HTTP 400)';
        if (httpStatus === 429) return 'Quá giới hạn tốc độ (Đang đợi 429)';
        if (httpStatus === 401) return 'Hết phiên đăng nhập (HTTP 401)';
        return rawMsg || reasonCode || `Mã phản hồi HTTP ${httpStatus}`;
    }

    async function registerSubjectWithFallback(row, round) {
        for (let i = 0; i < row.classes.length; i++) {
            if (!isRunning) return { done: false };
            const cls = row.classes[i];
            const prioTag = row.classes.length > 1 ? ` ƯT#${i + 1}` : '';

            setRowState(row.key, {
                statusType: 'pending',
                statusText: `⏳ Vòng ${round}: Đang bắn${prioTag}...`,
                errorReason: ''
            });
            renderAll();

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

            const reasonCode = body?.data?.reasonCode || body?.error_code || '';
            const friendlyMsg = translateReason(reasonCode, body?.message, httpStatus);

            // TRƯỜNG HỢP 1: ĐĂNG KÝ THÀNH CÔNG!
            if (body && body.is_success) {
                setRowState(row.key, {
                    statusType: 'success',
                    statusText: `✅ ĐÃ ĐỖ`,
                    registeredClass: cls.ten_lop_hp,
                    registeredClassId: cls.classId,
                    errorReason: ''
                });
                renderAll();
                playChime('subject_ok');
                showToast(`Đỗ môn: ${row.ten_mon}`, `Đã giữ chỗ lớp ${cls.ten_lop_hp} (#${cls.classId}) thành công!`, 'success', 5000);
                sendBrowserNotification(`✅ Đỗ môn: ${row.ten_mon}`, `Lớp: ${cls.ten_lop_hp} (#${cls.classId})`);
                refreshHostWebTable();
                return { done: true, success: true, cls };
            }

            // TRƯỜNG HỢP 2: MÔN NÀY ĐÃ ĐĂNG KÝ TRƯỚC ĐÓ
            if (reasonCode === 'ALREADY_REGISTERED' || reasonCode === 'ALREADY_REGISTERED_SAME_MON') {
                setRowState(row.key, {
                    statusType: 'success',
                    statusText: `✅ ĐÃ ĐỖ`,
                    registeredClass: cls.ten_lop_hp,
                    registeredClassId: cls.classId,
                    errorReason: ''
                });
                renderAll();
                refreshHostWebTable();
                return { done: true, success: true, cls };
            }

            // TRƯỜNG HỢP 3: LỚP ƯT#1 HẾT CHỖ (CLASS_FULL) -> TỰ ĐỘNG NHẢY SANG ƯT#2 NGAY LẬP TỨC
            if (reasonCode === 'CLASS_FULL' || reasonCode === 'SCHEDULE_CONFLICT' || reasonCode === 'LOCKED_TO_OTHER_NHOM_LOP') {
                if (i + 1 < row.classes.length) {
                    const nextCls = row.classes[i + 1];
                    setRowState(row.key, {
                        statusType: 'pending',
                        statusText: `⚡ ƯT#1 đầy → Sang ƯT#2`
                    });
                    renderAll();
                    showToast(`Tự động nhảy lớp ƯT#2`, `${row.ten_mon}: ${cls.ten_lop_hp} hết chỗ, chuyển sang ${nextCls.ten_lop_hp}!`, 'warn', 4000);
                    continue;
                } else {
                    setRowState(row.key, {
                        statusType: 'error',
                        statusText: `❌ ${reasonCode === 'CLASS_FULL' ? 'Hết chỗ' : 'Bị chặn'}`,
                        errorReason: friendlyMsg
                    });
                    renderAll();
                    return { done: true, success: false, reason: friendlyMsg };
                }
            }

            if (reasonCode === 'NHOM_TU_CHON_FULL') {
                setRowState(row.key, {
                    statusType: 'error',
                    statusText: `⛔ Đủ TC tự chọn`,
                    errorReason: friendlyMsg
                });
                renderAll();
                return { done: true, success: false, reason: friendlyMsg };
            }

            // TRƯỜNG HỢP 4: CỔNG CHƯA MỞ / CHỜ LƯỢT HÀNG CHỜ / 429 -> TIẾP TỤC THỬ LẠI ĐẾN KHI ĐỖ!
            const shortBadge = httpStatus === 429
                ? `⏳ Vòng ${round}: Đợi 429`
                : `⏳ Vòng ${round}: Chờ cổng`;

            setRowState(row.key, {
                statusType: 'pending',
                statusText: shortBadge,
                errorReason: ''
            });
            renderAll();

            return {
                done: false,
                hitRateLimit: httpStatus === 429,
                needQueue: reasonCode === 'NOT_YOUR_TURN' || httpStatus === 403 || httpStatus === 400,
                lastMsg: friendlyMsg
            };
        }
        return { done: true, success: false };
    }

    // Tự động gọi API chốt dữ liệu ngầm ngay khi có môn được DB xác nhận (tránh bị Reaper hủy sau 15 phút)
    async function autoLockConfirmedSubjects(expectedCount) {
        const { headers } = getAuthHeaders(true);
        for (let w = 0; w < 12; w++) {
            await new Promise(r => setTimeout(r, 1000));
            const myList = await syncMyRegisteredClasses();
            if (myList.filter(x => x.trang_thai === 1).length >= expectedCount) break;
        }
        const chotRes = await fetch('/api/registration/chot-du-lieu', {
            method: 'POST',
            headers,
            body: JSON.stringify({})
        }).then(r => r.json()).catch(() => null);

        if (chotRes && chotRes.is_success) {
            summaryState.isSaved = true;
            refreshHostWebTable(null, chotRes.data);
            return true;
        }
        refreshHostWebTable();
        return false;
    }

    async function runCampaign() {
        if (isRunning) return;
        isRunning = true;
        requestNotificationPermission();

        const targets = subjectRows.filter(r => r.enabled);
        if (targets.length === 0) {
            showToast('Chưa chọn môn học!', 'Hãy tích chọn ít nhất 1 môn học để đăng ký.', 'error');
            isRunning = false;
            return;
        }

        // Đổi màu toàn bộ các dòng được chọn sang màu Vàng (Pending) ngay lập tức (0ms)
        targets.forEach(r => {
            if (getRowState(r.key).statusType !== 'success') {
                setRowState(r.key, {
                    statusType: 'pending',
                    statusText: `⏳ Vòng 1: Đang gửi...`,
                    errorReason: ''
                });
            }
        });

        summaryState = {
            visible: true,
            mode: 'pending',
            title: `⏳ ĐANG BẮN LIÊN TỤC ĐẾN KHI ĐỖ (VÒNG 1)`,
            detail: `Đang gửi đăng ký <b>${targets.length} môn</b>... (Bấm <b>Dừng</b> nếu muốn ngắt)`,
            isSaved: false
        };
        renderAll();

        const { qToken } = getAuthHeaders(true);
        if (!qToken) await refreshQueueTokenOnly();

        const finished = new Map();
        targets.forEach(r => {
            if (getRowState(r.key).statusType === 'success') {
                finished.set(r.key, { done: true, success: true });
            }
        });

        let notifiedFirstRoundIssue = false;
        let lastSavedOkCount = finished.size;
        let round = 0;

        // VÒNG LẶP VÔ HẠN CHO TỚI KHI TẤT CẢ CÁC MÔN ĐỀU ĐỖ (HOẶC BẤM NÚT DỪNG)
        while (isRunning) {
            round++;
            const pending = targets.filter(r => !finished.has(r.key));
            if (pending.length === 0) break;

            summaryState.title = `⏳ ĐANG BẮN LIÊN TỤC (VÒNG ${round}) — CÒN ${pending.length} MÔN`;
            renderSummary();

            let hit429 = false;
            let needQueue = false;
            let sampleMsg = '';

            await Promise.all(pending.map(async (row) => {
                const res = await registerSubjectWithFallback(row, round);
                if (res.done) {
                    finished.set(row.key, res);
                } else {
                    if (res.hitRateLimit) hit429 = true;
                    if (res.needQueue) needQueue = true;
                    if (res.lastMsg) sampleMsg = res.lastMsg;
                }
            }));

            renderAll();

            // Nếu vừa có môn mới đỗ ngay trong vòng này -> Tự động chốt sổ ngầm & làm mới bảng web ngay!
            const currentOkCount = targets.filter(r => getRowState(r.key).statusType === 'success').length;
            if (currentOkCount > lastSavedOkCount) {
                lastSavedOkCount = currentOkCount;
                autoLockConfirmedSubjects(currentOkCount).catch(() => {});
            }

            if (sampleMsg && currentOkCount < targets.length) {
                summaryState.detail = `💬 Máy chủ: <b>"${sampleMsg}"</b> — Đang tự động thử lại liên tục (Vòng ${round})...`;
                renderSummary();

                if (round === 1 && !notifiedFirstRoundIssue && currentOkCount === 0) {
                    notifiedFirstRoundIssue = true;
                    showToast(
                        `Đang tự động thử lại liên tục`,
                        `Máy chủ báo: "${sampleMsg}" — Tool sẽ bắn liên tục đến khi cổng mở & đỗ đủ môn!`,
                        'warn',
                        4500
                    );
                }
            }

            if (finished.size >= targets.length || !isRunning) break;
            if (needQueue) await refreshQueueTokenOnly();

            // Nhịp nghỉ thông minh chống khóa IP (3.2s khi gặp 429, 1.2s bình thường)
            await new Promise(r => setTimeout(r, hit429 ? 3200 : 1200));
        }

        const okCount = targets.filter(r => getRowState(r.key).statusType === 'success').length;

        if (okCount > 0 && isRunning) {
            summaryState.mode = 'pending';
            summaryState.title = `⏳ ĐANG KHÓA SỔ AN TOÀN (${okCount}/${targets.length} MÔN)...`;
            summaryState.detail = `Đã đỗ <b>${okCount}/${targets.length} môn</b>! Đang tự động xác nhận Database để không bị hủy sau 15 phút...`;
            renderAll();

            const lockedOk = await autoLockConfirmedSubjects(okCount);

            summaryState.mode = 'success';
            summaryState.title = `🎉 HOÀN TẤT ĐĂNG KÝ (${okCount}/${targets.length} MÔN)`;
            summaryState.detail = lockedOk
                ? `Tuyệt vời! Đã đăng ký và <b>Tự động khóa sổ (Lưu dữ liệu)</b> thành công <b>${okCount}/${targets.length} môn</b>!`
                : `Đã giữ chỗ thành công <b>${okCount}/${targets.length} môn</b> và cập nhật lên bảng kết quả!`;
            persistSessionStatus();
            renderAll();
            playChime('all_done');
            showToast('HOÀN TẤT ĐĂNG KÝ TÍN CHỈ!', `Đã đỗ và khóa sổ an toàn ${okCount}/${targets.length} môn học!`, 'success', 8000);
            sendBrowserNotification('🎉 Đăng Ký Tín Chỉ Thành Công!', `Đã đỗ và lưu an toàn ${okCount}/${targets.length} môn.`);
        }

        isRunning = false;
    }

    // Nút Hẹn giờ tự động bắn (08:00:00)
    document.getElementById('aof-v4-arm').onclick = () => {
        requestNotificationPermission();
        const targetTime = document.getElementById('aof-v4-time').value.trim();
        isArmed = true;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v4-arm');
        btn.textContent = `⏳ Đang canh ${targetTime}...`;
        btn.style.background = 'var(--chart-4)';
        btn.style.color = 'var(--foreground)';

        summaryState.visible = true;
        summaryState.mode = 'pending';
        summaryState.title = `⏰ ĐANG CANH GIỜ TỰ ĐỘNG (${targetTime})`;
        summaryState.detail = `Đúng <b>${targetTime}</b> tool sẽ tự động bắn liên tục cho tới khi đỗ đủ 7 môn!`;
        renderAll();

        showToast('Đã bật chế độ Canh Giờ!', `Đúng ${targetTime} tool sẽ tự động bắn liên tục đến khi thành công.`, 'info', 3500);

        armTimer = setInterval(() => {
            if (!isArmed) return;
            const nowStr = new Date().toTimeString().split(' ')[0];
            if (nowStr >= targetTime) {
                clearInterval(armTimer);
                isArmed = false;
                btn.textContent = `🚀 Bật Canh Giờ (${targetTime})`;
                btn.style.background = '';
                btn.style.color = '';
                setTimeout(() => runCampaign(), 50);
            }
        }, 100);
    };

    // Nút Đăng Ký Ngay (Bắn liên tục đến khi đỗ thì thôi)
    document.getElementById('aof-v4-fire').onclick = () => {
        isArmed = false;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v4-arm');
        btn.textContent = `🚀 Bật Canh Giờ (${document.getElementById('aof-v4-time').value.trim()})`;
        btn.style.background = '';
        btn.style.color = '';
        runCampaign();
    };

    // Nút Dừng
    document.getElementById('aof-v4-stop').onclick = () => {
        isArmed = false;
        isRunning = false;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v4-arm');
        btn.textContent = `🚀 Bật Canh Giờ (08:00:00)`;
        btn.style.background = '';
        btn.style.color = '';

        // Đưa những môn đang pending về lại trạng thái chờ gọn gàng
        subjectRows.forEach(r => {
            if (getRowState(r.key).statusType === 'pending') {
                setRowState(r.key, {
                    statusType: 'idle',
                    statusText: 'Chờ đăng ký',
                    errorReason: ''
                });
            }
        });

        summaryState.visible = true;
        summaryState.mode = 'idle';
        summaryState.title = '🛑 ĐÃ DỪNG BẮN TỰ ĐỘNG';
        summaryState.detail = 'Đã ngắt vòng lặp đăng ký. Bạn có thể bấm "⚡ Đăng Ký Ngay" hoặc "🚀 Bật Canh Giờ" bất cứ lúc nào.';
        renderAll();
        showToast('Đã dừng tác vụ', 'Mọi tiến trình tự động đã được ngắt.', 'warn', 2500);
    };

    // Khởi tạo giao diện lần đầu
    buildGroupSubjects();
    setTimeout(() => checkConnectionAndSync(false), 400);
})();
