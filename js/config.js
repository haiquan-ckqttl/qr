// Danh sách Loại hình tự động đổ vào Dropdown trên giao diện
const LOAI_HINH_OPTIONS = [
    "Vận chuyển độc lập quá cảnh",
    "Vận chuyển độc lập kho ngoại quan",
    "Xuất nhập khẩu cửa khẩu quốc tế Tà Lùng",
    "Chuyển cửa khẩu – Xuất khẩu",
    "Chuyển cửa khẩu – Nhập khẩu"
];

// CẤU HÌNH 1: QR PTVT (Cố định, không phụ thuộc Loại hình)
const qrPTVTConfig = {
    "bks": 0, 
    "socont": 2, 
    "sotokhai": 3, 
    "diadiem": 5, 
    "mathang": 6, 
    "laixe": 8, 
    "nguoikhai": 11
};

// CẤU HÌNH 2: QR HỒ SƠ ĐỘNG (Thay đổi theo Loại hình)
// Hệ thống sẽ tự động đối chiếu tên Loại hình người dùng chọn để lấy đúng cấu hình này.
const MAPPING_QR_HOSO = {
    
    "Vận chuyển độc lập quá cảnh": {
        "loaihinh": 0, "mst": 1, "tencty": 2, "sotokhai": 3, 
        "ngaytokhai": 4, "luong": 5, "banke": 6, "nghiepvu": 7
    },
    
    "Vận chuyển độc lập kho ngoại quan": {
        // Ví dụ loại hình này không cần nghiệp vụ, index sẽ khác:
        "loaihinh": 0, "sotokhai": 1, "ngaytokhai": 2, "mst": 3, "tencty": 4
    },
    
    "Xuất nhập khẩu cửa khẩu quốc tế Tà Lùng": {
        // Ví dụ loại hình này Cột A là Số tờ khai, Cột B là Luồng:
        "sotokhai": 0, "luong": 1, "loaihinh": 2, "mst": 3
    },
    
    "Chuyển cửa khẩu – Xuất khẩu": {
        "loaihinh": 0, "sotokhai": 1, "ngaytokhai": 2, "banke": 3
    },
    
    "Chuyển cửa khẩu – Nhập khẩu": {
        "loaihinh": 0, "sotokhai": 1, "ngaytokhai": 2, "banke": 3
    }

};