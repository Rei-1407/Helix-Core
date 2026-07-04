# Hướng dẫn sử dụng Helix Core cho Studio Game (Unreal Engine)

> Tài liệu đào tạo nội bộ — dành cho mọi vai trò trong studio: lập trình viên, artist/designer, tech lead/build engineer, producer và admin.

---

## Mục lục

1. [Helix Core là gì và tại sao game studio dùng nó](#1-helix-core-la-gi)
2. [Các thành phần trong hệ sinh thái Helix](#2-cac-thanh-phan)
3. [Khái niệm cốt lõi (bắt buộc nắm)](#3-khai-niem-cot-loi)
4. [Cài đặt và kết nối lần đầu](#4-cai-dat-va-ket-noi)
5. [Tạo và cấu hình Workspace](#5-tao-workspace)
6. [Cấu hình bắt buộc cho dự án Unreal Engine](#6-cau-hinh-cho-ue)
7. [Workflow hàng ngày (P4V)](#7-workflow-hang-ngay)
8. [Resolve — xử lý conflict](#8-resolve)
9. [Shelve — gửi tạm thay đổi](#9-shelve)
10. [Tích hợp trực tiếp trong Unreal Editor](#10-tich-hop-ue-editor)
11. [UnrealGameSync (UGS)](#11-ugs)
12. [Streams & chiến lược branching](#12-streams-branching)
13. [Hướng dẫn theo từng vai trò](#13-theo-vai-tro)
14. [Best practices](#14-best-practices)
15. [Xử lý sự cố thường gặp](#15-xu-ly-su-co)
16. [Tham khảo lệnh p4 (CLI)](#16-cli)
17. [Bảng thuật ngữ](#17-thuat-ngu)

---

<a name="1-helix-core-la-gi"></a>
## 1. Helix Core là gì và tại sao game studio dùng nó

**Helix Core** (tên cũ: Perforce) là hệ thống quản lý phiên bản (version control) tập trung (centralized), do hãng Perforce phát triển. Toàn bộ lịch sử file nằm trên một **server trung tâm**; mỗi máy chỉ giữ bản sao làm việc (workspace) của các file cần thiết.

### Vì sao game studio chọn Perforce thay vì Git?

| Tiêu chí | Git | Helix Core |
|---|---|---|
| Mô hình | Phân tán (mỗi máy có full history) | Tập trung (history ở server) |
| File nhị phân lớn (.uasset, .fbx, texture) | Yếu — repo phình to, merge không được | Mạnh — sinh ra để xử lý binary lớn |
| Khóa độc quyền file (exclusive lock) | Không có (cần Git LFS lock, hạn chế) | Native, ổn định |
| Dung lượng project hàng trăm GB | Rất khó | Bình thường |
| Người không rành kỹ thuật (artist) | Khó | Dễ (P4V trực quan) |
| Tích hợp Unreal Engine | Có | Tốt nhất, là chuẩn ngành |

**Lý do then chốt:** Game dev có rất nhiều file **nhị phân không merge được** (asset Unreal, model 3D, texture, audio). Hai người sửa cùng một `.uasset` thì không có cách "trộn" tự động như code. Perforce giải quyết bằng **exclusive lock** — chỉ một người được check out file đó tại một thời điểm. Đây là điều Git không làm tốt.

Đây cũng là lý do Epic Games dùng Perforce nội bộ và Unreal Engine có sẵn tích hợp Perforce trong editor.

---

<a name="2-cac-thanh-phan"></a>
## 2. Các thành phần trong hệ sinh thái Helix

| Thành phần | Vai trò | Ai dùng |
|---|---|---|
| **Helix Core Server (`p4d`)** | Server lưu depot, history, quản lý quyền | Admin cài/quản lý |
| **P4V (Helix Visual Client)** | App GUI để thao tác hàng ngày | Mọi người |
| **`p4` / `p4.exe` (CLI)** | Dòng lệnh, dùng script/CI | Programmer, build engineer |
| **`p4admin`** | Công cụ quản trị (user, group, quyền) | Admin |
| **Helix Swarm** | Code review, duyệt changelist qua web | Programmer, tech lead |
| **UnrealGameSync (UGS)** | Tool của Epic: sync + tải binary biên dịch sẵn | Cả team UE |
| **P4VS / P4Eclipse / P4 plugin IDE** | Tích hợp version control vào IDE | Programmer |

> Trong thực tế studio: **artist/designer dùng P4V**, **programmer dùng P4V + CLI + UGS**, **admin dùng p4admin + CLI**.

---

<a name="3-khai-niem-cot-loi"></a>
## 3. Khái niệm cốt lõi (bắt buộc nắm)

### 3.1. Depot (kho)
Nơi server lưu trữ file và toàn bộ lịch sử. Đường dẫn depot bắt đầu bằng `//`, ví dụ `//GameDepot/Main/...`. Có nhiều loại depot, quan trọng nhất là:
- **Stream depot**: hiện đại, quản lý branching bằng "streams" (khuyến nghị cho project mới).
- **Classic/local depot**: truyền thống, branching thủ công.

### 3.2. Workspace (còn gọi là Client)
Là **bản đồ ánh xạ** giữa file trên server (depot) và thư mục trên máy bạn, cộng với chính các file copy về máy. Mỗi máy/người nên có workspace riêng. Workspace định nghĩa:
- **Root**: thư mục gốc trên ổ cứng (vd `D:\Projects\MyGame`).
- **View/Mapping**: phần nào của depot được map xuống máy.

> Quy tắc vàng: **1 người + 1 máy = 1 workspace**. Không dùng chung workspace giữa nhiều máy.

### 3.3. Changelist (CL)
Đơn vị thay đổi của Perforce — một nhóm file được submit **cùng lúc, nguyên tử (atomic)**. Nếu submit lỗi, toàn bộ CL không được ghi (all-or-nothing).
- **Pending changelist**: đang sửa, chưa gửi lên server.
- **Default changelist**: changelist mặc định nếu bạn không tạo CL riêng.
- **Submitted changelist**: đã gửi lên server, có một số CL number duy nhất (vd CL 1245).
- **Shelved changelist**: để tạm trên server, chưa submit (xem mục 9).

### 3.4. Revision & Head revision
Mỗi lần file được submit tạo một **revision** mới: `file.uasset#3` = bản số 3. **Head revision** là bản mới nhất trên server. **Have revision** là bản bạn đang có trên máy.

### 3.5. File type & Typemap (CỰC KỲ QUAN TRỌNG cho UE)
Perforce gắn "type" cho mỗi file để biết cách lưu trữ và xử lý:
- `text`: file văn bản (code, .ini) — có thể merge.
- `binary`: file nhị phân — lưu nguyên khối.
- Cờ bổ sung:
  - `+l` = **exclusive lock**: chỉ 1 người check out được tại một thời điểm. **Bắt buộc cho `.uasset`, `.umap`.**
  - `+w` = always writable trên đĩa.
  - `+S` = chỉ giữ N bản gần nhất (tiết kiệm dung lượng).

**Typemap** là bảng cấu hình toàn server quyết định file nào nhận type gì theo phần mở rộng. Đây là thứ phải cấu hình ngay khi dựng server cho UE (xem mục 6).

### 3.6. Sync / Get latest
Tải bản mới nhất từ server về workspace. Đồng nghĩa với "cập nhật code/asset mới của team".

### 3.7. Check out (Open for edit)
Báo cho server biết bạn sắp sửa file. Với file `+l`, hành động này **khóa file**, người khác không sửa được cho tới khi bạn submit/revert.

### 3.8. Submit
Gửi changelist lên server, tạo revision mới cho mọi người.

### 3.9. Revert
Hủy thay đổi cục bộ, đưa file về bản đang có trên server, và **mở khóa** nếu đang lock.

### 3.10. Resolve
Hòa giải khi file của bạn xung đột với bản mới trên server (thường với file text/code).

---

<a name="4-cai-dat-va-ket-noi"></a>
## 4. Cài đặt và kết nối lần đầu

### 4.1. Cài P4V
1. Tải **Helix Visual Client (P4V)** từ trang Perforce (`perforce.com/downloads`).
2. Cài đặt (gói thường gồm P4V, p4 CLI, P4Admin, P4Merge).
3. Mở P4V.

### 4.2. Thông tin cần xin từ admin
Để kết nối, bạn cần 3 thông tin:
- **Server (P4PORT)**: dạng `ssl:perforce.studio.com:1666` hoặc `192.168.1.10:1666`.
- **User**: tên đăng nhập Perforce của bạn.
- **Password**: (nếu server bật xác thực).

### 4.3. Kết nối trong P4V
1. Mở P4V → cửa sổ **Open Connection**.
2. Điền **Server**, **User**.
3. Nhấn **OK**, nhập mật khẩu nếu được hỏi.
4. Bước tiếp theo P4V sẽ hỏi tạo/chọn **Workspace** (xem mục 5).

> **Lưu ý SSL**: nếu server dùng `ssl:`, lần đầu kết nối sẽ hỏi tin cậy fingerprint → chọn **Trust**.

### 4.4. Kết nối bằng CLI (cho programmer)
```bash
# Đặt biến môi trường (hoặc dùng file p4config)
set P4PORT=ssl:perforce.studio.com:1666
set P4USER=long
set P4CLIENT=long_mygame_ws

p4 login            # đăng nhập (nhập password)
p4 info             # kiểm tra kết nối + thông tin server
```

---

<a name="5-tao-workspace"></a>
## 5. Tạo và cấu hình Workspace

### 5.1. Tạo workspace trong P4V
1. Menu **Connection → New Workspace** (hoặc khi kết nối lần đầu).
2. **Workspace name**: đặt tên rõ ràng, vd `long_mygame_win`. Quy ước gợi ý: `<user>_<project>_<máy/os>`.
3. **Root**: chọn thư mục gốc trên ổ, vd `D:\Perforce\MyGame`. Nên để ổ SSD trống nhiều (project UE rất nặng).
4. **Stream / View**:
   - Nếu dùng **stream depot**: chọn stream, vd `//GameDepot/Main`.
   - Nếu dùng **classic depot**: cấu hình view mapping thủ công.
5. Nhấn **OK / Save**.

### 5.2. View mapping (cho classic depot)
View quyết định phần nào của depot map xuống máy. Ví dụ chỉ lấy project, bỏ thư mục tạm:
```
//GameDepot/Main/...   //long_mygame_win/...
-//GameDepot/Main/Saved/...        //long_mygame_win/Saved/...
-//GameDepot/Main/Intermediate/... //long_mygame_win/Intermediate/...
```
Dòng bắt đầu bằng `-` là **loại trừ** (không sync về). Tuy nhiên cách tốt hơn để loại trừ file UE là dùng **`.p4ignore`** (mục 6).

### 5.3. Sau khi tạo workspace
Chạy **Get Latest Revision** trên thư mục gốc để tải toàn bộ project về lần đầu. Lần đầu này có thể mất nhiều thời gian (project UE có thể vài chục GB).

---

<a name="6-cau-hinh-cho-ue"></a>
## 6. Cấu hình bắt buộc cho dự án Unreal Engine

Đây là phần **quan trọng nhất** và thường bị làm sai. Cấu hình sai → asset không bị khóa → 2 artist ghi đè nhau, hoặc repo phình to vì version file rác.

### 6.1. Typemap cho Unreal (admin/tech lead làm 1 lần cho cả server)

Mục tiêu: file asset Unreal phải là `binary+l` (lock độc quyền), code là `text`, file biên dịch là `binary+w`.

Chạy `p4 typemap` (mở editor) và dán bảng sau:

```
TypeMap:
	binary+l //....uasset
	binary+l //....umap
	binary+l //....upk
	binary+l //....udk
	binary+l //....ubulk
	binary+l //....uexp
	binary+l //....uptnl
	text //....cpp
	text //....h
	text //....c
	text //....cs
	text //....inl
	text //....ini
	text //....config
	text //....uproject
	text //....uplugin
	text //....py
	text //....xml
	text //....json
	binary //....png
	binary //....tga
	binary //....jpg
	binary //....bmp
	binary //....fbx
	binary //....wav
	binary //....mp3
	binary+w //....exe
	binary+w //....dll
	binary+w //....lib
	binary+w //....pdb
	binary+w //....dylib
	binary+w //....app
```

> `+l` trên `.uasset`/`.umap` là **lý do then chốt** dùng Perforce. Đừng quên.

### 6.2. File `.p4ignore` (loại trừ file rác của UE)

Tạo file tên `.p4ignore` ở thư mục gốc project và set biến môi trường `P4IGNORE=.p4ignore`.

```gitignore
# === Unreal Engine: KHÔNG version các thư mục sinh tự động ===
Binaries/
Build/
DerivedDataCache/
Intermediate/
Saved/
Script/

# IDE
.vs/
.vscode/
.idea/
*.sln
*.sdf
*.opensdf
*.suo
*.xcodeproj
*.xcworkspace
*.VC.db
*.VC.opendb

# File tạm
*.tmp
*.log
*~

# === Những thứ PHẢI version (không ignore): ===
# Config/   -> file cấu hình project
# Content/  -> toàn bộ asset .uasset/.umap
# Source/   -> code C++
# Plugins/  -> plugin (trừ Binaries/Intermediate bên trong)
# *.uproject
```

> **Lưu ý về `Binaries/`**: nếu team dùng **UnrealGameSync** (mục 11), KHÔNG version `Binaries/` — UGS sẽ phát binary biên dịch sẵn. Nếu team có nhiều người **không cài Visual Studio** (artist) và không dùng UGS, đôi khi build engineer sẽ version một bộ binary đã build để họ chạy editor được. Hãy thống nhất với tech lead.

### 6.3. Đặt biến môi trường P4IGNORE (toàn máy)
```bash
# Windows
p4 set P4IGNORE=.p4ignore

# Kiểm tra
p4 set
```

### 6.4. Cấu trúc thư mục project nên version

```
MyGame/
├── Config/            ✅ version
├── Content/           ✅ version (asset, .uasset, .umap)
├── Source/            ✅ version (C++)
├── Plugins/           ✅ version (trừ Binaries/Intermediate trong plugin)
├── MyGame.uproject    ✅ version
├── Binaries/          ❌ ignore (hoặc do UGS quản lý)
├── Intermediate/      ❌ ignore
├── Saved/             ❌ ignore
└── DerivedDataCache/  ❌ ignore
```

---

<a name="7-workflow-hang-ngay"></a>
## 7. Workflow hàng ngày (P4V)

Đây là vòng lặp công việc mỗi ngày của **mọi vai trò**.

### 7.1. Đầu ngày: Get Latest (Sync)
Luôn lấy bản mới nhất trước khi bắt đầu làm.
- P4V: chuột phải thư mục gốc → **Get Latest Revision**.
- CLI: `p4 sync`

> **Đối với artist:** sync trước khi mở Unreal Editor để tránh làm việc trên asset cũ.

### 7.2. Check out file để sửa (Open for edit)
Trước khi sửa, phải check out.
- P4V: chọn file → chuột phải → **Check Out** (hoặc **Mark for Edit**).
- CLI: `p4 edit Content/Hero/BP_Hero.uasset`
- Với file `+l`: lúc này file bị **khóa**, người khác không check out được.

> Trong Unreal Editor, khi bạn bắt đầu sửa một asset, editor có thể tự động check out (xem mục 10).

### 7.3. Thêm file mới (Add / Mark for Add)
- P4V: kéo file vào workspace rồi chuột phải → **Mark for Add**; hoặc P4V tự phát hiện file mới qua **Reconcile**.
- CLI: `p4 add Content/NewAsset.uasset`

### 7.4. Xóa / Đổi tên / Di chuyển
- Xóa: chuột phải → **Mark for Delete** (`p4 delete`).
- Đổi tên/di chuyển: dùng **Rename/Move** trong P4V (`p4 move`) — KHÔNG xóa-rồi-thêm thủ công vì sẽ mất lịch sử.

> **Cảnh báo UE:** đừng đổi tên/di chuyển asset Unreal bằng Windows Explorer hay P4V. Hãy làm **trong Content Browser của Unreal** để engine cập nhật reference, sau đó submit. Move thủ công sẽ làm hỏng reference.

### 7.5. Reconcile (đối soát work offline)
Nếu bạn lỡ sửa/thêm/xóa file mà chưa qua Perforce (vd làm offline), dùng **Reconcile Offline Work**:
- P4V: chuột phải thư mục → **Reconcile Offline Work** → P4V tự nhận biết file nào edit/add/delete.
- CLI: `p4 reconcile`

### 7.6. Submit changelist
Khi xong một đơn vị công việc hợp lý:
1. Mở tab **Pending** trong P4V.
2. Kiểm tra danh sách file trong CL.
3. **Viết description rõ ràng** (xem best practices, mục 14).
4. Nhấn **Submit**.
- CLI:
```bash
p4 submit -d "Add melee combo system + update BP_Hero animations"
```

### 7.7. Revert (hủy thay đổi)
- P4V: chọn file → **Revert** (về bản server) hoặc **Revert if Unchanged** (chỉ hủy nếu thực ra không đổi gì).
- CLI: `p4 revert Content/Hero/BP_Hero.uasset`

### 7.8. Xem lịch sử & so sánh
- **File History**: chuột phải file → **History** (xem các revision, ai sửa, khi nào).
- **Diff**: so sánh 2 revision; với asset Unreal, dùng **diff trong Unreal Editor** (Content Browser → chuột phải asset → "Diff Against...") vì P4Merge không hiểu nội dung `.uasset`.
- **Time-lapse view / Revision Graph**: xem tiến hóa file qua thời gian.

---

<a name="8-resolve"></a>
## 8. Resolve — xử lý conflict

Conflict xảy ra khi: bạn check out một file, nhưng trong lúc đó người khác đã submit revision mới hơn của file đó. Khi bạn submit, Perforce yêu cầu **resolve** trước.

### 8.1. Quy trình resolve cơ bản
1. Khi submit báo "must resolve", chạy **Get Latest** rồi chuột phải → **Resolve**.
2. Hộp thoại resolve hiện các lựa chọn:
   - **Accept Yours**: giữ bản của bạn.
   - **Accept Theirs**: lấy bản trên server, bỏ thay đổi của bạn.
   - **Accept Merged**: tự động trộn (chỉ với file text không đè nhau).
   - **Run Merge Tool**: mở P4Merge để trộn thủ công từng dòng (file code/text).

### 8.2. Với file CODE (text)
Dùng **P4Merge**: cửa sổ 3 cột (Yours / Base / Theirs), chọn từng đoạn, lưu kết quả, rồi submit.

### 8.3. Với file ASSET UNREAL (binary)
Asset nhị phân **không trộn được**. Đây chính là lý do dùng `+l` (exclusive lock) để ngăn conflict ngay từ đầu. Nếu vì lý do nào đó vẫn xảy ra:
- Bạn chỉ có thể chọn **Accept Yours** hoặc **Accept Theirs** (một trong hai bản thắng).
- Một số asset (vd cấp Level/Map) có thể merge nhờ tính năng đặc biệt, nhưng nhìn chung: **đừng để 2 người sửa cùng asset** — đó là toàn bộ lý do tồn tại của lock.

> **Bài học:** nếu asset đã đúng `binary+l`, artist gần như không bao giờ phải resolve. Resolve chủ yếu là chuyện của programmer với file code.

---

<a name="9-shelve"></a>
## 9. Shelve — gửi tạm thay đổi

**Shelve** = đẩy thay đổi đang làm dở lên server **mà không submit**. Dùng khi:
- Chuyển máy nhưng chưa muốn submit.
- Nhờ người khác review/test trước khi submit chính thức.
- Cần dọn workspace để làm việc khác gấp, nhưng muốn giữ lại việc đang dở.

### Thao tác
- P4V: chọn pending CL → chuột phải → **Shelve**. Sau đó có thể **Revert** file cục bộ; thay đổi vẫn an toàn trên server.
- Lấy lại: chuột phải shelved CL → **Unshelve**.
- CLI:
```bash
p4 shelve -c 1234        # shelve changelist 1234
p4 unshelve -s 1234      # lấy lại
```

> Shelve cũng là cơ chế nền cho **code review qua Helix Swarm**: reviewer xem nội dung shelved trước khi tác giả submit.

---

<a name="10-tich-hop-ue-editor"></a>
## 10. Tích hợp trực tiếp trong Unreal Editor

Unreal Editor có **Revision Control** (trước gọi Source Control) tích hợp sẵn, giúp artist/designer thao tác mà không cần rời editor.

### 10.1. Kết nối Perforce trong UE
1. Trong Unreal Editor, góc dưới phải hoặc menu → **Revision Control → Connect to Revision Control**.
2. Chọn **Provider: Perforce**.
3. Điền **Server (Port)**, **User**, **Workspace** (giống thông tin P4V).
4. Nhấn **Accept**. Khi kết nối thành công, các icon trạng thái xuất hiện trên asset trong Content Browser.

> Mẹo: nếu đã đăng nhập P4V trên máy, UE thường tự điền sẵn thông tin.

### 10.2. Ý nghĩa icon trạng thái asset
- **Không icon**: chưa check out, bản mới nhất.
- **Dấu check / bút đỏ**: bạn đang check out (đang sửa).
- **Icon người khác**: file đang bị người khác khóa.
- **Mũi tên / dấu hiệu out-of-date**: có bản mới hơn trên server, cần sync.

### 10.3. Thao tác ngay trong editor
- **Check Out**: khi bạn bắt đầu sửa asset, editor hỏi/tự động check out.
- **Submit Content**: menu Revision Control → **Submit Content** → chọn asset, viết description, submit.
- **Sync**: chuột phải asset/thư mục trong Content Browser → **Sync**.
- **Diff**: chuột phải asset → **Diff Against Depot / Previous Revision** (đây là cách đúng để so sánh asset Unreal, không dùng P4Merge).
- **Revert**: chuột phải → **Revert**.

> **Đây là luồng chính cho artist/designer.** Họ gần như chỉ cần làm việc trong editor; P4V chỉ mở khi cần xử lý nâng cao.

### 10.4. Lưu ý quan trọng cho team UE
- **Luôn Save asset trong editor trước khi submit** (asset chưa save sẽ không phản ánh thay đổi).
- **Đổi tên/di chuyển asset PHẢI làm trong Content Browser** (engine fix reference), rồi submit cả file cũ (delete) và mới (add) mà editor sinh ra.
- **Xóa asset**: dùng "Delete" trong Content Browser; UE sẽ kiểm tra reference trước.
- **Redirector**: khi move/rename, UE có thể tạo "redirector". Thỉnh thoảng chạy **Fix Up Redirectors** trên thư mục Content rồi submit để dọn dẹp.

---

<a name="11-ugs"></a>
## 11. UnrealGameSync (UGS)

**UnrealGameSync (UGS)** là công cụ của Epic, là "mặt tiền" thân thiện cho Perforce dành riêng cho team Unreal. Giá trị lớn nhất: **người không build code (artist/designer) vẫn có editor chạy được** mà không cần Visual Studio.

### 11.1. UGS giải quyết vấn đề gì?
- Programmer submit code → CI/build server biên dịch → đẩy **binary biên dịch sẵn (Precompiled Binaries / PCBs)** lên Perforce.
- Artist mở UGS → chọn một changelist → UGS **sync code + asset + tải đúng binary tương ứng** → mở Unreal Editor. Artist không phải compile gì.

### 11.2. Tính năng chính của UGS
- Hiển thị dòng thời gian các **changelist** với mã màu (build pass/fail, có binary hay không).
- **Sync** tới một CL cụ thể (không phải lúc nào cũng head — chọn bản đã "Good Build").
- Tự động tải **precompiled editor binaries** khớp CL.
- Hiển thị trạng thái CIS/build health.
- Cho phép đánh dấu CL **Good/Bad**, ghi chú cho team.
- Tự chạy bước setup (generate project files, v.v.) khi cần.

### 11.3. Workflow điển hình với UGS
1. Build engineer thiết lập **CI** (vd qua Horde/Jenkins) để build và publish PCBs sau mỗi CL code.
2. Artist mở UGS → thấy CL gần nhất được đánh dấu xanh (build tốt) → bấm **Sync**.
3. UGS tải code + asset + binary → bấm chạy editor.
4. Artist làm việc, check out/submit asset như bình thường (qua editor hoặc P4V).

### 11.4. Lưu ý
- UGS cần được **build từ source UE** (nó nằm trong `Engine/Source/Programs/UnrealGameSync`) hoặc lấy bản dựng sẵn từ build engineer.
- Phải thống nhất: **không version `Binaries/`** thủ công khi đã dùng PCB qua UGS, tránh xung đột.

> Tóm gọn: **Programmer + Build engineer** dựng hạ tầng UGS một lần; **Artist/Designer** chỉ cần bấm Sync và chạy.

---

<a name="12-streams-branching"></a>
## 12. Streams & chiến lược branching

**Streams** là cách Perforce hiện đại quản lý nhánh (branch) — định nghĩa rõ luồng chảy của thay đổi giữa các nhánh.

### 12.1. Các loại stream
| Loại | Vai trò | Luồng chảy |
|---|---|---|
| **Mainline** | Nhánh "xương sống", luôn ổn định | Trung tâm |
| **Development** | Nhánh phát triển tính năng | Nhánh con của mainline |
| **Release** | Nhánh đóng băng để phát hành | Nhánh con của mainline |
| **Virtual** | Khung nhìn ảo, không tốn storage | Lọc/định tuyến |
| **Task** | Nhánh ngắn hạn cho 1 việc nhỏ | Nhẹ, tạm thời |

### 12.2. Hai thao tác chính giữa stream
- **Copy** (xuôi dòng, vd Release → Main hoặc Main → Dev): sao chép thay đổi, không cần merge nếu nhánh đích "thấp hơn".
- **Merge** (ngược dòng, vd Dev → Main): gộp thay đổi lên, có thể phải resolve.

### 12.3. Chiến lược gợi ý cho studio game vừa và nhỏ
```
//GameDepot/Main          <- Mainline: luôn buildable, mọi người làm việc ở đây hoặc dev
   ├── //GameDepot/Dev-Feature  <- nhánh tính năng lớn/rủi ro
   └── //GameDepot/Release-1.0  <- đóng băng khi gần ship, chỉ fix bug
```

- **Studio nhỏ:** nhiều team chỉ dùng **một Main stream duy nhất** + UGS đánh dấu Good Build. Đơn giản, ít overhead.
- **Studio lớn / nhiều team:** tách Dev streams theo feature/team, định kỳ merge về Main, tạo Release stream khi chuẩn bị phát hành.

### 12.4. Switch stream trong P4V
- P4V hỗ trợ **Streams view** trực quan (sơ đồ các stream và quan hệ).
- Đổi workspace sang stream khác: chuột phải stream → **Switch Workspace to Stream** (P4V sẽ sync chênh lệch).

> Branching chủ yếu là việc của **tech lead/build engineer**. Artist/designer thường chỉ làm trên một stream được chỉ định.

---

<a name="13-theo-vai-tro"></a>
## 13. Hướng dẫn theo từng vai trò

### 13.1. 👨‍💻 Lập trình viên (Programmer)
**Cần nắm:** sync, check out code, submit, resolve, shelve, branching, CLI, code review (Swarm), UGS.

Quy trình chuẩn:
1. Đầu ngày: `p4 sync` (lấy code + asset mới).
2. Check out file code cần sửa (`p4 edit`).
3. Code, build local, test.
4. Trước submit: `p4 sync` lại → **resolve** nếu có conflict.
5. (Khuyến nghị) **Shelve** + tạo review trên Swarm để được duyệt.
6. Submit với description rõ ràng, tham chiếu task Jira (vd `GD-123`).
7. CI build → publish PCB → team artist sync được qua UGS.

Mẹo:
- Dùng **CLI** cho thao tác lặp lại và script.
- **Atomic commit**: 1 changelist = 1 thay đổi logic hoàn chỉnh, build được.
- Đừng submit code làm vỡ build của cả team (kiểm tra build trước).

### 13.2. 🎨 Artist / Designer
**Cần nắm:** sync, check out asset (qua editor), submit, hiểu exclusive lock, KHÔNG move asset ngoài editor.

Quy trình chuẩn:
1. Mở **UGS** → **Sync** bản Good Build → chạy Unreal Editor (không cần compile).
2. Trong Content Browser: bắt đầu sửa asset → editor tự **Check Out** (asset bị khóa, người khác không sửa được).
3. Lưu asset trong editor.
4. **Submit Content** ngay trong editor, viết mô tả ngắn gọn.
5. Nếu sửa nhanh, **đừng giữ lock lâu** — check out, sửa, submit sớm để không chặn đồng đội.

Tuyệt đối tránh:
- ❌ Đổi tên/di chuyển asset bằng Windows Explorer hoặc P4V.
- ❌ Sửa asset mà quên check out (sẽ bị read-only hoặc tạo trạng thái lệch).
- ❌ Giữ check out hàng tuần một asset quan trọng (block cả team).

### 13.3. 🛠️ Tech Lead / Build Engineer
**Cần nắm:** typemap, streams/branching, CI/CD, UGS setup, quyền (protections), quản lý PCB.

Trách nhiệm:
- Thiết lập **typemap** đúng cho UE (mục 6.1) — làm một lần, kiểm tra định kỳ.
- Định nghĩa **stream layout** và chiến lược merge.
- Dựng **CI** (Horde/Jenkins/...) để build và publish **precompiled binaries** cho UGS.
- Quản lý **Good Build** / đánh dấu CL.
- Giám sát dung lượng depot, đặt `+S` cho file build cũ nếu cần.
- Hỗ trợ team xử lý conflict/resolve phức tạp, merge giữa stream.

### 13.4. 📋 Producer / PM
**Cần nắm:** xem lịch sử, theo dõi tiến độ qua changelist, không nhất thiết thao tác file.

Có thể dùng:
- **P4V (read-only)** hoặc **Swarm web** để xem changelist, ai đang làm gì, tiến độ.
- Liên kết changelist với task **Jira** (vd CL description có mã `GD-123`) để truy vết.
- Không cần check out/submit; chủ yếu theo dõi và phối hợp.

### 13.5. 🔧 Administrator
**Cần nắm:** cài/quản lý `p4d`, user/group, protections (phân quyền), backup, typemap, depot.

Trách nhiệm:
- Cài đặt và bảo trì **Helix Core Server**.
- Tạo **user**, **group**, đặt **protections** (ai đọc/ghi được depot nào):
  ```
  # ví dụ dòng protection
  write group artists * //GameDepot/Main/Content/...
  read  group producers * //GameDepot/...
  ```
- Cấu hình **typemap** toàn server.
- **Backup & checkpoint** định kỳ (`p4 admin checkpoint`) — sống còn với studio.
- Theo dõi hiệu năng, dung lượng, log; quản lý license/seat.
- Thiết lập SSL, bảo mật, retention.

---

<a name="14-best-practices"></a>
## 14. Best practices

### Chung cho cả team
1. **Sync đầu ngày, sync trước khi submit.** Tránh làm trên bản cũ.
2. **Changelist nguyên tử (atomic):** mỗi CL là một thay đổi logic hoàn chỉnh, có thể build/chạy.
3. **Viết description rõ ràng.** Mẫu tốt:
   ```
   [GD-123] Thêm hệ thống combo cận chiến

   - Thêm AbilitySystemComponent cho enemy melee
   - Cập nhật BP_Enemy_Grunt animation montage
   - Sửa bug stagger không reset
   ```
   Luôn tham chiếu **task Jira** để truy vết.
4. **Submit thường xuyên, đừng để CL khổng lồ.** Dễ review, dễ rollback.
5. **Không giữ check out/lock lâu** với asset quan trọng — block đồng đội.

### Riêng cho file Unreal
6. **Typemap đúng (`binary+l` cho .uasset/.umap) là điều kiện tiên quyết.**
7. **Mọi thao tác asset (rename/move/delete) làm trong Content Browser**, không ngoài editor.
8. **Save asset trong editor trước khi submit.**
9. **Đừng version Saved/Intermediate/DerivedDataCache/Binaries** (trừ khi có lý do và đã thống nhất với tech lead).
10. **Diff asset bằng tính năng của Unreal Editor**, không bằng P4Merge.

### Tổ chức
11. **1 người + 1 máy = 1 workspace**, tên rõ ràng.
12. **Code review qua Swarm + shelve** trước khi submit code rủi ro.
13. **Đừng làm vỡ build của Main** — đó là nhánh cả team phụ thuộc.

---

<a name="15-xu-ly-su-co"></a>
## 15. Xử lý sự cố thường gặp

### "File is locked / exclusively opened by another user"
Asset đang bị người khác check out (do `+l`). Cách xử lý:
- Xem ai đang giữ: chuột phải file → **History/Properties**, hoặc `p4 opened //...` để biết ai.
- **Liên hệ người đó** nhờ submit/revert.
- Admin có thể `p4 revert -C <user> //file` để mở khóa trong trường hợp khẩn (cẩn thận, có thể mất việc của họ).

### "Must resolve files before submitting"
Có bản mới hơn trên server. → **Get Latest** → **Resolve** (mục 8) → submit lại.

### Asset bị read-only, không sửa được trong UE
Bạn chưa check out, hoặc P4IGNORE/typemap sai. → Check out asset trong editor; kiểm tra `+w`/typemap với tech lead.

### Reference bị hỏng sau khi move asset
Do move ngoài editor. → Dùng **Fix Up Redirectors** trong Content Browser; nếu vỡ nặng, revert và làm lại move trong editor.

### Workspace lệch trạng thái (file trên đĩa khác server nghĩ)
Dùng **Reconcile Offline Work** (`p4 reconcile`); hoặc **Get Latest** với tùy chọn force nếu cần (`p4 sync -f`, cẩn thận vì ghi đè cục bộ).

### Quên check out, lỡ sửa offline nhiều file
→ **Reconcile Offline Work** trên thư mục, P4V tự phát hiện và đưa vào changelist.

### Sync rất chậm / project quá nặng
- Dùng SSD, mạng tốt.
- Cân nhắc **stream/view** chỉ map phần cần thiết.
- Build engineer cấu hình proxy (**Helix Proxy / Edge**) cho team ở xa.

### Kết nối lỗi (giống vấn đề DNS/ISP từng gặp)
- Kiểm tra `p4 info`/`p4 -ztag info`.
- Nếu lỗi phân giải tên server, thử IP trực tiếp trong `P4PORT`, hoặc đổi DNS (vd 1.1.1.1 / 8.8.8.8) — tương tự cách xử lý sự cố GitHub do định tuyến DNS.
- Kiểm tra firewall/cổng (mặc định 1666).

---

<a name="16-cli"></a>
## 16. Tham khảo lệnh p4 (CLI)

| Lệnh | Tác dụng |
|---|---|
| `p4 info` | Thông tin kết nối & server |
| `p4 login` / `p4 logout` | Đăng nhập / đăng xuất |
| `p4 set` | Xem/đặt biến môi trường (P4PORT, P4USER, P4CLIENT, P4IGNORE) |
| `p4 client` | Tạo/sửa workspace |
| `p4 sync` | Lấy bản mới nhất; `p4 sync //path/...@CL` lấy tới CL cụ thể |
| `p4 sync -f` | Force re-sync (ghi đè cục bộ — cẩn thận) |
| `p4 edit <file>` | Check out để sửa |
| `p4 add <file>` | Đánh dấu thêm file mới |
| `p4 delete <file>` | Đánh dấu xóa |
| `p4 move <from> <to>` | Đổi tên/di chuyển (giữ lịch sử) |
| `p4 reconcile` | Đối soát work offline |
| `p4 revert <file>` | Hủy thay đổi, mở khóa |
| `p4 revert -a` | Revert các file thực ra không đổi |
| `p4 opened` | Liệt kê file đang check out (của bạn) |
| `p4 opened -a` | Tất cả file đang check out của mọi người |
| `p4 changes` | Lịch sử changelist |
| `p4 change` | Tạo/sửa pending changelist |
| `p4 submit -d "msg"` | Submit với mô tả |
| `p4 resolve` | Hòa giải conflict |
| `p4 shelve -c <CL>` | Shelve changelist |
| `p4 unshelve -s <CL>` | Lấy lại shelved |
| `p4 filelog <file>` | Lịch sử chi tiết một file |
| `p4 diff` / `p4 diff2` | So sánh phiên bản |
| `p4 typemap` | Xem/sửa typemap (admin) |
| `p4 protect` | Quản lý phân quyền (admin) |
| `p4 users` / `p4 groups` | Quản lý user/group (admin) |
| `p4 admin checkpoint` | Tạo checkpoint backup (admin) |

> Mẹo: dùng **P4CONFIG** (file `.p4config` đặt ở gốc project chứa `P4PORT`, `P4USER`, `P4CLIENT`) để tự chuyển ngữ cảnh khi làm nhiều project.

---

<a name="17-thuat-ngu"></a>
## 17. Bảng thuật ngữ

| Thuật ngữ | Giải thích ngắn |
|---|---|
| **Depot** | Kho lưu file + lịch sử trên server (`//...`) |
| **Workspace / Client** | Bản đồ ánh xạ depot ↔ thư mục máy + file copy về |
| **Changelist (CL)** | Nhóm file submit cùng lúc, nguyên tử |
| **Pending / Submitted / Shelved CL** | CL đang sửa / đã gửi / để tạm trên server |
| **Revision** | Phiên bản của một file (`file#3`) |
| **Head revision** | Bản mới nhất trên server |
| **Sync / Get Latest** | Tải bản mới về máy |
| **Check out / Open for edit** | Báo server sắp sửa file (khóa nếu `+l`) |
| **Submit** | Gửi CL lên server |
| **Revert** | Hủy thay đổi cục bộ, mở khóa |
| **Resolve** | Hòa giải conflict |
| **Shelve / Unshelve** | Gửi tạm / lấy lại thay đổi chưa submit |
| **Typemap** | Bảng quy định loại file theo phần mở rộng |
| **`+l` (exclusive lock)** | Chỉ 1 người check out file tại một thời điểm |
| **`.p4ignore`** | Danh sách file/thư mục bỏ qua, không version |
| **Stream** | Nhánh kiểu Perforce hiện đại (Mainline/Dev/Release/...) |
| **Reconcile** | Đối soát thay đổi làm offline với server |
| **UGS (UnrealGameSync)** | Tool Epic: sync + tải binary biên dịch sẵn |
| **PCB (Precompiled Binaries)** | Binary editor build sẵn cho artist không compile |
| **Swarm** | Web tool để code review/duyệt CL |
| **Protections** | Phân quyền đọc/ghi depot (admin) |
| **Checkpoint** | Bản sao lưu metadata server (admin) |

---

## Phụ lục: Lộ trình đào tạo gợi ý cho thành viên mới

| Buổi | Nội dung | Đối tượng |
|---|---|---|
| 1 | Khái niệm cốt lõi (mục 1–3) + cài P4V, kết nối, tạo workspace (mục 4–5) | Tất cả |
| 2 | Workflow hàng ngày trong P4V (mục 7) + thực hành sync/check out/submit | Tất cả |
| 3 | Tích hợp Unreal Editor + UGS (mục 10–11) | Artist/Designer/Programmer |
| 4 | Resolve, shelve, code review (mục 8–9) + CLI (mục 16) | Programmer |
| 5 | Streams, branching, typemap, CI/PCB (mục 6, 12) | Tech Lead/Build Engineer/Admin |

> Sau mỗi buổi, cho thành viên thực hành trên một **project sandbox** (depot test) để không ảnh hưởng Main.
