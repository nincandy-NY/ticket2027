const nameInput = document.getElementById('userName');
const displayName = document.getElementById('display-name');
const slipUpload = document.getElementById('slipUpload');
const slipPreview = document.getElementById('slip-preview');
const downloadBtn = document.getElementById('download-btn');
const ticket = document.getElementById('ticket');

nameInput.addEventListener('input', (e) => {
    displayName.innerText = e.target.value.toUpperCase() || "YOUR NAME";
});

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

    downloadBtn.innerText = "กำลังส่งข้อมูล...";
    downloadBtn.disabled = true;

    try {
        const { db, storage, tools } = window.fb;
        
        // 1. Upload Slip to Storage
        const storageRef = tools.ref(storage, `slips/${Date.now()}_${name}`);
        const snapshot = await tools.uploadBytes(storageRef, file);
        const url = await tools.getDownloadURL(snapshot.ref);

        // 2. Save Data to Firestore
        await tools.addDoc(tools.collection(db, "registrations"), {
            guestName: name,
            slipUrl: url,
            timestamp: new Date()
        });

        // 3. Save Image for User
        html2canvas(ticket, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `Ticket_${name}.png`;
            link.href = canvas.toDataURL();
            link.click();
            alert("บันทึกสำเร็จ! ข้อมูลถูกส่งไปที่หลังบ้านแล้ว");
        });

    } catch (err) {
        alert("เกิดข้อผิดพลาด: " + err.message);
    } finally {
        downloadBtn.innerText = "SAVE TICKET & SEND INFO";
        downloadBtn.disabled = false;
    }
});