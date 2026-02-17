// ========================================
// 学校だより管理
// ========================================

let currentEditId = null;
let currentPDFData = null;

document.addEventListener('DOMContentLoaded', function() {
    loadNewsletters();
    setupForm();
});

/**
 * 学校だより用PDFピッカーを開く
 */
function openNewsletterPDFPicker() {
    showPDFPickerModal(function(pdfData) {
        currentPDFData = pdfData;
        
        // PDFデータがBase64形式の場合
        if (pdfData.pdf_data) {
            document.getElementById('file_url').value = pdfData.pdf_data;
            document.getElementById('file_name').value = pdfData.file_name;
            document.getElementById('pdf_id').value = pdfData.id;
        }
        
        showNotification('PDFを選択しました', 'success');
    });
}

window.openNewsletterPDFPicker = openNewsletterPDFPicker;

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

async function loadNewsletters() {
    const tbody = document.getElementById('newslettersTableBody');
    
    try {
        const response = await fetch('/api/tables/newsletters?sort=-issue_date');
        const result = await response.json();
        const newsletters = result.data || [];
        
        if (newsletters.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">まだ学校だよりがありません</td></tr>';
            return;
        }
        
        tbody.innerHTML = newsletters.map(newsletter => `
            <tr>
                <td>${escapeHtml(newsletter.title)}</td>
                <td>第${newsletter.issue_number}号</td>
                <td>${formatDate(newsletter.issue_date)}</td>
                <td>${escapeHtml(newsletter.file_name)}</td>
                <td class="table-actions">
                    <button class="btn-edit" onclick="editNewsletter('${newsletter.id}')"><i class="fas fa-edit"></i> 編集</button>
                    <button class="btn-delete" onclick="deleteNewsletter('${newsletter.id}')"><i class="fas fa-trash"></i> 削除</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading newsletters:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
    }
}

function setupForm() {
    const form = document.getElementById('newsletterFormElement');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // PDFが選択されているか確認
        const fileUrl = document.getElementById('file_url').value;
        if (!fileUrl) {
            alert('PDFファイルを選択してください');
            return;
        }
        
        const formData = {
            title: document.getElementById('title').value,
            issue_number: parseInt(document.getElementById('issue_number').value),
            issue_date: new Date(document.getElementById('issue_date').value).toISOString(),
            file_url: fileUrl,
            file_name: document.getElementById('file_name').value,
            pdf_id: document.getElementById('pdf_id').value || null,
            description: document.getElementById('description').value
        };
        
        try {
            let response;
            
            if (currentEditId) {
                response = await fetch(`tables/newsletters/${currentEditId}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/tables/newsletters', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(formData)
                });
            }
            
            if (response.ok) {
                alert(currentEditId ? '学校だよりを更新しました' : '学校だよりを追加しました');
                hideNewsletterForm();
                loadNewsletters();
            } else {
                throw new Error('保存に失敗しました');
            }
        } catch (error) {
            console.error('Error saving newsletter:', error);
            alert('保存に失敗しました。もう一度お試しください。');
        }
    });
}

function showNewsletterForm() {
    currentEditId = null;
    currentPDFData = null;
    document.getElementById('formTitle').textContent = '新規追加';
    document.getElementById('newsletterFormElement').reset();
    document.getElementById('file_url').value = '';
    document.getElementById('file_name').value = '';
    document.getElementById('pdf_id').value = '';
    document.getElementById('newsletterForm').style.display = 'flex';
}

function hideNewsletterForm() {
    document.getElementById('newsletterForm').style.display = 'none';
    currentEditId = null;
}

async function editNewsletter(id) {
    try {
        const response = await fetch(`tables/newsletters/${id}`);
        const newsletter = await response.json();
        
        currentEditId = id;
        currentPDFData = null;
        document.getElementById('formTitle').textContent = '学校だよりを編集';
        
        document.getElementById('title').value = newsletter.title;
        document.getElementById('issue_number').value = newsletter.issue_number;
        document.getElementById('issue_date').value = new Date(newsletter.issue_date).toISOString().slice(0, 10);
        
        // PDFの情報を表示用に設定（実際のBase64データは表示しない）
        if (newsletter.file_url) {
            if (newsletter.file_url.startsWith('data:application/pdf')) {
                document.getElementById('file_url').value = newsletter.file_name + ' (アップロード済み)';
            } else {
                document.getElementById('file_url').value = newsletter.file_url;
            }
        }
        
        document.getElementById('file_name').value = newsletter.file_name;
        document.getElementById('pdf_id').value = newsletter.pdf_id || '';
        document.getElementById('description').value = newsletter.description || '';
        
        document.getElementById('newsletterForm').style.display = 'flex';
    } catch (error) {
        console.error('Error loading newsletter:', error);
        alert('学校だよりの読み込みに失敗しました');
    }
}

async function deleteNewsletter(id) {
    if (!confirm('本当にこの学校だよりを削除しますか?')) return;
    
    try {
        const response = await fetch(`tables/newsletters/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            alert('学校だよりを削除しました');
            loadNewsletters();
        } else {
            throw new Error('削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting newsletter:', error);
        alert('削除に失敗しました');
    }
}

window.showNewsletterForm = showNewsletterForm;
window.hideNewsletterForm = hideNewsletterForm;
window.editNewsletter = editNewsletter;
window.deleteNewsletter = deleteNewsletter;

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