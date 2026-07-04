/* =========================================================================
   exercises.js — Bài tập tình huống (thực hành).
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
      'Submit kèm description rõ ràng',
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
      'Submit cả bản cũ (delete) và bản mới (add)',
    ],
    explain: 'Đổi tên PHẢI làm trong Content Browser để engine fix reference; sau đó dọn redirector rồi submit.',
  },
  {
    id: 'ex-ignore', type: 'multi', icon: '⚙️', title: 'Cấu hình .p4ignore cho Unreal',
    lessons: [6],
    prompt: 'Chọn TẤT CẢ những mục nên được đưa vào .p4ignore (không version).',
    options: [
      { text: 'Binaries/', correct: true },
      { text: 'Intermediate/', correct: true },
      { text: 'Saved/', correct: true },
      { text: 'DerivedDataCache/', correct: true },
      { text: '.vs/ và *.sln', correct: true },
      { text: 'Content/', correct: false },
      { text: 'Source/', correct: false },
      { text: 'MyGame.uproject', correct: false },
    ],
    explain: 'Ignore các thư mục sinh tự động và file IDE. Content/, Source/, Config/, .uproject thì PHẢI version.',
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
    explain: 'Asset Unreal = binary+l (khóa), code = text, file biên dịch = binary+w. Ảnh/asset nhị phân không để text.',
  },
  {
    id: 'ex-locked', type: 'single', icon: '🔒', title: 'Asset đang bị người khác khóa',
    lessons: [15, 8],
    prompt: 'Bạn cần sửa BP_Hero.uasset nhưng nó đang bị đồng nghiệp check out (lock). Cách xử lý hợp lý nhất?',
    options: [
      'Dùng p4 sync -f để ghi đè và sửa luôn',
      'Xem ai đang giữ bằng p4 opened rồi liên hệ họ nhờ submit/revert',
      'Xóa file rồi tạo lại một asset mới trùng tên',
      'Tự ý chạy p4 revert -C để cưỡng chế mở khóa',
    ],
    answer: 1,
    explain: 'Liên hệ người giữ lock là cách đúng. Chỉ admin mới nên dùng p4 revert -C và phải rất cẩn thận vì có thể làm mất việc của họ.',
  },
  {
    id: 'ex-resolve', type: 'order', icon: '🤝', title: 'Xử lý "Must resolve files"',
    lessons: [8],
    prompt: 'Khi submit báo "must resolve files before submitting", sắp xếp các bước xử lý.',
    steps: [
      'Nhận thông báo "must resolve" khi submit',
      'Chạy Get Latest Revision',
      'Chuột phải file → Resolve',
      'Chọn cách hòa giải (Merge tool cho code / Accept Yours|Theirs cho binary)',
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
    explain: 'Shelve giữ thay đổi trên server mà không submit — lý tưởng để đổi máy hoặc nhờ review.',
  },
  {
    id: 'ex-artist-start', type: 'single', icon: '🎨', title: 'Artist mở editor không cần Visual Studio',
    lessons: [11],
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
];

export const exerciseById = (id) => EXERCISES.find(e => e.id === id);
