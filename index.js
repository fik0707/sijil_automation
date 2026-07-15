// State variables
let currentStep = 1;
const totalSteps = 9;

// Default configurations
const config = {
  folderUrl: '',
  folderId: '1VzzO0tZTo2IiUs2G7HwB9NymyKUGvcyU',
  templateUrl: '',
  templateId: '106hwURlBwJAniUGcmKL5HyCxhlDBluTZ-1u7M9owLHc',
  placeholder: '<<FULL NAME>>',
  colName: 3,
  colEmail: 2,
  certPrefix: 'Sijil Bengkel Penulisan Minit Mesyuarat ',
  emailSubject: 'Sijil Penyertaan Bengkel Penulisan Minit Mesyuarat 2026',
  emailBody: 'Assalamualaikum dan Salam Sejahtera,\n\nTuan/Puan,\n\nBersama ini dilampirkan Sijil Penyertaan Bengkel Penulisan Minit Mesyuarat 2026 pada 2 Julai 2026.\n\nKerjasama dan penglibatan yang diberikan amatlah dihargai.\n\nSekian , terima kasih .',
  emailSignature: 'Unit Kualiti\nHospital Sultanah Bahiyah'
};

// Document elements
document.addEventListener('DOMContentLoaded', () => {
  // Initialize steps and code
  updateStepUI();
  updateScriptConfigs();

  // Load from localStorage if present
  loadCheckboxStates();
});

// Navigation logic
function navigateStep(direction) {
  // Save current checkboxes before leaving
  saveCheckboxStates();

  const targetStep = currentStep + direction;
  if (targetStep >= 1 && targetStep <= totalSteps) {
    currentStep = targetStep;
    updateStepUI();
  }
}

function jumpToStep(stepNum) {
  if (stepNum >= 1 && stepNum <= totalSteps) {
    currentStep = stepNum;
    updateStepUI();
  }
}

function updateStepUI() {
  // Update step views
  for (let i = 1; i <= totalSteps; i++) {
    const stepDiv = document.getElementById(`step${i}`);
    if (stepDiv) {
      if (i === currentStep) {
        stepDiv.classList.add('active');
      } else {
        stepDiv.classList.remove('active');
      }
    }
  }

  // Update step indicators
  const indicators = document.querySelectorAll('.step-indicator');
  indicators.forEach((indicator, index) => {
    const stepNum = index + 1;
    indicator.classList.remove('active', 'completed');
    
    if (stepNum === currentStep) {
      indicator.classList.add('active');
    } else if (stepNum < currentStep) {
      indicator.classList.add('completed');
    }
    
    // Add click handler to jump directly
    indicator.onclick = () => jumpToStep(stepNum);
  });

  // Update buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  if (prevBtn) prevBtn.disabled = currentStep === 1;
  
  if (nextBtn) {
    if (currentStep === totalSteps) {
      nextBtn.textContent = 'Finish Setup';
      nextBtn.onclick = () => {
        showToast('All steps completed successfully! Automation is live.', 'success');
      };
    } else {
      nextBtn.textContent = 'Next Step';
      nextBtn.onclick = () => navigateStep(1);
    }
  }

  // Update progress bar
  const progressBarFill = document.getElementById('progressBarFill');
  if (progressBarFill) {
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 90; // spans 90% space
    progressBarFill.style.width = `${progressPercent}%`;
  }
}

// Checkbox item interaction
function toggleCheckbox(element) {
  element.classList.toggle('checked');
  saveCheckboxStates();
}

function saveCheckboxStates() {
  const checkboxes = document.querySelectorAll('.checkbox-item');
  const states = [];
  checkboxes.forEach((item, index) => {
    states.push({
      index: index,
      checked: item.classList.contains('checked'),
      title: item.querySelector('.checkbox-title').textContent
    });
  });
  localStorage.setItem('cert_automation_checkboxes', JSON.stringify(states));
}

function loadCheckboxStates() {
  const statesStr = localStorage.getItem('cert_automation_checkboxes');
  if (statesStr) {
    try {
      const states = JSON.parse(statesStr);
      const checkboxes = document.querySelectorAll('.checkbox-item');
      states.forEach(state => {
        if (checkboxes[state.index]) {
          const item = checkboxes[state.index];
          const title = item.querySelector('.checkbox-title').textContent;
          // Verify matching title before applying
          if (title === state.title) {
            if (state.checked) {
              item.classList.add('checked');
            } else {
              item.classList.remove('checked');
            }
          }
        }
      });
    } catch (e) {
      console.error('Error parsing checkbox states', e);
    }
  }
}

// URL/ID extraction utility
function extractIdFromUrl(input, type) {
  if (!input) return '';
  input = input.trim();
  
  let match;
  if (type === 'presentation') {
    // Google Slides presentation ID matching
    const slidesRegex = /\/presentation\/d\/([a-zA-Z0-9-_]+)/;
    match = input.match(slidesRegex);
  } else if (type === 'folder') {
    // Google Drive folder ID matching
    const folderRegex = /\/folders\/([a-zA-Z0-9-_]+)/;
    match = input.match(folderRegex);
  }
  
  if (match && match[1]) {
    return match[1];
  }
  
  // If it's not a URL, check if it's already an ID format (typically 25+ chars, no slashes)
  if (input.length > 20 && !input.includes('/')) {
    return input;
  }
  
  return null;
}

// Config inputs parsing
function updateScriptConfigs() {
  const folderInput = document.getElementById('folderUrlInput');
  const templateInput = document.getElementById('templateUrlInput');
  const placeholderInput = document.getElementById('placeholderInput');
  const colNameInput = document.getElementById('colNameInput');
  const colEmailInput = document.getElementById('colEmailInput');
  const certPrefixInput = document.getElementById('certPrefixInput');
  const emailSubjectInput = document.getElementById('emailSubjectInput');
  const emailBodyInput = document.getElementById('emailBodyInput');
  const emailSignatureInput = document.getElementById('emailSignatureInput');

  // Update folder configs
  if (folderInput) {
    const val = folderInput.value;
    const extracted = extractIdFromUrl(val, 'folder');
    const successMsg = document.getElementById('folderSuccessMsg');
    const errorMsg = document.getElementById('folderErrorMsg');
    const folderLabel = document.getElementById('extractedFolderId');
    
    if (val === '') {
      successMsg.style.display = 'none';
      errorMsg.style.display = 'none';
    } else if (extracted) {
      config.folderId = extracted;
      successMsg.style.display = 'block';
      errorMsg.style.display = 'none';
      if (folderLabel) folderLabel.textContent = extracted;
    } else {
      successMsg.style.display = 'none';
      errorMsg.style.display = 'block';
    }
  }

  // Update slide configs
  if (templateInput) {
    const val = templateInput.value;
    const extracted = extractIdFromUrl(val, 'presentation');
    const successMsg = document.getElementById('templateSuccessMsg');
    const errorMsg = document.getElementById('templateErrorMsg');
    const templateLabel = document.getElementById('extractedTemplateId');
    
    if (val === '') {
      successMsg.style.display = 'none';
      errorMsg.style.display = 'none';
    } else if (extracted) {
      config.templateId = extracted;
      successMsg.style.display = 'block';
      errorMsg.style.display = 'none';
      if (templateLabel) templateLabel.textContent = extracted;
    } else {
      successMsg.style.display = 'none';
      errorMsg.style.display = 'block';
    }
  }

  // Update numerical/text values
  if (placeholderInput && placeholderInput.value) config.placeholder = placeholderInput.value;
  if (colNameInput && colNameInput.value) config.colName = parseInt(colNameInput.value) || 3;
  if (colEmailInput && colEmailInput.value) config.colEmail = parseInt(colEmailInput.value) || 2;
  if (certPrefixInput && certPrefixInput.value) config.certPrefix = certPrefixInput.value;
  if (emailSubjectInput && emailSubjectInput.value) config.emailSubject = emailSubjectInput.value;
  if (emailBodyInput && emailBodyInput.value) config.emailBody = emailBodyInput.value;
  if (emailSignatureInput && emailSignatureInput.value) config.emailSignature = emailSignatureInput.value;

  // Render the updated script
  renderCode();
}

// Generate Raw Script
function generateAppsScriptCode() {
  return `function sendCertificate(e) {
  // 1. ID fail dan folder yang diambil daripada pautan baru anda
  var templateId = "__BOX_TEMPLATE_ID__"; 
  var folderId = "__BOX_FOLDER_ID__";   
  
  // 2. TETAPAN KOLUM: Nama di kolum Nama Penuh, Emel di kolum Email
  var kolumNama = __BOX_COL_NAME__;  // Kolum Nama Penuh (Asal: 3)
  var kolumEmail = __BOX_COL_EMAIL__; // Kolum E-mel (Asal: 2)
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row;
  
  // Memeriksa sama ada skrip berjalan secara automatik (Form Submit) atau manual (Testing)
  if (e && e.range) {
    row = e.range.getRow();
  } else {
    row = sheet.getLastRow(); // Mengambil baris terakhir jika anda menekan butang 'Run' untuk ujian
    if (row < 2) {
      Logger.log("Ralat: Tiada data dalam Google Sheet untuk diuji. Sila isi satu baris data contoh dahulu.");
      return;
    }
  }
  
  // 3. Mengambil data Nama Penuh dan E-mel dari baris berkenaan
  var namaPenuh = sheet.getRange(row, kolumNama).getValue().toString().trim().toUpperCase(); // Ditukar kepada HURUF BESAR
  var emailPenerima = sheet.getRange(row, kolumEmail).getValue().toString().trim();
  
  // Jika e-mel kosong, hentikan proses
  if (!emailPenerima) {
    Logger.log("Ralat: Alamat e-mel kosong pada baris " + row);
    return;
  }
  
  try {
    // 4. Salin template slide sijil ke dalam folder Drive yang ditetapkan
    var templateFile = DriveApp.getFileById(templateId);
    var folder = DriveApp.getFolderById(folderId);
    var salinanFail = templateFile.makeCopy("__BOX_CERT_PREFIX__" + namaPenuh, folder);
    var salinanId = salinanFail.getId();
    
    // 5. Buka salinan slide dan gantikan placeholder dengan nama peserta
    var presentation = SlidesApp.openById(salinanId);
    var slides = presentation.getSlides();
    for (var i = 0; i < slides.length; i++) {
      slides[i].replaceAllText("__BOX_PLACEHOLDER__", namaPenuh); // DIBETULKAN: Penggunaan pembolehubah 'namaPenuh'
    }
    presentation.saveAndClose();
    
    // Beri masa 1 saat untuk sistem mengemas kini fail sebelum ditukar ke PDF
    Utilities.sleep(1000);
    
    // 6. Tukar format slide kepada PDF
    var pdfBlob = salinanFail.getAs(MimeType.PDF);
    pdfBlob.setName("Sijil_" + namaPenuh + ".pdf");
    
    // 7. Tetapkan kandungan e-mel dan hantar bersama lampiran PDF
    var subjek = "__BOX_EMAIL_SUBJECT__";
    
    var mesej = \`__BOX_EMAIL_BODY____BOX_EMAIL_SIGNATURE__\`;
                
    MailApp.sendEmail({
      to: emailPenerima,
      subject: subjek,
      body: mesej,
      attachments: [pdfBlob]
    });
    
    Logger.log("Berjaya! Sijil telah dihantar kepada: " + namaPenuh + " (" + emailPenerima + ")");
    
  } catch (error) {
    Logger.log("Ralat berlaku: " + error.toString());
  }
}`;
}

// Custom Syntax Highlighting implementation with customized input highlighting boxes
function renderCode() {
  const codeBlock = document.getElementById('codeBlock');
  if (!codeBlock) return;

  const rawCode = generateAppsScriptCode();

  // Basic HTML escape for raw code
  let escapedCode = rawCode
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply general code highlighting replacements
  // 1. Comments
  escapedCode = escapedCode.replace(/(\/\/.*)/g, '<span class="token comment">$1</span>');
  
  // 2. Keywords
  const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'try', 'catch', 'return'];
  keywords.forEach(kw => {
    const reg = new RegExp(`\\b(${kw})\\b`, 'g');
    escapedCode = escapedCode.replace(reg, '<span class="token keyword">$1</span>');
  });

  // 3. String literals (excluding our marker tokens)
  // Double quotes
  escapedCode = escapedCode.replace(/(?<!__BOX_[A-Z_]+)("[^"]*")/g, '<span class="token string">$1</span>');
  // Backticks
  escapedCode = escapedCode.replace(/(`[^`]*`)/g, '<span class="token string">$1</span>');

  // 4. Numbers (excluding columns and markers)
  escapedCode = escapedCode.replace(/\b([0-9]+)\b(?![A-Z_]*__)/g, '<span class="token number">$1</span>');

  // Replace our configuration placeholders with highly noticeable interactive Highlight Boxes!
  escapedCode = escapedCode.replace(/__BOX_TEMPLATE_ID__/g, `<span class="token highlight-box" title="Extracted from Google Slides Template URL">${config.templateId}</span>`);
  escapedCode = escapedCode.replace(/__BOX_FOLDER_ID__/g, `<span class="token highlight-box" title="Extracted from Google Drive Certificate Folder URL">${config.folderId}</span>`);
  escapedCode = escapedCode.replace(/__BOX_COL_NAME__/g, `<span class="token highlight-box" title="Nama Penuh column index">${config.colName}</span>`);
  escapedCode = escapedCode.replace(/__BOX_COL_EMAIL__/g, `<span class="token highlight-box" title="Email column index">${config.colEmail}</span>`);
  escapedCode = escapedCode.replace(/__BOX_CERT_PREFIX__/g, `<span class="token highlight-box" title="Custom certificate PDF filename prefix">${config.certPrefix}</span>`);
  escapedCode = escapedCode.replace(/__BOX_PLACEHOLDER__/g, `<span class="token highlight-box" title="Placeholder replacement tag in Slides template">${config.placeholder}</span>`);
  escapedCode = escapedCode.replace(/__BOX_EMAIL_SUBJECT__/g, `<span class="token highlight-box" title="Customized Email Subject">${config.emailSubject}</span>`);
  
  // Format body and signature formatting with <br> for HTML preview
  const formattedBody = config.emailBody.split('\n').join('<br>');
  escapedCode = escapedCode.replace(/__BOX_EMAIL_BODY__/g, `<span class="token highlight-box" title="Customized Email Body Content"><br>${formattedBody}</span>`);

  const formattedSig = config.emailSignature.split('\n').join('<br>');
  escapedCode = escapedCode.replace(/__BOX_EMAIL_SIGNATURE__/g, `<span class="token highlight-box" title="Customized Email Signature block"><br><br>${formattedSig}</span>`);

  codeBlock.innerHTML = escapedCode;
}

// Copy Code Clipboard
function copyGeneratedCode() {
  // Generate code text without highlighted HTML wrappers
  const bodyText = config.emailBody.replace(/`/g, '\\`');
  const sigText = config.emailSignature.split('\n').map(line => `\n${line}`).join('');
  let cleanCode = `function sendCertificate(e) {
  // 1. ID fail dan folder yang diambil daripada pautan baru anda
  var templateId = "${config.templateId}"; 
  var folderId = "${config.folderId}";   
  
  // 2. TETAPAN KOLUM: Nama di kolum Nama Penuh, Emel di kolum Email
  var kolumNama = ${config.colName};  // Kolum Nama Penuh (Asal: 3)
  var kolumEmail = ${config.colEmail}; // Kolum E-mel (Asal: 2)
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var row;
  
  // Memeriksa sama ada skrip berjalan secara automatik (Form Submit) atau manual (Testing)
  if (e && e.range) {
    row = e.range.getRow();
  } else {
    row = sheet.getLastRow(); // Mengambil baris terakhir jika anda menekan butang 'Run' untuk ujian
    if (row < 2) {
      Logger.log("Ralat: Tiada data dalam Google Sheet untuk diuji. Sila isi satu baris data contoh dahulu.");
      return;
    }
  }
  
  // 3. Mengambil data Nama Penuh dan E-mel dari baris berkenaan
  var namaPenuh = sheet.getRange(row, kolumNama).getValue().toString().trim().toUpperCase(); // Ditukar kepada HURUF BESAR
  var emailPenerima = sheet.getRange(row, kolumEmail).getValue().toString().trim();
  
  // Jika e-mel kosong, hentikan proses
  if (!emailPenerima) {
    Logger.log("Ralat: Alamat e-mel kosong pada baris " + row);
    return;
  }
  
  try {
    // 4. Salin template slide sijil ke dalam folder Drive yang ditetapkan
    var templateFile = DriveApp.getFileById(templateId);
    var folder = DriveApp.getFolderById(folderId);
    var salinanFail = templateFile.makeCopy("${config.certPrefix}" + namaPenuh, folder);
    var salinanId = salinanFail.getId();
    
    // 5. Buka salinan slide dan gantikan placeholder dengan nama peserta
    var presentation = SlidesApp.openById(salinanId);
    var slides = presentation.getSlides();
    for (var i = 0; i < slides.length; i++) {
      slides[i].replaceAllText("${config.placeholder}", namaPenuh); // DIBETULKAN: Penggunaan pembolehubah 'namaPenuh'
    }
    presentation.saveAndClose();
    
    // Beri masa 1 saat untuk sistem mengemas kini fail sebelum ditukar ke PDF
    Utilities.sleep(1000);
    
    // 6. Tukar format slide kepada PDF
    var pdfBlob = salinanFail.getAs(MimeType.PDF);
    pdfBlob.setName("Sijil_" + namaPenuh + ".pdf");
    
    // 7. Tetapkan kandungan e-mel dan hantar bersama lampiran PDF
    var subjek = "${config.emailSubject}";
    
    var mesej = \`${bodyText}\n${sigText}\`;
                
    MailApp.sendEmail({
      to: emailPenerima,
      subject: subjek,
      body: mesej,
      attachments: [pdfBlob]
    });
    
    Logger.log("Berjaya! Sijil telah dihantar kepada: " + namaPenuh + " (" + emailPenerima + ")");
    
  } catch (error) {
    Logger.log("Ralat berlaku: " + error.toString());
  }
}`;

  navigator.clipboard.writeText(cleanCode).then(() => {
    const copyBtn = document.getElementById('copyCodeBtn');
    if (copyBtn) {
      const span = copyBtn.querySelector('span');
      const oldText = span.textContent;
      
      copyBtn.classList.add('copied');
      span.textContent = 'Copied!';
      
      showToast('Apps Script code copied to clipboard!', 'success');
      
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        span.textContent = oldText;
      }, 2000);
    }
  }).catch(err => {
    console.error('Could not copy text: ', err);
    showToast('Failed to copy code. Please select and copy manually.', 'error');
  });
}

// Toast notification handler
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (toast && toastMsg) {
    toastMsg.textContent = message;
    
    if (type === 'error') {
      toast.style.borderColor = 'var(--accent-pink)';
      toast.querySelector('span').textContent = '✗';
      toast.querySelector('span').style.color = 'var(--accent-pink)';
    } else {
      toast.style.borderColor = 'var(--accent-cyan)';
      toast.querySelector('span').textContent = '✓';
      toast.querySelector('span').style.color = 'var(--accent-success)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
}
