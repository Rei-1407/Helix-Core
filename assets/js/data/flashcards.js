/* =========================================================================
   flashcards.js — Bộ thẻ ôn tập lặp lại ngắt quãng (bám tài liệu v2.0).
   Mỗi thẻ: { id, topic (số mục), q (câu hỏi), a (đáp án, cho phép HTML nhẹ) }.
   Thêm nội dung ôn: thêm thẻ vào mảng này (id không trùng).
   ========================================================================= */

export const FLASHCARDS = [
  // --- Mục 1: P4 là gì ---
  { id: 'f101', topic: 1, q: 'Perforce/Helix Core thuộc mô hình quản lý phiên bản nào?', a: 'Hệ <strong>tập trung (centralized)</strong> — toàn bộ lịch sử nằm trên một server trung tâm; mỗi máy chỉ giữ workspace các file cần.' },
  { id: 'f102', topic: 1, q: 'Chuyện đổi tên: "Helix Core" nay là gì?', a: 'Ban đầu là <strong>Perforce (P4)</strong> → đổi thành <strong>Helix Core</strong> (2015) → từ 3/2025 quay lại thành <strong>Perforce P4</strong> (P4 Platform). Cùng một sản phẩm, lệnh CLI không đổi.' },
  { id: 'f103', topic: 1, q: 'Lý do <em>then chốt</em> game studio chọn Perforce thay vì Git?', a: 'Game có nhiều file <strong>nhị phân không merge được</strong> (.uasset, model, texture). Perforce có <strong>exclusive lock (+l)</strong> — chỉ 1 người check out một file tại một thời điểm. Git không làm tốt việc này.' },
  { id: 'f104', topic: 1, q: 'Perforce miễn phí tới mức nào?', a: 'Miễn phí vĩnh viễn cho tối đa <strong>5 user và 20 workspace</strong>. Vượt thì mua license theo user, hoặc dùng <strong>P4 Cloud</strong> (SaaS).' },

  // --- Mục 2: Thành phần ---
  { id: 'f201', topic: 2, q: 'Thành phần <code>p4d</code> là gì?', a: '<strong>P4 Server</strong> (tên cũ: Helix Core Server) — lưu depot, lịch sử, quản lý quyền. Do admin cài & quản lý.' },
  { id: 'f202', topic: 2, q: 'P4V là gì và ai dùng?', a: '<strong>P4 Visual Client</strong> — app GUI thao tác hàng ngày. <strong>Mọi vai trò</strong> đều dùng.' },
  { id: 'f203', topic: 2, q: '"P4 Code Review" và "Horde" là gì?', a: '<strong>P4 Code Review</strong> (tên cũ Helix Swarm) — duyệt changelist qua web. <strong>Horde</strong> — bộ CI/build automation của Epic đi kèm mã nguồn UE5, tích hợp UGS.' },
  { id: 'f204', topic: 2, q: 'UnrealGameSync (UGS) là công cụ của ai, giá trị lớn nhất?', a: 'Của <strong>Epic</strong>. Giá trị: người không build code (artist) vẫn có <strong>editor chạy được</strong> nhờ tải binary biên dịch sẵn, không cần Visual Studio.' },

  // --- Mục 3: Khái niệm cốt lõi ---
  { id: 'f301', topic: 3, q: 'Depot là gì? Đường dẫn bắt đầu bằng?', a: 'Kho server lưu file + toàn bộ lịch sử. Đường dẫn bắt đầu bằng <code>//</code>, ví dụ <code>//GameDepot/Main/...</code>' },
  { id: 'f302', topic: 3, q: 'Workspace (Client) là gì?', a: '<strong>Bản đồ ánh xạ</strong> giữa file trên depot và thư mục trên máy + chính các file copy về. Gồm <strong>Root</strong> và <strong>View/Mapping</strong>.' },
  { id: 'f303', topic: 3, q: 'Quy tắc vàng về workspace?', a: '<strong>1 người + 1 máy = 1 workspace.</strong> Licensing tính theo user (không theo workspace) nên cứ theo đúng quy tắc.' },
  { id: 'f304', topic: 3, q: 'Changelist (CL) là gì? Tính chất quan trọng nhất?', a: 'Nhóm file submit cùng lúc. Tính chất: <strong>nguyên tử (atomic)</strong> — all-or-nothing.' },
  { id: 'f305', topic: 3, q: 'Phân biệt Head revision và Have revision.', a: '<strong>Head</strong> = bản mới nhất trên server. <strong>Have</strong> = bản bạn đang có trên máy.' },
  { id: 'f306', topic: 3, q: 'Cờ <code>+l</code> nghĩa là gì, bắt buộc cho loại file nào?', a: '<code>+l</code> = <strong>exclusive lock</strong>, chỉ 1 người check out được tại một thời điểm. Bắt buộc cho <code>.uasset</code> và <code>.umap</code>.' },
  { id: 'f307', topic: 3, q: 'Cờ <code>+w</code> và <code>+S&lt;n&gt;</code> nghĩa là gì?', a: '<code>+w</code> = luôn ghi được trên đĩa (không read-only). <code>+S&lt;n&gt;</code> = server chỉ giữ n bản gần nhất (tiết kiệm dung lượng).' },
  { id: 'f308', topic: 3, q: 'Typemap là gì? Quy tắc khớp nhiều dòng?', a: 'Bảng cấu hình <strong>toàn server</strong> quyết định file nào nhận type gì theo phần mở rộng. Khi khớp nhiều dòng → <strong>dòng khớp cuối cùng thắng</strong>.' },

  // --- Mục 4: Cài đặt & kết nối ---
  { id: 'f401', topic: 4, q: 'Ba thông tin cần xin admin để kết nối?', a: '<strong>Server (P4PORT)</strong> (dạng <code>ssl:host:1666</code>), <strong>User</strong>, <strong>Password</strong> khởi tạo.' },
  { id: 'f402', topic: 4, q: 'Lệnh kiểm tra kết nối + thông tin server?', a: '<code>p4 info</code> (sau khi <code>p4 login</code>).' },
  { id: 'f403', topic: 4, q: '<code>p4 login</code> tạo ra gì? Vì sao thỉnh thoảng "hết hạn"?', a: 'Tạo một <strong>ticket</strong> có thời hạn (mặc định ~12h), không lưu mật khẩu. Hết hạn → báo "session expired" → chỉ cần đăng nhập lại. Xem hạn: <code>p4 login -s</code>.' },

  // --- Mục 5: Workspace ---
  { id: 'f501', topic: 5, q: 'Dòng bắt đầu bằng <code>-</code> trong View mapping nghĩa là gì?', a: '<strong>Loại trừ (exclude)</strong> — phần đó không sync về. Để loại file rác UE thì dùng <code>.p4ignore</code>, không dùng view.' },
  { id: 'f502', topic: 5, q: 'Sau khi tạo workspace, việc đầu tiên nên làm?', a: 'Chạy <strong>Get Latest Revision</strong> trên thư mục gốc để tải toàn bộ project về (có thể vài chục GB).' },
  { id: 'f503', topic: 5, q: 'Đổi sang stream khác có cần tạo workspace mới?', a: '<strong>Không.</strong> Chuột phải stream → <strong>Switch Workspace to Stream</strong>, P4V sync phần chênh lệch. Đừng tạo workspace tràn lan.' },

  // --- Mục 6: Cấu hình UE ---
  { id: 'f601', topic: 6, q: '<code>.uasset</code>/<code>.umap</code> đặt type gì? Code? File build?', a: 'Asset = <code>binary+l</code>. Code = <code>text</code>. File build (.exe/.dll/.pdb) = <code>binary+w</code>.' },
  { id: 'f602', topic: 6, q: 'Typemap phải cấu hình khi nào?', a: '<strong>Trước khi add file đầu tiên.</strong> Typemap không áp ngược cho file đã version — nếu add sai type phải sửa bằng <code>p4 edit -t binary+l</code>.' },
  { id: 'f603', topic: 6, q: '<code>.p4ignore</code> có tự gỡ file đã submit không?', a: '<strong>Không.</strong> <code>.p4ignore</code> chỉ chặn việc <strong>add mới</strong>. File đã version phải <code>p4 delete</code> + submit (hoặc admin obliterate).' },
  { id: 'f604', topic: 6, q: 'Thư mục nào PHẢI version, thư mục nào ignore?', a: 'Version: <code>Config/</code>, <code>Content/</code>, <code>Source/</code>, <code>Build/</code>, <code>.uproject</code>. Ignore: <code>Binaries/</code>, <code>Intermediate/</code>, <code>Saved/</code>, <code>DerivedDataCache/</code>.' },

  // --- Mục 7: Workflow ---
  { id: 'f701', topic: 7, q: 'Việc đầu tiên mỗi sáng trước khi làm?', a: '<strong>Get Latest / <code>p4 sync</code></strong> để lấy bản mới nhất, tránh làm trên bản cũ.' },
  { id: 'f702', topic: 7, q: 'Lệnh check out (mở sửa) một file?', a: '<code>p4 edit &lt;file&gt;</code>. Với file <code>+l</code> sẽ khóa file.' },
  { id: 'f703', topic: 7, q: 'Đổi tên/di chuyển: file thường vs asset Unreal?', a: 'File thường (code, config): <code>p4 move</code> (giữ lịch sử). Asset Unreal: <strong>phải làm trong Content Browser</strong> để engine cập nhật reference.' },
  { id: 'f704', topic: 7, q: 'Reconcile Offline Work dùng khi nào?', a: 'Khi lỡ sửa/thêm/xóa file mà không qua Perforce (làm offline). P4 đối soát đĩa với server, đưa vào changelist (<code>p4 reconcile</code>).' },
  { id: 'f705', topic: 7, q: '"Revert Unchanged Files" (<code>p4 revert -a</code>) làm gì?', a: 'Bỏ check out những file thực ra <strong>không thay đổi</strong> → changelist sạch. Nên chạy trước khi submit.' },

  // --- Mục 8: Resolve ---
  { id: 'f801', topic: 8, q: 'Conflict ("must resolve") xảy ra khi nào?', a: 'Khi bạn check out một file, nhưng người khác đã <strong>submit revision mới hơn</strong> của chính file đó.' },
  { id: 'f802', topic: 8, q: 'File CODE (text) bị conflict trộn bằng gì?', a: '<strong>P4Merge</strong> — 3 phần (Yours/Base/Theirs). CLI: <code>p4 resolve -am</code> (auto-merge phần trộn được).' },
  { id: 'f803', topic: 8, q: 'Asset Unreal (binary) khi resolve chỉ có lựa chọn nào?', a: 'Chỉ <strong>Accept Yours</strong> hoặc <strong>Accept Theirs</strong> — không auto-merge. Đó là lý do dùng <code>+l</code> để tránh conflict từ đầu.' },

  // --- Mục 9: Shelve ---
  { id: 'f901', topic: 9, q: 'Shelve là gì? Khác submit chỗ nào?', a: 'Đẩy thay đổi lên server <strong>mà chưa thành revision chính thức</strong>. Dùng để nhờ review, chuyển máy, hoặc backup việc dở dang.' },
  { id: 'f902', topic: 9, q: 'Với file <code>+l</code>, shelve có nhả khóa không?', a: '<strong>Không.</strong> File vẫn do bạn giữ tới khi submit/revert.' },
  { id: 'f903', topic: 9, q: 'Lệnh shelve và unshelve changelist 1234?', a: '<code>p4 shelve -c 1234</code> để shelve, <code>p4 unshelve -s 1234</code> để lấy lại.' },

  // --- Mục 10: UE Editor ---
  { id: 'f1001', topic: 10, q: 'Cách ĐÚNG để diff asset Unreal?', a: 'Dùng <strong>Diff trong Unreal Editor</strong> (Revision Control → Diff Against Depot). KHÔNG dùng P4Merge vì nó không hiểu <code>.uasset</code>.' },
  { id: 'f1002', topic: 10, q: 'Cửa sổ nào trong editor giúp xem/submit changelist với tên thật?', a: '<strong>View Changelists</strong> (menu Revision Control) — hiển thị tên actor/asset thật, cực quan trọng khi dùng OFPA.' },
  { id: 'f1003', topic: 10, q: 'Redirector là gì và xử lý thế nào?', a: 'Khi move/rename asset, UE có thể để lại "redirector". Định kỳ chạy <strong>Fix Up Redirectors</strong> trên thư mục Content rồi submit — phân công một người làm.' },

  // --- Mục 11: OFPA ---
  { id: 'f1101', topic: 11, q: 'OFPA (One File Per Actor) giải quyết vấn đề gì?', a: 'UE4: cả level trong một <code>.umap</code> (binary+l) → cả team xếp hàng chờ sửa level. OFPA lưu <strong>mỗi actor thành file riêng</strong> → nhiều người cùng làm một level.' },
  { id: 'f1102', topic: 11, q: 'File actor của OFPA nằm ở đâu? Có được xóa/ignore tay không?', a: 'Trong <code>Content/__ExternalActors__</code> và <code>__ExternalObjects__</code>. <strong>Tuyệt đối KHÔNG</strong> ignore/xóa tay — chúng LÀ nội dung level.' },
  { id: 'f1103', topic: 11, q: 'Với OFPA: 2 người cùng 1 level được không? Cùng 1 actor?', a: 'Cùng level: <strong>được</strong> (miễn khác actor). Cùng một actor: <strong>không</strong> — file actor vẫn <code>binary+l</code>, khóa ở mức actor.' },
  { id: 'f1104', topic: 11, q: 'Khi dùng OFPA, nên submit thay đổi level từ đâu?', a: 'Từ <strong>trong Unreal Editor</strong> (Submit Content / View Changelists) — vì tên file external actor là chuỗi mã hóa khó đọc trong P4V.' },

  // --- Mục 12: UGS ---
  { id: 'f1201', topic: 12, q: 'PCB (Precompiled Binaries) là gì?', a: '<strong>Binary editor build sẵn</strong> do CI publish lên Perforce, để artist không phải compile. UGS tải bản khớp changelist.' },
  { id: 'f1202', topic: 12, q: 'Khi dùng PCB qua UGS, có version <code>Binaries/</code> thủ công không?', a: '<strong>Không.</strong> Tránh xung đột với binary do UGS phát.' },
  { id: 'f1203', topic: 12, q: 'UGS cho sync tới đâu (không nhất thiết head)?', a: 'Tới một <strong>changelist cụ thể</strong> đã được đánh dấu <strong>Good Build</strong> (mã màu xanh).' },

  // --- Mục 13: Streams ---
  { id: 'f1301', topic: 13, q: 'Quy tắc chiều tích hợp giữa các stream?', a: '<strong>"Merge down, Copy up".</strong> Merge từ nhánh ổn định hơn XUỐNG nhánh con (resolve tại đó); Copy từ nhánh con LÊN khi đã up-to-date (ghi đè 1:1, an toàn).' },
  { id: 'f1302', topic: 13, q: 'Vì sao nhánh Main/Release không bao giờ phải resolve?', a: 'Nhờ quy tắc merge down – copy up: mọi conflict được xử lý ở <strong>nhánh con</strong> trước, rồi mới copy up ghi đè sạch lên nhánh ổn định.' },
  { id: 'f1303', topic: 13, q: 'Vai trò Mainline và Virtual stream?', a: '<strong>Mainline</strong> = xương sống, nguồn sự thật, luôn buildable. <strong>Virtual</strong> = khung nhìn ảo lọc/thu hẹp một stream, không tốn storage.' },
  { id: 'f1304', topic: 13, q: 'Studio nhỏ nên dùng chiến lược branching nào?', a: 'Thường chỉ <strong>một Main stream duy nhất</strong> + UGS đánh dấu Good Build. Đơn giản, ít overhead.' },

  // --- Mục 14: Vai trò ---
  { id: 'f1401', topic: 14, q: 'Ba–bốn điều artist/designer TUYỆT ĐỐI tránh?', a: '❌ Move/rename asset ngoài editor. ❌ Sửa asset mà quên check out. ❌ Giữ lock lâu asset quan trọng. ❌ Ignore/xóa tay <code>__ExternalActors__</code>.' },

  // --- Mục 15: Admin quickstart ---
  { id: 'f1501', topic: 15, q: 'Vì sao Epic khuyến nghị server case-INsensitive?', a: 'Windows không phân biệt hoa thường; nếu server case-sensitive và ai đó submit cả <code>Hero.uasset</code> lẫn <code>hero.uasset</code>, máy Windows vỡ trận. Trên Linux khởi tạo với cờ <code>-C1</code>.' },
  { id: 'f1502', topic: 15, q: 'Một bản backup Perforce hoàn chỉnh gồm 3 thứ gì?', a: '<strong>Checkpoint</strong> (ảnh chụp metadata) + <strong>Journal</strong> (giao dịch sau checkpoint) + <strong>Versioned files</strong> (nội dung file trên đĩa). Nhớ diễn tập khôi phục.' },
  { id: 'f1503', topic: 15, q: 'Thứ tự đúng khi khởi tạo depot cho UE?', a: '1) Tạo <strong>stream depot</strong> → 2) tạo <strong>mainline</strong> → 3) dán <strong>typemap</strong> (TRƯỚC khi add file) → rồi mới add project.' },

  // --- Mục 16: Best practices ---
  { id: 'f1601', topic: 16, q: '"Atomic commit" nghĩa là gì?', a: 'Mỗi changelist là <strong>một thay đổi logic hoàn chỉnh</strong>, build/chạy được. Dễ review, dễ rollback.' },
  { id: 'f1602', topic: 16, q: 'Vì sao không dùng Dropbox/Drive/NAS song song với Perforce?', a: 'Phải có <strong>một nguồn sự thật duy nhất</strong>. Đồng bộ đám mây song song trên thư mục project sẽ gây xung đột trạng thái file.' },

  // --- Mục 17: Sự cố ---
  { id: 'f1701', topic: 17, q: '"File is locked by another user" — xử lý thế nào?', a: 'Xem ai giữ (<code>p4 opened -a &lt;file&gt;</code>), <strong>liên hệ họ</strong> nhờ submit/revert. Khẩn cấp: admin dùng <code>p4 revert -C &lt;tên workspace&gt; &lt;file&gt;</code> (nhận tên workspace, không phải user).' },
  { id: 'f1702', topic: 17, q: 'Lỡ submit file khổng lồ, muốn xóa hẳn khỏi lịch sử?', a: '<code>p4 obliterate</code> (mặc định chỉ preview; thêm <code>-y</code> mới xóa thật). ⚠️ Xóa vĩnh viễn, cần quyền super — chỉ admin làm sau khi backup. (<code>p4 delete</code> chỉ ẩn khỏi head.)' },
  { id: 'f1703', topic: 17, q: '"Can\'t clobber writable file" khi sync là gì?', a: 'Trên đĩa có file writable mà Perforce không quản lý trạng thái (sửa không qua check out). → Chạy <strong>Reconcile Offline Work</strong>, hoặc revert/xóa bản local rồi sync lại.' },

  // --- Mục 18: CLI ---
  { id: 'f1801', topic: 18, q: 'Lệnh liệt kê TẤT CẢ file đang mở của mọi người?', a: '<code>p4 opened -a</code>. (Chỉ của bạn: <code>p4 opened</code>.)' },
  { id: 'f1802', topic: 18, q: 'Lệnh force re-sync ghi đè cục bộ, và vì sao cẩn thận?', a: '<code>p4 sync -f</code> — ghi đè file cục bộ bằng bản server, có thể <strong>mất thay đổi chưa lưu</strong>.' },
  { id: 'f1803', topic: 18, q: '<code>p4 describe &lt;CL&gt;</code> và <code>p4 changes -m 10</code> làm gì?', a: '<code>p4 describe</code> xem chi tiết một changelist (file + diff). <code>p4 changes -m 10</code> xem 10 changelist gần nhất.' },
  { id: 'f1804', topic: 18, q: 'P4CONFIG (<code>.p4config</code>) dùng để làm gì?', a: 'Đặt <code>p4 set P4CONFIG=.p4config</code>, mỗi project có <code>.p4config</code> riêng ở gốc chứa P4PORT/P4USER/P4CLIENT → CLI tự chuyển ngữ cảnh theo thư mục.' },
];
