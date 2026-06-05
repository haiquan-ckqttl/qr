/* ============================================================
   FILE: js/config.js
   CHỨC NĂNG: Cấu hình danh sách và vị trí đổ dữ liệu vào QR
   ============================================================ */

// Danh sách Loại hình tự động đổ vào Dropdown trên giao diện (Đã chuyển thành Object Code - Name)
const LOAI_HINH_OPTIONS = [
    { code: "VCDLQC",  displayName: "Vận chuyển độc lập quá cảnh" },
    { code: "VCDLKNQ", displayName: "Vận chuyển độc lập kho ngoại quan" },
    { code: "XNKTL",   displayName: "Xuất nhập khẩu cửa khẩu quốc tế Tà Lùng" },
    { code: "CCKXK",   displayName: "Chuyển cửa khẩu – Xuất khẩu" },
    { code: "CCKNK",   displayName: "Chuyển cửa khẩu – Nhập khẩu" }
];

// ============================================================
// CẤU HÌNH 1: QR PTVT (Cố định, không phụ thuộc Loại hình)
// ============================================================
const qrPTVTConfig = {
    "bks": 0,       // Cột E
    "socont": 2,    // Cột F
    "sotokhai": 3,  // Cột C
    "diadiem": 5,   // Cột D
    "mathang": 6,   // Cột G
    "laixe": 8,     // Cột I
    "sdtlaixe": 9,  // MỚI BỔ SUNG: SĐT Lái xe (Tạm gán vào Index 9, bạn có thể đổi)
    "nguoikhai": 11 // Cột H
};

// ============================================================
// CẤU HÌNH 2: QR HỒ SƠ ĐỘNG (Thay đổi theo Loại hình)
// Lưu ý: Key bây giờ là các "code" (VCDLQC, XNKTL...) thay vì tên dài
// ============================================================
const MAPPING_QR_HOSO = {
    
    "VCDLQC": {
        "loaihinh": 0, 
        "mst": 1, 
        "tencty": 2, 
        "sotokhai": 3, 
        "nguoikhai": 4
    },
    
    "VCDLKNQ": {
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2, 
        "tencty": 3,
        "diadiem": 4
    },
    
    "XNKTL": {
        "sotokhai": 0, 
        "loaihinh": 1, 
        "mst": 2,
        "tencty": 3,
        "mathang": 4
    },
    
    "CCKXK": {
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2,
        "bks": 3,
        "socont": 4
    },
    
    "CCKNK": {
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2,
        "bks": 3,
        "socont": 4
    }

};