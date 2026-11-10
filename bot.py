#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AOF Register Tool v2.0 - Tool Đăng Ký Tín Chỉ HVTC Tự Động
Học viện Tài Chính (https://congdangky.hvtc.edu.vn)
Đã thẩm định 100% qua Source Map gốc của hệ thống:
- Hỗ trợ OAuth2 + PKCE Login
- Tự động chờ & lấy X-Queue-Token từ /api/queue/status
- Kiểm tra ràng buộc Khóa Nhóm Lớp (is_lock_nhom_lop) & Nhóm Tự Chọn (nhom_tu_chon)
- Đợi Background Worker (MassTransit/RabbitMQ) ghi DB (trang_thai == 1) trước khi gọi ChotDuLieu
"""

import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import json
import re
import time
import datetime
import hashlib
import base64
import secrets
import sys
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

class AOFRegistrationBot:
    def __init__(self, config_path="config.json"):
        self.config_path = config_path
        self.load_config()
        self.cj = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cj))
        self.token = None
        self.queue_token = None

    def load_config(self):
        if not os.path.exists(self.config_path):
            sample_config = {
                "username": "YOUR_STUDENT_ID",
                "password": "YOUR_PASSWORD_HERE",
                "period_id": 55,
                "target_class_ids": [87315, 87317, 87305, 87319, 87309, 87307, 87311],
                "auto_chot_du_lieu": True,
                "target_time": "07:59:59"
            }
            with open(self.config_path, "w", encoding="utf-8") as f:
                json.dump(sample_config, f, ensure_ascii=False, indent=2)
            print(f"[!] Đã tạo file mẫu {self.config_path}!")
        with open(self.config_path, "r", encoding="utf-8") as f:
            self.config = json.load(f)

    def _gen_pkce(self):
        code_verifier = secrets.token_urlsafe(64)
        digest = hashlib.sha256(code_verifier.encode('ascii')).digest()
        code_challenge = base64.urlsafe_b64encode(digest).decode('ascii').replace('=', '')
        state = secrets.token_urlsafe(32)
        return code_verifier, code_challenge, state

    def login(self):
        print(f"[*] Đang đăng nhập SSO cho tài khoản: {self.config['username']}...")
        code_verifier, code_challenge, state = self._gen_pkce()

        auth_url = (
            'https://sso.hvtc.edu.vn/oauth2/authorize?'
            'response_type=code&'
            'client_id=congdangky.hvtc.edu.vn&'
            'redirect_uri=https%3A%2F%2Fcongdangky.hvtc.edu.vn%2Fsignin-oidc&'
            'scope=openid%20profile%20email&'
            f'state={state}&'
            f'code_challenge={code_challenge}&'
            'code_challenge_method=S256'
        )

        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(auth_url, headers=headers)
        resp = self.opener.open(req)
        html = resp.read().decode('utf-8', errors='ignore')

        sdk_m = re.search(r'name=[\"\']sessionDataKey[\"\']\s+value=[\"\']([^\"\']+)[\"\']', html)
        if not sdk_m:
            raise Exception("Không tìm thấy sessionDataKey trên SSO login page!")
        session_data_key = sdk_m.group(1)

        login_data = urllib.parse.urlencode({
            'usernameUserInput': self.config['username'],
            'username': self.config['username'],
            'password': self.config['password'],
            'sessionDataKey': session_data_key
        }).encode('utf-8')

        login_req = urllib.request.Request(
            'https://sso.hvtc.edu.vn/commonauth',
            data=login_data,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': resp.geturl()
            }
        )

        resp_login = self.opener.open(login_req)
        final_url = resp_login.geturl()
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(final_url).query)
        code = qs.get('code', [None])[0]
        session_state = qs.get('session_state', [None])[0]
        ret_state = qs.get('state', [None])[0]

        if not code:
            raise Exception("Đăng nhập thất bại! Kiểm tra lại tài khoản hoặc mật khẩu trong config.json.")

        payload = json.dumps({
            'code': code,
            'code_verifier': code_verifier,
            'redirect_uri': 'https://congdangky.hvtc.edu.vn/signin-oidc',
            'state': ret_state,
            'session_state': session_state
        }).encode('utf-8')

        api_req = urllib.request.Request(
            'https://congdangky.hvtc.edu.vn/api/auth/login-vnpt',
            data=payload,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Content-Type': 'application/json'
            }
        )

        with self.opener.open(api_req) as api_resp:
            res_json = json.loads(api_resp.read().decode('utf-8'))
            if not res_json.get('is_success'):
                raise Exception(f"Lỗi lấy access token: {res_json.get('message')}")
            self.token = res_json['data']['access_token']
            user = res_json['data']['user']
            print(f"[+] Đăng nhập thành công! Sinh viên: {user.get('ho_ten')}")
            return self.token

    def _api_request(self, endpoint, method="GET", payload=None):
        url = f"https://congdangky.hvtc.edu.vn/api/{endpoint}"
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Authorization': f'Bearer {self.token}',
            'X-Period-Id': str(self.config['period_id']),
            'Content-Type': 'application/json'
        }
        if self.queue_token:
            headers['X-Queue-Token'] = self.queue_token

        data = json.dumps(payload).encode('utf-8') if payload is not None else None
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8', errors='ignore')
            try:
                parsed = json.loads(err_body)
                parsed['status_code'] = e.code
                return parsed
            except:
                return {"is_success": False, "status_code": e.code, "message": err_body}
        except Exception as e:
            return {"is_success": False, "status_code": 500, "message": str(e)}

    def check_queue(self):
        res = self._api_request("queue/status")
        if res.get("is_success") and res.get("data"):
            d = res["data"]
            if d.get("token"):
                self.queue_token = d["token"]
            return d
        return None

    def list_classes(self):
        res = self._api_request("registration/classes")
        if res.get("is_success"):
            return res.get("data", [])
        return []

    def get_my_registrations(self):
        res = self._api_request("registration/my")
        if res.get("is_success") and isinstance(res.get("data"), list):
            return res["data"]
        return []

    def register_class(self, class_id):
        return self._api_request("registration", method="POST", payload={"classId": int(class_id)})

    def chot_du_lieu(self):
        print("[*] Đang gửi yêu cầu 'Chốt dữ liệu / Lưu dữ liệu' (POST /api/registration/chot-du-lieu)...")
        return self._api_request("registration/chot-du-lieu", method="POST", payload={})

    def validate_selection(self, target_ids):
        """Kiểm tra trước xem danh sách classId có vi phạm Khóa nhóm lớp, Tự chọn hay Trùng môn không"""
        classes = self.list_classes()
        if not classes:
            return
        cmap = {c['classId']: c for c in classes}
        selected = [cmap[cid] for cid in target_ids if cid in cmap]

        print("\n=== KIỂM TRA TÍNH HỢP LỆ CỦA DANH SÁCH LỚP ĐÃ CHỌN ===")
        nhom_lops = set()
        mons = set()
        tu_chon_tc = 0.0

        for c in selected:
            nhom = c.get('stu_nhomlop_ids')
            nhom_str = "Nhóm 1 (CQ62.02.1)" if nhom == 8013 else ("Nhóm 2 (CQ62.02.2)" if nhom == 8014 else str(nhom))
            print(f" - [{c['classId']}] {c['ten_mon']} ({c['ten_lop_hp']}) | {nhom_str} | TC: {c['so_tin_chi']}")
            if c.get('is_lock_nhom_lop') and nhom:
                nhom_lops.add(nhom)
            if c['id_mon'] in mons:
                print(f"   [CẢNH BÁO ĐỎ] Trùng môn học: {c['ten_mon']} (id_mon={c['id_mon']})!")
            mons.add(c['id_mon'])
            if c.get('nhom_tu_chon', 0) > 0:
                tu_chon_tc += c.get('so_tin_chi', 0)

        if len(nhom_lops) > 1:
            print(" [❌ NGUY HIỂM] Bạn đang chọn lẫn lộn giữa Nhóm 1 (8013) và Nhóm 2 (8014)!")
            print("   Đợt này bật cờ is_lock_nhom_lop=True: Hệ thống CHỈ cho phép đăng ký tất cả các môn trong CÙNG 1 NHÓM LỚP!")
        else:
            print(" [✅ OK] Tất cả các lớp đều thuộc cùng 1 nhóm lớp hợp lệ.")

        if tu_chon_tc > 2.0:
            print(f" [❌ NGUY HIỂM] Nhóm tự chọn vượt quá giới hạn: {tu_chon_tc}/2.0 tín chỉ (Chỉ được chọn CAC0084 hoặc CVA0243)!")
        else:
            print(f" [✅ OK] Tín chỉ tự chọn hợp lệ ({tu_chon_tc}/2.0 TC).")
        print("========================================================\n")

    def run_auto(self):
        self.login()
        target_ids = [int(x) for x in self.config.get("target_class_ids", [])]
        if not target_ids:
            print("[!] Danh sách target_class_ids trống! Hãy cập nhật file config.json.")
            return

        self.validate_selection(target_ids)

        target_time_str = self.config.get("target_time", "07:59:59")
        print(f"[*] Hẹn giờ kích hoạt: {target_time_str}. Đang theo dõi hàng chờ...")

        while True:
            q = self.check_queue()
            now = datetime.datetime.now()
            now_str = now.strftime("%H:%M:%S")

            if q:
                in_q = q.get("inQueue")
                has_acc = q.get("hasAccess")
                pos = q.get("position", 0)
                print(f"[{now_str}] Hàng chờ: inQueue={in_q}, hasAccess={has_acc}, pos={pos}, queue_token={bool(self.queue_token)}")

            target_parts = [int(p) for p in target_time_str.split(":")]
            target_dt = now.replace(hour=target_parts[0], minute=target_parts[1], second=target_parts[2], microsecond=0)
            diff = (target_dt - now).total_seconds()

            if diff <= 1.5:
                print(f"\n[⚡] ĐÃ TỚI GIỜ ({now_str})! BẮT ĐẦU VƯỢT HÀNG CHỜ & BẮN ĐĂNG KÝ...")
                break
            elif diff > 30:
                time.sleep(15)
            else:
                time.sleep(0.5)

        # Bước 1: Đảm bảo lấy được X-Queue-Token khi cổng mở
        for _ in range(120):
            if self.queue_token:
                break
            q = self.check_queue()
            if self.queue_token or (q and q.get("hasAccess")):
                print("[+] Đã có quyền truy cập / X-Queue-Token!")
                break
            time.sleep(0.5)

        # Bước 2: Bắn đăng ký song song bằng ThreadPoolExecutor
        registered_pending = set()
        for attempt in range(1, 30):
            remaining = [cid for cid in target_ids if cid not in registered_pending]
            if not remaining:
                break

            with ThreadPoolExecutor(max_workers=len(remaining)) as executor:
                future_to_cid = {executor.submit(self.register_class, cid): cid for cid in remaining}
                for future in as_completed(future_to_cid):
                    cid = future_to_cid[future]
                    res = future.result()
                    ts = datetime.datetime.now().strftime('%H:%M:%S.%f')[:-3]
                    if res.get("is_success"):
                        registered_pending.add(cid)
                        print(f"[{ts}] [✅ OK] Lớp {cid}: Giữ chỗ thành công (Pending DB confirm)!")
                    else:
                        reason = (res.get("data") or {}).get("reasonCode") or res.get("message") or res.get("status_code")
                        print(f"[{ts}] [⚠️] Lớp {cid}: {reason}")
                        if reason == "ALREADY_REGISTERED":
                            registered_pending.add(cid)
                        elif reason == "NOT_YOUR_TURN" or res.get("status_code") == 403:
                            self.check_queue()
                        elif res.get("status_code") == 429:
                            time.sleep(1.2)

            if len(registered_pending) < len(target_ids):
                time.sleep(0.5)

        # Bước 3: Đợi Background Worker ghi vào Database (trang_thai == 1) trước khi gọi Chốt dữ liệu
        if self.config.get("auto_chot_du_lieu", True) and registered_pending:
            print("\n[*] Đang đợi Background Worker xác nhận vào DB trước khi Chốt dữ liệu...")
            for _ in range(25):
                time.sleep(1.2)
                my_list = self.get_my_registrations()
                confirmed_ids = {int(r["id_lop_tc"]) for r in my_list if r.get("trang_thai") == 1}
                done_count = len(registered_pending.intersection(confirmed_ids))
                print(f" -> DB đã xác nhận: {done_count}/{len(registered_pending)} lớp.")
                if done_count >= len(registered_pending):
                    break

            res_chot = self.chot_du_lieu()
            if res_chot.get("is_success"):
                print(f"[🎉] CHỐT DỮ LIỆU THÀNH CÔNG! Các lớp đã khóa an toàn: {res_chot.get('data')}")
            else:
                print(f"[❌] Lỗi chốt dữ liệu: {res_chot.get('message')}")

if __name__ == "__main__":
    bot = AOFRegistrationBot()
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        bot.login()
        classes = bot.list_classes()
        print(f"\n{'='*85}")
        print(f"DANH SÁCH {len(classes)} LỚP HỌC PHẦN CÓ THỂ ĐĂNG KÝ:")
        print(f"{'='*85}")
        for c in classes:
            nhom = "Nhóm 1" if c.get('stu_nhomlop_ids') == 8013 else "Nhóm 2"
            tc_tag = f"Tự chọn ({c.get('so_tin_chi_tu_chon')}TC)" if c.get('nhom_tu_chon') else "Bắt buộc"
            tkb = ', '.join([f'T{t.get(\"thu\")+2 if t.get(\"thu\")<8 else \"CN\"} Tiết {t.get(\"tiet\")+1}-{t.get(\"tiet\")+t.get(\"so_tiet\")}' for t in c.get('thoiKhoaBieus', [])])
            print(f"ID: {c.get('classId'):<6} | {nhom} | {tc_tag:<14} | {c.get('ten_mon'):<25} | {c.get('ten_lop_hp'):<22} | {tkb}")
    elif len(sys.argv) > 1 and sys.argv[1] == "--run":
        bot.run_auto()
    else:
        print("Cách dùng:")
        print("  python3 bot.py --list   : Xem danh sách lớp, nhóm lớp và thời khóa biểu chuẩn")
        print("  python3 bot.py --run    : Chạy tự động đăng ký theo config.json")
