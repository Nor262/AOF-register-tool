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

    // CSS theo đúng bộ biến Light Mode (:root) mà người dùng cung cấp
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
            bottom: 14px;
            right: 14px;
            z-index: 999998;
            width: 485px;
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-xl);
            box-shadow: var(--shadow-2xl);
            font-size: 12.5px;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        #aof-v4-header {
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 10px 14px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            user-select: none;
            border-bottom: 1px solid var(--border);
        }

        #aof-v4-conn {
            padding: 7px 14px;
            background: var(--muted);
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
        }

        #aof-v4-body {
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: var(--background);
        }

        /* Bảng tổng kết nổi bật (Summary Card) */
        #aof-v4-summary {
            border-radius: var(--radius-lg);
            border: 1.5px solid var(--chart-5);
            background: oklch(0.975 0.03 160.9);
            padding: 9px 11px;
            box-shadow: var(--shadow-xs);
            display: none;
            flex-direction: column;
            gap: 6px;
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
            height: 6px;
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
            gap: 4px;
        }
        .aof-chip-ok {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 7px;
            border-radius: var(--radius-sm);
            background: var(--primary);
            color: var(--primary-foreground);
            font-size: 11px;
            font-weight: 700;
            border: 1px solid var(--chart-5);
        }

        /* Tabs Chọn Nhóm Lớp */
        .aof-group-tabs {
            display: flex;
            gap: 6px;
            background: var(--muted);
            padding: 4px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }
        .aof-group-tab {
            flex: 1;
            padding: 6px 10px;
            border-radius: var(--radius-md);
            border: none;
            font-weight: 700;
            font-size: 12px;
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
            grid-template-columns: 138px 1fr;
            gap: 6px 8px;
            align-items: center;
            background: var(--muted);
            padding: 8px 10px;
            border-radius: var(--radius-lg);
            border: 1px solid var(--border);
        }
        .aof-select-box {
            width: 100%;
            padding: 5px 8px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border);
            background: var(--card);
            font-size: 11.5px;
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

        /* Danh sách 7 môn học */
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
            padding: 7px 10px;
            border-bottom: 1px solid var(--border);
            border-left: 4px solid transparent;
            gap: 8px;
            transition: background 0.2s ease, border-color 0.2s ease;
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
            padding: 4px 8px;
            border-radius: var(--radius-md);
            font-size: 11px;
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
            padding: 8px 12px;
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
            padding: 3px 9px;
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
            top: 16px;
            right: 16px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 380px;
            pointer-events: none;
        }
        .aof-toast {
            pointer-events: auto;
            background: var(--card);
            color: var(--foreground);
            border: 1px solid var(--border);
            border-left: 5px solid var(--chart-5);
            border-radius: var(--radius-lg);
            padding: 10px 12px;
            box-shadow: var(--shadow-xl);
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            animation: aofSlideIn 0.22s ease-out;
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
            <div style="font-weight: 800; font-size: 13.5px; display: flex; align-items: center; gap: 7px;">
                <span>⚡ AOF Auto Register v4.0</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="aof-v4-clock" style="font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; background: oklch(0.2626 0.0147 166.4589 / 0.12); color: var(--primary-foreground); padding: 2px 8px; border-radius: var(--radius-sm);">--:--:--</span>
                <span id="aof-v4-toggle" style="font-size: 13px; font-weight: bold;">▼</span>
            </div>
        </div>

        <div id="aof-v4-conn">
            <span id="aof-v4-conn-msg" style="font-weight: 600; color: var(--muted-foreground);">🔌 Đang kiểm tra kết nối...</span>
            <div style="display: flex; gap: 5px;">
                <button id="aof-v4-btn-reset" class="aof-btn-sm" title="Đặt lại trạng thái các môn về Chờ đăng ký">↺ Đặt lại</button>
                <button id="aof-v4-btn-check" class="aof-btn-sm">🔄 Đồng bộ</button>
            </div>
        </div>

        <div id="aof-v4-body">
            <!-- BẢNG TỔNG KẾT NỔI BẬT NGAY TRÊN ĐẦU EXTENSION -->
            <div id="aof-v4-summary">
                <div style="display: flex; justify-content: space-between; align-items: center; gap: 6px;">
                    <span id="aof-sum-title" style="font-weight: 800; font-size: 12px; color: var(--foreground);">🎯 KẾT QUẢ ĐĂNG KÝ</span>
                    <span id="aof-sum-counter" style="font-weight: 800; font-size: 11.5px; padding: 2px 7px; border-radius: var(--radius-sm); background: var(--primary); color: var(--primary-foreground);">Đã đỗ: 0/7 môn (0/18 TC)</span>
                </div>
                <div class="aof-progress-track">
                    <div id="aof-sum-bar" class="aof-progress-bar" style="width: 0%;"></div>
                </div>
                <div id="aof-sum-detail" style="font-size: 11.5px; color: var(--muted-foreground); line-height: 1.4;"></div>
                <div id="aof-sum-chips" class="aof-chip-list"></div>
                <div id="aof-sum-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 4px; border-top: 1px dashed var(--border); font-size: 11px;">
                    <span id="aof-sum-save-status" style="font-weight: 700; color: var(--primary-foreground);">💾 Trạng thái: Chờ lưu dữ liệu</span>
                    <div style="display: flex; gap: 5px;">
                        <button id="aof-btn-manual-save" class="aof-btn-sm" style="background: var(--primary); color: var(--primary-foreground); border-color: var(--chart-5); font-weight: 700;">💾 Lưu dữ liệu ngay</button>
                        <button id="aof-btn-refresh-web" class="aof-btn-sm">🔄 Làm mới bảng web</button>
                    </div>
                </div>
            </div>

            <!-- 1. Chọn Nhóm Lớp -->
            <div>
                <div style="font-weight: 700; font-size: 12px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;">
                    <span>1. Chọn Nhóm Lớp Đồng Bộ:</span>
                    <span id="aof-v4-tc-count" style="background: var(--primary); color: var(--primary-foreground); padding: 1px 8px; border-radius: var(--radius-sm); font-weight: 700; font-size: 11.5px;">7 môn (18 TC)</span>
                </div>
                <div class="aof-group-tabs">
                    <button id="aof-tab-g1" class="aof-group-tab active">Nhóm 1 (CQ62.02.1_LT)</button>
                    <button id="aof-tab-g2" class="aof-group-tab">Nhóm 2 (CQ62.02.2_LT)</button>
                </div>
            </div>

            <!-- 2. Chọn lớp ưu tiên bằng Dropdown (Tiếng Anh & Tự chọn) -->
            <div class="aof-select-grid">
                <label style="font-weight: 600; font-size: 11.5px; color: var(--foreground);">2. Ưu tiên Tiếng Anh:</label>
                <select id="aof-sel-eng" class="aof-select-box"></select>

                <label style="font-weight: 600; font-size: 11.5px; color: var(--foreground);">3. Ưu tiên Tự chọn:</label>
                <select id="aof-sel-elec" class="aof-select-box"></select>
            </div>

            <!-- 3. Danh sách đầy đủ 7 môn (Đổi màu toàn bộ dòng khi đỗ / chờ / lỗi) -->
            <div id="aof-v4-list" class="aof-table-wrap"></div>

            <!-- 4. Cài đặt Giờ & Tự động lưu -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: var(--muted); padding: 7px 11px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
                <div style="display: flex; align-items: center; gap: 5px;">
                    <label style="font-weight: 700; font-size: 12px; color: var(--foreground);">⏰ Hẹn giờ bắn:</label>
                    <input id="aof-v4-time" type="text" value="08:00:00" style="width: 78px; padding: 3px 6px; font-family: var(--font-mono); font-weight: 700; background: var(--card); color: var(--foreground); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; text-align: center;">
                </div>
                <label style="font-weight: 600; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 5px; color: var(--foreground);">
                    <input id="aof-v4-autosave" type="checkbox" checked style="width: 14px; height: 14px; accent-color: oklch(0.55 0.14 160);"> Tự bấm "Lưu dữ liệu"
                </label>
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
                // Tiếng "Ting!" trong trẻo khi đỗ 1 môn
                playNote(880, 0, 0.16, 0.14);
                playNote(1318.5, 0.09, 0.28, 0.16);
            } else if (type === 'all_done') {
                // Hợp âm chiến thắng khi hoàn tất / lưu dữ liệu xong
                playNote(587.33, 0, 0.16, 0.15);
                playNote(880, 0.11, 0.18, 0.16);
                playNote(1174.66, 0.22, 0.42, 0.18);
            } else if (type === 'error') {
                // Tiếng báo nhẹ khi cổng chưa mở hoặc lỗi
                playNote(340, 0, 0.14, 0.10);
                playNote(260, 0.12, 0.22, 0.10);
            }
        } catch (e) {}
    }

    // ==================== TOAST GÓC MÀN HÌNH & BROWSER NOTIFICATION ====================
    function showToast(title, message, type = 'success', durationMs = 5000) {
        const toast = document.createElement('div');
        toast.className = `aof-toast toast-${type}`;
        const iconMap = { success: '✅', warn: '⚠️', error: '❌', info: 'ℹ️' };
        toast.innerHTML = `
            <div style="flex: 1;">
                <div style="font-weight: 800; font-size: 12.5px; color: var(--foreground); margin-bottom: 2px;">
                    ${iconMap[type] || '🔔'} ${title}
                </div>
                <div style="font-size: 11.5px; color: var(--muted-foreground); line-height: 1.35;">
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

    // ==================== QUẢN LÝ TRẠNG THÁI (KHÔNG BAO GIỜ BỊ MẤT KHI REBUILD) ====================
    let savedConfig = {};
    try { savedConfig = JSON.parse(localStorage.getItem(STORAGE_KEY_CONFIG) || '{}'); } catch (e) {}

    let selectedGroupId = savedConfig.selectedGroupId || 8013;
    let engFirstBranch = savedConfig.engFirstBranch || '1';
    let elecFirstCode = savedConfig.elecFirstCode || 'CAC0084';
    let disabledKeys = new Set(savedConfig.disabledKeys || []);

    // Map lưu trạng thái từng môn theo key ('INS0001', 'SFL0115', ..., 'ELECTIVE')
    // Không bao giờ bị ghi đè khi gọi buildGroupSubjects()!
    const statusMap = new Map();
    let summaryState = {
        visible: false,
        mode: 'idle', // 'pending' | 'success' | 'error'
        title: '🎯 KẾT QUẢ ĐĂNG KÝ',
        detail: '',
        saveStatusText: '💾 Trạng thái: Chờ lưu dữ liệu',
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

    // Cập nhật Dropdown Tiếng Anh & Tự chọn
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
                statusType: 'idle', // 'idle' | 'pending' | 'success' | 'error'
                statusText: 'Chờ đăng ký',
                registeredClass: null,
                registeredClassId: null,
                subMessage: ''
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

        // Sắp xếp Tiếng Anh chuyên ngành 1 theo lựa chọn Dropdown
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

        const saveEl = document.getElementById('aof-sum-save-status');
        saveEl.textContent = summaryState.saveStatusText || '💾 Trạng thái: Chờ lưu dữ liệu';
        saveEl.style.color = summaryState.isSaved ? 'oklch(0.32 0.11 160)' : 'var(--muted-foreground)';
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

            let classDetailHtml = '';
            if (st.statusType === 'success' && st.registeredClass) {
                classDetailHtml = `
                    <div style="font-size: 11.5px; color: oklch(0.30 0.09 160); font-weight: 700; margin-top: 2px;">
                        🎯 ĐÃ ĐỖ LỚP: <span style="text-decoration: underline;">${st.registeredClass}</span> ${st.registeredClassId ? `(#${st.registeredClassId})` : ''}
                    </div>
                `;
            } else if (c1 && c2) {
                classDetailHtml = `
                    <div style="font-size: 11px; color: var(--muted-foreground); margin-top: 2px;">
                        ƯT#1: <b style="color:var(--foreground);">${c1.ten_lop_hp}</b> <span style="color:oklch(0.45 0.12 160); font-weight:600;">(${c1.slotsLeft} chỗ)</span>
                        <span> → ƯT#2: <b>${c2.ten_lop_hp}</b> (${c2.slotsLeft} chỗ)</span>
                    </div>
                `;
            } else if (c1) {
                classDetailHtml = `
                    <div style="font-size: 11px; color: var(--muted-foreground); margin-top: 2px;">
                        Lớp: <b style="color:var(--foreground);">${c1.ten_lop_hp}</b> <span>(#${c1.classId})</span> • <span style="color:oklch(0.45 0.12 160); font-weight:700;">Còn ${c1.slotsLeft} chỗ</span>
                    </div>
                `;
            }

            let subMsgHtml = '';
            if (st.subMessage) {
                const subColor = st.statusType === 'error'
                    ? 'var(--destructive)'
                    : (st.statusType === 'pending' ? 'oklch(0.42 0.10 65)' : 'oklch(0.32 0.09 160)');
                subMsgHtml = `<div style="font-size: 11px; font-weight: 600; color: ${subColor}; margin-top: 2px;">${st.subMessage}</div>`;
            }

            const div = document.createElement('div');
            div.className = rowClass;
            if (!row.enabled) {
                div.style.opacity = '0.55';
            }

            div.innerHTML = `
                <label style="display: flex; align-items: flex-start; gap: 8px; cursor: pointer; flex: 1;">
                    <input type="checkbox" class="aof-chk-item" ${row.enabled ? 'checked' : ''} style="margin-top: 3px; width: 14px; height: 14px; cursor: pointer; accent-color: oklch(0.55 0.14 160);">
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 12.5px; color: var(--foreground);">
                            ${statusIcon}${row.ten_mon} <span style="font-weight: 500; font-size: 11.5px; color: var(--popover-foreground);">(${row.so_tin_chi} TC)</span>
                        </div>
                        ${classDetailHtml}
                        ${subMsgHtml}
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
            saveStatusText: '💾 Trạng thái: Chờ lưu dữ liệu',
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

    // Chỉ làm mới Queue Token (Không gọi buildGroupSubjects để tránh làm mất tiến trình đang chạy)
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
    // Dựa trên source code gốc App.tsx: <Provider store={store}> nằm ngay dưới #root
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

    // Tự động làm mới bảng "Danh sách các lớp tín chỉ đã đăng ký" của trang web gốc
    // HOÀN TOÀN BẰNG REDUX (KHÔNG F5 / KHÔNG RELOAD TRANG / KHÔNG NGẮT WEBSOCKET SIGNALR)
    function refreshHostWebTable(myListOptional = null, chotDataOptional = null) {
        try {
            const store = getHostReduxStore();
            if (store) {
                // Nếu đã có sẵn danh sách từ /api/registration/my thì bơm thẳng vào Reducer ngay lập tức (0ms)
                if (Array.isArray(myListOptional)) {
                    store.dispatch({ type: 'REG_LOAD_MY_SUCCESS', payload: myListOptional });
                }
                // Nếu vừa chốt dữ liệu thành công thì cập nhật ngay trạng thái chốt trên giao diện gốc
                if (chotDataOptional) {
                    store.dispatch({
                        type: 'REG_CHOT_DU_LIEU_SUCCESS',
                        payload: {
                            ngayChotDuLieu: chotDataOptional.ngayChotDuLieu || new Date().toISOString(),
                            classIds: chotDataOptional.classIds || []
                        }
                    });
                }
                // Đồng thời kích hoạt Saga chuẩn của trang web để đồng bộ lại danh sách ĐK & học phí
                store.dispatch({ type: 'REG_LOAD_MY_START', payload: undefined });
                store.dispatch({ type: 'FINANCIAL_LOAD_START', payload: undefined });
            }
        } catch (e) {}
    }

    // Đồng bộ danh sách các môn ĐÃ ĐĂNG KÝ từ /api/registration/my để tô xanh ngay lập tức
    async function syncMyRegisteredClasses() {
        const { headers, accessToken } = getAuthHeaders(true);
        if (!accessToken) return [];
        try {
            const myRes = await fetch('/api/registration/my', { method: 'GET', headers }).then(r => r.json()).catch(() => null);
            if (myRes && myRes.is_success && Array.isArray(myRes.data)) {
                const myList = myRes.data;
                // Cập nhật luôn bảng của trang web gốc qua Redux Store (không cần F5)
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
                            const isDbConfirmed = item.trang_thai === 1;
                            setRowState(rowKey, {
                                statusType: 'success',
                                statusText: `✅ Đã đỗ: ${tenLop}`,
                                registeredClass: tenLop,
                                registeredClassId: cid,
                                subMessage: isDbConfirmed ? '💾 Đã xác nhận trong CSDL nhà trường' : '⏳ Đã giữ chỗ, đang chờ DB xác nhận'
                            });
                        }
                    });

                    if (matchedAny) {
                        const confirmedCount = myList.filter(x => x.trang_thai === 1).length;
                        summaryState.visible = true;
                        summaryState.mode = 'success';
                        summaryState.title = '🎯 CÁC MÔN ĐÃ ĐĂNG KÝ TRÊN HỆ THỐNG';
                        summaryState.detail = `Hệ thống ghi nhận bạn đã đăng ký <b>${myList.length}</b> môn học phần (${confirmedCount} môn đã ghi DB).`;
                        if (confirmedCount > 0) {
                            summaryState.saveStatusText = `💾 Đã ghi nhận ${confirmedCount} môn trong DB`;
                        }
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
                connMsgEl.innerHTML = `<span style="color:oklch(0.35 0.11 160);">🟢 Đã kết nối: <b>${name}</b> (Đợt ${periodId})</span>`;
                if (showMsg) {
                    const openStr = q.openAt ? q.openAt.replace('T', ' ') : '08:00:00';
                    showToast('Kết nối thành công!', `Sinh viên: ${name} • Giờ mở cổng: ${openStr}`, 'success', 3500);
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
        } catch (err) {
            connMsgEl.innerHTML = `<span style="color:var(--destructive);">🔴 Lỗi mạng</span>`;
        }
    }

    document.getElementById('aof-v4-btn-check').onclick = () => checkConnectionAndSync(true);
    document.getElementById('aof-btn-refresh-web').onclick = async () => {
        await syncMyRegisteredClasses();
        refreshHostWebTable();
        showToast('Đã đồng bộ bảng web (Không F5)', 'Bảng "Danh sách các lớp tín chỉ đã đăng ký" đã được cập nhật ngầm qua Redux!', 'success', 2500);
    };

    // Nút Lưu dữ liệu thủ công ngay trong bảng tổng kết
    document.getElementById('aof-btn-manual-save').onclick = async () => {
        const { headers } = getAuthHeaders(true);
        showToast('Đang gửi yêu cầu Lưu dữ liệu', 'Đang gọi API chốt dữ liệu đăng ký...', 'info', 2500);
        const chotRes = await fetch('/api/registration/chot-du-lieu', {
            method: 'POST',
            headers,
            body: JSON.stringify({})
        }).then(r => r.json()).catch(() => null);

        if (chotRes && chotRes.is_success) {
            summaryState.isSaved = true;
            summaryState.saveStatusText = '💾 ĐÃ LƯU DỮ LIỆU THÀNH CÔNG!';
            persistSessionStatus();
            renderSummary();
            playChime('all_done');
            showToast('Lưu dữ liệu thành công!', 'Toàn bộ tín chỉ đã được khóa sổ an toàn (không cần F5)!', 'success', 6000);
            sendBrowserNotification('🎉 Đã Lưu Dữ Liệu Tín Chỉ!', 'Toàn bộ các lớp học phần đã được chốt thành công.');
            refreshHostWebTable(null, chotRes.data);
        } else {
            const errMsg = chotRes?.message || 'Chưa có môn nào được ghi nhận hoặc cổng chưa mở';
            showToast('Chưa thể Lưu dữ liệu', errMsg, 'warn', 4500);
        }
    };

    // ==================== THUẬT TOÁN BẮN ĐĂNG KÝ & PHẢN HỒI TRỰC QUAN TỨC THÌ ====================
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
        if (httpStatus === 403) return 'Cổng chưa mở hoặc thiếu lượt hàng chờ (HTTP 403)';
        if (httpStatus === 400) return rawMsg || 'Yêu cầu bị từ chối - Cổng chưa mở (HTTP 400)';
        if (httpStatus === 429) return 'Quá giới hạn tốc độ (Đang đợi 429)';
        if (httpStatus === 401) return 'Hết phiên đăng nhập (HTTP 401)';
        return rawMsg || reasonCode || `Mã phản hồi HTTP ${httpStatus}`;
    }

    async function registerSubjectWithFallback(row, round, maxRounds) {
        for (let i = 0; i < row.classes.length; i++) {
            if (!isRunning) return { done: false };
            const cls = row.classes[i];
            const prioTag = row.classes.length > 1 ? ` (ƯT#${i + 1})` : '';

            setRowState(row.key, {
                statusType: 'pending',
                statusText: `⏳ Đang gửi${prioTag} (Vòng ${round}/${maxRounds})`,
                subMessage: `Đang bắn yêu cầu vào lớp ${cls.ten_lop_hp} (#${cls.classId})...`
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
                    statusText: `✅ ĐÃ ĐỖ: ${cls.ten_lop_hp}`,
                    registeredClass: cls.ten_lop_hp,
                    registeredClassId: cls.classId,
                    subMessage: `🎉 Giữ chỗ thành công lúc ${new Date().toLocaleTimeString('vi-VN')}!`
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
                    statusText: `✅ Đã ĐK: ${cls.ten_lop_hp}`,
                    registeredClass: cls.ten_lop_hp,
                    registeredClassId: cls.classId,
                    subMessage: `Học phần này đã được đăng ký thành công trên hệ thống.`
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
                        statusText: `⚡ ƯT#1 đầy → Sang ƯT#2`,
                        subMessage: `⚠️ Lớp ${cls.ten_lop_hp} (${friendlyMsg}) → Đang tự động nhảy sang ${nextCls.ten_lop_hp}!`
                    });
                    renderAll();
                    showToast(`Tự động nhảy lớp ƯT#2`, `${row.ten_mon}: ${cls.ten_lop_hp} hết chỗ, chuyển sang ${nextCls.ten_lop_hp}!`, 'warn', 4000);
                    continue;
                } else {
                    setRowState(row.key, {
                        statusType: 'error',
                        statusText: `❌ ${reasonCode === 'CLASS_FULL' ? 'Hết chỗ' : 'Bị chặn'}`,
                        subMessage: `⛔ Không thể đăng ký: ${friendlyMsg}`
                    });
                    renderAll();
                    return { done: true, success: false, reason: friendlyMsg };
                }
            }

            if (reasonCode === 'NHOM_TU_CHON_FULL') {
                setRowState(row.key, {
                    statusType: 'error',
                    statusText: `⛔ Đủ TC tự chọn`,
                    subMessage: `Bạn đã đăng ký đủ số tín chỉ tự chọn tối đa.`
                });
                renderAll();
                return { done: true, success: false, reason: friendlyMsg };
            }

            // TRƯỜNG HỢP 4: CỔNG CHƯA MỞ / CHỜ LƯỢT HÀNG CHỜ / 429 -> HIỂN THỊ RÕ LÝ DO & THỬ LẠI
            const shortBadge = httpStatus === 429
                ? `⏳ Đợi 429 (Vòng ${round}/${maxRounds})`
                : `⏳ Vòng ${round}/${maxRounds}: Chờ cổng`;

            setRowState(row.key, {
                statusType: 'pending',
                statusText: shortBadge,
                subMessage: `💬 Phản hồi máy chủ: "${friendlyMsg}"`
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

    async function runCampaign(isAutoTimed = false) {
        if (isRunning) return;
        isRunning = true;
        requestNotificationPermission();

        const targets = subjectRows.filter(r => r.enabled);
        if (targets.length === 0) {
            showToast('Chưa chọn môn học!', 'Hãy tích chọn ít nhất 1 môn học để đăng ký.', 'error');
            isRunning = false;
            return;
        }

        // Nếu bấm thủ công thì thử 4 vòng (nhanh gọn, báo kết quả ngay); nếu hẹn giờ 08:00:00 thì quét 14 vòng
        const maxRounds = isAutoTimed ? 14 : 4;

        // Bước 1: Đổi màu toàn bộ các dòng được chọn sang màu Vàng (Pending) ngay lập tức (0ms)
        targets.forEach(r => {
            if (getRowState(r.key).statusType !== 'success') {
                setRowState(r.key, {
                    statusType: 'pending',
                    statusText: `⏳ Đang gửi (Vòng 1/${maxRounds})...`,
                    subMessage: `Đang kết nối máy chủ HVTC...`
                });
            }
        });

        summaryState = {
            visible: true,
            mode: 'pending',
            title: `⏳ ĐANG THỰC THI ĐĂNG KÝ (VÒNG 1/${maxRounds})`,
            detail: `Đang bắn đồng loạt <b>${targets.length} môn</b> lên cổng đăng ký HVTC...`,
            saveStatusText: '💾 Trạng thái: Chờ hoàn tất để lưu dữ liệu',
            isSaved: false
        };
        renderAll();

        // Chỉ làm mới Queue Token, tuyệt đối KHÔNG ghi đè danh sách subjectRows
        const { qToken } = getAuthHeaders(true);
        if (!qToken) await refreshQueueTokenOnly();

        const finished = new Map();
        // Những môn đã đỗ từ trước thì đưa luôn vào finished
        targets.forEach(r => {
            if (getRowState(r.key).statusType === 'success') {
                finished.set(r.key, { done: true, success: true });
            }
        });

        let notifiedFirstRoundIssue = false;

        for (let round = 1; round <= maxRounds; round++) {
            if (!isRunning) break;
            const pending = targets.filter(r => !finished.has(r.key));
            if (pending.length === 0) break;

            summaryState.title = `⏳ ĐANG BẮN ĐĂNG KÝ (VÒNG ${round}/${maxRounds})`;
            renderSummary();

            let hit429 = false;
            let needQueue = false;
            let sampleMsg = '';

            await Promise.all(pending.map(async (row) => {
                const res = await registerSubjectWithFallback(row, round, maxRounds);
                if (res.done) {
                    finished.set(row.key, res);
                } else {
                    if (res.hitRateLimit) hit429 = true;
                    if (res.needQueue) needQueue = true;
                    if (res.lastMsg) sampleMsg = res.lastMsg;

                    if (round === maxRounds) {
                        setRowState(row.key, {
                            statusType: 'error',
                            statusText: `❌ Chưa ĐK được`,
                            subMessage: `⛔ Phản hồi cuối: "${res.lastMsg || 'Chưa đến thời gian đăng ký'}"`
                        });
                        finished.set(row.key, { done: true, success: false, reason: res.lastMsg });
                    }
                }
            }));

            renderAll();

            // Ngay sau Vòng 1, nếu chưa đỗ vì cổng chưa mở -> Bắn Toast báo ngay cho người dùng biết máy chủ trả về gì!
            if (round === 1 && !notifiedFirstRoundIssue && sampleMsg && finished.size === 0) {
                notifiedFirstRoundIssue = true;
                showToast(
                    `Phản hồi vòng 1/${maxRounds} từ HVTC`,
                    `Máy chủ báo: "${sampleMsg}" — Hệ thống đang tự động thử lại...`,
                    'warn',
                    4500
                );
                summaryState.detail = `⚠️ Máy chủ phản hồi: <b>"${sampleMsg}"</b> — Đang tự động thử lại vòng tiếp theo...`;
                renderSummary();
            }

            if (finished.size >= targets.length || !isRunning) break;
            if (needQueue) await refreshQueueTokenOnly();

            await new Promise(r => setTimeout(r, hit429 ? 3200 : 1200));
        }

        const okCount = targets.filter(r => getRowState(r.key).statusType === 'success').length;

        // Nếu có ít nhất 1 môn đỗ -> Chờ DB xác nhận & Tự động bấm Lưu dữ liệu
        if (okCount > 0 && isRunning) {
            if (document.getElementById('aof-v4-autosave').checked) {
                summaryState.mode = 'pending';
                summaryState.title = `⏳ ĐANG LƯU DỮ LIỆU (${okCount}/${targets.length} MÔN ĐÃ ĐỖ)`;
                summaryState.detail = `Đã giữ chỗ thành công <b>${okCount}/${targets.length} môn</b>! Đang chờ Database xác nhận để khóa sổ...`;
                summaryState.saveStatusText = '⏳ Đang chờ Worker ghi vào Database...';
                renderAll();

                const { headers } = getAuthHeaders(true);
                for (let w = 0; w < 12; w++) {
                    await new Promise(r => setTimeout(r, 1100));
                    const myList = await syncMyRegisteredClasses();
                    if (myList.filter(x => x.trang_thai === 1).length >= okCount) break;
                }

                const chotRes = await fetch('/api/registration/chot-du-lieu', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({})
                }).then(r => r.json()).catch(() => null);

                if (chotRes && chotRes.is_success) {
                    summaryState.mode = 'success';
                    summaryState.title = `🎉 HOÀN TẤT ĐĂNG KÝ (${okCount}/${targets.length} MÔN)`;
                    summaryState.detail = `Tuyệt vời! Đã đăng ký và <b>Lưu dữ liệu đăng ký</b> thành công <b>${okCount}/${targets.length} môn</b>!`;
                    summaryState.saveStatusText = '💾 ĐÃ LƯU DỮ LIỆU AN TOÀN!';
                    summaryState.isSaved = true;
                    persistSessionStatus();
                    renderAll();
                    playChime('all_done');
                    showToast('HOÀN TẤT ĐĂNG KÝ & LƯU DỮ LIỆU!', `Đã khóa sổ thành công ${okCount}/${targets.length} môn học!`, 'success', 8000);
                    sendBrowserNotification('🎉 Đăng Ký Tín Chỉ Thành Công!', `Đã đăng ký và lưu dữ liệu ${okCount}/${targets.length} môn.`);
                    refreshHostWebTable(null, chotRes.data);
                } else {
                    summaryState.mode = 'success';
                    summaryState.title = `✅ ĐÃ GIỮ CHỖ ${okCount}/${targets.length} MÔN`;
                    summaryState.detail = `Đã đỗ ${okCount}/${targets.length} môn! Hãy bấm nút <b>"💾 Lưu dữ liệu ngay"</b> bên dưới hoặc nút màu xanh trên web.`;
                    summaryState.saveStatusText = '⚠️ Cần bấm Lưu dữ liệu!';
                    persistSessionStatus();
                    renderAll();
                    playChime('all_done');
                    showToast(`Đã đỗ ${okCount}/${targets.length} môn!`, 'Hãy bấm nút "Lưu dữ liệu đăng ký" để chốt sổ.', 'warn', 7000);
                    refreshHostWebTable();
                }
            } else {
                summaryState.mode = 'success';
                summaryState.title = `✅ ĐÃ ĐĂNG KÝ ${okCount}/${targets.length} MÔN`;
                summaryState.detail = `Đã giữ chỗ thành công <b>${okCount}/${targets.length} môn</b>. Nhớ bấm "Lưu dữ liệu" để chốt!`;
                persistSessionStatus();
                renderAll();
                playChime('all_done');
                refreshHostWebTable();
            }
        } else if (isRunning) {
            // Không đỗ môn nào (Ví dụ: bấm thử nghiệm khi chưa tới giờ mở cổng)
            const sampleReason = Array.from(finished.values())[0]?.reason || 'Chưa đến thời gian mở cổng đăng ký (08:00:00 11/11/2026)';
            summaryState.mode = 'error';
            summaryState.title = `❌ CHƯA ĐĂNG KÝ ĐƯỢC (0/${targets.length} MÔN)`;
            summaryState.detail = `Lý do từ máy chủ HVTC: <b>"${sampleReason}"</b>`;
            summaryState.saveStatusText = '💾 Chưa có dữ liệu mới để lưu';
            persistSessionStatus();
            renderAll();
            playChime('error');
            showToast('Chưa đăng ký được môn nào', `Phản hồi từ trường: "${sampleReason}"`, 'error', 6000);
            sendBrowserNotification('⚠️ Chưa đăng ký được tín chỉ', `Lý do: ${sampleReason}`);
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
        summaryState.title = `⏰ ĐANG HẸN GIỜ TỰ ĐỘNG (${targetTime})`;
        summaryState.detail = `Tool sẽ tự động lấy Queue Token và bắn đồng loạt lúc <b>${targetTime}</b>. Hãy giữ nguyên tab này!`;
        renderAll();

        showToast('Đã bật chế độ Canh Giờ!', `Đúng ${targetTime} tool sẽ tự động đăng ký & lưu dữ liệu.`, 'info', 4000);

        armTimer = setInterval(() => {
            if (!isArmed) return;
            const nowStr = new Date().toTimeString().split(' ')[0];
            if (nowStr >= targetTime) {
                clearInterval(armTimer);
                isArmed = false;
                btn.textContent = `🚀 Bật Canh Giờ (${targetTime})`;
                btn.style.background = '';
                btn.style.color = '';
                setTimeout(() => runCampaign(true), 80);
            }
        }, 100);
    };

    // Nút Đăng Ký Ngay
    document.getElementById('aof-v4-fire').onclick = () => {
        isArmed = false;
        if (armTimer) clearInterval(armTimer);
        const btn = document.getElementById('aof-v4-arm');
        btn.textContent = `🚀 Bật Canh Giờ (${document.getElementById('aof-v4-time').value.trim()})`;
        btn.style.background = '';
        btn.style.color = '';
        runCampaign(false);
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

        summaryState.visible = true;
        summaryState.mode = 'error';
        summaryState.title = '🛑 ĐÃ DỪNG TÁC VỤ';
        summaryState.detail = 'Bạn đã chủ động dừng quá trình đăng ký tự động.';
        renderAll();
        showToast('Đã dừng tác vụ', 'Mọi tiến trình tự động đã được ngắt.', 'warn', 3000);
    };

    // Khởi tạo giao diện lần đầu
    buildGroupSubjects();
    setTimeout(() => checkConnectionAndSync(false), 400);
})();
