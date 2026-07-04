/* =========================================================================
   flashcards.js — Bộ thẻ ôn tập lặp lại ngắt quãng.
   Mỗi thẻ: { id, topic (số mục trong tài liệu), q (câu hỏi), a (đáp án, cho phép HTML nhẹ) }.
   Muốn thêm nội dung ôn: chỉ cần thêm thẻ vào mảng này (id không trùng).
   ========================================================================= */

export const FLASHCARDS = [
  // --- Mục 1: Helix Core là gì ---
  { id: 'c101', topic: 1, q: 'Helix Core tên cũ là gì và thuộc mô hình quản lý phiên bản nào?', a: 'Tên cũ là <strong>Perforce</strong>. Đây là hệ quản lý phiên bản <strong>tập trung (centralized)</strong> — toàn bộ lịch sử nằm trên một server trung tâm.' },
  { id: 'c102', topic: 1, q: 'Lý do <em>then chốt</em> khiến game studio chọn Perforce thay vì Git là gì?', a: 'Game có rất nhiều file <strong>nhị phân không merge được</strong> (.uasset, model, texture). Perforce hỗ trợ <strong>exclusive lock (+l)</strong> — chỉ một người check out một file tại một thời điểm. Git không làm tốt việc này.' },
  { id: 'c103', topic: 1, q: 'So sánh mô hình lưu lịch sử của Git và Helix Core.', a: 'Git <strong>phân tán</strong> (mỗi máy có full history). Helix Core <strong>tập trung</strong> (history ở server, máy chỉ giữ bản làm việc).' },

  // --- Mục 2: Thành phần ---
  { id: 'c201', topic: 2, q: 'Thành phần <code>p4d</code> là gì?', a: '<strong>Helix Core Server</strong> — lưu depot, lịch sử, quản lý quyền. Do admin cài và quản lý.' },
  { id: 'c202', topic: 2, q: 'P4V là gì và ai dùng?', a: '<strong>Helix Visual Client</strong> — app GUI thao tác hàng ngày. <strong>Mọi vai trò</strong> đều dùng.' },
  { id: 'c203', topic: 2, q: 'Helix Swarm dùng để làm gì?', a: '<strong>Code review</strong> — duyệt changelist qua giao diện web. Chủ yếu programmer và tech lead dùng.' },
  { id: 'c204', topic: 2, q: 'UnrealGameSync (UGS) là công cụ của ai, giá trị lớn nhất là gì?', a: 'Của <strong>Epic</strong>. Giá trị lớn nhất: người không build code (artist/designer) vẫn có <strong>editor chạy được</strong> nhờ tải binary biên dịch sẵn, không cần Visual Studio.' },

  // --- Mục 3: Khái niệm cốt lõi ---
  { id: 'c301', topic: 3, q: 'Depot là gì? Đường dẫn bắt đầu bằng ký tự nào?', a: 'Nơi server lưu file và toàn bộ lịch sử. Đường dẫn bắt đầu bằng <code>//</code>, ví dụ <code>//GameDepot/Main/...</code>' },
  { id: 'c302', topic: 3, q: 'Workspace (Client) là gì?', a: '<strong>Bản đồ ánh xạ</strong> giữa file trên depot và thư mục trên máy, cộng với chính các file copy về máy. Gồm <strong>Root</strong> và <strong>View/Mapping</strong>.' },
  { id: 'c303', topic: 3, q: 'Quy tắc vàng về workspace?', a: '<strong>1 người + 1 máy = 1 workspace.</strong> Không dùng chung workspace giữa nhiều máy.' },
  { id: 'c304', topic: 3, q: 'Changelist (CL) là gì? Tính chất quan trọng nhất?', a: 'Một nhóm file được submit cùng lúc. Tính chất: <strong>nguyên tử (atomic)</strong> — all-or-nothing, submit lỗi thì cả CL không được ghi.' },
  { id: 'c305', topic: 3, q: 'Phân biệt Head revision và Have revision.', a: '<strong>Head revision</strong> = bản mới nhất trên server. <strong>Have revision</strong> = bản bạn đang có trên máy.' },
  { id: 'c306', topic: 3, q: 'Cờ file type <code>+l</code> nghĩa là gì và bắt buộc cho loại file nào?', a: '<code>+l</code> = <strong>exclusive lock</strong>, chỉ 1 người check out được tại một thời điểm. Bắt buộc cho <code>.uasset</code> và <code>.umap</code>.' },
  { id: 'c307', topic: 3, q: 'Typemap là gì?', a: 'Bảng cấu hình <strong>toàn server</strong> quyết định file nào nhận type gì theo phần mở rộng. Phải cấu hình ngay khi dựng server cho UE.' },
  { id: 'c308', topic: 3, q: 'Cờ <code>+w</code> và <code>+S</code> nghĩa là gì?', a: '<code>+w</code> = always writable trên đĩa. <code>+S</code> = chỉ giữ N bản gần nhất (tiết kiệm dung lượng).' },
  { id: 'c309', topic: 3, q: 'Revert làm gì với file đang lock?', a: 'Hủy thay đổi cục bộ, đưa file về bản trên server, và <strong>mở khóa</strong> nếu đang lock.' },

  // --- Mục 4: Cài đặt & kết nối ---
  { id: 'c401', topic: 4, q: 'Ba thông tin cần xin admin để kết nối?', a: '<strong>Server (P4PORT)</strong>, <strong>User</strong>, và <strong>Password</strong> (nếu server bật xác thực).' },
  { id: 'c402', topic: 4, q: 'P4PORT có dạng như thế nào?', a: 'Dạng <code>ssl:perforce.studio.com:1666</code> hoặc <code>192.168.1.10:1666</code>. Cổng mặc định là <strong>1666</strong>.' },
  { id: 'c403', topic: 4, q: 'Lệnh nào kiểm tra kết nối và thông tin server?', a: '<code>p4 info</code> (sau khi <code>p4 login</code>).' },
  { id: 'c404', topic: 4, q: 'Lần đầu kết nối server dùng <code>ssl:</code> sẽ được hỏi gì?', a: 'Hỏi tin cậy <strong>fingerprint</strong> → chọn <strong>Trust</strong>.' },

  // --- Mục 5: Workspace ---
  { id: 'c501', topic: 5, q: 'Dòng bắt đầu bằng <code>-</code> trong View mapping nghĩa là gì?', a: '<strong>Loại trừ (exclude)</strong> — phần đó không được sync về máy.' },
  { id: 'c502', topic: 5, q: 'Sau khi tạo workspace, việc đầu tiên nên làm là gì?', a: 'Chạy <strong>Get Latest Revision</strong> trên thư mục gốc để tải toàn bộ project về lần đầu (có thể mất nhiều thời gian với project UE).' },
  { id: 'c503', topic: 5, q: 'Quy ước đặt tên workspace gợi ý?', a: '<code>&lt;user&gt;_&lt;project&gt;_&lt;máy/os&gt;</code>, ví dụ <code>long_mygame_win</code>.' },

  // --- Mục 6: Cấu hình UE ---
  { id: 'c601', topic: 6, q: 'File <code>.uasset</code> và <code>.umap</code> phải đặt type gì trong typemap?', a: '<code>binary+l</code> — nhị phân + khóa độc quyền. Đây là lý do then chốt dùng Perforce cho UE.' },
  { id: 'c602', topic: 6, q: 'File biên dịch (<code>.exe</code>, <code>.dll</code>, <code>.pdb</code>) nên đặt type gì?', a: '<code>binary+w</code> — nhị phân, luôn ghi được.' },
  { id: 'c603', topic: 6, q: 'Những thư mục UE nào PHẢI ignore (không version)?', a: '<code>Binaries/</code>, <code>Intermediate/</code>, <code>Saved/</code>, <code>DerivedDataCache/</code> (và Build/, Script/). Đây là thư mục sinh tự động.' },
  { id: 'c604', topic: 6, q: 'Những thư mục nào PHẢI version trong project UE?', a: '<code>Config/</code>, <code>Content/</code> (asset), <code>Source/</code> (C++), <code>Plugins/</code>, và file <code>.uproject</code>.' },
  { id: 'c605', topic: 6, q: 'Đặt biến môi trường để Perforce dùng file bỏ qua như thế nào?', a: '<code>p4 set P4IGNORE=.p4ignore</code> (kiểm tra bằng <code>p4 set</code>).' },

  // --- Mục 7: Workflow ---
  { id: 'c701', topic: 7, q: 'Việc đầu tiên mỗi ngày trước khi làm?', a: '<strong>Get Latest / Sync</strong> (<code>p4 sync</code>) để lấy bản mới nhất, tránh làm trên bản cũ.' },
  { id: 'c702', topic: 7, q: 'Lệnh CLI để check out (mở sửa) một file?', a: '<code>p4 edit &lt;file&gt;</code>. Với file <code>+l</code>, file sẽ bị khóa.' },
  { id: 'c703', topic: 7, q: 'Vì sao phải dùng Move/Rename (p4 move) thay vì xóa-rồi-thêm thủ công?', a: 'Xóa-rồi-thêm thủ công sẽ <strong>mất lịch sử</strong> file. <code>p4 move</code> giữ được lịch sử.' },
  { id: 'c704', topic: 7, q: 'Cảnh báo quan trọng khi đổi tên/di chuyển asset Unreal?', a: 'Phải làm <strong>trong Content Browser của Unreal</strong>, KHÔNG dùng Explorer/P4V — nếu không sẽ hỏng reference.' },
  { id: 'c705', topic: 7, q: 'Reconcile Offline Work dùng khi nào?', a: 'Khi bạn lỡ sửa/thêm/xóa file mà chưa qua Perforce (làm offline). P4V tự nhận biết file nào edit/add/delete (<code>p4 reconcile</code>).' },

  // --- Mục 8: Resolve ---
  { id: 'c801', topic: 8, q: 'Conflict (must resolve) xảy ra khi nào?', a: 'Khi bạn check out một file, nhưng trong lúc đó người khác đã <strong>submit revision mới hơn</strong> của chính file đó.' },
  { id: 'c802', topic: 8, q: 'Với file CODE (text) bị conflict, dùng công cụ gì để trộn?', a: '<strong>P4Merge</strong> — cửa sổ 3 cột (Yours / Base / Theirs), chọn từng đoạn rồi lưu.' },
  { id: 'c803', topic: 8, q: 'Với asset Unreal (binary) khi resolve chỉ có lựa chọn nào?', a: 'Chỉ <strong>Accept Yours</strong> hoặc <strong>Accept Theirs</strong> — không trộn được. Đó là lý do dùng <code>+l</code> để tránh conflict ngay từ đầu.' },

  // --- Mục 9: Shelve ---
  { id: 'c901', topic: 9, q: 'Shelve là gì?', a: 'Đẩy thay đổi đang làm dở lên server <strong>mà không submit</strong>. Dùng khi đổi máy, nhờ review, hoặc cần dọn workspace mà vẫn giữ việc dở.' },
  { id: 'c902', topic: 9, q: 'Lệnh shelve và unshelve một changelist?', a: '<code>p4 shelve -c 1234</code> để shelve, <code>p4 unshelve -s 1234</code> để lấy lại.' },
  { id: 'c903', topic: 9, q: 'Shelve liên quan gì tới Helix Swarm?', a: 'Shelve là cơ chế nền cho <strong>code review</strong>: reviewer xem nội dung shelved trước khi tác giả submit.' },

  // --- Mục 10: UE Editor ---
  { id: 'c1001', topic: 10, q: 'Trong Unreal Editor, chọn Provider nào để kết nối Perforce?', a: 'Provider: <strong>Perforce</strong>, rồi điền Server (Port), User, Workspace giống P4V.' },
  { id: 'c1002', topic: 10, q: 'Cách ĐÚNG để so sánh (diff) asset Unreal là gì?', a: 'Dùng tính năng <strong>Diff trong Unreal Editor</strong> (chuột phải asset → Diff Against...). KHÔNG dùng P4Merge vì nó không hiểu nội dung <code>.uasset</code>.' },
  { id: 'c1003', topic: 10, q: 'Redirector là gì và xử lý thế nào?', a: 'Khi move/rename asset, UE có thể tạo "redirector". Thỉnh thoảng chạy <strong>Fix Up Redirectors</strong> trên thư mục Content rồi submit để dọn dẹp.' },
  { id: 'c1004', topic: 10, q: 'Lưu ý bắt buộc trước khi Submit Content trong editor?', a: 'Luôn <strong>Save asset trong editor trước</strong> — asset chưa save sẽ không phản ánh thay đổi.' },

  // --- Mục 11: UGS ---
  { id: 'c1101', topic: 11, q: 'PCB (Precompiled Binaries) là gì?', a: '<strong>Binary editor build sẵn</strong> do CI publish lên Perforce, để artist không phải compile.' },
  { id: 'c1102', topic: 11, q: 'Khi đã dùng PCB qua UGS thì có version thư mục <code>Binaries/</code> thủ công không?', a: '<strong>Không.</strong> Tránh xung đột với binary do UGS phát.' },
  { id: 'c1103', topic: 11, q: 'UGS cho phép sync tới đâu, không nhất thiết là head?', a: 'Sync tới một <strong>changelist cụ thể</strong> đã được đánh dấu <strong>Good Build</strong> (mã màu xanh).' },

  // --- Mục 12: Streams ---
  { id: 'c1201', topic: 12, q: 'Phân biệt thao tác Copy và Merge giữa các stream.', a: '<strong>Copy</strong> = xuôi dòng (vd Main→Dev), không cần merge nếu nhánh đích "thấp hơn". <strong>Merge</strong> = ngược dòng (vd Dev→Main), có thể phải resolve.' },
  { id: 'c1202', topic: 12, q: 'Vai trò của Mainline stream?', a: 'Nhánh "xương sống", <strong>luôn ổn định/buildable</strong>, là trung tâm mà cả team phụ thuộc.' },
  { id: 'c1203', topic: 12, q: 'Studio nhỏ nên dùng chiến lược branching nào?', a: 'Thường chỉ <strong>một Main stream duy nhất</strong> + UGS đánh dấu Good Build. Đơn giản, ít overhead.' },

  // --- Mục 13-14: Vai trò & best practices ---
  { id: 'c1301', topic: 13, q: 'Ba điều artist/designer TUYỆT ĐỐI tránh?', a: '❌ Move/rename asset ngoài editor. ❌ Sửa asset mà quên check out. ❌ Giữ check out (lock) một asset quan trọng quá lâu (block cả team).' },
  { id: 'c1401', topic: 14, q: '"Atomic commit" nghĩa là gì?', a: 'Mỗi changelist là <strong>một thay đổi logic hoàn chỉnh</strong>, build/chạy được. Dễ review, dễ rollback.' },
  { id: 'c1402', topic: 14, q: 'Description của changelist nên tham chiếu gì để truy vết?', a: 'Mã <strong>task Jira</strong> (ví dụ <code>[GD-123]</code>).' },

  // --- Mục 15: Sự cố ---
  { id: 'c1501', topic: 15, q: '"File is locked / exclusively opened by another user" — xử lý thế nào?', a: 'Xem ai giữ (<code>p4 opened //...</code>), <strong>liên hệ người đó</strong> nhờ submit/revert. Khẩn cấp: admin dùng <code>p4 revert -C &lt;user&gt; //file</code> (cẩn thận, có thể mất việc của họ).' },
  { id: 'c1502', topic: 15, q: 'Asset bị read-only, không sửa được trong UE — nguyên nhân thường gặp?', a: 'Bạn <strong>chưa check out</strong>, hoặc P4IGNORE/typemap sai. Check out asset; kiểm tra <code>+w</code>/typemap với tech lead.' },
  { id: 'c1503', topic: 15, q: 'Sync rất chậm / project quá nặng — các cách cải thiện?', a: 'Dùng <strong>SSD + mạng tốt</strong>, dùng <strong>view mapping</strong> chỉ lấy phần cần, và cấu hình <strong>Helix Proxy/Edge</strong> cho team ở xa.' },

  // --- Mục 16: CLI ---
  { id: 'c1601', topic: 16, q: 'Lệnh liệt kê TẤT CẢ file đang được check out của mọi người?', a: '<code>p4 opened -a</code>. (Chỉ của bạn: <code>p4 opened</code>.)' },
  { id: 'c1602', topic: 16, q: 'Lệnh submit kèm mô tả trực tiếp?', a: '<code>p4 submit -d "message"</code>' },
  { id: 'c1603', topic: 16, q: 'Lệnh force re-sync (ghi đè cục bộ) và vì sao phải cẩn thận?', a: '<code>p4 sync -f</code> — ghi đè file cục bộ bằng bản server, nên có thể <strong>mất thay đổi chưa lưu</strong>.' },
  { id: 'c1604', topic: 16, q: 'Lệnh nào tạo checkpoint backup (admin)?', a: '<code>p4 admin checkpoint</code> — sao lưu metadata server, sống còn với studio.' },
  { id: 'c1605', topic: 16, q: 'P4CONFIG (<code>.p4config</code>) dùng để làm gì?', a: 'File đặt ở gốc project chứa <code>P4PORT/P4USER/P4CLIENT</code>, giúp <strong>tự chuyển ngữ cảnh</strong> khi làm nhiều project.' },
];
