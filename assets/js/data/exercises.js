/* =========================================================================
   exercises.js — Bài tập tình huống (thực hành), bám tài liệu v2.0 (Phụ lục C).
   3 kiểu:
     - 'order' : sắp xếp các bước cho đúng thứ tự.
     - 'multi' : chọn TẤT CẢ đáp án đúng.
     - 'single': tình huống, chọn 1 phương án đúng nhất.
   ========================================================================= */

export const EXERCISES = [
  {
    id: 'ex-daily', type: 'order', icon: '🔄', title: 'Vòng lặp làm việc hàng ngày',
    lessons: [7],
    prompt: 'Sắp xếp các bước của một ngày làm việc chuẩn với Perforce theo đúng thứ tự.',
    steps: [
      'Đầu ngày: Get Latest / p4 sync để lấy bản mới nhất',
      'Check out file cần sửa (p4 edit)',
      'Chỉnh sửa và test cục bộ',
      'Lưu (Save) file/asset',
      'Sync lại một lần trước khi submit',
      'Resolve nếu có conflict',
      'Submit kèm description rõ ràng (có mã task)',
    ],
    explain: 'Luôn sync đầu ngày và sync lại trước khi submit để tránh làm trên bản cũ; resolve trước rồi mới submit.',
  },
  {
    id: 'ex-rename', type: 'order', icon: '🎮', title: 'Đổi tên asset Unreal đúng cách',
    lessons: [7, 10],
    prompt: 'Bạn cần đổi tên một asset. Sắp xếp các bước ĐÚNG để không hỏng reference.',
    steps: [
      'Sync bản mới nhất',
      'Mở Unreal Editor → Content Browser',
      'Chuột phải asset → Rename (engine tự cập nhật reference)',
      'Chạy Fix Up Redirectors trên thư mục Content',
      'Save các thay đổi',
      'Submit cả bản cũ (delete/redirector) và bản mới (add) từ editor',
    ],
    explain: 'Đổi tên PHẢI làm trong Content Browser để engine fix reference; sau đó dọn redirector rồi submit.',
  },
  {
    id: 'ex-ignore', type: 'multi', icon: '⚙️', title: 'Cấu hình .p4ignore cho Unreal',
    lessons: [6],
    prompt: 'Chọn TẤT CẢ những mục NÊN đưa vào .p4ignore (không add vào depot).',
    options: [
      { text: 'Binaries/', correct: true },
      { text: 'Intermediate/', correct: true },
      { text: 'Saved/', correct: true },
      { text: 'DerivedDataCache/', correct: true },
      { text: '.vs/ và *.sln', correct: true },
      { text: 'Content/', correct: false },
      { text: 'Source/', correct: false },
      { text: 'Build/ (chứa icon, splash, cấu hình đóng gói — CẦN version)', correct: false },
      { text: 'MyGame.uproject', correct: false },
    ],
    explain: 'Ignore các thư mục UE tự sinh và file IDE. Lưu ý: Build/ KHÔNG ignore (chứa cấu hình đóng gói theo platform). Content/, Source/, Config/, .uproject phải version.',
  },
  {
    id: 'ex-typemap', type: 'multi', icon: '🔑', title: 'Gán file type đúng trong Typemap',
    lessons: [6, 3],
    prompt: 'Chọn TẤT CẢ các cặp "phần mở rộng → type" ĐÚNG cho dự án UE.',
    options: [
      { text: '.uasset → binary+l', correct: true },
      { text: '.umap → binary+l', correct: true },
      { text: '.cpp → text', correct: true },
      { text: '.dll → binary+w', correct: true },
      { text: '.uasset → text', correct: false },
      { text: '.png → text', correct: false },
    ],
    explain: 'Asset Unreal = binary+l (khóa), code = text, file build = binary+w. Ảnh/asset nhị phân không để text. Nhớ: dòng khớp cuối cùng trong typemap thắng.',
  },
  {
    id: 'ex-locked', type: 'single', icon: '🔒', title: 'Asset đang bị người khác khóa',
    lessons: [17, 8],
    prompt: 'Bạn cần sửa BP_Hero.uasset nhưng nó đang bị đồng nghiệp check out (lock). Cách xử lý hợp lý nhất?',
    options: [
      'Dùng p4 sync -f để ghi đè và sửa luôn',
      'Xem ai đang giữ (p4 opened -a) rồi liên hệ họ nhờ submit/revert',
      'Tự chạy p4 obliterate lên file đó',
      'Copy file ra ngoài, sửa, rồi copy đè lại vào workspace',
    ],
    answer: 1,
    explain: 'Liên hệ người giữ đúng trong ~95% trường hợp. Chỉ khi khẩn (người đó nghỉ), admin mới gỡ phía server: p4 revert -C <tên workspace của họ> <file>.',
  },
  {
    id: 'ex-resolve', type: 'order', icon: '🤝', title: 'Xử lý "Must resolve files"',
    lessons: [8],
    prompt: 'Khi submit báo "must resolve files before submitting", sắp xếp các bước xử lý.',
    steps: [
      'Nhận thông báo "must resolve" khi submit',
      'Chạy Get Latest Revision',
      'Chuột phải file → Resolve',
      'Chọn cách hòa giải (P4Merge/Accept Merged cho code; Accept Yours|Theirs cho binary)',
      'Submit lại changelist',
    ],
    explain: 'Có bản mới hơn trên server nên phải resolve trước. File code trộn bằng P4Merge; asset binary chỉ chọn một bản.',
  },
  {
    id: 'ex-shelve', type: 'order', icon: '📦', title: 'Chuyển việc dở sang máy khác (Shelve)',
    lessons: [9],
    prompt: 'Bạn đang làm dở nhưng phải đổi máy, chưa muốn submit. Sắp xếp các bước dùng shelve.',
    steps: [
      'Chọn pending changelist đang làm dở',
      'Shelve (p4 shelve -c <CL>) để đẩy tạm lên server',
      'Revert file cục bộ (an toàn vì đã có trên server)',
      'Sang máy khác và đăng nhập Perforce',
      'Unshelve (p4 unshelve -s <CL>) để lấy lại',
      'Tiếp tục công việc',
    ],
    explain: 'Shelve giữ thay đổi trên server mà không submit. Lưu ý: với file +l, shelve KHÔNG nhả khóa cho tới khi submit/revert.',
  },
  {
    id: 'ex-ofpa', type: 'single', icon: '🗺️', title: 'Cùng làm một level với OFPA',
    lessons: [11],
    prompt: 'Level bật OFPA/World Partition, bạn và đồng nghiệp cùng cần chỉnh sửa. Cách làm ĐÚNG là gì?',
    options: [
      'Chỉ một người được mở level, người kia phải chờ',
      'Mỗi người sửa các actor KHÁC NHAU, save + submit từ trong editor qua View Changelists',
      'Cả hai cùng sửa một actor rồi merge thủ công',
      'Xóa thư mục __ExternalActors__ để tránh xung đột',
    ],
    answer: 1,
    explain: 'OFPA lưu mỗi actor thành file riêng nên nhiều người cùng làm một level (khác actor). Cùng một actor thì không được (file actor vẫn binary+l). Submit từ editor để thấy tên actor thật.',
  },
  {
    id: 'ex-merge', type: 'order', icon: '🌿', title: 'Đưa feature từ Dev lên Main (merge down, copy up)',
    lessons: [13],
    prompt: 'Bạn hoàn thành một feature ở nhánh Dev, muốn đưa lên Main an toàn. Sắp xếp theo quy tắc "merge down, copy up".',
    steps: [
      'Merge down: Main → Dev (lấy thay đổi mới nhất về Dev)',
      'Resolve mọi conflict ngay tại Dev',
      'Build & test tại Dev cho ổn định',
      'Copy up: Dev → Main (ghi đè 1:1, Main không phải resolve)',
    ],
    explain: 'Nhờ merge down rồi copy up, nhánh ổn định (Main/Release) không bao giờ là nơi xử lý conflict — mọi hỗn loạn giải quyết ở nhánh con trước.',
  },
  {
    id: 'ex-artist-start', type: 'single', icon: '🎨', title: 'Artist mở editor không cần Visual Studio',
    lessons: [12],
    prompt: 'Một artist mới vào dự án, máy không cài Visual Studio, muốn mở Unreal Editor nhanh nhất. Nên làm gì?',
    options: [
      'Clone repo bằng Git rồi mở project',
      'Mở UGS → chọn changelist Good Build → Sync → chạy editor',
      'Tự build engine from source trước',
      'Xin file .exe qua USB từ đồng nghiệp',
    ],
    answer: 1,
    explain: 'UGS tải binary biên dịch sẵn (PCB) khớp changelist nên artist không cần compile — chỉ Sync và chạy.',
  },
  {
    id: 'ex-admin-setup', type: 'order', icon: '🖥️', title: 'Admin dựng depot cho dự án UE',
    lessons: [15],
    prompt: 'Admin khởi tạo depot mới cho project Unreal. Sắp xếp đúng thứ tự (làm sai thứ tự sẽ rất khó sửa).',
    steps: [
      'Tạo stream depot (p4 depot -t stream GameDepot)',
      'Tạo mainline (p4 stream -t mainline //GameDepot/Main)',
      'Dán typemap UE (p4 typemap) — TRƯỚC khi add file đầu tiên',
      'Tạo workspace trỏ vào //GameDepot/Main',
      'Đặt .p4ignore rồi add + submit project lần đầu',
    ],
    explain: 'Typemap phải có trước khi add file (không áp ngược cho file đã version). Thứ tự: depot → mainline → typemap → workspace → add project.',
  },
];

export const exerciseById = (id) => EXERCISES.find(e => e.id === id);
