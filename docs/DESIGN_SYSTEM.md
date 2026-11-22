# Thiết kế sản phẩm

## Nguyên tắc

Blog là ấn phẩm công nghệ content-first: dễ quét, ưu tiên tiêu đề/bài viết, khoảng trắng có chủ đích và ít nhiễu. Admin là công cụ vận hành: rõ trạng thái và ưu tiên thao tác chính.

## Hướng retro editorial

- Dùng hình khối vuông, viền cứng, offset shadow nhỏ và typography lớn; motion chỉ hỗ trợ phản hồi và phải tôn trọng `prefers-reduced-motion`.
- Admin chia điều hướng thành Tổng quan, Nội dung, Cấu trúc, Phân quyền và Hệ thống; User, Role, Permission là ba màn riêng.
- Nội dung admin tận dụng chiều rộng desktop; action lưu của form dài phải sticky/fixed và vẫn truy cập được trên mobile.
- Route nội dung sâu dùng breadcrumb semantic, responsive; header/footer public không hiển thị liên kết quản trị.
- Màu public tiếp tục lấy từ `--brand`, `--brand-deep`, `--page-surface`.
- Mọi surface/control dùng chung `--retro-radius`; không trộn pill, card bo lớn và card vuông. Homepage dùng một `--public-rail-width` căn giữa; discovery widgets nằm dưới feed thay vì tạo sidebar lệch trọng tâm.
- Homepage tổ chức theo thứ tự intro → topic index → featured story → latest feed → discovery. Bài featured không lặp lại trong feed trang đầu; metadata và CTA chỉ xuất hiện khi hỗ trợ quyết định đọc.
- Form tạo nhanh trong admin dùng compact density có chủ đích; input không được tự mở rộng chỉ vì page còn khoảng trống. Destructive category action phải hiển thị usage policy và được server chặn nếu còn bất kỳ bài viết published hoặc draft nào tham chiếu.

## Nhận diện mặc định

- Brand mint: `#0f766e`
- Brand mint deep: `#115e59`
- Surface: `#f8fafc`
- Ink: `#101827`
- Sans: Manrope; display/editorial: Newsreader; mono: DM Mono.

Màu public lấy từ `--brand`, `--brand-deep`, `--page-surface`, quản lý ở Admin → Cài đặt.

## Bố cục

- Public header chỉ có logo, điều hướng nội dung và tìm kiếm; không có control admin.
- Home gồm hero ngắn, bài tiêu điểm, lưới bài và sidebar discovery hữu ích.
- Card chỉ có ảnh, chuyên mục, metadata tối thiểu, tiêu đề và excerpt.
- Admin form: nội dung chính trái, publish/settings phải trên desktop; xếp dọc trên mobile.
- File Manager dùng một root “Ổ đĩa của tôi”, không dùng pseudo-folder “Tất cả” hoặc “Không phân loại”. Sidebar cây thư mục luôn thấy trên desktop, chuyển thành dải cuộn ngang trên màn nhỏ; vùng nội dung chỉ hiển thị folder con và tệp trực tiếp của vị trí hiện tại. Ảnh dùng thumbnail, tài liệu dùng icon file, tên gốc được ưu tiên và empty state theo thư mục.
- Media Picker trong editor dùng cùng root, cây thư mục, folder tiles và breadcrumb với File Manager nhưng chỉ hiển thị ảnh phù hợp cho cover/Markdown. Upload trong picker luôn nhắm vào folder đang mở và không reset vị trí sau khi refresh dữ liệu.
- Cây thư mục trong File Manager và Media Picker dùng nút disclosure riêng với `aria-expanded`; chọn folder và expand/collapse là hai hành động độc lập. Mở vị trí sâu phải tự mở ancestors, còn trạng thái disclosure được giữ trong browser session.
- Context menu chuột phải ở toàn bộ workspace hỗ trợ upload vào vị trí đích, tạo thư mục và xóa folder thật; nút overflow và control hiển thị rõ là phương án bàn phím/cảm ứng. Khi đang ở một thư mục, thư mục mới là con của vị trí hiện tại; cây dùng thụt cấp để biểu đạt quan hệ. Upload và xóa ảnh phải giữ vị trí folder qua reload. Media có move control ngay trên card. Xóa ảnh/folder là destructive dialog có danh sách nội dung đang tham chiếu; success/error dùng toast tự đóng sau vài giây, không dùng browser alert cho flow chính.
- Table mobile phải bọc `overflow-x-auto`.
- Menu builder chia rõ source library và cây hiện tại. Home/About luôn xuất hiện trong nhóm trang hệ thống để khôi phục; source đã có dùng trạng thái disabled. Cây render depth-first, hiển thị cấp, thụt lề và parent select không chứa self/descendants. Drag handle chỉ là progressive enhancement; luôn có nút lên/xuống và chọn mục cha làm phương án bàn phím. Xóa nhánh dùng dialog giải thích phạm vi; thay đổi thứ tự, cấp, role và permission phải có toast kết quả.
- Màn phân quyền trình bày theo user → role → permission; permission dùng tên kỹ thuật ổn định, role có nhãn thân thiện.

## Accessibility và interaction

- Contrast text tối thiểu 4.5:1; focus visible luôn hiện.
- Tôn trọng `prefers-reduced-motion`.
- Control chính có click target khoảng 40px trở lên.
- Icon-only button có `aria-label` hoặc `title`.
- Required luôn có `*`, `required`, `aria-required`; lỗi inline khi phù hợp.
- Không dùng emoji làm icon giao diện.
