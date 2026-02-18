/**
 * 学校だより管理（統合版）
 * 新しいコアライブラリを使用
 * Version: 2.0.0
 * Created: 2026-02-18
 */

// コアライブラリをインポート
import { toast, loading, escapeHtml, formatDate, storage } from './core/admin-core.js';
import { api } from './core/api-client.js';

// ==============================================
// 1. 状態管理
// ==============================================

const state = {
  currentEditId: null,
  newsletters: []
};

// ==============================================
// 2. 学校だより一覧の読み込み
// ==============================================

async function loadNewsletters() {
  const tbody = document.getElementById('newslettersTableBody');
  
  try {
    const response = await api.newsletters.list({
      sort: '-issue_date',
      showLoading: true
    });
    
    state.newsletters = response.data || [];
    
    if (state.newsletters.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #9ca3af;">まだ学校だよりがありません</td></tr>';
      return;
    }
    
    tbody.innerHTML = state.newsletters.map(newsletter => `
      <tr data-id="${newsletter.id}">
        <td>${escapeHtml(newsletter.title)}</td>
        <td>${escapeHtml(newsletter.issue_number || '-')}</td>
        <td>${formatDate(newsletter.issue_date)}</td>
        <td><span class="status-badge ${newsletter.status === '公開' ? 'published' : 'draft'}">${escapeHtml(newsletter.status)}</span></td>
        <td class="table-actions-improved">
          <button class="action-btn action-btn-edit" onclick="window.editNewsletter('${newsletter.id}')">
            <i class="fas fa-edit"></i> 編集
          </button>
          <button class="action-btn action-btn-delete" onclick="window.deleteNewsletter('${newsletter.id}')">
            <i class="fas fa-trash"></i> 削除
          </button>
        </td>
      </tr>
    `).join('');
    
  } catch (error) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #ef4444;">読み込みに失敗しました</td></tr>';
  }
}

// ==============================================
// 3. フォーム処理
// ==============================================

function setupForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
      title: document.getElementById('newsletterTitle').value,
      issue_number: document.getElementById('issueNumber').value,
      issue_date: document.getElementById('issueDate').value,
      pdf_url: document.getElementById('pdfUrl').value,
      content: document.getElementById('newsletterContent').value,
      status: document.getElementById('newsletterStatus').value
    };
    
    try {
      if (state.currentEditId) {
        await api.newsletters.update(state.currentEditId, formData);
      } else {
        await api.newsletters.create(formData);
      }
      
      hideNewsletterForm();
      await loadNewsletters();
      storage.remove('newsletter_autosave');
      
    } catch (error) {
      // エラーはapi-client.jsで処理済み
    }
  });
}

// ==============================================
// 4. CRUD操作
// ==============================================

async function editNewsletter(id) {
  try {
    state.currentEditId = id;
    const newsletter = await api.newsletters.get(id);
    
    document.getElementById('newsletterTitle').value = newsletter.title || '';
    document.getElementById('issueNumber').value = newsletter.issue_number || '';
    document.getElementById('issueDate').value = newsletter.issue_date ? newsletter.issue_date.split('T')[0] : '';
    document.getElementById('pdfUrl').value = newsletter.pdf_url || '';
    document.getElementById('newsletterContent').value = newsletter.content || '';
    document.getElementById('newsletterStatus').value = newsletter.status || '下書き';
    
    document.getElementById('newsletterFormPanel').classList.add('open');
    
  } catch (error) {
    // エラー処理済み
  }
}

async function deleteNewsletter(id) {
  const result = await api.newsletters.delete(id);
  if (result) {
    await loadNewsletters();
  }
}

function showNewsletterForm() {
  state.currentEditId = null;
  document.getElementById('newsletterForm').reset();
  document.getElementById('newsletterStatus').value = '下書き';
  document.getElementById('issueDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('newsletterFormPanel').classList.add('open');
}

function hideNewsletterForm() {
  document.getElementById('newsletterFormPanel').classList.remove('open');
  state.currentEditId = null;
}

// ==============================================
// 5. 初期化
// ==============================================

document.addEventListener('DOMContentLoaded', function() {
  loadNewsletters();
  setupForm();
});

// ==============================================
// 6. グローバル公開
// ==============================================

window.editNewsletter = editNewsletter;
window.deleteNewsletter = deleteNewsletter;
window.showNewsletterForm = showNewsletterForm;
window.hideNewsletterForm = hideNewsletterForm;

console.log('✅ Newsletter Management (v2.0 - Integrated) loaded');
