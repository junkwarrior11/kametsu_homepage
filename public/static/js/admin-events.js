// ========================================
// 行事予定管理
// ========================================

let currentEditId = null;

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    setupForm();
    loadCurrentPDF();
});

async function loadEvents() {
    const tbody = document.getElementById('eventsTableBody');
    
    try {
        const response = await fetch('/api/tables/events?sort=event_date');
        const result = await response.json();
        const events = result.data || [];
        
        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #9ca3af;">まだ行事予定がありません</td></tr>';
            return;
        }
        
        tbody.innerHTML = events.map(event => `
            <tr>
                <td>${escapeHtml(event.title)}</td>
                <td>${formatDate(event.event_date)}</td>
                <td><span class="status-badge published">${escapeHtml(event.category)}</span></td>
                <td>${escapeHtml(event.location)}</td>
                <td>${escapeHtml(event.target_grade)}</td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="editEvent('${event.id}')"><i class="fas fa-edit"></i> 編集</button>
                    <button class="btn-delete" onclick="deleteEvent('${event.id}')"><i class="fas fa-trash"></i> 削除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
    }
}

function setupForm() {
    const form = document.getElementById('eventFormElement');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('title').value,
            event_date: new Date(document.getElementById('event_date').value).toISOString(),
            category: document.getElementById('category').value,
            location: document.getElementById('location').value,
            target_grade: document.getElementById('target_grade').value,
            description: document.getElementById('description').value
        };
        
        try {
            let response;
            
            if (currentEditId) {
                response = await fetch(`tables/events/${currentEditId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/tables/events', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.ok) {
                alert(currentEditId ? '行事予定を更新しました' : '行事予定を追加しました');
                hideEventForm();
                loadEvents();
            } else {
                throw new Error('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            alert('保存に失敗しました。もう一度お試しください。');
        }
    });
}

function showEventForm() {
    currentEditId = null;
    document.getElementById('formTitle').textContent = '新規追加';
    document.getElementById('eventFormElement').reset();
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('event_date').value = now.toISOString().slice(0, 16);
    
    document.getElementById('eventForm').style.display = 'flex';
}

function hideEventForm() {
    document.getElementById('eventForm').style.display = 'none';
    currentEditId = null;
}

async function editEvent(id) {
    try {
        const response = await fetch(`tables/events/${id}`);
        const event = await response.json();
        
        currentEditId = id;
        document.getElementById('formTitle').textContent = '行事予定を編集';
        
        document.getElementById('title').value = event.title;
        
        const date = new Date(event.event_date);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        document.getElementById('event_date').value = date.toISOString().slice(0, 16);
        
        document.getElementById('category').value = event.category;
        document.getElementById('location').value = event.location;
        document.getElementById('target_grade').value = event.target_grade;
        document.getElementById('description').value = event.description || '';
        
        document.getElementById('eventForm').style.display = 'flex';
    } catch (error) {
        console.error('Error loading event:', error);
        alert('行事予定の読み込みに失敗しました');
    }
}

async function deleteEvent(id) {
    if (!confirm('本当にこの行事予定を削除しますか?')) return;
    
    try {
        const response = await fetch(`tables/events/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert('行事予定を削除しました');
            loadEvents();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('削除に失敗しました');
    }
}

// ========================================
// PDF管理機能
// ========================================

let currentPDFId = null;

/**
 * 現在のPDFを読み込んで表示
 */
async function loadCurrentPDF() {
    const display = document.getElementById('currentPDFDisplay');
    
    try {
        const response = await fetch('/api/tables/uploaded_pdfs?limit=1&sort=-created_at');
        const result = await response.json();
        const pdfs = result.data || [];
        
        if (pdfs.length > 0) {
            const pdf = pdfs[0];
            currentPDFId = pdf.id;
            displayPDF(pdf);
        } else {
            display.innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
        }
    } catch (error) {
        console.error('Error loading PDF:', error);
        display.innerHTML = '<p style="color: #f44336;">PDFの読み込みに失敗しました</p>';
    }
}

/**
 * PDFを表示
 */
function displayPDF(pdf) {
    const display = document.getElementById('currentPDFDisplay');
    display.innerHTML = `
        <div class="pdf-viewer-container">
            <div class="pdf-viewer-header">
                <div class="pdf-viewer-title">
                    <i class="fas fa-file-pdf"></i>
                    <span>${escapeHtml(pdf.description)}</span>
                    <small style="color: #999; margin-left: 8px;">(${pdf.year}年度${pdf.month ? ' ' + pdf.month + '月' : ''})</small>
                </div>
                <div class="pdf-viewer-actions">
                    <button onclick="downloadPDF('${pdf.id}')" class="btn-download">
                        <i class="fas fa-download"></i> ダウンロード
                    </button>
                    <button onclick="changePDF()" style="background: #FF9800; border-color: #FF9800; color: white;">
                        <i class="fas fa-exchange-alt"></i> 変更
                    </button>
                    <button onclick="removePDF('${pdf.id}')" class="btn-remove">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
            <iframe class="pdf-viewer-iframe" src="${pdf.pdf_data}"></iframe>
        </div>
    `;
}

/**
 * PDFピッカーを開く
 */
function openEventsPDFPicker() {
    showPDFPickerModal(function(pdf) {
        currentPDFId = pdf.id;
        displayPDF(pdf);
        showNotification('PDFをアップロードしました', 'success');
    });
}

/**
 * PDFを変更
 */
function changePDF() {
    openEventsPDFPicker();
}

/**
 * PDFをダウンロード
 */
async function downloadPDF(pdfId) {
    try {
        const response = await fetch(`tables/uploaded_pdfs/${pdfId}`);
        const pdf = await response.json();
        
        // Base64データからBlobを作成
        const byteCharacters = atob(pdf.pdf_data.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // ダウンロード
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = pdf.file_name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showNotification('PDFをダウンロードしました', 'success');
    } catch (error) {
        console.error('Error downloading PDF:', error);
        showNotification('ダウンロードに失敗しました', 'error');
    }
}

/**
 * PDFを削除
 */
async function removePDF(pdfId) {
    if (!confirm('本当にこのPDFを削除しますか？')) return;
    
    try {
        await deletePDF(pdfId);
        currentPDFId = null;
        document.getElementById('currentPDFDisplay').innerHTML = '<p style="color: #999; margin: 0;">PDFがアップロードされていません</p>';
        showNotification('PDFを削除しました', 'success');
    } catch (error) {
        console.error('Error removing PDF:', error);
        showNotification('削除に失敗しました', 'error');
    }
}

window.showEventForm = showEventForm;
window.hideEventForm = hideEventForm;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent;
window.openEventsPDFPicker = openEventsPDFPicker;
window.changePDF = changePDF;
window.downloadPDF = downloadPDF;
window.removePDF = removePDF;

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 通知を表示
 */
function showNotification(message, type = 'success') {
    // 既存の通知があれば削除
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // アニメーション
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒後に非表示
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}