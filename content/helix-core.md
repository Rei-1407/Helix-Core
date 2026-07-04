# Hướng dẫn sử dụng Helix Core (Perforce P4) cho Studio Game Unreal Engine

> Tài liệu đào tạo nội bộ — dành cho mọi vai trò trong studio: lập trình viên, artist/designer, tech lead/build engineer, producer và admin.

| | |
|---|---|
| **Phiên bản tài liệu** | 2.0 |
| **Cập nhật** | 04/07/2026 |
| **Áp dụng cho** | Unreal Engine 5.x (khuyến nghị 5.4+), P4 Server / P4V các bản gần đây |
| **Đối tượng** | Toàn bộ thành viên studio (có lộ trình riêng theo vai trò — xem Phụ lục A) |

> **⚠️ Ghi chú quan trọng về tên gọi (đọc trước):**
> Sản phẩm này ban đầu tên là **Perforce (P4)**, được đổi tên thành **Helix Core** giai đoạn 2014–2015, và **từ tháng 3/2025 Perforce đã đổi tên trở lại thành "Perforce P4"** — hợp nhất bộ công cụ dưới thương hiệu **P4 Platform**. Một số tên mới cần biết:
> - Helix Core Server → **P4 Server** (binary vẫn là `p4d`)
> - Helix Visual Client → **P4V** (không đổi)
> - Helix Swarm → **P4 Code Review**
> - Helix Proxy → **P4 Proxy**
>
> Lệnh CLI, định dạng file, cách hoạt động **không thay đổi gì** — chỉ là đổi tên thương hiệu. Trong tài liệu này, "Perforce", "P4" và "Helix Core" được dùng thay thế cho nhau. Khi tra tài liệu/Google, bạn sẽ gặp cả tên cũ lẫn tên mới — đó là cùng một sản phẩm.

---

## Mục lục

1. [P4 (Helix Core) là gì và tại sao game studio dùng nó](#1-helix-core-la-gi)
2. [Các thành phần trong hệ sinh thái P4](#2-cac-thanh-phan)
3. [Khái niệm cốt lõi (bắt buộc nắm)](#3-khai-niem-cot-loi)
4. [Cài đặt và kết nối lần đầu](#4-cai-dat-va-ket-noi)
5. [Tạo và cấu hình Workspace](#5-tao-workspace)
6. [Cấu hình bắt buộc cho dự án Unreal Engine](#6-cau-hinh-cho-ue)
7. [Workflow hàng ngày (P4V)](#7-workflow-hang-ngay)
8. [Resolve — xử lý conflict](#8-resolve)
9. [Shelve — gửi tạm thay đổi](#9-shelve)
10. [Tích hợp trực tiếp trong Unreal Editor](#10-tich-hop-ue-editor)
11. [OFPA & World Partition — nhiều người cùng làm một level](#11-ofpa)
12. [UnrealGameSync (UGS)](#12-ugs)
13. [Streams & chiến lược branching](#13-streams-branching)
14. [Hướng dẫn theo từng vai trò](#14-theo-vai-tro)
15. [Quickstart dựng server (dành cho Admin)](#15-admin-quickstart)
16. [Best practices](#16-best-practices)
17. [Xử lý sự cố thường gặp](#17-xu-ly-su-co)
18. [Tham khảo lệnh p4 (CLI)](#18-cli)
19. [Bảng thuật ngữ](#19-thuat-ngu)

**Phụ lục**
- [A. Lộ trình đào tạo gợi ý](#phu-luc-a)
- [B. Checklist onboarding thành viên mới](#phu-luc-b)
- [C. Bài tập thực hành & capstone](#phu-luc-c)
- [D. Câu hỏi kiểm tra nhanh (quiz)](#phu-luc-d)
- [E. FAQ — câu hỏi thường gặp](#phu-luc-e)
- [Lịch sử phiên bản tài liệu](#lich-su-phien-ban)

---

<a name="1-helix-core-la-gi"></a>
## 1. P4 (Helix Core) là gì và tại sao game studio dùng nó

**Perforce P4** (tên giai đoạn 2015–2025: Helix Core) là hệ thống quản lý phiên bản (version control) **tập trung (centralized)**, do hãng Perforce phát triển. Toàn bộ lịch sử file nằm trên một **server trung tâm**; mỗi máy chỉ giữ bản sao làm việc (workspace) của các file cần thiết.

### Vì sao game studio chọn Perforce thay vì Git?

| Tiêu chí | Git | Perforce P4 |
|---|---|---|
| Mô hình | Phân tán (mỗi máy có full history) | Tập trung (history ở server) |
| File nhị phân lớn (.uasset, .fbx, texture) | Yếu — repo phình to, merge không được | Mạnh — sinh ra để xử lý binary lớn |
| Khóa độc quyền file (exclusive lock) | Không có native (cần Git LFS lock, hạn chế) | Native, ổn định |
| Dung lượng project hàng trăm GB | Rất khó | Bình thường |
| Sync một phần project (partial sync) | Khó (sparse checkout phức tạp) | Native qua workspace view/stream |
| Người không rành kỹ thuật (artist) | Khó | Dễ (P4V trực quan, có in-editor UE) |
| Tích hợp Unreal Engine | Có (plugin cộng đồng) | Tốt nhất, là chuẩn ngành, Epic tự bảo trì |
| Công cụ độc quyền của Epic (UGS, Horde, RoboMerge) | ❌ Không hỗ trợ | ✅ Chỉ hoạt động với Perforce |

**Lý do then chốt:** Game dev có rất nhiều file **nhị phân không merge được** (asset Unreal, model 3D, texture, audio). Hai người sửa cùng một `.uasset` thì không có cách "trộn" tự động như code. Perforce giải quyết bằng **exclusive lock** — chỉ một người được check out file đó tại một thời điểm. Đây là điều Git không làm tốt.

Đây cũng là lý do **Epic Games dùng Perforce nội bộ** để phát triển Unreal Engine và Fortnite, khuyến nghị các studio bên thứ ba dùng Perforce, và Unreal Engine có sẵn tích hợp Perforce trong editor do chính Epic bảo trì.

### Chi phí & giấy phép (thông tin cho người ra quyết định)

- **Miễn phí vĩnh viễn cho tối đa 5 user và 20 workspace** — đủ cho studio nhỏ hoặc giai đoạn thử nghiệm, không giới hạn thời gian.
- Trên 5 user: mua license theo số user có tên (named user), liên hệ Perforce để báo giá.
- **P4 Cloud**: bản SaaS do Perforce vận hành (không phải tự dựng server), tính phí thuê bao — phù hợp team không có người quản trị hạ tầng.
- Studio tự dựng server (on-premise hoặc VPS/cloud tự quản) là mô hình phổ biến nhất — xem mục 15.

---

<a name="2-cac-thanh-phan"></a>
## 2. Các thành phần trong hệ sinh thái P4

| Thành phần | Vai trò | Ai dùng |
|---|---|---|
| **P4 Server (`p4d`)** — tên cũ: Helix Core Server | Server lưu depot, history, quản lý quyền | Admin cài/quản lý |
| **P4V** (Visual Client) | App GUI để thao tác hàng ngày | Mọi người |
| **`p4` / `p4.exe` (CLI)** | Dòng lệnh, dùng cho script/CI | Programmer, build engineer |
| **P4Admin** | Công cụ GUI quản trị (user, group, depot, quyền) | Admin |
| **P4 Code Review** — tên cũ: Helix Swarm | Code review, duyệt changelist qua web | Programmer, tech lead |
| **P4 One** | Client mới (ra mắt 2025) hướng tới artist/creative, giao diện tối giản hơn P4V | Artist (tùy chọn) |
| **UnrealGameSync (UGS)** | Tool của Epic: sync + tải binary biên dịch sẵn | Cả team UE |
| **Horde** | Bộ dịch vụ build automation/CI của Epic (đi kèm mã nguồn UE5), tích hợp chặt với UGS | Build engineer |
| **P4VS / plugin IDE khác** | Tích hợp version control vào Visual Studio, Rider, VS Code | Programmer |
| **P4 Proxy / Edge / Replica** | Máy chủ trung gian tăng tốc cho team ở xa | Admin (hạ tầng) |

> Trong thực tế studio: **artist/designer dùng P4V + tích hợp trong Unreal Editor**, **programmer dùng P4V + CLI + plugin IDE + UGS**, **admin dùng P4Admin + CLI**. P4 One là lựa chọn thêm cho artist nếu team muốn thử, nhưng luồng chuẩn trong tài liệu này xoay quanh P4V + Unreal Editor.

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

> Quy tắc vàng: **1 người + 1 máy = 1 workspace**. Không dùng chung workspace giữa nhiều máy. Lưu ý licensing của Perforce tính theo **user**, không tính theo workspace (trong hạn mức), nên cứ tạo workspace thoải mái theo đúng quy tắc này.

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
- Cờ bổ sung (modifier):
  - `+l` = **exclusive lock**: chỉ 1 người check out được tại một thời điểm. **Bắt buộc cho `.uasset`, `.umap`.**
  - `+w` = always writable: file luôn ghi được trên đĩa (không bị read-only), dùng cho file bị ghi trong lúc build.
  - `+S<n>` = chỉ giữ `n` bản gần nhất trên server (vd `+S2` giữ 2 bản) — tiết kiệm dung lượng cho file to, tự sinh lại được. `+S` không có số = chỉ giữ head revision.

**Typemap** là bảng cấu hình toàn server quyết định file nào nhận type gì theo phần mở rộng. Đây là thứ phải cấu hình **ngay khi dựng server, trước khi add file đầu tiên** (typemap không tự áp lại cho file đã version từ trước) — xem mục 6.

> Phân biệt: `+l` trong typemap là khóa **tự động khi check out**. Ngoài ra còn lệnh `p4 lock` để khóa thủ công một file đang mở — hiếm khi cần nếu typemap đã đúng.

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
1. Tải **P4V (Visual Client)** từ trang Perforce (`perforce.com/downloads`). Trang tải có thể hiển thị tên cũ "Helix Visual Client" — vẫn là cùng một phần mềm.
2. Cài đặt. Bộ cài Windows đi kèm **P4V, P4Admin, P4Merge và `p4.exe` (CLI)** — nhớ tick chọn thành phần CLI khi cài (programmer chắc chắn cần).
3. Mở P4V.

### 4.2. Thông tin cần xin từ admin
Để kết nối, bạn cần 3 thông tin:
- **Server (P4PORT)**: dạng `ssl:perforce.studio.com:1666` hoặc `192.168.1.10:1666`.
- **User**: tên đăng nhập Perforce của bạn.
- **Password**: mật khẩu khởi tạo (đổi ngay sau lần đăng nhập đầu).

### 4.3. Kết nối trong P4V
1. Mở P4V → cửa sổ **Open Connection**.
2. Điền **Server**, **User**.
3. Nhấn **OK**, nhập mật khẩu nếu được hỏi.
4. Bước tiếp theo P4V sẽ hỏi tạo/chọn **Workspace** (xem mục 5).

> **Lưu ý SSL**: nếu server dùng `ssl:`, lần đầu kết nối sẽ hỏi tin cậy fingerprint → xác nhận với admin rồi chọn **Trust**.

### 4.4. Kết nối bằng CLI (cho programmer)
```bash
# Đặt biến môi trường (hoặc dùng file P4CONFIG — xem mục 18)
p4 set P4PORT=ssl:perforce.studio.com:1666
p4 set P4USER=long
p4 set P4CLIENT=long_mygame_win

p4 login            # đăng nhập (nhập password)
p4 info             # kiểm tra kết nối + thông tin server
```

### 4.5. Phiên đăng nhập (ticket) — vì sao thỉnh thoảng bị "hết hạn"
`p4 login` không lưu mật khẩu mà tạo một **ticket** có thời hạn (mặc định thường là 12 giờ, admin có thể chỉnh theo group). Khi ticket hết hạn:
- P4V hoặc Unreal Editor báo lỗi kiểu *"Your session has expired, please login again"* / *"Perforce login failed"*.
- Xử lý: mở P4V đăng nhập lại, hoặc chạy `p4 login`. **Không phải lỗi mạng hay hỏng gì cả.**
- Kiểm tra ticket còn hạn không: `p4 login -s`.

---

<a name="5-tao-workspace"></a>
## 5. Tạo và cấu hình Workspace

### 5.1. Tạo workspace trong P4V
1. Menu **Connection → New Workspace** (hoặc khi kết nối lần đầu).
2. **Workspace name**: đặt tên rõ ràng, vd `long_mygame_win`. Quy ước studio: `<user>_<project>_<máy/os>`.
3. **Root**: chọn thư mục gốc trên ổ, vd `D:\Perforce\MyGame`. Nên để ổ SSD còn trống nhiều (project UE rất nặng).
4. **Stream / View**:
   - Nếu dùng **stream depot**: chọn stream, vd `//GameDepot/Main`.
   - Nếu dùng **classic depot**: cấu hình view mapping thủ công (5.2).
5. Nhấn **OK / Save**.

### 5.2. View mapping (cho classic depot)
View quyết định phần nào của depot map xuống máy. Ví dụ chỉ lấy project, bỏ thư mục tài liệu nội bộ:
```
//GameDepot/Main/...            //long_mygame_win/...
-//GameDepot/Main/RawAssets/... //long_mygame_win/RawAssets/...
```
Dòng bắt đầu bằng `-` là **loại trừ** (không sync về). Với stream depot, việc này làm ở định nghĩa stream (Paths) thay vì từng workspace. Còn để loại trừ **file rác do UE sinh ra**, dùng **`.p4ignore`** (mục 6) chứ không dùng view.

### 5.3. Sau khi tạo workspace
Chạy **Get Latest Revision** trên thư mục gốc để tải toàn bộ project về lần đầu. Lần đầu này có thể mất nhiều thời gian (project UE có thể vài chục GB).

### 5.4. Một workspace, nhiều stream
Với stream depot, bạn **không cần tạo workspace mới cho mỗi nhánh**: chuột phải stream trong P4V → **Switch Workspace to Stream**, P4V sẽ sync phần chênh lệch. Đừng tạo workspace tràn lan cho cùng một project trên cùng một máy.

---

<a name="6-cau-hinh-cho-ue"></a>
## 6. Cấu hình bắt buộc cho dự án Unreal Engine

Đây là phần **quan trọng nhất** và thường bị làm sai. Cấu hình sai → asset không bị khóa → 2 artist ghi đè nhau, hoặc repo phình to vì version file rác.

### 6.1. Typemap cho Unreal (admin/tech lead làm 1 lần cho cả server, TRƯỚC khi add file)

Mục tiêu: asset Unreal là `binary+l` (khóa độc quyền), code là `text`, file build là `binary+w` (luôn ghi được để không cản trở compile). Bảng dưới đây bám theo **typemap khuyến nghị chính thức của Epic**, bổ sung thêm các định dạng asset nguồn phổ biến.

Chạy `p4 typemap` (mở editor) và dán:

```
TypeMap:
	binary+l //....uasset
	binary+l //....umap
	binary+l //....ubulk
	binary+l //....uexp
	binary+l //....uptnl
	binary+l //....upk
	binary+l //....udk
	text //....cpp
	text //....h
	text //....c
	text //....cs
	text //....m
	text //....mm
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
	binary //....jpeg
	binary //....bmp
	binary //....psd
	binary //....exr
	binary //....dds
	binary //....fbx
	binary //....wav
	binary //....mp3
	binary //....ogg
	binary //....mp4
	binary+w //....exe
	binary+w //....dll
	binary+w //....so
	binary+w //....lib
	binary+w //....pdb
	binary+w //....dylib
	binary+w //....stub
	binary+w //....ipa
	binary+w //....app
	binary+wS2 //..._BuiltData.uasset
```

Ba điều cần hiểu về bảng trên:

1. **Dòng khớp CUỐI CÙNG thắng.** Khi một file khớp nhiều dòng, Perforce dùng dòng cuối cùng khớp được. Vì vậy dòng `_BuiltData.uasset` phải đặt **sau** dòng `.uasset` chung.
2. **Dòng `_BuiltData.uasset` là tùy chọn** (khuyến nghị của Perforce): đây là dữ liệu lighting build của map, rất nặng, tự sinh lại được. `+wS2` = luôn ghi được + server chỉ giữ 2 bản gần nhất, tiết kiệm dung lượng đáng kể. Phương án thay thế: bỏ hẳn vào `.p4ignore` (giống template `.gitignore` chính thức của UE). **Team chọn MỘT trong hai**, thống nhất với tech lead.
3. **Typemap không áp ngược cho file đã version từ trước.** Nếu server đã có file add sai type (vd `.uasset` không có `+l`), sửa bằng cách:
   ```bash
   p4 edit -t binary+l //GameDepot/Main/....uasset
   p4 submit -d "Fix filetype: enforce binary+l on uasset"
   ```

> `+l` trên `.uasset`/`.umap` là **lý do then chốt** dùng Perforce. Đừng quên.

> **Nâng cao — nếu studio version cả mã nguồn engine:** cần bổ sung một số dòng cho file bị ghi trong lúc build, ví dụ `text+w //....target`, `text+w //....modules`, `text+w //....version` (các file receipt trong `Engine/Binaries`). Tham khảo tài liệu Epic về hosting engine source trên Perforce.

### 6.2. File `.p4ignore` (loại trừ file rác của UE)

Tạo file tên `.p4ignore` ở thư mục gốc project, **submit chính file này vào depot** để cả team dùng chung, và set biến môi trường `P4IGNORE` (mục 6.3).

```gitignore
# ============================================================
# .p4ignore cho project Unreal Engine
# LƯU Ý: p4ignore chỉ chặn việc ADD file mới (p4 add / reconcile).
# File ĐÃ nằm trong depot sẽ không bị gỡ ra bởi file này.
# ============================================================

# --- Thư mục UE tự sinh ---
# Pattern không có "/" ở đầu => khớp ở MỌI cấp thư mục,
# bao gồm cả Plugins/<Tên>/Binaries, Plugins/<Tên>/Intermediate.
Binaries/
Intermediate/
Saved/
DerivedDataCache/

# KHÔNG ignore Build/ — thư mục này chứa icon, splash, cấu hình
# đóng gói theo platform (Windows/Android/iOS...) và CẦN version.

# --- IDE / công cụ ---
.vs/
.vscode/
.idea/
*.sln
*.suo
*.sdf
*.opensdf
*.opendb
*.VC.db
*.VC.opendb
*.xcodeproj
*.xcworkspace

# --- File hệ điều hành / tạm ---
*.tmp
Thumbs.db
.DS_Store
*~
```

Ghi chú cú pháp `.p4ignore` (tương tự `.gitignore`):
- `#` = comment; `!` đầu dòng = ngoại lệ (không ignore); `/` cuối dòng = chỉ khớp thư mục.
- `*` khớp trong một cấp thư mục; `**` khớp xuyên nhiều cấp.
- Kiểm tra một file có bị ignore không: `p4 ignores -i <đường/dẫn/file>`.

> **Lưu ý về `Binaries/`**: nếu team dùng **UnrealGameSync** (mục 12), KHÔNG version `Binaries/` — UGS sẽ phát binary biên dịch sẵn. Nếu team có nhiều người **không cài Visual Studio** (artist) và không dùng UGS, build engineer có thể version một bộ binary đã build để họ chạy editor được (khi đó xóa dòng `Binaries/` khỏi ignore và cân nhắc `+S` để đỡ tốn dung lượng). Hãy thống nhất với tech lead — **chọn một trong hai, đừng làm cả hai**.

> **Lưu ý về `*.sln`**: file solution bị ignore vì mỗi programmer tự sinh — chuột phải file `.uproject` → **Generate Visual Studio project files** sau khi sync lần đầu.

### 6.3. Đặt biến môi trường P4IGNORE (toàn máy)
```bash
# Windows (ghi vào registry, áp dụng toàn máy)
p4 set P4IGNORE=.p4ignore

# macOS / Linux (thêm vào ~/.zshrc hoặc ~/.bashrc)
export P4IGNORE=.p4ignore

# Kiểm tra
p4 set
```

### 6.4. Cấu trúc thư mục project nên version

```
MyGame/
├── Config/            ✅ version (file cấu hình project)
├── Content/           ✅ version (asset .uasset/.umap, gồm cả __ExternalActors__/__ExternalObjects__)
├── Source/            ✅ version (code C++)
├── Plugins/           ✅ version (trừ Binaries/Intermediate bên trong — p4ignore lo việc này)
├── Build/             ✅ version (icon, splash, cấu hình đóng gói platform)
├── MyGame.uproject    ✅ version
├── Binaries/          ❌ ignore (hoặc do UGS/PCB quản lý — mục 12)
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
- P4V: chọn file → chuột phải → **Check Out**.
- CLI: `p4 edit Content/Hero/BP_Hero.uasset`
- Với file `+l`: lúc này file bị **khóa**, người khác không check out được.

> Trong Unreal Editor, khi bạn bắt đầu sửa một asset, editor có thể tự động check out nếu bật tùy chọn tương ứng (xem mục 10.4).

### 7.3. Thêm file mới (Add / Mark for Add)
- P4V: kéo file vào workspace rồi chuột phải → **Mark for Add**; hoặc để P4V tự phát hiện file mới qua **Reconcile**.
- CLI: `p4 add Content/NewAsset.uasset`

### 7.4. Xóa / Đổi tên / Di chuyển
- Xóa: chuột phải → **Mark for Delete** (`p4 delete`).
- Đổi tên/di chuyển: dùng **Rename/Move** trong P4V (`p4 move`) — KHÔNG xóa-rồi-thêm thủ công vì sẽ mất lịch sử.

> **Cảnh báo UE:** đừng đổi tên/di chuyển **asset Unreal** bằng Windows Explorer hay P4V. Hãy làm **trong Content Browser của Unreal** để engine cập nhật reference, sau đó submit. Move thủ công sẽ làm hỏng reference. (Quy tắc P4V move ở trên áp dụng cho file thường: code, config, tài liệu.)

### 7.5. Reconcile (đối soát work offline)
Nếu bạn lỡ sửa/thêm/xóa file mà chưa qua Perforce (vd làm offline), dùng **Reconcile Offline Work**:
- P4V: chuột phải thư mục → **Reconcile Offline Work** → P4V tự nhận biết file nào edit/add/delete.
- CLI: `p4 reconcile`

### 7.6. Submit changelist
Khi xong một đơn vị công việc hợp lý:
1. Mở tab **Pending** trong P4V.
2. Kiểm tra danh sách file trong CL — **đọc lại từng file**, đảm bảo không lọt file rác.
3. **Viết description rõ ràng** (xem best practices, mục 16).
4. Nhấn **Submit**.
- CLI:
```bash
p4 submit -d "[GD-123] Add melee combo system + update BP_Hero animations"
```

### 7.7. Revert (hủy thay đổi)
- P4V: chọn file → **Revert** (về bản server) hoặc **Revert Unchanged Files** (chỉ hủy check out của những file thực ra không đổi gì — nên chạy trước khi submit để CL sạch).
- CLI: `p4 revert Content/Hero/BP_Hero.uasset` · `p4 revert -a` (revert các file không đổi)

### 7.8. Xem lịch sử & so sánh
- **File History**: chuột phải file → **History** (xem các revision, ai sửa, khi nào).
- **Diff**: so sánh 2 revision; với asset Unreal, dùng **diff trong Unreal Editor** (mục 10.3) vì P4Merge không hiểu nội dung `.uasset`.
- **Time-lapse View / Revision Graph**: xem tiến hóa file qua thời gian, rất hữu ích khi truy vết bug "ai đổi cái này lúc nào".

---

<a name="8-resolve"></a>
## 8. Resolve — xử lý conflict

Conflict xảy ra khi: bạn check out một file, nhưng trong lúc đó người khác đã submit revision mới hơn của file đó. Khi bạn submit, Perforce yêu cầu **resolve** trước.

### 8.1. Quy trình resolve cơ bản
1. Khi submit báo *"must resolve"*, chạy **Get Latest** rồi chuột phải file → **Resolve**.
2. Hộp thoại resolve hiện các lựa chọn:
   - **Accept Yours**: giữ bản của bạn.
   - **Accept Theirs**: lấy bản trên server, bỏ thay đổi của bạn.
   - **Accept Merged**: tự động trộn (chỉ với file text mà các thay đổi không đè lên nhau).
   - **Run Merge Tool**: mở P4Merge để trộn thủ công từng dòng (file code/text).
- CLI: `p4 resolve` (tương tác) · `p4 resolve -am` (auto-merge phần trộn được) · `p4 resolve -as` (chỉ nhận các trường hợp "an toàn").

### 8.2. Với file CODE (text)
Dùng **P4Merge**: cửa sổ 3 phần (Yours / Base / Theirs), chọn từng đoạn, lưu kết quả, rồi submit.

### 8.3. Với file ASSET UNREAL (binary)
Asset nhị phân **không trộn được**. Đây chính là lý do dùng `+l` (exclusive lock) để ngăn conflict ngay từ đầu. Nếu vì lý do nào đó vẫn xảy ra:
- Bạn chỉ có thể chọn **Accept Yours** hoặc **Accept Theirs** (một trong hai bản thắng, bản kia mất công sức).
- Blueprint có công cụ diff trực quan trong editor để **xem** khác biệt, nhưng về bản chất vẫn không auto-merge được — **đừng để 2 người sửa cùng asset**, đó là toàn bộ lý do tồn tại của lock.

> **Bài học:** nếu asset đã đúng `binary+l`, artist gần như không bao giờ phải resolve. Resolve chủ yếu là chuyện của programmer với file code.

---

<a name="9-shelve"></a>
## 9. Shelve — gửi tạm thay đổi

**Shelve** = đẩy thay đổi đang làm dở lên server **mà không submit**. Dùng khi:
- Chuyển máy nhưng chưa muốn submit.
- Nhờ người khác review/test trước khi submit chính thức.
- Cần dọn workspace để làm việc khác gấp, nhưng muốn giữ lại việc đang dở.
- Backup tạm cuối ngày cho công việc dở dang nhiều ngày (server có bản sao, máy hỏng không mất).

### Thao tác
- P4V: chọn pending CL → chuột phải → **Shelve**. Sau đó có thể **Revert** file cục bộ; thay đổi vẫn an toàn trên server.
- Lấy lại: chuột phải shelved CL → **Unshelve**.
- CLI:
```bash
p4 shelve -c 1234        # shelve changelist 1234
p4 shelve -f -c 1234     # cập nhật lại nội dung đã shelve
p4 unshelve -s 1234      # lấy lại
```

> Shelve cũng là cơ chế nền cho **code review qua P4 Code Review (Swarm)**: reviewer xem nội dung shelved trước khi tác giả submit.
>
> Lưu ý: với file `+l`, shelve **không** nhả khóa — file vẫn do bạn giữ cho tới khi submit/revert.

---

<a name="10-tich-hop-ue-editor"></a>
## 10. Tích hợp trực tiếp trong Unreal Editor

Unreal Editor có **Revision Control** (UE ≤5.0 gọi là Source Control) tích hợp sẵn, giúp artist/designer thao tác mà không cần rời editor.

### 10.1. Kết nối Perforce trong UE
1. Trong Unreal Editor: icon **Revision Control** ở góc dưới phải → **Connect to Revision Control** (hoặc qua menu Tools).
2. Chọn **Provider: Perforce**.
3. Điền **Server (Port)**, **User**, **Workspace** (giống thông tin P4V).
4. Nhấn **Accept Settings**. Khi kết nối thành công, các icon trạng thái xuất hiện trên asset trong Content Browser.

> Mẹo: nếu đã đăng nhập P4V trên máy, UE thường tự điền sẵn thông tin.

### 10.2. Ý nghĩa icon trạng thái asset (Content Browser)
- **Không icon**: file ở bản mới nhất, chưa ai check out.
- **Dấu tick đỏ**: bạn đang check out (đang sửa).
- **Icon người dùng khác (đỏ)**: file đang bị người khác check out/khóa — di chuột lên xem tên ai.
- **Dấu cộng (+)**: file mới, đã mark for add, chưa submit.
- **Dấu chấm than/mũi tên vàng**: có bản mới hơn trên server — cần sync.
- **Dấu hỏi (?)**: file chưa nằm trong version control.

### 10.3. Thao tác ngay trong editor
- **Check Out**: khi bạn bắt đầu sửa asset, editor hỏi/tự động check out (tùy thiết lập ở 10.4).
- **Submit Content**: menu Revision Control → **Submit Content** → chọn asset, viết description, submit. Editor sẽ nhắc save các asset chưa lưu.
- **View Changelists**: menu Revision Control → **View Changelists** — xem/sắp xếp các pending changelist ngay trong editor. Cực kỳ quan trọng khi dùng OFPA (mục 11) vì cửa sổ này hiển thị **tên actor thật** thay vì tên file mã hóa.
- **Sync**: chuột phải asset/thư mục trong Content Browser → **Sync**.
- **Diff**: chuột phải asset → **Revision Control → Diff Against Depot / Diff Against Previous** (cách đúng để so sánh asset Unreal; với Blueprint sẽ mở Blueprint Diff trực quan).
- **Revert**: chuột phải → **Revert**.

> **Đây là luồng chính cho artist/designer.** Họ gần như chỉ cần làm việc trong editor; P4V chỉ mở khi cần xử lý nâng cao.

### 10.4. Thiết lập editor nên bật (một lần cho mỗi người)
Vào **Editor Preferences → Loading & Saving**:
- **Automatically Checkout on Asset Modification**: tự check out ngay khi bạn sửa asset (khuyến nghị cho artist), hoặc
- **Prompt for Checkout on Asset Modification**: hỏi trước khi check out (khuyến nghị cho người mới, để ý thức được mình đang khóa gì).
- **Add New Files when Modified/Saved**: tự mark for add file mới tạo.

### 10.5. Lưu ý quan trọng cho team UE
- **Luôn Save asset trong editor trước khi submit** (asset chưa save sẽ không phản ánh thay đổi).
- **Đổi tên/di chuyển asset PHẢI làm trong Content Browser** (engine tự sửa reference), rồi submit cả file cũ (delete/redirector) và mới (add) mà editor sinh ra.
- **Xóa asset**: dùng **Delete** trong Content Browser; UE sẽ kiểm tra reference trước.
- **Redirector**: khi move/rename, UE có thể để lại "redirector". Định kỳ (vd mỗi tuần, hoặc trước milestone) chạy **Fix Up Redirectors** trên thư mục Content rồi submit để dọn dẹp — phân công một người làm, tránh mỗi người tự chạy chồng chéo.

---
<a name="11-ofpa"></a>
## 11. OFPA & World Partition — nhiều người cùng làm một level

Đây là thay đổi lớn nhất của UE5 đối với workflow version control, và là mục **bắt buộc đọc** với level designer/environment artist.

### 11.1. Vấn đề cũ (UE4)
Toàn bộ nội dung level nằm trong **một file `.umap`** duy nhất. Vì `.umap` là `binary+l`, chỉ một người check out được → **cả team xếp hàng chờ nhau** để sửa level. Với map lớn, đây là nút thắt cổ chai kinh điển.

### 11.2. Giải pháp: One File Per Actor (OFPA)
Với OFPA, dữ liệu của **từng actor** trong level được lưu thành **file riêng** bên ngoài file level, trong thư mục:
```
Content/__ExternalActors__/<ĐườngDẫnLevel>/...
Content/__ExternalObjects__/<ĐườngDẫnLevel>/...
```
Hệ quả với Perforce:
- Di chuyển một cái cây trong level = check out **file actor của cái cây đó** (một `.uasset` nhỏ), **không đụng tới `.umap`**.
- Nhiều người có thể cùng làm **một level**, miễn là họ sửa **các actor khác nhau**.
- Các file actor vẫn là `.uasset` → vẫn `binary+l` → hai người không thể sửa **cùng một actor** — lock giờ hoạt động ở mức actor thay vì mức level.
- File `.umap` chỉ cần check out khi thay đổi cấp level (world settings, thêm data layer, v.v.).

OFPA **được bật mặc định khi dùng World Partition**. Với level thường, bật thủ công: **World Settings → World → Use External Actors** (mỗi level/sublevel bật riêng; có commandlet `ConvertLevelsToExternalActorsCommandlet` để convert hàng loạt level cũ kèm sublevel).

### 11.3. Quy tắc làm việc với OFPA (rất quan trọng)
1. **Submit các thay đổi level từ TRONG editor** (Submit Content / View Changelists) — đây là khuyến nghị chính thức của Epic khi dùng OFPA.
2. Lý do: tên file external actor là **chuỗi mã hóa khó đọc** (vd `Content/__ExternalActors__/Maps/City/4/XD/A1B2C3....uasset`). Trong P4V bạn không biết file nào là actor nào; trong cửa sổ **View Changelists** của editor, chúng hiển thị bằng **tên actor, level và loại asset thật**.
3. **Kiểm tra changelist trước khi submit**: submit thiếu file (vd submit actor mà quên file liên quan) có thể tạo **dangling reference** — level của người khác sync về bị lỗi thiếu actor.
4. **Không bao giờ ignore hay xóa tay** thư mục `__ExternalActors__` / `__ExternalObjects__` — chúng LÀ nội dung level.
5. OFPA chỉ tồn tại **trong editor**; khi cook/build game, actor được gộp trở lại vào level — không ảnh hưởng hiệu năng runtime.

### 11.4. Phối hợp trong team
- Level lớn nên quy ước **phân vùng theo khu vực** (mỗi người một khu) để giảm đụng nhau ở cùng actor, dù về kỹ thuật không bắt buộc.
- Với World Partition, dùng **World Partition Editor** để chỉ load các cell mình làm — vừa nhẹ máy vừa hạn chế check out lung tung.
- Producer/lead có thể xem ai đang giữ actor nào qua P4V (`p4 opened -a`) nếu cần gỡ tắc.

---

<a name="12-ugs"></a>
## 12. UnrealGameSync (UGS)

**UnrealGameSync (UGS)** là công cụ của Epic, là "mặt tiền" thân thiện cho Perforce dành riêng cho team Unreal (chỉ hoạt động với Perforce). Giá trị lớn nhất: **người không build code (artist/designer) vẫn có editor chạy được** mà không cần Visual Studio.

### 12.1. UGS giải quyết vấn đề gì?
- Programmer submit code → CI/build server biên dịch → đẩy **binary biên dịch sẵn (Precompiled Binaries / PCBs)** lên Perforce (dạng nén, kèm metadata CL).
- Artist mở UGS → chọn một changelist → UGS **sync code + asset + tải đúng binary tương ứng** → mở Unreal Editor. Artist không phải compile gì.

### 12.2. Tính năng chính của UGS
- Hiển thị dòng thời gian các **changelist** với mã màu (build pass/fail, có binary hay không).
- **Sync tới một CL cụ thể** (không phải lúc nào cũng head — chọn bản đã được đánh dấu "Good Build").
- Tự động tải **precompiled editor binaries** khớp CL.
- Hiển thị trạng thái CIS/build health từ hệ thống CI.
- Cho phép đánh dấu CL **Good/Bad**, ghi chú cho team.
- Tự chạy các bước setup (generate project files, v.v.) khi cần.

### 12.3. Workflow điển hình với UGS
1. Build engineer thiết lập **CI** (Horde — bộ công cụ đi kèm mã nguồn UE5 — hoặc Jenkins/TeamCity...) để build và publish PCBs sau mỗi CL code.
2. Artist mở UGS → thấy CL gần nhất được đánh dấu xanh (build tốt) → bấm **Sync**.
3. UGS tải code + asset + binary → bấm chạy editor.
4. Artist làm việc, check out/submit asset như bình thường (qua editor hoặc P4V).

### 12.4. Lưu ý
- UGS nằm trong mã nguồn UE tại `Engine/Source/Programs/UnrealGameSync`. Studio thường: build engineer build một lần rồi **phân phối bản cài nội bộ**; nếu dùng **Horde**, Horde có cơ chế phân phối và tự cập nhật UGS cho cả team.
- Bản **giao diện đồ họa của UGS chỉ có trên Windows**; macOS/Linux dùng bản dòng lệnh (`ugs`) — team thuần Windows (đa số studio UE) không bị ảnh hưởng.
- Phải thống nhất: **không version `Binaries/` thủ công** khi đã dùng PCB qua UGS, tránh xung đột.

> Tóm gọn: **Programmer + Build engineer** dựng hạ tầng UGS một lần; **Artist/Designer** chỉ cần bấm Sync và chạy.

---

<a name="13-streams-branching"></a>
## 13. Streams & chiến lược branching

**Streams** là cách Perforce hiện đại quản lý nhánh (branch) — định nghĩa rõ quan hệ cha–con và luồng chảy của thay đổi giữa các nhánh.

### 13.1. Các loại stream

| Loại | Vai trò | Vị trí trong sơ đồ |
|---|---|---|
| **Mainline** | Nhánh "xương sống", nguồn sự thật của project | Trung tâm |
| **Development** | Nhánh phát triển tính năng, **kém ổn định hơn Main** | "Dưới" mainline |
| **Release** | Nhánh đóng băng để phát hành, **ổn định hơn Main**, chỉ nhận bugfix | "Trên" mainline |
| **Task** | Nhánh ngắn hạn, siêu nhẹ, cho 1 việc nhỏ | Tạm thời |
| **Virtual** | Khung nhìn ảo lọc/thu hẹp một stream, không tốn storage | Lọc/định tuyến |

> Các bản P4 gần đây còn hỗ trợ **sparse stream** (nhánh "thưa") giúp tạo nhánh cho project rất lớn gần như tức thời — thuộc phạm vi của admin/tech lead.

### 13.2. Hai thao tác giữa stream — quy tắc "Merge down, Copy up"

Đây là câu thần chú chính thức của Perforce. Trục ổn định: **Release (ổn định nhất) — Main — Dev (kém ổn định nhất)**.

| Thao tác | Chiều | Ví dụ | Đặc điểm |
|---|---|---|---|
| **Merge** ("merge down") | Từ nhánh **ổn định hơn** xuống nhánh **kém ổn định hơn** | Main → Dev; Release → Main | Mang thay đổi mới nhất "xuống" cho nhánh con; có thể phải resolve |
| **Copy** ("copy up") | Từ nhánh **kém ổn định hơn** lên nhánh **ổn định hơn** | Dev → Main; Main → Release | Chỉ làm khi nhánh nguồn **đã merge đủ** từ cha (up-to-date); ghi đè 1:1, an toàn, không cần resolve |

Trình tự chuẩn khi hoàn thành một feature ở Dev:
1. **Merge down**: Main → Dev (lấy mọi thứ mới nhất về, resolve conflict tại Dev).
2. Build/test tại Dev cho ổn.
3. **Copy up**: Dev → Main (ghi đè sạch sẽ, Main không bao giờ phải resolve).

> Nhờ quy tắc này, nhánh ổn định (Main/Release) **không bao giờ là nơi xử lý conflict** — mọi hỗn loạn được giải quyết ở nhánh con trước khi đẩy lên. P4V hiển thị mũi tên gợi ý chiều merge/copy ngay trong **Stream Graph**.

### 13.3. Chiến lược gợi ý cho studio game vừa và nhỏ
```
//GameDepot/Release-1.0   <- đóng băng khi gần ship, chỉ nhận bugfix (copy up từ Main)
//GameDepot/Main          <- xương sống: luôn buildable
   └── //GameDepot/Dev-Feature  <- nhánh cho tính năng lớn/rủi ro
```

- **Studio nhỏ:** nhiều team chỉ dùng **một Main stream duy nhất** + UGS đánh dấu Good Build. Đơn giản, ít overhead — hoàn toàn hợp lệ.
- **Studio lớn / nhiều team:** tách Dev stream theo feature/team, định kỳ merge down – copy up với Main, tạo Release stream khi chuẩn bị phát hành.
- **Asset nhị phân và branching:** hạn chế sửa cùng một asset ở hai nhánh song song — asset không merge được, khi tích hợp sẽ phải chọn một bản. Quy ước: asset "sống" ở Main, nhánh Dev chủ yếu cho code/tính năng.

### 13.4. Switch stream trong P4V
- P4V có **Streams view** trực quan (sơ đồ các stream và quan hệ, kèm mũi tên chiều merge/copy).
- Đổi workspace sang stream khác: chuột phải stream → **Switch Workspace to Stream** (P4V sync phần chênh lệch).

> Branching chủ yếu là việc của **tech lead/build engineer**. Artist/designer thường chỉ làm trên một stream được chỉ định.

---
<a name="14-theo-vai-tro"></a>
## 14. Hướng dẫn theo từng vai trò

### 14.1. 👨‍💻 Lập trình viên (Programmer)
**Cần nắm:** sync, check out code, submit, resolve, shelve, branching, CLI, code review (P4 Code Review), UGS.

Quy trình chuẩn:
1. Đầu ngày: `p4 sync` (lấy code + asset mới).
2. Check out file code cần sửa (`p4 edit` — hoặc để plugin IDE tự làm).
3. Code, build local, test.
4. Trước submit: `p4 sync` lại → **resolve** nếu có conflict.
5. (Khuyến nghị) **Shelve** + tạo review trên P4 Code Review để được duyệt.
6. Submit với description rõ ràng, tham chiếu task Jira (vd `GD-123`).
7. CI build → publish PCB → team artist sync được qua UGS.

Mẹo:
- Cài **P4VS** (Visual Studio) hoặc plugin Perforce cho Rider/VS Code — IDE tự check out khi bạn gõ vào file, khỏi thao tác tay.
- Dùng **CLI** cho thao tác lặp lại và script.
- **Atomic commit**: 1 changelist = 1 thay đổi logic hoàn chỉnh, build được.
- Đừng submit code làm vỡ build của cả team (build local trước, hoặc chờ CI xanh với shelved CL nếu có hạ tầng).

### 14.2. 🎨 Artist / Designer
**Cần nắm:** sync, check out asset (qua editor), submit, hiểu exclusive lock, OFPA (mục 11), KHÔNG move asset ngoài editor.

Quy trình chuẩn:
1. Mở **UGS** → **Sync** bản Good Build → chạy Unreal Editor (không cần compile). (Nếu team chưa dùng UGS: Get Latest trong P4V rồi mở editor.)
2. Trong Content Browser: bắt đầu sửa asset → editor tự **Check Out** (asset bị khóa, người khác không sửa được).
3. Lưu asset trong editor.
4. **Submit Content** ngay trong editor, kiểm tra qua **View Changelists**, viết mô tả ngắn gọn.
5. Nếu sửa nhanh, **đừng giữ lock lâu** — check out, sửa, submit sớm để không chặn đồng đội.

Tuyệt đối tránh:
- ❌ Đổi tên/di chuyển asset bằng Windows Explorer hoặc P4V.
- ❌ Sửa asset mà quên check out (sẽ bị read-only hoặc tạo trạng thái lệch).
- ❌ Giữ check out hàng tuần một asset quan trọng (block cả team).
- ❌ Ignore/xóa tay thư mục `__ExternalActors__`, `__ExternalObjects__`.

### 14.3. 🛠️ Tech Lead / Build Engineer
**Cần nắm:** typemap, streams/branching, CI/CD, UGS setup, quyền (protections), quản lý PCB.

Trách nhiệm:
- Thiết lập **typemap** đúng cho UE (mục 6.1) — làm một lần, kiểm tra định kỳ.
- Định nghĩa **stream layout** và chiến lược merge down / copy up.
- Dựng **CI** (Horde/Jenkins/...) để build và publish **precompiled binaries** cho UGS.
- Quản lý **Good Build** / đánh dấu CL.
- Giám sát dung lượng depot, đặt `+S<n>` cho file build/tự-sinh nếu cần.
- Hỗ trợ team xử lý conflict/resolve phức tạp, merge giữa stream.

### 14.4. 📋 Producer / PM
**Cần nắm:** xem lịch sử, theo dõi tiến độ qua changelist, không nhất thiết thao tác file.

Có thể dùng:
- **P4V (read-only)** hoặc **P4 Code Review (web)** để xem changelist, ai đang làm gì, tiến độ.
- Liên kết changelist với task **Jira** (CL description có mã `GD-123`) để truy vết.
- Không cần check out/submit; chủ yếu theo dõi và phối hợp.

### 14.5. 🔧 Administrator
**Cần nắm:** cài/quản lý P4 Server (`p4d`), user/group, protections (phân quyền), backup, typemap, depot. Xem quickstart chi tiết ở **mục 15**.

Trách nhiệm thường trực:
- Vận hành và cập nhật **P4 Server**; theo dõi hiệu năng, dung lượng, log.
- Tạo **user**, **group**, đặt **protections** (ai đọc/ghi được depot nào):
  ```
  # ví dụ dòng protection (p4 protect)
  write group artists   * //GameDepot/Main/Content/...
  write group coders    * //GameDepot/...
  read  group producers * //GameDepot/...
  super user  admin_long * //...
  ```
- Cấu hình **typemap** toàn server (mục 6.1).
- **Backup: checkpoint + journal + versioned files** định kỳ, test khôi phục (mục 15.6) — sống còn với studio.
- Quản lý license/seat, ticket timeout, SSL, retention.

---

<a name="15-admin-quickstart"></a>
## 15. Quickstart dựng server (dành cho Admin)

Mục này đủ để dựng một server nội bộ tử tế cho studio nhỏ. Với môi trường production quan trọng, đọc thêm *P4 Server Administration Guide* chính thức.

### 15.1. Chuẩn bị hạ tầng
- Máy chủ Linux hoặc Windows, **SSD** (metadata Perforce rất nhạy IO), RAM ≥ 8–16 GB cho team nhỏ.
- Ổ/volume **riêng cho backup**, tách vật lý khỏi ổ dữ liệu chính.
- Cổng mặc định **1666** mở trong mạng nội bộ/VPN.

### 15.2. Cài P4 Server (`p4d`)
- **Windows**: bộ cài "Helix Core Server / P4 Server" từ perforce.com/downloads (cài dạng service).
- **Linux**: package chính thức qua `apt`/`yum` từ `package.perforce.com` (khuyến nghị — có systemd service, script `configure-helix-p4d.sh` dựng nhanh).
- **Docker**: image chính thức `perforce/helix-p4d` — tiện cho thử nghiệm/CI (lưu ý: tên image vẫn giữ chữ "helix" sau rebrand).

### 15.3. Ba quyết định phải chốt NGAY TỪ ĐẦU (đổi sau rất khó)
1. **Case-insensitive**: Epic khuyến nghị chạy Perforce server **không phân biệt hoa thường** để tránh lỗi với các tool như UGS (Windows vốn không phân biệt; nếu ai đó submit `Content/hero.uasset` và `Content/Hero.uasset` trên server case-sensitive, máy Windows sẽ vỡ trận). Trên Linux, p4d mặc định case-sensitive → khởi tạo với cờ **`-C1`**.
2. **Unicode mode** (khuyến nghị cho studio Việt): bật bằng `p4d -xi` (thao tác **một chiều**, làm khi server còn trống) để tên file/description tiếng Việt nhất quán trên mọi máy; client đặt `P4CHARSET=utf8` (P4V thường tự chọn).
3. **SSL**: bật để mã hóa đường truyền (P4PORT dạng `ssl:host:1666`), nhất là khi có người làm remote qua Internet/VPN.

### 15.4. Bảo mật cơ bản
```bash
p4 configure set security=3     # bắt buộc xác thực bằng ticket + mật khẩu mạnh
p4 passwd                        # đặt mật khẩu cho super user đầu tiên
p4 protect                       # thiết lập bảng phân quyền (mặc định user đầu = super)
```
- Ticket mặc định hết hạn sau **12 giờ**; chỉnh theo group bằng field **Timeout** trong `p4 group <tên>` (vd 1 tuần = `604800` cho group nội bộ, để artist đỡ bị "session expired" giữa chừng).
- Tạo group theo vai trò (`coders`, `artists`, `producers`) rồi phân quyền theo group, không theo từng user.

### 15.5. Tạo depot + stream + typemap (theo đúng thứ tự)
```bash
p4 depot -t stream GameDepot          # 1) tạo stream depot
p4 stream -t mainline //GameDepot/Main # 2) tạo mainline (mở form, save)
p4 typemap                             # 3) dán typemap UE (mục 6.1) TRƯỚC khi add file
```
Sau đó tạo workspace trỏ vào `//GameDepot/Main`, copy project UE vào root, add + submit lần đầu (nhớ `.p4ignore` đã đặt sẵn — mục 6.2).

### 15.6. Backup — việc quan trọng nhất của admin
Một bản backup Perforce hoàn chỉnh gồm **3 thứ**:
1. **Checkpoint** (ảnh chụp metadata): tạo hằng đêm bằng `p4 admin checkpoint` (hoặc `p4d -jc` khi bảo trì offline).
2. **Journal** (nhật ký giao dịch từ sau checkpoint): được rotate khi checkpoint; giữ lại để khôi phục tới giao dịch cuối cùng.
3. **Versioned files** (nội dung file trong depot trên đĩa): backup bằng công cụ backup file thông thường.

Kèm theo:
- Chạy `p4 verify -q //...` định kỳ (vd hằng tuần) để phát hiện sớm file hỏng/mất.
- **Diễn tập khôi phục** trên máy khác ít nhất mỗi quý — backup chưa từng restore thử là backup chưa tồn tại.

### 15.7. Giấy phép
- Miễn phí tới **5 user + 20 workspace**; vượt hạn mức thì mua license theo user (liên hệ Perforce), hoặc cân nhắc **P4 Cloud** nếu không muốn tự vận hành.
- Dọn user cũ (nhân viên nghỉ) bằng `p4 user -d` để trả seat; nhớ revert/unlock file họ còn giữ trước (mục 17).

---

<a name="16-best-practices"></a>
## 16. Best practices

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
6. **Không dùng Dropbox/Google Drive/NAS song song với Perforce** cho file project — chỉ một nguồn sự thật duy nhất.

### Riêng cho file Unreal
7. **Typemap đúng (`binary+l` cho .uasset/.umap) là điều kiện tiên quyết** — kiểm tra trước khi add file đầu tiên.
8. **Mọi thao tác asset (rename/move/delete) làm trong Content Browser**, không ngoài editor.
9. **Save asset trong editor trước khi submit.**
10. **Đừng version Saved/Intermediate/DerivedDataCache/Binaries** (trừ phương án binary-in-depot đã thống nhất với tech lead).
11. **Diff asset bằng tính năng của Unreal Editor**, không bằng P4Merge.
12. **Dùng OFPA cho level nhiều người làm** (mục 11) và **submit thay đổi level từ trong editor** qua View Changelists.

### Tổ chức
13. **1 người + 1 máy = 1 workspace**, tên theo quy ước `<user>_<project>_<os>`.
14. **Code review qua P4 Code Review + shelve** trước khi submit code rủi ro.
15. **Đừng làm vỡ build của Main** — đó là nhánh cả team phụ thuộc; conflict xử lý ở nhánh con (merge down, copy up — mục 13.2).

---

<a name="17-xu-ly-su-co"></a>
## 17. Xử lý sự cố thường gặp

### "File is exclusively opened by / locked by another user"
Asset đang bị người khác check out (do `+l`). Cách xử lý:
- Xem ai đang giữ: di chuột lên icon trong Content Browser, hoặc `p4 opened -a //GameDepot/Main/Content/.../BP_Hero.uasset`.
- **Liên hệ người đó** nhờ submit/revert — đây là cách đúng trong 95% trường hợp.
- Trường hợp khẩn (người giữ nghỉ phép/nghỉ việc), **admin** xử lý phía server:
  ```bash
  p4 opened -a //GameDepot/.../BP_Hero.uasset      # xem ai + workspace nào đang mở
  p4 revert -C ten_workspace_cua_ho //GameDepot/.../BP_Hero.uasset
  # -C nhận TÊN WORKSPACE (không phải tên user); cần quyền admin.
  # Lệnh chỉ gỡ trạng thái mở/khóa trên server — thay đổi chưa submit
  # trên máy người đó vẫn nằm nguyên trên đĩa của họ.
  p4 unlock -f //GameDepot/.../BP_Hero.uasset      # nếu file bị p4 lock thủ công
  ```

### "Your session has expired, please login again" (trong UE hoặc P4V)
Ticket đăng nhập hết hạn (mục 4.5). → Mở P4V đăng nhập lại hoặc `p4 login`. Nếu xảy ra quá thường xuyên, nhờ admin tăng **Timeout** của group (mục 15.4).

### "Must resolve files before submitting"
Có bản mới hơn trên server. → **Get Latest** → **Resolve** (mục 8) → submit lại.

### Asset bị read-only, không sửa được trong UE
Bạn chưa check out, hoặc kết nối Revision Control trong editor đang đứt. → Check out asset trong editor; kiểm tra icon Revision Control góc dưới phải (đỏ = mất kết nối → connect lại); nếu vẫn lạ, kiểm tra typemap với tech lead.

### "Can't clobber writable file" khi sync
Trên đĩa có file đang writable mà Perforce không quản lý trạng thái (thường do sửa không qua check out). → Chạy **Reconcile Offline Work** để đưa thay đổi vào changelist, hoặc nếu chắc chắn muốn bỏ bản local: revert/xóa file rồi sync lại. (Workspace có option `clobber` cho phép sync ghi đè, nhưng bật nó là con dao hai lưỡi — hỏi tech lead trước.)

### Reference bị hỏng sau khi move asset
Do move ngoài editor. → Dùng **Fix Up Redirectors** trong Content Browser; nếu vỡ nặng, revert và làm lại move trong editor.

### Workspace lệch trạng thái (file trên đĩa khác server nghĩ)
Dùng **Reconcile Offline Work** (`p4 reconcile`); hoặc **Get Latest** với force nếu cần (`p4 sync -f`, cẩn thận vì ghi đè cục bộ).

### Quên check out, lỡ sửa offline nhiều file
→ **Reconcile Offline Work** trên thư mục, P4V tự phát hiện và đưa vào changelist.

### Lỡ submit file rác / file khổng lồ vào depot
- File rác thường: **admin** có thể `p4 delete` + submit (file biến mất khỏi head nhưng lịch sử vẫn còn) — đủ dùng cho đa số trường hợp.
- File khổng lồ cần xóa hẳn khỏi lịch sử để đòi lại dung lượng: **`p4 obliterate`** (mặc định chạy preview; thêm `-y` mới xóa thật). ⚠️ **Xóa vĩnh viễn, không hoàn tác được, cần quyền super** — chỉ admin làm, sau khi backup.

### Sync rất chậm / project quá nặng
- Dùng SSD, mạng dây thay vì Wi-Fi.
- Cân nhắc **stream/virtual stream/view** chỉ map phần cần thiết.
- Team ở xa: admin cấu hình **P4 Proxy** (cache file ở văn phòng chi nhánh) hoặc **Edge/Replica server**.

### Kết nối lỗi
- Kiểm tra `p4 info` / `p4 -ztag info`.
- Nếu lỗi phân giải tên server: thử IP trực tiếp trong `P4PORT`, hoặc đổi DNS (vd 1.1.1.1 / 8.8.8.8).
- Kiểm tra firewall/VPN/cổng (mặc định 1666); server SSL thì P4PORT phải có tiền tố `ssl:`.

---
<a name="18-cli"></a>
## 18. Tham khảo lệnh p4 (CLI)

| Lệnh | Tác dụng |
|---|---|
| `p4 info` | Thông tin kết nối & server |
| `p4 login` / `p4 logout` | Đăng nhập / đăng xuất · `p4 login -s` xem ticket còn hạn không |
| `p4 set` | Xem/đặt biến môi trường (P4PORT, P4USER, P4CLIENT, P4IGNORE) |
| `p4 client` | Tạo/sửa workspace |
| `p4 sync` | Lấy bản mới nhất; `p4 sync //path/...@CL` lấy tới CL cụ thể |
| `p4 sync -f` | Force re-sync (ghi đè cục bộ — cẩn thận) |
| `p4 edit <file>` | Check out để sửa · `p4 edit -t <type>` đổi filetype |
| `p4 add <file>` | Đánh dấu thêm file mới |
| `p4 delete <file>` | Đánh dấu xóa |
| `p4 move <from> <to>` | Đổi tên/di chuyển (giữ lịch sử) |
| `p4 reconcile` | Đối soát work offline |
| `p4 revert <file>` | Hủy thay đổi, mở khóa |
| `p4 revert -a` | Revert các file thực ra không đổi |
| `p4 opened` / `p4 opened -a` | File đang mở của bạn / của tất cả mọi người |
| `p4 lock` / `p4 unlock` | Khóa/mở khóa thủ công file đang mở (`p4 unlock -f`: admin gỡ khóa hộ) |
| `p4 changes -m 10` | 10 changelist gần nhất (`-u <user>` lọc theo người) |
| `p4 change` | Tạo/sửa pending changelist |
| `p4 describe <CL>` | Xem chi tiết một changelist (file + diff) |
| `p4 submit -d "msg"` | Submit với mô tả |
| `p4 resolve` | Hòa giải conflict (`-am` auto-merge, `-as` chỉ nhận case an toàn) |
| `p4 shelve -c <CL>` / `p4 unshelve -s <CL>` | Gửi tạm / lấy lại |
| `p4 filelog <file>` | Lịch sử chi tiết một file |
| `p4 diff` / `p4 diff2` | So sánh phiên bản |
| `p4 have` / `p4 where` | Bản đang có trên máy / ánh xạ depot ↔ đĩa của một file |
| `p4 ignores -i <file>` | Kiểm tra một file có bị `.p4ignore` chặn không |
| `p4 typemap` | Xem/sửa typemap (admin) |
| `p4 protect` | Quản lý phân quyền (admin) |
| `p4 users` / `p4 groups` / `p4 group <tên>` | Quản lý user/group, chỉnh ticket Timeout (admin) |
| `p4 verify -q //...` | Kiểm tra toàn vẹn dữ liệu depot (admin) |
| `p4 admin checkpoint` | Tạo checkpoint backup (admin) |
| `p4 obliterate [-y]` | ⚠️ Xóa vĩnh viễn file khỏi lịch sử (super; mặc định chỉ preview) |

> Mẹo: dùng **P4CONFIG** — đặt `p4 set P4CONFIG=.p4config`, rồi trong gốc mỗi project tạo file `.p4config` chứa `P4PORT`, `P4USER`, `P4CLIENT` của project đó. CLI tự chuyển ngữ cảnh theo thư mục bạn đang đứng, rất tiện khi làm nhiều project.

---

<a name="19-thuat-ngu"></a>
## 19. Bảng thuật ngữ

| Thuật ngữ | Giải thích ngắn |
|---|---|
| **P4 / Perforce / Helix Core** | Cùng một sản phẩm; "Helix Core" là tên giai đoạn 2015–2025, nay là **Perforce P4** |
| **Depot** | Kho lưu file + lịch sử trên server (`//...`) |
| **Workspace / Client** | Bản đồ ánh xạ depot ↔ thư mục máy + file copy về |
| **Changelist (CL)** | Nhóm file submit cùng lúc, nguyên tử |
| **Pending / Submitted / Shelved CL** | CL đang sửa / đã gửi / để tạm trên server |
| **Revision** | Phiên bản của một file (`file#3`) |
| **Head / Have revision** | Bản mới nhất trên server / bản bạn đang có trên máy |
| **Sync / Get Latest** | Tải bản mới về máy |
| **Check out / Open for edit** | Báo server sắp sửa file (khóa nếu `+l`) |
| **Submit** | Gửi CL lên server |
| **Revert** | Hủy thay đổi cục bộ, mở khóa |
| **Resolve** | Hòa giải conflict |
| **Shelve / Unshelve** | Gửi tạm / lấy lại thay đổi chưa submit |
| **Typemap** | Bảng quy định loại file theo phần mở rộng (dòng khớp cuối cùng thắng) |
| **`+l` (exclusive lock)** | Chỉ 1 người check out file tại một thời điểm |
| **`+w` / `+S<n>`** | Luôn ghi được trên đĩa / chỉ giữ n bản gần nhất trên server |
| **`.p4ignore`** | Danh sách file/thư mục không add vào depot (không áp cho file đã version) |
| **Ticket** | "Vé" đăng nhập có thời hạn do `p4 login` tạo (hết hạn → đăng nhập lại) |
| **Stream** | Nhánh kiểu Perforce hiện đại (Mainline/Dev/Release/Task/Virtual) |
| **Merge down / Copy up** | Quy tắc chiều tích hợp giữa stream (mục 13.2) |
| **Reconcile** | Đối soát thay đổi làm offline với server |
| **OFPA (One File Per Actor)** | UE5 lưu mỗi actor của level thành file riêng → nhiều người cùng làm 1 level |
| **`__ExternalActors__` / `__ExternalObjects__`** | Thư mục trong Content chứa file actor/object của OFPA — bắt buộc version |
| **UGS (UnrealGameSync)** | Tool Epic: sync + tải binary biên dịch sẵn |
| **PCB (Precompiled Binaries)** | Binary editor build sẵn cho artist không phải compile |
| **Horde** | Bộ dịch vụ CI/build automation của Epic, tích hợp UGS |
| **P4 Code Review (Swarm)** | Web tool để code review/duyệt CL |
| **P4 One** | Client Perforce mới (2025) hướng tới artist |
| **Protections** | Bảng phân quyền đọc/ghi depot (admin) |
| **Checkpoint / Journal** | Ảnh chụp metadata / nhật ký giao dịch — nền tảng backup (admin) |

---

<a name="phu-luc-a"></a>
## Phụ lục A: Lộ trình đào tạo gợi ý cho thành viên mới

| Buổi | Nội dung | Đối tượng |
|---|---|---|
| 1 | Khái niệm cốt lõi (mục 1–3) + cài P4V, kết nối, tạo workspace (mục 4–5) | Tất cả |
| 2 | Workflow hàng ngày trong P4V (mục 7) + thực hành sync/check out/submit (bài tập C1–C5) | Tất cả |
| 3 | Tích hợp Unreal Editor + OFPA + UGS (mục 10–12) + bài tập C8–C9 | Artist/Designer/Programmer |
| 4 | Resolve, shelve, code review (mục 8–9) + CLI (mục 18) + bài tập C6–C7 | Programmer |
| 5 | Streams/branching, typemap, quickstart server, CI/PCB (mục 6, 13, 15) | Tech Lead/Build Engineer/Admin |

> Sau mỗi buổi, cho thành viên thực hành trên **project sandbox** (depot test, vd `//Sandbox/Main`) để không ảnh hưởng Main. Kết thúc lộ trình: làm bài capstone theo vai trò (Phụ lục C) + quiz (Phụ lục D).

---

<a name="phu-luc-b"></a>
## Phụ lục B: Checklist onboarding thành viên mới

### Cho mọi người
- [ ] Nhận tài khoản Perforce (user + mật khẩu khởi tạo) từ admin, đổi mật khẩu ngay.
- [ ] Cài P4V (kèm CLI). Kết nối server thành công (`p4 info` chạy ra thông tin).
- [ ] Tạo workspace đúng quy ước tên `<user>_<project>_<os>`, root trên ổ SSD.
- [ ] Đặt `P4IGNORE` (mục 6.3) và xác nhận `.p4ignore` có trong project.
- [ ] Sync toàn bộ project lần đầu; mở được project.
- [ ] Đọc mục 3 (khái niệm) và mục 7 (workflow hàng ngày).
- [ ] Biết kênh hỗ trợ nội bộ để hỏi khi gặp lỗi (kèm mục 17 để tự tra trước).
- [ ] Hoàn thành bài tập C1–C5 trên depot sandbox.

### Riêng Artist / Designer
- [ ] Kết nối Revision Control trong Unreal Editor (mục 10.1).
- [ ] Bật **Automatically/Prompt Checkout on Asset Modification** (mục 10.4).
- [ ] Chạy UGS, sync một bản Good Build, mở editor không cần compile (nếu team dùng UGS).
- [ ] Thực hành: check out → sửa → save → Submit Content một asset sandbox.
- [ ] Biết dùng View Changelists và Fix Up Redirectors.
- [ ] Đọc kỹ mục 11 (OFPA) nếu làm level.

### Riêng Programmer
- [ ] Cài plugin Perforce cho IDE (P4VS / Rider / VS Code).
- [ ] Generate project files từ `.uproject`, build thành công.
- [ ] Thực hành resolve một conflict text (bài C6) và shelve/unshelve (bài C7).
- [ ] Nắm quy ước description CL + mã task Jira của studio.
- [ ] Biết quy tắc merge down / copy up nếu làm việc đa stream.

### Riêng Tech Lead / Admin
- [ ] Có quyền truy cập server (SSH/RDP) + tài khoản super/admin Perforce.
- [ ] Đọc và kiểm tra lại typemap, protections, `.p4ignore` hiện hành.
- [ ] Nắm quy trình backup (checkpoint + journal + versioned files) và lịch verify.
- [ ] Biết xử lý: gỡ lock hộ, tăng ticket timeout, revert phía server (mục 17).

---

<a name="phu-luc-c"></a>
## Phụ lục C: Bài tập thực hành & capstone

> Tất cả bài tập làm trên depot sandbox (vd `//Sandbox/Main`) — admin tạo sẵn, ai phá cũng không sao. Bài C6, C9 cần làm theo cặp.

**C1 — Kết nối & workspace.** Tạo workspace sandbox đúng quy ước tên, sync về máy. *Đạt khi:* `p4 info` đúng user/client, thư mục root có nội dung depot.

**C2 — Add & submit đầu tiên.** Tạo file `notes/<tên bạn>.md`, Mark for Add, submit với description chuẩn (có mã task giả `SB-001`). *Đạt khi:* CL xuất hiện trong tab Submitted, đồng nghiệp sync thấy file của bạn.

**C3 — Check out, sửa, xem lịch sử.** Check out file của chính mình, sửa, submit. Mở File History và Time-lapse View, chỉ ra ai sửa gì ở từng revision. *Đạt khi:* đọc được lịch sử 2 revision.

**C4 — Exclusive lock.** Hai người cùng thử check out một file `.uasset` sandbox. *Đạt khi:* người thứ hai bị chặn, giải thích được vì sao (`binary+l`), và người một revert để nhả khóa.

**C5 — Revert.** Check out 2 file, chỉ sửa 1. Chạy **Revert Unchanged Files** rồi **Revert**. *Đạt khi:* hiểu khác biệt giữa hai lệnh và changelist sạch trước submit.

**C6 — Conflict & resolve (theo cặp, file text).** Cả hai cùng check out một file `.txt` (không có `+l`), cùng sửa các dòng khác nhau, người A submit trước. Người B submit → bị yêu cầu resolve → Get Latest → Resolve → Accept Merged/P4Merge. *Đạt khi:* file cuối chứa thay đổi của cả hai.

**C7 — Shelve & review.** Sửa file, shelve CL, nhờ đồng nghiệp unshelve xem thử trên máy họ, góp ý, rồi bạn submit. *Đạt khi:* mô tả được shelve khác submit chỗ nào.

**C8 — Trong Unreal Editor.** Mở project sandbox, tạo một Material mới (tự mark for add), sửa một asset có sẵn (tự check out), save, **Submit Content**. Sau đó move asset trong Content Browser sang thư mục khác, chạy **Fix Up Redirectors**, submit. *Đạt khi:* không còn redirector và reference không vỡ.

**C9 — OFPA (theo cặp).** Trong level sandbox bật OFPA/World Partition: người A di chuyển prop X, người B di chuyển prop Y, cả hai save + submit từ editor qua View Changelists. *Đạt khi:* cả hai submit thành công không chặn nhau; thử cả hai cùng sửa MỘT actor để thấy lock mức actor.

**C10 — CLI cơ bản (programmer).** Thực hiện trọn một vòng: `p4 sync` → `p4 edit` → sửa → `p4 revert -a` → `p4 submit -d` → `p4 changes -m 5`. *Đạt khi:* làm không cần mở P4V.

### Capstone theo vai trò

- **Artist/Designer:** nhận "đơn hàng" làm 1 prop hoàn chỉnh trong sandbox: sync bản Good Build (UGS nếu có) → tạo/import asset → đặt vào level OFPA → submit từ editor, description chuẩn, không giữ lock quá 1 giờ, không để redirector. Lead chấm qua lịch sử CL.
- **Programmer:** thêm 1 tính năng nhỏ (vd console command in ra tên map): check out qua IDE, build, tạo conflict giả với lead rồi resolve, shelve tạo review, sửa theo góp ý, submit atomic kèm mã task. Lead chấm qua P4 Code Review.
- **Tech Lead/Admin:** dựng từ đầu một depot sandbox mới: stream depot + mainline, typemap UE, `.p4ignore`, group + protections cho 3 vai trò, add project mẫu, chạy checkpoint + verify, và demo gỡ lock hộ một user. Chấm bằng checklist mục 15.

---

<a name="phu-luc-d"></a>
## Phụ lục D: Câu hỏi kiểm tra nhanh (quiz)

1. File `.uasset` và `.umap` phải có filetype nào trong typemap? Vì sao?
2. Đúng hay sai: thêm `Saved/` vào `.p4ignore` sẽ tự gỡ các file trong `Saved/` đã lỡ submit lên depot.
3. Điền chỗ trống: quy tắc chiều tích hợp giữa stream của Perforce là "Merge ____, Copy ____".
4. Shelve khác Submit ở điểm nào? Nêu một tình huống nên shelve.
5. Bạn đang check out một file `binary+l`. Đồng nghiệp có thể làm gì với file đó: (a) sửa và submit, (b) sync bản head hiện tại, (c) check out?
6. Cách đúng để đổi tên một asset Unreal là gì? Vì sao không dùng Windows Explorer?
7. Việc đầu tiên nên làm mỗi sáng trước khi mở editor là gì?
8. Lệnh nào cho biết ai đang mở/khóa một file trên toàn server?
9. Reconcile Offline Work dùng khi nào?
10. Với OFPA, hai người có thể cùng sửa một level không? Cùng một actor thì sao? File actor nằm ở thư mục nào?
11. UE báo "Your session has expired" — nghĩa là gì và xử lý ra sao?
12. UGS mang lại lợi ích gì cho artist không cài Visual Studio?

<details>
<summary><b>Đáp án</b></summary>

1. `binary+l` — file nhị phân không merge được nên cần khóa độc quyền, chỉ 1 người sửa tại một thời điểm.
2. **Sai** — `.p4ignore` chỉ chặn việc *add mới*; file đã version phải `p4 delete` + submit (hoặc admin obliterate nếu cần xóa lịch sử).
3. Merge **down**, Copy **up** (merge từ nhánh ổn định hơn xuống, copy từ nhánh con lên khi đã up-to-date).
4. Shelve đẩy thay đổi lên server nhưng **chưa** thành revision chính thức; dùng để nhờ review, chuyển máy, hoặc backup việc dở dang.
5. Chỉ **(b)**. Không thể check out (bị khóa) nên cũng không sửa/submit được.
6. Đổi tên **trong Content Browser** để engine cập nhật reference; đổi ngoài editor sẽ làm vỡ reference giữa các asset.
7. **Get Latest / `p4 sync`** — lấy bản mới nhất của team.
8. `p4 opened -a <file>` (hoặc di chuột lên icon trong Content Browser).
9. Khi đã lỡ sửa/thêm/xóa file mà không qua Perforce (làm offline, copy tay...) — để P4 đối soát và đưa vào changelist.
10. Có — OFPA tách mỗi actor thành file riêng trong `Content/__ExternalActors__` nên nhiều người cùng làm 1 level; nhưng **cùng một actor thì không** (file actor vẫn `binary+l`).
11. Ticket đăng nhập hết hạn — chỉ cần đăng nhập lại (P4V hoặc `p4 login`); không phải lỗi hệ thống.
12. UGS sync code + asset và tải **binary biên dịch sẵn (PCB)** khớp changelist → artist chạy được editor mà không cần compile.

</details>

---

<a name="phu-luc-e"></a>
## Phụ lục E: FAQ — câu hỏi thường gặp

**Tôi là artist, có bắt buộc học CLI không?**
Không. Luồng chuẩn của artist là Unreal Editor + P4V (+ UGS nếu team dùng). CLI dành cho programmer và người viết script/CI.

**Perforce có mất phí không?**
Miễn phí vĩnh viễn cho tối đa 5 user và 20 workspace. Studio đông hơn thì mua license theo user — việc của quản lý/admin, không ảnh hưởng cách bạn dùng hằng ngày.

**Sao không dùng Git/GitHub như các dự án phần mềm khác?**
Vì game có lượng lớn file nhị phân không merge được và project hàng chục–trăm GB — điểm yếu cốt tử của Git, điểm mạnh cốt lõi của Perforce (xem bảng so sánh mục 1). Studio vẫn có thể dùng Git song song cho tool web/pipeline riêng lẻ nằm ngoài project game.

**Máy tôi làm 2 project khác nhau thì sao?**
Tạo 2 workspace riêng (mỗi project một root). Dùng P4CONFIG (mục 18) để CLI tự chuyển ngữ cảnh theo thư mục.

**Tôi lỡ xóa nhầm file trên đĩa (chưa check out) — lấy lại kiểu gì?**
Chuột phải thư mục → Get Latest với tùy chọn force (`p4 sync -f` đúng file đó). File quay về đúng bản server.

**Làm việc từ xa/mạng yếu có dùng được không?**
Được, qua VPN tới server (nhớ P4PORT dạng `ssl:`). Nếu cả nhóm ở xa văn phòng, đề nghị admin cân nhắc P4 Proxy để tăng tốc sync.

**Tài liệu chính thức tiếng Anh ở đâu?**
- Perforce: `help.perforce.com` (P4 Server, P4V, quản trị).
- Epic: Unreal Engine Documentation → *Using Perforce as Source Control*, *One File Per Actor*, *UnrealGameSync*.
Lưu ý tên cũ/mới: "Helix Core" trong tài liệu cũ = "Perforce P4" hiện nay.

---

<a name="lich-su-phien-ban"></a>
## Lịch sử phiên bản tài liệu

| Phiên bản | Ngày | Thay đổi chính |
|---|---|---|
| 1.0 | 2026 | Bản gốc: khái niệm, workflow P4V, typemap/p4ignore, UE editor, UGS, streams, vai trò, sự cố, CLI, thuật ngữ. |
| 2.0 | 04/07/2026 | Cập nhật rebrand **Helix Core → Perforce P4** (3/2025) + P4 Code Review/P4 One; **sửa chiều Copy/Merge streams** theo đúng "merge down, copy up"; **sửa lệnh admin gỡ khóa** (`p4 revert -C <workspace>`, `p4 unlock -f`); typemap đối chiếu bản khuyến nghị của Epic + dòng `_BuiltData.uasset +wS2`; `.p4ignore`: bỏ ignore nhầm `Build/` và `Script/`, thêm ghi chú cú pháp; **mục mới**: OFPA & World Partition (11), Quickstart dựng server cho admin (15); bổ sung ticket/phiên đăng nhập, licensing/free tier, thiết lập Editor Preferences, obliterate/clobber vào sự cố; **phụ lục mới**: checklist onboarding (B), 10 bài tập + capstone (C), quiz 12 câu (D), FAQ (E). |

---

*Tài liệu nội bộ — góp ý/chỉnh sửa: liên hệ người phụ trách đào tạo hoặc tech lead. Khi Perforce/Epic thay đổi sản phẩm, ưu tiên tài liệu chính thức mới nhất.*
