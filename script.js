const nameInput = document.getElementById('userName');
const displayName = document.getElementById('display-name');
const slipUpload = document.getElementById('slipUpload');
const slipPreview = document.getElementById('slip-preview');
const downloadBtn = document.getElementById('download-btn');
const ticket = document.getElementById('ticket');

// 1. อัปเดตชื่อบนบัตรแบบ Real-time
nameInput.addEventListener('input', (e) => {
    displayName.innerText = e.target.value.toUpperCase() || "YOUR NAME";
});

// 2. แสดงตัวอย่างสลิป
slipUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            slipPreview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:contain;">`;
        };
        reader.readAsDataURL(file);
    }
});

// 3. ฟังก์ชันแปลงไฟล์เป็น Base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

// 4. ฟังก์ชันหลัก: ส่งไป Drive และโหลดบัตร
downloadBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim();
    const file = slipUpload.files[0];
    
    // *** วาง URL เว็บแอป (GAS) ของคุณที่นี่ ***
    const GAS_URL = "https://script.google.com/macros/s/AKfycbwqMJOV4kmpYVYsbGukMBADDKVSD8p2qz_p86wgwE3iAaLH84dkOBaPiTm6SRBjV-E8/exec";

    if (!name || !file) {
        alert("กรุณากรอกชื่อและอัปโหลดสลิปด้วยครับ");
        return;
    }

    downloadBtn.innerText = "กำลังอัปโหลดข้อมูล...";
    downloadBtn.disabled = true;

    try {
        const base64Data = await fileToBase64(file);

        // ส่งข้อมูลไป Google Drive อย่างเดียว
        await fetch(GAS_URL, {
            method: "POST",
            mode: "no-cors", 
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                fileName: `HPNY2027_${name}_${Date.now()}.jpg`,
                base64Image: base64Data,
                contentType: file.type,
                guestName: name // ส่งชื่อไปด้วยเพื่อให้ Script จัดการต่อได้
            })
        });

        // สร้างภาพบัตรและดาวน์โหลดลงเครื่องทันที (ไม่ต้องรอผลตอบกลับจาก Drive เพราะใช้ no-cors)
        const canvas = await html2canvas(ticket, { scale: 2, useCORS: true });
        const link = document.createElement('a');
        link.download = `Ticket_${name}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        alert("สำเร็จ! ส่งข้อมูลเรียบร้อยและบันทึกบัตรเชิญแล้ว");
        location.reload();

    } catch (err) {
        console.error(err);
        alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
        downloadBtn.innerText = "SAVE TICKET & SEND INFO";
        downloadBtn.disabled = false;
    }
});