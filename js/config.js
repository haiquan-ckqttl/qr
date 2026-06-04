/* ============================================================
   FILE: js/config.js
   CHỨC NĂNG: Cấu hình danh sách và vị trí đổ dữ liệu vào QR
   ============================================================ */

// Danh sách Loại hình tự động đổ vào Dropdown trên giao diện
const LOAI_HINH_OPTIONS = [
    "Vận chuyển độc lập quá cảnh",
    "Vận chuyển độc lập kho ngoại quan",
    "Xuất nhập khẩu cửa khẩu quốc tế Tà Lùng",
    "Chuyển cửa khẩu – Xuất khẩu",
    "Chuyển cửa khẩu – Nhập khẩu"
];

// ============================================================
// CẤU HÌNH 1: QR PTVT (Giữ nguyên theo chuẩn cũ)
// ============================================================
const qrPTVTConfig = {
    "bks": 0,       // Cột E
    "socont": 2,    // Cột F
    "sotokhai": 3,  // Cột C
    "diadiem": 5,   // Cột D
    "mathang": 6,   // Cột G
    "laixe": 8,     // Cột I
    "nguoikhai": 11 // Cột H
};

// ============================================================
// CẤU HÌNH 2: QR HỒ SƠ ĐỘNG (Thay đổi theo Loại hình)
// Lưu ý: Đã xóa các trường (ngaytokhai, luong, banke, nghiepvu)
// ============================================================
const MAPPING_QR_HOSO = {
    
    "Vận chuyển độc lập quá cảnh": {
        "loaihinh": 0, 
        "mst": 1, 
        "tencty": 2, 
        "sotokhai": 3, 
        "nguoikhai": 4
    },
    
    "Vận chuyển độc lập kho ngoại quan": {
        // Có thể đảo vị trí tùy ý
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2, 
        "tencty": 3,
        "diadiem": 4
    },
    
    "Xuất nhập khẩu cửa khẩu quốc tế Tà Lùng": {
        "sotokhai": 0, 
        "loaihinh": 1, 
        "mst": 2,
        "tencty": 3,
        "mathang": 4
    },
    
    "Chuyển cửa khẩu – Xuất khẩu": {
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2,
        "bks": 3,
        "socont": 4
    },
    
    "Chuyển cửa khẩu – Nhập khẩu": {
        "loaihinh": 0, 
        "sotokhai": 1, 
        "mst": 2,
        "bks": 3,
        "socont": 4
    }

};