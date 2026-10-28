const frameImage = new Image();
frameImage.src = "./assets/profile-frame.png";

const canvas = document.getElementById("profileCanvas");
const ctx = canvas.getContext("2d");
const form = document.getElementById("profileForm");
const photoInput = document.getElementById("photoInput");
const nameInput = document.getElementById("personName");
const institutionInput = document.getElementById("institutionName");
const addressInput = document.getElementById("address");

// [LINK-১] Google Apps Script Web App URL — একই URL Google Apps Script deploy থেকে নিতে হবে।
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzfLbWDj3_4oK-UFSspcMZYR2qJHejF6NOE23TCoZ11VERnSSGiEEckNDUvv0IEXNQB/exec";

const statusMessage = document.getElementById("statusMessage");
const emptyState = document.getElementById("emptyState");
const downloadButton = document.getElementById("downloadButton");
const resetButton = document.getElementById("resetButton");
const zoomRange = document.getElementById("zoomRange");
const canvasWrap = document.querySelector(".canvas-wrap");
const adjustButtons = ["moveUp", "moveDown", "moveLeft", "moveRight", "autoFit"];

let uploadedPhoto = null;
let photoReady = false;
let profileCreated = false;
let zoom = 1;
let offsetX = 0;
let offsetY = 0;
let dragging = false;
let lastPointer = null;
let pendingUploadNonce = null;
let uploadTimeout = null;

const SIZE = 1200;
const FACE_TARGET = { x: 600, y: 445, width: 300 };

function setStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b42318" : "var(--green)";
}

function setControlsEnabled(enabled) {
  zoomRange.disabled = !enabled;
  adjustButtons.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = !enabled;
  });
  canvasWrap.classList.toggle("drag-ready", enabled);
}

function drawPhoto() {
  if (!uploadedPhoto || !photoReady) return;
  const image = uploadedPhoto;
  const baseScale = Math.max(SIZE / image.width, SIZE / image.height);
  const scale = baseScale * zoom;
  const width = image.width * scale;
  const height = image.height * scale;
  const x = (SIZE - width) / 2 + offsetX;
  const y = (SIZE - height) / 2 + offsetY;

  ctx.save();
  ctx.beginPath();
  ctx.arc(600, 600, 425, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

function renderPreview() {
  ctx.clearRect(0, 0, SIZE, SIZE);
  drawPhoto();
  if (frameImage.complete && frameImage.naturalWidth) {
    ctx.drawImage(frameImage, 0, 0, SIZE, SIZE);
  }
  const ready = Boolean(uploadedPhoto && photoReady && frameImage.complete && frameImage.naturalWidth);
  emptyState.hidden = ready;
  downloadButton.disabled = !ready;
  setControlsEnabled(Boolean(uploadedPhoto && photoReady));
}

function setZoom(value) {
  zoom = Math.min(2.5, Math.max(0.7, Number(value)));
  zoomRange.value = String(zoom);
  renderPreview();
}

async function detectFaceAndAlign(image) {
  setStatus("ছবি বিশ্লেষণ করে মুখের অবস্থান ঠিক করা হচ্ছে…");
  try {
    const vision = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/+esm");
    const files = await vision.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    const detector = await vision.FaceDetector.createFromOptions(files, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
        delegate: "CPU"
      },
      runningMode: "IMAGE",
      minDetectionConfidence: 0.45
    });
    const result = detector.detect(image);
    detector.close();

    const face = result.detections && result.detections[0];
    if (face && face.boundingBox) {
      const box = face.boundingBox;
      const faceWidth = box.width;
      const faceCenterX = box.originX + box.width / 2;
      const faceCenterY = box.originY + box.height / 2;
      const desiredFaceWidth = image.width * 0.25;
      zoom = Math.max(0.7, Math.min(2.5, desiredFaceWidth / faceWidth));

      const scale = Math.max(SIZE / image.width, SIZE / image.height) * zoom;
      const renderedW = image.width * scale;
      const renderedH = image.height * scale;
      offsetX = FACE_TARGET.x - (faceCenterX * scale + (SIZE - renderedW) / 2);
      offsetY = FACE_TARGET.y - (faceCenterY * scale + (SIZE - renderedH) / 2);
      offsetX = Math.max(-SIZE * 0.45, Math.min(SIZE * 0.45, offsetX));
      offsetY = Math.max(-SIZE * 0.45, Math.min(SIZE * 0.45, offsetY));
      zoomRange.value = String(zoom);
      setStatus("মুখ শনাক্ত হয়েছে। প্রিভিউ দেখে প্রয়োজনে জুম বা অবস্থান ঠিক করুন।");
    } else {
      autoFit();
      setStatus("মুখ স্পষ্টভাবে শনাক্ত হয়নি। ছবিটি অটো-ফিট করা হয়েছে; প্রয়োজনে নিজে ঠিক করুন।");
    }
  } catch (error) {
    autoFit();
    setStatus("স্বয়ংক্রিয় মুখ শনাক্তকরণ লোড হয়নি। সাধারণ অটো-ফিট করা হয়েছে।");
  }
  renderPreview();
}

function autoFit() {
  zoom = 1;
  offsetX = 0;
  offsetY = 0;
  zoomRange.value = "1";
  renderPreview();
}

frameImage.addEventListener("load", renderPreview);
frameImage.addEventListener("error", () => {
  setStatus("ফ্রেম ফাইল লোড হয়নি। assets/profile-frame.png ফাইলটি আছে কি না দেখুন।", true);
});

photoInput.addEventListener("change", () => {
  const file = photoInput.files && photoInput.files[0];
  if (!file) {
    uploadedPhoto = null;
    photoReady = false;
    renderPreview();
    return;
  }
  if (!file.type.startsWith("image/")) {
    setStatus("অনুগ্রহ করে একটি ছবি ফাইল নির্বাচন করুন।", true);
    photoInput.value = "";
    return;
  }
  if (file.size > 12 * 1024 * 1024) {
    setStatus("ছবিটি ১২ MB-এর চেয়ে বড়। ছোট ছবি নির্বাচন করুন।", true);
    photoInput.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = async () => {
      uploadedPhoto = image;
      photoReady = true;
      zoom = 1;
      offsetX = 0;
      offsetY = 0;
      renderPreview();
      await detectFaceAndAlign(image);
    };
    image.onerror = () => setStatus("ছবিটি খোলা যায়নি। অন্য একটি ছবি চেষ্টা করুন।", true);
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
});

zoomRange.addEventListener("input", () => setZoom(zoomRange.value));
document.getElementById("moveUp").addEventListener("click", () => { offsetY -= 25; renderPreview(); });
document.getElementById("moveDown").addEventListener("click", () => { offsetY += 25; renderPreview(); });
document.getElementById("moveLeft").addEventListener("click", () => { offsetX -= 25; renderPreview(); });
document.getElementById("moveRight").addEventListener("click", () => { offsetX += 25; renderPreview(); });
document.getElementById("autoFit").addEventListener("click", () => {
  if (uploadedPhoto) detectFaceAndAlign(uploadedPhoto);
});

canvasWrap.addEventListener("pointerdown", event => {
  if (!uploadedPhoto || !photoReady) return;
  dragging = true;
  lastPointer = { x: event.clientX, y: event.clientY };
  canvasWrap.setPointerCapture(event.pointerId);
  event.preventDefault();
});
canvasWrap.addEventListener("pointermove", event => {
  if (!dragging || !lastPointer) return;
  const rect = canvasWrap.getBoundingClientRect();
  offsetX += (event.clientX - lastPointer.x) * SIZE / rect.width;
  offsetY += (event.clientY - lastPointer.y) * SIZE / rect.height;
  lastPointer = { x: event.clientX, y: event.clientY };
  renderPreview();
});
function stopDragging() { dragging = false; lastPointer = null; }
canvasWrap.addEventListener("pointerup", stopDragging);
canvasWrap.addEventListener("pointercancel", stopDragging);

// তথ্য Google Sheet-এ পাঠায়। no-cors-এ response পড়া যায় না; তাই এটি সার্ভার-সাইড নিশ্চিতকরণ নয়।
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  if (!uploadedPhoto || !photoReady) {
    setStatus("আগে আপনার ছবি আপলোড করুন।", true);
    return;
  }

  profileCreated = true;
  renderPreview();
  setStatus("প্রোফাইল পিক তৈরি হয়েছে। তথ্য পাঠানো হচ্ছে…");

  const formData = new URLSearchParams();
  formData.set("personName", nameInput.value.trim());
  formData.set("institutionName", institutionInput.value.trim());
  formData.set("address", addressInput.value.trim());
  formData.set("submittedAt", new Date().toLocaleString("bn-BD", { timeZone: "Asia/Dhaka" }));

  try {
    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: formData.toString()
    });
    setStatus("তথ্য পাঠানোর অনুরোধ করা হয়েছে। ছবি ডাউনলোড করতে পারবেন।");
  } catch (error) {
    setStatus("ছবি তৈরি হয়েছে, কিন্তু তথ্য পাঠানো যায়নি। ইন্টারনেট ও Apps Script URL পরীক্ষা করুন।", true);
  }
});

downloadButton.addEventListener("click", async () => {
  if (!profileCreated || !uploadedPhoto || !photoReady) {
    setStatus("আগে প্রোফাইল পিক তৈরি করুন।", true);
    return;
  }

  renderPreview();

  try {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob(result => result ? resolve(result) : reject(new Error("PNG তৈরি হয়নি")), "image/png");
    });

    const safeName = (nameInput.value.trim() || "profile-pic")
      .replace(/[^\p{L}\p{N}_-]+/gu, "-")
      .slice(0, 50);
    const fileName = `${safeName}-profile.png`;
    const file = new File([blob], fileName, { type: "image/png" });
    const ua = navigator.userAgent || "";
    const isFacebook = /FBAN|FBAV|FB_IAB|Instagram/i.test(ua);

    // Google Drive-এ অস্থায়ী কপি আপলোডের চেষ্টা; স্বাভাবিক ডাউনলোডও আলাদাভাবে চলবে।
    uploadTemporaryProfileImage(`${safeName}-gawhar-madrasa-profile.png`);

    if (isFacebook && navigator.canShare && navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "প্রোফাইল ছবি", text: "তৈরি করা প্রোফাইল ছবি" });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);

    if (isFacebook) {
      setStatus("ডাউনলোড না হলে একটু অপেক্ষা করে Google Drive লিংক ব্যবহার করুন।");
      showDownloadFallback(blob, fileName);
    } else {
      setStatus("ডাউনলোডের অনুরোধ পাঠানো হয়েছে।");
    }
  } catch (error) {
    console.error(error);
    setStatus("ছবি তৈরি বা ডাউনলোড করা যায়নি।", true);
  }
});

function showDownloadFallback(blob, fileName) {
  let box = document.getElementById("downloadFallback");
  if (!box) {
    box = document.createElement("div");
    box.id = "downloadFallback";
    box.style.cssText = "margin:16px 0;padding:16px;border:1px solid #ddd;border-radius:12px;text-align:center;";
    downloadButton.insertAdjacentElement("afterend", box);
  }
  const url = URL.createObjectURL(blob);
  box.replaceChildren();

  const message = document.createElement("p");
  message.textContent = "Facebook-এ ডাউনলোড কাজ না করলে ছবিটি খুলে সেভ করার চেষ্টা করুন।";

  const openLink = document.createElement("a");
  openLink.href = url;
  openLink.target = "_blank";
  openLink.rel = "noopener";
  openLink.textContent = "ছবি খুলুন / সেভ করুন";
  openLink.download = fileName;
  openLink.style.cssText = "display:inline-block;padding:12px 18px;background:#1877f2;color:white;border-radius:8px;text-decoration:none;";
  box.append(message, openLink);
}

// Upload iframe থেকে Apps Script-এর HTML response এলে nonce মিলিয়ে লিংক দেখায়।
window.addEventListener("message", event => {
  const data = event.data;
  if (!data || data.type !== "temporary-profile-image-result") return;
  if (!pendingUploadNonce || data.nonce !== pendingUploadNonce) return;

  pendingUploadNonce = null;
  if (uploadTimeout) clearTimeout(uploadTimeout);

  const frame = document.getElementById("temporaryImageUploadFrame");
  const formEl = document.getElementById("temporaryImageUploadForm");
  if (frame) frame.remove();
  if (formEl) formEl.remove();

  if (!data.ok || !data.downloadUrl) {
    setStatus("Google Drive-এ অস্থায়ী ছবি আপলোড হয়নি। ছোট PNG দিয়ে আবার চেষ্টা করুন।", true);
    return;
  }

  let box = document.getElementById("driveDownloadFallback");
  if (!box) {
    box = document.createElement("div");
    box.id = "driveDownloadFallback";
    box.style.cssText = "margin:16px 0;padding:16px;border:1px solid #ddd;border-radius:12px;text-align:center;";
    downloadButton.insertAdjacentElement("afterend", box);
  }
  box.replaceChildren();

  const message = document.createElement("p");
  message.textContent = "Facebook-এ ডাউনলোড কাজ না করলে এই Google Drive লিংকটি খুলুন। (ফাইলটি প্রায় এক ঘণ্টা অস্থায়ীভাবে রাখা হবে।)";
  const link = document.createElement("a");
  link.href = data.downloadUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Google Drive থেকে ছবি খুলুন / ডাউনলোড করুন";
  link.style.cssText = "display:inline-block;padding:12px 18px;background:#1877f2;color:white;border-radius:8px;text-decoration:none;";
  box.append(message, link);
});

function uploadTemporaryProfileImage(fileName) {
  if (!GOOGLE_SCRIPT_URL.startsWith("https://script.google.com/macros/s/")) {
    setStatus("Google Apps Script URL ঠিক নেই।", true);
    return;
  }

  let imageData;
  try {
    imageData = canvas.toDataURL("image/png");
  } catch (error) {
    setStatus("ছবির ডেটা তৈরি করা যায়নি।", true);
    return;
  }

  // বড় Base64 payload হলে Apps Script অনুরোধ ব্যর্থ হতে পারে।
  if (imageData.length > 8_000_000) {
    setStatus("PNG ফাইলটি অনেক বড়। ছবি ছোট করে আবার চেষ্টা করুন।", true);
    return;
  }

  const nonce = (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  pendingUploadNonce = nonce;

  const iframe = document.createElement("iframe");
  iframe.name = "imageUploadFrame";
  iframe.id = "temporaryImageUploadFrame";
  iframe.hidden = true;

  const uploadForm = document.createElement("form");
  uploadForm.id = "temporaryImageUploadForm";
  uploadForm.method = "POST";
  uploadForm.action = GOOGLE_SCRIPT_URL;
  uploadForm.target = iframe.name;
  uploadForm.hidden = true;

  const fields = { action: "uploadImage", fileName, imageData, nonce };
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    uploadForm.appendChild(input);
  });

  document.body.append(iframe, uploadForm);
  uploadForm.submit();

  if (uploadTimeout) clearTimeout(uploadTimeout);
  uploadTimeout = setTimeout(() => {
    if (pendingUploadNonce !== nonce) return;
    pendingUploadNonce = null;
    iframe.remove();
    uploadForm.remove();
    setStatus("Drive আপলোডের উত্তর আসেনি। Apps Script deploy ও অনুমতি পরীক্ষা করুন।", true);
  }, 120000);
}

resetButton.addEventListener("click", () => {
  form.reset();
  uploadedPhoto = null;
  photoReady = false;
  profileCreated = false;
  zoom = 1;
  offsetX = 0;
  offsetY = 0;
  pendingUploadNonce = null;
  const fallback = document.getElementById("downloadFallback");
  const driveFallback = document.getElementById("driveDownloadFallback");
  if (fallback) fallback.remove();
  if (driveFallback) driveFallback.remove();
  setStatus("");
  renderPreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

renderPreview();
