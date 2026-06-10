/* ============================================================
   FILE: js/app.js
   CHỨC NĂNG: Quản lý giao diện, sự kiện, Auto-Save và Export/Import Excel
   ============================================================ */

var QRGenInline = (function(){
    function encodeUTF8(str){
        var bytes=[];
        for(var i=0;i<str.length;i++){
            var c=str.charCodeAt(i);
            if(c<0x80) bytes.push(c);
            else if(c<0x800){bytes.push(0xC0|(c>>6));bytes.push(0x80|(c&0x3F));}
            else if(c<0x10000){bytes.push(0xE0|(c>>12));bytes.push(0x80|((c>>6)&0x3F));bytes.push(0x80|(c&0x3F));}
            else{bytes.push(0xF0|(c>>18));bytes.push(0x80|((c>>12)&0x3F));bytes.push(0x80|((c>>6)&0x3F));bytes.push(0x80|(c&0x3F));}
        }
        return bytes;
    }
    function toFallbackURL(text,size){
        return 'https://api.qrserver.com/v1/create-qr-code/?size='+size+'x'+size
            +'&charset-source=UTF-8&ecc=H&data='+encodeURIComponent(text);
    }
    return {toFallbackURL:toFallbackURL, encodeUTF8:encodeUTF8};
})();

var phieus = [];
var nextId = 1;

// Mảng REQUIRED: Bổ sung somooc, diachilaixe. (trongluong là optional)
var REQUIRED_BASE = ['loaihinh', 'mst', 'tencty', 'diachicty', 'sotokhai', 'diadiem', 'bks', 'socont', 'somooc', 'mathang', 'cccd', 'laixe', 'sdtlaixe', 'diachilaixe', 'nguoikhai'];

window.addEventListener('DOMContentLoaded', function(){
    detectLib();
    // Thử khôi phục dữ liệu từ bộ nhớ. Nếu không có mới tạo phiếu trống.
    if(!loadFromLocal()) {
        addPhieu();
    }
});

function detectLib(){
    var badge = document.getElementById('lib-badge');
    var text  = document.getElementById('lib-text');
    if(typeof QRCode !== 'undefined' && typeof QRCode.toCanvas === 'function'){
        text.textContent = 'Thư viện offline (soldair): Sẵn sàng';
        return;
    }
    if(typeof QRCode !== 'undefined'){
        text.textContent = 'Thư viện offline (qrcodejs): Sẵn sàng';
        return;
    }
    badge.className = 'lib-badge warn';
    text.textContent = 'Không tìm thấy thư viện offline — dùng API online cho QR';
}

/* ============================================================
   TÍNH NĂNG AUTO-SAVE VÀ KHÔI PHỤC DỮ LIỆU
   ============================================================ */
function flashSaveBadge() {
    var b = document.getElementById('save-badge');
    if(b) {
        b.classList.remove('flash-save');
        void b.offsetWidth; // trigger reflow
        b.classList.add('flash-save');
    }
}

function saveToLocal() {
    localStorage.setItem('qr_hoso_talung_v2', JSON.stringify(phieus));
    flashSaveBadge();
}

function loadFromLocal() {
    var data = localStorage.getItem('qr_hoso_talung_v2');
    if(data) {
        try {
            var parsed = JSON.parse(data);
            if(parsed && parsed.length > 0) {
                phieus = parsed;
                nextId = Math.max(...phieus.map(p => p.id)) + 1;
                phieus.forEach(p => {
                    renderCard(p);
                    fillCard(p);
                    refreshStatus(p);
                });
                updateUI();
                toast('Đã khôi phục ' + phieus.length + ' phiếu chưa in', 'success');
                return true;
            }
        } catch(e) { console.warn("Lỗi đọc dữ liệu local", e); }
    }
    return false;
}

/* ============================================================
   TÍNH NĂNG XUẤT/NHẬP EXCEL
   ============================================================ */
function exportToExcel() {
    if (typeof XLSX === 'undefined') {
        toast('Thư viện Excel đang tải, vui lòng thử lại sau', 'error');
        return;
    }
    if (phieus.length === 0) {
        toast('Không có phiếu nào để xuất', 'error');
        return;
    }
    var data = phieus.map(function(p) {
        return {
            "Loại hình": p.loaihinh, "MST": p.mst, "Tên DN": p.tencty, "Địa chỉ DN": p.diachicty,
            "Số Tờ Khai": p.sotokhai, "Ngày Tờ Khai": p.ngaytokhai_raw, "Luồng": p.luong,
            "Địa điểm": p.diadiem, "Người khai HQ": p.nguoikhai,
            "Biển kiểm soát": p.bks, "Số Container": p.socont, "Số Rơ-moóc": p.somooc,
            "Mặt hàng": p.mathang, "Trọng lượng (Tấn)": p.trongluong,
            "CCCD Lái xe": p.cccd, "Tên lái xe": p.laixe, "SĐT Lái xe": p.sdtlaixe, "Địa chỉ Lái xe": p.diachilaixe
        };
    });
    var ws = XLSX.utils.json_to_sheet(data);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachPhieu");
    XLSX.writeFile(wb, "DanhSachPhieu_TaLung_" + new Date().getTime() + ".xlsx");
    toast('Đã xuất file Excel', 'success');
}

function importFromExcel(event) {
    var file = event.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') {
        toast('Thư viện Excel chưa sẵn sàng', 'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, {type: 'array'});
            var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            var rows = XLSX.utils.sheet_to_json(firstSheet);
            
            if (rows.length === 0) { toast('File Excel trống', 'error'); return; }
            if(!confirm('Nhập dữ liệu từ Excel sẽ XÓA THAY THẾ toàn bộ phiếu hiện tại. Bạn có chắc chắn?')) {
                document.getElementById('excel-upload').value = ""; return;
            }
            
            // Clear all
            phieus = []; document.getElementById('phieu-list').innerHTML = '';
            
            rows.forEach(function(row) {
                var p = {
                    id: nextId++,
                    loaihinh: row["Loại hình"] || (LOAI_HINH_OPTIONS[0] ? LOAI_HINH_OPTIONS[0].code : ''),
                    mst: String(row["MST"] || ''), tencty: String(row["Tên DN"] || '').toUpperCase(),
                    diachicty: row["Địa chỉ DN"] || '', sotokhai: String(row["Số Tờ Khai"] || ''),
                    ngaytokhai_raw: row["Ngày Tờ Khai"] || '', ngaytokhai: '', luong: row["Luồng"] || '',
                    diadiem: row["Địa điểm"] || '', nguoikhai: row["Người khai HQ"] || '',
                    bks: String(row["Biển kiểm soát"] || '').toUpperCase(),
                    socont: String(row["Số Container"] || '').toUpperCase(),
                    somooc: String(row["Số Rơ-moóc"] || '').toUpperCase(),
                    mathang: row["Mặt hàng"] || '', trongluong: String(row["Trọng lượng (Tấn)"] || ''),
                    cccd: String(row["CCCD Lái xe"] || ''), laixe: row["Tên lái xe"] || '',
                    sdtlaixe: String(row["SĐT Lái xe"] || ''), diachilaixe: row["Địa chỉ Lái xe"] || ''
                };
                if (p.ngaytokhai_raw) {
                    var parts = p.ngaytokhai_raw.split('-');
                    if(parts.length === 3) p.ngaytokhai = parts[2] + '/' + parts[1] + '/' + parts[0];
                }
                phieus.push(p);
                renderCard(p);
                fillCard(p);
                refreshStatus(p);
            });
            updateUI();
            saveToLocal();
            toast('Đã nhập ' + rows.length + ' phiếu từ Excel', 'success');
        } catch(err) { toast('Lỗi đọc file Excel', 'error'); }
        document.getElementById('excel-upload').value = ""; 
    };
    reader.readAsArrayBuffer(file);
}

/* ============================================================
   CÁC HÀM XỬ LÝ QR & GIAO DIỆN PHIẾU
   ============================================================ */
function buildQRStr(p, config){
    var maxIndex = 0;
    for (var key in config) { if (config[key] > maxIndex) maxIndex = config[key]; }
    var arr = new Array(maxIndex + 1).fill("");
    for (var key in config) { arr[config[key]] = p[key] || ""; }
    return arr.join('\t');
}

function getQRDataURL(text, sizePx){
    return new Promise(function(resolve){
        if(!text){ resolve(''); return; }
        if(typeof QRCode !== 'undefined' && typeof QRCode.toDataURL === 'function'){
            QRCode.toDataURL(text,{
                width:sizePx, margin:1, errorCorrectionLevel:'H', color:{dark:'#000',light:'#fff'}
            }).then(resolve).catch(function(){ resolve(QRGenInline.toFallbackURL(text,sizePx)); }); return;
        }
        if(typeof QRCode !== 'undefined'){
            try{
                var div = document.createElement('div');
                div.style.cssText='position:fixed;left:-9999px;top:-9999px;width:'+sizePx+'px;height:'+sizePx+'px';
                document.body.appendChild(div);
                new QRCode(div,{text:text,width:sizePx,height:sizePx,colorDark:'#000000',colorLight:'#ffffff',correctLevel:3});
                setTimeout(function(){
                    var cv = div.querySelector('canvas');
                    var url = cv ? cv.toDataURL('image/png') : QRGenInline.toFallbackURL(text,sizePx);
                    document.body.removeChild(div); resolve(url);
                }, 80); return;
            }catch(e){ }
        }
        resolve(QRGenInline.toFallbackURL(text,sizePx));
    });
}

function addPhieu(){
    var id = nextId++;
    var p = {
        id: id, loaihinh: (typeof LOAI_HINH_OPTIONS !== 'undefined' && LOAI_HINH_OPTIONS.length > 0) ? LOAI_HINH_OPTIONS[0].code : '', 
        mst: '', tencty: '', diachicty: '', sotokhai: '', ngaytokhai: '', ngaytokhai_raw: '', luong: '', diadiem: '', 
        bks: '', socont: '', somooc: '', mathang: '', trongluong: '', cccd: '', laixe: '', sdtlaixe: '', diachilaixe: '', nguoikhai: ''
    };
    phieus.push(p); renderCard(p); updateUI(); saveToLocal();
}

function duplicatePhieu(id){
    var src = phieus.find(function(x){return x.id===id;});
    if(!src) return;
    var nid = nextId++;
    var copy = Object.assign({}, src, {id: nid});
    phieus.push(copy); renderCard(copy);
    setTimeout(function(){ fillCard(copy); refreshStatus(copy); saveToLocal(); }, 30);
    updateUI(); toast('Nhân đôi phiếu #' + id + ' → #' + nid, 'success');
}

function deletePhieu(id){
    var el = document.getElementById('card-'+id);
    if(el) el.remove();
    phieus = phieus.filter(function(p){return p.id!==id;});
    updateUI(); saveToLocal(); toast('Đã xóa phiếu #'+id, 'info');
}

function clearAll(){
    if(!confirm('Xóa toàn bộ phiếu?')) return;
    phieus=[]; document.getElementById('phieu-list').innerHTML='';
    renderEmpty(); updateUI(); saveToLocal(); toast('Đã xóa tất cả', 'info');
}

/* ============================================================
   CÁC HÀM XỬ LÝ GIAO DIỆN PHIẾU & ĐÓNG/MỞ
   ============================================================ */
var isAllCollapsed = false;
function collapseAll(){
    isAllCollapsed = !isAllCollapsed;
    phieus.forEach(function(p){ setCollapse(p.id, isAllCollapsed); });
    var btn = document.querySelector('button[onclick="collapseAll()"]');
    if(btn) {
        if(isAllCollapsed) {
            btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg> Mở rộng';
        } else {
            btn.innerHTML = '<svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7"/></svg> Thu gọn';
        }
    }
}

function setCollapse(id, collapsed){
    var body = document.getElementById('body-'+id);
    var chev = document.getElementById('chev-'+id);
    if(!body) return;
    if(collapsed){ body.className = 'card-body closed'; if(chev) chev.className = 'chevron'; } 
    else { body.className = 'card-body'; if(chev) chev.className = 'chevron up'; }
}

function renderEmpty(){
    var list = document.getElementById('phieu-list');
    if(!list.querySelector('.empty-state')){
        list.innerHTML = '<div class="empty-state"><svg width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg><h3>Chưa có phiếu nào</h3><p>Nhấn "Thêm phiếu" để bắt đầu</p></div>';
    }
}

/* ============================================================
   BỐ CỤC LẠI GRID CHO THÔNG MINH
   ============================================================ */
function renderCard(p){
    var list = document.getElementById('phieu-list');
    var es = list.querySelector('.empty-state'); if(es) es.remove();

    var loaiHinhOptionsHtml = (typeof LOAI_HINH_OPTIONS !== 'undefined') 
        ? LOAI_HINH_OPTIONS.map(opt => `<option value="${opt.code}">${opt.code} - ${opt.displayName}</option>`).join('')
        : `<option value="">Chưa tải được cấu hình</option>`;

    var card = document.createElement('div');
    card.className = 'phieu-card'; card.id = 'card-' + p.id;
    
    card.innerHTML = `
        <div class="card-head" onclick="toggleCard(${p.id})">
            <div class="phieu-num">${p.id}</div>
            <div class="card-title" id="ctitle-${p.id}">Phiếu #${p.id} — Chưa nhập</div>
            <span class="status-pill sp-pending" id="spill-${p.id}">Chưa đủ</span>
            <svg class="chevron up" id="chev-${p.id}" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="card-body" id="body-${p.id}">
            
            <div class="form-grid">
                
                <!-- Dòng 1: Loại hình (1/3) - MST (2/3) -->
                <div class="fg">
                    <label>Loại hình khai báo <span class="req">*</span></label>
                    <select class="fi" id="f${p.id}loaihinh" onchange="setField(${p.id},'loaihinh',this.value)">${loaiHinhOptionsHtml}</select>
                </div>
                
                <div class="fg col-span-2">
                    <label>Mã số thuế <span class="req">*</span></label>
                    <div class="mst-flex">
                        <div class="fi-wrap">
                            <input class="fi" id="f${p.id}mst" list="mst-suggestions" placeholder="Nhập 10 hoặc 14 số" maxlength="14" 
                                   oninput="var val=this.value.replace(/\\D/g,''); setField(${p.id},'mst',val); if(typeof handleAutocompleteMST === 'function') handleAutocompleteMST(${p.id}, val);">
                            <span class="fi-check" id="mstchk${p.id}"></span>
                        </div>
                        <button class="btn btn-primary btn-search-mst" onclick="fetchMST(${p.id})" id="fbtn${p.id}" title="Tra cứu Tên & Địa chỉ DN">
                            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Tra cứu
                        </button>
                    </div>
                    <div class="field-err" id="msterr${p.id}">MST phải đúng 10 hoặc 14 chữ số!</div>
                </div>

                <!-- Dòng 2: Tên (2/3) - Địa chỉ (1/3) -->
                <div class="fg col-span-2">
                    <label>Tên đơn vị (DN) <span class="req">*</span></label>
                    <input class="fi uppercase" id="f${p.id}tencty" placeholder="Nhập tên doanh nghiệp..." oninput="setField(${p.id},'tencty',this.value.toUpperCase())">
                </div>

                <div class="fg">
                    <label>Địa chỉ DN <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}diachicty" placeholder="Địa chỉ DN..." oninput="setField(${p.id},'diachicty',this.value)">
                        <span class="fi-check" id="diachictychk${p.id}"></span>
                    </div>
                </div>
                
                <!-- Dòng 3: Số TK - Ngày - Luồng -->
                <div class="fg">
                    <label>Số tờ khai (STK) <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}sotokhai" placeholder="Nhập 12 chữ số" maxlength="12" oninput="setField(${p.id},'sotokhai',this.value.replace(/\\D/g,''))">
                        <span class="fi-check" id="stkchk${p.id}"></span>
                    </div>
                    <div class="field-err" id="stkerr${p.id}">STK phải đúng 12 chữ số!</div>
                </div>

                <div class="fg">
                    <label>Ngày tờ khai <span class="opt-tag">Tùy chọn</span></label>
                    <input type="date" class="fi" id="f${p.id}ngaytokhai" onchange="handleDateSelect(${p.id}, this.value)">
                </div>

                <div class="fg">
                    <label id="lbl-luong-${p.id}">Luồng <span class="opt-tag" id="req-luong-${p.id}">Tùy chọn</span></label>
                    <select class="fi" id="f${p.id}luong" onchange="setField(${p.id},'luong',this.value)">
                        <option value="">-- Chọn Luồng --</option>
                        <option value="Xanh">Xanh</option><option value="Vàng">Vàng</option><option value="Đỏ">Đỏ</option>
                    </select>
                </div>

                <!-- Dòng 4: Vận Tải (BKS - Cont - Moóc) -->
                <div class="fg">
                    <label>Biển kiểm soát <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi uppercase" id="f${p.id}bks" placeholder="VD: 34H12121" oninput="setField(${p.id},'bks',this.value.toUpperCase().replace(/[^A-Z0-9]/g,''))">
                        <span class="fi-check" id="bkschk${p.id}"></span>
                    </div>
                    <div class="field-err" id="bkserr${p.id}">Viết liền, không ký tự đặc biệt</div>
                </div>
                
                <div class="fg">
                    <label>Số Container <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi uppercase" id="f${p.id}socont" placeholder="4 Chữ + 7 Số (hoặc /)" oninput="setField(${p.id},'socont',this.value.toUpperCase().replace(/[^A-Z0-9/]/g,''))">
                        <span class="fi-check" id="socontchk${p.id}"></span>
                    </div>
                    <div class="field-err" id="soconterr${p.id}">Chuẩn ISO: 4 chữ + 7 số (hoặc /)</div>
                </div>

                <div class="fg">
                    <label>Số Rơ-moóc <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi uppercase" id="f${p.id}somooc" placeholder="Chữ & Số (hoặc /)" oninput="setField(${p.id},'somooc',this.value.toUpperCase().replace(/[^A-Z0-9/]/g,''))">
                        <span class="fi-check" id="somoocchk${p.id}"></span>
                    </div>
                    <div class="field-err" id="somoocerr${p.id}">Gồm chữ và số, 6-9 ký tự (hoặc /)</div>
                </div>
                
                <!-- Dòng 5: Hàng Hóa (Địa điểm - Mặt hàng - Người khai) -->
                <div class="fg">
                    <label>Địa điểm tập kết <span class="req">*</span></label>
                    <input class="fi" id="f${p.id}diadiem" list="location-suggestions" placeholder="Chọn hoặc nhập..." oninput="setField(${p.id},'diadiem',this.value)">
                </div>
                
                <div class="fg">
                    <label>Mặt hàng <span class="req">*</span></label>
                    <input class="fi" id="f${p.id}mathang" placeholder="VD: Sầu riêng tươi" oninput="setField(${p.id},'mathang',this.value)">
                </div>

                <div class="fg">
                    <label>Người khai Hải quan <span class="req">*</span></label>
                    <input class="fi" id="f${p.id}nguoikhai" placeholder="Họ và tên..." oninput="setField(${p.id},'nguoikhai',this.value)">
                </div>

                <!-- Dòng 6: Lái Xe (Tên - CCCD - SĐT) -->
                <div class="fg">
                    <label>Tên lái xe <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}laixe" placeholder="Họ và tên hoặc gõ /" oninput="setField(${p.id},'laixe',this.value)">
                        <span class="fi-check" id="laixechk${p.id}"></span>
                    </div>
                    <div class="field-err" id="laixeerr${p.id}">Nhập tên hoặc gõ "/"</div>
                </div>

                <div class="fg">
                    <label>CCCD / GPLX Lái xe <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}cccd" placeholder="Số giấy tờ hoặc gõ /" oninput="setField(${p.id},'cccd',this.value.replace(/[^0-9/]/g,''))">
                        <span class="fi-check" id="cccdchk${p.id}"></span>
                    </div>
                    <div class="field-err" id="cccderr${p.id}">Nhập đủ dãy số hoặc gõ "/"</div>
                </div>

                <div class="fg">
                    <label>SĐT Lái xe <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}sdtlaixe" placeholder="Số điện thoại hoặc gõ /" oninput="setField(${p.id},'sdtlaixe',this.value.replace(/[^0-9/]/g,''))">
                        <span class="fi-check" id="sdtlaixechk${p.id}"></span>
                    </div>
                    <div class="field-err" id="sdtlaixeerr${p.id}">Nhập 10-11 số hoặc gõ "/"</div>
                </div>

                <!-- Dòng 7: Bổ sung Lái Xe (Địa chỉ 2/3 - Trọng lượng 1/3) -->
                <div class="fg col-span-3">
                    <label>Địa chỉ Lái xe <span class="req">*</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}diachilaixe" placeholder="Địa chỉ thường trú hoặc gõ /" oninput="setField(${p.id},'diachilaixe',this.value)">
                        <span class="fi-check" id="diachilaixechk${p.id}"></span>
                    </div>
                    <div class="field-err" id="diachilaixeerr${p.id}">Không được để trống (nhập / nếu chưa rõ)</div>
                </div>

                <div class="fg" style="display:none">
                    <label>Trọng lượng (Tấn) <span class="opt-tag">Tùy chọn</span></label>
                    <div class="fi-wrap">
                        <input class="fi" id="f${p.id}trongluong" placeholder="VD: 15.5 hoặc /" oninput="setField(${p.id},'trongluong',this.value.replace(/[^0-9./]/g,''))">
                        <span class="fi-check" id="trongluongchk${p.id}"></span>
                    </div>
                    <div class="field-err" id="trongluongerr${p.id}">Nhập số hoặc gõ "/"</div>
                </div>
                
            </div>
            
        </div>
        <div class="card-foot" id="foot-${p.id}">
            <span class="foot-info" id="finfo-${p.id}">Điền đủ các trường bắt buộc (*) để tạo mã QR</span>
            <div style="display:flex;gap:6px">
                <button class="btn btn-ghost btn-sm" onclick="duplicatePhieu(${p.id})">Nhân đôi</button>
                <button class="btn btn-red btn-sm" onclick="deletePhieu(${p.id})">Xóa</button>
            </div>
        </div>
    `;
    list.appendChild(card);
    toggleLuongRequired(p.id, p.loaihinh);
}

function handleDateSelect(id, val) {
    var p = phieus.find(function(x){return x.id === id;});
    if(!p) return;
    p.ngaytokhai_raw = val; 
    if (val) {
        var parts = val.split('-');
        p.ngaytokhai = parts[2] + '/' + parts[1] + '/' + parts[0]; 
    } else { p.ngaytokhai = ''; }
    refreshStatus(p); saveToLocal();
}

function fillCard(p){
    var fields = ['loaihinh', 'mst', 'tencty', 'diachicty', 'sotokhai', 'luong', 'diadiem', 'bks', 'socont', 'somooc', 'mathang', 'trongluong', 'cccd', 'nguoikhai', 'laixe', 'sdtlaixe', 'diachilaixe'];
    fields.forEach(function(k){
        var el = document.getElementById('f'+p.id+k);
        if(el) el.value = p[k] || '';
    });
    var dateEl = document.getElementById('f'+p.id+'ngaytokhai');
    if(dateEl) dateEl.value = p.ngaytokhai_raw || '';
    toggleLuongRequired(p.id, p.loaihinh);
}

function toggleCard(id){
    var body = document.getElementById('body-'+id);
    if(body) {
        body.className = body.className.includes('closed') ? 'card-body' : 'card-body closed';
        document.getElementById('chev-'+id).className = body.className.includes('closed') ? 'chevron' : 'chevron up';
    }
}

function toggleLuongRequired(id, loaihinhCode) {
    var reqTag = document.getElementById('req-luong-' + id);
    if(reqTag) {
        if(loaihinhCode === 'XNKTL') { reqTag.className = 'req'; reqTag.textContent = '*'; } 
        else { reqTag.className = 'opt-tag'; reqTag.textContent = 'Tùy chọn'; }
    }
}

function isValidField(key, val) {
    if (!val && key !== 'trongluong') return false; // Trọng lượng có thể rỗng
    val = val ? val.trim() : '';
    switch(key) {
        case 'sotokhai': return val.length === 12;
        case 'mst': return val.length === 10 || val.length === 14;
        case 'bks': return val.length >= 4 && !(/[^A-Z0-9]/.test(val));
        case 'socont': return val === '/' || (val.length >= 5 && /^[A-Z0-9]+$/.test(val));
        case 'somooc': return val === '/' || (val.length >= 5 && /^[A-Z0-9]+$/.test(val));
        case 'cccd': return val === '/' || val.length >= 9;
        case 'laixe': return val === '/' || val.length >= 2;
        case 'sdtlaixe': return val === '/' || (val.length >= 10 && val.length <= 11);
        case 'diachicty': return val.length > 0;
        case 'diachilaixe': return val.length > 0;
        case 'trongluong': return val === '' || val === '/' || !isNaN(val);
        default: return val.length > 0;
    }
}

function setField(id, key, value){
    var p = phieus.find(function(x){return x.id === id;});
    if(!p) return;
    p[key] = value;
    
    var el = document.getElementById('f'+id+key);
    if(el && el.value !== value) el.value = value;

    if(key === 'loaihinh') { toggleLuongRequired(id, value); }

    var validateKeys = ['sotokhai', 'mst', 'bks', 'socont', 'somooc', 'cccd', 'laixe', 'sdtlaixe', 'diachicty', 'diachilaixe', 'trongluong'];
    if (validateKeys.includes(key)) {
        var err = document.getElementById(key + 'err' + id);
        var chk = document.getElementById(key + 'chk' + id);
        
        if (!value && key !== 'trongluong') {
            el.className = 'fi' + (['bks','socont','somooc','tencty'].includes(key)?' uppercase':''); 
            if(err) err.classList.remove('show'); 
            if(chk) chk.textContent = '';
        } else {
            if (isValidField(key, value)) {
                el.className = 'fi ok' + (['bks','socont','somooc','tencty'].includes(key)?' uppercase':''); 
                if(err) err.classList.remove('show'); 
                if(chk) { chk.textContent = '✓'; chk.style.color = 'var(--green)'; }
            } else {
                el.className = 'fi bad' + (['bks','socont','somooc','tencty'].includes(key)?' uppercase':''); 
                if(err) err.classList.add('show'); 
                if(chk) chk.textContent = '';
            }
        }
    }

    refreshStatus(p); saveToLocal();
}

function isReady(p){
    var currentReq = [...REQUIRED_BASE];
    if (p.loaihinh === 'XNKTL') { currentReq.push('luong'); }

    return currentReq.every(function(k){ 
        var val = p[k];
        if (['sotokhai', 'mst', 'bks', 'socont', 'somooc', 'cccd', 'laixe', 'sdtlaixe', 'diachicty', 'diachilaixe'].includes(k)) {
            return isValidField(k, val);
        }
        return val && val.trim().length > 0;
    });
}

function refreshStatus(p){
    var card  = document.getElementById('card-'+p.id);
    var spill = document.getElementById('spill-'+p.id);
    var title = document.getElementById('ctitle-'+p.id);

    var ok = isReady(p);
    
    if(card) card.className = 'phieu-card' + (ok ? ' ready' : (!ok && p.mst ? ' errored' : ''));
    if(spill){ spill.textContent = ok?'Sẵn sàng ✓':'Chưa đủ'; spill.className='status-pill '+(ok?'sp-ready':'sp-pending'); }

    var preview = p.sotokhai || p.bks || p.tencty || '';
    if(title) title.innerHTML = `Phiếu #${p.id}` + (preview ? ` — <b>${p.sotokhai || 'Chưa nhập STK'}</b> | BKS: ${p.bks || '...'}` : ' — Chưa nhập');

    updateUI();
}

function updateUI(){
    var n  = phieus.length;
    var nr = phieus.filter(isReady).length;
    document.getElementById('cnt').textContent = n;
    var ca = document.getElementById('btn-clearall');
    if(ca) ca.style.display = n > 0 ? '' : 'none';
    
    var pb = document.getElementById('print-bar');
    if(pb) pb.style.display = n > 0 ? 'flex' : 'none';
    
    var pt = document.getElementById('pb-title');
    var ps = document.getElementById('pb-sub');
    if(pt) pt.textContent = nr + '/' + n + ' phiếu sẵn sàng in';
    if(ps) ps.textContent = (nr < n)
        ? '⚠ ' + (n - nr) + ' phiếu chưa đủ thông tin sẽ bị bỏ qua khi in'
        : (n > 0 ? '✓ Tất cả phiếu đã đủ thông tin' : '');
}

function fetchMST(id){
    var p = phieus.find(function(x){return x.id===id;});
    if(!p || (p.mst.length !== 10 && p.mst.length !== 14)){ toast('MST phải là 10 hoặc 14 số','error'); return; }
    var btn = document.getElementById('fbtn'+id);
    btn.innerHTML='<span class="spin">↻</span>'; btn.disabled=true;
    fetch('https://api.vietqr.io/v2/business/'+p.mst)
        .then(function(r){return r.json();})
        .then(function(d){
            if(d.code==='00' && d.data){
                if(d.data.name) {
                    var upperName = d.data.name.toUpperCase();
                    var elName = document.getElementById('f'+id+'tencty');
                    if(elName) elName.value = upperName;
                    setField(id, 'tencty', upperName);
                }
                if(d.data.address) {
                    var elAddr = document.getElementById('f'+id+'diachicty');
                    if(elAddr) elAddr.value = d.data.address;
                    setField(id, 'diachicty', d.data.address);
                }
                toast('Tìm thấy: '+d.data.name,'success');
            } else { toast('Không tìm thấy DN này trên mạng','error'); }
        })
        .catch(function(){ toast('Lỗi kết nối tra cứu internet','error'); })
        .finally(function(){
            btn.innerHTML='<svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> Tra cứu';
            btn.disabled=false;
        });
}

function closeModal(){ document.getElementById('modal-preview').classList.remove('open'); }
document.getElementById('modal-preview').addEventListener('click',function(e){if(e.target===this)closeModal();});
var modalInstruction = document.getElementById('modal-instruction');
if(modalInstruction) {
    modalInstruction.addEventListener('click', function(e){ if(e.target === this) this.classList.remove('open'); });
}

function openPreview(){
    var list = phieus.filter(isReady);
    if(!list.length){ toast('Chưa có phiếu nào đủ thông tin','error'); return; }
    var body = document.getElementById('modal-body');
    body.innerHTML = '<div style="margin-bottom:10px;padding:8px 12px;background:var(--bg);border-radius:7px;font-size:13px">'
        +'<b>'+list.length+' phiếu</b> sẽ được in (mỗi phiếu 3 trang) '+(phieus.length>list.length?' · <span style="color:var(--orange)">'+( phieus.length-list.length)+' phiếu bỏ qua</span>':'')
        +'</div>'
        +list.map(function(p){
            return '<div style="border:1px solid var(--border);border-radius:7px;padding:10px;margin-bottom:8px;font-size:12px">'
                +'<b style="font-size:13px">Phiếu #'+p.id+'</b>'
                +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 10px;margin-top:6px">'
                    +'<div><b>STK:</b> '+p.sotokhai+'</div>'
                    +'<div><b>BKS:</b> '+p.bks+'</div>'
                    +'<div><b>MST:</b> '+p.mst+'</div>'
                    +'<div><b>Cont:</b> '+p.socont+'</div>'
                    +'<div style="grid-column:1/-1"><b>DN:</b> '+p.tencty+'</div>'
                    +'<div><b>Moóc:</b> '+p.somooc+'</div>'
                    +'<div><b>Trọng lượng:</b> '+(p.trongluong || '/')+'</div>'
                    +'<div style="grid-column:1/-1"><b>Hàng:</b> '+p.mathang+'</div>'
                    +'<div><b>Lái xe:</b> '+p.laixe+'</div>'
                    +'<div><b>SĐT:</b> '+p.sdtlaixe+'</div>'
                    +'<div style="grid-column:1/-1"><b>Địa chỉ TX:</b> '+p.diachilaixe+'</div>'
                +'</div>'
            +'</div>';
        }).join('');
    document.getElementById('modal-preview').classList.add('open');
}

function toast(msg, type){
    var c = document.getElementById('toaster');
    var t = document.createElement('div');
    t.className = 'toast t-'+(type||'info');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(function(){
        t.style.animation='tOut .25s ease forwards';
        setTimeout(function(){t.remove();},260);
    }, 2600);
}