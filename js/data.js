/* ============================================================
   FILE: js/data.js
   FUNCTION: Xử lý dữ liệu từ CSDL (JSON) và cung cấp hàm hỗ trợ điền thông tin tự động
   ============================================================ */

var companyDatabase = [];
var locationDatabase = [];

window.addEventListener('DOMContentLoaded', function() {
    // 1. Kéo CSDL Doanh nghiệp
    fetch('./data/companies.json')
        .then(response => response.json())
        .then(data => {
            companyDatabase = data;
            buildCompanyDatalist();
            console.log("Đã nạp CSDL Doanh nghiệp: " + data.length + " bản ghi.");
        })
        .catch(err => console.warn("Lỗi nạp CSDL Doanh nghiệp.", err));

    // 2. Kéo CSDL Địa điểm
    fetch('./data/locations.json')
        .then(response => response.json())
        .then(data => {
            locationDatabase = data;
            buildLocationDatalist();
            console.log("Đã nạp CSDL Địa điểm: " + data.length + " bản ghi.");
        })
        .catch(err => console.warn("Lỗi nạp CSDL Địa điểm.", err));
});

// Tạo danh sách gợi ý cho ô MST
function buildCompanyDatalist() {
    var datalist = document.createElement('datalist');
    datalist.id = 'mst-suggestions';
    companyDatabase.forEach(function(company) {
        var option = document.createElement('option');
        option.value = company.mst;
        option.text = company.name;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
}

// Tạo danh sách gợi ý cho ô Địa điểm tập kết
function buildLocationDatalist() {
    var datalist = document.createElement('datalist');
    datalist.id = 'location-suggestions';
    locationDatabase.forEach(function(loc) {
        var option = document.createElement('option');
        // Nối chuỗi "Tên - Mã" theo yêu cầu (VD: Phú Anh - 11B1G06)
        option.value = loc.name + ' - ' + loc.code;
        datalist.appendChild(option);
    });
    document.body.appendChild(datalist);
}

// Xử lý tự động điền Tên Công ty khi MST khớp
function handleAutocompleteMST(id, inputMst) {
    // Chỉ lấy số, giữ nguyên số 0 ở đầu
    var cleanMst = inputMst.replace(/\D/g, ''); 
    var company = companyDatabase.find(c => c.mst === cleanMst);
    
    if (company) {
        setField(id, 'tencty', company.name);
        var nameInput = document.getElementById('f' + id + 'tencty');
        if(nameInput) nameInput.value = company.name;
        toast('Đã tự động điền: ' + company.name, 'success');
    }
}