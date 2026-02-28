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
downloadBtn.addEventListener('click', async () => {
    const name = nameInput.value;
    const file = slipUpload.files[0];

    if(name === "" || !file) {
        alert("กรุณาใส่ชื่อและอัปโหลดสลิปก่อนครับ");
        return;
    }

    // แสดง Loading หรือปิดปุ่มเพื่อกันกดซ้ำ
    downloadBtn.innerText = "กำลังบันทึกข้อมูล...";
    downloadBtn.disabled = true;

    try {
        const { addDoc, collection, ref, uploadBytes, getDownloadURL } = window.fbUpload;
        
        // 1. อัปโหลดรูปลง Storage
        const storageRef = ref(window.firebaseStorage, `slips/${Date.now()}_${name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 2. บันทึกลง Firestore
        await addDoc(collection(window.firebaseDB, "registrations"), {
            guestName: name,
            slipUrl: downloadURL,
            timestamp: new Date()
        });

        alert("บันทึกข้อมูลเรียบร้อยแล้ว! เจอกันวันงานครับ");
        
        // ส่วนเดิมของคุณ: html2canvas
        html2canvas(ticket, { scale: 2 }).then(canvas => {
            const link = document.createElement('a');
            link.download = `HPNY2027_${name}.png`;
            link.href = canvas.toDataURL();
            link.click();
        });

    } catch (e) {
        console.error(e);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
        downloadBtn.innerText = "SAVE TICKET (PNG)";
        downloadBtn.disabled = false;
    }
});
