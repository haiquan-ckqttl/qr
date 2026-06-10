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
// const qrPTVTConfig = {
//     "bks": 0,       // Cột E
//     "socont": 2,    // Cột F
//     "sotokhai": 3,  // Cột C
//     "diadiem": 5,   // Cột D
//     "mathang": 6,   // Cột G
//     "laixe": 8,     // Cột I
//     "sdtlaixe": 9,  // Cột J (Tạm gán)
//     "nguoikhai": 11,// Cột H
//     "tencty": 12,   // MỚI: Tên doanh nghiệp (Tạm gán)
//     "diachicty": 13 // MỚI: Địa chỉ doanh nghiệp (Tạm gán)
// };
// ten cty, dia chi, somoc, hanghoa, tk hq, người khai hq
// mst, tencty, 
// ============================================================
const qrPTVTConfig = {
    "bks": 0,       // Cột E
    "socont": 2,    // Cột F
    "sotokhai": 3,  // Cột C
    "diadiem": 5,   // Cột G
    "mathang": 6,     // Cột I
    "nguoikhai": 13 // Cột H
};

// ============================================================
// CẤU HÌNH 2: QR HỒ SƠ ĐỘNG (Thay đổi theo Loại hình)
// Lưu ý: Key bây giờ là các "code" (VCDLQC, XNKTL...) thay vì tên dài
// Đã khai báo sẵn các trường mới (diachicty, ngaytokhai, luong)
// ============================================================
const MAPPING_QR_HOSO = {
    
    "VCDLQC": {
        "sotokhai": 0
    },
    
    "VCDLKNQ": {
        "sotokhai": 0
    },
    
    "XNKTL": {
        "sotokhai": 0 
    },
    
    "CCKXK": {
        "mst": 0,
        "sotokhai": 3,
        "mathang": 8,
        "bks": 17,
        "nguoikhai": 18,
        "diadiem": 19,
        "socont": 20
    },
    
    "CCKNK": {
        "mst": 0,
        "sotokhai": 3,
        "mathang": 8,
        "bks": 17,
        "nguoikhai": 18,
        "diadiem": 19,
        "socont": 20
    }

};