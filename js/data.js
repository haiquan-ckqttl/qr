var companyDatabase = [];

window.addEventListener('DOMContentLoaded', function() {
    // Kéo CSDL Doanh nghiệp về trình duyệt
    fetch('./data/companies.json')
        .then(response => response.json())
        .then(data => {
            companyDatabase = data;
            buildDatalist();
            console.log("Đã nạp CSDL Doanh nghiệp: " + data.length + " bản ghi.");
        })
        .catch(err => console.warn("Lỗi nạp CSDL Doanh nghiệp (Có thể do mở file:// nội bộ).", err));
});

// Tạo danh sách gợi ý cho ô MST
function buildDatalist() {
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

// Xử lý tự động điền Tên Công ty khi MST khớp
function handleAutocompleteMST(id, inputMst) {
    // Chỉ lấy số, giữ nguyên số 0 ở đầu (Dạng chuỗi Text)
    var cleanMst = inputMst.replace(/\D/g, ''); 
    
    // Quét tìm xem MST nhập tay có nằm trong DB không
    var company = companyDatabase.find(c => c.mst === cleanMst);
    
    // Nếu có thì tự động điền Tên Công ty. Nếu KHÔNG có, giữ nguyên cho người dùng tự gõ tay.
    if (company) {
        setField(id, 'tencty', company.name);
        var nameInput = document.getElementById('f' + id + 'tencty');
        if(nameInput) nameInput.value = company.name;
        toast('Đã tự động điền: ' + company.name, 'success');
    }
}