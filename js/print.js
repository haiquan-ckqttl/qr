/* ============================================================
   FILE: js/print.js
   THUẬT TOÁN VẼ GIAO DIỆN BẢN IN (CHUẨN FORM HẢI QUAN)
   ============================================================ */

function buildPrintHTML(item) {
    var p = item.p;
    var now = new Date();
    
    var pad = n => String(n).padStart(2, '0');
    var currentDay = pad(now.getDate());
    var currentMonth = pad(now.getMonth() + 1);
    var currentYear = now.getFullYear();
    // Tạo chuỗi ngày giờ in hoàn chỉnh (Ví dụ: 19:45 04/06/2026)
    var ts = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ' ' + currentDay + '/' + currentMonth + '/' + currentYear;

    // Dò tìm Tên hiển thị (displayName) từ Mã code loại hình
    var loaiHinhName = p.loaihinh;
    if (typeof LOAI_HINH_OPTIONS !== 'undefined') {
        var found = LOAI_HINH_OPTIONS.find(opt => opt.code === p.loaihinh);
        if (found) loaiHinhName = found.displayName;
    }

    return `
    <div class="print-page" style="position: relative; width: 100%; font-family: 'Times New Roman', Times, serif; padding: 8mm 15mm; box-sizing: border-box; font-size: 11pt; line-height: 1.35; color: #000; background: #fff; height: 297mm; overflow: hidden;">
        
        <img src="./images/logo-hq.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 140mm; z-index: 0; pointer-events: none;"/>

        <div style="position: relative; z-index: 1;">
            
            <table style="width:100%; border:none; margin-bottom: 3mm; border-collapse: collapse;">
                <tr>
                    <td style="width: 20%; text-align: center; vertical-align: top;">
                        ${item.urlHoSo ? `<img src="${item.urlHoSo}" style="width:23mm; height:23mm; display:block; margin:0 auto;"/>` : `<div style="width:23mm;height:23mm;border:1px solid #000;margin:0 auto;"></div>`}
                    </td>
                    <td style="width: 50%; text-align: center; vertical-align: top; font-weight: bold; font-size: 11pt; line-height: 1.3;">
                        CHI CỤC HẢI QUAN KHU VỰC XVI<br>
                        HẢI QUAN CỬA KHẨU QUỐC TẾ TÀ LÙNG
                    </td>
                    <td style="width: 30%; vertical-align: top; font-weight: bold; font-size: 11pt; line-height: 1.5; padding-left: 5mm;">
                        Nhập sổ:..........................<br>
                        Loại hình: <span style="text-decoration: underline none;"><b>${p.loaihinh || '......................'}</b></span>
                    </td>
                </tr>
            </table>

            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 3mm;">
                PHIẾU ĐĂNG KÝ HỒ SƠ HẢI QUAN<br>
                <span style="font-size: 11pt; font-weight: bold;">(Tờ khai đăng ký ${loaiHinhName || '......................'})</span>
            </div>

            <div style="font-weight: bold; margin-bottom: 2mm;">I. PHẦN DÀNH CHO NGƯỜI KHAI HẢI QUAN:</div>
            <div style="display:flex; margin-bottom:2px;">
                <span>Tên đơn vị: </span><span style="flex:1; border-bottom:1px dotted #000; margin-left:5px;"><b>${p.tencty}</b></span>
            </div>
            <div style="display:flex; margin-bottom:2px;">
                <span>Mã số thuế: </span><span style="flex:1; border-bottom:1px dotted #000; margin-left:5px;"><b>${p.mst}</b></span>
            </div>
            <div style="display:flex; margin-bottom:2px; align-items: flex-end;">
                <span>Số, ngày tờ khai: </span><span style="border-bottom:1px dotted #000; width: 140px; text-align:center;"><b>${p.sotokhai}</b></span>
                <span> /....../11B1 ngày </span><span style="border-bottom:1px none #000; width: 100px; text-align:center;"><b>${p.ngaytokhai || '...../...../2026'}</b></span>
                <span>; Luồng: </span><span style="flex:1; border-bottom:1px dotted #000; text-align:center;"><b>${p.luong || ''}</b></span>
            </div>
            <div style="display:flex; margin-bottom:3mm; align-items: flex-end;">
                <span>Bản kê nhập khẩu hàng hóa số: </span><span style="border-bottom:1px dotted #000; flex:1; text-align:center;"><b>${p.banke || ''}</b></span>
                <span> Nghiệp vụ: </span><span style="flex:1; border-bottom:1px dotted #000; text-align:center;"><b>${p.nghiepvu || ''}</b></span>
            </div>

            <div style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 3mm;">
                <div>
                    <i>Ngày ..... tháng ..... năm ........</i><br>
                    <b>Công chức đối chiếu thu phí cơ sở hạ tầng</b><br>
                    <i>(Ký tên hoặc đóng dấu)</i>
                    <div style="height: 18mm;"></div>
                </div>
                <div>
                    <i>Ngày ..... tháng ..... năm ........</i><br>
                    <b>Người khai hải quan</b><br>
                    <i>(Ký, ghi rõ họ tên)</i>
                    <div style="height: 18mm;"></div>
                    <b>${p.nguoikhai}</b>
                </div>
            </div>

            <div style="font-weight: bold; margin-bottom: 2mm;">II. PHẦN DÀNH CHO CÔNG CHỨC HẢI QUAN:</div>
            <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 3mm;">
                <tr>
                    <td style="width: 33.33%; padding: 4px; height: 35mm; vertical-align: top;">
                        <b>CC kiểm tra hồ sơ (Bước 2)</b><br>2)..............................<br><i>(ký đóng dấu)</i>
                    </td>
                    <td style="width: 33.33%; padding: 4px; vertical-align: top;">
                        <b>CC kiểm tra thực tế (Bước 3)</b><br>3)..............................<br><i>(ký đóng dấu)</i>
                    </td>
                    <td style="width: 33.33%; padding: 4px; vertical-align: top;">
                        <b>CC kiểm tra thuế, lệ phí (Bước 4)</b><br>4)..............................<br><i>(ký đóng dấu)</i>
                    </td>
                </tr>
            </table>

            <table border="1" style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="width: 60%; padding: 6px 10px; vertical-align: top;">
                        <div style="font-weight: bold; text-align: center; margin-bottom: 5px; font-size: 11pt;">
                            ĐĂNG KÝ THÔNG TIN PTVT<br>CHỞ HÀNG HÓA XUẤT KHẨU/NHẬP KHẨU
                        </div>
                        <div style="display:flex; font-weight: bold;">
                            <span>Địa điểm tập kết: </span><span style="flex:1; border-bottom:1px dotted #000; margin-left:5px; font-weight:normal;"><b>${p.diadiem}</b></span>
                        </div>
                    </td>
                    <td style="width: 40%; padding: 6px 10px; vertical-align: top;">
                        <b>GET IN:</b>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="padding: 4px 10px; background-color: #f9f9f9;">
                        <b>III. PHẦN PHIẾU ĐĂNG KÝ PTVT CHỞ HÀNG XUẤT NHẬP KHẨU:</b>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 6px 10px; vertical-align: top; line-height: 1.35;">
                        1. Biển kiểm soát: <b>${p.bks}</b><br>
                        2. Số hiệu Container: <b>${p.socont}</b><br>
                        3. Mặt hàng: <b>${p.mathang}</b><br>
                        4. Mã số thuế: <b>${p.mst}</b><br>
                        5. Số CCCD/GPLX của người ĐKPTVT: <b>${p.cccd || '..........................'}</b><br>
                        6. Tên lái xe: <b>${p.laixe || '........................................................................'}</b><br>
                        7. SĐT lái xe: <b>${p.sdtlaixe || '..................................'}</b>
                    </td>
                    <td style="padding: 6px 10px; vertical-align: top;">
                        <div style="margin-bottom:6px;"><b>1. Ngày xuất cảnh:</b><br><div style="border-bottom:1px dotted #000; height:10px;"></div></div>
                        <div style="margin-bottom:6px;"><b>2. Ngày nhập cảnh:</b><br><div style="border-bottom:1px dotted #000; height:10px;"></div></div>
                        
                        <div style="text-align: center; margin-top: 4px;">
                            ${item.urlPTVT ? `<img src="${item.urlPTVT}" style="width:23mm; height:23mm; display:block; margin: 0 auto;"/>` : `<div style="width:23mm;height:23mm;border:1px solid #000;margin:0 auto;"></div>`}
                        </div>
                    </td>
                </tr>
            </table>
            
            <div style="text-align: right; margin-top: 2mm; padding-right: 15mm;">
                <b>CC giám sát</b><br>
                <i>(ký đóng dấu)</i>
                <div style="height: 14mm;"></div>
            </div>
        </div>

        <div style="position: absolute; bottom: 6mm; left: 15mm; right: 15mm; border-top: 0.5px solid #bbb; padding-top: 1mm; font-size: 8.5pt; color: #444; font-style: italic; display: flex; justify-content: space-between; font-family: sans-serif; z-index: 10; pointer-events: none;">
            <span>Hải quan Cửa khẩu Quốc tế Tà Lùng</span>
            <span>Thời gian in: ${ts}</span>
        </div>
    </div>
    
    <div class="print-page" style="position: relative; width: 100%; font-family: 'Times New Roman', Times, serif; padding: 15mm; box-sizing: border-box; font-size: 11pt; line-height: 1.4; color: #000; background: #fff; height: 297mm; overflow: hidden;">
        
        <img src="./images/logo-hq.png" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.1; width: 150mm; z-index: 0; pointer-events: none;"/>

        <div style="position: relative; z-index: 1;">
            <div style="text-align: center; font-weight: bold; font-size: 12pt; margin-bottom: 8mm;">
                THÔNG TIN BỔ SUNG CỦA NGƯỜI KHAI HẢI QUAN<br>
                <span style="font-size: 11pt; font-weight: bold; text-decoration: underline;">(Sử dụng trong trường hợp cần bổ sung thông tin)</span>
            </div>
            
            <table border="1" style="width: 100%; border-collapse: collapse; text-align: center; margin-bottom: 5mm; font-weight: bold;">
                <tr>
                    <th style="padding: 12px 8px; width: 8%;">STT</th>
                    <th style="padding: 12px 8px; width: 32%;">Thông tin bổ sung</th>
                    <th style="padding: 12px 8px; width: 40%;">Nội dung</th>
                    <th style="padding: 12px 8px; width: 20%;">Ghi chú</th>
                </tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
                <tr><td style="height: 18mm;"></td><td></td><td></td><td></td></tr>
            </table>
            
            <div style="text-align: right; padding-right: 15mm; margin-top: 15mm;">
                <b style="font-size: 12pt;">Người khai hải quan</b><br>
                <i style="font-size: 11pt;">(Ký, ghi rõ họ tên)</i><br><br><br><br><br>
                <b>${p.nguoikhai}</b>
            </div>
        </div>

        <div style="position: absolute; bottom: 6mm; left: 15mm; right: 15mm; border-top: 0.5px solid #bbb; padding-top: 1mm; font-size: 8.5pt; color: #444; font-style: italic; display: flex; justify-content: space-between; font-family: sans-serif; z-index: 10; pointer-events: none;">
            <span>Hải quan Cửa khẩu Quốc tế Tà Lùng</span>
            <span>Thời gian in: ${ts}</span>
        </div>
    </div>
    `;
}

/* ============================================================
   XỬ LÝ IN & TẠO 2 MÃ QR ĐỒNG THỜI
   ============================================================ */
function doPrint(){
    var list = phieus.filter(isReady);
    if(!list.length) { toast('Không có phiếu nào đủ điều kiện in','error'); return; }
    
    var loadingModal = document.getElementById('print-loading');
    if(loadingModal) loadingModal.classList.add('open');
    if(typeof closeModal === 'function') closeModal();

    Promise.all(list.map(function(p){
        // 1. Lấy cấu hình ĐỘNG cho Hồ Sơ
        var configHoSo = MAPPING_QR_HOSO[p.loaihinh] || MAPPING_QR_HOSO[LOAI_HINH_OPTIONS[0].code];
        var strHoSo = buildQRStr(p, configHoSo);
        
        // 2. Lấy cấu hình CỐ ĐỊNH cho PTVT
        var strPTVT = buildQRStr(p, qrPTVTConfig);
        
        // 3. Render ra ảnh
        return Promise.all([
            getQRDataURL(strHoSo, 120),
            getQRDataURL(strPTVT, 120)
        ]).then(function(urls){
            return { p: p, urlHoSo: urls[0], urlPTVT: urls[1] };
        });

    })).then(function(items){
        // Gắn HTML vào DOM
        var html = items.map(buildPrintHTML).join('');
        document.getElementById('print-output').innerHTML = html;
        
        // Cấu hình CSS In động ẩn hoàn toàn tất cả giao diện web thừa (bao gồm cả Toaster thông báo)
        var style = document.getElementById('dynamic-page-style');
        if(!style){ style=document.createElement('style'); style.id='dynamic-page-style'; document.head.appendChild(style); }
        
        style.textContent = `
            @media print { 
                @page { size: A4 portrait; margin: 0; } 
                body { margin: 0; padding: 0; background: #fff; }
                
                /* Khóa chết tất cả giao diện quản lý, pop-up và thanh thông báo toast */
                .no-print, .toaster, #toaster, .toast, .modal-bg, #print-loading { 
                    display: none !important; 
                }
                
                .print-only { display: block !important; }
                
                .print-page { 
                    height: 297mm; 
                    max-height: 297mm;
                    box-sizing: border-box;
                    position: relative;
                    overflow: hidden;
                    page-break-after: always !important; 
                    break-after: page !important; 
                }
                
                /* Trang cuối cùng của lệnh in sẽ bị triệt tiêu lệnh ngắt trang để chống sinh trang trắng */
                #print-output .print-page:last-child { 
                    page-break-after: avoid !important; 
                    break-after: avoid !important;
                    margin-bottom: 0 !important;
                    padding-bottom: 0 !important;
                }
            }
        `;
        
        setTimeout(function(){
            if(loadingModal) loadingModal.classList.remove('open');
            window.print();
        }, 500); 
    }).catch(function(){
        if(loadingModal) loadingModal.classList.remove('open');
        toast('Lỗi tạo QR. Vui lòng thử lại.','error');
    });
}