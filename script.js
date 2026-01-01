const nameInput = document.getElementById('userName');
const displayName = document.getElementById('display-name');
const slipUpload = document.getElementById('slipUpload');
const slipPreview = document.getElementById('slip-preview');
const downloadBtn = document.getElementById('download-btn');
const ticket = document.getElementById('ticket');

// อัปเดตชื่อแบบ Real-time
nameInput.addEventListener('input', (e) => {
    displayName.innerText = e.target.value.toUpperCase() || "YOUR NAME";
});

// อัปโหลดและแสดงสลิป
slipUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // ใส่รูปภาพเข้าไปใน Container
            slipPreview.innerHTML = `<img src="${e.target.result}" class="slip-preview-img">`;
            // ลบเส้นประและพื้นหลังมืดออกเพื่อให้สลิปดูเด่น
            slipPreview.style.border = "none";
            slipPreview.style.background = "transparent";
        }
        reader.readAsDataURL(file);
    }
});

// ฟังก์ชันบันทึกภาพบัตร
downloadBtn.addEventListener('click', () => {
    if(nameInput.value === "" || slipUpload.files.length === 0) {
        alert("กรุณาใส่ชื่อและอัปโหลดสลิปก่อนบันทึกครับ");
        return;
    }

    // ใช้ scale: 2 เพื่อให้ภาพที่เซฟออกมาคมชัด (High Resolution)
    html2canvas(ticket, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Ticket-NY2027-${nameInput.value}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    });
});