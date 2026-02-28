const nameInput = document.getElementById('userName');
const displayName = document.getElementById('display-name');
const slipUpload = document.getElementById('slipUpload');
const slipPreview = document.getElementById('slip-preview');
const downloadBtn = document.getElementById('download-btn');
const ticket = document.getElementById('ticket');

nameInput.addEventListener('input', (e) => {
    displayName.innerText = e.target.value.toUpperCase() || "YOUR NAME";
});

// ฟังก์ชันบีบอัดรูปภาพก่อนอัปโหลด เพื่อแก้ปัญหาอัปโหลดช้า
async function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; // ปรับความกว้างเหลือ 800px
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7); // บีบอัดคุณภาพ 70%
            };
        };
    });
}

slipUpload.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            slipPreview.innerHTML = `<img src="${e.target.result}" style="width:100%; height:100%; object-fit:contain;">`;
        }
        reader.readAsDataURL(file);
    }
});

downloadBtn.addEventListener('click', async () => {
    const name = nameInput.value;
    const file = slipUpload.files[0];

    if(!name || !file) {
        alert("กรุณากรอกชื่อและแนบสลิปด้วยครับ");
        return;
    }

    downloadBtn.innerText = "กำลังอัปโหลด (บีบอัดรูปภาพ)...";
    downloadBtn.disabled = true;

    try {
        const { db, storage, tools } = window.fbUpload;
        
        // บีบอัดไฟล์ก่อนส่ง
        const compressedFile = await compressImage(file);
        
        // 1. Upload ไปยัง Firebase Storage
        const storageRef = tools.ref(storage, `slips/${Date.now()}_${name}.jpg`);
        const snapshot = await tools.uploadBytes(storageRef, compressedFile);
        const url = await tools.getDownloadURL(snapshot.ref);

        // 2. บันทึกข้อมูลลง Firestore
        await tools.addDoc(tools.collection(db, "registrations"), {
            guestName: name,
            slipUrl: url,
            timestamp: new Date()
        });

        // 3. บันทึกภาพบัตรลงเครื่อง
        html2canvas(ticket, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Ticket_${name}.png`;
            link.href = canvas.toDataURL();
            link.click();
            alert("สำเร็จ! ข้อมูลถูกส่งไปที่หลังบ้านแล้ว");
        });

    } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
        downloadBtn.innerText = "SAVE TICKET & SEND INFO";
        downloadBtn.disabled = false;
    }
});